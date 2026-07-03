import React, { useEffect } from 'react';
import SEO from '../components/SEO';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Services from '../components/Services';
import Contact from '../components/Contact';

export default function ServicesPage() {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-bg-deep">
      <SEO 
        title={t('nav.services')}
        description="Explore our wide range of specialized legal services including immigration law, corporate consultancy, intellectual property, and GDPR compliance."
        keywords="legal services, immigration consultancy, corporate law, GDPR compliance, intellectual property law Turkey"
        canonical="/services"
      />
      
      <Navbar />

      <main className="pt-24">
        {/* Banner */}
        <div className="relative h-[40vh] min-h-[300px] w-full bg-brand-navy flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img 
              src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80" 
              alt="Services Background" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10 text-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] uppercase tracking-[0.4em] text-brand-gold mb-4 font-bold"
            >
              {t('servicesPage.specializedExpertise')}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-serif text-white mb-6"
            >
              {t('nav.services')}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="w-24 h-1 bg-brand-gold mx-auto"
            />
          </div>
        </div>

        <Services />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pb-24">
          <div className="bg-brand-navy p-12 rounded-sm text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl font-serif text-white">{t('servicesPage.customSolutionTitle')}</h2>
              <p className="text-white/60 max-w-2xl mx-auto font-light">
                {t('servicesPage.customSolutionText')}
              </p>
              <div className="pt-4">
                <button 
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-brand-gold text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-white hover:text-brand-navy transition-all"
                >
                  {t('servicesPage.scheduleConsultation')}
                </button>
              </div>
            </div>
          </div>
        </div>

        <Contact />
      </main>

      <Footer />
    </div>
  );
}
