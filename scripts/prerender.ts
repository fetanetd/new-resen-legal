import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { BLOG_POSTS as MOCK_BLOG, SERVICES as MOCK_SERVICES, TEAM as MOCK_TEAM } from "../src/constants/mockData";

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

  const distPath = path.join(process.cwd(), "dist");
  const templatePath = path.join(distPath, "index.html");

  if (!fs.existsSync(templatePath)) {
    console.error("Vite build template index.html not found! Run 'vite build' first.");
    process.exit(1);
  }

  const htmlTemplate = fs.readFileSync(templatePath, "utf-8");

  // Prerender Blog posts
  console.log("Prerendering blog detail pages...");
  const publishedPosts = mergedPosts.filter((post) => (post as any).status !== "draft");
  
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
    html = html.replace(/<meta data-static="true" property="og:image" content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${postImage}" />`);
    
    html = html.replace(/<meta data-static="true" property="twitter:title" content="[^"]*"\s*\/?>/, `<meta property="twitter:title" content="${fullTitle.replace(/"/g, '&quot;')}" />`);
    html = html.replace(/<meta data-static="true" property="twitter:description" content="[^"]*"\s*\/?>/, `<meta property="twitter:description" content="${postExcerpt.replace(/"/g, '&quot;')}" />`);
    html = html.replace(/<meta data-static="true" property="twitter:url" content="[^"]*"\s*\/?>/, `<meta property="twitter:url" content="${postCanonical}" />`);
    html = html.replace(/<meta data-static="true" property="twitter:image" content="[^"]*"\s*\/?>/, `<meta property="twitter:image" content="${postImage}" />`);
    
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

    let relatedSectionHtml = "";
    if (related.length > 0) {
      const continueReadingText = postLang === "tr" ? "OKUMAYA DEVAM ET" : "CONTINUE READING";
      const relatedInsightsText = postLang === "tr" ? "İlgili Yazılar" : "Related Insights";
      const exploreAllPostsText = postLang === "tr" ? "Tüm yazıları keşfet" : "Explore all posts";
      const readArticleText = postLang === "tr" ? "Makaleyi Oku" : "Read Article";

      const relatedCardsHtml = related.map((rPost) => {
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

      relatedSectionHtml = `
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
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 3rem;">
            ${relatedCardsHtml}
          </div>
        </div>
      `;
    }

    // Inject the complete content structure inside #root container to bypass Client-only SPA blank spots
    const bodySkeleton = `
      <div style="padding: 2rem; max-width: 800px; margin: 0 auto; font-family: sans-serif;">
        <div aria-hidden="true" style="font-size: 2.5rem; font-weight: bold; line-height: 1.2; margin-bottom: 1rem; color: #0f172a;">${postTitle}</div>
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

    // Also write to dist/blog/:id/index.html if id is different from slug
    const postId = (post.id || "").toString().trim().toLowerCase();
    if (postId && postId !== slug) {
      const idDir = path.join(distPath, "blog", postId);
      if (!fs.existsSync(idDir)) {
        fs.mkdirSync(idDir, { recursive: true });
      }
      fs.writeFileSync(path.join(idDir, "index.html"), html, "utf-8");
    }
  }

  // Prerender Services
  console.log("Prerendering service detail pages...");
  
  for (const service of mergedServices) {
    const serviceId = (service.id || "").toString().trim().toLowerCase();
    if (!serviceId) continue;
    
    let html = htmlTemplate;
    const serviceTitle = getServerTranslation(service.title, "en");
    const serviceDescription = getServerTranslation(service.description, "en");
    const serviceCanonical = `https://resenlegal.com/service/${serviceId}/`;
    const serviceKeywords = `${serviceTitle}, legal services, expert counsel, Resen Legal, legal consultancy`;
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
    
    // Inject the complete content structure inside #root container to bypass Client-only SPA blank spots
    const bodySkeleton = `
      <div class="min-h-screen bg-bg-deep font-sans antialiased">
        <main class="pt-24">
          <div class="relative h-[40vh] min-h-[300px] w-full bg-brand-navy flex items-center justify-center overflow-hidden">
            <div class="absolute inset-0 opacity-20">
              <img 
                src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80" 
                alt="${serviceTitle}" 
                class="w-full h-full object-cover"
              />
            </div>
            <div class="relative z-10 text-center px-6">
              <div class="text-[10px] uppercase tracking-[0.4em] text-brand-gold mb-4 font-bold">
                EXPERT PRACTICE AREA
              </div>
              <h1 class="text-4xl md:text-6xl font-serif text-white mb-6">
                ${serviceTitle}
              </h1>
              <div class="w-24 h-1 bg-brand-gold mx-auto"></div>
            </div>
          </div>
          <div class="max-w-4xl mx-auto px-6 py-16">
            <p class="text-xl text-gray-600 font-light leading-relaxed mb-8 text-center">
              ${serviceDescription}
            </p>
            
            <div class="flex flex-wrap gap-4 justify-center my-12">
              ${bulletsHtml}
            </div>
            
            <div class="mt-12">
              <h3 class="text-2xl font-serif text-brand-navy mb-4">Our Methodology</h3>
              <p class="text-gray-600 font-light leading-relaxed">
                We handle the matters that matter through a rigorous, four-stage process that combines in-depth research, multi-disciplinary consultation, and aggressive advocacy. Whether you are an enterprise seeking global stability or an individual navigating life-changing transitions, our counsel is direct, diligent, and future-proof.
              </p>
            </div>
          </div>
        </main>
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
    <div class="min-h-screen bg-bg-deep font-sans antialiased">
      <section class="relative min-h-[90vh] flex items-center pt-24 overflow-hidden">
        <div class="absolute top-20 inset-inline-end-0 w-1/2 h-full bg-brand-navy/5 -skew-x-12 -z-10"></div>
        <div class="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
          <div>
            <div class="text-xs uppercase tracking-[0.4em] font-medium text-brand-gold mb-6">
              RESEN LEGAL & CONSULTANCY
            </div>
            <h1 class="text-4xl sm:text-5xl md:text-8xl font-serif leading-[0.95] md:leading-[0.9] text-brand-navy mb-8 break-words">
              We handle the matters that matter.
            </h1>
            <p class="text-lg md:text-xl text-gray-600 max-w-lg mb-10 leading-relaxed font-light">
              Resen Legal & Consultancy is a premier boutique international law firm based in Istanbul and London, specializing in Turkish citizenship by investment, residency, corporate law, real estate, and cross-border commercial transactions.
            </p>
            <div class="flex flex-col gap-4">
              <div class="bg-brand-navy text-white px-10 py-5 rounded-sm flex items-center justify-center gap-3 font-medium tracking-wide w-full sm:w-72 shadow-xl shadow-brand-navy/10 text-center">
                GET IN TOUCH
              </div>
            </div>
          </div>
          <div class="relative hidden lg:block">
            <div class="aspect-video md:aspect-[4/5] bg-gray-100 overflow-hidden rounded-sm relative shadow-2xl shadow-brand-navy/20">
              <img 
                src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2000&auto=format&fit=crop" 
                alt="Legal Library"
                class="w-full h-full object-cover object-center"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-brand-navy/40 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>
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
        "@id": "https://resenlegal.com/#legalservice",
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
                "name": "Fetanet Darıoğlu",
                "jobTitle": "Founder & Principal Lawyer",
                "email": "fetanet@resenlegal.com"
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
    const bodySkeleton = `
      <div class="min-h-screen bg-bg-deep font-sans antialiased">
        <main class="pt-24">
          <div class="relative h-[40vh] min-h-[300px] w-full bg-brand-navy flex items-center justify-center overflow-hidden">
            <div class="absolute inset-0 opacity-20">
              <img 
                src="${page.image}" 
                alt="${headingText}" 
                class="w-full h-full object-cover"
              />
            </div>
            <div class="relative z-10 text-center px-6">
              <div class="text-[10px] uppercase tracking-[0.4em] text-brand-gold mb-4 font-bold">
                EXCELLENCE & INTEGRITY
              </div>
              <h1 class="text-4xl md:text-6xl font-serif text-white mb-6">
                ${headingText}
              </h1>
              <div class="w-24 h-1 bg-brand-gold mx-auto"></div>
            </div>
          </div>
          <div class="max-w-4xl mx-auto px-6 py-16 text-center">
            <p class="text-xl text-gray-600 font-light leading-relaxed mb-8">
              ${page.description}
            </p>
          </div>
        </main>
      </div>
    `;
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
  console.log("Sitemap.xml generated successfully in dist/ directory.");
  console.log("Prerendering completed successfully!");
}

main().catch((err) => {
  console.error("Prerendering script failed:", err);
  process.exit(1);
});
