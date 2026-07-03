import React, { useEffect } from 'react';
import SEO from '../components/SEO';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Services from '../components/Services';
import Team from '../components/Team';
import BlogCarousel from '../components/BlogCarousel';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

export default function Home() {
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.location.hash) {
        const id = window.location.hash.substring(1);
        const element = document.getElementById(id);
        if (element) {
          // Small timeout to ensure DOM is fully rendered
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    };

    handleScroll();
    window.addEventListener('hashchange', handleScroll);
    return () => window.removeEventListener('hashchange', handleScroll);
  }, []);

  const homeStructuredData = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    "name": "Resen Legal & Consultancy",
    "url": "https://resenlegal.com",
    "logo": "https://res.cloudinary.com/dlrsifk2y/image/upload/v1782769600/last_t2oqne.png",
    "description": "Expert legal consultancy specializing in Immigration Law, Corporate Law, and GDPR. Resen Legal & Consultancy provides professional advice for international and local legal matters.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Istanbul",
      "addressCountry": "TR"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+90 546 796 28 54",
      "contactType": "customer service",
      "email": "info@resenlegal.com"
    },
    "sameAs": [
      "https://www.linkedin.com/company/resenlegal"
    ]
  };

  return (
    <div className="min-h-screen">
      <SEO 
        title={t('hero.slogan')}
        description={`${t('hero.subtext')} Explore our specialized legal services in immigration, corporate law, and GDPR compliance.`}
        keywords="legal services, immigration law, corporate legal counsel, GDPR compliance, Turkish law, international legal consultancy"
        image="https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80"
        canonical="/"
        structuredData={homeStructuredData}
      />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <div className="h-24 bg-bg-deep" />
        <Team />
        <BlogCarousel />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
