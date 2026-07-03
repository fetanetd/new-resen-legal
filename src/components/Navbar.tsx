import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Globe, ChevronDown, MessageSquare, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

const LANGUAGES = [
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'tr', label: 'Türkçe', dir: 'ltr' },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<string>('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showContactPrompt, setShowContactPrompt] = useState(false);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);

  useEffect(() => {
    // Ensure dark mode is removed if it was previously set
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('theme');
  }, []);

  useEffect(() => {
    // Reset dismissal when page changes so they can see the prompt on other articles/pages
    setHasBeenDismissed(false);
    setShowContactPrompt(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const isBlogPage = location.pathname.startsWith('/blog');
    
    // We want the scroll tracking to work on all pages
    const handleScrollProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const totalHeight = scrollHeight - clientHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
        
        // Show contact prompt only on blog pages when user reaches 100% (or >= 98%)
        if (isBlogPage && progress >= 98 && !hasBeenDismissed) {
          setShowContactPrompt(true);
        }
      } else {
        setScrollProgress(0);
      }
    };

    window.addEventListener('scroll', handleScrollProgress);
    handleScrollProgress();
    const timer = setTimeout(handleScrollProgress, 150);

    return () => {
      window.removeEventListener('scroll', handleScrollProgress);
      clearTimeout(timer);
    };
  }, [location.pathname, hasBeenDismissed]);

  useEffect(() => {
    if (location.pathname !== '/') {
      const path = location.pathname;
      if (path.startsWith('/about')) {
        setActiveSection('/about');
      } else if (path.startsWith('/services') || path.startsWith('/service/')) {
        setActiveSection('/services');
      } else if (path.startsWith('/team')) {
        setActiveSection('/team');
      } else if (path.startsWith('/blog')) {
        setActiveSection('/blog');
      } else {
        setActiveSection('');
      }
      return;
    }

    const handleScrollSpy = () => {
      // If at the absolute top of home page, clear active sections
      if (window.scrollY < 120) {
        setActiveSection('');
        return;
      }

      const sectionIds = ['about', 'services', 'team', 'blog-preview', 'contact'];
      let currentActive = '';
      
      const viewportCenter = window.innerHeight / 2;

      // Check which section covers the vertical center of the viewport
      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= viewportCenter && rect.bottom >= viewportCenter) {
            if (id === 'about') currentActive = '/about';
            else if (id === 'services') currentActive = '/services';
            else if (id === 'team') currentActive = '/team';
            else if (id === 'blog-preview') currentActive = '/blog';
            else if (id === 'contact') currentActive = '/#contact';
            break;
          }
        }
      }

      // Fallback: Pick the visible section closest to 100px from the top
      if (!currentActive) {
        let minDistance = Infinity;
        for (const id of sectionIds) {
          const element = document.getElementById(id);
          if (element) {
            const rect = element.getBoundingClientRect();
            const distance = Math.abs(rect.top - 100);
            if (rect.top < window.innerHeight && rect.bottom > 0 && distance < minDistance) {
              minDistance = distance;
              if (id === 'about') currentActive = '/about';
              else if (id === 'services') currentActive = '/services';
              else if (id === 'team') currentActive = '/team';
              else if (id === 'blog-preview') currentActive = '/blog';
              else if (id === 'contact') currentActive = '/#contact';
            }
          }
        }
      }

      setActiveSection(currentActive);
    };

    handleScrollSpy();

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScrollSpy();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', handleScrollSpy);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleScrollSpy);
    };
  }, [location.pathname]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = LANGUAGES.find(l => l.code === lng)?.dir || 'ltr';
    document.documentElement.lang = lng;
    localStorage.setItem('userLanguageSelected', 'true');
  };

  const navLinks = [
    { name: t('nav.about'), href: '/about' },
    { name: t('nav.services'), href: '/services' },
    { name: t('nav.team'), href: '/team' },
    { name: t('nav.blog'), href: '/blog' },
    { name: t('nav.contact'), href: '/#contact' },
  ];

  return (
    <>
      {/* Scroll-Linked Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-[60] pointer-events-none">
        <div 
          className="h-full bg-[#064E3B] origin-left transition-all duration-75 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <nav className={cn(
        "fixed top-0 w-full z-50 transition-all duration-500 py-6 px-6 lg:px-12",
        isScrolled ? "bg-brand-offwhite/95 backdrop-blur-md shadow-sm py-4" : "bg-transparent"
      )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2 group"
        >
          <span className="relative text-xl font-serif font-bold tracking-tighter text-brand-navy pb-0.5">
            RESEN <span className="font-normal text-brand-gold">LEGAL</span>
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#0B192C] to-[#D4B26F] transition-all duration-300 group-hover:w-full" />
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href;
            return link.href.startsWith('/#') ? (
              <a 
                key={link.name} 
                href={link.href}
                className={cn(
                  "relative text-xs uppercase tracking-widest font-medium transition-all duration-300 pb-1.5 group block",
                  isActive ? "text-brand-gold font-bold" : "text-brand-navy/80 hover:text-brand-gold"
                )}
              >
                {link.name}
                <span className={cn(
                  "absolute bottom-0 left-0 h-[2px] bg-brand-gold transition-all duration-300",
                  isActive ? "w-full" : "w-0 group-hover:w-full"
                )} />
              </a>
            ) : (
              <Link 
                key={link.name} 
                to={link.href}
                className={cn(
                  "relative text-xs uppercase tracking-widest font-medium transition-all duration-300 pb-1.5 group block",
                  isActive ? "text-brand-gold font-bold" : "text-brand-navy/80 hover:text-brand-gold"
                )}
              >
                {link.name}
                <span className={cn(
                  "absolute bottom-0 left-0 h-[2px] bg-brand-gold transition-all duration-300",
                  isActive ? "w-full" : "w-0 group-hover:w-full"
                )} />
              </Link>
            );
          })}
          
          {/* Language Selector */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-xs uppercase tracking-widest font-medium text-brand-navy/80 group-hover:text-brand-gold transition-colors pb-1.5">
              <Globe className="w-3 h-3" />
              {LANGUAGES.find(l => l.code === i18n.language)?.label}
              <ChevronDown className="w-3 h-3" />
            </button>
            <div className="absolute inset-inline-end-0 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
              <div className="bg-white shadow-xl border border-gray-100 rounded-sm py-2 min-w-[120px]">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={cn(
                      "w-full text-left px-4 py-2 text-xs hover:bg-brand-offwhite transition-colors",
                      i18n.language === lang.code ? "text-brand-gold font-bold" : "text-brand-navy"
                    )}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Trigger */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t mt-4 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-6">
              {navLinks.map((link) => {
                const isActive = activeSection === link.href;
                return link.href.startsWith('/#') ? (
                  <a 
                    key={link.name} 
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "relative text-lg font-serif transition-colors duration-300 py-1 self-start group block",
                      isActive ? "text-brand-gold font-bold" : "text-brand-navy"
                    )}
                  >
                    {link.name}
                    <span className={cn(
                      "absolute bottom-0 left-0 h-[2px] bg-brand-gold transition-all duration-300",
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    )} />
                  </a>
                ) : (
                  <Link 
                    key={link.name} 
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "relative text-lg font-serif transition-colors duration-300 py-1 self-start group block",
                      isActive ? "text-brand-gold font-bold" : "text-brand-navy"
                    )}
                  >
                    {link.name}
                    <span className={cn(
                      "absolute bottom-0 left-0 h-[2px] bg-brand-gold transition-all duration-300",
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    )} />
                  </Link>
                );
              })}
              <div className="pt-4 border-t flex flex-wrap gap-4">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeLanguage(lang.code);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "text-sm",
                      i18n.language === lang.code ? "text-brand-gold font-bold" : "text-gray-500"
                    )}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>

    {/* Reading Progress Complete Prompt */}
    <AnimatePresence>
      {showContactPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[100] max-w-sm w-[calc(100vw-2rem)] bg-white border border-brand-navy/10 rounded-xl shadow-2xl p-5 md:p-6 flex flex-col gap-4 text-left"
        >
          {/* Close Button */}
          <button 
            onClick={() => {
              setShowContactPrompt(false);
              setHasBeenDismissed(true);
            }}
            className="absolute top-4 right-4 text-gray-400 hover:text-brand-navy transition-colors p-1 rounded-full hover:bg-gray-100"
            aria-label={t('common.close')}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Prompt Content */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-brand-navy/5 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-brand-gold" />
            </div>
            <div className="flex-1 min-w-0 pr-6">
              <h4 className="text-sm font-serif font-bold text-brand-navy tracking-tight leading-tight mb-1">
                {t('common.promptTitle')}
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                {t('common.promptText')}
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <a
            href="https://wa.me/905467962854"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              setShowContactPrompt(false);
              setHasBeenDismissed(true);
            }}
            className="w-full bg-brand-navy hover:bg-brand-navy/90 text-white text-xs font-semibold uppercase tracking-wider py-3 px-4 rounded-sm transition-all duration-300 flex items-center justify-center gap-2 group/btn"
          >
            <span>{t('common.promptCTA')}</span>
            <ArrowRight className="w-3.5 h-3.5 text-brand-gold transition-transform duration-300 group-hover/btn:translate-x-1" />
          </a>
        </motion.div>
      )}
    </AnimatePresence>
   </>
  );
}
