import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { BLOG_POSTS as MOCK_BLOG, SERVICES as MOCK_SERVICES } from "../src/constants/mockData";

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
const withTimeout = <T>(promise: Promise<T>, ms: number = 4000): Promise<T> => {
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
    const postCategory = post.category || "Legal Insights";
    const postDate = post.date || "2026-06-16";
    const postKeywords = post.seoKeywords ? `${postTitle}, ${postCategory}, ${post.seoKeywords}` : `${postTitle}, ${postCategory}, legal insights, blog`;
    const postImage = post.image || "https://res.cloudinary.com/dlrsifk2y/image/upload/v1783084549/og_xi5mco.jpg";
    const postCanonical = `https://resenlegal.com/blog/${slug}`;
    
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
    const fullTitle = `${postTitle} | ${siteName}`;
    
    // Replace page-level lang on <html> structure
    html = html.replace('<html lang="en">', `<html lang="${postLang}">`);
    
    // Replace Head elements with dynamic properties
    html = html.replace(/<title data-static="true">.*?<\/title>/, `<title>${fullTitle}</title>`);
    html = html.replace(/<meta data-static="true" name="title" content="[^"]*"\s*\/?>/, `<meta name="title" content="${fullTitle.replace(/"/g, '&quot;')}" />`);
    html = html.replace(/<meta data-static="true" name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${postExcerpt.replace(/"/g, '&quot;')}" />`);
    html = html.replace(/<meta data-static="true" name="keywords" content="[^"]*"\s*\/?>/, `<meta name="keywords" content="${postKeywords.replace(/"/g, '&quot;')}" />`);
    
    html = html.replace(/<meta data-static="true" property="og:type" content="[^"]*"\s*\/?>/, `<meta property="og:type" content="article" />`);
    html = html.replace(/<meta data-static="true" property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${fullTitle.replace(/"/g, '&quot;')}" />`);
    html = html.replace(/<meta data-static="true" property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${postExcerpt.replace(/"/g, '&quot;')}" />`);
    html = html.replace(/<meta data-static="true" property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${postCanonical}" />`);
    html = html.replace(/<meta data-static="true" property="og:image" content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${postImage}" />`);
    
    html = html.replace(/<meta data-static="true" property="twitter:title" content="[^"]*"\s*\/?>/, `<meta property="twitter:title" content="${fullTitle.replace(/"/g, '&quot;')}" />`);
    html = html.replace(/<meta data-static="true" property="twitter:description" content="[^"]*"\s*\/?>/, `<meta property="twitter:description" content="${postExcerpt.replace(/"/g, '&quot;')}" />`);
    html = html.replace(/<meta data-static="true" property="twitter:url" content="[^"]*"\s*\/?>/, `<meta property="twitter:url" content="${postCanonical}" />`);
    html = html.replace(/<meta data-static="true" property="twitter:image" content="[^"]*"\s*\/?>/, `<meta property="twitter:image" content="${postImage}" />`);
    
    // Inject custom script and canonical tags to closing </head>
    html = html.replace('</head>', `<link rel="canonical" href="${postCanonical}" />\n<script type="application/ld+json">${JSON.stringify(articleStructuredData)}</script>\n</head>`);
    
    // Inject the complete content structure inside #root container to bypass Client-only SPA blank spots
    const bodySkeleton = `
      <div style="padding: 2rem; max-width: 800px; margin: 0 auto; font-family: sans-serif;">
        <h1 style="font-size: 2.5rem; margin-bottom: 1rem; color: #0f172a;">${postTitle}</h1>
        <div style="font-size: 0.875rem; color: #64748b; margin-bottom: 2rem;">
          <span>Date: ${postDate}</span> | <span>Category: ${postCategory}</span>
        </div>
        <div style="font-size: 1.125rem; line-height: 1.75; color: #334155;">
          ${postContent}
        </div>
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
    const serviceCanonical = `https://resenlegal.com/service/${serviceId}`;
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
    html = html.replace(/<meta data-static="true" property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${fullTitle.replace(/"/g, '&quot;')}" />`);
    html = html.replace(/<meta data-static="true" property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${serviceDescription.replace(/"/g, '&quot;')}" />`);
    html = html.replace(/<meta data-static="true" property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${serviceCanonical}" />`);
    html = html.replace(/<meta data-static="true" property="og:image" content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${serviceImage}" />`);
    
    html = html.replace(/<meta data-static="true" property="twitter:title" content="[^"]*"\s*\/?>/, `<meta property="twitter:title" content="${fullTitle.replace(/"/g, '&quot;')}" />`);
    html = html.replace(/<meta data-static="true" property="twitter:description" content="[^"]*"\s*\/?>/, `<meta property="twitter:description" content="${serviceDescription.replace(/"/g, '&quot;')}" />`);
    html = html.replace(/<meta data-static="true" property="twitter:url" content="[^"]*"\s*\/?>/, `<meta property="twitter:url" content="${serviceCanonical}" />`);
    html = html.replace(/<meta data-static="true" property="twitter:image" content="[^"]*"\s*\/?>/, `<meta property="twitter:image" content="${serviceImage}" />`);
    
    // Inject custom script and canonical tags to closing </head>
    html = html.replace('</head>', `<link rel="canonical" href="${serviceCanonical}" />\n</head>`);
    
    // Bullets translation or fallback
    const bulletsList = service.bullets?.en || [
      'Strategic Case Assessment',
      'Regulatory Compliance Audit',
      'High-Stakes Representation',
      'Cross-Border Legal Architecture'
    ];
    
    const bulletsHtml = bulletsList.map((feature: string) => `
      <div style="flex: 1; min-width: 250px; padding: 1rem; border: 1px solid #e2e8f0; border-radius: 4px; background-color: #f8fafc; margin-bottom: 1rem; margin-right: 1rem;">
        <span style="font-weight: 500; color: #0f172a;">✓ ${feature}</span>
      </div>
    `).join("");
    
    // Inject the complete content structure inside #root container to bypass Client-only SPA blank spots
    const bodySkeleton = `
      <div style="padding: 2rem; max-width: 800px; margin: 0 auto; font-family: sans-serif;">
        <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: #b45309; margin-bottom: 0.5rem;">Expert Practice Area</div>
        <h1 style="font-size: 2.5rem; margin-bottom: 1rem; color: #0f172a;">${serviceTitle}</h1>
        <p style="font-size: 1.25rem; line-height: 1.75; color: #334155; margin-bottom: 1.5rem;">${serviceDescription}</p>
        
        <div style="display: flex; flex-wrap: wrap; margin-top: 2rem; margin-bottom: 2rem;">
          ${bulletsHtml}
        </div>
        
        <h3 style="font-size: 1.5rem; color: #0f172a; margin-top: 2rem; margin-bottom: 1rem;">Our Methodology</h3>
        <p style="font-size: 1rem; line-height: 1.6; color: #475569;">
          We handle the matters that matter through a rigorous, four-stage process that combines in-depth research, multi-disciplinary consultation, and aggressive advocacy. Whether you are an enterprise seeking global stability or an individual navigating life-changing transitions, our counsel is direct, diligent, and future-proof.
        </p>
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

  // Generate sitemap.xml
  console.log("Generating sitemap.xml at build-time...");
  const staticUrls = [
    "https://resenlegal.com/",
    "https://resenlegal.com/about",
    "https://resenlegal.com/services",
    "https://resenlegal.com/team",
    "https://resenlegal.com/blog"
  ];

  const serviceUrls = [
    "https://resenlegal.com/service/commercial-corporate-law",
    "https://resenlegal.com/service/citizenship-immigration-law",
    "https://resenlegal.com/service/real-estate-property-law",
    "https://resenlegal.com/service/global-mobility-visa",
    "https://resenlegal.com/service/inheritance-private-client",
    "https://resenlegal.com/service/family-matrimonial-law",
    "https://resenlegal.com/service/data-protection-law",
    "https://resenlegal.com/service/human-rights-administrative",
    "https://resenlegal.com/service/labor-employment-law"
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
    const locUrl = `https://resenlegal.com/blog/${slug}`;
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
