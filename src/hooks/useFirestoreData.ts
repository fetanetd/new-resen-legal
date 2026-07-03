import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, QueryConstraint } from 'firebase/firestore';
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
