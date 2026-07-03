import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, X, Settings, ArrowLeft, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [view, setView] = useState<'main' | 'prefs'>('main');
  const { i18n } = useTranslation();

  // Fine-grained cookie permission states
  const [prefs, setPrefs] = useState({
    necessary: true,
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookie-consent', 'accepted-all');
    localStorage.setItem('cookie-pref-analytics', 'true');
    localStorage.setItem('cookie-pref-marketing', 'true');
    setIsVisible(false);
  };

  const handleDeclineAll = () => {
    localStorage.setItem('cookie-consent', 'accepted-essential');
    localStorage.setItem('cookie-pref-analytics', 'false');
    localStorage.setItem('cookie-pref-marketing', 'false');
    setIsVisible(false);
  };

  const handleSaveCustom = () => {
    localStorage.setItem('cookie-consent', 'accepted-custom');
    localStorage.setItem('cookie-pref-analytics', prefs.analytics.toString());
    localStorage.setItem('cookie-pref-marketing', prefs.marketing.toString());
    setIsVisible(false);
  };

  const isTr = (i18n.language || 'tr').startsWith('tr');

  const content = {
    title: isTr ? 'Çerez Tercihleri' : 'Cookie Preferences',
    desc: isTr 
      ? 'Resen Hukuk olarak, gezinme deneyiminizi en üst düzeye çıkarmak için güvenli çerezler kullanmaktayız.'
      : 'At Resen Legal, we employ secure cookies to optimize and enrich your browsing experience.',
    linkText: isTr ? 'Çerez Politikası' : 'Cookie Policy',
    acceptAll: isTr ? 'Tümünü Kabul Et' : 'Accept All',
    rejectAll: isTr ? 'Zorunlu Çerezler' : 'Essential Only',
    manage: isTr ? 'Tercihleri Yönet' : 'Manage Preferences',
    back: isTr ? 'Geri' : 'Back',
    saveSelection: isTr ? 'Tercihleri Kaydet' : 'Save Choices',
    categories: {
      necessary: {
        title: isTr ? 'Gerekli Çerezler' : 'Necessary',
        desc: isTr ? 'Platformun güvenli çalışması için zorunludur.' : 'Required for core security and functionality.',
      },
      analytics: {
        title: isTr ? 'Performans ve Analiz' : 'Performance',
        desc: isTr ? 'Ziyaret bilgilerini analiz etmemizi sağlar.' : 'Allows us to analyze visitor navigation metrics.',
      },
      marketing: {
        title: isTr ? 'Kişiselleştirme' : 'Personalization',
        desc: isTr ? 'Size özel hukuki içerikleri sunar.' : 'Delivers tailored insights suited for you.',
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 20, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 15, opacity: 0, scale: 0.97 }}
          transition={{ type: 'spring', damping: 28, stiffness: 240 }}
          className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-[9999] w-[calc(100%-1.5rem)] sm:w-[310px] bg-[#FDFCFB] text-brand-navy border border-brand-navy/15 rounded-md shadow-[0_12px_36px_rgba(6,78,59,0.12)] font-sans antialiased select-none overflow-hidden"
          id="cookie-consent-modal"
        >
          {/* Extremely thin elegant top border accent */}
          <div className="h-[2px] bg-brand-gold w-full" />

          <div className="relative p-4 sm:p-5 flex flex-col">
            
            {/* Minimal close button */}
            <button
              onClick={handleDeclineAll}
              className="absolute top-3.5 right-3.5 text-brand-navy/30 hover:text-brand-gold transition-colors duration-150 p-1"
              aria-label="Decline and close"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {view === 'main' ? (
              /* --- Main View --- */
              <div className="space-y-3.5">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-brand-gold/10 border border-brand-gold/25 rounded-sm shrink-0">
                    <Cookie className="w-3.5 h-3.5 text-brand-gold" />
                  </div>
                  <h4 className="text-xs font-serif font-semibold tracking-wider text-brand-gold uppercase">
                    {content.title}
                  </h4>
                </div>

                <p className="text-[11px] sm:text-xs text-brand-navy/80 leading-relaxed font-light">
                  {content.desc}
                </p>

                {/* Highly structured, micro-styled CTA block */}
                <div className="space-y-2 pt-1.5 border-t border-brand-navy/5">
                  <button
                    onClick={handleAcceptAll}
                    className="w-full py-1.5 bg-brand-navy text-white hover:bg-brand-navy/90 hover:shadow-sm font-semibold rounded-sm text-[10px] uppercase tracking-widest transition-all duration-200 active:scale-[0.98]"
                  >
                    {content.acceptAll}
                  </button>

                  <button
                    onClick={handleDeclineAll}
                    className="w-full py-1.5 bg-transparent border border-brand-navy/15 hover:border-brand-navy/30 text-brand-navy/80 hover:text-brand-navy font-medium rounded-sm text-[10px] uppercase tracking-widest transition-all duration-150"
                  >
                    {content.rejectAll}
                  </button>

                  <div className="flex justify-center pt-1">
                    <button
                      onClick={() => setView('prefs')}
                      className="inline-flex items-center gap-1 text-[9px] text-[#BC9C53] hover:text-brand-navy transition-colors uppercase tracking-widest font-semibold hover:underline hover:underline-offset-2"
                    >
                      <Settings className="w-2.5 h-2.5" />
                      {content.manage}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* --- Advanced Preferences View --- */
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-brand-navy/5 pb-2">
                  <button
                    onClick={() => setView('main')}
                    className="flex items-center gap-1 text-[9px] text-brand-navy/50 hover:text-brand-navy transition-colors uppercase tracking-wider font-semibold"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    {content.back}
                  </button>
                  <span className="text-[9px] text-brand-gold font-serif uppercase tracking-widest font-black">
                    {content.manage}
                  </span>
                </div>

                {/* Minimal detailed selectors */}
                <div className="space-y-2">
                  
                  {/* Strict Essential Category */}
                  <div className="flex items-start justify-between gap-2.5 bg-brand-navy/5 p-2 rounded-sm">
                    <div className="space-y-0.5">
                      <h5 className="text-[10px] font-semibold text-[#064E3B] uppercase tracking-wide">
                        {content.categories.necessary.title}
                      </h5>
                      <p className="text-[9px] text-brand-navy/65 leading-tight">
                        {content.categories.necessary.desc}
                      </p>
                    </div>
                    <span className="shrink-0 text-[8px] bg-brand-navy/15 text-brand-navy px-1 py-0.5 rounded-sm uppercase tracking-wider font-bold">
                      {isTr ? 'AÇIK' : 'ON'}
                    </span>
                  </div>

                  {/* High Quality Analytics Switch */}
                  <div className="flex items-start justify-between gap-2.5 bg-brand-navy/5 p-2 rounded-sm">
                    <div className="space-y-0.5">
                      <h5 className="text-[10px] font-semibold text-[#064E3B] uppercase tracking-wide">
                        {content.categories.analytics.title}
                      </h5>
                      <p className="text-[9px] text-brand-navy/65 leading-tight">
                        {content.categories.analytics.desc}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => setPrefs(prev => ({ ...prev, analytics: !prev.analytics }))}
                      className={`relative inline-flex h-3.5 w-7 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 focus:outline-none shrink-0 align-middle ${
                        prefs.analytics ? 'bg-brand-navy' : 'bg-brand-navy/20'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-[12px] w-[12px] transform rounded-full bg-white ring-0 transition duration-200 ${
                          prefs.analytics ? 'translate-x-3.5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Sophisticated Marketing Switch */}
                  <div className="flex items-start justify-between gap-2.5 bg-brand-navy/5 p-2 rounded-sm">
                    <div className="space-y-0.5">
                      <h5 className="text-[10px] font-semibold text-[#064E3B] uppercase tracking-wide">
                        {content.categories.marketing.title}
                      </h5>
                      <p className="text-[9px] text-brand-navy/65 leading-tight">
                        {content.categories.marketing.desc}
                      </p>
                    </div>

                    <button
                      onClick={() => setPrefs(prev => ({ ...prev, marketing: !prev.marketing }))}
                      className={`relative inline-flex h-3.5 w-7 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 focus:outline-none shrink-0 align-middle ${
                        prefs.marketing ? 'bg-brand-navy' : 'bg-brand-navy/20'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-[12px] w-[12px] transform rounded-full bg-white ring-0 transition duration-200 ${
                          prefs.marketing ? 'translate-x-3.5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                </div>

                {/* Save Choices CTA */}
                <button
                  onClick={handleSaveCustom}
                  className="w-full flex items-center justify-center gap-1 py-1.5 bg-brand-gold text-white hover:bg-[#BC9C53]/95 hover:shadow-sm font-semibold rounded-sm text-[10px] uppercase tracking-widest transition-all duration-200"
                >
                  <Check className="w-3 h-3" />
                  {content.saveSelection}
                </button>
              </div>
            )}

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
