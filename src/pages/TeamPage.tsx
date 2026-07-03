import React, { useEffect } from 'react';
import SEO from '../components/SEO';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Team from '../components/Team';
import Contact from '../components/Contact';

export default function TeamPage() {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-bg-deep">
      <SEO 
        title={t('nav.team')}
        description="Meet our expert team of legal professionals at Resen Legal & Consultancy. Excellence, diversity, and commitment to client success."
        keywords="legal team, expert lawyers, immigration lawyers, corporate law experts Turkey, Resen Legal team"
        canonical="/team"
      />
      
      <Navbar />

      <main className="pt-24">
        {/* Banner */}
        <div className="relative h-[40vh] min-h-[300px] w-full bg-brand-navy flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img 
              src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80" 
              alt="Team Background" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10 text-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] uppercase tracking-[0.4em] text-brand-gold mb-4 font-bold"
            >
              {t('teamPage.meetExperts')}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-serif text-white mb-6"
            >
              {t('teamPage.professionalTeam')}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="w-24 h-1 bg-brand-gold mx-auto"
            />
          </div>
        </div>

        <div className="pt-24">
          <Team />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-24 border-t border-brand-navy/5">
            <div className="space-y-6">
              <h2 className="text-3xl font-serif text-brand-navy">{t('teamPage.commitmentExcellence')}</h2>
              <p className="text-sm text-brand-navy/60 font-light leading-relaxed">
                {t('teamPage.commitmentText')}
              </p>
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-serif text-brand-navy">{t('teamPage.collaborativeApproach')}</h2>
              <p className="text-sm text-brand-navy/60 font-light leading-relaxed">
                {t('teamPage.collaborativeText')}
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
