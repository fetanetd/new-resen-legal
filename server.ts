import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";
import { BLOG_POSTS as MOCK_BLOG } from "./src/constants/mockData.js";

dotenv.config();

// Helper functions for dynamic sitemap generation
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

// Read and parse Firebase configuration from file
const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
let firebaseDb: any = null;

try {
  if (fs.existsSync(firebaseConfigPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));
    const firebaseApp = initializeApp(firebaseConfig);
    firebaseDb = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
    console.log("Firebase initialized successfully on server-side.");
  } else {
    console.warn("firebase-applet-config.json not found on server-side.");
  }
} catch (err) {
  console.error("Failed to initialize Firebase on server-side:", err);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini API Setup
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Helper check for API Key
  const checkApiKey = (res: express.Response) => {
    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({ error: "Gemini API key is missing. Please add GEMINI_API_KEY to Settings > Secrets in the builder panel." });
      return false;
    }
    return true;
  };

  // Translation endpoint
  app.post("/api/translate", async (req, res) => {
    if (!checkApiKey(res)) return;

    const { text, targetLangs, sourceLang = "English" } = req.body;

    if (!targetLangs || !Array.isArray(targetLangs) || targetLangs.length === 0) {
      return res.json({});
    }

    if (!text || text.trim() === '') {
      const emptyResponse: Record<string, string> = {};
      targetLangs.forEach((lang: string) => {
        emptyResponse[lang] = '';
      });
      return res.json(emptyResponse);
    }

    try {
      const prompt = `Translate the following source text from ${sourceLang} into these target languages: ${targetLangs.join(", ")}. 
      Provide the translations in a JSON format where keys are exactly the requested language codes.

      Source Text:
      <<<TEXT_START>>>
      ${text}
      <<<TEXT_END>>>`;

      const properties: Record<string, any> = {};
      targetLangs.forEach((lang: string) => {
        properties[lang] = { type: Type.STRING };
      });

      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties,
            required: targetLangs
          }
        }
      });

      const responseText = result.text;
      if (responseText) {
         const translations = JSON.parse(responseText.trim());
         res.json(translations);
      } else {
         throw new Error("Empty translation response from model");
      }
    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({ error: "Translation failed" });
    }
  });

  // AI Legal Editor endpoints
  app.post("/api/ai/draft-blog", async (req, res) => {
    if (!checkApiKey(res)) return;

    const { title, language = "English" } = req.body;
    try {
      const prompt = `You are a specialist legal counsel at Resen Legal & Consultancy. 
      Act as an expert legal blogger. 
      Write a professional, informative, and engaging blog post draft in ${language} for the title: "${title}".
      The post should include:
      1. A professional introduction.
      2. Key legal points and analysis.
      3. A concluding summary.
      4. A disclaimer that this is not legal advice.
      
      Use professional legal terminology appropriate for ${language}.`;

      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });
      res.json({ content: result.text });
    } catch (error) {
      console.error("AI Draft error:", error);
      res.status(500).json({ error: "Failed to generate draft" });
    }
  });

  app.post("/api/ai/summarize", async (req, res) => {
    if (!checkApiKey(res)) return;

    const { text } = req.body;
    try {
      const prompt = `Summarize the following legal inquiry or message into a single, concise paragraph that captures the core legal issue and the client's objective. 
      Maintain a professional and analytical tone.
      
      Message:
      <<<MESSAGE_START>>>
      ${text}
      <<<MESSAGE_END>>>`;

      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });
      res.json({ summary: result.text });
    } catch (error) {
      console.error("AI Summary error:", error);
      res.status(500).json({ error: "Failed to summarize" });
    }
  });

  app.post("/api/ai/refine", async (req, res) => {
    if (!checkApiKey(res)) return;

    const { text, language = "English" } = req.body;
    try {
      const prompt = `Review and refine the following text to ensure it uses professional legal terminology, is clear, concise, and structured logically for a law firm. 
      The target language is ${language}. 
      Improve the tone to be more authoritative and professional.
      
      Original text:
      <<<TEXT_START>>>
      ${text}
      <<<TEXT_END>>>`;

      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });
      res.json({ refined: result.text });
    } catch (error) {
      console.error("AI Refinement error:", error);
      res.status(500).json({ error: "Failed to refine text" });
    }
  });

  // AI SEO Optimization and Meta Generator endpoint
  app.post("/api/ai/seo-optimize", async (req, res) => {
    if (!checkApiKey(res)) return;

    const { title, category, language = "Turkish" } = req.body;
    try {
      const prompt = `You are a legal SEO strategist. Review the following draft title and category for an intellectual legal post of Resen Legal & Consultancy.
      Title: "${title}"
      Category: "${category}"
      Language: "${language}"

      Provide premium SEO metadata optimizations.`;

      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              optimizedTitle: {
                type: Type.STRING,
                description: "A highly professional, SEO-friendly legal title in the target language under 60 characters"
              },
              metaDescription: {
                type: Type.STRING,
                description: "A compelling meta description in the target language under 160 characters designed to drive high click-through rates"
              },
              keywords: {
                type: Type.STRING,
                description: "A comma-separated string of 5-8 highly relevant, high-traffic SEO keywords in the target language"
              },
              outline: {
                type: Type.STRING,
                description: "A recommended bulleted structure or H2 headings layout in the target language for this article"
              }
            },
            required: ["optimizedTitle", "metaDescription", "keywords", "outline"]
          }
        }
      });

      const responseText = result.text;
      if (responseText) {
         const optimization = JSON.parse(responseText.trim());
         res.json(optimization);
      } else {
         throw new Error("Empty response from SEO optimizer model");
      }
    } catch (error) {
      console.error("AI SEO optimization error:", error);
      res.status(500).json({ error: "Failed to optimize SEO" });
    }
  });

  // Outbound Link Checker endpoint to bypass CORS
  app.post("/api/seo/check-links", async (req, res) => {
    const { urls } = req.body;
    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ error: "Invalid urls list" });
    }

    try {
      const results = await Promise.all(
        urls.map(async (url) => {
          try {
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
              return { url, status: "broken", code: 0, error: "Invalid protocol" };
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);

            try {
              const fetchRes = await fetch(url, {
                method: "GET",
                headers: {
                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                },
                signal: controller.signal
              });
              clearTimeout(timeoutId);
              
              const isOk = fetchRes.status >= 200 && fetchRes.status < 400;
              return {
                url,
                status: isOk ? "ok" : "broken",
                code: fetchRes.status,
                error: isOk ? undefined : `HTTP ${fetchRes.status}`
              };
            } catch (fetchErr: any) {
              clearTimeout(timeoutId);
              return {
                url,
                status: "broken",
                code: 0,
                error: fetchErr.name === 'AbortError' ? 'Timeout (4s)' : (fetchErr.message || "Network Error")
              };
            }
          } catch (err: any) {
            return {
              url,
              status: "broken",
              code: 0,
              error: err.message || "Failed to scan"
            };
          }
        })
      );

      res.json({ results });
    } catch (endpointErr: any) {
      console.error("Link checker error:", endpointErr);
      res.status(500).json({ error: endpointErr.message || "Internal link checker error" });
    }
  });

  // AI Multilingual Translation endpoint
  app.post("/api/ai/translate", async (req, res) => {
    if (!checkApiKey(res)) return;

    const { title, excerpt, content, targetLanguage } = req.body;
    try {
      const prompt = `You are a specialist legal translator at Resen Legal & Consultancy.
      Translate the following legal blog post fields into ${targetLanguage}.
      Use professional and accurate legal terminology appropriate for ${targetLanguage}.
      Maintain and preserve any HTML styling, checklist bullet points, blockquote CSS classes (like "not" or "uyari"), warnings, bolding, line spacing, and general document formatting in the translated HTML output exactly.
      
      Input Title:
      <<<TITLE_START>>>
      ${title || ''}
      <<<TITLE_END>>>

      Input Excerpt:
      <<<EXCERPT_START>>>
      ${excerpt || ''}
      <<<EXCERPT_END>>>

      Input Content (HTML):
      <<<CONTENT_START>>>
      ${content || ''}
      <<<CONTENT_END>>>`;

      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              translatedTitle: { 
                type: Type.STRING,
                description: "The translated title string"
              },
              translatedExcerpt: { 
                type: Type.STRING,
                description: "The translated excerpt / summary string"
              },
              translatedContent: { 
                type: Type.STRING,
                description: "The translated block of HTML content with structures, blockquotes, and CSS styling classes completely preserved"
              }
            },
            required: ["translatedTitle", "translatedExcerpt", "translatedContent"]
          }
        }
      });

      const responseText = result.text;
      if (responseText) {
         const translation = JSON.parse(responseText.trim());
         res.json(translation);
      } else {
         throw new Error("Empty translation response from model");
      }
    } catch (error) {
      console.error("AI Translation error:", error);
      res.status(500).json({ error: "Failed to translate content" });
    }
  });

  // Dynamic Sitemap Generator Route
  app.get("/sitemap.xml", async (req, res) => {
    try {
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

      // Fetch dynamic posts from Firestore
      let firestorePosts: any[] = [];
      if (firebaseDb) {
        try {
          const blogCol = collection(firebaseDb, "blog");
          const snapshot = await getDocs(blogCol);
          snapshot.forEach((doc) => {
            firestorePosts.push({ id: doc.id, ...doc.data() });
          });
        } catch (dbErr) {
          console.error("Error reading Firestore posts for sitemap:", dbErr);
        }
      }

      // Merge firestore and mock blog posts
      const mergedPosts = [...firestorePosts];
      MOCK_BLOG.forEach((mockPost) => {
        if (!mergedPosts.find((p) => p.id === mockPost.id)) {
          mergedPosts.push(mockPost);
        }
      });

      // Filter out drafts
      const publishedPosts = mergedPosts.filter((post) => (post as any).status !== "draft");

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

      // Grab any other published posts dynamically as well
      const allActiveSlugsSet = new Set<string>(verifiedSlugs);
      publishedPosts.forEach((post) => {
        const slug = getPostSlug(post);
        if (slug && slug !== "[slug]" && (post as any).status !== "draft") {
          allActiveSlugsSet.add(slug);
        }
      });

      const processedSlugs = new Set<string>();

      allActiveSlugsSet.forEach((slug) => {
        const locUrl = `https://resenlegal.com/blog/${slug}`;
        if (processedSlugs.has(locUrl)) return;
        processedSlugs.add(locUrl);

        // Find if we have actual post data for this slug to get its latest update date
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

      const totalUrls = staticUrls.length + serviceUrls.length + allActiveSlugsSet.size;

      if (firebaseDb) {
        try {
          const sitemapLogsCol = collection(firebaseDb, "sitemapLogs");
          await addDoc(sitemapLogsCol, {
            timestamp: new Date().toISOString(),
            status: "success",
            urlsCount: totalUrls,
            triggeredBy: (req.query.triggeredBy as string) || "System/Bot (Request)"
          });
        } catch (logErr) {
          console.error("Error writing sitemap success log:", logErr);
        }
      }

      res.header("Content-Type", "application/xml");
      res.send(xml);
    } catch (err) {
      console.error("XML creation error:", err);
      if (firebaseDb) {
        try {
          const sitemapLogsCol = collection(firebaseDb, "sitemapLogs");
          await addDoc(sitemapLogsCol, {
            timestamp: new Date().toISOString(),
            status: "failed",
            urlsCount: 0,
            triggeredBy: (req.query.triggeredBy as string) || "System/Bot (Request)"
          });
        } catch (logErr) {
          console.error("Error writing sitemap failure log:", logErr);
        }
      }
      res.status(500).send("Schema generation failed");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', async (req, res) => {
      // Check if it is a blog detail page
      const match = req.path.match(/^\/blog\/([^/]+)$/);
      if (match) {
        const targetSlug = match[1].trim().toLowerCase();
        try {
          // 1. Fetch dynamic posts from Firestore
          let firestorePosts: any[] = [];
          if (firebaseDb) {
            const blogCol = collection(firebaseDb, "blog");
            const snapshot = await getDocs(blogCol);
            snapshot.forEach((doc) => {
              firestorePosts.push({ id: doc.id, ...doc.data() });
            });
          }

          // 2. Merge with mock posts
          const mergedPosts = [...firestorePosts];
          MOCK_BLOG.forEach((mockPost) => {
            if (!mergedPosts.find((p) => p.id === mockPost.id)) {
              mergedPosts.push(mockPost);
            }
          });

          // 3. Find matching post by slug or ID
          const post = mergedPosts.find(p => {
            const postS = getPostSlug(p).trim().toLowerCase();
            const postI = (p.id || '').trim().toLowerCase();
            return postS === targetSlug || postI === targetSlug;
          });

          if (post) {
            // Read index.html template from dist directory
            let html = await fs.promises.readFile(path.join(distPath, 'index.html'), 'utf-8');

            const postLang = (post.language || "tr").toLowerCase().startsWith("en") ? "en" : "tr";
            const postTitle = getServerTranslation(post.title, postLang, post.language);
            const postExcerpt = getServerTranslation(post.excerpt, postLang, post.language);
            const postContent = getServerTranslation(post.content, postLang, post.language);
            const postCategory = post.category || "Legal Insights";
            const postDate = post.date || "2026-06-16";
            const postKeywords = post.seoKeywords ? `${postTitle}, ${postCategory}, ${post.seoKeywords}` : `${postTitle}, ${postCategory}, legal insights, blog`;
            const postImage = post.image || "https://res.cloudinary.com/dlrsifk2y/image/upload/v1783074107/WhatsApp_Image_2026-07-02_at_16.29.53_fsx9mp.jpg";
            const postCanonical = `https://resenlegal.com/blog/${getPostSlug(post)}`;

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

            res.send(html);
            return;
          }
        } catch (err) {
          console.error("SEO Prerender Dynamic Injection failed, falling back:", err);
        }
      }

      // Default SPA fallback
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
