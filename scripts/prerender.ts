import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { BLOG_POSTS as MOCK_BLOG, SERVICES as MOCK_SERVICES, TEAM as MOCK_TEAM } from "../src/constants/mockData";
import { PRIORITY_SERVICES_DETAILED_CONTENT } from "../src/constants/serviceDetailedContent";

dotenv.config();

// Helper functions for dynamic sitemap and HTML generation
function generateSlug(text: string): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .replace(/[\s_]+/g, "-") // Replace spaces and underscores with -
    .replace(/[çışğöüıÇİŞĞÖÜİ]/g, (char) => {
      const trMap: Record<string, string> = {
        ç: "c", ı: "i", ş: "s", ğ: "g", ö: "o", ü: "u",
        Ç: "C", İ: "I", Ş: "S", Ğ: "G", Ö: "O", Ü: "U",
      };
      return trMap[char] || char;
    })
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars except -
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start
    .replace(/-+$/, ""); // Trim - from end
}

function getPostSlug(post: any): string {
  if (!post) return "";
  if (typeof post.slug === "string" && post.slug.trim()) return post.slug.trim();
  
  let titleText = "";
  if (post.title) {
    if (typeof post.title === "string") {
      titleText = post.title;
    } else if (typeof post.title === "object") {
      titleText = post.title.tr || post.title.en || post.title.ar || post.title.es || post.title.zh || "";
      if (!titleText) {
        const values = Object.values(post.title).filter(v => typeof v === "string" && v);
        if (values.length > 0) {
          titleText = values[0] as string;
        }
      }
    }
  }
  
  const generated = generateSlug(titleText);
  if (generated) return generated;
  return typeof post.id === "string" ? post.id : "";
}

function getServerTranslation(content: any, locale: string, postLanguage?: string): string {
  if (!content) return "";
  if (typeof content === "string") {
    return content.replace(
      "Bu çalışma modeli sayesinde hem Türkiye'deki hazırlık aşaması hem de Portekiz'deki konsolosluk, AIMA, şirket kuruluşu, vergi numarası, banka hesabı ve oturum kartı süreçleri bütünlüklü şekilde planlanabilir.",
      "Bu çalışma modeli sayesinde hem Türkiye'deki hazırlık ve Portekiz konsolosluğu başvuru aşaması hem de Portekiz'deki AIMA, şirket kuruluşu, vergi numarası, banka hesabı ve oturum kartı süreçleri bütünlüklü şekilde planlanabilir."
    );
  }
  
  let normalizedPostLang: string | undefined = undefined;
  if (postLanguage) {
    const pl = postLanguage.trim().toLowerCase();
    if (pl === "en" || pl === "english") normalizedPostLang = "en";
    else if (pl === "tr" || pl === "turkish") normalizedPostLang = "tr";
    else normalizedPostLang = postLanguage;
  }

  const targetLocale = normalizedPostLang || locale;
  const val = content[targetLocale] || content[locale] || content["en"] || content["tr"] || Object.values(content)[0] || "";
  
  if (typeof val === "string") {
    return val.replace(
      "Bu çalışma modeli sayesinde hem Türkiye'deki hazırlık aşaması hem de Portekiz'deki konsolosluk, AIMA, şirket kuruluşu, vergi numarası, banka hesabı ve oturum kartı süreçleri bütünlüklü şekilde planlanabilir.",
      "Bu çalışma modeli sayesinde hem Türkiye'deki hazırlık ve Portekiz konsolosluğu başvuru aşaması hem de Portekiz'deki AIMA, şirket kuruluşu, vergi numarası, banka hesabı ve oturum kartı süreçleri bütünlüklü şekilde planlanabilir."
    );
  }
  
  return val;
}

function formatSitemapDate(dateVal: any): string {
  if (!dateVal) return "2026-06-16";
  try {
    if (dateVal && typeof dateVal === "object" && "seconds" in dateVal) {
      return new Date(dateVal.seconds * 1000).toISOString().split("T")[0];
    }
    if (typeof dateVal === "string" || typeof dateVal === "number") {
      const d = new Date(dateVal);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split("T")[0];
      }
    }
    return "2026-06-16";
  } catch {
    return "2026-06-16";
  }
}

function isPostPublishedPrerender(post: any): boolean {
  if (!post) return false;
  if (post.status === "draft") return false;
  if (post.status === "scheduled") {
    if (!post.publishAt) return false;
    const pubTime = new Date(post.publishAt).getTime();
    if (isNaN(pubTime)) return false;
    return pubTime <= Date.now();
  }
  return true;
}

function getSocialThumbnailUrl(imageUrl?: string): string {
  if (!imageUrl || typeof imageUrl !== "string") {
    return "https://res.cloudinary.com/dlrsifk2y/image/upload/c_fill,w_256,h_256,g_auto,q_auto,f_jpg/v1783084549/og_xi5mco.jpg";
  }

  if (imageUrl.includes("res.cloudinary.com") && imageUrl.includes("/upload/")) {
    if (imageUrl.includes("/upload/c_fill,w_256,h_256")) {
      return imageUrl;
    }
    return imageUrl.replace("/upload/", "/upload/c_fill,w_256,h_256,g_auto,q_auto,f_jpg/");
  }

  return imageUrl;
}

// Timeout wrap for firestore calls to ensure build never hangs
const withTimeout = <T>(promise: Promise<T>, ms: number = 15000): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Firestore connection timed out"));
    }, ms);
    promise.then(
      (res) => {
        clearTimeout(timer);
        resolve(res);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
};

async function main() {
  let firestorePosts: any[] = [];
  let firestoreServices: any[] = [];
  
  try {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      const app = initializeApp(config);
      const db = getFirestore(app, config.firestoreDatabaseId);
      
      console.log("Fetching blog posts from Firestore...");
      const blogCol = collection(db, "blog");
      const blogSnapshot = await withTimeout(getDocs(blogCol));
      blogSnapshot.forEach((doc) => {
        firestorePosts.push({ id: doc.id, ...doc.data() });
      });
      console.log(`Fetched ${firestorePosts.length} blog posts from Firestore.`);
      
      console.log("Fetching services from Firestore...");
      try {
        const servicesCol = collection(db, "services");
        const servicesSnapshot = await withTimeout(getDocs(servicesCol), 3000);
        servicesSnapshot.forEach((doc) => {
          firestoreServices.push({ id: doc.id, ...doc.data() });
        });
        console.log(`Fetched ${firestoreServices.length} services from Firestore.`);
      } catch (serviceErr: any) {
        console.warn("Could not fetch services from Firestore, using only mock services:", serviceErr.message);
      }
    } else {
      console.warn("firebase-applet-config.json not found, using only offline mock data.");
    }
  } catch (err: any) {
    console.warn("Firebase fetch failed or timed out, falling back to offline mock data:", err.message);
  }

  // Merge blogs
  const mergedPosts = [...firestorePosts];
  MOCK_BLOG.forEach((mockPost) => {
    if (!mergedPosts.find((p) => p.id === mockPost.id)) {
      mergedPosts.push(mockPost);
    }
  });
  
  // Merge services
  const mergedServices = [...firestoreServices];
  MOCK_SERVICES.forEach((mockService) => {
    if (!mergedServices.find((s) => s.id === mockService.id)) {
      mergedServices.push(mockService);
    }
  });

  const getPrerenderCategory = (cat: string | undefined, lang: string): string => {
    if (!cat) return lang === "tr" ? "Hukuki Analizler" : "Legal Insights";
    const trimmed = cat.trim().toLowerCase();
    if (trimmed === "private international law" || trimmed === "milletlerası özel hukuk" || trimmed === "milletlerarası özel hukuk" || trimmed === "uluslararası özel hukuk") {
      return lang === "tr" ? "Milletlerarası Özel Hukuk" : "Private International Law";
    }
    if (trimmed === "immigration") {
      return lang === "tr" ? "Göç Hukuku" : "Immigration Law";
    }
    if (trimmed === "corporate") {
      return lang === "tr" ? "Şirketler ve Ticaret Hukuku" : "Commercial & Corporate Law";
    }
    const service = mergedServices.find((srv: any) => {
      if (!srv.title) return false;
      return Object.values(srv.title).some(
        (val) => typeof val === "string" && val.trim().toLowerCase() === trimmed
      );
    });
    if (service && service.title) {
      return service.title[lang] || service.title["en"] || Object.values(service.title)[0] || cat;
    }
    return cat;
  };

  const distPath = path.join(process.cwd(), "dist");
  const templatePath = path.join(distPath, "index.html");

  if (!fs.existsSync(templatePath)) {
    console.error("Vite build template index.html not found! Run 'vite build' first.");
    process.exit(1);
  }

  const htmlTemplate = fs.readFileSync(templatePath, "utf-8");

  // Reusable semantic Header Navigation and Footer for prerendered pages
  const navHtml = `
    <header class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md py-4 border-b border-gray-100 shadow-sm transition-all duration-300">
      <div class="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
        <a href="/" class="flex items-center gap-3 group shrink-0 no-underline">
          <img src="https://res.cloudinary.com/dlrsifk2y/image/upload/v1778684376/favicon_yatsiz.png" alt="Resen Legal Logo" class="w-8 h-8 md:w-9 md:h-9 object-contain" />
          <span class="text-xl font-serif font-bold tracking-tight text-brand-navy">
            RESEN <span class="font-normal text-brand-gold">LEGAL</span>
          </span>
        </a>
        <nav class="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest font-medium text-brand-navy/80">
          <a href="/services/" class="hover:text-brand-gold transition-colors">Services</a>
          <a href="/about/" class="hover:text-brand-gold transition-colors">About</a>
          <a href="/team/" class="hover:text-brand-gold transition-colors">Team</a>
          <a href="/blog/" class="hover:text-brand-gold transition-colors">Blog</a>
          <a href="/#contact" class="hover:text-brand-gold transition-colors">Contact</a>
        </nav>
      </div>
    </header>
  `;

  const footerHtml = `
    <footer class="bg-brand-navy text-white pt-20 pb-12 border-t border-brand-gold/20">
      <div class="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <div class="space-y-4">
          <h4 class="font-serif text-2xl text-white">Resen Legal & Consultancy</h4>
          <p class="text-sm text-brand-offwhite/60 font-light leading-relaxed">
            Premier boutique international law firm based in Istanbul and London, delivering high-stakes legal solutions in Turkish citizenship, immigration, corporate structuring, and cross-border commercial transactions.
          </p>
        </div>
        <div>
          <h5 class="text-xs uppercase tracking-[0.25em] font-bold text-brand-gold mb-4">Practice Areas</h5>
          <ul class="space-y-2 text-sm text-brand-offwhite/70">
            ${mergedServices.slice(0, 6).map((s: any) => `
              <li><a href="/service/${(s.id || '').toString().trim().toLowerCase()}/" class="hover:text-brand-gold transition-colors">${getServerTranslation(s.title, 'en')}</a></li>
            `).join('')}
          </ul>
        </div>
        <div>
          <h5 class="text-xs uppercase tracking-[0.25em] font-bold text-brand-gold mb-4">Quick Links</h5>
          <ul class="space-y-2 text-sm text-brand-offwhite/70">
            <li><a href="/" class="hover:text-brand-gold transition-colors">Home</a></li>
            <li><a href="/services/" class="hover:text-brand-gold transition-colors">All Services</a></li>
            <li><a href="/about/" class="hover:text-brand-gold transition-colors">About Us</a></li>
            <li><a href="/team/" class="hover:text-brand-gold transition-colors">Our Team</a></li>
            <li><a href="/blog/" class="hover:text-brand-gold transition-colors">Legal Insights</a></li>
            <li><a href="/#contact" class="hover:text-brand-gold transition-colors">Contact</a></li>
          </ul>
        </div>
        <div>
          <h5 class="text-xs uppercase tracking-[0.25em] font-bold text-brand-gold mb-4">Contact & Office</h5>
          <p class="text-sm text-brand-offwhite/70 mb-2">Istanbul & London</p>
          <p class="text-sm text-brand-offwhite/70 mb-2"><a href="mailto:info@resenlegal.com" class="hover:text-brand-gold">info@resenlegal.com</a></p>
          <p class="text-sm text-brand-offwhite/70"><a href="tel:+905467962854" class="hover:text-brand-gold">+90 546 796 28 54</a></p>
        </div>
      </div>
      <div class="max-w-7xl mx-auto px-6 lg:px-12 pt-8 border-t border-white/10 text-xs text-brand-offwhite/40 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>© ${new Date().getFullYear()} Resen Legal & Consultancy. All rights reserved.</div>
        <div class="flex gap-6">
          <a href="/services/" class="hover:text-brand-gold">Services</a>
          <a href="/blog/" class="hover:text-brand-gold">Insights</a>
          <a href="/about/" class="hover:text-brand-gold">About</a>
        </div>
      </div>
    </footer>
  `;

  // Prerender Blog posts
  console.log("Prerendering blog detail pages...");
  const publishedPosts = mergedPosts
    .filter((post) => isPostPublishedPrerender(post))
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
  
  for (const post of publishedPosts) {
    const slug = getPostSlug(post);
    if (!slug || slug === "[slug]") continue;
    
    let html = htmlTemplate;
    const postLang = (post.language || "tr").toLowerCase().startsWith("en") ? "en" : "tr";
    const postTitle = getServerTranslation(post.title, postLang, post.language);
    const postExcerpt = getServerTranslation(post.excerpt, postLang, post.language);
    const postContent = getServerTranslation(post.content, postLang, post.language);

    const getPrerenderCategory = (cat: string | undefined, lang: string): string => {
      if (!cat) return lang === "tr" ? "Hukuki Analizler" : "Legal Insights";
      const trimmed = cat.trim().toLowerCase();
      if (trimmed === "private international law" || trimmed === "milletlerası özel hukuk" || trimmed === "milletlerarası özel hukuk" || trimmed === "uluslararası özel hukuk") {
        return lang === "tr" ? "Milletlerarası Özel Hukuk" : "Private International Law";
      }
      if (trimmed === "immigration") {
        return lang === "tr" ? "Göç Hukuku" : "Immigration Law";
      }
      if (trimmed === "corporate") {
        return lang === "tr" ? "Şirketler ve Ticaret Hukuku" : "Commercial & Corporate Law";
      }
      const service = mergedServices.find((srv: any) => {
        if (!srv.title) return false;
        return Object.values(srv.title).some(
          (val) => typeof val === "string" && val.trim().toLowerCase() === trimmed
        );
      });
      if (service && service.title) {
        return service.title[lang] || service.title["en"] || Object.values(service.title)[0] || cat;
      }
      return cat;
    };

    const postCategory = getPrerenderCategory(post.category, postLang);
    const postDate = post.date || "2026-06-16";
    const postKeywords = post.seoKeywords ? `${postTitle}, ${postCategory}, ${post.seoKeywords}` : `${postTitle}, ${postCategory}, legal insights, blog`;
    const postImage = post.image || "https://res.cloudinary.com/dlrsifk2y/image/upload/v1783084549/og_xi5mco.jpg";
    const postCanonical = `https://resenlegal.com/blog/${slug}/`;
    
    // Create Article Schema
    const articleStructuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": postTitle,
      "description": postExcerpt,
      "image": [postImage],
      "datePublished": postDate,
      "dateModified": postDate,
      "author": {
        "@type": "Person",
        "name": "Resen Legal Team"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Resen Legal & Consultancy",
        "logo": {
          "@type": "ImageObject",
          "url": "https://res.cloudinary.com/dlrsifk2y/image/upload/v1778684376/favicon_yatsiz.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": postCanonical
      }
    };
    
    const siteName = "Resen Legal & Consultancy";
    const fullTitle = post.metaTitle ? post.metaTitle : `${postTitle} | ${siteName}`;
    
    // Replace page-level lang on <html> structure
    html = html.replace('<html lang="en">', `<html lang="${postLang}">`);
    
    // Replace Head elements with dynamic properties
    html = html.replace(/<title data-static="true">.*?<\/title>/, `<title>${fullTitle}</title>`);
    html = html.replace(/<meta data-static="true" name="title" content="[^"]*"\s*\/?>/, `<meta name="title" content="${fullTitle.replace(/"/g, '&quot;')}" />`);
    html = html.replace(/<meta data-static="true" name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${postExcerpt.replace(/"/g, '&quot;')}" />`);
    html = html.replace(/<meta data-static="true" name="keywords" content="[^"]*"\s*\/?>/, `<meta name="keywords" content="${postKeywords.replace(/"/g, '&quot;')}" />`);
    
    html = html.replace(/<meta data-static="true" property="og:type" content="[^"]*"\s*\/?>/, `<meta property="og:type" content="article" />`);
    const postLocale = postLang === "tr" ? "tr_TR" : "en_US";
    html = html.replace(/<meta data-static="true" property="og:locale" content="[^"]*"\s*\/?>/, `<meta property="og:locale" content="${postLocale}" />`);
    html = html.replace(/<meta data-static="true" property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${fullTitle.replace(/"/g, '&quot;')}" />`);
    html = html.replace(/<meta data-static="true" property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${postExcerpt.replace(/"/g, '&quot;')}" />`);
    html = html.replace(/<meta data-static="true" property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${postCanonical}" />`);
    const postSocialThumbnail = getSocialThumbnailUrl(postImage);
    html = html.replace(/<meta data-static="true" property="og:image" content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${postSocialThumbnail}" />\n    <meta property="og:image:width" content="256" />\n    <meta property="og:image:height" content="256" />`);
    
    html = html.replace(/<meta data-static="true" property="twitter:card" content="[^"]*"\s*\/?>/, `<meta property="twitter:card" content="summary" />`);
    html = html.replace(/<meta data-static="true" property="twitter:title" content="[^"]*"\s*\/?>/, `<meta property="twitter:title" content="${fullTitle.replace(/"/g, '&quot;')}" />`);
    html = html.replace(/<meta data-static="true" property="twitter:description" content="[^"]*"\s*\/?>/, `<meta property="twitter:description" content="${postExcerpt.replace(/"/g, '&quot;')}" />`);
    html = html.replace(/<meta data-static="true" property="twitter:url" content="[^"]*"\s*\/?>/, `<meta property="twitter:url" content="${postCanonical}" />`);
    html = html.replace(/<meta data-static="true" property="twitter:image" content="[^"]*"\s*\/?>/, `<meta property="twitter:image" content="${postSocialThumbnail}" />`);
    
    // Replace the default canonical tag
    if (html.includes('<link rel="canonical" href="https://resenlegal.com/" />')) {
      html = html.replace('<link rel="canonical" href="https://resenlegal.com/" />', `<link rel="canonical" href="${postCanonical}" />`);
    } else {
      html = html.replace('</head>', `<link rel="canonical" href="${postCanonical}" />\n</head>`);
    }
    // Inject custom structured data script
    html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(articleStructuredData)}</script>\n</head>`);
    
    // Select related posts (same language-aware rules as client-side BlogPostDetail.tsx)
    const getPostLanguage = (p: any) => (p.language || "tr").toLowerCase().startsWith("en") ? "en" : "tr";
    const otherPosts = publishedPosts.filter(p => p.id !== post.id);

    let related = otherPosts
      .filter(p => getPostLanguage(p) === postLang && p.category && post.category && p.category.trim().toLowerCase() === post.category.trim().toLowerCase())
      .sort((a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime())
      .slice(0, 3);

    if (related.length === 0) {
      related = otherPosts
        .filter(p => p.category && post.category && p.category.trim().toLowerCase() === post.category.trim().toLowerCase())
        .sort((a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime())
        .slice(0, 3);
    }

    if (related.length === 0) {
      related = otherPosts
        .filter(p => getPostLanguage(p) === postLang)
        .sort((a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime())
        .slice(0, 2);
    }

    if (related.length === 0) {
      related = otherPosts
        .sort((a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime())
        .slice(0, 2);
    }

    const continueReadingText = postLang === "tr" ? "OKUMAYA DEVAM ET" : "CONTINUE READING";
    const relatedInsightsText = postLang === "tr" ? "İlgili Yazılar" : "Related Insights";
    const exploreAllPostsText = postLang === "tr" ? "Tüm yazıları keşfet" : "Explore all posts";
    const readArticleText = postLang === "tr" ? "Makaleyi Oku" : "Read Article";

    let relatedCardsHtml = "";
    if (related.length > 0) {
      relatedCardsHtml = related.map((rPost) => {
        const rPostSlug = getPostSlug(rPost);
        const rPostTitle = getServerTranslation(rPost.title, postLang, rPost.language);
        const rPostCategory = getPrerenderCategory(rPost.category, postLang);
        const rPostImage = rPost.image || "https://res.cloudinary.com/dlrsifk2y/image/upload/v1783084549/og_xi5mco.jpg";

        let authorName = "Resen Legal Team";
        if (rPost.authorId) {
          if (rPost.authorId === "resen-legal") {
            authorName = "Resen Legal";
          } else {
            const author = MOCK_TEAM.find((m: any) => m.id === rPost.authorId);
            if (author) {
              authorName = author.name;
            }
          }
        }

        return `
          <article style="background-color: rgba(255, 255, 255, 0.5); border: 1px solid transparent; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); padding: 1rem; display: flex; flex-direction: column; height: 100%; transition: all 0.5s ease;">
            <a href="/blog/${rPostSlug}/" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; height: 100%;">
              <div style="aspect-ratio: 16/9; background-color: #f3f4f6; border-radius: 2px; overflow: hidden; margin-bottom: 1.5rem; position: relative;">
                <img src="${rPostImage}" alt="${rPostTitle.replace(/"/g, '&quot;')}" style="width: 100%; height: 100%; object-fit: cover;" referrerPolicy="no-referrer" />
              </div>
              <div style="display: flex; flex-direction: column; flex-grow: 1;">
                <div style="color: #BC9C53; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: bold; margin-bottom: 1rem;">
                  ${rPostCategory}
                </div>
                <h4 style="font-size: 1.5rem; font-family: serif; color: #064E3B; margin: 0 0 1.5rem 0; line-height: 1.25;">
                  ${rPostTitle}
                </h4>
                <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 1.5rem; margin-top: auto; border-top: 1px solid rgba(6, 78, 59, 0.05);">
                  <div style="padding: 0.5rem 1rem; background-color: rgba(6, 78, 59, 0.05); border-radius: 2px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 900; color: #064E3B; display: inline-flex; align-items: center; gap: 0.5rem;">
                    ${readArticleText} →
                  </div>
                  <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: bold; color: rgba(6, 78, 59, 0.4); display: flex; align-items: center; gap: 0.5rem;">
                    <span style="opacity: 0.5;">${postLang === "tr" ? "Yazar:" : "By"}</span>
                    <span style="color: #064E3B;">${authorName}</span>
                  </div>
                </div>
              </div>
            </a>
          </article>
        `;
      }).join("");
    }

    const relatedGridHtml = relatedCardsHtml
      ? `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 3rem;">
            ${relatedCardsHtml}
          </div>`
      : "";

    const relatedSectionHtml = `
      <div style="margin-top: 10rem; padding-top: 5rem; border-top: 1px solid rgba(6, 78, 59, 0.05);" class="blog-related-posts">
        <div style="display: flex; flex-direction: column; align-items: center; text-align: center; justify-content: center; margin-bottom: 4rem; max-width: 42rem; margin-left: auto; margin-right: auto; gap: 1.5rem;">
          <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
            <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.4em; font-weight: 500; color: #BC9C53; margin-bottom: 1rem; text-align: center;">
              ${continueReadingText}
            </div>
            <h3 style="font-size: 2.25rem; font-family: serif; color: #064E3B; text-align: center; margin: 0; line-height: 1.25;">
              ${relatedInsightsText}
            </h3>
          </div>
          <a href="/blog/" style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.25em; font-weight: 900; color: #BC9C53; text-decoration: none; border-bottom: 1px solid rgba(188, 156, 83, 0.25); padding-bottom: 0.5rem; display: inline-block;">
            ${exploreAllPostsText}
          </a>
        </div>
        ${relatedGridHtml}
      </div>
    `;

    // Inject the complete content structure inside #root container to bypass Client-only SPA blank spots
    const bodySkeleton = `
      <div style="padding: 2rem; max-width: 800px; margin: 0 auto; font-family: sans-serif;">
        <h1 style="font-size: 2.5rem; font-weight: bold; line-height: 1.2; margin-bottom: 1rem; color: #0f172a;">${postTitle}</h1>
        <div style="font-size: 0.875rem; color: #64748b; margin-bottom: 2rem;">
          <span>Date: ${postDate}</span> | <span>Category: ${postCategory}</span>
        </div>
        <div style="font-size: 1.125rem; line-height: 1.75; color: #334155;">
          ${postContent}
        </div>
        ${relatedSectionHtml}
      </div>
    `;
    html = html.replace('<div id="root"></div>', `<div id="root">${bodySkeleton}</div>`);
    
    // Write out to dist/blog/:slug/index.html
    const postDir = path.join(distPath, "blog", slug);
    if (!fs.existsSync(postDir)) {
      fs.mkdirSync(postDir, { recursive: true });
    }
    fs.writeFileSync(path.join(postDir, "index.html"), html, "utf-8");
  }

  // Prerender Services
  console.log("Prerendering service detail pages...");
  
  for (const service of mergedServices) {
    const serviceId = (service.id || "").toString().trim().toLowerCase();
    if (!serviceId) continue;
    
    let html = htmlTemplate;
    const priorityDetail = PRIORITY_SERVICES_DETAILED_CONTENT[serviceId] || null;
    const serviceTitle = getServerTranslation(service.title, "en");
    const serviceDescription = priorityDetail 
      ? priorityDetail.leadSummary.en.slice(0, 160) 
      : getServerTranslation(service.description, "en");
    const serviceCanonical = `https://resenlegal.com/service/${serviceId}/`;
    const serviceKeywords = priorityDetail 
      ? `${serviceTitle}, ${priorityDetail.metaKeywords.join(', ')}`
      : `${serviceTitle}, legal services, expert counsel, Resen Legal, legal consultancy`;
    const serviceImage = "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80";
    
    const siteName = "Resen Legal & Consultancy";
    const fullTitle = `${serviceTitle} | ${siteName}`;
    
    // Replace Head elements with dynamic properties
    html = html.replace(/<title data-static="true">.*?<\/title>/, `<title>${fullTitle}</title>`);
    html = html.replace(/<meta data-static="true" name="title" content="[^"]*"\s*\/?>/, `<meta name="title" content="${fullTitle.replace(/"/g, '&quot;')}" />`);
    html = html.replace(/<meta data-static="true" name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${serviceDescription.replace(/"/g, '&quot;')}" />`);
    html = html.replace(/<meta data-static="true" name="keywords" content="[^"]*"\s*\/?>/, `<meta name="keywords" content="${serviceKeywords.replace(/"/g, '&quot;')}" />`);
    
    html = html.replace(/<meta data-static="true" property="og:type" content="[^"]*"\s*\/?>/, `<meta property="og:type" content="website" />`);
    html = html.replace(/<meta data-static="true" property="og:locale" content="[^"]*"\s*\/?>/, `<meta property="og:locale" content="en_US" />`);
    html = html.replace(/<meta data-static="true" property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${fullTitle.replace(/"/g, '&quot;')}" />`);
    html = html.replace(/<meta data-static="true" property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${serviceDescription.replace(/"/g, '&quot;')}" />`);
    html = html.replace(/<meta data-static="true" property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${serviceCanonical}" />`);
    html = html.replace(/<meta data-static="true" property="og:image" content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${serviceImage}" />`);
    
    html = html.replace(/<meta data-static="true" property="twitter:title" content="[^"]*"\s*\/?>/, `<meta property="twitter:title" content="${fullTitle.replace(/"/g, '&quot;')}" />`);
    html = html.replace(/<meta data-static="true" property="twitter:description" content="[^"]*"\s*\/?>/, `<meta property="twitter:description" content="${serviceDescription.replace(/"/g, '&quot;')}" />`);
    html = html.replace(/<meta data-static="true" property="twitter:url" content="[^"]*"\s*\/?>/, `<meta property="twitter:url" content="${serviceCanonical}" />`);
    html = html.replace(/<meta data-static="true" property="twitter:image" content="[^"]*"\s*\/?>/, `<meta property="twitter:image" content="${serviceImage}" />`);
    
    // Replace the default canonical tag
    if (html.includes('<link rel="canonical" href="https://resenlegal.com/" />')) {
      html = html.replace('<link rel="canonical" href="https://resenlegal.com/" />', `<link rel="canonical" href="${serviceCanonical}" />`);
    } else {
      html = html.replace('</head>', `<link rel="canonical" href="${serviceCanonical}" />\n</head>`);
    }

    // Inject Service JSON-LD Structured Data
    const serviceStructuredData = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": serviceTitle,
      "description": serviceDescription,
      "provider": {
        "@type": "LegalService",
        "name": "Resen Legal & Consultancy",
        "url": "https://resenlegal.com/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://res.cloudinary.com/dlrsifk2y/image/upload/v1778684376/favicon_yatsiz.png"
        },
        "telephone": "+905467962854",
        "email": "info@resenlegal.com"
      }
    };
    html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(serviceStructuredData)}</script>\n</head>`);
    
    // Bullets translation or fallback
    const bulletsList = service.bullets?.en || [
      'Strategic Case Assessment',
      'Regulatory Compliance Audit',
      'High-Stakes Representation',
      'Cross-Border Legal Architecture'
    ];
    
    const bulletsHtml = bulletsList.map((feature: string) => `
      <div class="flex-1 min-w-[250px] p-4 border border-theme-border rounded-sm bg-white shadow-sm">
        <span class="font-medium text-brand-navy">✓ ${feature}</span>
      </div>
    `).join("");
    
    // Find related blog posts for this service (mirroring ServiceDetail.tsx)
    const configuredCat = service.relatedCategory?.trim();
    let matchedPosts: any[] = [];
    if (configuredCat) {
      matchedPosts = publishedPosts.filter(post => {
        const cat = post.category || '';
        return cat.toLowerCase() === configuredCat.toLowerCase() || 
               cat.toLowerCase().includes(configuredCat.toLowerCase()) || 
               configuredCat.toLowerCase().includes(cat.toLowerCase());
      });
    }
    if (matchedPosts.length === 0) {
      const serviceEnTitle = service.title?.en;
      matchedPosts = publishedPosts.filter(post => {
        const cat = post.category;
        return cat === serviceId || (serviceEnTitle && cat === serviceEnTitle);
      });
    }
    if (matchedPosts.length < 2) {
      const remaining = publishedPosts.filter(post => !matchedPosts.find(m => m.id === post.id));
      matchedPosts = [...matchedPosts, ...remaining.slice(0, 2 - matchedPosts.length)];
    }
    const relatedPostsForService = matchedPosts.slice(0, 2);

    const relatedPostsHtml = relatedPostsForService.length > 0 ? `
      <div class="mt-12 pt-8 border-t border-brand-navy/10">
        <div class="text-xs uppercase tracking-[0.2em] text-brand-gold font-bold mb-2">Related Insights</div>
        <h4 class="text-2xl font-serif text-brand-navy mb-6">Articles & Legal Advisory</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${relatedPostsForService.map((p: any) => {
            const pSlug = getPostSlug(p);
            const pTitle = getServerTranslation(p.title, 'en', p.language);
            const pCat = getPrerenderCategory(p.category, 'en');
            const pExcerpt = getServerTranslation(p.excerpt, 'en', p.language) || '';
            return `
              <div class="p-6 bg-white border border-brand-navy/5 rounded-sm shadow-sm flex flex-col justify-between">
                <div>
                  <div class="text-brand-gold text-[10px] uppercase tracking-wider font-bold mb-2">${pCat}</div>
                  <h5 class="text-lg font-serif text-brand-navy mb-2">
                    <a href="/blog/${pSlug}/" class="text-brand-navy hover:text-brand-gold transition-colors">${pTitle}</a>
                  </h5>
                  <p class="text-gray-500 font-light text-xs line-clamp-2 mb-4">${pExcerpt}</p>
                </div>
                <a href="/blog/${pSlug}/" class="text-xs uppercase tracking-widest font-black text-brand-gold hover:text-brand-navy transition-colors">
                  Read Article →
                </a>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    ` : '';

    const otherServicesList = mergedServices
      .filter((s: any) => (s.id || '').toString().trim().toLowerCase() !== serviceId)
      .slice(0, 5);
    const otherServicesHtml = `
      <div class="p-6 bg-white border border-brand-navy/5 rounded-sm shadow-sm">
        <div class="text-xs uppercase tracking-[0.2em] text-brand-gold font-bold mb-4">Other Practice Areas</div>
        <ul class="space-y-3 text-sm">
          ${otherServicesList.map((s: any) => {
            const oId = (s.id || '').toString().trim().toLowerCase();
            const oTitle = getServerTranslation(s.title, 'en');
            return `
              <li>
                <a href="/service/${oId}/" class="text-brand-navy hover:text-brand-gold font-medium transition-colors flex items-center justify-between">
                  <span>${oTitle}</span>
                  <span class="text-brand-gold text-xs">→</span>
                </a>
              </li>
            `;
          }).join('')}
        </ul>
      </div>
    `;

    // Inject the complete content structure inside #root container to bypass Client-only SPA blank spots
    const bodySkeleton = `
      <div class="min-h-screen bg-bg-deep font-sans antialiased flex flex-col justify-between">
        ${navHtml}
        <main class="pt-32 pb-24 flex-grow">
          <div class="max-w-7xl mx-auto px-6 lg:px-12">
            <!-- Breadcrumbs / Back button -->
            <a href="/" class="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-brand-navy transition-colors mb-12">
              ← Back to Home
            </a>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-16">
              <div class="lg:col-span-2">
                <div class="text-brand-gold text-xs uppercase tracking-[0.4em] font-medium mb-6">
                  EXPERT PRACTICE AREA
                </div>
                <h1 class="text-5xl md:text-7xl font-serif text-brand-navy mb-8 leading-tight">
                  ${serviceTitle}
                </h1>
                
                ${priorityDetail ? `
                  <div style="margin-bottom: 2.5rem; padding: 2rem; background: #ffffff; border-left: 4px solid #BC9C53; border-radius: 2px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <p style="font-size: 1.15rem; font-family: serif; color: #064E3B; line-height: 1.7; margin: 0; font-style: italic;">
                      ${priorityDetail.leadSummary.en}
                    </p>
                  </div>
                ` : `
                  <p class="text-xl text-gray-700 font-light leading-relaxed mb-8">
                    ${serviceDescription}
                  </p>
                `}
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">
                  ${bulletsHtml}
                </div>

                ${priorityDetail ? `
                  <div style="margin-top: 2.5rem; display: flex; flex-direction: column; gap: 2rem;">
                    ${priorityDetail.sections.en.map((sec: any) => `
                      <section style="background: #ffffff; padding: 2.25rem; border: 1px solid rgba(6, 78, 59, 0.08); border-radius: 2px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
                        <h2 style="font-size: 1.75rem; font-family: serif; color: #064E3B; margin: 0 0 0.5rem 0; font-weight: bold;">${sec.title}</h2>
                        ${sec.subtitle ? `<div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.15em; color: #BC9C53; font-weight: 600; margin-bottom: 1.25rem;">${sec.subtitle}</div>` : ""}
                        <div style="font-size: 1rem; line-height: 1.8; color: #334155;">
                          ${sec.paragraphs.map((p: string) => `<p style="margin-bottom: 1rem;">${p}</p>`).join("")}
                        </div>
                        ${sec.calloutBox ? `
                          <div style="margin-top: 1.5rem; padding: 1.25rem; background: #faf9f6; border-left: 3.5px solid #BC9C53; border-radius: 2px;">
                            <strong style="display: block; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; color: #064E3B; margin-bottom: 0.5rem;">${sec.calloutBox.title}</strong>
                            <p style="font-size: 0.9rem; line-height: 1.6; color: #475569; margin: 0;">${sec.calloutBox.content}</p>
                          </div>
                        ` : ""}
                        ${sec.bulletPoints && sec.bulletPoints.length > 0 ? `
                          <div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem;">
                            ${sec.bulletPoints.map((bp: any) => `
                              <div style="padding: 0.85rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 2px;">
                                <strong style="color: #064E3B; font-size: 0.875rem;">▪ ${bp.title} ${bp.statuteRef ? `<span style="font-size: 0.75rem; color: #BC9C53; font-family: monospace;">(${bp.statuteRef})</span>` : ""}</strong>
                                <p style="font-size: 0.825rem; color: #64748b; margin: 0.25rem 0 0 0; line-height: 1.5;">${bp.description}</p>
                              </div>
                            `).join("")}
                          </div>
                        ` : ""}
                      </section>
                    `).join("")}

                    ${priorityDetail.relatedArticles.en.length > 0 ? `
                      <div style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid rgba(6, 78, 59, 0.1);">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;">
                          <div>
                            <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.2em; color: #BC9C53; font-weight: bold; margin-bottom: 0.25rem;">CONNECTED RESEARCH & GUIDES</div>
                            <h3 style="font-size: 1.5rem; font-family: serif; color: #064E3B; margin: 0;">Specialized Legal Publications for this Practice Area</h3>
                          </div>
                          <a href="/blog/" style="display: inline-flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: bold; color: #BC9C53; text-decoration: none; margin-top: 0.125rem; white-space: nowrap;">
                            <span>All Articles</span> →
                          </a>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
                          ${priorityDetail.relatedArticles.en.map((art: any) => `
                            <div style="padding: 1.25rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 2px;">
                              <span style="display: inline-block; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: #BC9C53; font-weight: bold; margin-bottom: 0.5rem;">${art.badge}</span>
                              <h4 style="font-size: 1.1rem; font-family: serif; color: #064E3B; margin: 0 0 0.5rem 0;">
                                <a href="/blog/${art.slug}/" style="color: #064E3B; text-decoration: none;">${art.title}</a>
                              </h4>
                              <p style="font-size: 0.8rem; color: #64748b; line-height: 1.5; margin-bottom: 0.75rem;">${art.description}</p>
                              <a href="/blog/${art.slug}/" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: bold; color: #BC9C53; text-decoration: none;">Read Article →</a>
                            </div>
                          `).join("")}
                        </div>
                      </div>
                    ` : ""}

                    ${priorityDetail.faqList.en.length > 0 ? `
                      <div style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid rgba(6, 78, 59, 0.1);">
                        <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.2em; color: #BC9C53; font-weight: bold; margin-bottom: 0.5rem;">LEGAL FAQ</div>
                        <h3 style="font-size: 1.5rem; font-family: serif; color: #064E3B; margin: 0 0 1.5rem 0;">Frequently Addressed Matters</h3>
                        <div style="display: flex; flex-direction: column; gap: 1rem;">
                          ${priorityDetail.faqList.en.map((faq: any) => `
                            <div style="padding: 1.25rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 2px;">
                              <h4 style="font-size: 0.95rem; font-weight: bold; color: #064E3B; margin: 0 0 0.5rem 0;">${faq.question}</h4>
                              <p style="font-size: 0.85rem; color: #475569; line-height: 1.6; margin: 0;">${faq.answer}</p>
                            </div>
                          `).join("")}
                        </div>
                      </div>
                    ` : ""}
                  </div>
                ` : ""}
                
                <div class="mt-12 bg-white p-8 border border-brand-navy/5 rounded-sm shadow-sm">
                  <h3 class="text-2xl font-serif text-brand-navy mb-4">Our Methodology</h3>
                  <p class="text-gray-600 font-light leading-relaxed mb-4">
                    We handle the matters that matter through a rigorous, four-stage process that combines in-depth research, multi-disciplinary consultation, and aggressive advocacy. Whether you are an enterprise seeking global stability or an individual navigating life-changing transitions, our counsel is direct, diligent, and future-proof.
                  </p>
                  <p class="text-gray-600 font-light leading-relaxed">
                    Our multidisciplinary team in Istanbul and London coordinates closely to ensure full compliance with Turkish administrative law, international treaties, and financial regulatory frameworks.
                  </p>
                </div>

                ${relatedPostsHtml}
              </div>

              <aside class="space-y-6">
                <div class="p-8 bg-white border border-brand-navy/10 rounded-sm shadow-sm">
                  <div class="text-xs uppercase tracking-[0.25em] text-brand-gold font-bold mb-3">Direct Counsel</div>
                  <h4 class="text-2xl font-serif text-brand-navy mb-4">Discuss Your Legal Matter</h4>
                  <p class="text-sm text-gray-600 font-light leading-relaxed mb-6">
                    Connect directly with our specialist legal team regarding ${serviceTitle} to receive a strategic case assessment.
                  </p>
                  <a href="/#contact" class="block w-full py-3 bg-brand-navy text-white font-bold text-center text-xs uppercase tracking-widest rounded-sm hover:bg-brand-navy/90 transition-all">
                    Schedule Consultation →
                  </a>
                </div>

                ${otherServicesHtml}
              </aside>
            </div>
          </div>
        </main>
        ${footerHtml}
      </div>
    `;
    html = html.replace('<div id="root"></div>', `<div id="root">${bodySkeleton}</div>`);
    
    // Write out to dist/service/:id/index.html
    const serviceDir = path.join(distPath, "service", serviceId);
    if (!fs.existsSync(serviceDir)) {
      fs.mkdirSync(serviceDir, { recursive: true });
    }
    fs.writeFileSync(path.join(serviceDir, "index.html"), html, "utf-8");
  }

  // Prerender homepage fallback skeleton in dist/index.html
  console.log("Prerendering homepage fallback skeleton in dist/index.html...");
  const homepageSkeleton = `
    <div class="min-h-screen bg-bg-deep font-sans antialiased flex flex-col justify-between">
      ${navHtml}
      <main class="flex-grow">
        <!-- Hero Section -->
        <section class="relative min-h-[85vh] flex items-center pt-28 pb-16 overflow-hidden">
          <div class="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
            <div>
              <div class="text-xs uppercase tracking-[0.4em] font-medium text-brand-gold mb-6">
                RESEN LEGAL & CONSULTANCY
              </div>
              <h1 class="text-4xl sm:text-5xl md:text-7xl font-serif leading-[0.95] text-brand-navy mb-8 break-words">
                We handle the matters that matter.
              </h1>
              <p class="text-lg md:text-xl text-gray-600 max-w-lg mb-10 leading-relaxed font-light">
                Resen Legal & Consultancy is a premier boutique international law firm based in Istanbul and London, specializing in Turkish citizenship by investment, residency, corporate law, real estate, and cross-border commercial transactions.
              </p>
              <div class="flex flex-wrap gap-4">
                <a href="/#contact" class="bg-brand-navy text-white px-8 py-4 rounded-sm font-medium tracking-wide shadow-xl shadow-brand-navy/10 hover:bg-brand-navy/90 transition-all text-center">
                  GET IN TOUCH
                </a>
                <a href="/services/" class="border border-brand-navy/20 text-brand-navy px-8 py-4 rounded-sm font-medium tracking-wide hover:bg-brand-navy/5 transition-all text-center">
                  OUR PRACTICE AREAS
                </a>
              </div>
            </div>
            <div class="relative">
              <div class="aspect-video md:aspect-[4/5] bg-gray-100 overflow-hidden rounded-sm relative shadow-2xl shadow-brand-navy/20">
                <img 
                  src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2000&auto=format&fit=crop" 
                  srcset="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=640&auto=format&fit=crop 640w, https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=960&auto=format&fit=crop 960w, https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1280&auto=format&fit=crop 1280w, https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2000&auto=format&fit=crop 2000w"
                  sizes="(max-width: 1023px) 100vw, 50vw"
                  alt="Legal Library"
                  loading="eager"
                  fetchpriority="high"
                  decoding="async"
                  class="w-full h-full object-cover object-center"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-brand-navy/40 to-transparent"></div>
              </div>
            </div>
          </div>
        </section>

        <!-- Practice Areas Grid -->
        <section class="py-20 bg-white border-t border-brand-navy/5">
          <div class="max-w-7xl mx-auto px-6 lg:px-12">
            <div class="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div>
                <div class="text-xs uppercase tracking-[0.3em] font-medium text-brand-gold mb-3">Our Expertise</div>
                <h2 class="text-3xl md:text-5xl font-serif text-brand-navy">Specialized Practice Areas</h2>
              </div>
              <a href="/services/" class="text-xs uppercase tracking-widest font-black text-brand-gold hover:text-brand-navy transition-colors">
                View All Services →
              </a>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              ${mergedServices.map((s: any) => {
                const sId = (s.id || '').toString().trim().toLowerCase();
                const sTitle = getServerTranslation(s.title, 'en');
                const sDesc = getServerTranslation(s.description, 'en');
                return `
                  <div class="p-8 bg-brand-offwhite/50 border border-brand-navy/5 rounded-sm shadow-sm flex flex-col justify-between hover:shadow-lg transition-shadow">
                    <div>
                      <div class="text-brand-gold text-[10px] uppercase tracking-[0.2em] font-bold mb-3">Practice Area</div>
                      <h3 class="text-2xl font-serif text-brand-navy mb-4">
                        <a href="/service/${sId}/" class="text-brand-navy hover:text-brand-gold transition-colors">${sTitle}</a>
                      </h3>
                      <p class="text-gray-600 font-light text-sm leading-relaxed mb-6">${sDesc}</p>
                    </div>
                    <a href="/service/${sId}/" class="text-xs uppercase tracking-widest font-black text-brand-gold hover:text-brand-navy transition-colors">
                      Explore Practice Area →
                    </a>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </section>

        <!-- Firm Overview / About Section -->
        <section class="py-20 bg-brand-offwhite">
          <div class="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div class="text-xs uppercase tracking-[0.3em] font-medium text-brand-gold mb-3">The Firm</div>
              <h2 class="text-3xl md:text-5xl font-serif text-brand-navy mb-6">Crafting Legal Solutions With Precision & Integrity</h2>
              <p class="text-gray-600 font-light text-base leading-relaxed mb-6">
                At Resen Legal & Consultancy, we bridge tradition and innovation. Based in Istanbul and London, our firm handles complex Turkish citizenship by investment, residency applications, corporate restructuring, real estate transactions, and high-stakes commercial disputes.
              </p>
              <div class="flex gap-4">
                <a href="/about/" class="text-xs uppercase tracking-widest font-black text-brand-gold hover:text-brand-navy transition-colors">
                  Learn More About Our Firm →
                </a>
              </div>
            </div>
            <div class="space-y-6">
              <div class="p-6 bg-white border border-brand-navy/5 rounded-sm shadow-sm">
                <h4 class="font-serif text-xl text-brand-navy mb-2">Leadership & Experience</h4>
                <p class="text-sm text-gray-500 font-light leading-relaxed mb-4">
                  Led by Mr. Fetanet Darıoğlu, our attorneys bring decades of collective jurisprudence and international consultancy to high-net-worth individuals and corporate entities.
                </p>
                <a href="/team/" class="text-xs uppercase tracking-widest font-bold text-brand-navy hover:text-brand-gold transition-colors">
                  Meet Our Team →
                </a>
              </div>
            </div>
          </div>
        </section>

        <!-- Latest Insights Section -->
        <section class="py-20 bg-white">
          <div class="max-w-7xl mx-auto px-6 lg:px-12">
            <div class="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div>
                <div class="text-xs uppercase tracking-[0.3em] font-medium text-brand-gold mb-3">Advisory & Commentary</div>
                <h2 class="text-3xl md:text-5xl font-serif text-brand-navy">Latest Legal Insights</h2>
              </div>
              <a href="/blog/" class="text-xs uppercase tracking-widest font-black text-brand-gold hover:text-brand-navy transition-colors">
                Explore All Insights →
              </a>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              ${publishedPosts.slice(0, 3).map((p: any) => {
                const pSlug = getPostSlug(p);
                const pTitle = getServerTranslation(p.title, 'en', p.language);
                const pCat = getPrerenderCategory(p.category, 'en');
                const pExcerpt = getServerTranslation(p.excerpt, 'en', p.language) || '';
                return `
                  <article class="p-6 bg-brand-offwhite/40 border border-brand-navy/5 rounded-sm shadow-sm flex flex-col justify-between">
                    <div>
                      <div class="text-brand-gold text-[10px] uppercase tracking-wider font-bold mb-2">${pCat}</div>
                      <h3 class="text-xl font-serif text-brand-navy mb-3">
                        <a href="/blog/${pSlug}/" class="text-brand-navy hover:text-brand-gold transition-colors">${pTitle}</a>
                      </h3>
                      <p class="text-gray-500 font-light text-xs line-clamp-3 mb-6">${pExcerpt}</p>
                    </div>
                    <a href="/blog/${pSlug}/" class="text-xs uppercase tracking-widest font-black text-brand-gold hover:text-brand-navy transition-colors">
                      Read Analysis →
                    </a>
                  </article>
                `;
              }).join('')}
            </div>
          </div>
        </section>
      </main>
      ${footerHtml}
    </div>
  `;
  let homepageHtml = htmlTemplate.replace('<div id="root"></div>', `<div id="root">${homepageSkeleton}</div>`);
  const homepageStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://resenlegal.com/#website",
        "url": "https://resenlegal.com/",
        "name": "Resen Legal & Consultancy",
        "description": "Premier boutique international law firm in Istanbul and London."
      },
      {
        "@type": "LegalService",
        "@id": "https://resenlegal.com/#organization",
        "name": "Resen Legal & Consultancy",
        "url": "https://resenlegal.com/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://res.cloudinary.com/dlrsifk2y/image/upload/v1778684376/favicon_yatsiz.png"
        },
        "image": "https://res.cloudinary.com/dlrsifk2y/image/upload/v1783084549/og_xi5mco.jpg",
        "description": "Resen Legal & Consultancy is a premier boutique international law firm based in Istanbul and London, specializing in Turkish citizenship by investment, residency, corporate law, real estate, and cross-border commercial transactions.",
        "email": "info@resenlegal.com",
        "telephone": "+905467962854",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Istanbul",
          "addressCountry": "TR"
        }
      },
      {
        "@type": "Person",
        "@id": "https://resenlegal.com/#fetanet-darioglu",
        "name": "Fetanet Darıoğlu",
        "alternateName": [
          "Fetanet Darioglu",
          "Mr. Fetanet Darıoğlu",
          "Mr. Fetanet Darioglu",
          "Av. Fetanet Darıoğlu"
        ],
        "honorificPrefix": "Mr.",
        "gender": "https://schema.org/Male",
        "pronouns": "he/him",
        "jobTitle": "Founder & Principal Lawyer",
        "email": "fetanet@resenlegal.com",
        "image": "https://res.cloudinary.com/dlrsifk2y/image/upload/f_auto,q_auto/fetanet_y230cj",
        "url": "https://resenlegal.com/#team",
        "worksFor": {
          "@id": "https://resenlegal.com/#organization"
        },
        "knowsLanguage": ["Turkish", "English"]
      }
    ]
  };
  homepageHtml = homepageHtml.replace('</head>', `<script type="application/ld+json">${JSON.stringify(homepageStructuredData)}</script>\n</head>`);
  fs.writeFileSync(templatePath, homepageHtml, "utf-8");

  // Prerender 4 static pages
  console.log("Prerendering static pages (/about, /team, /services, /blog, /resen-gate)...");
  const staticPages = [
    {
      path: "about",
      title: "About Us | Resen Legal & Consultancy",
      description: "Learn more about Resen Legal & Consultancy, our mission, values, and the expert legal team dedicated to providing excellence in legal practice.",
      keywords: "about Resen Legal, legal mission, legal values, expert lawyers, legal excellence Turkey",
      canonical: "https://resenlegal.com/about/",
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80",
    },
    {
      path: "team",
      title: "Our Team | Resen Legal & Consultancy",
      description: "Meet our expert team of legal professionals at Resen Legal & Consultancy. Excellence, diversity, and commitment to client success.",
      keywords: "legal team, expert lawyers, immigration lawyers, corporate law experts Turkey, Resen Legal team",
      canonical: "https://resenlegal.com/team/",
      image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80",
    },
    {
      path: "services",
      title: "Services | Resen Legal & Consultancy",
      description: "Explore our wide range of specialized legal services including immigration law, corporate consultancy, intellectual property, and GDPR compliance.",
      keywords: "legal services, immigration consultancy, corporate law, GDPR compliance, intellectual property law Turkey",
      canonical: "https://resenlegal.com/services/",
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80",
    },
    {
      path: "blog",
      title: "Blog | Resen Legal & Consultancy",
      description: "Stay updated with the latest legal insights, advisory, and professional commentary from our experts at Resen Legal & Consultancy.",
      keywords: "legal blog, law updates, legal insights, immigration news, corporate law articles, GDPR advice",
      canonical: "https://resenlegal.com/blog/",
      image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80",
    },
    {
      path: "resen-gate",
      title: "Resen Gate | Resen Legal & Consultancy",
      description: "Secure administrator access panel for Resen Legal & Consultancy CMS.",
      keywords: "admin, cms, login",
      canonical: "https://resenlegal.com/resen-gate/",
      image: "https://res.cloudinary.com/dlrsifk2y/image/upload/v1783084549/og_xi5mco.jpg",
      robots: "noindex, nofollow",
    }
  ];

  for (const page of staticPages) {
    let html = htmlTemplate;
    const fullTitle = page.title;
    
    // Replace Head elements with dynamic properties
    html = html.replace(/<title data-static="true">.*?<\/title>/, `<title>${fullTitle}</title>`);
    html = html.replace(/<meta data-static="true" name="title" content="[^"]*"\s*\/?>/, `<meta name="title" content="${fullTitle.replace(/"/g, '&quot;')}" />`);
    html = html.replace(/<meta data-static="true" name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${page.description.replace(/"/g, '&quot;')}" />`);
    html = html.replace(/<meta data-static="true" name="keywords" content="[^"]*"\s*\/?>/, `<meta name="keywords" content="${page.keywords.replace(/"/g, '&quot;')}" />`);
    
    html = html.replace(/<meta data-static="true" property="og:type" content="[^"]*"\s*\/?>/, `<meta property="og:type" content="website" />`);
    html = html.replace(/<meta data-static="true" property="og:locale" content="[^"]*"\s*\/?>/, `<meta property="og:locale" content="en_US" />`);
    html = html.replace(/<meta data-static="true" property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${fullTitle.replace(/"/g, '&quot;')}" />`);
    html = html.replace(/<meta data-static="true" property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${page.description.replace(/"/g, '&quot;')}" />`);
    html = html.replace(/<meta data-static="true" property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${page.canonical}" />`);
    html = html.replace(/<meta data-static="true" property="og:image" content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${page.image}" />`);
    
    html = html.replace(/<meta data-static="true" property="twitter:title" content="[^"]*"\s*\/?>/, `<meta property="twitter:title" content="${fullTitle.replace(/"/g, '&quot;')}" />`);
    html = html.replace(/<meta data-static="true" property="twitter:description" content="[^"]*"\s*\/?>/, `<meta property="twitter:description" content="${page.description.replace(/"/g, '&quot;')}" />`);
    html = html.replace(/<meta data-static="true" property="twitter:url" content="[^"]*"\s*\/?>/, `<meta property="twitter:url" content="${page.canonical}" />`);
    html = html.replace(/<meta data-static="true" property="twitter:image" content="[^"]*"\s*\/?>/, `<meta property="twitter:image" content="${page.image}" />`);
    
    // Replace the default canonical tag
    if (html.includes('<link rel="canonical" href="https://resenlegal.com/" />')) {
      html = html.replace('<link rel="canonical" href="https://resenlegal.com/" />', `<link rel="canonical" href="${page.canonical}" />`);
    } else {
      html = html.replace('</head>', `<link rel="canonical" href="${page.canonical}" />\n</head>`);
    }

    // Inject robots meta if configured
    if ('robots' in page && page.robots) {
      html = html.replace('</head>', `<meta name="robots" content="${page.robots}" />\n</head>`);
    }

    // Inject static page JSON-LD Structured Data
    let staticStructuredData: any = null;
    if (page.path === "about") {
      staticStructuredData = {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": "About Us | Resen Legal & Consultancy",
        "url": "https://resenlegal.com/about/",
        "description": page.description,
        "isPartOf": {
          "@type": "WebSite",
          "name": "Resen Legal & Consultancy",
          "url": "https://resenlegal.com/"
        }
      };
    } else if (page.path === "services") {
      staticStructuredData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Services | Resen Legal & Consultancy",
        "url": "https://resenlegal.com/services/",
        "description": page.description,
        "mainEntity": {
          "@type": "ItemList",
          "name": "Legal Services Catalog",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "url": "https://resenlegal.com/service/citizenship-immigration-law/",
              "name": "Citizenship & Immigration Law"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "url": "https://resenlegal.com/service/commercial-corporate-law/",
              "name": "Commercial & Corporate Law"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "url": "https://resenlegal.com/service/real-estate-property-law/",
              "name": "Real Estate & Property Law"
            },
            {
              "@type": "ListItem",
              "position": 4,
              "url": "https://resenlegal.com/service/global-mobility-visa/",
              "name": "Global Mobility & Visa Services"
            },
            {
              "@type": "ListItem",
              "position": 5,
              "url": "https://resenlegal.com/service/inheritance-private-client/",
              "name": "Inheritance & Private Client Services"
            },
            {
              "@type": "ListItem",
              "position": 6,
              "url": "https://resenlegal.com/service/family-matrimonial-law/",
              "name": "Family & Matrimonial Law"
            },
            {
              "@type": "ListItem",
              "position": 7,
              "url": "https://resenlegal.com/service/data-protection-law/",
              "name": "Data Protection & KVKK Law"
            },
            {
              "@type": "ListItem",
              "position": 8,
              "url": "https://resenlegal.com/service/human-rights-administrative/",
              "name": "Human Rights & Administrative Law"
            },
            {
              "@type": "ListItem",
              "position": 9,
              "url": "https://resenlegal.com/service/labor-employment-law/",
              "name": "Labor & Employment Law"
            }
          ]
        }
      };
    } else if (page.path === "team") {
      staticStructuredData = {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": "Our Team | Resen Legal & Consultancy",
        "url": "https://resenlegal.com/team/",
        "description": page.description,
        "mainEntity": {
          "@type": "ItemList",
          "name": "Legal Professionals",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "item": {
                "@type": "Person",
                "@id": "https://resenlegal.com/#fetanet-darioglu",
                "name": "Fetanet Darıoğlu",
                "alternateName": [
                  "Fetanet Darioglu",
                  "Mr. Fetanet Darıoğlu",
                  "Mr. Fetanet Darioglu",
                  "Av. Fetanet Darıoğlu"
                ],
                "honorificPrefix": "Mr.",
                "gender": "https://schema.org/Male",
                "pronouns": "he/him",
                "jobTitle": "Founder & Principal Lawyer",
                "email": "fetanet@resenlegal.com",
                "image": "https://res.cloudinary.com/dlrsifk2y/image/upload/f_auto,q_auto/fetanet_y230cj",
                "url": "https://resenlegal.com/#team",
                "worksFor": {
                  "@id": "https://resenlegal.com/#organization"
                },
                "knowsLanguage": ["Turkish", "English"]
              }
            },
            {
              "@type": "ListItem",
              "position": 2,
              "item": {
                "@type": "Person",
                "name": "Yunus Emre Çakmak",
                "jobTitle": "Senior Lawyer",
                "email": "yunusemre@resenlegal.com"
              }
            },
            {
              "@type": "ListItem",
              "position": 3,
              "item": {
                "@type": "Person",
                "name": "Kerim Said Akyüz",
                "jobTitle": "Senior Lawyer",
                "email": "kerimsaid@resenlegal.com"
              }
            }
          ]
        }
      };
    } else if (page.path === "blog") {
      staticStructuredData = {
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "Blog | Resen Legal & Consultancy",
        "url": "https://resenlegal.com/blog/",
        "description": page.description,
        "publisher": {
          "@type": "Organization",
          "name": "Resen Legal & Consultancy",
          "logo": {
            "@type": "ImageObject",
            "url": "https://res.cloudinary.com/dlrsifk2y/image/upload/v1778684376/favicon_yatsiz.png"
          }
        }
      };
    }

    if (staticStructuredData) {
      html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(staticStructuredData)}</script>\n</head>`);
    }

    // Inject the complete content structure inside #root container to bypass Client-only SPA blank spots
    const headingText = page.title.split(" | ")[0];
    let bodySkeleton = "";

    if (page.path === "blog") {
      bodySkeleton = `
        <div class="min-h-screen bg-bg-deep font-sans antialiased flex flex-col justify-between">
          ${navHtml}
          <main class="pt-24 flex-grow">
            <div class="relative h-[35vh] min-h-[280px] w-full bg-brand-navy flex items-center justify-center overflow-hidden">
              <div class="absolute inset-0 opacity-20">
                <img src="${page.image}" alt="${headingText}" class="w-full h-full object-cover" />
              </div>
              <div class="relative z-10 text-center px-6">
                <div class="text-[10px] uppercase tracking-[0.4em] text-brand-gold mb-4 font-bold">LEGAL INSIGHTS & ADVISORY</div>
                <h1 class="text-4xl md:text-6xl font-serif text-white mb-4">${headingText}</h1>
                <div class="w-24 h-1 bg-brand-gold mx-auto mb-4"></div>
                <p class="text-sm md:text-base text-brand-offwhite/80 max-w-2xl mx-auto font-light leading-relaxed">${page.description}</p>
              </div>
            </div>

            <!-- Recent Articles Grid -->
            <section class="max-w-7xl mx-auto px-6 lg:px-12 py-16">
              <div class="flex items-center justify-between mb-10">
                <h2 class="text-2xl font-serif text-brand-navy">Recent Legal Commentary</h2>
                <div class="text-xs uppercase tracking-wider text-gray-500">${publishedPosts.length} Published Articles</div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                ${publishedPosts.slice(0, 9).map((p: any) => {
                  const pSlug = getPostSlug(p);
                  const pTitle = getServerTranslation(p.title, 'en', p.language);
                  const pCat = getPrerenderCategory(p.category, 'en');
                  const pExcerpt = getServerTranslation(p.excerpt, 'en', p.language) || '';
                  const pDate = p.date || '';
                  return `
                    <article class="p-6 bg-white border border-brand-navy/5 rounded-sm shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                      <div>
                        <div class="flex items-center justify-between gap-2 mb-3">
                          <span class="text-brand-gold text-[10px] uppercase tracking-wider font-bold">${pCat}</span>
                          <time class="text-gray-400 text-xs">${pDate}</time>
                        </div>
                        <h3 class="text-xl font-serif text-brand-navy mb-3">
                          <a href="/blog/${pSlug}/" class="text-brand-navy hover:text-brand-gold transition-colors">${pTitle}</a>
                        </h3>
                        <p class="text-gray-500 font-light text-xs line-clamp-3 mb-6">${pExcerpt}</p>
                      </div>
                      <a href="/blog/${pSlug}/" class="text-xs uppercase tracking-widest font-black text-brand-gold hover:text-brand-navy transition-colors">
                        Read Analysis →
                      </a>
                    </article>
                  `;
                }).join('')}
              </div>
            </section>

            <!-- Complete Semantic Article Index -->
            <section class="py-16 bg-brand-offwhite border-t border-brand-navy/10">
              <div class="max-w-7xl mx-auto px-6 lg:px-12">
                <div class="mb-8">
                  <div class="text-xs uppercase tracking-[0.2em] font-bold text-brand-gold mb-2">Comprehensive Index</div>
                  <h2 class="text-2xl font-serif text-brand-navy">All Published Insights & Publications</h2>
                </div>
                <div class="bg-white rounded-sm border border-brand-navy/5 shadow-sm divide-y divide-brand-navy/5">
                  ${publishedPosts.map((p: any) => {
                    const pSlug = getPostSlug(p);
                    const pTitle = getServerTranslation(p.title, 'en', p.language);
                    const pCat = getPrerenderCategory(p.category, 'en');
                    const pDate = p.date || '';
                    return `
                      <div class="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm hover:bg-brand-offwhite/30 transition-colors">
                        <div class="flex items-center gap-3">
                          <span class="text-[10px] uppercase font-bold text-brand-gold bg-brand-navy/5 px-2.5 py-1 rounded-sm shrink-0">${pCat}</span>
                          <a href="/blog/${pSlug}/" class="text-brand-navy hover:text-brand-gold font-medium transition-colors">${pTitle}</a>
                        </div>
                        <time class="text-xs text-gray-500 shrink-0 font-light">${pDate}</time>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            </section>
          </main>
          ${footerHtml}
        </div>
      `;
    } else if (page.path === "services") {
      bodySkeleton = `
        <div class="min-h-screen bg-bg-deep font-sans antialiased flex flex-col justify-between">
          ${navHtml}
          <main class="pt-24 flex-grow">
            <!-- Services Banner -->
            <div class="pt-16 pb-12 px-6 lg:px-12 text-center bg-bg-deep border-b border-brand-navy/5">
              <div class="max-w-4xl mx-auto space-y-4">
                <div class="text-[10px] uppercase tracking-[0.4em] text-brand-gold font-bold">PRACTICE AREAS & CONSULTANCY</div>
                <h1 class="text-4xl md:text-6xl font-serif text-brand-navy">${headingText}</h1>
                <div class="w-16 h-1 bg-brand-gold mx-auto"></div>
                <p class="text-sm md:text-base text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">${page.description}</p>
              </div>
            </div>

            <!-- Services Grid -->
            <section class="max-w-7xl mx-auto px-6 lg:px-12 py-16">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                ${mergedServices.map((s: any) => {
                  const sId = (s.id || '').toString().trim().toLowerCase();
                  const sTitle = getServerTranslation(s.title, 'en');
                  const sDesc = getServerTranslation(s.description, 'en');
                  const sBullets = s.bullets?.en || [];
                  return `
                    <div class="p-8 bg-white border border-brand-navy/5 rounded-sm shadow-sm flex flex-col justify-between hover:shadow-lg transition-shadow">
                      <div>
                        <div class="text-brand-gold text-[10px] uppercase tracking-[0.2em] font-bold mb-3">Practice Area</div>
                        <h2 class="text-2xl font-serif text-brand-navy mb-4">
                          <a href="/service/${sId}/" class="text-brand-navy hover:text-brand-gold transition-colors">${sTitle}</a>
                        </h2>
                        <p class="text-gray-600 font-light text-sm leading-relaxed mb-6">${sDesc}</p>
                        ${sBullets.length > 0 ? `
                          <ul class="space-y-2 mb-6 text-xs text-gray-500">
                            ${sBullets.slice(0, 3).map((b: string) => `<li class="flex items-center gap-2"><span class="text-brand-gold">✓</span> <span>${b}</span></li>`).join('')}
                          </ul>
                        ` : ''}
                      </div>
                      <a href="/service/${sId}/" class="text-xs uppercase tracking-widest font-black text-brand-gold hover:text-brand-navy transition-colors">
                        Explore Details →
                      </a>
                    </div>
                  `;
                }).join('')}
              </div>
            </section>

            <!-- Consultation CTA -->
            <section class="py-16 bg-brand-offwhite border-t border-brand-navy/10">
              <div class="max-w-4xl mx-auto px-6 text-center">
                <h3 class="text-3xl font-serif text-brand-navy mb-4">Require Bespoke Legal Representation?</h3>
                <p class="text-gray-600 font-light leading-relaxed mb-8">
                  Contact our senior advocates in Istanbul and London to discuss your commercial, citizenship, or private client matter confidentially.
                </p>
                <a href="/#contact" class="inline-block px-8 py-4 bg-brand-navy text-white text-xs uppercase tracking-widest font-bold rounded-sm hover:bg-brand-gold hover:text-brand-navy transition-all">
                  Schedule an Initial Consultation
                </a>
              </div>
            </section>
          </main>
          ${footerHtml}
        </div>
      `;
    } else if (page.path === "about") {
      bodySkeleton = `
        <div class="min-h-screen bg-bg-deep font-sans antialiased flex flex-col justify-between">
          ${navHtml}
          <main class="pt-24 flex-grow">
            <!-- About Banner -->
            <div class="pt-16 pb-12 px-6 lg:px-12 text-center bg-bg-deep border-b border-brand-navy/5">
              <div class="max-w-4xl mx-auto space-y-4">
                <div class="text-[10px] uppercase tracking-[0.4em] text-brand-gold font-bold">ABOUT RESEN LEGAL</div>
                <h1 class="text-4xl md:text-6xl font-serif text-brand-navy">${headingText}</h1>
                <div class="w-16 h-1 bg-brand-gold mx-auto"></div>
                <p class="text-sm md:text-base text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">${page.description}</p>
              </div>
            </div>

            <!-- About Content Section -->
            <section class="max-w-5xl mx-auto px-6 lg:px-12 py-16">
              <div class="space-y-12">
                <div>
                  <div class="text-xs uppercase tracking-[0.25em] font-bold text-brand-gold mb-3">Our Mission</div>
                  <h2 class="text-3xl md:text-4xl font-serif text-brand-navy mb-6">Navigating Complexity With Global Perspective</h2>
                  <p class="text-lg text-gray-700 font-light leading-relaxed mb-6">
                    Resen Legal & Consultancy was founded with a singular dedication: delivering uncompromised legal counsel across Turkish and international jurisdictions. Operating at the intersection of European commerce and Turkish jurisprudence, we guide corporations, investors, and high-net-worth families through their most critical legal milestones.
                  </p>
                  <p class="text-gray-600 font-light leading-relaxed">
                    Our core focus encompasses Turkish citizenship by investment, cross-border corporate governance, real estate acquisition, private client inheritance, and commercial dispute resolution. With headquarters in Istanbul and liaison capabilities in London, we provide true cross-border accessibility.
                  </p>
                </div>

                <!-- Three Core Pillars -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-brand-navy/10">
                  <div class="p-6 bg-white border border-brand-navy/5 rounded-sm shadow-sm">
                    <h3 class="font-serif text-xl text-brand-navy mb-3">Precision & Mastery</h3>
                    <p class="text-sm text-gray-600 font-light leading-relaxed">
                      Every contract, filing, and brief is drafted to the highest standards of international jurisprudence and local administrative compliance.
                    </p>
                  </div>
                  <div class="p-6 bg-white border border-brand-navy/5 rounded-sm shadow-sm">
                    <h3 class="font-serif text-xl text-brand-navy mb-3">Discretion & Trust</h3>
                    <p class="text-sm text-gray-600 font-light leading-relaxed">
                      We protect our clients' confidential interests and assets with rigorous institutional security protocols and fiduciary loyalty.
                    </p>
                  </div>
                  <div class="p-6 bg-white border border-brand-navy/5 rounded-sm shadow-sm">
                    <h3 class="font-serif text-xl text-brand-navy mb-3">Cross-Border Synergy</h3>
                    <p class="text-sm text-gray-600 font-light leading-relaxed">
                      Connecting Turkish commercial opportunities with European, Gulf, and international private wealth management.
                    </p>
                  </div>
                </div>

                <!-- Internal Navigation CTA Links -->
                <div class="pt-8 border-t border-brand-navy/10 flex flex-wrap items-center justify-between gap-6">
                  <div class="flex flex-wrap gap-6">
                    <a href="/services/" class="text-xs uppercase tracking-widest font-black text-brand-gold hover:text-brand-navy transition-colors">
                      Our Practice Areas →
                    </a>
                    <a href="/team/" class="text-xs uppercase tracking-widest font-black text-brand-gold hover:text-brand-navy transition-colors">
                      Meet The Team →
                    </a>
                    <a href="/blog/" class="text-xs uppercase tracking-widest font-black text-brand-gold hover:text-brand-navy transition-colors">
                      Read Legal Insights →
                    </a>
                  </div>
                  <a href="/#contact" class="px-6 py-3 bg-brand-navy text-white text-xs uppercase tracking-widest font-bold rounded-sm hover:bg-brand-navy/90 transition-all">
                    Contact Our Advocates
                  </a>
                </div>
              </div>
            </section>
          </main>
          ${footerHtml}
        </div>
      `;
    } else if (page.path === "team") {
      bodySkeleton = `
        <div class="min-h-screen bg-bg-deep font-sans antialiased flex flex-col justify-between">
          ${navHtml}
          <main class="pt-24 flex-grow">
            <!-- Team Banner -->
            <div class="pt-16 pb-12 px-6 lg:px-12 text-center bg-bg-deep border-b border-brand-navy/5">
              <div class="max-w-4xl mx-auto space-y-4">
                <div class="text-[10px] uppercase tracking-[0.4em] text-brand-gold font-bold">ATTORNEYS & COUNSEL</div>
                <h1 class="text-4xl md:text-6xl font-serif text-brand-navy">${headingText}</h1>
                <div class="w-16 h-1 bg-brand-gold mx-auto"></div>
                <p class="text-sm md:text-base text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">${page.description}</p>
              </div>
            </div>

            <!-- Team Members Grid -->
            <section class="max-w-7xl mx-auto px-6 lg:px-12 py-16">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                ${MOCK_TEAM.map((member: any) => {
                  const memberName = member.name;
                  const memberRole = getServerTranslation(member.role, 'en');
                  const memberBio = getServerTranslation(member.bio, 'en');
                  return `
                    <div class="p-8 bg-white border border-brand-navy/5 rounded-sm shadow-sm flex flex-col justify-between hover:shadow-lg transition-shadow">
                      <div>
                        <div class="aspect-square bg-gray-100 rounded-sm mb-6 overflow-hidden">
                          <img src="${member.image}" alt="${memberName}" class="w-full h-full object-cover object-top" />
                        </div>
                        <div class="text-brand-gold text-[10px] uppercase tracking-wider font-bold mb-1">${memberRole}</div>
                        <h2 class="text-2xl font-serif text-brand-navy mb-3">${memberName}</h2>
                        <p class="text-gray-600 font-light text-xs leading-relaxed mb-4">${memberBio}</p>
                        ${member.email ? `
                          <p class="text-xs text-brand-gold font-medium mb-4"><a href="mailto:${member.email}" class="hover:underline">${member.email}</a></p>
                        ` : ''}
                      </div>
                      <a href="/#contact" class="text-xs uppercase tracking-widest font-black text-brand-navy hover:text-brand-gold transition-colors">
                        Request Consultation →
                      </a>
                    </div>
                  `;
                }).join('')}
              </div>

              <!-- Internal Links Section -->
              <div class="mt-16 p-8 bg-brand-offwhite rounded-sm border border-brand-navy/5 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div>
                  <h3 class="font-serif text-xl text-brand-navy mb-1">Explore Firm Expertise</h3>
                  <p class="text-xs text-gray-500 font-light">Learn more about our practice areas or read publications authored by our team.</p>
                </div>
                <div class="flex gap-6">
                  <a href="/services/" class="text-xs uppercase tracking-widest font-black text-brand-gold hover:text-brand-navy transition-colors">
                    Our Services →
                  </a>
                  <a href="/blog/" class="text-xs uppercase tracking-widest font-black text-brand-gold hover:text-brand-navy transition-colors">
                    Publications →
                  </a>
                </div>
              </div>
            </section>
          </main>
          ${footerHtml}
        </div>
      `;
    } else {
      // Fallback for private or utility static pages (e.g. resen-gate)
      bodySkeleton = `
        <div class="min-h-screen bg-bg-deep font-sans antialiased">
          ${navHtml}
          <main class="pt-24">
            <div class="pt-16 pb-12 px-6 lg:px-12 text-center bg-bg-deep border-b border-brand-navy/5">
              <div class="max-w-4xl mx-auto space-y-4">
                <div class="text-[10px] uppercase tracking-[0.4em] text-brand-gold font-bold">
                  EXCELLENCE & INTEGRITY
                </div>
                <h1 class="text-4xl md:text-6xl font-serif text-brand-navy">
                  ${headingText}
                </h1>
                <div class="w-16 h-1 bg-brand-gold mx-auto"></div>
              </div>
            </div>
            <div class="max-w-4xl mx-auto px-6 py-16 text-center">
              <p class="text-xl text-gray-600 font-light leading-relaxed mb-8">
                ${page.description}
              </p>
            </div>
          </main>
          ${footerHtml}
        </div>
      `;
    }
    html = html.replace('<div id="root"></div>', `<div id="root">${bodySkeleton}</div>`);

    // Write out to dist/:path/index.html
    const pageDir = path.join(distPath, page.path);
    if (!fs.existsSync(pageDir)) {
      fs.mkdirSync(pageDir, { recursive: true });
    }
    fs.writeFileSync(path.join(pageDir, "index.html"), html, "utf-8");
  }

  // Generate sitemap.xml
  console.log("Generating sitemap.xml at build-time...");
  const staticUrls = [
    "https://resenlegal.com/",
    "https://resenlegal.com/about/",
    "https://resenlegal.com/services/",
    "https://resenlegal.com/team/",
    "https://resenlegal.com/blog/"
  ];

  const serviceUrls = [
    "https://resenlegal.com/service/commercial-corporate-law/",
    "https://resenlegal.com/service/citizenship-immigration-law/",
    "https://resenlegal.com/service/real-estate-property-law/",
    "https://resenlegal.com/service/global-mobility-visa/",
    "https://resenlegal.com/service/inheritance-private-client/",
    "https://resenlegal.com/service/family-matrimonial-law/",
    "https://resenlegal.com/service/data-protection-law/",
    "https://resenlegal.com/service/human-rights-administrative/",
    "https://resenlegal.com/service/labor-employment-law/"
  ];

  const today = "2026-06-16";

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // 1. Static URLs (Homepage priority is 1.0, others 0.8)
  staticUrls.forEach((url) => {
    const priority = url === "https://resenlegal.com/" ? "1.0" : "0.8";
    const freq = (url === "https://resenlegal.com/" || url === "https://resenlegal.com/blog") ? "weekly" : "monthly";
    xml += `  <url>\n`;
    xml += `    <loc>${url}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${freq}</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;
    xml += `  </url>\n`;
  });

  // 2. Services URLs (Priority 0.8)
  serviceUrls.forEach((url) => {
    xml += `  <url>\n`;
    xml += `    <loc>${url}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  });

  // 3. Blog posts URLs (Priority 0.8)
  const verifiedSlugs = [
    "turkiyede-ikamet-izni-uzatma-basvurusu-nasil-yapilir",
    "turkiyede-sinir-disi-karari-ve-idari-gozetim-sureci",
    "how-to-obtain-a-turkish-visa",
    "babasi-turk-olan-kisinin-18-yasindan-sonra-turk-vatandasliginin-tescili",
    "turkish-citizenship-by-investment-legal-guide",
    "turkiyede-insani-ikamet-izni-nasil-alinir",
    "kira-tespit-davasi-belirsiz-alacak-davasi-olarak-acilabilir-mi",
    "ingilterede-alinan-bosanma-kararlarinin-turkiyede-gecerliligi",
    "turkiyede-ikamet-izni-turleri-kritik-farklar-ve-basvuru-rehberi",
    "corporate-governance-in-the-digital-age",
    "turkiyede-calisma-izni-basvurusu-nasil-yapilir",
    "yurt-disinda-duzenlenmis-vekletnamelerin-turkiyede-kullanimi",
    "turkiyede-ogrenci-ikamet-izni-basvuru-sureci",
    "portekiz-d7-vizesi-pasif-gelir-ve-emekli-oturum-rehberi",
    "portekiz-d8-vizesi-dijital-gocebe-ve-uzaktan-calisma-rehberi",
    "portekiz-d2-vizesi-girisimci-oturum-basvurusu-rehberi",
    "foreign-investors-guide-company-formation-investment-incentives-turkiye",
    "ingilterede-sirket-kurulusu",
    "turk-vatandaslari-ingilterede-ev-alabilir-mi-vergi-ve-surec-rehberi"
  ];

  const allActiveSlugsSet = new Set<string>(verifiedSlugs);
  publishedPosts.forEach((post) => {
    const slug = getPostSlug(post);
    if (slug && slug !== "[slug]") {
      allActiveSlugsSet.add(slug);
    }
  });

  const processedSlugs = new Set<string>();

  allActiveSlugsSet.forEach((slug) => {
    const locUrl = `https://resenlegal.com/blog/${slug}/`;
    if (processedSlugs.has(locUrl)) return;
    processedSlugs.add(locUrl);

    const post = publishedPosts.find((p) => getPostSlug(p) === slug);
    let lastmod = today;
    if (post) {
      const lastmodField = post.updatedAt || post.date;
      lastmod = formatSitemapDate(lastmodField);
    } else if (slug === "corporate-governance-in-the-digital-age") {
      lastmod = "2024-05-12";
    }

    xml += `  <url>\n`;
    xml += `    <loc>${locUrl}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>\n`;

  fs.writeFileSync(path.join(distPath, "sitemap.xml"), xml, "utf-8");
  try {
    fs.writeFileSync(path.join(process.cwd(), "public", "sitemap.xml"), xml, "utf-8");
  } catch (e) {
    // Non-critical if public is read-only
  }
  console.log("Sitemap.xml generated successfully in dist/ and public/ directories.");
  console.log("Prerendering completed successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Prerendering script failed:", err);
  process.exit(1);
});
