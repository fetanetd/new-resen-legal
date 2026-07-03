import React, { useEffect } from 'react';
import SEO from '../components/SEO';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import About from '../components/About';
import Contact from '../components/Contact';

export default function AboutPage() {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-bg-deep">
      <SEO 
        title={t('nav.about')}
        description="Learn more about Resen Legal & Consultancy, our mission, values, and the expert legal team dedicated to providing excellence in legal practice."
        keywords="about Resen Legal, legal mission, legal values, expert lawyers, legal excellence Turkey"
        canonical="/about"
      />
      
      <Navbar />

      <main className="pt-24">
        {/* Banner */}
        <div className="relative h-[40vh] min-h-[300px] w-full bg-brand-navy flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img 
              src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80" 
              alt="Legal Background" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10 text-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] uppercase tracking-[0.4em] text-brand-gold mb-4 font-bold"
            >
              {t('about.excellenceIntegrity')}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-serif text-white mb-6"
            >
              {t('nav.about')}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="w-24 h-1 bg-brand-gold mx-auto"
            />
          </div>
        </div>

        <About />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12 border-t border-brand-navy/5">
            <div className="space-y-4">
              <h3 className="text-xl font-serif text-brand-navy">{t('about.ourMission')}</h3>
              <p className="text-sm text-brand-navy/60 font-light leading-relaxed">
                {t('about.missionText')}
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-serif text-brand-navy">{t('about.ourVision')}</h3>
              <p className="text-sm text-brand-navy/60 font-light leading-relaxed">
                {t('about.visionText')}
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-serif text-brand-navy">{t('about.ourValues')}</h3>
              <p className="text-sm text-brand-navy/60 font-light leading-relaxed">
                {t('about.valuesText')}
              </p>
            </div>
          </div>
        </div>

        <Contact />
      </main>

      <Footer />
    </div>
  );
}
