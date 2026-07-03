import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { motion, useScroll, useSpring, AnimatePresence } from 'motion/react';
import { ArrowLeft, Calendar, User, Tag, Share2, Clock, ArrowRight, Facebook, Linkedin, X, Link as LinkIcon, Check, BookOpen, Layers, MapPin, ChevronDown, Type } from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BlogPost, TeamMember } from '../types';
import { BLOG_POSTS as MOCK_BLOG, TEAM as MOCK_TEAM } from '../constants/mockData';
import { getTranslation, getCategoryTranslation, getPostSlug, findTeamMember } from '../lib/utils';
import { useFirestoreCollection } from '../hooks/useFirestoreData';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function BlogPostDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);
  const [instantClose, setInstantClose] = useState(false);

  const [fontSize, setFontSizeState] = useState<'14px' | '16px' | '18px'>(() => {
    return (localStorage.getItem('preferred-blog-font-size') as '14px' | '16px' | '18px') || '14px';
  });

  const handleFontSizeChange = (size: '14px' | '16px' | '18px') => {
    setFontSizeState(size);
    localStorage.setItem('preferred-blog-font-size', size);
  };

  const currentUrl = window.location.href;

  const isDivorcePost = useMemo(() => {
    if (!post) return false;
    const titleText = getTranslation(post.title, 'tr', post.language).toLowerCase();
    const contentText = getTranslation(post.content, 'tr', post.language).toLowerCase();
    return (
      post.id === 'yurt-disi-bosanma-tanima' ||
      post.id === 'bosanma-tanima' ||
      post.id === '1' ||
      titleText.includes('boşanma') ||
      titleText.includes('tanıma') ||
      contentText.includes('galler mahkemelerinden')
    );
  }, [post]);

  const { data: firestoreBlog, loading: firestoreLoading } = useFirestoreCollection<BlogPost>('blog');
  const { data: firestoreTeam } = useFirestoreCollection<TeamMember>('team');
  const { data: firestoreServices } = useFirestoreCollection<any>('services');

  const postCategory = useMemo(() => {
    if (!post) return '';

    // Prioritize showing the actual selected category chosen when the article was published/saved
    if (post.category) {
      return getCategoryTranslation(post.category, i18n.language, firestoreServices);
    }

    // Fallback heuristic overrides for older/mock posts where the category was not explicitly stored
    const contentText = getTranslation(post.content, 'tr', post.language).toLowerCase();
    const isFamilyAndDivorce = 
      post.id?.includes('bosanma') || 
      post.id?.includes('divorce') || 
      contentText.includes('boşanma') || 
      contentText.includes('velayet') ||
      contentText.includes('tanıma') ||
      contentText.includes('tenfiz') ||
      contentText.includes('galler mahkemelerinden');

    if (isFamilyAndDivorce) {
      return i18n.language.startsWith('tr') ? 'Aile Hukuku & Tanıma-Tenfiz' : 'International Family Law';
    }

    return '';
  }, [post, i18n.language, firestoreServices]);

  const teamMembers = useMemo(() => {
    const merged = [...firestoreTeam];
    MOCK_TEAM.forEach(mockMember => {
      if (!merged.find(m => m.id === mockMember.id || m.name.toLowerCase() === mockMember.name.toLowerCase())) {
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
    return merged;
  }, [firestoreTeam]);

  const relatedPosts = useMemo(() => {
    if (!post) return [];

    const merged = [...firestoreBlog];
    MOCK_BLOG.forEach(mockPost => {
      if (!merged.find(p => p.id === mockPost.id)) {
        merged.push(mockPost);
      }
    });

    // Remove current post and drafts
    const otherPosts = merged.filter(p => p.id !== post.id && (p as any).status !== 'draft');

    // Try same category
    let related = otherPosts
      .filter(p => p.category === post.category)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);

    // Fallback if none in same category
    if (related.length === 0) {
      related = otherPosts
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 2);
    }

    return related;
  }, [post, firestoreBlog]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchPost = async () => {
      if (!id) return;
      const targetId = id.trim().toLowerCase();

      // If the firestore collections are still loading, wait so we have the full Firestore dataset
      if (firestoreLoading) {
        setLoading(true);
        return;
      }

      try {
        let postData: BlogPost | null = null;

        // 1. Try to find the post in preloaded Firestore posts by slug or ID first (real source of truth)
        if (firestoreBlog && firestoreBlog.length > 0) {
          const match = firestoreBlog.find(p => 
            getPostSlug(p).trim().toLowerCase() === targetId || 
            p.id?.trim().toLowerCase() === targetId
          );
          if (match) {
            postData = match;
          }
        }

        // 2. If not found in the preloaded list, try direct active Firestore query by slug attribute
        if (!postData) {
          try {
            const q = query(collection(db, 'blog'), where('slug', '==', id));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const docSnap = querySnapshot.docs[0];
              postData = { id: docSnap.id, ...docSnap.data() } as BlogPost;
            }
          } catch (e) {
            console.warn('Direct query by slug failed:', e);
          }
        }

        // 3. Fallback direct document ID fetch from active Firestore
        if (!postData) {
          try {
            const postDoc = await getDoc(doc(db, 'blog', id));
            if (postDoc.exists()) {
              postData = { id: postDoc.id, ...postDoc.data() } as BlogPost;
            }
          } catch (e) {
            console.warn('Document with ID not found directly, falling back:', e);
          }
        }

        // 4. Finally, if NOT found anywhere in database, search MOCK_BLOG as an offline/static fallback
        if (!postData) {
          const mockPost = MOCK_BLOG.find(p => 
            getPostSlug(p).trim().toLowerCase() === targetId || 
            p.id?.trim().toLowerCase() === targetId
          );
          if (mockPost) {
            postData = mockPost;
          }
        }

        if (postData) {
          setPost(postData);
          setLoading(false);

          // Increment view count in Firebase Firestore if stored there
          const isMock = MOCK_BLOG.some(p => p.id === postData?.id) && !firestoreBlog.some(p => p.id === postData?.id);
          if (!isMock && postData.id) {
            try {
              const viewedKey = `viewed_post_${postData.id}`;
              if (!sessionStorage.getItem(viewedKey)) {
                sessionStorage.setItem(viewedKey, 'true');
                const postRef = doc(db, 'blog', postData.id);
                updateDoc(postRef, {
                  views: increment(1)
                }).catch(e => console.warn('Could not update views for post:', e));
              }
            } catch (fsErr) {
              console.warn('Error initiating view increment:', fsErr);
            }
          }
        } else {
          // Definitely not found anywhere
          setPost(null);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setPost(null);
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, firestoreBlog, firestoreLoading]);

  const author = useMemo(() => {
    if (!post) return null;
    const found = findTeamMember(post.authorId || 'resen-legal', teamMembers);
    if (found) {
      if (found.id === 'resen-legal' || found.name === 'Resen Legal') {
        return {
          ...found,
          bio: {
            en: 'A multidisciplinary law and consultancy firm providing high-end, precise legal solutions in corporate law, immigration, and regulatory compliance for international and local clients.',
            tr: 'Uluslararası ve yerel müvekkiller için şirketler hukuku, göçmenlik ve mevzuata uyum alanlarında üst düzey, hassas hukuki çözümler sunan multidisipliner bir hukuk ve danışmanlık firması.'
          }
        };
      }
      return found;
    }
    return {
      id: 'resen-legal',
      name: 'Resen Legal',
      role: { en: 'Law Firm', tr: 'Hukuk Bürosu' },
      image: '',
      bio: {
        en: 'A multidisciplinary law and consultancy firm providing high-end, precise legal solutions in corporate law, immigration, and regulatory compliance for international and local clients.',
        tr: 'Uluslararası ve yerel müvekkiller için şirketler hukuku, göçmenlik ve mevzuata uyum alanlarında üst düzey, hassas hukuki çözümler sunan multidisipliner bir hukuk ve danışmanlık firması.'
      }
    } as TeamMember;
  }, [post, teamMembers]);

  const postContent = post ? getTranslation(post.content, i18n.language, post.language) : '';

  useEffect(() => {
    if (post) {
      const l = (post.language || '').trim().toLowerCase();
      if (l === 'tr' || l === 'turkish' || l === 'turkce' || l === 'türkçe') {
        document.documentElement.lang = 'tr';
      } else if (l === 'en' || l === 'english' || l === 'ingilizce') {
        document.documentElement.lang = 'en';
      } else {
        const activeLang = i18n.language.startsWith('tr') ? 'tr' : 'en';
        document.documentElement.lang = activeLang;
      }
    } else {
      const activeLang = i18n.language.startsWith('tr') ? 'tr' : 'en';
      document.documentElement.lang = activeLang;
    }
  }, [post, i18n.language]);

  // Parse custom editorial intro for the target blog post
  const editorialIntro = useMemo(() => {
    return null;
  }, []);

  // Extract headings and inject IDs with better slugification, along with robust list & block element transformations
  const { processedContent, headings, readingTime } = React.useMemo(() => {
    const targetContent = editorialIntro ? editorialIntro.cleanedHTML : postContent;
    if (!targetContent) return { processedContent: '', headings: [], readingTime: 0 };

    const trMap: Record<string, string> = {
      'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
      'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U'
    };

    const slugify = (text: string) => {
      let slug = text;
      Object.keys(trMap).forEach(key => {
        slug = slug.replace(new RegExp(key, 'g'), trMap[key]);
      });
      return slug
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    };

    const div = document.createElement('div');
    div.innerHTML = targetContent;

    // Convert any h1 inside the blog content to h2 for semantic SEO (avoiding duplicate H1s on the page),
    // while copying all styles, classes, and attributes to maintain identical styling.
    const innerH1s = Array.from(div.querySelectorAll('h1'));
    innerH1s.forEach((h1) => {
      const h2 = document.createElement('h2');
      Array.from(h1.attributes).forEach(attr => {
        h2.setAttribute(attr.name, attr.value);
      });
      h2.innerHTML = h1.innerHTML;
      h1.replaceWith(h2);
    });

    // Clean up any nested layout cards/containers in the database HTML (e.g., main, article, section, div wrapper containers)
    // to preserve a clean, natural flow without gray bg, nested card borders/shadows, and boxed styling.
    const wrappingContainers = Array.from(div.querySelectorAll('main, article, section, div'));
    wrappingContainers.forEach((el) => {
      // Determine if this element is an outer structural wrapper (typically main, article, section, or outer-level divs)
      const isWrapper = el.tagName === 'MAIN' || el.tagName === 'ARTICLE' || el.tagName === 'SECTION' || (el.tagName === 'DIV' && (el.parentElement === div || el.parentElement?.parentElement === div));
      
      if (isWrapper) {
        el.removeAttribute('style');
        el.className = '';
      } else {
        // For other elements, filter out the background, border, shadow, rounded, and ring classes to prevent bleed
        if (el.className) {
          let classes = el.className.split(/\s+/);
          classes = classes.filter(cls => {
            const lower = cls.toLowerCase();
            return !(
              lower.startsWith('bg-') ||
              lower.includes('bg-[#') ||
              lower.startsWith('border') ||
              lower.startsWith('shadow') ||
              lower.startsWith('rounded') ||
              lower.startsWith('ring') ||
              lower.includes('card') ||
              lower.includes('shadow-') ||
              lower.includes('border-')
            );
          });
          el.className = classes.join(' ');
        }
        
        const existingStyle = el.getAttribute('style') || '';
        if (existingStyle) {
          const cleanedStyle = existingStyle
            .replace(/background[^;]+;?/gi, '')
            .replace(/border[^;]+;?/gi, '')
            .replace(/box-shadow[^;]+;?/gi, '')
            .replace(/border-radius[^;]+;?/gi, '');
          el.setAttribute('style', cleanedStyle);
        }
      }
    });

    // Scope any potentially leaking style tags to .article-content to protect standard page layout/header
    const styleTags = Array.from(div.querySelectorAll('style'));
    styleTags.forEach((styleTag) => {
      let css = styleTag.textContent || '';
      css = css.replace(/(^|[\s,{}])(a|h1|h2|h3|h4|h5|h6|p|li|ul|ol|body|html|table|tr|td|th)([\s,:{])/g, (match, prefix, selector, suffix) => {
        if (selector === 'body' || selector === 'html') {
          return `${prefix}.article-content${suffix}`;
        }
        return `${prefix}.article-content ${selector}${suffix}`;
      });
      styleTag.textContent = css;
    });
    
    // 1. Calculate reading time realistically (Turkish reading speed is ~180-220 wpm)
    const textContent = div.textContent || '';
    const wordCount = textContent.split(/\s+/).filter(Boolean).length;
    const computedTime = Math.ceil(wordCount / 180);
    const estimatedTime = Math.max(computedTime > 0 ? computedTime : 1, 5); // Minimum realistic size is 5 mins for legal posts

    // 2. Extract headings, strip numbers to prevent duplications, and record hierarchy
    const items = Array.from(div.querySelectorAll('h2, h3'));
    
    let h2Count = 0;
    let h3Count = 0;
    const extractedHeadings = items.map((item, index) => {
      const text = item.textContent || '';
      const id = slugify(text);
      const uniqueId = `${id}-${index}`;
      item.id = uniqueId;

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

      // Strip leading numeric digits like "1.", "1-", "1.1." to prevent duplicate listing,
      // but preserve numbers that are part of the header title text (like "18 yaşından gün almış olmak")
      let cleanText = text;
      const headingNumMatch = text.match(/^\s*(\d+(?:\.\d+)*)(?:\s*[\.\-]\s*|\s+)/);
      if (headingNumMatch) {
        const numStr = headingNumMatch[1];
        if (numStr.includes('.')) {
          // Multi-level list numbering (e.g. 1.1), strip it safely
          cleanText = text.replace(/^\s*\d+(?:\.\d+)+\s*[\.\-]?\s*/, '');
        } else {
          // Single digit list prefix (e.g. 1. or 1- or 1 ), strip if <= 12
          const num = parseInt(numStr, 10);
          if (num <= 12) {
            cleanText = text.replace(/^\s*\d+\s*[\.\-]?\s*/, '');
          }
        }
      }

      return {
        id: uniqueId,
        text: cleanText,
        level,
        numberStr
      };
    });

    // 3. Process custom warning and advisory blocks programmatically inside DOM tree (highly reliable)
    const customBlocks = Array.from(div.querySelectorAll('p, blockquote'));
    customBlocks.forEach((node) => {
      const htmlContent = node.innerHTML || '';
      const text = (node.textContent || '').trim();

      // Check for Critical Warnings
      const isCritical = /^(Kritik Uyarı|Önemli Uyarı|Warning|Critical Warning)/i.test(text);
      // Check for Practical Advice or Important Notes
      const isAdvisory = /^(Pratik Tavsiye|Önemli Not|Practical Advice|Practical Advisory|Important Note|Not|İpucu|Note)/i.test(text);

      if (isCritical) {
        const titleMatch = text.match(/^(Kritik Uyarı|Önemli Uyarı|Warning|Critical Warning):?/i);
        const title = titleMatch ? titleMatch[1] : 'Kritik Uyarı';
        const rawContent = htmlContent
          .replace(/^\s*<strong[^>]*>.*?<\/strong>/i, '') // strip strong tag prefix
          .replace(/^\s*(Kritik Uyarı|Önemli Uyarı|Warning|Critical Warning):?\s*/i, '') // strip text prefix
          .trim();

        const alertDiv = document.createElement('div');
        alertDiv.className = 'my-8 p-5 sm:p-6 bg-amber-50/70 border-l-[3.5px] border-amber-600 rounded-sm flex gap-4 shadow-sm break-inside-avoid text-left';
        alertDiv.innerHTML = `
          <div class="text-amber-600 shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div>
            <h5 class="text-brand-navy font-bold text-[11px] uppercase tracking-[0.15em] mb-1.5">${title}</h5>
            <div class="text-brand-navy/85 text-[15px] sm:text-[15.5px] font-light leading-relaxed m-0 p-0">${rawContent || text}</div>
          </div>
        `;
        node.replaceWith(alertDiv);
      } else if (isAdvisory) {
        const titleMatch = text.match(/^(Pratik Tavsiye|Önemli Not|Practical Advice|Practical Advisory|Important Note|Not|İpucu|Note):?/i);
        const title = titleMatch ? titleMatch[1] : 'Pratik Tavsiye';
        const rawContent = htmlContent
          .replace(/^\s*<strong[^>]*>.*?<\/strong>/i, '') // strip strong tag
          .replace(/^\s*(Pratik Tavsiye|Önemli Not|Practical Advice|Practical Advisory|Important Note|Not|İpucu|Note):?\s*/i, '') // strip text prefix
          .trim();

        const infoDiv = document.createElement('div');
        infoDiv.className = 'my-8 p-5 sm:p-6 bg-[#f6f8f6] border-l-[3.5px] border-emerald-600 rounded-sm flex gap-4 shadow-sm break-inside-avoid text-left';
        infoDiv.innerHTML = `
          <div class="text-emerald-700 shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          </div>
          <div>
            <h5 class="text-brand-navy font-bold text-[11px] uppercase tracking-[0.15em] mb-1.5">${title}</h5>
            <div class="text-brand-navy/85 text-[15px] sm:text-[15.5px] font-light leading-relaxed m-0 p-0">${rawContent || text}</div>
          </div>
        `;
        node.replaceWith(infoDiv);
      }
    });

    // 4. Transform lists programmatically (UL Unordered checklists)
    const uls = Array.from(div.querySelectorAll('ul'));
    uls.forEach((ul) => {
      ul.className = "space-y-4 my-8 pl-0 list-none text-left";
      const lis = Array.from(ul.querySelectorAll('li'));
      lis.forEach((li) => {
        const originalContent = li.innerHTML || '';
        li.className = "flex items-start gap-x-3.5 text-[17px] sm:text-[18px] text-brand-navy/85 font-light leading-[1.75] mb-2";
        li.innerHTML = `
          <span class="text-brand-gold shrink-0 mt-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </span>
          <span class="flex-1">${originalContent}</span>
        `;
      });
    });

    // 5. Transform ordered lists (OL Ordered lists)
    const ols = Array.from(div.querySelectorAll('ol'));
    ols.forEach((ol) => {
      ol.className = "space-y-4 my-8 pl-4 list-decimal marker:text-brand-gold marker:font-bold marker:font-mono text-left";
      const lis = Array.from(ol.querySelectorAll('li'));
      lis.forEach((li) => {
        li.className = "pl-2 text-[17px] sm:text-[18px] text-brand-navy/85 font-light leading-[1.75] mb-2";
      });
    });

    // 6. Transform tables programmatically for elegant styling & fully fluid responsiveness
    const tables = Array.from(div.querySelectorAll('table'));
    tables.forEach((table) => {
      // Style headers
      const ths = Array.from(table.querySelectorAll('th'));
      ths.forEach((th) => {
        th.className = "px-6 py-4.5 bg-brand-navy/5 font-serif text-[12px] sm:text-xs font-bold uppercase tracking-widest text-brand-navy border-b border-brand-navy/15 text-left font-serif min-w-[120px]";
      });

      // Style details
      const tds = Array.from(table.querySelectorAll('td'));
      tds.forEach((td) => {
        td.className = "px-6 py-4.5 border-b border-brand-navy/5 text-brand-navy/80 hover:text-brand-navy transition-colors font-sans text-xs sm:text-sm leading-relaxed align-middle";
      });

      // Zebra rows
      const trs = Array.from(table.querySelectorAll('tbody tr'));
      trs.forEach((tr, index) => {
        tr.className = index % 2 === 0 ? "bg-white hover:bg-brand-navy/[0.01] transition-colors" : "bg-[#fcfbf9]/60 hover:bg-brand-navy/[0.01] transition-colors";
      });

      // Wrap in responsive container
      const wrapper = document.createElement('div');
      wrapper.className = "my-10 overflow-x-auto w-full border border-brand-navy/10 rounded-sm shadow-sm max-w-full block scrollbar-thin scrollbar-thumb-brand-gold";
      
      table.parentNode?.insertBefore(wrapper, table);
      wrapper.appendChild(table);
      
      table.className = "w-full border-collapse text-left text-brand-navy min-w-[650px]";
    });

    return {
      processedContent: div.innerHTML,
      headings: extractedHeadings,
      readingTime: estimatedTime
    };
  }, [postContent, editorialIntro]);

  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -60% 0px' }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  const scrollToHeading = (id: string, isMobileClick = false) => {
    const element = document.getElementById(id);
    if (element) {
      // Dynamic offset optimized based on tablet/mobile vs desktop screen sizes.
      // We have a sticky header on mobile and desktop. An offset of 140px on mobile and
      // 150px on desktop positions the headings with perfect visual spacing and margins for optimal reading.
      const offset = window.innerWidth < 1024 ? 140 : 150;
      
      const elementPosition = element.getBoundingClientRect().top;
      const currentScroll = window.scrollY !== undefined ? window.scrollY : window.pageYOffset;
      let offsetPosition = elementPosition + currentScroll - offset;

      // If the mobile Table of Contents content is physically present in the DOM,
      // it means it is about to collapse/unmount, causing the article body below it to shift up.
      // We subtract its physical height to perfectly anticipate and neutralize this layout shift.
      const tocContent = document.getElementById('mobile-toc-content');
      if (tocContent) {
        offsetPosition -= tocContent.offsetHeight;
      }

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const postMetaDescription = useMemo(() => {
    if (!post) return '';
    // 1. Check metaDescription field
    if (post.metaDescription) {
      const metaDescVal = post.metaDescription as any;
      if (typeof metaDescVal === 'string' && metaDescVal.trim()) {
        return metaDescVal.trim();
      } else if (typeof metaDescVal === 'object') {
        const val = getTranslation(metaDescVal, i18n.language, post.language);
        if (val && val.trim()) return val.trim();
      }
    }

    // 2. Check seoMeta field
    if (post.seoMeta) {
      const seoMetaVal = post.seoMeta as any;
      if (typeof seoMetaVal === 'string' && seoMetaVal.trim()) {
        return seoMetaVal.trim();
      } else if (typeof seoMetaVal === 'object') {
        const val = getTranslation(seoMetaVal, i18n.language, post.language);
        if (val && val.trim()) return val.trim();
      }
    }

    // 3. Fallback to excerpt
    if (post.excerpt) {
      const excerptVal = post.excerpt as any;
      if (typeof excerptVal === 'string' && excerptVal.trim()) {
        return excerptVal.trim();
      } else if (typeof excerptVal === 'object') {
        const val = getTranslation(excerptVal, i18n.language, post.language);
        if (val && val.trim()) return val.trim();
      }
    }

    return '';
  }, [post, i18n.language]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-deep flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    const isTr = i18n.language === 'tr';
    return (
      <div className="min-h-screen bg-bg-deep flex flex-col justify-between font-sans">
        <SEO 
          title={isTr ? 'Makale Bulunamadı' : 'Article Not Found'}
          description={isTr ? 'Aradığınız hukuki makale bulunamadı.' : 'The requested legal advisory article could not be found.'}
          canonical={`/blog/${id}`}
        />
        <Navbar />
        <div className="text-center max-w-lg mx-auto py-32 px-6 flex-grow flex flex-col justify-center items-center">
          <BookOpen className="w-12 h-12 text-brand-gold/40 mb-6 shrink-0 animate-pulse" />
          <h2 className="font-serif text-2xl text-brand-navy mb-4 font-bold tracking-tight">
            {isTr ? 'Makale Bulunamadı' : 'Article Not Found'}
          </h2>
          <p className="text-xs text-brand-navy/60 leading-relaxed max-w-sm mb-10">
            {isTr 
              ? 'Aradığınız hukuki makale bulunamadı veya henüz yayına alınmadı. Lütfen bağlantıyı kontrol edin veya tüm makalelere göz atın.' 
              : 'The legal article you are looking for could not be found or has not been published yet. Please double check the URL.'
            }
          </p>
          <Link 
            to="/blog"
            className="inline-flex items-center gap-2.5 bg-brand-navy text-white px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-black hover:bg-brand-gold hover:text-white transition-all shadow-md hover:shadow-xl rounded-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {isTr ? 'TÜM MAKALELERE DÖN' : 'RETURN TO ALL ARTICLES'}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const postTitle = getTranslation(post.title, i18n.language, post.language);
  const postExcerpt = getTranslation(post.excerpt, i18n.language, post.language);
  
  const hasCustomStyling = true;

  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": postTitle,
    "description": postMetaDescription || postExcerpt,
    "image": [post.image],
    "datePublished": post.date,
    "dateModified": post.date, // Assuming modified is same if not available
    "author": {
      "@type": "Person",
      "name": author?.name || "Resen Legal Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Resen Legal & Consultancy",
      "logo": {
        "@type": "ImageObject",
        "url": "https://res.cloudinary.com/dlrsifk2y/image/upload/v1782769600/last_t2oqne.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://resenlegal.com/blog/${getPostSlug(post)}`
    }
  };

  return (
    <div className="min-h-screen bg-bg-deep overflow-x-hidden blog-print-container">
      <style>{`
        /* Desktop alignment: ensure first-child elements of the article start from exactly mt-0 and pt-0 */
        .article-content > *:first-child,
        .article-content > *:first-child > *:first-child {
          margin-top: 0 !important;
          padding-top: 0 !important;
        }

        /* Force transparent & borderless layouts for nested layout tags within article container style */
        .article-content main,
        .article-content section,
        .article-content > div {
          background: transparent !important;
          background-color: transparent !important;
          background-image: none !important;
          border: none !important;
          border-width: 0 !important;
          box-shadow: none !important;
          box-shadow: 0 0 0 0 transparent !important;
          border-radius: 0 !important;
          --tw-shadow: 0 0 #0000 !important;
          --tw-ring-width: 0px !important;
          padding-top: 0 !important;
          margin-top: 0 !important;
        }

        .article-content article {
          background: var(--card-bg) !important;
          background-color: var(--card-bg) !important;
          background-image: none !important;
          border: none !important;
          border-width: 0 !important;
          box-shadow: none !important;
          box-shadow: 0 0 0 0 transparent !important;
          border-radius: 0 !important;
          --tw-shadow: 0 0 #0000 !important;
          --tw-ring-width: 0px !important;
          padding-top: 0 !important;
          margin-top: 0 !important;
        }

        /* Ensure all text elements (paragraphs, list items, etc) except headings inside article-content have the exact same size as standard paragraphs (falling back to 14px) */
        .article-content p,
        .article-content li,
        .article-content blockquote,
        .article-content td,
        .article-content th,
        .article-content span,
        .article-content a:not([class*="heading"]) {
          font-size: var(--article-font-size, 14px) !important;
          line-height: 1.75 !important;
        }

        @media print {
          /* Hide unnecessary elements: navigation, footer, sharing, comments, ads, back link */
          nav, 
          footer, 
          header,
          .fixed,
          .blog-back-button,
          .blog-share-card,
          .blog-related-posts,
          .blog-back-to-top,
          #navbar, 
          #footer,
          .navbar,
          .footer,
          .comments,
          .comment-box,
          .ads,
          .advertisement,
          .blog-hero-overlay,
          .blog-hero-badge {
            display: none !important;
          }

          /* Force backgrounds during print execution */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Page-level resetting for canvas printing */
          body, html, .blog-print-container {
            background: white !important;
            background-color: white !important;
            color: black !important;
            font-family: "Georgia", "Times New Roman", serif !important;
            font-size: 12pt !important;
          }

          /* Typography serif rules and black coloring */
          .blog-print-container h1, 
          .blog-print-container h2, 
          .blog-print-container h3, 
          .blog-print-container h4, 
          .blog-print-container p, 
          .blog-print-container span, 
          .blog-print-container li, 
          .blog-print-container a,
          .blog-print-container time,
          .blog-print-container button,
          .blog-print-container div {
            font-family: "Georgia", "Times New Roman", serif !important;
            color: black !important;
          }

          /* Hierarchy and size specifications */
          .blog-print-container p, 
          .blog-print-container li, 
          .blog-print-container span, 
          .blog-print-container button {
            font-size: 12pt !important;
            line-height: 1.6 !important;
          }
          .blog-print-container h1 {
            font-size: 26pt !important;
            line-height: 1.2 !important;
            margin-bottom: 15pt !important;
            font-weight: bold !important;
          }
          .blog-print-container h2 {
            font-size: 18pt !important;
            line-height: 1.3 !important;
            margin-top: 20pt !important;
            margin-bottom: 12pt !important;
            font-weight: bold !important;
          }
          .blog-print-container h3 {
            font-size: 14pt !important;
            line-height: 1.4 !important;
            margin-top: 15pt !important;
            margin-bottom: 10pt !important;
            font-weight: bold !important;
          }

          /* Non-colored underlined link standards */
          .blog-print-container a {
            color: black !important;
            text-decoration: underline !important;
          }

          /* Stream columns vertically instead of parallel column layout */
          .blog-grid-layout {
            display: block !important;
          }
          aside, main, .lg\\:col-span-8, .lg\\:col-span-4 {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Hero details simplification */
          .blog-hero-header {
            height: auto !important;
            min-height: 0 !important;
            padding: 0 !important;
            margin-bottom: 25pt !important;
            background: transparent !important;
          }
          .blog-hero-header img {
            max-height: 250px !important;
            width: 100% !important;
            object-fit: cover !important;
            margin-bottom: 15pt !important;
            border-radius: 4px !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          /* Keep Contents card with light gray background and border */
          .blog-toc-card {
            background-color: #f5f5f5 !important;
            background: #f5f5f5 !important;
            border: 1px solid #cccccc !important;
            padding: 20px !important;
            margin-bottom: 30px !important;
            box-shadow: none !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          /* Remove decorative block shadows/margins/padding from core content sheet */
          .blog-content-card {
            background: transparent !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
          }

          /* Page break optimizations */
          h1, h2, h3, h4, h5, h6 {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          img, picture, figure, blockquote, pre, table, .blog-toc-card {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>
      <SEO 
        title={postTitle}
        description={postMetaDescription}
        keywords={post.seoKeywords ? `${postTitle}, ${postCategory}, ${post.seoKeywords}` : `${postTitle}, ${postCategory}, legal insights, blog`}
        image={post.image}
        article={true}
        publishedTime={post.date}
        author={author?.name}
        section={postCategory}
        isBlogDetail={true}
        canonical={`/blog/${getPostSlug(post)}`}
        structuredData={articleStructuredData}
        lang={post.language}
      />
      
      <Navbar />

      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-brand-gold z-50 origin-left"
        style={{ scaleX }}
      />

      <main className="pt-24 pb-24 overflow-x-hidden">
        {/* Shortened Hero Header with high-contrast screen styling */}
        <div className="relative h-[35vh] md:h-[45vh] min-h-[300px] w-full overflow-hidden blog-hero-header">
          <img 
            src={post.image || null} 
            alt={postTitle}
            className="w-full h-full object-cover animate-fade-in"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-brand-navy/75 backdrop-blur-[1px] blog-hero-overlay" />
          
          <div className="absolute inset-0 flex items-center justify-center px-4 md:px-6">
            <div className="max-w-4xl w-full text-center space-y-4 md:space-y-6">
              <div className="flex justify-center flex-wrap gap-2.5">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-3.5 py-1 bg-brand-gold/25 backdrop-blur-md rounded-full text-[10px] uppercase tracking-[0.25em] font-extrabold text-brand-gold border border-brand-gold/30 blog-hero-badge animate-fadeIn"
                >
                  <Tag className="w-3 h-3" />
                  {postCategory}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-navy/80 backdrop-blur-md rounded-full text-[10px] font-extrabold text-white border border-white/10 uppercase tracking-[0.1em] animate-fadeIn"
                >
                  <span>{i18n.language === 'tr' ? 'DİL' : 'LANG'}: {post.language ? post.language.toUpperCase() : 'TR'}</span>
                </motion.div>
              </div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-white tracking-tight leading-tight md:leading-snug max-w-3xl mx-auto"
              >
                {postTitle}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-brand-offwhite/60"
              >
                <div className="flex items-center gap-1.5 text-[10px] md:text-xs uppercase tracking-widest font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-brand-gold" />
                  {new Date(post.date).toLocaleDateString(i18n.language === 'en' ? 'en-GB' : i18n.language, { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] md:text-xs uppercase tracking-widest font-semibold">
                  <Clock className="w-3.5 h-3.5 text-brand-gold" />
                  {readingTime} {t('common.minRead')}
                </div>
                {author && (
                  <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-semibold">
                    <span className="uppercase tracking-tight opacity-40">{t('blogSection.writtenBy')}</span>
                    <span className="text-white hover:text-brand-gold transition-colors">{author.name}</span>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-16 md:mt-24 w-full">
          {/* Back to Blog Button */}
          <div className="mb-12 blog-back-button">
            <Link 
              to="/blog"
              className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-black text-brand-navy/60 hover:text-brand-gold transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('blogSection.backToBlog')}
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start w-full blog-grid-layout">
            {/* Left Column: Table of Contents and Sharing */}
            <aside className="lg:col-span-4 mt-0 pt-0 w-full overflow-hidden self-start">
              <div className="sticky top-32 mt-0 pt-0 space-y-8">
                {/* Table of Contents Card (Desktop Only) */}
                {headings.length > 0 && (
                  <div className="hidden lg:block bg-white border border-brand-navy/10 p-6 md:p-8 rounded-sm shadow-sm hover:shadow-md transition-shadow duration-300 w-full blog-toc-card mt-0">
                    <div className="flex items-center gap-3 text-brand-gold mb-6 pb-4 border-b border-brand-navy/5">
                      <div className="w-8 h-[1px] bg-brand-gold" />
                      <span className="text-[10px] uppercase tracking-[0.3em] font-black">{t('blogSection.contents')}</span>
                    </div>
                    
                    <nav className="space-y-4 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
                      {headings.map((heading) => (
                        <button
                          key={heading.id}
                          onClick={() => scrollToHeading(heading.id)}
                          className={`group relative flex items-start gap-3 text-left transition-all duration-300 w-full py-0.5 ${
                            heading.level === 'h3' ? 'pl-6 text-[11px]' : 'text-xs font-semibold'
                          }`}
                        >
                          {/* Left Accent indicator when active */}
                          <span className={`absolute -left-3 top-0 h-full w-[2px] transition-all duration-300 ${
                            activeId === heading.id ? 'bg-brand-gold' : 'bg-transparent'
                          }`} />
                          
                          {/* Hierarchical Numbering */}
                          <span className="font-mono text-[10px] text-brand-gold opacity-80 select-none shrink-0 min-w-[20px] pt-0.5">
                            {heading.numberStr}
                          </span>
                          
                          {/* Text label */}
                          <span className={`${
                            activeId === heading.id 
                              ? 'text-brand-gold font-bold translate-x-1' 
                              : 'text-brand-navy/60 font-medium group-hover:text-brand-gold group-hover:translate-x-1'
                          } transition-all duration-300 leading-relaxed`}>
                            {heading.text}
                          </span>
                        </button>
                      ))}
                    </nav>

                    <div className="mt-6 pt-4 border-t border-brand-navy/5 blog-back-to-top">
                      <button 
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="text-[10px] uppercase tracking-widest font-black text-brand-navy/40 hover:text-brand-gold transition-colors flex items-center gap-2"
                      >
                        <div className="w-4 h-[1px] bg-brand-navy/20" />
                        {t('blogSection.backToTop')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Font Size Settings Card (Desktop Only) */}
                <div className="hidden lg:block bg-white border border-brand-navy/10 p-6 rounded-sm shadow-sm hover:shadow-md transition-all duration-300 w-full blog-font-size-card">
                  <div className="flex items-center gap-3 text-brand-gold mb-4 pb-3 border-b border-brand-navy/5">
                    <Type className="w-4 h-4 text-brand-gold" />
                    <span className="text-[10px] uppercase tracking-[0.3em] font-black">
                      {i18n.language === 'tr' ? 'OKUMA SEÇENEKLERİ' : 'READING OPTIONS'}
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-brand-navy/65 block mb-2">
                        {i18n.language === 'tr' ? 'MAKALENİN PUNTO BOYUTU:' : 'ARTICLE FONT SIZE:'}
                      </span>
                      <div className="flex gap-2">
                        {(['14px', '16px', '18px'] as const).map((size) => (
                          <button
                            key={size}
                            onClick={() => handleFontSizeChange(size)}
                            className={`flex-1 py-2 text-xs font-semibold rounded-sm border transition-all duration-300 ${
                              fontSize === size
                                ? 'bg-brand-navy text-white border-brand-navy shadow-sm'
                                : 'bg-transparent text-brand-navy/60 border-brand-navy/10 hover:border-brand-gold hover:text-brand-gold'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Share Insights (Desktop Only) */}
                <div className="hidden lg:block bg-white/50 border border-brand-navy/10 p-6 rounded-sm w-full blog-share-card">
                  <p className="text-[10px] uppercase tracking-widest font-black text-brand-navy/40 mb-4">{t('blogSection.shareInsights')}</p>
                  <div className="flex flex-wrap gap-3">
                    <a 
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full border border-brand-navy/5 flex items-center justify-center text-brand-navy/60 hover:bg-[#0077b5] hover:text-white hover:border-[#0077b5] transition-all"
                      title="Share on LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a 
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(postTitle)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full border border-brand-navy/5 flex items-center justify-center text-brand-navy/60 hover:bg-black hover:text-white hover:border-black transition-all"
                      title="Share on X"
                    >
                      <X className="w-4 h-4" />
                    </a>
                    <a 
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full border border-brand-navy/5 flex items-center justify-center text-brand-navy/60 hover:bg-[#1877f2] hover:text-white hover:border-[#1877f2] transition-all"
                      title="Share on Facebook"
                    >
                      <Facebook className="w-4 h-4" />
                    </a>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(currentUrl);
                        setShowCopyFeedback(true);
                        setTimeout(() => setShowCopyFeedback(false), 2000);
                      }}
                      className="w-10 h-10 rounded-full border border-brand-navy/5 flex items-center justify-center text-brand-navy/60 hover:bg-brand-gold hover:text-white hover:border-brand-gold transition-all relative"
                      title="Copy Link"
                    >
                      {showCopyFeedback ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            {/* Right Column: main Content */}
            <div className="lg:col-span-8 mt-0 pt-0 w-full overflow-hidden self-start">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className={`w-full mt-0 pt-0 overflow-hidden blog-content-card ${
                  hasCustomStyling 
                    ? 'bg-white border border-brand-navy/10 p-6 sm:p-10 md:p-12 rounded-sm shadow-sm' 
                    : ''
                }`}
              >
                {/* Mobile & Tablet Table of Contents - Collapsible Accordion (Hidden on Desktop) */}
                {headings.length > 0 && (
                  <div className={`lg:hidden border border-brand-navy/10 rounded-sm mb-8 overflow-hidden transition-all shadow-sm ${
                    hasCustomStyling ? 'bg-white' : 'bg-[#fafafc]'
                  }`}>
                    <button
                      onClick={() => setIsMobileTocOpen(!isMobileTocOpen)}
                      className="w-full px-5 py-4 flex items-center justify-between text-brand-navy hover:text-brand-gold transition-colors font-serif"
                    >
                      <div className="flex items-center gap-2.5">
                        <BookOpen className="w-4 h-4 text-brand-gold shrink-0" />
                        <span className="text-sm font-semibold tracking-wide text-brand-navy">
                          {i18n.language.startsWith('tr') ? "İçindekiler" : "Contents"}
                        </span>
                        <span className="inline-flex items-center justify-center text-[10px] font-mono bg-brand-gold/15 text-brand-gold font-bold px-1.5 py-0.5 rounded-full min-w-[20px] h-[18px]">
                          {headings.length}
                        </span>
                      </div>
                      <motion.div
                        animate={{ rotate: isMobileTocOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4 text-brand-navy/40" />
                      </motion.div>
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {isMobileTocOpen && (
                        <motion.div
                          id="mobile-toc-content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={instantClose ? { duration: 0 } : { duration: 0.25, ease: "easeInOut" }}
                        >
                          <div className="px-5 pb-4 pt-1 border-t border-brand-navy/5 bg-white">
                            <nav className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
                              {headings.map((heading) => (
                                <button
                                  key={heading.id}
                                  onClick={() => {
                                    setInstantClose(true);
                                    setIsMobileTocOpen(false);
                                    // With instantClose=true, the accordion collapses instantly in 0ms.
                                    // A tiny 30ms timeout is perfectly matched for the next repainting cycle to find the static element positions
                                    // and smoothly scroll to the exact heading offset with 100% precision!
                                    setTimeout(() => {
                                      scrollToHeading(heading.id, false);
                                      setInstantClose(false);
                                    }, 30);
                                  }}
                                  className={`group flex items-start gap-3.5 text-left transition-all w-full py-2.5 border-b border-brand-navy/5 last:border-0 hover:bg-brand-gold/5 rounded-sm px-1.5 -mx-1.5 ${
                                    heading.level === 'h3' ? 'pl-6 text-[12px]' : 'text-xs font-semibold'
                                  }`}
                                >
                                  <span className="font-mono text-[10px] text-brand-gold shrink-0 min-w-[20px] pt-0.5">
                                    {heading.numberStr}
                                  </span>
                                  <span className={`${
                                    activeId === heading.id 
                                      ? 'text-brand-gold font-bold font-serif' 
                                      : 'text-brand-navy/70 hover:text-brand-gold font-medium'
                                  } leading-relaxed flex-1`}>
                                    {heading.text}
                                  </span>
                                </button>
                              ))}
                            </nav>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                {editorialIntro && (
                  <div className="border border-brand-navy/10 bg-gradient-to-br from-[#faf6f0] to-[#f4f7fa] p-8 md:p-10 rounded-sm mb-12 shadow-sm relative overflow-hidden break-inside-avoid page-break-inside-avoid blog-toc-card">
                    {/* Elegant Background Accents */}
                    <div className="absolute right-0 top-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex flex-col gap-6 relative z-10">
                      {/* Subtitle / Topic Category Header */}
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[10px] uppercase tracking-[0.3em] font-extrabold text-brand-gold px-2.5 py-1 bg-brand-gold/10 rounded-sm">
                          {editorialIntro.category}
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-navy/60 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-brand-gold" />
                          {editorialIntro.location}
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-navy/40 sm:ml-auto font-mono">
                          {editorialIntro.seriesIndex}
                        </span>
                      </div>

                      {/* Elegant Title */}
                      <div className="space-y-3">
                        <h3 className="text-2xl md:text-3xl font-serif text-brand-navy tracking-tight leading-tight">
                          {editorialIntro.title}
                        </h3>
                        <div className="w-16 h-[2px] bg-brand-gold" />
                      </div>

                      {/* Description Paragraph */}
                      {editorialIntro.description && (
                        <p className="text-sm md:text-base text-brand-navy/85 font-light leading-relaxed border-l-2 border-brand-gold/40 pl-4 italic">
                          {editorialIntro.description}
                        </p>
                      )}

                      {/* Visual Series Guideline / Progress Timeline */}
                      <div className="mt-4 pt-6 border-t border-brand-navy/5">
                        <div className="flex items-center gap-2 mb-4">
                          <Layers className="w-4 h-4 text-brand-gold" />
                          <span className="text-[11px] uppercase tracking-widest font-black text-brand-navy/60">
                            {i18n.language === 'en' ? 'GUIDE CONTENT & ARTICLES' : 'REHBER İÇERİĞİ VE MAKALELER'}
                          </span>
                        </div>
                        
                        {/* 3-Step Series Stepper */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-brand-navy/5 p-4 rounded-sm border-l-4 border-brand-gold relative">
                            <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-brand-gold text-white text-[9px] font-bold font-mono">
                              1
                            </div>
                            <div className="text-[9px] uppercase tracking-wider font-bold text-brand-gold mb-1">
                              {i18n.language === 'en' ? 'Currently Reading' : 'Şu Anda Okunuyor'}
                            </div>
                            <p className="text-xs font-semibold text-brand-navy leading-normal">
                              {i18n.language === 'en' ? 'Legal Basis and Core Concepts' : 'Hukuki Dayanak ve Temel Kavramlar'}
                            </p>
                          </div>

                          <div className="bg-white/40 p-4 rounded-sm border border-brand-navy/5 flex flex-col justify-between hover:bg-white/80 transition-colors">
                            <div>
                              <div className="text-[9px] uppercase tracking-wider font-bold text-brand-navy/40 mb-1">
                                {i18n.language === 'en' ? '2nd Article of the Series' : 'Serinin 2. Yazısı'}
                              </div>
                              <p className="text-xs font-medium text-brand-navy/80 leading-normal">
                                {i18n.language === 'en' ? 'Administrative and Judicial Processes' : 'İdari ve Yargısal Süreçler'}
                              </p>
                            </div>
                          </div>

                          <div className="bg-white/40 p-4 rounded-sm border border-brand-navy/5 flex flex-col justify-between hover:bg-white/80 transition-colors">
                            <div>
                              <div className="text-[9px] uppercase tracking-wider font-bold text-brand-navy/40 mb-1">
                                {i18n.language === 'en' ? '3rd Article of the Series' : 'Serinin 3. Yazısı'}
                              </div>
                              <p className="text-xs font-medium text-brand-navy/80 leading-normal">
                                {i18n.language === 'en' ? 'Critical Risks and Statute of Limitations Trap' : 'Kritik Riskler ve Zamanaşımı Tuzağı'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="w-full text-left max-w-none mt-0 pt-0">
                  {/* Mobile Font Size Selection Bar (Hidden on Desktop) */}
                  <div className="lg:hidden flex items-center justify-between bg-white border border-brand-navy/10 px-4 py-3 rounded-sm shadow-sm mb-6">
                    <div className="flex items-center gap-2 text-brand-navy/60">
                      <Type className="w-4 h-4 text-brand-gold" />
                      <span className="text-xs font-semibold tracking-wide">
                        {i18n.language === 'tr' ? 'Yazı Boyutu:' : 'Text Size:'}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {(['14px', '16px', '18px'] as const).map((size) => (
                        <button
                          key={size}
                          onClick={() => handleFontSizeChange(size)}
                          className={`px-3 py-1 text-xs font-semibold rounded-sm border transition-all duration-300 ${
                            fontSize === size
                              ? 'bg-brand-navy text-white border-brand-navy'
                              : 'bg-transparent text-brand-navy/60 border-brand-navy/10'
                          }`}
                        >
                          {size === '14px' ? '14px' : size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div 
                    className="prose prose-brand max-w-none article-content prose-headings:font-serif prose-headings:text-brand-navy prose-h2:text-[22px] md:prose-h2:text-[28px] prose-h2:font-bold prose-h2:tracking-tight prose-h2:mt-16 prose-h2:mb-6 prose-h2:pl-4 prose-h2:border-l-[3.5px] prose-h2:border-brand-gold prose-h2:pb-1 prose-h3:text-[19px] md:prose-h3:text-[22px] prose-h3:font-semibold prose-h3:tracking-tight prose-h3:mt-11 prose-h3:mb-4 prose-p:text-[18px] prose-p:text-brand-navy/85 hover:prose-p:text-brand-navy/95 prose-p:leading-[1.75] prose-p:mb-8 md:prose-p:mb-10 text-brand-navy break-words [overflow-wrap:break-word] [word-break:break-word] overflow-hidden prose-img:max-w-full prose-img:h-auto prose-img:rounded-sm prose-pre:max-w-full prose-pre:overflow-x-auto prose-table:max-w-full prose-table:overflow-x-auto prose-a:text-brand-gold prose-a:underline hover:prose-a:text-brand-navy transition-colors w-full mt-0 pt-0 [&>*:first-child]:mt-0 [&>*:first-child]:pt-0"
                    style={{ '--article-font-size': fontSize } as React.CSSProperties}
                    dangerouslySetInnerHTML={{ __html: processedContent }}
                  />
                </div>

                {author && (
                  <div className="mt-20 pt-12 border-t border-brand-navy/5">
                    <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-gold mb-8 italic">
                      {t('blogSection.aboutAuthor')}
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="space-y-4 text-center md:text-left">
                        <div>
                          <h4 className="text-xl font-serif text-brand-navy">{author.name}</h4>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-brand-gold">
                            {getTranslation(author.role, i18n.language)}
                          </p>
                        </div>
                        {author.bio && (
                          <p className="text-sm text-brand-navy/60 font-light max-w-lg italic">
                            "{getTranslation(author.bio, i18n.language)}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobile-Only Share Box (hidden on lg) */}
                <div className="lg:hidden mt-12 pt-8 border-t border-brand-navy/5 blog-share-card">
                  <p className="text-[10px] uppercase tracking-widest font-black text-brand-navy/40 mb-4">{t('blogSection.shareInsights')}</p>
                  <div className="flex flex-wrap gap-3">
                    <a 
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full border border-[#d1d5db] flex items-center justify-center text-brand-navy/60 hover:bg-[#0077b5] hover:text-white hover:border-[#0077b5] transition-all"
                      title="Share on LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a 
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(postTitle)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full border border-[#d1d5db] flex items-center justify-center text-brand-navy/60 hover:bg-black hover:text-white hover:border-black transition-all"
                      title="Share on X"
                    >
                      <X className="w-4 h-4" />
                    </a>
                    <a 
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full border border-[#d1d5db] flex items-center justify-center text-brand-navy/60 hover:bg-[#1877f2] hover:text-white hover:border-[#1877f2] transition-all"
                      title="Share on Facebook"
                    >
                      <Facebook className="w-4 h-4" />
                    </a>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(currentUrl);
                        setShowCopyFeedback(true);
                        setTimeout(() => setShowCopyFeedback(false), 2000);
                      }}
                      className="w-10 h-10 rounded-full border border-[#d1d5db] flex items-center justify-center text-brand-navy/60 hover:bg-brand-gold hover:text-white hover:border-brand-gold transition-all relative"
                      title="Copy Link"
                    >
                      {showCopyFeedback ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Related Posts Section */}
          {relatedPosts.length > 0 && (
            <div className="mt-40 pt-20 border-t border-brand-navy/5 blog-related-posts">
              <div className="flex flex-col items-center text-center justify-center mb-16 gap-6 max-w-2xl mx-auto">
                <div className="flex flex-col items-center w-full">
                  <div className="text-[10px] uppercase tracking-[0.4em] font-medium text-brand-gold mb-4 text-center">
                    {t('blogSection.continueReading')}
                  </div>
                  <h3 className="text-3xl md:text-5xl font-serif text-brand-navy text-center leading-tight">
                    {t('blogSection.relatedInsights')}
                  </h3>
                </div>
                <Link 
                  to="/blog"
                  className="text-[10px] uppercase tracking-widest font-black text-brand-gold border-b border-brand-gold/25 pb-2 hover:border-brand-gold transition-all inline-block tracking-[0.25em]"
                >
                  {t('blogSection.exploreAllPosts')}
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {relatedPosts.map((rPost) => (
                  <motion.article
                    key={rPost.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="group flex flex-col h-full bg-white/50 rounded-sm border border-transparent hover:border-brand-gold/20 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-brand-navy/5"
                  >
                    <Link to={`/blog/${getPostSlug(rPost)}`} className="flex flex-col h-full p-4">
                      <div className="aspect-[16/9] bg-gray-100 rounded-sm overflow-hidden mb-6 relative shrink-0">
                        <img 
                          src={rPost.image || null} 
                          alt={getTranslation(rPost.title, i18n.language, rPost.language)}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="space-y-4 flex flex-col flex-grow">
                        <div className="text-brand-gold text-[10px] uppercase tracking-widest font-bold">
                          {getCategoryTranslation(rPost.category, i18n.language, firestoreServices)}
                        </div>
                        <h4 className="text-2xl font-serif text-brand-navy group-hover:text-brand-gold transition-colors leading-tight">
                          {getTranslation(rPost.title, i18n.language, rPost.language)}
                        </h4>
                        <div className="flex items-center justify-between pt-6 mt-auto border-t border-brand-navy/5">
                          <div className="flex items-center gap-2 px-4 py-2 bg-brand-navy/5 group-hover:bg-brand-gold group-hover:text-white rounded-sm text-[10px] uppercase tracking-[0.2em] font-black text-brand-navy transition-all duration-300">
                            {t('common.readArticle')} <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                          </div>
                          {rPost.authorId && (
                            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-brand-navy/40">
                              <span className="opacity-50">{t('blogSection.by')}</span>
                              <span className="text-brand-navy">
                                {findTeamMember(rPost.authorId, teamMembers)?.name || 'Team Member'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
