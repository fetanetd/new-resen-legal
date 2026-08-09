import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const BackToTop: React.FC = () => {
  const [showTop, setShowTop] = useState(false);
  const [showBottom, setShowBottom] = useState(false);

  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const fullHeight = document.documentElement.scrollHeight;

    setShowTop(scrollTop > 300);
    setShowBottom(fullHeight > windowHeight + 400 && scrollTop + windowHeight < fullHeight - 300);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3.5 items-center pointer-events-none">
      <AnimatePresence>
        {showTop && (
          <motion.button
            id="back-to-top"
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            onClick={scrollToTop}
            className="pointer-events-auto p-3.5 bg-brand-navy/90 backdrop-blur-md border border-brand-gold/20 text-brand-offwhite rounded-full shadow-2xl hover:bg-brand-gold hover:text-brand-navy transition-all duration-300 group"
            aria-label="Back to Top"
            title="En Üste Dön / Scroll to Top"
          >
            <ChevronUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform duration-300" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBottom && (
          <motion.button
            id="back-to-bottom"
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            onClick={scrollToBottom}
            className="pointer-events-auto p-3.5 bg-brand-navy/90 backdrop-blur-md border border-brand-gold/20 text-brand-offwhite rounded-full shadow-2xl hover:bg-brand-gold hover:text-brand-navy transition-all duration-300 group"
            aria-label="Back to Bottom"
            title="En Alta İnin / Scroll to Bottom"
          >
            <ChevronDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform duration-300" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BackToTop;

