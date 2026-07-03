import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Blog from '../components/Blog';
import { motion } from 'motion/react';

export default function BlogPage() {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-bg-deep">
      <SEO 
        title={t('nav.blog')}
        description="Stay updated with the latest legal insights, advisory, and professional commentary from our experts at Resen Legal & Consultancy."
        keywords="legal blog, law updates, legal insights, immigration news, corporate law articles, GDPR advice"
        image="https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80"
        canonical="/blog"
      />
      <Navbar />
      
      <main className="pt-24">
        {/* Page Header */}
        <div className="bg-brand-navy py-12 px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white leading-tight">
              {t('nav.blog')}
            </h1>
            <div className="w-20 h-1 bg-brand-gold mx-auto" />
            <p className="text-brand-offwhite/60 text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto">
              {t('blogPage.subtitle')}
            </p>
          </motion.div>
        </div>

        <Blog />
      </main>

      <Footer />
    </div>
  );
}
