import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SERVICES } from '../constants/mockData';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with -
    .replace(/[çışğöüıÇİŞĞÖÜİ]/g, char => {
      const trMap: Record<string, string> = {
        'ç': 'c', 'ı': 'i', 'ş': 's', 'ğ': 'g', 'ö': 'o', 'ü': 'u',
        'Ç': 'C', 'İ': 'I', 'Ş': 'S', 'Ğ': 'G', 'Ö': 'O', 'Ü': 'U'
      };
      return trMap[char] || char;
    })
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars except -
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
}

export function getPostSlug(post: any): string {
  if (!post) return '';
  if (typeof post.slug === 'string' && post.slug.trim()) return post.slug.trim();
  
  let titleText = '';
  if (post.title) {
    if (typeof post.title === 'string') {
      titleText = post.title;
    } else if (typeof post.title === 'object') {
      titleText = post.title.tr || post.title.en || post.title.ar || post.title.es || post.title.zh || '';
      if (!titleText) {
        const values = Object.values(post.title).filter(v => typeof v === 'string' && v);
        if (values.length > 0) {
          titleText = values[0] as string;
        }
      }
    }
  }
  
  const generated = generateSlug(titleText);
  if (generated) return generated;
  return typeof post.id === 'string' ? post.id : '';
}

export function getTranslation(
  content: any, 
  locale: string,
  postLanguage?: string
): string {
  if (!content) return '';
  if (typeof content === 'string') return content;
  
  // Normalize postLanguage to 2-letter codes 'en' or 'tr'
  let normalizedPostLang: string | undefined = undefined;
  if (postLanguage) {
    const pl = postLanguage.trim().toLowerCase();
    if (pl === 'en' || pl === 'english') {
      normalizedPostLang = 'en';
    } else if (pl === 'tr' || pl === 'turkish') {
      normalizedPostLang = 'tr';
    } else {
      normalizedPostLang = postLanguage;
    }
  }

  const hasUserSelected = typeof window !== 'undefined' && localStorage.getItem('userLanguageSelected') === 'true';
  const targetLocale = hasUserSelected ? locale : (normalizedPostLang || locale);
  
  const val = content[targetLocale] || content[locale] || content['en'] || content['tr'] || Object.values(content)[0] || '';
  
  // Helper to extract visible length (excluding HTML tags & common whitespace)
  const getVisibleLength = (htmlOrText: any): number => {
    if (typeof htmlOrText !== 'string') return 0;
    return htmlOrText.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length;
  };

  const selectedLength = getVisibleLength(val);
  
  // If the resolved language translation is virtually empty (< 100 characters visible)
  // but another language version is significantly rich (>= 150 characters and at least double the size),
  // then gracefully fallback to the richest version so the post is fully readable.
  if (selectedLength < 100) {
    let richestLang = val;
    let maxLen = selectedLength;
    
    const possibleLangs = ['tr', 'en', 'es', 'ar', 'zh'];
    if (normalizedPostLang && !possibleLangs.includes(normalizedPostLang)) {
      possibleLangs.push(normalizedPostLang);
    }

    for (const l of possibleLangs) {
      if (content[l]) {
        const itemLen = getVisibleLength(content[l]);
        if (itemLen > maxLen && itemLen >= 150) {
          maxLen = itemLen;
          richestLang = content[l];
        }
      }
    }
    
    if (maxLen > selectedLength) {
      const richestText = richestLang;
      if (typeof richestText === 'string') {
        return richestText.replace(
          "Bu çalışma modeli sayesinde hem Türkiye'deki hazırlık aşaması hem de Portekiz'deki konsolosluk, AIMA, şirket kuruluşu, vergi numarası, banka hesabı ve oturum kartı süreçleri bütünlüklü şekilde planlanabilir.",
          "Bu çalışma modeli sayesinde hem Türkiye'deki hazırlık ve Portekiz konsolosluğu başvuru aşaması hem de Portekiz'deki AIMA, şirket kuruluşu, vergi numarası, banka hesabı ve oturum kartı süreçleri bütünlüklü şekilde planlanabilir."
        );
      }
      return richestLang;
    }
  }

  if (typeof val === 'string') {
    return val.replace(
      "Bu çalışma modeli sayesinde hem Türkiye'deki hazırlık aşaması hem de Portekiz'deki konsolosluk, AIMA, şirket kuruluşu, vergi numarası, banka hesabı ve oturum kartı süreçleri bütünlüklü şekilde planlanabilir.",
      "Bu çalışma modeli sayesinde hem Türkiye'deki hazırlık ve Portekiz konsolosluğu başvuru aşaması hem de Portekiz'deki AIMA, şirket kuruluşu, vergi numarası, banka hesabı ve oturum kartı süreçleri bütünlüklü şekilde planlanabilir."
    );
  }

  return val;
}

export function getCategoryTranslation(
  category: string | undefined,
  locale: string,
  firestoreServices?: any[]
): string {
  if (!category) return '';

  const trimmedCategory = category.trim().toLowerCase();

  // Custom manual categories dictionary mapping
  const manualCategories: Record<string, Record<string, string>> = {
    'private international law': {
      en: 'Private International Law',
      tr: 'Milletlerarası Özel Hukuk',
      es: 'Derecho Internacional Privado',
      ar: 'القانون الدولي الخاص',
      zh: '国际私法'
    },
    'milletlerası özel hukuk': {
      en: 'Private International Law',
      tr: 'Milletlerarası Özel Hukuk',
      es: 'Derecho Internacional Privado',
      ar: 'القانون الدولي الخاص',
      zh: '国际私法'
    },
    'milletlerarası özel hukuk': {
      en: 'Private International Law',
      tr: 'Milletlerarası Özel Hukuk',
      es: 'Derecho Internacional Privado',
      ar: 'القانون الدولي الخاص',
      zh: '国际私法'
    },
    'uluslararası özel hukuk': {
      en: 'Private International Law',
      tr: 'Milletlerarası Özel Hukuk',
      es: 'Derecho Internacional Privado',
      ar: 'القانون الدولي الخاص',
      zh: '国际私法'
    },
    'immigration': {
      en: 'Immigration Law',
      tr: 'Göç Hukuku',
      es: 'Derecho de Inmigración',
      ar: 'قانون الهجرة',
      zh: '移民法'
    },
    'corporate': {
      en: 'Commercial & Corporate Law',
      tr: 'Şirketler ve Ticaret Hukuku',
      es: 'Derecho Comercial y Corporativo',
      ar: 'القانون التجاري وقانون الشركات',
      zh: '商业与公司法'
    }
  };

  if (manualCategories[trimmedCategory]) {
    return manualCategories[trimmedCategory][locale] || manualCategories[trimmedCategory]['en'] || category;
  }

  // Merge Firestore services and Mock Services to have the full picture
  const allServices = [...(firestoreServices || [])];
  SERVICES.forEach((mockService) => {
    if (!allServices.find((s) => s.id === mockService.id)) {
      allServices.push(mockService);
    }
  });

  // Find a service where any of its localized titles matches the given 'category'
  const service = allServices.find((srv) => {
    if (!srv.title) return false;
    return Object.values(srv.title).some(
      (val) => typeof val === 'string' && val.trim().toLowerCase() === trimmedCategory
    );
  });

  if (service && service.title) {
    return service.title[locale] || service.title['en'] || Object.values(service.title)[0] || category;
  }

  // If no service matches, return as is (useful for custom manual categories)
  return category;
}

export function findTeamMember(authorId: string | undefined, teamMembers: any[]): any {
  if (!authorId) return null;
  
  if (authorId === 'resen-legal') {
    return {
      id: 'resen-legal',
      name: 'Resen Legal',
      role: { en: 'Law Firm', tr: 'Hukuk Bürosu' },
      image: '',
      bio: { en: 'Resen Legal & Consultancy', tr: 'Resen Hukuk & Danışmanlık' }
    };
  }

  // 1. Exact ID match
  let found = teamMembers.find(m => m.id === authorId);
  if (found) return found;

  const lowerAuthorId = authorId.toLowerCase();

  // 2. Exact or partial ID matches
  found = teamMembers.find(m => m.id && m.id.toLowerCase() === lowerAuthorId);
  if (found) return found;

  // 3. Match by name or substring
  found = teamMembers.find(m => {
    if (!m.name) return false;
    const mName = m.name.toLowerCase();
    
    // Check key mock mappings
    if (authorId === '1' && mName.includes('fetanet')) return true;
    if (authorId === '2' && mName.includes('yunus')) return true;
    if (authorId === '3' && mName.includes('kerim')) return true;
    if (authorId === '4' && mName.includes('emre ayd')) return true;

    return mName === lowerAuthorId || mName.includes(lowerAuthorId) || lowerAuthorId.includes(mName);
  });

  return found || null;
}

