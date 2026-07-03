import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  const { t, i18n } = useTranslation();

  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-20 inset-inline-end-0 w-1/2 h-full bg-brand-navy/5 -skew-x-12 -z-10" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: i18n.dir() === 'rtl' ? 30 : -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            className="text-xs uppercase tracking-[0.4em] font-medium text-brand-gold mb-6"
          >
            Resen Legal Consultancy
          </motion.div>
          <h1 className="text-4xl sm:text-5xl md:text-8xl font-serif leading-[0.95] md:leading-[0.9] text-brand-navy mb-8 break-words">
            {t('hero.slogan')}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-lg mb-10 leading-relaxed font-light">
            {t('hero.subtext')}
          </p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-4"
          >
            <motion.button 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              onClick={() => {
                const element = document.getElementById('contact');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.location.href = '/#contact';
                }
              }}
              className="bg-brand-navy text-white px-10 py-5 rounded-sm flex items-center justify-center gap-3 group hover:brightness-110 transition-all cursor-pointer shadow-xl shadow-brand-navy/10 font-medium tracking-wide w-full sm:w-72"
            >
              {t('hero.cta')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 ltr:group-hover:translate-x-1.5 rtl:group-hover:-translate-x-1.5 transition-transform duration-300" />
            </motion.button>
            <Link 
              to="/services"
              className="border border-brand-gold px-10 py-5 rounded-sm text-brand-navy hover:bg-brand-gold/5 transition-all cursor-pointer font-medium tracking-wide w-full sm:w-72 flex items-center justify-center"
            >
              <motion.span
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {t('hero.secondaryCta')}
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative"
        >
          <div className="aspect-video md:aspect-[4/5] bg-gray-100 overflow-hidden rounded-sm relative shadow-2xl shadow-brand-navy/20">
            <img 
              src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2000&auto=format&fit=crop" 
              alt="Legal Library"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="w-full h-full object-cover object-center"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/40 to-transparent" />
          </div>
          {/* Floating Accent */}
          <div className="absolute bottom-0 inset-inline-start-0 bg-brand-gold py-3 px-4 md:py-4 md:px-6 rounded-sm shadow-2xl text-center min-w-[180px] sm:min-w-[220px] hidden sm:block">
            <div className="text-white font-serif italic text-lg md:text-2xl text-center">
              {t('hero.floatingAccent')}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
