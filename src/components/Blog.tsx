import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Calendar, Plus, Pencil, Trash2, Filter, ChevronDown, SortAsc, X, ChevronLeft, ChevronRight, LayoutDashboard, Shield } from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { isAdminEmail } from '../constants/auth';
import { BLOG_POSTS as MOCK_BLOG, TEAM as MOCK_TEAM } from '../constants/mockData';
import { getTranslation, getCategoryTranslation, getPostSlug, findTeamMember } from '../lib/utils';
import { useFirestoreCollection } from '../hooks/useFirestoreData';
import { BlogPost, TeamMember } from '../types';
import BlogForm from './BlogForm';
import { useSearchParams } from 'react-router-dom';

type SortOption = 'newest' | 'oldest' | 'category' | 'language';

const POSTS_PER_PAGE = 9;

export default function Blog() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const isAdminSession = searchParams.get('admin') === 'true';
  const { data: firestoreBlog, loading: isBlogLoading } = useFirestoreCollection<BlogPost>('blog');
  const { data: firestoreTeam } = useFirestoreCollection<TeamMember>('team');
  const { data: firestoreServices } = useFirestoreCollection<any>('services');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, sortBy]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const isAdmin = isAdminEmail(user?.email);
  
  const allPosts = useMemo(() => {
    // Exclude draft publications from client-facing lists
    return firestoreBlog.filter(post => (post as any).status !== 'draft');
  }, [firestoreBlog]);

  const categories = useMemo(() => {
    const cats = new Set(allPosts.map(p => p.category));
    return Array.from(cats).sort();
  }, [allPosts]);

  const filteredAndSortedPosts = useMemo(() => {
    return [...allPosts]
      .filter(post => selectedCategories.length === 0 || selectedCategories.includes(post.category))
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'category') return a.category.localeCompare(b.category);
        if (sortBy === 'language') {
          const langA = (a.language || 'English').toLowerCase();
          const langB = (b.language || 'English').toLowerCase();
          if (langA !== langB) {
            return langA.localeCompare(langB);
          }
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        return 0;
      });
  }, [allPosts, selectedCategories, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredAndSortedPosts.slice(start, start + POSTS_PER_PAGE);
  }, [filteredAndSortedPosts, currentPage]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => setSelectedCategories([]);

  const handleDelete = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    if (!window.confirm(t('blogSection.deleteConfirm'))) return;

    try {
      await deleteDoc(doc(db, 'blog', postId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `blog/${postId}`);
    }
  };

  const handleEdit = (e: React.MouseEvent, post: BlogPost) => {
    e.stopPropagation();
    setEditingPost(post);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingPost(null);
    setIsFormOpen(true);
  };

  return (
    <section id="blog" className="pt-10 pb-16 bg-bg-deep transition-colors duration-300">
      {isAdmin && isAdminSession && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-brand-gold text-white px-6 py-3 flex items-center justify-between shadow-2xl animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-4">
            <Shield className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-black">Admin Editorial Session Active</span>
          </div>
          <Link 
            to="/resen-gate"
            className="bg-brand-navy text-white px-4 py-2 text-[9px] uppercase tracking-widest font-black rounded-sm flex items-center gap-2 hover:bg-white hover:text-brand-navy transition-all"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Exit to Management Portal
          </Link>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 gap-8">
            <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.6 }}
              className="text-xs uppercase tracking-[0.4em] font-medium text-brand-gold mb-4"
            >
              {t('blogSection.tagline')}
            </motion.div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-brand-navy leading-[1.1]">
              {t('blogSection.title')}
            </h2>
          </div>

          <div className="flex flex-wrap gap-4 w-full lg:w-auto items-center">
            {isAdmin && isAdminSession && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4"
              >
                <Link
                  to="/resen-gate"
                  className="bg-brand-gold text-white px-6 py-4 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-brand-navy transition-all shadow-lg"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Back to Admin
                </Link>
                <div className="w-[1px] h-8 bg-brand-navy/10 hidden md:block" />
              </motion.div>
            )}
            
            {isAdmin && (
              <motion.button
                initial={{ opacity: 0, x: i18n.dir() === 'rtl' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={handleAdd}
                className="bg-brand-navy text-white px-6 py-4 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-brand-gold transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                {t('blogSection.addNewPost')}
              </motion.button>
            )}
          </div>
        </div>

        {/* Filters and Sorting Controls */}
        <div className="flex justify-end mb-8 bg-white/30 backdrop-blur-sm p-4 rounded-sm border border-theme-border/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-brand-navy opacity-40">
              <SortAsc className="w-3 h-3" />
              {t('blogSection.sortBy')}
            </div>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent border-none text-[10px] uppercase tracking-widest font-bold text-brand-navy focus:ring-0 cursor-pointer hover:text-brand-gold transition-colors"
            >
              <option value="newest">{t('blogSection.newest')}</option>
              <option value="oldest">{t('blogSection.oldest')}</option>
              <option value="category">{t('blogSection.categoryAZ')}</option>
              <option value="language">{t('blogSection.languageSort')}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 min-h-[400px]">
          {isBlogLoading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="bg-white/50 border border-brand-navy/5 p-8 animate-pulse flex flex-col h-[320px]">
                <div className="h-4 w-24 bg-brand-navy/10 rounded mb-4" />
                <div className="h-6 w-3/4 bg-brand-navy/10 rounded mb-3" />
                <div className="h-4 w-full bg-brand-navy/10 rounded mb-2" />
                <div className="h-4 w-2/3 bg-brand-navy/10 rounded mb-6" />
                <div className="mt-auto h-8 w-28 bg-brand-navy/10 rounded" />
              </div>
            ))
          ) : paginatedPosts.length === 0 ? (
            <div className="col-span-full text-center py-16 text-brand-navy/60 font-serif">
              {t('blogSection.noPosts', 'Henüz yayınlanmış bir makale bulunmamaktadır.')}
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {paginatedPosts.map((post) => (
                <motion.article
                key={post.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="group relative flex flex-col h-full bg-white border border-brand-navy/5 p-8 hover:shadow-2xl hover:shadow-brand-navy/5 transition-all duration-500 overflow-hidden cursor-pointer"
              >
                {isAdmin && (
                  <div className="absolute top-6 inset-inline-end-6 flex gap-2 z-20">
                    <button 
                      onClick={(e) => handleEdit(e, post)}
                      className="bg-white/90 backdrop-blur-sm p-2 rounded-full text-brand-navy hover:text-brand-gold transition-colors shadow-lg cursor-pointer border border-brand-navy/5"
                      title="Edit Post"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(e, post.id)}
                      className="bg-white/90 backdrop-blur-sm p-2 rounded-full text-red-600 hover:text-red-700 transition-colors shadow-lg cursor-pointer border border-brand-navy/5"
                      title="Delete Post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                <Link to={`/blog/${getPostSlug(post)}`} className="flex flex-col h-full cursor-pointer">
                  {/* Floating Category & Language Badge */}
                  <div className="absolute top-0 inset-inline-start-0 flex items-stretch z-10 font-sans">
                    <span className="bg-brand-gold text-white px-3 py-1.5 text-[8px] sm:text-[9px] md:text-[9.5px] leading-none uppercase tracking-[0.1em] font-black rounded-br-sm shadow-lg group-hover:bg-brand-navy transition-colors whitespace-nowrap">
                      {getCategoryTranslation(post.category, i18n.language, firestoreServices)}
                    </span>
                    <span className="bg-brand-navy text-white px-2 py-1.5 text-[8px] sm:text-[9px] md:text-[9.5px] leading-none font-bold shadow-lg uppercase tracking-[0.1em] rounded-br-sm ms-1 shrink-0">
                      {post.language ? post.language.toUpperCase() : 'TR'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold text-brand-navy/40 mb-3 mt-2">
                    <Calendar className="w-3 h-3 text-brand-gold" />
                    {new Date(post.date).toLocaleDateString(i18n.language === 'en' ? 'en-GB' : i18n.language, { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>

                  <h3 className="text-xl font-serif text-brand-navy mb-2 group-hover:text-brand-gold transition-colors leading-relaxed line-clamp-2">
                    {getTranslation(post.title, i18n.language, post.language)}
                  </h3>

                  <p className="text-sm text-brand-navy/60 font-light leading-relaxed line-clamp-3 mb-4 flex-grow text-justify rtl:text-right">
                    {getTranslation(post.excerpt, i18n.language, post.language)}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-brand-navy/5 gap-x-8">
                    <div className="flex items-center gap-2 px-4 py-2 bg-brand-navy/5 group-hover:bg-brand-gold group-hover:text-white rounded-sm text-[10px] uppercase tracking-[0.2em] font-black text-brand-navy transition-all duration-300">
                      {t('common.readArticle')}
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1.5 rtl:group-hover:-translate-x-1.5 transition-transform duration-300" />
                    </div>
                    
                    {post.authorId && (
                      <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold text-brand-navy/40">
                        <span className="opacity-50">{t('blogSection.by', 'By')}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-brand-navy border-b border-transparent group-hover:border-brand-gold/30 transition-colors">
                            {findTeamMember(post.authorId, teamMembers)?.name?.split(' ')[0] || 'Team'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.article>
            ))}
          </AnimatePresence>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-4">
            <button
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage(p => p - 1);
                document.getElementById('blog')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="p-3 border border-brand-navy/10 rounded-full text-brand-navy hover:text-brand-gold hover:border-brand-gold transition-all disabled:opacity-20 disabled:cursor-not-allowed group"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 rtl:rotate-180 transition-transform" />
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                // Show max 5 page numbers, with logic for current page position
                if (
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => {
                        setCurrentPage(page);
                        document.getElementById('blog')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`w-10 h-10 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all ${
                        currentPage === page 
                          ? 'bg-brand-gold text-white shadow-lg' 
                          : 'bg-white text-brand-navy/60 hover:bg-brand-navy hover:text-white'
                      }`}
                    >
                      {page}
                    </button>
                  );
                }
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="text-brand-navy/20">...</span>;
                }
                return null;
              })}
            </div>

            <button
              disabled={currentPage === totalPages}
              onClick={() => {
                setCurrentPage(p => p + 1);
                document.getElementById('blog')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="p-3 border border-brand-navy/10 rounded-full text-brand-navy hover:text-brand-gold hover:border-brand-gold transition-all disabled:opacity-20 disabled:cursor-not-allowed group"
            >
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
      <BlogForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        initialData={editingPost}
      />
    </section>
  );
}
