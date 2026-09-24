import React, { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, ChevronRight, X, Linkedin, Facebook, BookOpen, AlertTriangle, Lightbulb, HelpCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { SERVICES, BLOG_POSTS } from '../constants/mockData';
import { getTranslation, getCategoryTranslation } from '../lib/utils';
import { useFirestoreCollection } from '../hooks/useFirestoreData';
import { BlogPost } from '../types';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { PRIORITY_SERVICES_DETAILED_CONTENT } from '../constants/serviceDetailedContent';

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

  const priorityDetail = useMemo(() => {
    if (!id) return null;
    return PRIORITY_SERVICES_DETAILED_CONTENT[id] || null;
  }, [id]);

  const lang = useMemo(() => {
    return i18n.language === 'tr' ? 'tr' : 'en';
  }, [i18n.language]);

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
    
    return matched.slice(0, 4);
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
    <div className="min-h-screen bg-bg-deep transition-colors duration-300 font-sans">
      <SEO 
        title={title}
        description={priorityDetail ? priorityDetail.leadSummary[lang].slice(0, 160) : description}
        keywords={priorityDetail ? `${title}, ${priorityDetail.metaKeywords.join(', ')}` : `${title}, legal services, expert counsel, Resen Legal, ${i18n.language === 'tr' ? 'hukuki danışmanlık' : 'legal consultancy'}`}
        image="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80"
        canonical={`/service/${id}/`}
      />
      <Navbar />
      
      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Breadcrumbs / Back button */}
          <Link to="/" className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-brand-navy transition-colors mb-12">
            <ArrowLeft className="w-4 h-4" />
            {t('serviceDetail.backToHome')}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-brand-gold text-xs uppercase tracking-[0.4em] font-medium mb-4">
                  {t('serviceDetail.expertPracticeArea')}
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-brand-navy mb-8 leading-tight">
                  {title}
                </h1>
                
                {/* Lead Summary Section */}
                <div className="bg-white border-l-4 border-brand-gold p-6 sm:p-8 rounded-sm shadow-xs mb-10 text-left">
                  <p className="text-lg sm:text-xl font-serif text-brand-navy leading-relaxed italic m-0">
                    {priorityDetail ? priorityDetail.leadSummary[lang] : description}
                  </p>
                </div>

                {/* Core Practice Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                  {(service.bullets?.[i18n.language] || service.bullets?.['en'] || [
                    'Strategic Case Assessment',
                    'Regulatory Compliance Audit',
                    'High-Stakes Representation',
                    'Cross-Border Legal Architecture'
                  ]).map((feature) => (
                    <div key={feature} className="flex items-center gap-3 p-4 bg-white border border-brand-navy/5 rounded-sm shadow-2xs">
                      <CheckCircle2 className="w-5 h-5 text-brand-gold shrink-0" />
                      <span className="text-sm font-medium text-brand-navy">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Priority In-Depth Extended Sections (900-1,500 words) */}
                {priorityDetail ? (
                  <div className="space-y-12 text-left">
                    {priorityDetail.sections[lang].map((section, idx) => (
                      <section key={idx} className="bg-white p-7 sm:p-9 border border-brand-navy/5 rounded-sm shadow-xs space-y-6">
                        <div className="border-b border-brand-navy/10 pb-4">
                          <h2 className="text-2xl sm:text-3xl font-serif text-brand-navy font-bold tracking-tight">
                            {section.title}
                          </h2>
                          {section.subtitle && (
                            <p className="text-xs uppercase tracking-widest font-semibold text-brand-gold mt-1.5">
                              {section.subtitle}
                            </p>
                          )}
                        </div>

                        <div className="space-y-4 text-brand-navy/85 font-light text-[15px] sm:text-[16px] leading-relaxed">
                          {section.paragraphs.map((p, pIdx) => (
                            <p key={pIdx} className="m-0">
                              {p}
                            </p>
                          ))}
                        </div>

                        {section.calloutBox && (
                          <div className={`p-5 rounded-sm border flex gap-3.5 ${
                            section.calloutBox.type === 'warning'
                              ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                              : section.calloutBox.type === 'strategy'
                              ? 'bg-blue-50/70 border-blue-200 text-brand-navy'
                              : 'bg-[#faf9f6] border-brand-gold/30 text-brand-navy'
                          }`}>
                            <div className="shrink-0 mt-0.5">
                              {section.calloutBox.type === 'warning' ? (
                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                              ) : section.calloutBox.type === 'strategy' ? (
                                <ShieldCheck className="w-5 h-5 text-blue-600" />
                              ) : (
                                <Lightbulb className="w-5 h-5 text-brand-gold" />
                              )}
                            </div>
                            <div>
                              <h5 className="text-xs font-bold uppercase tracking-wider mb-1">
                                {section.calloutBox.title}
                              </h5>
                              <p className="text-xs sm:text-sm leading-relaxed opacity-90 m-0">
                                {section.calloutBox.content}
                              </p>
                            </div>
                          </div>
                        )}

                        {section.bulletPoints && section.bulletPoints.length > 0 && (
                          <div className="grid grid-cols-1 gap-3 pt-2">
                            {section.bulletPoints.map((bp, bpIdx) => (
                              <div key={bpIdx} className="p-3.5 bg-brand-offwhite/50 border border-brand-navy/5 rounded-sm flex items-start gap-3">
                                <span className="text-brand-gold font-bold text-sm mt-0.5">▪</span>
                                <div>
                                  <div className="text-xs font-bold text-brand-navy flex items-center gap-2">
                                    <span>{bp.title}</span>
                                    {bp.statuteRef && (
                                      <span className="text-[9px] font-mono font-normal text-brand-gold bg-brand-gold/10 px-1.5 py-0.5 rounded-xs">
                                        {bp.statuteRef}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-brand-navy/70 leading-relaxed mt-1 m-0">
                                    {bp.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </section>
                    ))}

                    {/* Curated Service-Specific Related Research Articles */}
                    {priorityDetail.relatedArticles[lang].length > 0 && (
                      <div className="mt-14 pt-10 border-t border-brand-navy/10">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <div className="text-brand-gold text-[10px] uppercase tracking-widest font-extrabold mb-1">
                              {lang === 'tr' ? 'HUKUKİ REHBERLER & MAKALELER' : 'CONNECTED LEGAL RESEARCH'}
                            </div>
                            <h3 className="text-2xl font-serif text-brand-navy font-bold">
                              {lang === 'tr' ? 'Bu Alanla İlgili Derinlemesine İncelemelerimiz' : 'Specialized Publications & Guides for this Practice'}
                            </h3>
                          </div>
                          <Link 
                            to="/blog/"
                            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-gold hover:text-brand-navy transition-colors"
                          >
                            <span>{lang === 'tr' ? 'Tüm Makaleler' : 'All Articles'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {priorityDetail.relatedArticles[lang].map((art) => (
                            <Link 
                              key={art.slug} 
                              to={`/blog/${art.slug}/`}
                              className="group block p-6 bg-white border border-brand-navy/10 rounded-sm shadow-xs hover:border-brand-gold hover:shadow-md transition-all duration-300"
                            >
                              <span className="inline-block px-2.5 py-0.5 text-[9px] uppercase tracking-wider font-extrabold text-brand-gold bg-brand-gold/10 rounded-xs mb-3">
                                {art.badge}
                              </span>
                              <h4 className="text-base font-serif font-bold text-brand-navy group-hover:text-brand-gold transition-colors leading-snug mb-2">
                                {art.title}
                              </h4>
                              <p className="text-xs text-brand-navy/60 font-light leading-relaxed mb-4 line-clamp-2">
                                {art.description}
                              </p>
                              <span className="text-[10px] uppercase tracking-widest font-bold text-brand-gold flex items-center gap-1">
                                {lang === 'tr' ? 'Makaleyi İncele' : 'Read Article'} →
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Frequently Addressed Legal Questions */}
                    {priorityDetail.faqList[lang].length > 0 && (
                      <div className="mt-14 pt-10 border-t border-brand-navy/10">
                        <div className="text-brand-gold text-[10px] uppercase tracking-widest font-extrabold mb-1">
                          {lang === 'tr' ? 'HUKUKİ SSS' : 'LEGAL FAQ'}
                        </div>
                        <h3 className="text-2xl font-serif text-brand-navy font-bold mb-6">
                          {lang === 'tr' ? 'Sıkça Sorulan Hukuki Sorular' : 'Frequently Addressed Matters'}
                        </h3>
                        <div className="space-y-4">
                          {priorityDetail.faqList[lang].map((faq, fIdx) => (
                            <div key={fIdx} className="p-6 bg-white border border-brand-navy/10 rounded-sm shadow-2xs">
                              <h4 className="text-sm sm:text-base font-bold text-brand-navy flex items-start gap-2.5 mb-2">
                                <HelpCircle className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                                <span>{faq.question}</span>
                              </h4>
                              <p className="text-xs sm:text-sm text-brand-navy/70 leading-relaxed font-light pl-6.5 m-0">
                                {faq.answer}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Standard fallback layout for general services */
                  <div className="prose prose-lg text-gray-600 font-light leading-relaxed max-w-none text-left">
                    <p className="mb-6 text-base">{t('serviceDetail.introText')}</p>
                    <h3 className="text-3xl font-serif text-brand-navy mt-12 mb-6">{t('serviceDetail.ourMethodology')}</h3>
                    <p className="text-base">{t('serviceDetail.methodologyText')}</p>
                  </div>
                )}

                {/* Methodology Box */}
                <div className="mt-14 bg-white p-8 border border-brand-navy/10 rounded-sm shadow-xs text-left">
                  <h3 className="text-2xl font-serif text-brand-navy mb-4 font-bold">
                    {t('serviceDetail.ourMethodology')}
                  </h3>
                  <p className="text-sm sm:text-base text-brand-navy/75 font-light leading-relaxed mb-4">
                    {t('serviceDetail.methodologyText')}
                  </p>
                  <p className="text-xs text-brand-navy/55 font-light leading-relaxed">
                    {lang === 'tr' 
                      ? 'Resen Hukuk, her müvekkil dosyasında çok dilli uzman kadrosu ile mevzuatın ötesine geçerek yargı içtihatlarını ve idari dinamikleri lehe sonuç alacak şekilde koordine eder.' 
                      : 'Resen Legal coordinates judicial jurisprudence and administrative enforcement with cross-border precision to achieve decisive client outcomes.'}
                  </p>
                </div>

                {/* Social Share Bar */}
                <div className="flex items-center gap-4 mt-12 pt-8 border-t border-theme-border text-left">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                    {t('serviceDetail.sharePracticeArea')}
                  </span>
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
              </motion.div>
            </div>

            {/* Sidebar Column */}
            <aside className="lg:col-span-4 space-y-8 sticky top-28 text-left">
              {/* Consultation Box */}
              <div className="bg-brand-navy p-8 sm:p-10 rounded-sm text-white shadow-md">
                <div className="text-[10px] uppercase tracking-[0.25em] text-brand-gold font-black mb-3">
                  {lang === 'tr' ? 'DOĞRUDAN DANIŞMANLIK' : 'DIRECT COUNSEL'}
                </div>
                <h3 className="text-2xl font-serif mb-4 font-bold">
                  {t('serviceDetail.beginConsultation')}
                </h3>
                <p className="text-white/70 text-xs sm:text-sm font-light mb-8 leading-relaxed">
                  {t('serviceDetail.consultationSubtext', { service: title })}
                </p>
                <Link 
                  to="/#contact" 
                  className="w-full bg-brand-gold text-white font-bold uppercase tracking-widest text-xs py-4 px-6 flex items-center justify-center gap-2 hover:bg-brand-gold/90 transition-all rounded-xs shadow-sm hover:shadow-md"
                >
                  {t('serviceDetail.discussMatter')} <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Related Blog Posts Sidebar */}
              {relatedPosts.length > 0 && (
                <div className="bg-white p-6 sm:p-8 border border-brand-navy/10 rounded-sm shadow-xs">
                  <div className="flex items-center gap-2 text-brand-gold mb-4 pb-3 border-b border-brand-navy/5">
                    <BookOpen className="w-4 h-4" />
                    <h3 className="text-xs uppercase tracking-widest font-black text-brand-navy">
                      {t('serviceDetail.relatedInsights')}
                    </h3>
                  </div>
                  <div className="space-y-5">
                    {relatedPosts.map(post => {
                      const postSlug = (post as any).slug || post.id;
                      return (
                        <Link key={post.id} to={`/blog/${postSlug}/`} className="group block">
                          <div className="text-brand-gold text-[9px] uppercase tracking-widest font-bold mb-1">
                            {getCategoryTranslation(post.category, i18n.language, firestoreServices)}
                          </div>
                          <h4 className="text-sm font-serif font-bold text-brand-navy group-hover:text-brand-gold transition-colors leading-snug">
                            {getTranslation(post.title, i18n.language, post.language)}
                          </h4>
                          <span className="text-[10px] text-gray-400 font-mono mt-1 block">
                            {post.date}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Other Practice Areas List */}
              <div className="bg-white p-6 sm:p-8 border border-brand-navy/10 rounded-sm shadow-xs">
                <div className="text-[10px] uppercase tracking-[0.2em] text-brand-gold font-bold mb-4">
                  {lang === 'tr' ? 'DİĞER UZMANLIK ALANLARIMIZ' : 'OTHER PRACTICE AREAS'}
                </div>
                <ul className="space-y-3 text-xs sm:text-sm">
                  {services
                    .filter(s => s.id !== id)
                    .slice(0, 6)
                    .map(s => (
                      <li key={s.id}>
                        <Link 
                          to={`/service/${s.id}/`}
                          className="text-brand-navy/80 hover:text-brand-gold font-medium transition-colors flex items-center justify-between py-1 border-b border-brand-navy/5"
                        >
                          <span>{getTranslation(s.title, i18n.language)}</span>
                          <span className="text-brand-gold text-xs">→</span>
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
