import React, { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, ChevronRight, X, Linkedin, Facebook } from 'lucide-react';
import { SERVICES, BLOG_POSTS } from '../constants/mockData';
import { getTranslation, getCategoryTranslation } from '../lib/utils';
import { useFirestoreCollection } from '../hooks/useFirestoreData';
import { BlogPost } from '../types';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();

  const { data: firestoreServices } = useFirestoreCollection<any>('services');
  const { data: firestoreBlog } = useFirestoreCollection<BlogPost>('blog');

  const services = useMemo(() => {
    const merged = [...firestoreServices];
    SERVICES.forEach(mockService => {
      if (!merged.find(s => s.id === mockService.id)) {
        merged.push(mockService);
      }
    });
    return merged;
  }, [firestoreServices]);

  const service = useMemo(() => {
    return services.find(s => s.id === id);
  }, [services, id]);

  const relatedPosts = useMemo(() => {
    if (!service) return [];
    const mergedPosts = [...firestoreBlog];
    BLOG_POSTS.forEach(mockPost => {
      if (!mergedPosts.find(p => p.id === mockPost.id)) {
        mergedPosts.push(mockPost);
      }
    });
    const activePosts = mergedPosts.filter(post => (post as any).status !== 'draft');
    
    const configuredCat = service.relatedCategory?.trim();
    
    let matched: BlogPost[] = [];
    if (configuredCat) {
      matched = activePosts.filter(post => {
        const cat = post.category || '';
        return cat.toLowerCase() === configuredCat.toLowerCase() || 
               cat.toLowerCase().includes(configuredCat.toLowerCase()) || 
               configuredCat.toLowerCase().includes(cat.toLowerCase());
      });
    }

    // If no exact matches found with configured category,
    // match with standard fallbacks (id or service's english title)
    if (matched.length === 0) {
      const serviceEnTitle = service.title?.en;
      matched = activePosts.filter(post => {
        const cat = post.category;
        return cat === id || (serviceEnTitle && cat === serviceEnTitle);
      });
    }

    // If still have fewer than 2 posts, add some fallback posts to fill up the slot
    if (matched.length < 2) {
      const remaining = activePosts.filter(post => !matched.find(m => m.id === post.id));
      const fillPosts = remaining.slice(0, 2 - matched.length);
      matched = [...matched, ...fillPosts];
    }
    
    return matched.slice(0, 2);
  }, [service, id, firestoreBlog]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center font-serif text-2xl">
        {t('serviceDetail.notFound')}
      </div>
    );
  }

  const title = getTranslation(service.title, i18n.language);
  const description = getTranslation(service.description, i18n.language);

  return (
    <div className="min-h-screen bg-bg-deep transition-colors duration-300">
      <SEO 
        title={title}
        description={description}
        keywords={`${title}, legal services, expert counsel, Resen Legal, ${i18n.language === 'tr' ? 'hukuki danışmanlık' : 'legal consultancy'}`}
        image="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80"
        canonical={`/service/${id}`}
      />
      <Navbar />
      
      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Breadcrumbs / Back button */}
          <Link to="/" className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-brand-navy transition-colors mb-12">
            <ArrowLeft className="w-4 h-4" />
            {t('serviceDetail.backToHome')}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-brand-gold text-xs uppercase tracking-[0.4em] font-medium mb-6">
                  {t('serviceDetail.expertPracticeArea')}
                </div>
                <h1 className="text-5xl md:text-7xl font-serif text-brand-navy mb-8 leading-tight">
                  {title}
                </h1>
                
                <div className="prose prose-lg text-gray-600 font-light leading-relaxed max-w-none">
                  <p className="text-xl mb-8">{description}</p>
                  <p className="mb-6 text-base">
                    {t('serviceDetail.introText')}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 mb-12">
                    {(service.bullets?.[i18n.language] || service.bullets?.['en'] || [
                      'Strategic Case Assessment',
                      'Regulatory Compliance Audit',
                      'High-Stakes Representation',
                      'Cross-Border Legal Architecture'
                    ]).map((feature) => (
                      <div key={feature} className="flex items-center gap-3 p-4 bg-card-bg border border-theme-border rounded-sm">
                        <CheckCircle2 className="w-5 h-5 text-brand-gold shrink-0" />
                        <span className="text-sm font-medium text-brand-navy">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <h3 className="text-3xl font-serif text-brand-navy mt-12 mb-6">{t('serviceDetail.ourMethodology')}</h3>
                  <p className="text-base">
                    {t('serviceDetail.methodologyText')}
                  </p>

                  <div className="flex items-center gap-4 mt-12 pt-8 border-t border-theme-border">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{t('serviceDetail.sharePracticeArea')}</span>
                    <div className="flex gap-2">
                      <a 
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Resen Legal - ${title}`)}&url=${encodeURIComponent(window.location.href)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-brand-offwhite text-brand-navy hover:bg-black hover:text-white rounded-sm transition-all duration-300"
                        title="Share on X"
                      >
                        <X className="w-4 h-4" />
                      </a>
                      <a 
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-brand-offwhite text-brand-navy hover:bg-brand-gold hover:text-white rounded-sm transition-all duration-300"
                        title="Share on LinkedIn"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                      <a 
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-brand-offwhite text-brand-navy hover:bg-brand-gold hover:text-white rounded-sm transition-all duration-300"
                        title="Share on Facebook"
                      >
                        <Facebook className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <aside className="space-y-12">
              <div className="bg-brand-navy p-10 rounded-sm text-white">
                <h3 className="text-2xl font-serif mb-6">{t('serviceDetail.beginConsultation')}</h3>
                <p className="text-white/60 text-sm font-light mb-8 leading-relaxed">
                  {t('serviceDetail.consultationSubtext', { service: title })}
                </p>
                <Link to="/#contact" className="w-full bg-brand-gold text-white font-bold uppercase tracking-widest text-xs py-4 flex items-center justify-center gap-2 hover:bg-brand-gold/90 transition-all">
                  {t('serviceDetail.discussMatter')} <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {relatedPosts.length > 0 && (
                <div>
                  <h3 className="text-xl font-serif text-brand-navy mb-6 pb-4 border-b border-theme-border">
                    {t('serviceDetail.relatedInsights')}
                  </h3>
                  <div className="space-y-8">
                    {relatedPosts.map(post => (
                      <Link key={post.id} to={`/blog`} className="group block">
                        <div className="text-brand-gold text-[10px] uppercase tracking-widest font-bold mb-2">
                          {getCategoryTranslation(post.category, i18n.language, firestoreServices)}
                        </div>
                        <h4 className="text-lg font-serif text-brand-navy group-hover:text-brand-gold transition-colors leading-snug">
                          {getTranslation(post.title, i18n.language, post.language)}
                        </h4>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
