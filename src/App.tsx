/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import './i18n'; // Initialize i18n
import CookieConsent from './components/CookieConsent';
import BackToTop from './components/BackToTop';

// Lazy loading pages for quick initial payload delivery
const Home = lazy(() => import('./pages/Home'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const TeamPage = lazy(() => import('./pages/TeamPage'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const AdminPortal = lazy(() => import('./pages/AdminPortal'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostDetail = lazy(() => import('./pages/BlogPostDetail'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-deep select-none">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-brand-gold/10 border-t-brand-gold rounded-full animate-spin" />
      </div>
    </div>
  );
}

function AdminShortcut() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Shift + A
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        navigate('/resen-gate');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return null;
}

function LanguageSync() {
  const { i18n } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    const isBlogPostDetail = location.pathname.startsWith('/blog/') && location.pathname !== '/blog';
    if (!isBlogPostDetail) {
      const currentLang = i18n.language || 'en';
      const activeLang = currentLang.startsWith('tr') ? 'tr' : 'en';
      document.documentElement.lang = activeLang;
    }
  }, [i18n.language, location.pathname]);

  return null;
}

function SEOCleanup() {
  useEffect(() => {
    const cleanStaticDuplicates = () => {
      // Find and remove the original static elements from index.html (which have data-static="true")
      const staticElements = document.querySelectorAll('[data-static="true"]');
      staticElements.forEach(el => {
        el.parentNode?.removeChild(el);
      });
    };

    cleanStaticDuplicates();
    // Re-check after short delays when initial load completes
    const t1 = setTimeout(cleanStaticDuplicates, 50);
    const t2 = setTimeout(cleanStaticDuplicates, 150);
    const t3 = setTimeout(cleanStaticDuplicates, 450);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []); // Run exactly once on mount, never on location change

  return null;
}

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <AdminShortcut />
        <LanguageSync />
        <SEOCleanup />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/service/:id" element={<ServiceDetail />} />
            <Route path="/resen-gate" element={<AdminPortal />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogPostDetail />} />
          </Routes>
        </Suspense>
        <BackToTop />
        <CookieConsent />
      </Router>
    </HelmetProvider>
  );
}
