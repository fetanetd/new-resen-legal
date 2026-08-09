import { useState, useEffect } from 'react';
import { collection, onSnapshot, getDocs, query, orderBy, QueryConstraint } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';

export function useFirestoreCollection<T>(collectionName: string, orderByField?: string, orderDirection: 'asc' | 'desc' = 'desc') {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const constraints: QueryConstraint[] = [];
    if (orderByField) {
      constraints.push(orderBy(orderByField, orderDirection));
    }
    
    const q = query(collection(db, collectionName), ...constraints);
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[];
        setData(items);
        setLoading(false);
      },
      (err) => {
        // Only log if it's not a permission error during mount (common in dev/hmr)
        if (err.code !== 'permission-denied') {
          handleFirestoreError(err, OperationType.LIST, collectionName);
        }
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, orderByField, orderDirection, auth.currentUser?.uid]);

  return { data, loading, error };
}

// Module-level cache and deduplication maps for public once queries
const collectionCache = new Map<string, any[]>();
const collectionInFlight = new Map<string, Promise<any[]>>();

function fetchCollectionOnce<T>(collectionName: string, orderByField?: string, orderDirection: 'asc' | 'desc' = 'desc'): Promise<T[]> {
  const key = `${collectionName}:${orderByField || ''}:${orderDirection}`;

  if (collectionCache.has(key)) {
    return Promise.resolve(collectionCache.get(key) as T[]);
  }

  if (collectionInFlight.has(key)) {
    return collectionInFlight.get(key) as Promise<T[]>;
  }

  const constraints: QueryConstraint[] = [];
  if (orderByField) {
    constraints.push(orderBy(orderByField, orderDirection));
  }

  const q = query(collection(db, collectionName), ...constraints);

  const fetchPromise = getDocs(q)
    .then((snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
      collectionCache.set(key, items);
      collectionInFlight.delete(key);
      return items;
    })
    .catch((err) => {
      collectionInFlight.delete(key);
      collectionCache.delete(key);
      if (err.code !== 'permission-denied') {
        handleFirestoreError(err, OperationType.LIST, collectionName);
      }
      throw err;
    });

  collectionInFlight.set(key, fetchPromise);
  return fetchPromise;
}

export function useFirestoreCollectionOnce<T>(collectionName: string, orderByField?: string, orderDirection: 'asc' | 'desc' = 'desc') {
  const key = `${collectionName}:${orderByField || ''}:${orderDirection}`;
  const cachedData = collectionCache.get(key) as T[] | undefined;

  const [data, setData] = useState<T[]>(cachedData || []);
  const [loading, setLoading] = useState<boolean>(!cachedData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (collectionCache.has(key)) {
      setData(collectionCache.get(key) as T[]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetchCollectionOnce<T>(collectionName, orderByField, orderDirection)
      .then((items) => {
        if (isMounted) {
          setData(items);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err?.message || 'Failed to fetch collection');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [collectionName, orderByField, orderDirection]);

  return { data, loading, error };
}

