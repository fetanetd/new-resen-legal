import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { SERVICES as MOCK_SERVICES } from '../constants/mockData';
import { getTranslation } from '../lib/utils';
import { useFirestoreCollection } from '../hooks/useFirestoreData';
import { Service } from '../types';

export default function Services() {
  const { t, i18n } = useTranslation();
  const { data: firestoreServices, loading } = useFirestoreCollection<Service>('services');

  const services = React.useMemo(() => {
    const merged = [...firestoreServices];
    MOCK_SERVICES.forEach(mockService => {
      if (!merged.find(s => s.id === mockService.id)) {
        merged.push(mockService as any as Service);
      }
    });
    return merged.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [firestoreServices]);

  return (
    <section id="services" className="py-24 bg-bg-deep transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-serif text-brand-navy mb-4">
            {t('nav.services')}
          </h2>
          <div className="w-12 h-1 bg-brand-gold mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {services.map((service, index) => {
            const IconComponent = (Icons as any)[service.icon] || Icons.HelpCircle;
            return (
              <motion.div
                key={service.id}
                /* Animasyon 1 (Yüklenme/Reveal) ve Animasyon 2 (Hover Boyutlama/Yükselme) geçici olarak duraklatıldı */
                initial={false}
                className="group p-8 border border-theme-border hover:border-brand-gold hover:shadow-2xl hover:shadow-brand-gold/10 transition-all duration-500 rounded-sm flex flex-col h-full bg-card-bg"
                aria-label={t('accessibility.serviceCard', { service: getTranslation(service.title, i18n.language) })}
              >
                <div className="w-14 h-14 bg-bg-deep flex items-center justify-center rounded-sm mb-8 group-hover:bg-brand-navy transition-colors duration-500 overflow-hidden shrink-0">
                  <IconComponent className="w-6 h-6 text-brand-navy group-hover:text-brand-offwhite group-hover:scale-110 transition-all duration-500" />
                </div>
                <h3 className="text-2xl font-serif text-brand-navy mb-4">
                  {getTranslation(service.title, i18n.language)}
                </h3>
                <p className="text-gray-600 leading-relaxed font-light mb-8">
                  {getTranslation(service.description, i18n.language)}
                </p>
                <Link 
                  to={`/service/${service.id}`}
                  className="mt-auto text-xs uppercase tracking-widest font-bold text-brand-navy hover:text-brand-gold flex items-center gap-2 group-hover:gap-4 transition-all"
                >
                  {t('common.learnMore')} <Icons.ArrowRight className="w-3 h-3" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
