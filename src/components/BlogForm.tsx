import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Upload, AlertCircle, Plus, Check, User, Image as ImageIcon, Search, Sparkles, Code, Eye, Calendar, Tag, Clock, Type, BookOpen, Layers, MapPin } from 'lucide-react';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { collection, addDoc, doc, setDoc, query, getDocs } from 'firebase/firestore';
import { BlogPost, TeamMember, Service } from '../types';
import { TEAM as MOCK_TEAM, SERVICES as MOCK_SERVICES, BLOG_POSTS as MOCK_BLOGS } from '../constants/mockData';
import { getCategoryTranslation } from '../lib/utils';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Register inline styles for size picker so that they are saved as actual pixel tags (e.g. font-size: 14px)
// instead of custom CSS class names (e.g. ql-size-small).
const Quill: any = ReactQuill.Quill;
const Size: any = Quill.import('attributors/style/size');
Size.whitelist = ['12px', '14px', '16px', '18px', '20px', '24px', '32px', '48px'];
Quill.register(Size, true);

const CURATED_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80', label: 'Law Library', keywords: ['law', 'library', 'legal', 'heritage'] },
  { url: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80', label: 'Courtroom', keywords: ['court', 'gavel', 'justice', 'judge', 'trial'] },
  { url: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80', label: 'International', keywords: ['immigration', 'passport', 'travel', 'international', 'citizenship'] },
  { url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80', label: 'Corporate', keywords: ['corporate', 'business', 'agreement', 'contract', 'company'] },
  { url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80', label: 'Data Protection', keywords: ['gdpr', 'security', 'data', 'privacy', 'digital'] },
  { url: 'https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&q=80', label: 'Justice Scale', keywords: ['integrity', 'scale', 'justice', 'balance', 'ethics'] },
  { url: 'https://images.unsplash.com/photo-1454165205744-3b78555e5572?auto=format&fit=crop&q=80', label: 'Consultation', keywords: ['meeting', 'consultation', 'advisory', 'talk', 'office'] },
  { url: 'https://images.unsplash.com/photo-1423592707957-3b212afa6733?auto=format&fit=crop&q=80', label: 'Heritage Office', keywords: ['lawyer', 'classic', 'office', 'practice'] }
];

interface BlogFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: BlogPost | null;
}

const QUILL_MODULES = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'size': ['12px', '14px', '16px', '18px', '20px', '24px', '32px', '48px'] }],
    [{ 'font': [] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    ['clean']
  ],
};

const QUILL_FORMATS = [
  'header', 'size', 'font',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'align',
  'list', 'bullet', 'indent',
  'blockquote', 'code-block',
  'link', 'image', 'video'
];

export default function BlogForm({ isOpen, onClose, initialData }: BlogFormProps) {
  const { t, i18n } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [isHtmlEditingOpen, setIsHtmlEditingOpen] = useState(false);
  const [htmlTempText, setHtmlTempText] = useState<string>('');
  const [useHtmlMode, setUseHtmlMode] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Content Image Assistant / Premium Asset Library States
  const [helperImageUrl, setHelperImageUrl] = useState('');
  const [helperImageCaption, setHelperImageCaption] = useState('');
  const [helperImageAlignment, setHelperImageAlignment] = useState<'center' | 'left' | 'right' | 'full'>('center');
  const [helperImageWidth, setHelperImageWidth] = useState<'w-full' | 'w-[75%]' | 'w-[50%]'>('w-full');
  const [imageHelperBase64, setImageHelperBase64] = useState<string | null>(null);
  const [isHelperProcessing, setIsHelperProcessing] = useState(false);

  // Enhanced Editorial States
  const [editorActiveTab, setEditorActiveTab] = useState<'content' | 'seo'>('content');
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);
  const [seoResult, setSeoResult] = useState<{
    optimizedTitle?: string;
    metaDescription?: string;
    keywords?: string;
    outline?: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=800&auto=format&fit=crop',
    category: '',
    authorId: '',
    date: new Date().toISOString().split('T')[0],
    seoMeta: '',
    seoKeywords: '',
    language: 'tr',
    slug: '',
    imageAlt: '',
    metaTitle: ''
  });

  const [translations, setTranslations] = useState<{
    title: Record<string, string>;
    excerpt: Record<string, string>;
    content: Record<string, string>;
  }>({ title: {}, excerpt: {}, content: {} });

  // Local Backup Auto-save State and Effects
  const [hasBackup, setHasBackup] = useState(false);

  const previewHeadings = React.useMemo(() => {
    if (typeof window === 'undefined' || !formData.content) return [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(formData.content, 'text/html');
    const items = Array.from(doc.querySelectorAll('h2, h3'));
    let h2Count = 0;
    let h3Count = 0;
    return items.map((item, index) => {
      const text = item.textContent || '';
      const level = item.tagName.toLowerCase();
      let numberStr = '';
      if (level === 'h2') {
        h2Count++;
        h3Count = 0;
        numberStr = `${h2Count}.`;
      } else if (level === 'h3') {
        h3Count++;
        numberStr = h2Count > 0 ? `${h2Count}.${h3Count}.` : `${h3Count}.`;
      }
      return { text, level, numberStr };
    });
  }, [formData.content]);

  const previewReadingTime = React.useMemo(() => {
    if (!formData.content) return 1;
    const text = formData.content.replace(/<[^>]*>/g, '');
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const computedTime = Math.ceil(wordCount / 180);
    return Math.max(computedTime > 0 ? computedTime : 1, 1);
  }, [formData.content]);

  const selectedAuthor = React.useMemo(() => {
    return teamMembers.find(m => m.id === formData.authorId) || teamMembers.find(m => m.id === 'resen-legal');
  }, [teamMembers, formData.authorId]);

  useEffect(() => {
    // Check if there's an existing draft backup when opening the modal
    if (isOpen && !initialData) {
      const saved = localStorage.getItem('resen_blog_temp_backup');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.title || parsed.content || parsed.excerpt) {
            setHasBackup(true);
          }
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      setHasBackup(false);
    }
  }, [isOpen, initialData]);

  // Debounced auto-save to localStorage
  useEffect(() => {
    if (!isOpen || initialData) return;

    const timer = setTimeout(() => {
      if (formData.title || formData.excerpt || formData.content) {
        localStorage.setItem('resen_blog_temp_backup', JSON.stringify(formData));
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [formData, isOpen, initialData]);

  const handleRestoreBackup = () => {
    const saved = localStorage.getItem('resen_blog_temp_backup');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData({
           title: parsed.title || '',
           excerpt: parsed.excerpt || '',
           content: parsed.content || '',
           category: parsed.category || '',
           authorId: parsed.authorId || '',
           image: parsed.image || '',
           date: parsed.date || new Date().toISOString().split('T')[0],
           seoMeta: parsed.seoMeta || '',
           seoKeywords: parsed.seoKeywords || '',
           language: parsed.language || 'tr',
           slug: parsed.slug || '',
           imageAlt: parsed.imageAlt || '',
           metaTitle: parsed.metaTitle || ''
         });
        setHasBackup(false);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleDiscardBackup = () => {
    localStorage.removeItem('resen_blog_temp_backup');
    setHasBackup(false);
  };

  const generateSlug = (text: string) => {
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
  };

  const insertFormattingBlock = (type: 'advice' | 'warning' | 'note' | 'checklist') => {
    let blockHtml = '';
    if (type === 'advice') {
      blockHtml = `
<blockquote class="not">
  <strong>💡 Pratik Tavsiye:</strong> Karar alırken güncel mevzuattaki süre sınırlarına dikkat etmeniz, ileride hak kaybı yaşamanızı önleyecektir.
</blockquote>
<p></p>`;
    } else if (type === 'warning') {
      blockHtml = `
<blockquote class="uyari">
  <strong>⚠️ Kritik Uyarı:</strong> Bu formun belirtilen süreler geçtikten sonra teslim edilmesi durumunda, başvuru geçersiz sayılacaktır.
</blockquote>
<p></p>`;
    } else if (type === 'note') {
      blockHtml = `
<blockquote class="not">
  <strong>📌 Önemli Not:</strong> Ulusal ve uluslararası mevzuat değişiklikleri geriye dönük olarak kazanılmış haklara zarar vermeyecek şekilde uygulanır.
</blockquote>
<p></p>`;
    } else if (type === 'checklist') {
      blockHtml = `
<ul class="checklist">
  <li>✅ Gerekli tüm kimlik belgelerinin asılları ve noter onaylı tercümeleri eksiksiz hazırlandı mı?</li>
  <li>✅ Başvuru harç ve masrafları doğru hesaba yatırılıp resmi dekontları dosyaya eklendi mi?</li>
  <li>✅ Tebligat kanununa uygun resmi güncel tebligat adresi beyan edildi mi?</li>
</ul>
<p></p>`;
    }

    setFormData(prev => ({
      ...prev,
      content: prev.content + blockHtml
    }));
  };

  const handleHelperFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsHelperProcessing(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageHelperBase64(reader.result as string);
      setHelperImageUrl(''); // Reset external URL if local file is uploaded
      setIsHelperProcessing(false);
    };
    reader.onerror = () => {
      console.error("Görsel yüklenirken hata oluştu.");
      setIsHelperProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleInsertHelperImage = () => {
    const src = imageHelperBase64 || helperImageUrl;
    if (!src) return;

    // Build responsive and aligned wrappers for editorial layout
    let wrapperClass = 'my-8 flex flex-col items-center justify-center';
    let imgClass = 'rounded-sm shadow-md transition-transform duration-300 hover:scale-[1.01] max-w-full';
    
    if (helperImageAlignment === 'left') {
      wrapperClass = 'my-6 md:float-left md:mr-8 md:max-w-[45%] flex flex-col items-start text-left';
    } else if (helperImageAlignment === 'right') {
      wrapperClass = 'my-6 md:float-right md:ml-8 md:max-w-[45%] flex flex-col items-end text-right';
    } else if (helperImageAlignment === 'full') {
      wrapperClass = 'my-10 w-full flex flex-col items-center';
      imgClass = 'w-full h-auto object-cover max-h-[500px] rounded-sm shadow-md transition-transform duration-300 hover:scale-[1.01]';
    }

    if (helperImageAlignment !== 'full') {
      if (helperImageWidth === 'w-full') imgClass += ' w-full';
      else if (helperImageWidth === 'w-[75%]') imgClass += ' w-[75%]';
      else if (helperImageWidth === 'w-[50%]') imgClass += ' w-[50%]';
    }

    const captionHtml = helperImageCaption 
      ? `\n  <figcaption class="mt-3 text-center text-[10.5px] font-sans text-brand-navy/60 tracking-wider uppercase">${helperImageCaption}</figcaption>` 
      : '';

    const figureHtml = `
<figure class="${wrapperClass}">
  <img src="${src}" alt="${helperImageCaption || 'Resen Blog Visual'}" class="${imgClass}" style="border: 1px solid rgba(13,27,42,0.05);" />${captionHtml}
</figure>
<p></p>`;

    setFormData(prev => ({
      ...prev,
      content: prev.content + figureHtml
    }));

    // Reset helper states
    setImageHelperBase64(null);
    setHelperImageUrl('');
    setHelperImageCaption('');
  };

  const handleLanguageChange = (newLanguage: string) => {
    const oldLanguage = formData.language;
    if (oldLanguage === newLanguage) return;

    // Save active values to translation record
    const updatedTranslations = {
      title: { ...translations.title, [oldLanguage]: formData.title },
      excerpt: { ...translations.excerpt, [oldLanguage]: formData.excerpt },
      content: { ...translations.content, [oldLanguage]: formData.content }
    };
    setTranslations(updatedTranslations);

    // Switch inputs to represent newly selected language
    setFormData(prev => ({
      ...prev,
      title: updatedTranslations.title[newLanguage] || '',
      excerpt: updatedTranslations.excerpt[newLanguage] || '',
      content: updatedTranslations.content[newLanguage] || '',
      language: newLanguage
    }));
  };



  const handleAIScoOptimize = async () => {
    if (!formData.title) {
      setError('Please provide an article title first to run the SEO optimization.');
      return;
    }
    setIsGeneratingSEO(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/seo-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category || 'General',
          language: /[çışğöüğıŞÇÖÜĞİ]/.test(formData.title) ? 'Turkish' : 'English'
        })
      });
      if (!res.ok) throw new Error('SEO Optimization failed');
      const data = await res.json();
      setSeoResult(data);
      setFormData(prev => ({
        ...prev,
        title: data.optimizedTitle || prev.title,
        seoMeta: data.metaDescription || prev.seoMeta || '',
        seoKeywords: data.keywords || prev.seoKeywords || ''
      }));
    } catch (err) {
      console.error(err);
      setError('AI SEO suggestions failed.');
    } finally {
      setIsGeneratingSEO(false);
    }
  };

  const handleAIDraft = async () => {
    const title = formData.title;
    if (!title) {
      setError('Please provide a title first to generate a draft.');
      return;
    }

    setIsDrafting(true);
    setError(null);

    try {
      // Auto-detect language of input title
      const isTurkish = /[çışğöüğıŞÇÖÜĞİ]/.test(title) || title.toLowerCase().split(' ').some(w => ['ve', 'bir', 'ile', 'bu', 'da', 'de', 'icin', 'için', 'hukuk', 'kanun', 'resen'].includes(w));
      const detectedLanguage = isTurkish ? 'Turkish' : 'English';

      const res = await fetch('/api/ai/draft-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          language: detectedLanguage 
        })
      });

      if (!res.ok) throw new Error('AI drafting failed');
      const data = await res.json();
      
      setFormData(prev => ({ ...prev, content: data.content }));
      
      // Auto-generate excerpt if empty
      if (!formData.excerpt) {
        const plainText = data.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...';
        setFormData(prev => ({ ...prev, excerpt: plainText }));
      }
    } catch (err) {
      console.error(err);
      setError('AI Draft generation failed.');
    } finally {
      setIsDrafting(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [blogSnap, teamSnap, servicesSnap] = await Promise.all([
          getDocs(query(collection(db, 'blog'))),
          getDocs(query(collection(db, 'team'))),
          getDocs(query(collection(db, 'services')))
        ]);

        // Merge services from server and mock
        const servicesList = servicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Service[];
        const mergedServices = [...servicesList];
        MOCK_SERVICES.forEach(mockService => {
          if (!mergedServices.find(s => s.id === mockService.id)) {
            mergedServices.push(mockService as any as Service);
          }
        });

        setServices(mergedServices);

        const getEnglishCategoryName = (category: string, list: Service[]): string => {
          if (!category) return '';
          const service = list.find(srv => {
            if (!srv.title) return false;
            return Object.values(srv.title).some(val => 
              typeof val === 'string' && val.trim().toLowerCase() === category.trim().toLowerCase()
            );
          });
          if (service && service.title && service.title.en) {
            return service.title.en;
          }
          return category;
        };

        const cats = new Set<string>();
        // Add service titles only in English as category names
        mergedServices.forEach(srv => {
          if (srv.title && srv.title.en) {
            cats.add(srv.title.en.trim());
          }
        });

        // Add any categories already used in existing blog posts, mapped to English if matching a service
        blogSnap.forEach((doc) => {
          const data = doc.data() as BlogPost;
          if (data.category) {
            const enCat = getEnglishCategoryName(data.category, mergedServices);
            cats.add(enCat);
          }
        });

        // Add any categories from mock blog posts
        MOCK_BLOGS.forEach((mb) => {
          if (mb.category) {
            const enCat = getEnglishCategoryName(mb.category, mergedServices);
            cats.add(enCat);
          }
        });

        // Add current category if editing
        if (initialData?.category) {
          const enCat = getEnglishCategoryName(initialData.category, mergedServices);
          cats.add(enCat);
        }

        setExistingCategories(Array.from(cats).sort());

        const team = teamSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TeamMember[];
        
        const merged = [...team];
        MOCK_TEAM.forEach(mockMember => {
          if (!merged.find(m => m.id === mockMember.id)) {
            merged.push(mockMember as any as TeamMember);
          }
        });

        if (!merged.find(m => m.id === 'resen-legal')) {
          merged.push({
            id: 'resen-legal',
            name: 'Resen Legal',
            role: { en: 'Law Firm', tr: 'Hukuk Bürosu' },
            image: '',
            bio: { en: 'Resen Legal & Consultancy', tr: 'Resen Hukuk & Danışmanlık' }
          } as any as TeamMember);
        }
        
        setTeamMembers(merged);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    if (isOpen) fetchData();
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      // Load translation objects
      const loadedTranslations = {
        title: initialData.title || {},
        excerpt: initialData.excerpt || {},
        content: initialData.content || {}
      };
      setTranslations(loadedTranslations);

      const initialLang = initialData.language || 'tr';
      const titleText = loadedTranslations.title[initialLang] || loadedTranslations.title['en'] || loadedTranslations.title['tr'] || Object.values(loadedTranslations.title)[0] || '';
      const excerptText = loadedTranslations.excerpt[initialLang] || loadedTranslations.excerpt['en'] || loadedTranslations.excerpt['tr'] || Object.values(loadedTranslations.excerpt)[0] || '';
      const contentText = loadedTranslations.content[initialLang] || loadedTranslations.content['en'] || loadedTranslations.content['tr'] || Object.values(loadedTranslations.content)[0] || '';

      const lowerContent = contentText.toLowerCase();
      // Auto-detect if content contains table or other advanced structural elements
      const hasComplexStructures = lowerContent.includes('<table') || 
                                   lowerContent.includes('<iframe') || 
                                   lowerContent.includes('<style') || 
                                   (lowerContent.includes('<div') && lowerContent.includes('class='));
                                   
      setUseHtmlMode(hasComplexStructures);

      // Map pre-stored category to English title if it matches a service
      let initialCategory = initialData.category || '';
      const allMergedServices = [...services];
      MOCK_SERVICES.forEach(ms => {
        if (!allMergedServices.find(s => s.id === ms.id)) {
          allMergedServices.push(ms as any as Service);
        }
      });

      const matchedService = allMergedServices.find(srv => {
        if (!srv.title) return false;
        return Object.values(srv.title).some(val => 
          typeof val === 'string' && val.trim().toLowerCase() === initialCategory.trim().toLowerCase()
        );
      });

      if (matchedService && matchedService.title && matchedService.title.en) {
        initialCategory = matchedService.title.en;
      }

      setFormData({
        title: titleText,
        excerpt: excerptText,
        content: contentText,
        image: initialData.image,
        category: initialCategory,
        authorId: initialData.authorId || '',
        date: initialData.date,
        seoMeta: (initialData as any).seoMeta || '',
        seoKeywords: (initialData as any).seoKeywords || '',
        language: initialLang,
        slug: initialData.slug || '',
        imageAlt: (initialData as any).imageAlt || '',
        metaTitle: (initialData as any).metaTitle || ''
      });
      setSeoResult(null);
    } else {
      setUseHtmlMode(false);
      setTranslations({ title: {}, excerpt: {}, content: {} });
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=800&auto=format&fit=crop',
        category: '',
        authorId: '',
        date: new Date().toISOString().split('T')[0],
        seoMeta: '',
        seoKeywords: '',
        language: 'tr',
        slug: '',
        imageAlt: '',
        metaTitle: ''
      });
      setSeoResult(null);
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e?: React.FormEvent, statusOverride?: 'published' | 'draft') => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const resolvedStatus = statusOverride || (initialData as any)?.status || 'published';

    try {
      const finalTitle = {
        ...translations.title,
        [formData.language]: formData.title
      };
      const finalExcerpt = {
        ...translations.excerpt,
        [formData.language]: formData.excerpt
      };
      const finalContent = {
        ...translations.content,
        [formData.language]: formData.content
      };

      // Ensure fallback so pages are never blank
      if (!finalTitle.en && finalTitle.tr) finalTitle.en = finalTitle.tr;
      if (!finalTitle.tr && finalTitle.en) finalTitle.tr = finalTitle.en;
      if (!finalExcerpt.en && finalExcerpt.tr) finalExcerpt.en = finalExcerpt.tr;
      if (!finalExcerpt.tr && finalExcerpt.en) finalExcerpt.tr = finalExcerpt.en;
      if (!finalContent.en && finalContent.tr) finalContent.en = finalContent.tr;
      if (!finalContent.tr && finalContent.en) finalContent.tr = finalContent.en;

      const computedSlug = formData.slug ? generateSlug(formData.slug) : generateSlug(finalTitle.tr || finalTitle.en || formData.title || 'post');

      const dbData = {
        title: finalTitle,
        excerpt: finalExcerpt,
        content: finalContent,
        image: formData.image,
        category: formData.category,
        authorId: formData.authorId,
        date: formData.date,
        seoMeta: formData.seoMeta || '',
        seoKeywords: formData.seoKeywords || '',
        status: resolvedStatus,
        language: formData.language || 'tr',
        slug: computedSlug,
        imageAlt: formData.imageAlt || '',
        metaTitle: formData.metaTitle || ''
      };

      const wasPublished = (initialData as any)?.status === 'published';
      const isPublished = resolvedStatus === 'published';
      const shouldTriggerDeploy = isPublished || (wasPublished && !isPublished);

      if (initialData?.id) {
        // Edit mode
        const postRef = doc(db, 'blog', initialData.id);
        await setDoc(postRef, dbData, { merge: true });
      } else {
        // Create mode
        const blogCollection = collection(db, 'blog');
        await addDoc(blogCollection, dbData);
      }
      
      localStorage.removeItem('resen_blog_temp_backup');

      if (shouldTriggerDeploy) {
        const user = auth.currentUser;
        if (user) {
          user.getIdToken().then(token => {
            fetch('/api/deploy', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }).then(res => {
              if (res.ok) {
                console.log("Deploy trigger accepted by server successfully.");
              } else {
                res.json().then(data => {
                  console.error("Deploy trigger failed:", data.error || res.statusText);
                }).catch(() => {
                  console.error("Deploy trigger failed with status:", res.status);
                });
              }
            }).catch(err => {
              console.error("Error calling deploy endpoint:", err);
            });
          }).catch(err => {
            console.error("Error retrieving ID token for deploy trigger:", err);
          });
        } else {
          console.warn("Deploy trigger skipped: No authenticated user");
        }
        alert("Yazı kaydedildi. Site yaklaşık 2 dakika içinde güncellenecek");
      }

      onClose();
    } catch (err) {
      handleFirestoreError(err, initialData ? OperationType.WRITE : OperationType.CREATE, 'blog');
      setError(`${t('blogAdmin.saving')} Failed. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const autoPickImage = () => {
    const sourceTitle = formData.title.toLowerCase();
    const cat = formData.category.toLowerCase();
    
    // Find best match in curated images
    let bestMatch = CURATED_IMAGES[0];
    let maxSc = 0;

    CURATED_IMAGES.forEach(img => {
      let score = 0;
      img.keywords.forEach(kw => {
        if (sourceTitle.includes(kw)) score += 2;
        if (cat.includes(kw)) score += 1;
      });
      if (score > maxSc) {
        maxSc = score;
        bestMatch = img;
      }
    });

    setFormData(prev => ({ ...prev, image: bestMatch.url }));
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 lg:p-8 select-none">
      <style>
        {`
          .ql-editor {
            min-height: 250px;
            font-family: inherit;
            font-size: 15px;
            line-height: 1.6;
          }
          .ql-container.ql-snow {
            border-color: #eee !important;
          }
          .ql-toolbar.ql-snow {
            border-color: #eee !important;
            background: #fcfcfc;
          }
          
          /* Label styling for custom sizes in Quill size dropdown menu */
          .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="12px"]::before,
          .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="12px"]::before {
            content: '12px' !important;
          }
          .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="14px"]::before,
          .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="14px"]::before {
            content: '14px' !important;
          }
          .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="16px"]::before,
          .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="16px"]::before {
            content: '16px' !important;
          }
          .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="18px"]::before,
          .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="18px"]::before {
            content: '18px' !important;
          }
          .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="20px"]::before,
          .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="20px"]::before {
            content: '20px' !important;
          }
          .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="24px"]::before,
          .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="24px"]::before {
            content: '24px' !important;
          }
          .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="32px"]::before,
          .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="32px"]::before {
            content: '32px' !important;
          }
          .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="48px"]::before,
          .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="48px"]::before {
            content: '48px' !important;
          }
          .ql-snow .ql-picker.ql-size .ql-picker-label::before {
            content: 'Size' !important;
          }
        `}
      </style>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-brand-offwhite rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-theme-border flex justify-between items-center bg-white">
          <h2 className="text-2xl font-serif text-brand-navy">
            {initialData ? t('blogAdmin.editPost') : t('blogAdmin.createPost')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-brand-navy" />
          </button>
        </div>

        <form onSubmit={(e) => handleSubmit(e)} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8 select-text">
          {hasBackup && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100/60 rounded-full text-amber-600 flex-shrink-0 animate-pulse">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wider">💡 Kurtarılabilir Taslak Bulundu</h5>
                  <p className="text-[10.5px] text-amber-700/80 mt-1">Sistem, tarayıcınızda kaydedilmemiş en son yazım verilerinizi buldu. Geri yüklemek ister misiniz?</p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  type="button"
                  onClick={handleRestoreBackup}
                  className="px-4 py-2 bg-amber-600 text-white hover:bg-amber-700 font-bold uppercase tracking-wider text-[9.5px] rounded-sm transition-all cursor-pointer"
                >
                  Geri Yükle
                </button>
                <button
                  type="button"
                  onClick={handleDiscardBackup}
                  className="px-4 py-2 text-amber-700 hover:text-amber-950 font-bold uppercase tracking-wider text-[9.5px] transition-all cursor-pointer"
                >
                  Yoksay
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

            {/* General Info */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-60 text-brand-navy">{t('blogAdmin.category')}</label>
                  <div className="relative">
                    {isAddingCategory ? (
                      <div className="flex gap-2 items-center">
                        <input
                          autoFocus
                          type="text"
                          placeholder={t('blogAdmin.newCategoryPlaceholder')}
                          value={newCategory}
                          onChange={e => setNewCategory(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (newCategory.trim()) {
                                setFormData(prev => ({ ...prev, category: newCategory.trim() }));
                                setExistingCategories(prev => [...new Set([...prev, newCategory.trim()])].sort());
                                setIsAddingCategory(false);
                                setNewCategory('');
                              }
                            } else if (e.key === 'Escape') {
                              e.preventDefault();
                              setIsAddingCategory(false);
                              setNewCategory('');
                            }
                          }}
                          className="w-full border-b border-brand-gold py-2 bg-transparent outline-none transition-all font-light"
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            if (newCategory.trim()) {
                              setFormData(prev => ({ ...prev, category: newCategory.trim() }));
                              setExistingCategories(prev => [...new Set([...prev, newCategory.trim()])].sort());
                              setIsAddingCategory(false);
                              setNewCategory('');
                            }
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                          title={t('blogAdmin.addNewCategory') || 'Save Category'}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            setIsAddingCategory(false);
                            setNewCategory('');
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                          title={t('common.cancel') || 'Cancel'}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <select
                          required
                          value={formData.category}
                          onChange={e => {
                            if (e.target.value === '__ADD_NEW_OPTION__') {
                              setIsAddingCategory(true);
                            } else {
                              setFormData({ ...formData, category: e.target.value });
                            }
                          }}
                          className="w-full border-b border-theme-border py-2 bg-transparent focus:border-brand-gold outline-none transition-all font-light appearance-none"
                        >
                          <option value="">{t('blogAdmin.selectCategory')}</option>
                          {existingCategories.map(cat => (
                            <option key={cat} value={cat}>
                              {getCategoryTranslation(cat, i18n.language, services)}
                            </option>
                          ))}
                          <option value="__ADD_NEW_OPTION__" className="font-bold text-brand-gold bg-brand-navy/5">
                            + {i18n.language === 'tr' ? 'Yeni Kategori Ekle...' : 'Add New Category...'}
                          </option>
                        </select>
                        <button 
                          type="button"
                          onClick={() => setIsAddingCategory(true)}
                          className="p-2 text-brand-navy hover:text-brand-gold transition-colors block shrink-0"
                          title={t('blogAdmin.addNewCategory')}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-60 text-brand-navy">{t('blogAdmin.author')}</label>
                  <select
                    required
                    value={formData.authorId}
                    onChange={e => setFormData({ ...formData, authorId: e.target.value })}
                    className="w-full border-b border-theme-border py-2 bg-transparent focus:border-brand-gold outline-none transition-all font-light appearance-none"
                  >
                    <option value="">{t('blogAdmin.selectAuthor')}</option>
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-60 text-brand-navy">{t('blogAdmin.date')}</label>
                  <input
                    required
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full border-b border-theme-border py-2 bg-transparent focus:border-brand-gold outline-none transition-all font-light"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-60 text-brand-navy">
                    {i18n.language === 'tr' ? 'Yayın Dili' : 'Publishing Language'}
                  </label>
                  <select
                    required
                    value={formData.language}
                    onChange={e => handleLanguageChange(e.target.value)}
                    className="w-full border-b border-theme-border py-2 bg-transparent focus:border-brand-gold outline-none transition-all font-light appearance-none text-xs cursor-pointer"
                  >
                    <option value="tr">TR (Türkçe)</option>
                    <option value="en">EN (English)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-60 text-brand-navy">{t('blogAdmin.imageUrl')}</label>
                  <div className="flex gap-2">
                    <input
                      required
                      type="url"
                      placeholder="https://..."
                      value={formData.image}
                      onChange={e => setFormData({ ...formData, image: e.target.value })}
                      className="flex-1 border-b border-theme-border py-2 bg-transparent focus:border-brand-gold outline-none transition-all font-light"
                    />
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setShowImageGallery(!showImageGallery)}
                        className={`p-2 rounded-sm transition-all ${showImageGallery ? 'bg-brand-gold text-white' : 'text-brand-navy hover:text-brand-gold bg-brand-navy/5'}`}
                        title={t('blogAdmin.imageGallery')}
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={autoPickImage}
                        className="p-2 text-brand-navy hover:text-brand-gold bg-brand-navy/5 rounded-sm transition-all"
                        title={t('blogAdmin.autoFindImage')}
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {showImageGallery && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="grid grid-cols-4 gap-2 pt-2 border-t border-brand-navy/5"
                    >
                      {CURATED_IMAGES.map((img) => (
                        <button
                          key={img.url}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, image: img.url }));
                            setShowImageGallery(false);
                          }}
                          className={`relative aspect-video rounded-sm overflow-hidden group border-2 transition-all ${formData.image === img.url ? 'border-brand-gold' : 'border-transparent'}`}
                        >
                          <img 
                            src={img.url || null} 
                            alt={img.label} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-brand-navy/20 group-hover:bg-transparent transition-colors" />
                          <div className="absolute bottom-0 left-0 right-0 p-1 bg-brand-navy/60 text-[8px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            {img.label}
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-60 text-brand-navy">
                    {i18n.language === 'tr' ? 'Görsel Alt Metni (Alt Text)' : 'Image Alt Text'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Resen Hukuk Ofisi"
                    value={formData.imageAlt || ''}
                    onChange={e => setFormData({ ...formData, imageAlt: e.target.value })}
                    className="w-full border-b border-theme-border py-2 bg-transparent focus:border-brand-gold outline-none transition-all font-light text-xs"
                  />
                  <p className="text-[9px] text-brand-navy/40 font-light italic">
                    {i18n.language === 'tr' ? 'Görselin HTML alt özelliğinde kullanılacak açıklama.' : 'HTML alt attribute description for the image.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Tabbed Workspace Controls */}
            <div className="flex border-b border-theme-border gap-4 mb-3">
              <button
                type="button"
                onClick={() => setEditorActiveTab('content')}
                className={`pb-3 text-xs uppercase tracking-widest font-black transition-all border-b-2 cursor-pointer ${
                  editorActiveTab === 'content'
                    ? 'border-brand-gold text-brand-navy'
                    : 'border-transparent text-brand-navy/40 hover:text-brand-navy/70'
                }`}
              >
                💡 Article & Editor Workspace
              </button>
              <button
                type="button"
                onClick={() => setEditorActiveTab('seo')}
                className={`pb-3 text-xs uppercase tracking-widest font-black transition-all border-b-2 cursor-pointer ${
                  editorActiveTab === 'seo'
                    ? 'border-brand-gold text-brand-navy'
                    : 'border-transparent text-brand-navy/40 hover:text-brand-navy/70'
                }`}
              >
                🔍 SEO Optimizer & Preview
              </button>
            </div>

            {/* Post Content Fields */}
            <div className="p-6 border border-theme-border rounded-sm bg-white/50 space-y-6">
              {editorActiveTab === 'content' ? (
                <div className="space-y-5 animate-fadeIn">
                  <div className="text-xs font-bold uppercase tracking-widest text-brand-gold border-b border-brand-gold/20 pb-2 flex items-center justify-between">
                    <span>Drafting Suite</span>
                    <span className="text-[9px] bg-brand-gold/10 px-2 py-0.5">{t('blogAdmin.required', 'Required')}</span>
                  </div>

                  <div className="space-y-4">
                    {/* Title Input */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] uppercase tracking-widest font-bold opacity-60 text-brand-navy">{t('blogAdmin.title')}</label>
                        <button
                          type="button"
                          onClick={handleAIDraft}
                          disabled={isDrafting}
                          className="text-[9px] uppercase tracking-widest font-bold text-brand-gold flex items-center gap-1 hover:text-brand-navy transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <Sparkles className={`w-3 h-3 ${isDrafting ? 'animate-spin' : ''}`} />
                          {isDrafting ? 'Drafting...' : 'AI Draft Outline'}
                        </button>
                      </div>
                      <input
                        required
                        type="text"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="w-full border-b border-theme-border py-2 bg-transparent focus:border-brand-gold outline-none transition-all font-light"
                        placeholder="Enter blog post title..."
                      />
                      
                      {formData.title && (
                        <div className="p-2.5 bg-brand-navy/[0.02] border border-brand-navy/5 rounded-sm flex items-center gap-2">
                          <span className="text-[8px] uppercase tracking-widest font-bold text-brand-gold bg-brand-gold/10 px-1.5 py-0.5 whitespace-nowrap">Permanent Slug URL</span>
                          <span className="font-mono text-[9px] text-brand-navy/50 truncate">
                            https://resenlegal.com/blog/<strong>{generateSlug(formData.slug || formData.title)}</strong>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Custom URL Slug Input */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] uppercase tracking-widest font-bold opacity-60 text-brand-navy">URL Slug / Kalıcı Bağlantı Özelleştir</label>
                        <span className="text-[8px] uppercase tracking-widest font-bold text-brand-navy/40">Sadece küçük harf, sayı ve tire (-)</span>
                      </div>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={e => setFormData({ ...formData, slug: e.target.value })}
                        className="w-full border-b border-theme-border py-2 bg-transparent focus:border-brand-gold outline-none transition-all font-mono text-xs text-brand-navy/70"
                        placeholder="Örn: siber-guvenlik-ve-hukuk (Boş bırakılırsa başlıktan otomatik üretilir)"
                      />
                    </div>

                    {/* Excerpt Input */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold opacity-60 text-brand-navy">{t('blogAdmin.excerpt')}</label>
                      <textarea
                        required
                        rows={2}
                        value={formData.excerpt}
                        onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                        className="w-full border-b border-theme-border py-2 bg-transparent focus:border-brand-gold outline-none transition-all font-light resize-none text-xs leading-relaxed"
                        placeholder="Enter short description/excerpt to capture audience attention..."
                      />
                    </div>

                    {/* Quick Insert Styling Block Helpers */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-[0.15em] font-bold text-brand-navy/50">Quick-Insert Editorial Layout Styling Helpers</label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => insertFormattingBlock('advice')}
                          className="bg-brand-gold/10 hover:bg-brand-gold hover:text-white border border-brand-gold/25 transition-all text-[9px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-sm flex items-center gap-1 cursor-pointer"
                          title="Insert custom clean highlighted block for legal recommendations"
                        >
                          <span>💡 Legal Advice Box</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormattingBlock('warning')}
                          className="bg-red-50 hover:bg-red-500 hover:text-white border border-red-200 transition-all text-[9px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-sm flex items-center gap-1 cursor-pointer"
                          title="Insert warning block for key limitation periods or criteria failures"
                        >
                          <span>⚠️ Critical Warning Box</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormattingBlock('note')}
                          className="bg-blue-50 hover:bg-brand-navy hover:text-white border border-blue-200 transition-all text-[9px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-sm flex items-center gap-1 cursor-pointer"
                          title="Insert classic legal brief informative info block"
                        >
                          <span>📌 Important Note Box</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormattingBlock('checklist')}
                          className="bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-200 transition-all text-[9px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-sm flex items-center gap-1 cursor-pointer"
                          title="Insert a checkable layout list for client review rules"
                        >
                          <span>✅ Action Checklist</span>
                        </button>
                      </div>
                    </div>

                    {/* Premium Content Image Assistant & Media Uploader Panel */}
                    <div className="bg-[#fcfbf9] border border-brand-navy/10 p-5 rounded-sm space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between border-b border-brand-navy/5 pb-2.5">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-brand-gold animate-pulse" />
                          <h6 className="text-[11px] uppercase tracking-wider font-extrabold text-brand-navy">Blog İçerik Görsel Asistanı & Medya Yükleyici</h6>
                        </div>
                        <span className="text-[9px] font-mono text-brand-navy/40 uppercase bg-brand-navy/5 px-2 py-0.5 rounded-sm">Premium Media Helper</span>
                      </div>

                      <p className="text-[10px] text-brand-navy/70 leading-relaxed font-light">
                        Yazınızın içerisine profesyonel hizalamalı, alt açıklamalı ve yüksek çözünürlüklü görsel öğeleri enjekte edin.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Left Controls */}
                        <div className="space-y-3">
                          {/* File Selection Trigger */}
                          <div className="space-y-1">
                            <label className="text-[9.5px] uppercase tracking-wider font-bold text-brand-navy/60">Görsel Seçimi / Yerel Dosya Yükle</label>
                            <div className="relative border border-dashed border-brand-navy/20 hover:border-brand-gold bg-white p-3 rounded-sm text-center transition-all">
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleHelperFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              <div className="flex flex-col items-center justify-center gap-1">
                                <Upload className="w-5 h-5 text-brand-navy/40" />
                                <span className="text-[10px] font-bold text-brand-navy/80">Dosya Sürükleyin veya Tıklayın</span>
                                <span className="text-[8.5px] text-brand-navy/40 font-light">PNG, JPG, WEBP (Otomatik base64 optimize edilir)</span>
                              </div>
                            </div>
                          </div>

                          {/* External Image Link Source */}
                          <div className="space-y-1">
                            <label className="text-[9.5px] uppercase tracking-wider font-bold text-brand-navy/60 font-sans">Harici Görsel Linki (URL)</label>
                            <input 
                              type="text" 
                              value={helperImageUrl}
                              onChange={(e) => {
                                setHelperImageUrl(e.target.value);
                                setImageHelperBase64(null); // Reset local upload if external URL provided
                              }}
                              placeholder="https://images.unsplash.com/... veya başka bir adres"
                              className="w-full bg-white border border-brand-navy/10 px-3 py-2 text-xs text-brand-navy outline-none focus:border-brand-gold rounded-sm font-light transition-colors"
                            />
                          </div>

                          {/* Alignment and Sizing configurations */}
                          <div className="grid grid-cols-2 gap-2.5">
                            <div className="space-y-1">
                              <label className="text-[9.5px] uppercase tracking-wider font-bold text-brand-navy/60 font-sans">Görsel Hizalaması</label>
                              <select
                                value={helperImageAlignment}
                                onChange={(e) => setHelperImageAlignment(e.target.value as any)}
                                className="w-full bg-white border border-brand-navy/10 px-2.5 py-2 text-xs text-brand-navy outline-none focus:border-brand-gold rounded-sm font-light cursor-pointer"
                              >
                                <option value="center">Yazı İçinde Ortalanmış (Center)</option>
                                <option value="full">Tam Genişlik (Full-Width Banner)</option>
                                <option value="left">Sola Dayalı (Float Left)</option>
                                <option value="right">Sağa Dayalı (Float Right)</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9.5px] uppercase tracking-wider font-bold text-brand-navy/60 font-sans">Satır İçi Boyutlandırma</label>
                              <select
                                value={helperImageWidth}
                                onChange={(e) => setHelperImageWidth(e.target.value as any)}
                                disabled={helperImageAlignment === 'full'}
                                className="w-full bg-white border border-brand-navy/10 px-2.5 py-2 text-xs text-brand-navy outline-none focus:border-brand-gold rounded-sm font-light cursor-pointer disabled:opacity-50"
                              >
                                <option value="w-full">Geniş Satır Boyu (%100)</option>
                                <option value="w-[75%]">Orta Satır Boyu (%75)</option>
                                <option value="w-[50%]">Dar Satır Boyu (%50)</option>
                              </select>
                            </div>
                          </div>

                          {/* Image Alt Caption Description */}
                          <div className="space-y-1">
                            <label className="text-[9.5px] uppercase tracking-wider font-bold text-brand-navy/60">Görsel Alt Yazısı / Açıklaması (Alt Caption)</label>
                            <input 
                              type="text" 
                              value={helperImageCaption}
                              onChange={(e) => setHelperImageCaption(e.target.value)}
                              placeholder="Örn: Ankara Bölge Adliye Mahkemesi Karar İncelemesi (SEO Uyumlu)"
                              className="w-full bg-white border border-brand-navy/10 px-3 py-2 text-xs text-brand-navy outline-none focus:border-brand-gold rounded-sm font-light transition-colors"
                            />
                          </div>
                        </div>

                        {/* Right Real-time Preview Area */}
                        <div className="border border-brand-navy/10 rounded-sm bg-white p-4 flex flex-col justify-between min-h-[225px]">
                          <div>
                            <span className="text-[9px] uppercase tracking-widest font-extrabold text-brand-navy/40 block mb-3 border-b border-brand-navy/5 pb-1">Anlık Görsel Önizleme</span>
                            
                            {(imageHelperBase64 || helperImageUrl) ? (
                              <div className="space-y-2 flex flex-col items-center justify-center">
                                <div className="max-h-[140px] overflow-hidden rounded-sm border border-brand-navy/5 shadow-sm bg-[#fafafa] p-1">
                                  <img 
                                    src={(imageHelperBase64 || helperImageUrl) || null} 
                                    alt="Live preview" 
                                    className="max-h-[130px] object-contain max-w-full rounded-sm"
                                  />
                                </div>
                                <div className="text-center">
                                  <span className="text-[8.5px] px-2 py-0.5 uppercase tracking-wider font-extrabold text-emerald-850 bg-emerald-50 rounded-sm border border-emerald-100/50">
                                    {imageHelperBase64 ? "Seçilen Yerel Dosya (Base64)" : "Harici URL Bağlantısı"}
                                  </span>
                                  {helperImageCaption && (
                                    <p className="text-[9px] text-brand-navy/50 italic mt-1.5 truncate max-w-[250px]">"{helperImageCaption}"</p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="h-[120px] flex flex-col items-center justify-center text-center gap-2 border border-dashed border-brand-navy/5 bg-brand-navy/[0.01]">
                                <ImageIcon className="w-6 h-6 text-brand-navy/20 animate-pulse" />
                                <span className="text-[9.5px] text-brand-navy/40 font-light">Lütfen önizlemek için bir dosya seçin veya görsel URL adresi girin.</span>
                              </div>
                            )}
                          </div>

                          <div className="pt-3 border-t border-brand-navy/5 mt-3 flex items-center justify-between gap-3">
                            {(imageHelperBase64 || helperImageUrl) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setImageHelperBase64(null);
                                  setHelperImageUrl('');
                                  setHelperImageCaption('');
                                }}
                                className="text-[9px] uppercase tracking-wider font-bold text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                              >
                                Seçimi Temizle
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={handleInsertHelperImage}
                              disabled={!imageHelperBase64 && !helperImageUrl}
                              className="ml-auto px-4 py-2 bg-brand-navy hover:bg-brand-gold text-white text-[9.5px] uppercase tracking-wider font-bold rounded-sm flex items-center gap-1.5 transition-all disabled:opacity-45 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Yazı İçine Enjekte Et
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Editor Selection & Controls */}
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-navy/[0.02] border border-brand-navy/5 p-3 rounded-sm">
                        <div>
                          <h6 className="text-[10px] uppercase tracking-wider font-extrabold text-brand-navy">Düzenleyici Çalışma Modu (Editor Mode)</h6>
                          <p className="text-[9.5px] text-brand-navy/60 font-light mt-0.5">Klasik görsel arayüz ile Tablo/HTML zengin arayüz geçişi.</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <label className="relative inline-flex items-center cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              checked={useHtmlMode}
                              onChange={(e) => setUseHtmlMode(e.target.checked)}
                              className="sr-only peer" 
                            />
                            <div className="w-10 h-5 bg-navy/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-gold bg-brand-navy/15"></div>
                            <span className="ml-2.5 text-[10px] uppercase tracking-wider font-bold text-brand-navy flex items-center gap-1.5">
                              {useHtmlMode ? (
                                <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-100 flex items-center gap-1 animate-fadeIn">
                                  <Code className="w-2.5 h-2.5" /> Gelişmiş HTML Kod Modu
                                </span>
                              ) : (
                                <span className="text-brand-navy/70 bg-brand-navy/5 px-2 py-0.5 rounded-sm">
                                  Görsel WYSIWYG Modu
                                </span>
                              )}
                            </span>
                          </label>
                        </div>
                      </div>

                      {useHtmlMode && (
                        <div className="bg-amber-50/80 border border-amber-200/60 p-4 rounded-sm flex gap-3 text-left animate-fadeIn">
                          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <h6 className="text-[10.5px] font-bold text-amber-900 uppercase tracking-wider">💡 Karşılaştırma Tabloları & Gelişmiş HTML Tasarımları Hakkında</h6>
                            <p className="text-[10px] text-amber-800 leading-relaxed mt-1">
                              Görsel Quill Düzenleyicisi, içerisinde <strong>tablolar (table, tr, td, th)</strong> veya harici kodlar barındıran içerikleri kaydettiğinizde veya düzenlediğinizde, standardı dışındaki etiketleri temizler (siler). Metninizde karşılaştırma tablosunun görünmeme nedeni budur. 
                            </p>
                            <p className="text-[10px] text-amber-800 font-semibold leading-relaxed mt-1.5">
                              Çözüm: Bu yazınızda karşılaştırma tablosu gibi detaylı kodlar olduğu için şu an "Gelişmiş HTML Kod Modu" otomatik aktifleştirilmiştir. Değişiklik yaptığınızda HTML kodunuz sıfır kayıp ile veri tabanına yazılır ve yayında tam uyumlu olarak (pristine tablo tasarımı ile) gösterilir.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content Editor Render Block */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] uppercase tracking-widest font-bold opacity-60 text-brand-navy">{t('blogAdmin.content')}</label>
                        {!useHtmlMode && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsHtmlEditingOpen(true);
                              setHtmlTempText(formData.content || '');
                            }}
                            className="text-[9px] uppercase tracking-widest font-bold text-brand-gold flex items-center gap-1.5 hover:text-brand-navy transition-colors bg-brand-navy/5 px-2.5 py-1 rounded-sm border border-brand-gold/15 hover:border-brand-navy/20 cursor-pointer"
                          >
                            <Code className="w-3 h-3" />
                            Insert/Edit HTML
                          </button>
                        )}
                      </div>

                      {useHtmlMode ? (
                        <div className="bg-neutral-900 rounded-sm border border-neutral-800 overflow-hidden flex flex-col p-1">
                          <div className="bg-neutral-950 px-4 py-2 border-b border-neutral-800 flex justify-between items-center text-[10px] text-neutral-400 font-mono">
                            <span>MASTER HTML SOURCE CODE CODE-EDITOR</span>
                            <span className="text-amber-500 animate-pulse font-bold uppercase">⚠️ WYSIWYG BYPASSED (PROTECTED)</span>
                          </div>
                          <textarea
                            value={formData.content}
                            onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                            className="w-full min-h-[400px] h-[450px] bg-neutral-900 text-neutral-100 font-mono text-xs p-4 focus:outline-none resize-y leading-relaxed font-light"
                            placeholder="Yeni kıyaslama tablonuzu veya HTML taslak kodunuzu buraya ekleyin..."
                            spellCheck={false}
                          />
                        </div>
                      ) : (
                        <div className="bg-white rounded-sm border border-theme-border overflow-hidden">
                          <ReactQuill
                            theme="snow"
                            value={formData.content}
                            onChange={value => setFormData(prev => ({ ...prev, content: value }))}
                            modules={QUILL_MODULES}
                            formats={QUILL_FORMATS}
                            className="min-h-[350px] font-light"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-fadeIn">
                  <div className="text-xs font-bold uppercase tracking-widest text-brand-gold border-b border-brand-gold/20 pb-2 flex items-center justify-between">
                    <span>AI SEO Optimization Service</span>
                    <button
                      type="button"
                      onClick={handleAIScoOptimize}
                      disabled={isGeneratingSEO || !formData.title}
                      className="text-[10px] bg-brand-navy text-white hover:bg-brand-gold hover:shadow-md px-5 py-2 font-black uppercase tracking-[0.15em] flex items-center gap-2 transition-all disabled:opacity-50 rounded-sm cursor-pointer"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isGeneratingSEO ? 'animate-spin' : ''}`} />
                      {isGeneratingSEO ? 'Running Gemini Optimizations...' : 'Get Instant AI SEO Recommendations'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* SEO Fields Inputs */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest font-bold opacity-60 text-brand-navy">Optimized Target Keyword Array</label>
                        <input
                          type="text"
                          value={formData.seoKeywords}
                          onChange={e => setFormData({ ...formData, seoKeywords: e.target.value })}
                          className="w-full border-b border-theme-border py-2 bg-transparent focus:border-brand-gold outline-none transition-all font-light text-xs"
                          placeholder="e.g. boganma davasi, yurtdisi bosanma tanima, yabanci mahkeme kararlari"
                        />
                        <p className="text-[9px] text-brand-navy/40 font-light italic">Commas separated values feed into HTML keywords metadata.</p>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] uppercase tracking-widest font-bold opacity-60 text-brand-navy">
                            {i18n.language === 'tr' ? 'Meta Başlığı (Geçersiz Kılma)' : 'Meta Title (Override)'}
                          </label>
                          <span className={`text-[9px] font-bold ${(formData.metaTitle || '').length >= 50 && (formData.metaTitle || '').length <= 60 ? 'text-emerald-600' : 'text-orange-500'}`}>
                            {(formData.metaTitle || '').length} / 60 chars
                          </span>
                        </div>
                        <input
                          type="text"
                          value={formData.metaTitle || ''}
                          onChange={e => setFormData({ ...formData, metaTitle: e.target.value })}
                          className="w-full border-b border-theme-border py-2 bg-transparent focus:border-brand-gold outline-none transition-all font-light text-xs"
                          placeholder={i18n.language === 'tr' ? 'Boş bırakılırsa başlık otomatik kullanılır...' : 'Leave empty for automatic title...'}
                        />
                        <p className="text-[9px] text-brand-navy/40 font-light italic">
                          {i18n.language === 'tr' ? 'Arama sonuçlarında görünecek başlık. Boş bırakılırsa yazı başlığı kullanılır.' : 'Title shown in search results. If left empty, the post title is used.'}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] uppercase tracking-widest font-bold opacity-60 text-brand-navy">Meta-Description (Click and Edit)</label>
                          <span className={`text-[9px] font-bold ${formData.seoMeta.length >= 120 && formData.seoMeta.length <= 165 ? 'text-emerald-600' : 'text-orange-500'}`}>
                            {formData.seoMeta.length} / 160 chars
                          </span>
                        </div>
                        <textarea
                          rows={4}
                          value={formData.seoMeta}
                          onChange={e => setFormData({ ...formData, seoMeta: e.target.value })}
                          className="w-full border border-theme-border p-3 bg-white focus:border-brand-gold outline-none transition-all font-light text-xs rounded-sm resize-none"
                          placeholder="Provide a search-summary of 140-160 characters..."
                        />
                        <p className="text-[9px] text-brand-navy/40 font-light italic">Shown under the heading in search result listings to capture clicks.</p>
                      </div>
                    </div>

                    {/* Google SERP Simulated Result Mockup Card */}
                    <div className="space-y-3 bg-brand-navy/[0.01] p-5 border border-brand-navy/5 rounded-sm">
                      <span className="text-[9px] uppercase tracking-widest font-black text-brand-gold">Interactive Desktop Search Result Mockup</span>
                      
                      <div className="bg-white p-5 rounded-sm border border-gray-200 shadow-sm space-y-1 font-sans text-left text-sm max-w-sm">
                        <div className="flex items-center gap-1.5 text-[11px] text-[#202124]">
                          <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold">⚖️</span>
                          <div className="min-w-0">
                            <p className="truncate text-xs leading-none">Resen Legal | Danışmanlık</p>
                            <p className="text-[10px] text-[#202124]/60 truncate leading-none mt-0.5">
                              https://resenlegal.com/blog/{generateSlug(formData.slug || formData.title || 'article')}
                            </p>
                          </div>
                        </div>
                        <h4 className="text-[17px] text-[#1a0dab] font-normal hover:underline cursor-pointer leading-snug mt-1 font-sans">
                          {formData.metaTitle || formData.title || 'Resen Legal Counsel Insights Title Placeholder'}
                        </h4>
                        <p className="text-[12px] text-[#4d5156] leading-relaxed font-sans mt-1">
                          {formData.seoMeta || formData.excerpt || 'Write or generate customized meta description to see beautiful live Google snippets simulating how the legal community views your articles...'}
                        </p>
                      </div>

                      {seoResult?.outline && (
                        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xs">
                          <h5 className="text-[9.5px] uppercase tracking-widest font-black text-emerald-800 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            AI Recommended Article Architecture
                          </h5>
                          <pre className="text-[10.5px] font-medium leading-relaxed font-sans text-brand-navy/70 whitespace-pre-wrap mt-2">
                            {seoResult.outline}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="p-6 border-t border-theme-border bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-[10px] text-brand-navy/40 font-light flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Auto-save active & secured in cloud
            </div>
            
            <div className="flex gap-3 justify-end w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3.5 text-xs uppercase tracking-widest font-bold text-brand-navy hover:text-brand-gold transition-colors"
              >
                {t('blogAdmin.cancel')}
              </button>

              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="px-6 py-3.5 border border-brand-navy/25 hover:border-brand-gold text-brand-navy hover:text-brand-gold text-xs uppercase tracking-widest font-bold flex items-center gap-2 transition-all cursor-pointer bg-white"
              >
                Yazıyı Önizle
                <Eye className="w-4 h-4 text-brand-gold" />
              </button>

              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'draft')}
                disabled={isSubmitting}
                className="px-6 py-3.5 border border-amber-500/30 text-amber-700 hover:bg-amber-50 text-xs uppercase tracking-widest font-bold flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                Taslak Olarak Kaydet
                <AlertCircle className="w-4 h-4 text-amber-500" />
              </button>

              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'published')}
                disabled={isSubmitting}
                className="px-6 py-3.5 bg-brand-gold text-white text-xs uppercase tracking-widest font-bold flex items-center gap-2 hover:bg-brand-gold/90 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? t('blogAdmin.saving') : initialData ? 'Değişiklikleri Yayınla' : 'Master Yazıyı Yayınla'}
                <Save className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* HTML Editor Modal */}
        <AnimatePresence>
          {isHtmlEditingOpen && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsHtmlEditingOpen(false)}
                className="absolute inset-0 bg-brand-navy/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-2xl bg-brand-offwhite rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[80vh] border border-brand-gold/20 z-10 text-left"
              >
                <div className="p-4 bg-white border-b border-theme-border flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-brand-gold/10 rounded-sm text-brand-gold animate-pulse">
                      <Code className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm uppercase tracking-widest font-bold text-brand-navy">
                      Edit HTML
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsHtmlEditingOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-brand-navy" />
                  </button>
                </div>

                <div className="p-6 flex-1 flex flex-col space-y-4 overflow-y-auto">
                  <p className="text-[11px] text-brand-navy/60 leading-relaxed">
                    You can write or paste custom HTML code here. This allows using complex grids, custom links, tables, list patterns, or styled elements.
                  </p>
                  
                  <textarea
                    value={htmlTempText}
                    onChange={(e) => setHtmlTempText(e.target.value)}
                    placeholder="<div class='custom-class'>Your HTML here...</div>"
                    className="w-full flex-1 min-h-[300px] h-[350px] bg-neutral-900 text-neutral-100 font-mono text-xs p-4 rounded-sm border-none focus:ring-1 focus:ring-brand-gold focus:outline-none resize-y"
                    spellCheck={false}
                  />
                </div>

                <div className="p-4 bg-white border-t border-theme-border flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsHtmlEditingOpen(false)}
                    className="px-4 py-2 text-xs uppercase tracking-widest font-bold text-brand-navy hover:text-brand-gold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, content: htmlTempText }));
                      setIsHtmlEditingOpen(false);
                    }}
                    className="px-4 py-2 bg-brand-gold text-white text-xs uppercase tracking-widest font-bold hover:bg-brand-gold/90 transition-all shadow-md"
                  >
                    Apply HTML
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Post Preview Modal Overlay */}
          {isPreviewOpen && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 md:p-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsPreviewOpen(false)}
                className="absolute inset-0 bg-brand-navy/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-6xl bg-brand-offwhite rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-brand-gold/30 z-10 text-left select-text"
              >
                {/* Header */}
                <div className="p-5 bg-white border-b border-theme-border flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-brand-gold/15 rounded-full text-brand-gold">
                      <Eye className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs uppercase tracking-[0.25em] font-black text-brand-navy">
                        Makale Önizleme Paneli
                      </h3>
                      <p className="text-[10px] text-brand-navy/50 font-medium">Bu görünüm, yayındaki tasarımı ve SEO bileşenlerini birebir taklit eder.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(false)}
                    className="p-1.5 hover:bg-brand-navy/5 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-brand-navy" />
                  </button>
                </div>

                {/* Preview Body */}
                <div className="flex-1 overflow-y-auto bg-bg-deep custom-scrollbar">
                  {/* Hero Image Section */}
                  <div className="relative h-[220px] md:h-[280px] w-full overflow-hidden bg-brand-navy">
                    {formData.image ? (
                      <img 
                        src={formData.image} 
                        alt={formData.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-brand-navy/30" />
                    )}
                    <div className="absolute inset-0 bg-brand-navy/75 backdrop-blur-[1px]" />
                    
                    <div className="absolute inset-0 flex items-center justify-center px-6">
                      <div className="max-w-4xl w-full text-center space-y-4">
                        <div className="flex justify-center flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-gold/20 backdrop-blur-md rounded-full text-[10px] uppercase tracking-[0.2em] font-extrabold text-brand-gold border border-brand-gold/30">
                            <Tag className="w-3 h-3" />
                            {formData.category || "Kategori Seçilmedi"}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-navy/80 backdrop-blur-md rounded-full text-[10px] font-extrabold text-white border border-white/10 uppercase tracking-widest">
                            DİL: {(formData.language || 'tr').toUpperCase()}
                          </span>
                        </div>
                        
                        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif text-white tracking-tight leading-snug max-w-3xl mx-auto">
                          {formData.title || "Yazı Başlığı Girilmedi"}
                        </h1>

                        <div className="flex flex-wrap items-center justify-center gap-4 text-brand-offwhite/70">
                          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold">
                            <Calendar className="w-3.5 h-3.5 text-brand-gold" />
                            {new Date(formData.date).toLocaleDateString(formData.language === 'en' ? 'en-GB' : 'tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold">
                            <Clock className="w-3.5 h-3.5 text-brand-gold" />
                            {previewReadingTime} dk okuma süresi
                          </div>
                          {selectedAuthor && (
                            <div className="flex items-center gap-1.5 text-[10px] font-semibold">
                              <span className="uppercase tracking-tight opacity-40">Yazar:</span>
                              <span className="text-white">{selectedAuthor.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Container (2 Columns) */}
                  <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start w-full">
                      {/* Sidebar */}
                      <aside className="lg:col-span-4 mt-0 pt-0 w-full space-y-6">
                        {/* Dynamic Table of Contents */}
                        {previewHeadings.length > 0 ? (
                          <div className="bg-white border border-brand-navy/10 p-6 rounded-sm shadow-sm w-full">
                            <div className="flex items-center gap-3 text-brand-gold mb-5 pb-3 border-b border-brand-navy/5">
                              <div className="w-8 h-[1px] bg-brand-gold" />
                              <span className="text-[10px] uppercase tracking-[0.25em] font-black">İÇİNDEKİLER</span>
                            </div>
                            <nav className="space-y-3.5 max-h-[30vh] overflow-y-auto pr-1">
                              {previewHeadings.map((heading, i) => (
                                <div
                                  key={i}
                                  className={`flex items-start gap-3.5 text-left text-xs ${
                                    heading.level === 'h3' ? 'pl-5 text-[11px]' : 'font-semibold'
                                  }`}
                                >
                                  <span className="font-mono text-[10px] text-brand-gold select-none shrink-0 pt-0.5">
                                    {heading.numberStr}
                                  </span>
                                  <span className="text-brand-navy/60 leading-relaxed">
                                    {heading.text}
                                  </span>
                                </div>
                              ))}
                            </nav>
                          </div>
                        ) : null}

                        {/* Author details card */}
                        {selectedAuthor ? (
                          <div className="bg-white border border-brand-navy/10 p-6 rounded-sm shadow-sm">
                            <div className="text-[10px] uppercase tracking-[0.25em] font-bold text-brand-gold mb-4 italic pb-2 border-b border-brand-navy/5">
                              YAZAR HAKKINDA
                            </div>
                            <div className="flex items-center gap-4">
                              {selectedAuthor.image ? (
                                <img
                                  src={selectedAuthor.image}
                                  alt={selectedAuthor.name}
                                  className="w-12 h-12 rounded-full object-cover border border-brand-navy/10 shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-brand-navy/5 flex items-center justify-center border border-brand-navy/10 text-brand-navy/40 shrink-0 font-serif font-black text-sm uppercase">
                                  {selectedAuthor.name.substring(0, 2)}
                                </div>
                              )}
                              <div className="min-w-0">
                                <h4 className="text-sm font-serif text-brand-navy font-bold truncate">{selectedAuthor.name}</h4>
                                <p className="text-[9px] uppercase tracking-widest font-black text-brand-gold truncate">
                                  {typeof selectedAuthor.role === 'object' 
                                    ? (selectedAuthor.role as any)[formData.language || 'tr'] || selectedAuthor.role.tr
                                    : selectedAuthor.role}
                                </p>
                              </div>
                            </div>
                            {selectedAuthor.bio ? (
                              <p className="text-[11px] text-brand-navy/70 leading-relaxed font-light mt-3">
                                {typeof selectedAuthor.bio === 'object'
                                  ? (selectedAuthor.bio as any)[formData.language || 'tr'] || selectedAuthor.bio.tr
                                  : selectedAuthor.bio}
                              </p>
                            ) : null}
                          </div>
                        ) : null}
                      </aside>

                      {/* Main Article Content Sheet */}
                      <div className="lg:col-span-8 mt-0 pt-0 w-full">
                        <div className="bg-white border border-brand-navy/10 p-6 sm:p-10 md:p-12 rounded-sm shadow-sm w-full">
                          {/* Excerpt Summary */}
                          {formData.excerpt ? (
                            <div className="mb-8 pb-6 border-b border-brand-navy/5">
                              <h3 className="text-[10px] uppercase tracking-[0.25em] font-bold text-brand-gold mb-2.5">Özet / Excerpt</h3>
                              <p className="text-xs text-brand-navy/70 leading-relaxed italic border-l-2 border-brand-gold/30 pl-3">
                                {formData.excerpt}
                              </p>
                            </div>
                          ) : null}

                          {/* Main Body */}
                          <div className="w-full text-left max-w-none">
                            <div 
                              className="prose prose-brand max-w-none article-content prose-headings:font-serif prose-headings:text-brand-navy prose-h2:text-[20px] md:prose-h2:text-[25px] prose-h2:font-bold prose-h2:tracking-tight prose-h2:mt-12 prose-h2:mb-5 prose-h2:pl-3.5 prose-h2:border-l-[3.5px] prose-h2:border-brand-gold prose-h2:pb-0.5 prose-h3:text-[17px] md:prose-h3:text-[20px] prose-h3:font-semibold prose-h3:tracking-tight prose-h3:mt-9 prose-h3:mb-3.5 prose-p:text-[15px] sm:prose-p:text-[16px] prose-p:text-brand-navy/85 hover:prose-p:text-brand-navy/95 prose-p:leading-[1.75] prose-p:mb-6 md:prose-p:mb-8 text-brand-navy break-words [overflow-wrap:break-word] [word-break:break-word] overflow-hidden prose-img:max-w-full prose-img:h-auto prose-img:rounded-sm prose-pre:max-w-full prose-pre:overflow-x-auto prose-table:max-w-full prose-table:overflow-x-auto prose-a:text-brand-gold prose-a:underline hover:prose-a:text-brand-navy transition-colors w-full mt-0 pt-0 [&>*:first-child]:mt-0 [&>*:first-child]:pt-0"
                              dangerouslySetInnerHTML={{ __html: formData.content || "<p class='text-brand-navy/40 italic'>Yazı içeriği boş bırakıldı.</p>" }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer bar inside modal */}
                <div className="p-4 bg-white border-t border-theme-border flex justify-end shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(false)}
                    className="px-6 py-2.5 bg-brand-navy hover:bg-brand-gold text-white hover:text-brand-navy text-xs uppercase tracking-widest font-bold transition-all shadow-md cursor-pointer"
                  >
                    Önizlemeyi Kapat
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
    </div>
  );

  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
