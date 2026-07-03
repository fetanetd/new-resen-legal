import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { History, Target, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

export default function About() {
  const { t, i18n } = useTranslation();

  const values = [
    {
      icon: <History className="w-6 h-6 text-brand-gold" />,
      title: t('about.history.title'),
      description: t('about.history.text')
    },
    {
      icon: <Target className="w-6 h-6 text-brand-gold" />,
      title: t('about.mission.title'),
      description: t('about.mission.text')
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-brand-gold" />,
      title: t('about.values.title'),
      description: t('about.values.text')
    }
  ];

  return (
    <section id="about" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: i18n.dir() === 'rtl' ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-xs uppercase tracking-[0.4em] font-medium text-brand-gold mb-6">
              {t('about.tagline', 'Excellence in Legal Practice')}
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-brand-navy mb-8 leading-tight">
              {t('about.title', 'Crafting legal solutions with a heritage of excellence and a vision for the future.')}
            </h2>
            <p className="text-gray-600 font-light text-lg mb-12 leading-relaxed">
              {t('about.subtitle', 'At Resen Legal & Consultancy, we bridge the gap between tradition and innovation. Our firm is built on a foundation of rigorous legal analysis and a commitment to personalized service.')}
            </p>

            <div className="grid grid-cols-1 gap-8">
              {values.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex gap-6 items-start group"
                >
                  <div className="p-3 bg-brand-navy/5 rounded-sm group-hover:bg-brand-gold/10 transition-colors duration-300">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-serif text-brand-navy mb-2">{item.title}</h4>
                    <p className="text-gray-500 font-light text-sm leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className={cn(
              "aspect-[3/4] bg-gray-100 overflow-hidden rounded-sm relative shadow-2xl shadow-brand-navy/10 transform transition-transform duration-1000",
              i18n.dir() === 'rtl' ? "-rotate-1 md:-rotate-3" : "rotate-1 md:rotate-3"
            )}>
              <img 
                src="https://res.cloudinary.com/dlrsifk2y/image/upload/v1778679830/closeup-of-hand-getting-a-book-2022-12-15-23-41-52-utc_sl01yx.jpg" 
                alt="Lawyer Working"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center grayscale hover:grayscale-0 transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-brand-navy/10 group-hover:bg-transparent transition-colors duration-1000" />
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-10 inset-inline-end-[-2.5rem] w-40 h-40 border border-brand-gold/20 -z-10 hidden md:block" />
            <div className="absolute -bottom-10 inset-inline-start-[-2.5rem] w-40 h-40 bg-brand-navy/5 -z-10 hidden md:block" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
