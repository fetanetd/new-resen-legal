import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, title, content }) => {
  const { t } = useTranslation();
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl max-h-[80vh] bg-bg-deep border border-theme-border rounded-sm shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex justify-between items-center px-8 py-6 border-b border-theme-border bg-card-bg">
              <h2 className="text-xl font-serif text-brand-navy font-bold">{title}</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-brand-offwhite rounded-full transition-colors text-gray-400 hover:text-brand-navy"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto font-light text-gray-600 leading-relaxed text-sm scrollbar-thin scrollbar-thumb-brand-gold/20">
              <div 
                className="prose prose-sm prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: content }} 
              />
            </div>
            
            <div className="px-8 py-4 border-t border-theme-border bg-card-bg text-right">
              <button 
                onClick={onClose}
                className="px-6 py-2 bg-brand-navy text-white text-xs uppercase tracking-widest font-bold hover:bg-brand-gold transition-colors"
              >
                {t('common.close')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LegalModal;
