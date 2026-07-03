import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail } from 'lucide-react';
import { TEAM as MOCK_TEAM } from '../constants/mockData';
import { getTranslation } from '../lib/utils';
import { useFirestoreCollection } from '../hooks/useFirestoreData';
import { TeamMember } from '../types';

export default function Team() {
  const { t, i18n } = useTranslation();
  const { data: firestoreTeam } = useFirestoreCollection<TeamMember>('team');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const team = React.useMemo(() => {
    const merged = [...firestoreTeam];
    MOCK_TEAM.forEach(mockMember => {
      if (!merged.find(m => m.id === mockMember.id || m.name.toLowerCase() === mockMember.name.toLowerCase())) {
        merged.push(mockMember as any as TeamMember);
      }
    });
    return merged.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [firestoreTeam]);

  return (
    <section id="team" className="py-24 bg-brand-offwhite">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.6 }}
              className="text-xs uppercase tracking-[0.4em] font-medium text-brand-gold mb-4"
            >
              {t('team.subtitle', 'Our Experts')}
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-serif text-brand-navy">
              {t('team.title', 'Legal minds focused on your success.')}
            </h2>
          </div>
          <div className="w-12 h-1 bg-brand-gold mb-4 hidden md:block" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={member.id}
              /* Ekip Üyesi Kartlarının Sıralı Girişi (Card Reveal) duraklatıldı */
              initial={false}
              className="group relative bg-card-bg rounded-sm overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-2xl transition-all duration-700"
            >
              <div className="md:w-1/2 aspect-[4/5] overflow-hidden">
                <img 
                   src={member.image || null} 
                   alt={member.name}
                   loading="lazy"
                   decoding="async"
                   referrerPolicy="no-referrer"
                   className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                />
              </div>
              <div className="p-8 md:w-1/2 flex flex-col flex-1">
                <div className="flex-grow">
                  <h3 className="text-3xl font-serif text-brand-navy mb-1">
                    {member.name}
                  </h3>
                  <div className="text-brand-gold text-xs uppercase tracking-widest font-bold mb-4">
                    {getTranslation(member.role, i18n.language)}
                  </div>
                  <p className="text-gray-500 font-light italic text-sm leading-relaxed mb-6">
                    {member.bio ? (
                      getTranslation(member.bio, i18n.language).substring(0, 100) + '...'
                    ) : (
                      t('team.defaultBio')
                    )}
                  </p>
                </div>
                
                <div className="mt-auto">
                  <button 
                    onClick={() => setSelectedMember(member)}
                    className="text-xs uppercase tracking-widest font-bold text-brand-navy hover:text-brand-gold transition-colors duration-300 flex items-center gap-2 mb-6"
                  >
                    {t('team.readBio', 'Read Biography')}
                    <span className="w-4 h-[1px] bg-current" />
                  </button>

                  <div className="border-t border-brand-navy/10 pt-4 flex flex-col gap-2">
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="inline-flex items-center gap-2 text-xs tracking-wider text-brand-navy/70 hover:text-brand-gold transition-colors duration-300 font-light"
                      >
                        <Mail className="w-3.5 h-3.5 text-brand-gold" />
                        {member.email}
                      </a>
                    )}
                    <span className="text-[10px] uppercase tracking-tighter opacity-40">Resen Legal & Consultancy</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Biography Modal */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              className="absolute inset-0 bg-brand-navy/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-brand-offwhite rounded-sm overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh]"
            >
              <button 
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 inset-inline-end-4 z-50 p-3 text-brand-navy/70 hover:text-brand-navy transition-colors bg-white/90 backdrop-blur-md rounded-full shadow-xl md:shadow-none md:bg-transparent md:p-2 md:text-brand-navy/40"
              >
                <X size={24} />
              </button>
              
              <div className="md:w-1/3 h-64 md:h-auto flex-shrink-0">
                <img 
                  src={selectedMember.image || null} 
                  alt={selectedMember.name}
                  className="w-full h-full object-cover object-top grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
              
              <div className="md:w-2/3 p-8 md:p-12 overflow-y-auto flex-1">
                <div className="text-brand-gold text-xs uppercase tracking-widest font-bold mb-2">
                  {getTranslation(selectedMember.role, i18n.language)}
                </div>
                <h3 className="text-4xl font-serif text-brand-navy mb-4">
                  {selectedMember.name}
                </h3>
                
                {selectedMember.email && (
                  <div className="mb-6">
                    <a
                      href={`mailto:${selectedMember.email}`}
                      className="inline-flex items-center gap-2 text-sm text-brand-navy/80 hover:text-brand-gold transition-colors duration-300 font-light"
                    >
                      <Mail className="w-4 h-4 text-brand-gold" />
                      {selectedMember.email}
                    </a>
                  </div>
                )}
                
                <div className="w-12 h-1 bg-brand-gold mb-8" />
                
                <div className="prose prose-sm prose-navy">
                  <p className="text-gray-600 leading-relaxed text-lg font-light italic mb-8">
                    {selectedMember.bio ? getTranslation(selectedMember.bio, i18n.language) : t('team.updatingBio')}
                  </p>
                </div>
                
                <div className="pt-8 border-t border-brand-navy/10 flex items-center gap-4">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-navy/40">
                    Resen Legal & Consultancy
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
