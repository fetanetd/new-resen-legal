import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BlogPost, TeamMember } from '../types';
import { useFirestoreCollection } from '../hooks/useFirestoreData';
import { BLOG_POSTS as MOCK_BLOG, TEAM as MOCK_TEAM } from '../constants/mockData';
import { getTranslation, getPostSlug, getCategoryTranslation, findTeamMember } from '../lib/utils';

export default function BlogCarousel() {
  const { t, i18n } = useTranslation();
  const { data: firestoreTeam } = useFirestoreCollection<TeamMember>('team');
  const { data: firestoreBlog } = useFirestoreCollection<BlogPost>('blog');
  const { data: firestoreServices } = useFirestoreCollection<any>('services');
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const posts = useMemo(() => {
    const merged = [...firestoreBlog];
    MOCK_BLOG.forEach(mockPost => {
      if (!merged.find(p => p.id === mockPost.id)) {
        merged.push(mockPost);
      }
    });
    // Filter out draft publications
    const published = merged.filter(post => (post as any).status !== 'draft');
    return [...published].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);
  }, [firestoreBlog]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1 >= posts.length ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 < 0 ? posts.length - 1 : prev - 1));
  };

  if (posts.length === 0) return null;

  return (
    <section id="blog-preview" className="py-24 bg-bg-deep overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 text-brand-gold"
            >
              <div className="w-12 h-[1px] bg-brand-gold" />
              <span className="text-xs uppercase tracking-[0.3em] font-bold">{t('nav.blog')}</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-serif text-brand-navy leading-tight">
              Latest <span className="text-brand-gold italic">Insights</span>
            </h2>
          </div>

          <Link 
            to="/blog"
            className="group flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold text-brand-navy/60 hover:text-brand-gold transition-all"
          >
            Explore All Posts
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="relative">
          {/* Controls */}
          <div className="absolute -top-12 inset-inline-end-0 flex gap-2 rtl:flex-row-reverse">
            <button 
              onClick={prevSlide}
              className="p-2 border border-brand-navy/10 hover:border-brand-gold hover:text-brand-gold transition-all text-brand-navy/40 rtl:rotate-180"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextSlide}
              className="p-2 border border-brand-navy/10 hover:border-brand-gold hover:text-brand-gold transition-all text-brand-navy/40 rtl:rotate-180"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="relative h-auto min-h-[450px]">
             <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: i18n.dir() === 'rtl' ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: i18n.dir() === 'rtl' ? 50 : -50 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 h-full"
              >
                {/* We show up to 3 unique posts */}
                {posts.length > 0 && Array.from({ length: Math.min(posts.length, 3) }).map((_, offset) => {
                  const idx = (currentIndex + offset) % posts.length;
                  const post = posts[idx];
                  if (!post) return null;

                  return (
                    <Link 
                      key={`${post.id}-${offset}`}
                      to={`/blog/${getPostSlug(post)}`}
                      className={`group flex flex-col h-full bg-white border border-brand-navy/5 p-8 hover:shadow-2xl hover:shadow-brand-navy/5 transition-all duration-500 overflow-hidden relative cursor-pointer ${
                        offset > 0 ? 'hidden md:flex' : ''
                      } ${offset > 1 ? 'hidden lg:flex' : ''}`}
                    >
                      {/* Floating Category Badge */}
                      <div className="absolute top-0 inset-inline-start-0 z-20">
                        <span className="bg-brand-gold text-white px-4 py-2 text-[9px] uppercase tracking-[0.2em] font-black rounded-br-sm shadow-lg group-hover:bg-brand-navy transition-colors">
                          {getCategoryTranslation(post.category, i18n.language, firestoreServices)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold text-brand-navy/40 mb-6">
                        <Calendar className="w-3 h-3 text-brand-gold" />
                        {new Date(post.date).toLocaleDateString(i18n.language === 'en' ? 'en-GB' : i18n.language, { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>

                      <h3 className="text-xl font-serif text-brand-navy mb-4 group-hover:text-brand-gold transition-colors leading-relaxed line-clamp-2">
                        {getTranslation(post.title, i18n.language, post.language)}
                      </h3>

                      <p className="text-sm text-brand-navy/60 font-light leading-relaxed line-clamp-3 mb-8 flex-grow text-justify rtl:text-right">
                        {getTranslation(post.excerpt, i18n.language, post.language)}
                      </p>

                      <div className="flex items-center justify-between mt-auto pt-6 border-t border-brand-navy/5 gap-x-8">
                        <div className="flex items-center gap-2 px-4 py-2 bg-brand-navy/5 group-hover:bg-brand-gold group-hover:text-white rounded-sm text-[10px] uppercase tracking-[0.2em] font-black text-brand-navy transition-all duration-300">
                          {t('common.readArticle')}
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                        </div>
                        {post.authorId && (
                          <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold text-brand-navy/40">
                            <span className="opacity-50">{t('blogSection.by', 'By')}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-brand-navy border-b border-transparent group-hover:border-brand-gold/30 transition-colors">
                                {findTeamMember(post.authorId, teamMembers)?.name || 'Team Member'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </motion.div>
             </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
