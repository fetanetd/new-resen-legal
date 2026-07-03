import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  article?: boolean;
  publishedTime?: string;
  author?: string;
  section?: string;
  canonical?: string;
  structuredData?: any;
  isBlogDetail?: boolean;
  lang?: string;
  disableSuffix?: boolean;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image,
  article,
  publishedTime,
  author,
  section,
  canonical,
  structuredData,
  isBlogDetail,
  lang,
  disableSuffix
}) => {
  const { i18n } = useTranslation();
  const [dynamicSettings, setDynamicSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'global'));
        if (snap.exists()) {
          setDynamicSettings(snap.data().seo);
        }
      } catch (err) {
        // Silent fail
      }
    };
    fetchSettings();
  }, []);

  const siteName = dynamicSettings?.title || 'Resen Legal & Consultancy';
  const fullTitle = disableSuffix ? (title || siteName) : (title ? `${title} | ${siteName}` : siteName);
  const defaultDescription = dynamicSettings?.description || 'Expert legal consultancy specializing in Immigration Law, Corporate Law, and GDPR. Resen Legal & Consultancy provides professional advice for international and local legal matters.';
  const metaDescription = description || defaultDescription;
  const baseUrl = 'https://resenlegal.com';
  const pageUrl = canonical ? `${baseUrl}${canonical}` : baseUrl;
  const metaImage = image || 'https://res.cloudinary.com/dlrsifk2y/image/upload/v1783074107/WhatsApp_Image_2026-07-02_at_16.29.53_fsx9mp.jpg';
  const defaultKeywords = dynamicSettings?.keywords || 'legal consultancy, immigration lawyer, corporate law Turkey, GDPR compliance, Resen Legal';
  const metaKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;

  const resolvedLang = lang ? (lang.startsWith('tr') ? 'tr' : 'en') : i18n.language;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      <link rel="canonical" href={pageUrl} />
      <html lang={resolvedLang} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title || siteName} />
      <meta property="og:locale" content={i18n.language === 'tr' ? 'tr_TR' : 'en_US'} />
      <meta property="og:site_name" content={siteName} />

      {article && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {article && author && (
        <meta property="article:author" content={author} />
      )}
      {article && section && (
        <meta property="article:section" content={section} />
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={pageUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
