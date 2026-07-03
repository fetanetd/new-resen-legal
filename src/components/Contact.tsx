import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Send, CheckCircle, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { SERVICES } from '../constants/mockData';
import { getTranslation } from '../lib/utils';

export default function Contact() {
  const { t, i18n } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: SERVICES[0].title.en,
    message: ''
  });

  const validateEmail = (email: string) => {
    return /^[^@]+@[^@]+\.[^@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Client-side validation
    if (formData.name.length < 2) {
      setErrorMessage(t('form.errorNameShort'));
      return;
    }
    if (!validateEmail(formData.email)) {
      setErrorMessage(t('form.errorEmailInvalid'));
      return;
    }
    if (formData.message.length < 5) {
      setErrorMessage(t('form.errorMessageShort'));
      return;
    }

    setIsSubmitting(true);
    
    try {
      const path = 'contactMessages';
      await addDoc(collection(db, path), {
        name: formData.name.trim(),
        email: formData.email.trim(),
        department: formData.department,
        message: formData.message.trim(),
        createdAt: serverTimestamp()
      });
      setSuccessMessage(t('form.success'));
      
      setFormData({ 
        name: '', 
        email: '', 
        department: SERVICES[0].title.en, 
        message: '' 
      });

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);

    } catch (error: any) {
      console.error("Form submission error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        stack: error.stack,
        formData: { ...formData, message: formData.message.substring(0, 20) + '...' }
      });
      
      if (error.code === "permission-denied" || error.message?.includes("permission-denied")) {
        setErrorMessage(t('form.errorPermission'));
      } else {
        setErrorMessage(t('form.errorUnexpected') + (error.message || "Unknown error"));
      }
      
      try {
        handleFirestoreError(error, OperationType.CREATE, 'contactMessages');
      } catch (e) {
        // Logged but not re-thrown to avoid crashing UI
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-brand-offwhite text-brand-navy relative overflow-hidden transition-colors duration-300">
      {/* Decorative background circle */}
      <div className="absolute -bottom-24 inset-inline-end-[-6rem] w-96 h-96 border border-brand-navy/5 rounded-full" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.8 }}
              className="text-xs uppercase tracking-[0.4em] font-medium text-brand-gold mb-6"
            >
              {t('form.getInTouch')}
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-serif mb-8 leading-tight text-brand-navy">
              {t('form.title')}
            </h2>
            
              <div className="space-y-8 mt-12">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-sm border border-theme-border flex items-center justify-center text-brand-gold bg-bg-deep shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-brand-navy/60 text-xs uppercase tracking-widest mb-1">{t('form.offices')}</div>
                    <address className="not-italic font-light">
                      {i18n.language.startsWith('tr') ? 'İstanbul' : 'Istanbul'} | London
                    </address>
                  </div>
                </div>
                
                <a 
                  href="mailto:info@resenlegal.com" 
                  className="flex items-start gap-6 group hover:text-brand-gold transition-colors duration-300"
                >
                  <div className="w-12 h-12 rounded-sm border border-theme-border flex items-center justify-center text-brand-gold bg-bg-deep group-hover:border-brand-gold/50 group-hover:bg-brand-gold/5 transition-all shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-brand-navy/60 text-xs uppercase tracking-widest mb-1 group-hover:text-brand-gold/70">{t('form.emailCorrespondence')}</div>
                    <div className="font-light border-b border-transparent group-hover:border-brand-gold/30">info@resenlegal.com</div>
                  </div>
                </a>

                <a 
                  href="https://wa.me/905467962854" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-6 group hover:text-brand-gold transition-colors duration-300"
                >
                  <div className="w-12 h-12 rounded-sm border border-theme-border flex items-center justify-center text-brand-gold bg-bg-deep group-hover:border-brand-gold/50 group-hover:bg-brand-gold/5 transition-all shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-brand-navy/60 text-xs uppercase tracking-widest mb-1 group-hover:text-brand-gold/70">{t('form.phoneInquiry')}</div>
                    <div className="font-light border-b border-transparent group-hover:border-brand-gold/30">+90 546 796 28 54</div>
                  </div>
                </a>
              </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card-bg p-10 rounded-sm text-brand-navy border border-theme-border shadow-2xl"
          >
            <form className="space-y-6" onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {errorMessage && (
                  <motion.div 
                    key="error-message"
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-sm"
                  >
                    {errorMessage}
                  </motion.div>
                )}
                {successMessage && (
                  <motion.div 
                    key="success-message"
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="p-4 bg-green-50 border border-green-200 text-green-600 text-sm rounded-sm flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {successMessage}
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-60 text-brand-navy">{t('form.name')}</label>
                  <input 
                      id="form-name-input"
                      required
                      type="text" 
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border-b border-theme-border py-3 bg-transparent focus:border-brand-gold outline-none transition-all font-light placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-60 text-brand-navy">{t('form.email')}</label>
                  <input 
                      id="form-email-input"
                      required
                      type="email" 
                      placeholder="jane@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border-b border-theme-border py-3 bg-transparent focus:border-brand-gold outline-none transition-all font-light placeholder:text-gray-400"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-60 text-brand-navy">{t('form.legalDepartment')}</label>
                <div className="relative">
                  <select 
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full border-b border-theme-border py-3 bg-transparent focus:border-brand-gold outline-none transition-all font-light appearance-none text-brand-navy"
                  >
                    {SERVICES.map((service) => (
                      <option key={service.id} value={service.title.en} className="bg-white">
                        {getTranslation(service.title, i18n.language)}
                      </option>
                    ))}
                    <option value="Other Matter" className="bg-white">{t('form.otherMatter')}</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-60 text-brand-navy">{t('form.message')}</label>
                <textarea 
                  required
                  rows={4}
                  placeholder={t('form.messagePlaceholder')}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full border-b border-theme-border py-3 bg-transparent focus:border-brand-gold outline-none transition-all font-light resize-none placeholder:text-gray-400"
                />
              </div>
              <button 
                disabled={isSubmitting}
                className="w-full bg-brand-gold text-white font-bold uppercase tracking-[0.2em] py-5 mt-4 hover:bg-brand-gold/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? t('common.processing') : t('form.submit')}
                {!isSubmitting && <Send className="w-4 h-4" />}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
