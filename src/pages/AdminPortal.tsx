import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogIn, 
  ArrowLeft, 
  Shield, 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  FileText, 
  LogOut, 
  Search, 
  Trash2, 
  Mail, 
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Settings as SettingsIcon,
  Activity,
  Briefcase,
  Plus,
  Edit2,
  Globe,
  Save,
  Sparkles,
  Wand2,
  Share2,
  Eye,
  TrendingUp,
  X as CloseIcon,
  RefreshCw,
  ShieldCheck,
  Check,
  Info,
  Download
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Link, useNavigate } from 'react-router-dom';
import { cn, getCategoryTranslation, getPostSlug, findTeamMember, getTranslation } from '../lib/utils';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { isAdminEmail } from '../constants/auth';
import { collection, query, orderBy, limit, deleteDoc, doc, updateDoc, getDocs, addDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useFirestoreCollection } from '../hooks/useFirestoreData';
import BlogForm from '../components/BlogForm';
import { BlogPost, TeamMember } from '../types';
import { BLOG_POSTS as MOCK_BLOG, TEAM as MOCK_TEAM, SERVICES as MOCK_SERVICES } from '../constants/mockData';

const formatDateDMY = (dateStr: string): string => {
  if (!dateStr) return '';
  
  // Try standard javascript Date parsing
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    // Check if the original string was MM-DD-YY by regex
    const mmDdYyMatch = dateStr.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
    if (mmDdYyMatch) {
      const [, m, dVal, y] = mmDdYyMatch;
      const day = dVal.padStart(2, '0');
      const month = m.padStart(2, '0');
      const year = y.length === 2 ? `20${y}` : y;
      return `${day}-${month}-${year}`;
    }
    
    // Check if YYYY-MM-DD or standard ISO
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // Fallback split parsing
  const parts = dateStr.split(/[-/.]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD -> DD-MM-YYYY
      return `${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[0]}`;
    } else {
      // Assuming MM-DD-YY -> DD-MM-YY (or YYYY)
      const day = parts[1].padStart(2, '0');
      const month = parts[0].padStart(2, '0');
      let year = parts[2];
      if (year.length === 2) year = `20${year}`;
      return `${day}-${month}-${year}`;
    }
  }
  return dateStr;
};

type Tab = 'overview' | 'messages' | 'blog' | 'team' | 'services' | 'logs' | 'settings' | 'ai' | 'seo';

const AIAssistant = ({ isSubmitting: parentSubmitting, logActivity }: { isSubmitting: boolean, logActivity: any }) => {
  const [aiText, setAiText] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiMode, setAiMode] = useState<'refine' | 'draft'>('refine');
  const [localLoading, setLocalLoading] = useState(false);

  const handleAIAction = async () => {
    if (!aiText) return;
    setLocalLoading(true);
    try {
      const endpoint = aiMode === 'refine' ? '/api/ai/refine' : '/api/ai/draft-blog';
      const body = aiMode === 'refine' 
        ? { text: aiText, language: 'Turkish' } 
        : { title: aiText, language: 'Turkish' };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error('AI action failed');
      const data = await res.json();
      setAiResult(aiMode === 'refine' ? data.refined : data.content);
      await logActivity('AI_ASSISTANT', aiMode, 'manual_input');
    } catch (err) {
      console.error(err);
      alert("AI Assistant failed to process request.");
    } finally {
      setLocalLoading(false);
    }
  };

  const uiLabels = {
    refine: 'Refine Legal Terminology',
    draft: 'Generate Legal Article Draft'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-8 border border-brand-navy/5 rounded-sm shadow-sm space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-brand-gold" />
          <h3 className="text-sm uppercase tracking-[0.3em] font-black text-brand-navy">AI Input Hub</h3>
        </div>
        
        <div className="flex gap-4 p-1 bg-brand-offwhite rounded-sm">
          <button 
            onClick={() => {setAiMode('refine'); setAiText(''); setAiResult('');}}
            className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-black transition-all ${aiMode === 'refine' ? 'bg-brand-navy text-white shadow-md' : 'text-brand-navy/40 hover:text-brand-navy'}`}
          >
            Refine Legal Language
          </button>
          <button 
            onClick={() => {setAiMode('draft'); setAiText(''); setAiResult('');}}
            className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-black transition-all ${aiMode === 'draft' ? 'bg-brand-navy text-white shadow-md' : 'text-brand-navy/40 hover:text-brand-navy'}`}
          >
            Draft Legal Article
          </button>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-widest font-bold text-brand-navy/40">
            {aiMode === 'refine' ? 'Paste your draft or notes below' : 'Enter the topic or title for the article'}
          </label>
          <textarea 
            rows={10}
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            placeholder={aiMode === 'refine' ? "Enter legal text to professionalize..." : "e.g., New GDPR regulations in Turkey..."}
            className="w-full bg-brand-offwhite border-none p-6 text-xs font-bold text-brand-navy focus:ring-1 focus:ring-brand-gold transition-all resize-none leading-relaxed"
          />
        </div>

        <button 
          onClick={handleAIAction}
          disabled={localLoading || !aiText}
          className="w-full bg-brand-gold text-white py-5 text-[10px] uppercase tracking-[0.2em] font-black flex items-center justify-center gap-3 hover:bg-brand-navy transition-all disabled:opacity-50 shadow-lg"
        >
          {localLoading ? <Clock className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          {localLoading ? 'AI is processing...' : uiLabels[aiMode]}
        </button>
      </div>

      <div className="bg-brand-navy p-8 border border-white/5 rounded-sm shadow-xl flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-brand-gold" />
            <h3 className="text-sm uppercase tracking-[0.3em] font-black text-white/40">Refined Output</h3>
          </div>
          {aiResult && (
            <button 
              onClick={() => {navigator.clipboard.writeText(aiResult); alert("Copied to clipboard!");}}
              className="text-[10px] uppercase tracking-widest font-bold text-brand-gold hover:text-white"
            >
              Copy Content
            </button>
          )}
        </div>

        <div className="flex-grow bg-white/5 rounded-sm p-8 overflow-y-auto max-h-[500px]">
          {aiResult ? (
            <div className="text-brand-offwhite text-sm font-light leading-loose whitespace-pre-wrap">
              {aiResult}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
              <Shield className="w-12 h-12 mb-6" />
              <p className="text-xs uppercase tracking-widest font-bold">Awaiting AI Input Processing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AdminPortal() {
  const { i18n } = useTranslation();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [isAddingService, setIsAddingService] = useState(false);
  const navigate = useNavigate();

  // Sitemap diagnostics state
  const [sitemapUrls, setSitemapUrls] = useState<string[]>([]);
  const [sitemapLoading, setSitemapLoading] = useState(false);
  const [sitemapError, setSitemapError] = useState<string | null>(null);
  const [lastSitemapFetch, setLastSitemapFetch] = useState<Date | null>(null);
  const [sitemapLogs, setSitemapLogs] = useState<any[]>([]);
  const [sitemapLogsLoading, setSitemapLogsLoading] = useState(false);

  const fetchSitemapLogs = async () => {
    setSitemapLogsLoading(true);
    try {
      const logsCol = collection(db, "sitemapLogs");
      const q = query(logsCol, orderBy("timestamp", "desc"), limit(10));
      const snapshot = await getDocs(q);
      const logsList: any[] = [];
      snapshot.forEach((doc) => {
        logsList.push({ id: doc.id, ...doc.data() });
      });
      setSitemapLogs(logsList);
    } catch (err: any) {
      console.error("Error fetching sitemap logs:", err);
    } finally {
      setSitemapLogsLoading(false);
    }
  };

  const fetchSitemapDiagnostics = async () => {
    setSitemapLoading(true);
    setSitemapError(null);
    try {
      const response = await fetch('/sitemap.xml?triggeredBy=Admin');
      if (!response.ok) {
        throw new Error(`Failed to load sitemap.xml: Status ${response.status}`);
      }
      const text = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, "text/xml");
      
      const parserError = xmlDoc.getElementsByTagName("parsererror");
      if (parserError.length > 0) {
        throw new Error("sitemap.xml is not valid XML");
      }

      const locElements = xmlDoc.getElementsByTagName("loc");
      const urls: string[] = [];
      for (let i = 0; i < locElements.length; i++) {
        const url = locElements[i].textContent?.trim();
        if (url) {
          urls.push(url);
        }
      }
      setSitemapUrls(urls);
      setLastSitemapFetch(new Date());
      await fetchSitemapLogs();
    } catch (err: any) {
      console.error("Sitemap diagnostic error:", err);
      setSitemapError(err.message || "Failed to fetch sitemap");
      await fetchSitemapLogs();
    } finally {
      setSitemapLoading(false);
    }
  };

  const extractLinksFromContent = (content: string, postId: string, postTitle: string, lang: string) => {
    if (!content || typeof content !== 'string') return [];
    const links: any[] = [];

    // Match markdown links: [text](url)
    const mdRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    while ((match = mdRegex.exec(content)) !== null) {
      const text = match[1].trim();
      const url = match[2].trim();
      const isExternal = url.startsWith('http://') || url.startsWith('https://');
      links.push({ url, text, isExternal, postId, postTitle, lang });
    }

    // Match HTML links: <a href="url">text</a>
    const htmlRegex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    while ((match = htmlRegex.exec(content)) !== null) {
      const url = match[1].trim();
      const text = match[2].replace(/<[^>]*>/g, '').trim();
      const isExternal = url.startsWith('http://') || url.startsWith('https://');
      if (!links.some(l => l.url === url)) {
        links.push({ url, text, isExternal, postId, postTitle, lang });
      }
    }

    return links;
  };

  const runLinkScan = async () => {
    if (isScanningLinks) return;
    setIsScanningLinks(true);
    
    try {
      const mergedPosts = [...firestoreBlog];
      MOCK_BLOG.forEach(mockPost => {
        if (!mergedPosts.find(p => p.id === mockPost.id)) {
          mergedPosts.push(mockPost as any as BlogPost);
        }
      });

      const extracted: any[] = [];
      mergedPosts.forEach(post => {
        const title = post.title?.tr || post.title?.en || (typeof post.title === 'string' ? post.title : '');
        const contentObj = post.content || {};
        
        Object.keys(contentObj).forEach(lang => {
          const text = contentObj[lang];
          if (text && typeof text === 'string') {
            const links = extractLinksFromContent(text, post.id, title, lang);
            extracted.push(...links);
          }
        });
      });

      if (extracted.length === 0) {
        setLinkScanResults([]);
        const nowStr = new Date().toLocaleString('tr-TR');
        setLastScanTime(nowStr);
        localStorage.setItem('resen_seo_link_scan', '[]');
        localStorage.setItem('resen_seo_link_scan_time', nowStr);
        setIsScanningLinks(false);
        return;
      }

      setScanProgress({ current: 0, total: extracted.length, articleTitle: 'Scanning internal routing...' });

      const allServices = [...firestoreServices];
      MOCK_SERVICES.forEach(ms => {
        if (!allServices.find((s: any) => s.id === ms.id)) {
          allServices.push(ms);
        }
      });

      const results = extracted.map(link => {
        const url = link.url;
        
        if (url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('#')) {
          return {
            ...link,
            status: 'ok',
            statusCode: 200
          };
        }

        let isInternal = !link.isExternal;
        let internalPath: string | null = null;
        
        if (isInternal) {
          internalPath = url;
        } else {
          try {
            const parsed = new URL(url);
            const domainList = ['resenlegal.com', 'resen.legal', 'localhost', window.location.hostname];
            if (domainList.some(d => parsed.hostname.includes(d))) {
              isInternal = true;
              internalPath = parsed.pathname + parsed.search + parsed.hash;
            }
          } catch {
            // Safe fallback
          }
        }

        if (isInternal) {
          const path = internalPath || url;
          const cleanPath = path.split(/[?#]/)[0];
          
          if (cleanPath === '/' || cleanPath === '') {
            return { ...link, isExternal: false, status: 'ok', statusCode: 200 };
          }
          
          const staticRoutes = ['/about', '/services', '/team', '/resen-gate', '/blog'];
          if (staticRoutes.includes(cleanPath)) {
            return { ...link, isExternal: false, status: 'ok', statusCode: 200 };
          }

          if (cleanPath.startsWith('/blog/')) {
            const slug = cleanPath.replace(/^\/blog\//, '');
            const postExists = mergedPosts.some(p => {
              const postSlug = getPostSlug(p);
              return p.id === slug || postSlug === slug;
            });
            if (postExists) {
              return { ...link, isExternal: false, status: 'ok', statusCode: 200 };
            } else {
              return { ...link, isExternal: false, status: 'broken', statusCode: 404, error: 'Target article slug does not exist' };
            }
          }

          if (cleanPath.startsWith('/service/')) {
            const svcId = cleanPath.replace(/^\/service\//, '');
            const serviceExists = allServices.some(s => s.id === svcId);
            if (serviceExists) {
              return { ...link, isExternal: false, status: 'ok', statusCode: 200 };
            } else {
              return { ...link, isExternal: false, status: 'broken', statusCode: 404, error: 'Target service page does not exist' };
            }
          }

          return { ...link, isExternal: false, status: 'broken', statusCode: 404, error: 'Unrecognized internal path' };
        }

        return { ...link, isExternal: true, status: 'pending' };
      });

      const pendingExternals = results.filter(r => r.isExternal && r.status === 'pending');
      const uniqueExternalUrls = Array.from(new Set(pendingExternals.map(r => r.url)));

      setScanProgress(prev => ({ ...prev, current: results.length - pendingExternals.length }));

      const chunkSize = 5;
      for (let i = 0; i < uniqueExternalUrls.length; i += chunkSize) {
        const chunk = uniqueExternalUrls.slice(i, i + chunkSize);
        const progressCount = results.length - pendingExternals.length + i;
        setScanProgress({
          current: progressCount,
          total: results.length,
          articleTitle: `Checking ${chunk.length} external link(s)...`
        });

        try {
          const response = await fetch('/api/seo/check-links', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ urls: chunk })
          });

          if (response.ok) {
            const { results: scanResultsList } = await response.json();
            scanResultsList.forEach((scanResultItem: any) => {
              results.forEach(r => {
                if (r.url === scanResultItem.url && r.status === 'pending') {
                  r.status = scanResultItem.status;
                  r.statusCode = scanResultItem.code;
                  r.error = scanResultItem.error;
                }
              });
            });
          } else {
            chunk.forEach(url => {
              results.forEach(r => {
                if (r.url === url && r.status === 'pending') {
                  r.status = 'broken';
                  r.error = `HTTP Error ${response.status}`;
                }
              });
            });
          }
        } catch (err: any) {
          chunk.forEach(url => {
            results.forEach(r => {
              if (r.url === url && r.status === 'pending') {
                r.status = 'broken';
                r.error = err.message || 'Verification failed';
              }
            });
          });
        }
      }

      results.forEach(r => {
        if (r.status === 'pending') {
          r.status = 'broken';
          r.error = 'Scan timed out';
        }
      });

      setLinkScanResults(results);
      const timeStr = new Date().toLocaleString('tr-TR');
      setLastScanTime(timeStr);
      localStorage.setItem('resen_seo_link_scan', JSON.stringify(results));
      localStorage.setItem('resen_seo_link_scan_time', timeStr);
    } catch (err) {
      console.error('Link scanning error:', err);
    } finally {
      setIsScanningLinks(false);
    }
  };

  const handleFixLink = (postId: string) => {
    const mergedPosts = [...firestoreBlog];
    MOCK_BLOG.forEach(mockPost => {
      if (!mergedPosts.find(p => p.id === mockPost.id)) {
        mergedPosts.push(mockPost as any as BlogPost);
      }
    });
    const post = mergedPosts.find(p => p.id === postId);
    if (post) {
      setEditingBlogPost(post);
      setIsBlogFormOpen(true);
    }
  };

  const generateSeoPdfReport = () => {
    const mergedPosts = [...firestoreBlog];
    MOCK_BLOG.forEach(mockPost => {
      if (!mergedPosts.find(p => p.id === mockPost.id)) {
        mergedPosts.push(mockPost as any as BlogPost);
      }
    });

    const analyzedPosts = mergedPosts.map(post => {
      const trTitle = post.title?.tr || post.title?.en || (typeof post.title === 'string' ? post.title : '');
      const trExcerpt = post.excerpt?.tr || post.excerpt?.en || (typeof post.excerpt === 'string' ? post.excerpt : '');
      const trDesc = post.metaDescription || trExcerpt;
      const slug = getPostSlug(post);
      const keywordsStr = post.seoKeywords || '';
      const keywordsList = keywordsStr ? keywordsStr.split(',').map(k => k.trim()).filter(Boolean) : [];
      const hasImage = !!post.image;
      const hasLanguage = !!post.language;

      const checks = [
        {
          id: 'title',
          name: 'Meta Title Tag',
          status: !trTitle ? 'fail' : (trTitle.length >= 40 && trTitle.length <= 70) ? 'pass' : 'warn'
        },
        {
          id: 'description',
          name: 'Meta Description',
          status: !trDesc ? 'fail' : (trDesc.length >= 100 && trDesc.length <= 200) ? 'pass' : 'warn'
        },
        {
          id: 'canonical',
          name: 'Canonical Tag Link',
          status: !slug ? 'fail' : /^[a-z0-9-_]+$/.test(slug) ? 'pass' : 'warn'
        },
        {
          id: 'keywords',
          name: 'SEO Focus Keywords',
          status: keywordsList.length >= 3 ? 'pass' : (keywordsList.length > 0 ? 'warn' : 'fail')
        },
        {
          id: 'ogImage',
          name: 'Open Graph (OG) Image',
          status: hasImage ? 'pass' : 'fail'
        },
        {
          id: 'language',
          name: 'HTML Lang Directive',
          status: hasLanguage ? 'pass' : 'warn'
        }
      ];

      const totalPoints = checks.reduce((acc, c) => acc + (c.status === 'pass' ? 2 : c.status === 'warn' ? 1 : 0), 0);
      const maxPoints = checks.length * 2;
      const score = Math.round((totalPoints / maxPoints) * 100);

      let rating: 'Excellent' | 'Good' | 'Needs Work' | 'Critical' = 'Critical';
      if (score >= 90) rating = 'Excellent';
      else if (score >= 75) rating = 'Good';
      else if (score >= 50) rating = 'Needs Work';

      return {
        post,
        score,
        rating,
        title: trTitle,
        slug,
        category: post.category,
        language: post.language || 'tr',
        checks
      };
    });

    const overallScore = Math.round(analyzedPosts.reduce((acc, p) => acc + p.score, 0) / Math.max(analyzedPosts.length, 1));
    const countExcellent = analyzedPosts.filter(p => p.rating === 'Excellent').length;
    const countGood = analyzedPosts.filter(p => p.rating === 'Good').length;
    const countNeedsWork = analyzedPosts.filter(p => p.rating === 'Needs Work').length;
    const countCritical = analyzedPosts.filter(p => p.rating === 'Critical').length;

    const missingTitles = analyzedPosts.filter(p => p.checks.find(c => c.id === 'title')?.status === 'fail').length;
    const missingDescriptions = analyzedPosts.filter(p => p.checks.find(c => c.id === 'description')?.status === 'fail').length;
    const missingKeywords = analyzedPosts.filter(p => p.checks.find(c => c.id === 'keywords')?.status === 'fail').length;
    const missingSlugs = analyzedPosts.filter(p => p.checks.find(c => c.id === 'canonical')?.status === 'fail').length;

    const toPdfSafeString = (str: any): string => {
      if (!str) return '';
      const stringVal = typeof str === 'string' ? str : (str.tr || str.en || '');
      const map: { [key: string]: string } = {
        'ş': 's', 'Ş': 'S',
        'ç': 'c', 'Ç': 'C',
        'ğ': 'g', 'Ğ': 'G',
        'ı': 'i', 'İ': 'I',
        'ö': 'o', 'Ö': 'O',
        'ü': 'u', 'Ü': 'U',
        'â': 'a', 'Â': 'A'
      };
      return stringVal.replace(/[şŞçÇğĞıİöÖüÜâÂ]/g, match => map[match] || match);
    };

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Page Accent Header
    doc.setFillColor(15, 32, 53);
    doc.rect(0, 0, 210, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('RESEN LEGAL & CONSULTANCY - SEO AUDIT REPORT', 15, 10);

    // Document Title
    doc.setTextColor(15, 32, 53);
    doc.setFontSize(18);
    doc.text('SEO HEALTH AUDIT REPORT', 15, 30);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString('tr-TR')}`, 15, 36);
    doc.text('Scope: Full Blog Meta-Tag & Search Indexing Audit', 15, 41);

    // Divider Line
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 46, 195, 46);

    // Summary Box
    doc.setFillColor(245, 247, 250);
    doc.rect(15, 52, 180, 32, 'F');

    doc.setTextColor(15, 32, 53);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('EXECUTIVE SUMMARY METRICS', 20, 59);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Overall SEO Health Score: ${overallScore}%`, 20, 66);
    doc.text(`Total Articles Audited: ${analyzedPosts.length}`, 20, 72);
    doc.text(`Excellent: ${countExcellent} | Good: ${countGood} | Needs Work: ${countNeedsWork} | Critical: ${countCritical}`, 20, 78);

    doc.setFont('helvetica', 'bold');
    doc.text('CRITICAL ISSUES DETECTED', 115, 59);
    doc.setFont('helvetica', 'normal');
    doc.text(`- Missing Meta Description: ${missingDescriptions}`, 115, 66);
    doc.text(`- Missing SEO Keywords: ${missingKeywords}`, 115, 72);
    doc.text(`- Missing Slugs / Canonicals: ${missingSlugs}`, 115, 78);

    let y = 95;
    let pageNumber = 1;

    analyzedPosts.forEach((postAnalysis, idx) => {
      if (y + 35 > 277) {
        // Page footer
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${pageNumber}`, 195, 287, { align: 'right' });
        doc.text('Confidential - Resen Legal Admin Portal', 15, 287);
        
        doc.addPage();
        pageNumber++;
        y = 25;
        
        // Running Header on new page
        doc.setFillColor(15, 32, 53);
        doc.rect(0, 0, 210, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('RESEN LEGAL & CONSULTANCY - SEO AUDIT REPORT', 15, 8);
      }

      // Border and card backgrounds
      doc.setDrawColor(230, 235, 240);
      doc.setFillColor(255, 255, 255);
      doc.rect(15, y, 180, 32, 'DF');

      // Title & Score Row
      doc.setTextColor(15, 32, 53);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      
      let titleStr = toPdfSafeString(postAnalysis.title);
      if (titleStr.length > 55) {
        titleStr = titleStr.substring(0, 52) + '...';
      }
      doc.text(`${idx + 1}. ${titleStr}`, 19, y + 6);

      // Score Badge background
      if (postAnalysis.score >= 90) {
        doc.setFillColor(220, 252, 231); // green
        doc.setTextColor(22, 101, 52);
      } else if (postAnalysis.score >= 75) {
        doc.setFillColor(209, 250, 229); // emerald
        doc.setTextColor(6, 95, 70);
      } else if (postAnalysis.score >= 50) {
        doc.setFillColor(254, 243, 199); // amber
        doc.setTextColor(146, 64, 14);
      } else {
        doc.setFillColor(254, 226, 226); // red
        doc.setTextColor(153, 27, 27);
      }
      doc.rect(142, y + 2, 48, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text(`SCORE: ${postAnalysis.score}% (${postAnalysis.rating.toUpperCase()})`, 144, y + 6);

      // Reset style for fields
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);

      const titleCheck = postAnalysis.checks.find(c => c.id === 'title')?.status;
      const descCheck = postAnalysis.checks.find(c => c.id === 'description')?.status;
      const canonicalCheck = postAnalysis.checks.find(c => c.id === 'canonical')?.status;
      const keywordsCheck = postAnalysis.checks.find(c => c.id === 'keywords')?.status;
      const ogImageCheck = postAnalysis.checks.find(c => c.id === 'ogImage')?.status;
      const langCheck = postAnalysis.checks.find(c => c.id === 'language')?.status;

      const getStatusLabel = (status: string | undefined) => {
        if (status === 'pass') return 'PASS';
        if (status === 'warn') return 'WARN';
        return 'FAIL';
      };

      const setStatusColor = (status: string | undefined) => {
        if (status === 'pass') {
          doc.setTextColor(34, 139, 34); // green
        } else if (status === 'warn') {
          doc.setTextColor(218, 112, 21); // orange
        } else {
          doc.setTextColor(220, 20, 60); // crimson
        }
      };

      // Col 1
      doc.setTextColor(80, 80, 80);
      doc.text(`Slug: /${postAnalysis.slug}`, 19, y + 13);
      doc.text(`Lang: ${postAnalysis.language.toUpperCase()}`, 19, y + 19);
      doc.text(`Category: ${toPdfSafeString(postAnalysis.category)}`, 19, y + 25);

      // Col 2
      doc.setTextColor(120, 120, 120);
      doc.text('Title Tag:', 90, y + 13);
      setStatusColor(titleCheck);
      doc.text(getStatusLabel(titleCheck), 120, y + 13);

      doc.setTextColor(120, 120, 120);
      doc.text('Meta Desc:', 90, y + 19);
      setStatusColor(descCheck);
      doc.text(getStatusLabel(descCheck), 120, y + 19);

      doc.setTextColor(120, 120, 120);
      doc.text('Canonical:', 90, y + 25);
      setStatusColor(canonicalCheck);
      doc.text(getStatusLabel(canonicalCheck), 120, y + 25);

      // Col 3
      doc.setTextColor(120, 120, 120);
      doc.text('Keywords:', 140, y + 13);
      setStatusColor(keywordsCheck);
      doc.text(getStatusLabel(keywordsCheck), 170, y + 13);

      doc.setTextColor(120, 120, 120);
      doc.text('OG Image:', 140, y + 19);
      setStatusColor(ogImageCheck);
      doc.text(getStatusLabel(ogImageCheck), 170, y + 19);

      doc.setTextColor(120, 120, 120);
      doc.text('Lang Tag:', 140, y + 25);
      setStatusColor(langCheck);
      doc.text(getStatusLabel(langCheck), 170, y + 25);

      y += 35;
    });

    // Page footer for last page
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${pageNumber}`, 195, 287, { align: 'right' });
    doc.text('Confidential - Resen Legal Admin Portal', 15, 287);

    // Save PDF
    doc.save(`Resen_Legal_SEO_Audit_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  useEffect(() => {
    if (activeTab === 'settings') {
      fetchSitemapDiagnostics();
      fetchSitemapLogs();
    }
  }, [activeTab]);

  // Blog states
  const [isBlogFormOpen, setIsBlogFormOpen] = useState(false);
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);
  const [blogSearchQuery, setBlogSearchQuery] = useState('');
  const [blogSelectedCategory, setBlogSelectedCategory] = useState('');
  const [blogSelectedStatus, setBlogSelectedStatus] = useState<'' | 'published' | 'draft'>('');
  const [selectedSharePost, setSelectedSharePost] = useState<any | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Blog slug edit states
  const [editingSlugs, setEditingSlugs] = useState<Record<string, string>>({});
  const [slugSaveError, setSlugSaveError] = useState<string | null>(null);
  const [slugSaveSuccess, setSlugSaveSuccess] = useState<string | null>(null);
  const [isUpdatingSlug, setIsUpdatingSlug] = useState<string | null>(null);

  // SEO Health States
  const [seoSearchQuery, setSeoSearchQuery] = useState('');
  const [seoHealthFilter, setSeoHealthFilter] = useState<'all' | 'Excellent' | 'Good' | 'Needs Work' | 'Critical'>('all');
  const [seoLanguageFilter, setSeoLanguageFilter] = useState<'all' | 'tr' | 'en'>('all');
  const [selectedSeoPostId, setSelectedSeoPostId] = useState<string | null>(null);

  // Link Scanner States
  const [isScanningLinks, setIsScanningLinks] = useState(false);
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0, articleTitle: '' });
  const [linkScanResults, setLinkScanResults] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('resen_seo_link_scan');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [lastScanTime, setLastScanTime] = useState<string | null>(() => {
    return localStorage.getItem('resen_seo_link_scan_time') || null;
  });
  const [linkFilter, setLinkFilter] = useState<'all' | 'broken' | 'ok'>('broken');
  const [linkTypeFilter, setLinkTypeFilter] = useState<'all' | 'internal' | 'external'>('all');

  // Settings State
  const [seoConfig, setSeoConfig] = useState({
    title: 'Resen Legal & Consultancy',
    description: 'Specialist Legal Counsel in International Law, Corporate Governance, and Dispute Resolution.',
    keywords: 'legal, law, consultancy, corporate, international law'
  });

  const { data: firestoreBlog } = useFirestoreCollection<BlogPost>('blog', 'date', 'desc');
  const { data: firestoreTeam } = useFirestoreCollection<TeamMember>('team', 'order', 'asc');
  const { data: firestoreServices } = useFirestoreCollection<any>('services', 'order', 'asc');

  const teamMembers = useMemo(() => {
    const merged = [...firestoreTeam];
    MOCK_TEAM.forEach(mockMember => {
      if (!merged.find(m => m.id === mockMember.id || m.name.toLowerCase() === mockMember.name.toLowerCase())) {
        merged.push(mockMember as any as TeamMember);
      }
    });
    return merged;
  }, [firestoreTeam]);

  const blogCategories = useMemo(() => {
    const mergedPosts = [...firestoreBlog];
    MOCK_BLOG.forEach(mockPost => {
      if (!mergedPosts.find(p => p.id === mockPost.id)) {
        mergedPosts.push(mockPost as any as BlogPost);
      }
    });
    return Array.from(new Set(mergedPosts.map(p => p.category))).filter(Boolean).sort();
  }, [firestoreBlog]);

  const totalViews = useMemo(() => {
    return firestoreBlog.reduce((acc, current) => acc + (current.views || 0), 0);
  }, [firestoreBlog]);

  const topArticles = useMemo(() => {
    return [...firestoreBlog]
      .filter(p => (p.views || 0) > 0)
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);
  }, [firestoreBlog]);
  const { data: inquiries, loading: inquiriesLoading, error: inquiriesError } = useFirestoreCollection<any>('contactMessages', 'createdAt', 'desc');
  const { data: logs } = useFirestoreCollection<any>('activityLogs', 'timestamp', 'desc');

  const getPostTitle = (post: any) => {
    if (!post) return '';
    if (typeof post.title === 'string') return post.title;
    return post.title?.tr || post.title?.en || Object.values(post.title || {})[0] || '';
  };

  const getPostExcerpt = (post: any) => {
    if (!post) return '';
    if (typeof post.excerpt === 'string') return post.excerpt;
    return post.excerpt?.tr || post.excerpt?.en || Object.values(post.excerpt || {})[0] || '';
  };

  const deleteBlogPost = async (postId: string) => {
    if (!window.confirm("Bu makaleyi sistemden kalıcı olarak kaldırmak istediğinize emin misiniz?")) return;
    try {
      const targetPost = firestoreBlog.find(p => p.id === postId);
      const wasPublished = (targetPost as any)?.status === 'published';

      await deleteDoc(doc(db, 'blog', postId));
      await logActivity('DELETE', 'blog', postId);

      if (wasPublished) {
        try {
          const token = await user?.getIdToken();
          if (token) {
            fetch('/api/deploy', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }).then(res => {
              if (res.ok) {
                console.log("Delete deploy trigger accepted by server.");
              } else {
                console.error("Delete deploy trigger rejected:", res.status);
              }
            }).catch(e => console.error("Error calling deploy on delete:", e));
          }
        } catch (tokenErr) {
          console.error("Failed to get token for delete deploy:", tokenErr);
        }
        alert("Yayınlanmış makale silindi. Site yaklaşık 2 dakika içinde güncellenecek");
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `blog/${postId}`);
    }
  };

  const handleUpdateSlug = async (postId: string, newSlug: string) => {
    try {
      setSlugSaveError(null);
      setSlugSaveSuccess(null);
      setIsUpdatingSlug(postId);
      
      const cleanedSlug = newSlug
        .toString()
        .toLowerCase()
        .replace(/[\s_]+/g, '-')
        .replace(/[çışğöüıÇİŞĞÖÜİ]/g, char => {
          const trMap: Record<string, string> = {
            'ç': 'c', 'ı': 'i', 'ş': 's', 'ğ': 'g', 'ö': 'o', 'ü': 'u',
            'Ç': 'C', 'İ': 'I', 'Ş': 'S', 'Ğ': 'G', 'Ö': 'O', 'Ü': 'U'
          };
          return trMap[char] || char;
        })
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');

      if (!cleanedSlug) {
        setSlugSaveError("Slug boş bırakılamaz.");
        setIsUpdatingSlug(null);
        return;
      }

      // Update in Firestore
      const postRef = doc(db, 'blog', postId);
      await updateDoc(postRef, { slug: cleanedSlug });

      setSlugSaveSuccess(`URL bağlantısı "${cleanedSlug}" olarak başarıyla güncellendi!`);
      
      // Clear local editing state for this post
      setEditingSlugs(prev => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });

      // Log the activity
      await addDoc(collection(db, 'activityLogs'), {
        action: `Blog URL Slug Güncellendi: ${cleanedSlug}`,
        timestamp: new Date().toISOString(),
        details: { postId, slug: cleanedSlug }
      });
    } catch (err: any) {
      setSlugSaveError(`Slug güncellenirken hata oluştu: ${err.message}`);
    } finally {
      setIsUpdatingSlug(null);
    }
  };

  useEffect(() => {
    // Load SEO settings from Firestore if available
    const loadSettings = async () => {
      try {
        const settingsSnap = await getDocs(collection(db, 'settings'));
        if (!settingsSnap.empty) {
          const data = settingsSnap.docs[0].data();
          if (data.seo) setSeoConfig(data.seo);
        }
      } catch (err) {
        // Silently log permission errors during initial load
        if (!(err instanceof Error && err.message.includes('permissions'))) {
          console.error("Failed to load settings:", err);
        }
      }
    };
    loadSettings();
  }, [user]);

  const logActivity = async (action: string, targetType: string, targetId: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'activityLogs'), {
        adminId: user.uid,
        adminEmail: user.email,
        action,
        targetType,
        targetId,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error("Failed to log activity:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      const isUserAdmin = isAdminEmail(authUser?.email);
      setIsAdmin(isUserAdmin);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsSubmitting(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        setError("Login target aborted.");
      } else {
        setError("Login failure. Verify credentials.");
        console.error(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const deleteInquiry = async (id: string) => {
    if (!window.confirm("Permanently delete this inquiry?")) return;
    try {
      await deleteDoc(doc(db, 'contactMessages', id));
      await logActivity('DELETE', 'contactMessages', id);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `contactMessages/${id}`);
    }
  };

  const summarizeInquiry = async (text: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (!res.ok) throw new Error('AI summarization failed');
      const data = await res.json();
      alert(`AI SUMMARY:\n\n${data.summary}`);
      await logActivity('AI_ACTION', 'summarize', 'inquiry');
    } catch (err) {
      console.error(err);
      alert("AI Summarization failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const refineText = async (text: string, currentId: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/ai/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: 'Turkish' }) // Defaulting to Turkish or detecting would be better
      });
      if (!res.ok) throw new Error('AI refinement failed');
      const data = await res.json();
      
      if (window.confirm(`REFINED LEGAL TEXT:\n\n${data.refined}\n\nApply this refinement?`)) {
        // Logic to update the relevant field would go here if we tracked what we're refining
        console.log("Refinement accepted:", data.refined);
      }
      await logActivity('AI_ACTION', 'refine', currentId);
    } catch (err) {
      console.error(err);
      alert("AI Refinement failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveSEO = async () => {
    setIsSubmitting(true);
    try {
      await setDoc(doc(db, 'settings', 'global'), {
        seo: seoConfig,
        updatedAt: serverTimestamp()
      });
      await logActivity('UPDATE', 'settings', 'global');
      alert("SEO Settings updated successfully.");
    } catch (err) {
      console.error("Save failure:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderLogs = () => (
    <div className="bg-white border border-brand-navy/5 rounded-sm shadow-sm overflow-hidden">
      <div className="p-8 border-b border-brand-navy/5 flex items-center justify-between">
        <h3 className="text-sm uppercase tracking-[0.3em] font-black text-brand-navy">Portal Activity Audit</h3>
        <Activity className="w-5 h-5 text-brand-gold" />
      </div>
      <div className="divide-y divide-brand-navy/5 max-h-[600px] overflow-y-auto">
        {logs.sort((a: any, b: any) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)).map((log: any) => (
          <div key={log.id} className="p-6 flex items-start justify-between hover:bg-brand-offwhite transition-colors">
            <div className="flex gap-4">
              <div className={`p-2 rounded-full ${
                log.action === 'DELETE' ? 'bg-red-50 text-red-600' : 
                log.action === 'CREATE' ? 'bg-green-50 text-green-600' : 'bg-brand-navy/5 text-brand-navy'
              }`}>
                {log.action === 'DELETE' ? <Trash2 className="w-3.5 h-3.5" /> : 
                 log.action === 'CREATE' ? <Plus className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
              </div>
              <div>
                <div className="text-xs font-bold text-brand-navy">
                  <span className="uppercase text-[10px] opacity-40 mr-2">{log.adminEmail}</span>
                  {log.action} {log.targetType}
                </div>
                <div className="text-[10px] text-brand-navy/40 mt-1">
                  Target ID: <span className="font-mono">{log.targetId}</span>
                </div>
              </div>
            </div>
            <div className="text-[10px] text-brand-navy/40 font-bold whitespace-nowrap">
              {log.timestamp?.toDate().toLocaleString()}
            </div>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="p-24 text-center text-brand-navy/40 text-xs italic">
            No activity logs available.
          </div>
        )}
      </div>
    </div>
  );

  const renderSettings = () => {
    // Collect all published blog posts
    const mergedPostsForSitemapCheck = [...firestoreBlog];
    MOCK_BLOG.forEach(mockPost => {
      if (!mergedPostsForSitemapCheck.find(p => p.id === mockPost.id)) {
        mergedPostsForSitemapCheck.push(mockPost as any as BlogPost);
      }
    });

    return (
      <div className="max-w-3xl space-y-8">
        <div className="bg-white p-12 border border-brand-navy/5 rounded-sm shadow-sm space-y-8">
          <div className="flex items-center gap-4">
            <Globe className="w-6 h-6 text-brand-gold" />
            <h3 className="text-sm uppercase tracking-[0.3em] font-black text-brand-navy">SEO & Global Metadata</h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-brand-navy/40">Site Title</label>
              <input 
                type="text" 
                value={seoConfig.title}
                onChange={(e) => setSeoConfig({...seoConfig, title: e.target.value})}
                className="w-full bg-brand-offwhite border-none p-4 text-xs font-bold text-brand-navy focus:ring-1 focus:ring-brand-gold transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-brand-navy/40">Meta Description</label>
              <textarea 
                rows={4}
                value={seoConfig.description}
                onChange={(e) => setSeoConfig({...seoConfig, description: e.target.value})}
                className="w-full bg-brand-offwhite border-none p-4 text-xs font-bold text-brand-navy focus:ring-1 focus:ring-brand-gold transition-all resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-brand-navy/40">Keywords (Comma separated)</label>
              <input 
                type="text" 
                value={seoConfig.keywords}
                onChange={(e) => setSeoConfig({...seoConfig, keywords: e.target.value})}
                className="w-full bg-brand-offwhite border-none p-4 text-xs font-bold text-brand-navy focus:ring-1 focus:ring-brand-gold transition-all"
              />
            </div>
          </div>

          <button 
            onClick={handleSaveSEO}
            disabled={isSubmitting}
            className="bg-brand-navy text-white px-10 py-5 text-[10px] uppercase tracking-[0.2em] font-black flex items-center gap-3 hover:bg-brand-gold transition-all disabled:opacity-50 shadow-xl"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Updating System...' : 'Save Site Settings'}
          </button>
        </div>

        {/* Sitemap XML Diagnostics Panel */}
        <div className="bg-white p-12 border border-brand-navy/5 rounded-sm shadow-sm space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-navy/5 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-brand-gold" />
                <h3 className="text-sm uppercase tracking-[0.3em] font-black text-brand-navy">
                  Sitemap XML Diagnostic Hub
                </h3>
              </div>
              <p className="text-[10px] text-brand-navy/40 uppercase tracking-widest font-bold">
                Real-Time Search Indexing Verification
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={fetchSitemapDiagnostics}
                disabled={sitemapLoading}
                className="bg-brand-navy hover:bg-brand-gold text-white px-5 py-3 text-[9px] uppercase tracking-widest font-black flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", sitemapLoading && "animate-spin")} />
                {sitemapLoading ? "Scanning..." : "Force Diagnostic Scan"}
              </button>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-offwhite text-brand-navy hover:bg-brand-navy hover:text-white px-5 py-3 text-[9px] uppercase tracking-widest font-black flex items-center gap-2 transition-all border border-brand-navy/5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View XML
              </a>
            </div>
          </div>

          {sitemapError && (
            <div className="bg-red-50 text-red-600 p-4 rounded-sm text-xs font-bold flex items-center gap-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Diagnostic Error: {sitemapError}</span>
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-brand-offwhite p-6 border border-brand-navy/5 rounded-sm">
              <div className="text-2xl font-serif text-brand-navy font-bold">{sitemapUrls.length}</div>
              <div className="text-[9px] text-brand-navy/40 uppercase tracking-widest font-black mt-1">Sitemap Index URLs</div>
            </div>
            <div className="bg-brand-offwhite p-6 border border-brand-navy/5 rounded-sm">
              <div className="text-2xl font-serif text-brand-navy font-bold">
                {mergedPostsForSitemapCheck.filter(p => (p as any).status !== 'draft').length}
              </div>
              <div className="text-[9px] text-brand-navy/40 uppercase tracking-widest font-black mt-1 font-bold">Published Articles</div>
            </div>
            <div className="bg-brand-offwhite p-6 border border-brand-navy/5 rounded-sm">
              <div className={`text-2xl font-serif font-bold ${sitemapUrls.length > 0 ? "text-green-600" : "text-amber-600"}`}>
                {sitemapUrls.length > 0 ? "Live & Active" : "Unscanned"}
              </div>
              <div className="text-[9px] text-brand-navy/40 uppercase tracking-widest font-black mt-1">Sitemap Status</div>
            </div>
          </div>

          {/* Live Status Table */}
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase tracking-widest font-black text-brand-navy/60">
              Live Blog Index Verification List
            </h4>
            <div className="border border-brand-navy/5 rounded-sm divide-y divide-brand-navy/5 overflow-hidden">
              {mergedPostsForSitemapCheck.slice(0, 10).map((post: any) => {
                const slug = getPostSlug(post);
                const sitemapLoc = `https://resenlegal.com/blog/${slug}`;
                const isDraft = post.status === 'draft';
                const isRegistered = sitemapUrls.includes(sitemapLoc);

                return (
                  <div key={post.id} className="p-4 bg-white hover:bg-brand-offwhite/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-brand-navy">
                        {getPostTitle(post)}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[8px] font-mono opacity-40 uppercase">/{slug}</span>
                        {post.language && (
                          <span className="text-[8px] uppercase tracking-widest px-1 bg-brand-navy/5 text-brand-navy font-bold rounded">
                            {post.language}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {isDraft ? (
                        <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-1 bg-gray-100 text-gray-500 rounded-sm">
                          Draft
                        </span>
                      ) : (
                        <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-1 bg-green-50 text-green-700 rounded-sm">
                          Published
                        </span>
                      )}

                      {isDraft ? (
                        <span className="text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 text-gray-400 border border-dashed border-gray-200 rounded-sm flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Excluded (Draft)
                        </span>
                      ) : isRegistered ? (
                        <span className="text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 bg-green-50 text-green-600 border border-green-200 rounded-sm flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Sitemap Active
                        </span>
                      ) : (
                        <span className="text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-sm flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Pending Scan
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {mergedPostsForSitemapCheck.length === 0 && (
                <div className="p-8 text-center text-xs text-brand-navy/40 italic">
                  No blog articles found.
                </div>
              )}
            </div>
            {mergedPostsForSitemapCheck.length > 10 && (
              <div className="text-right text-[9px] uppercase tracking-widest font-bold text-brand-navy/40">
                Showing newest 10 of {mergedPostsForSitemapCheck.length} blog posts
              </div>
            )}
          </div>

          {/* Verification Explanation */}
          <div className="p-6 bg-brand-offwhite rounded-sm text-xs text-brand-navy/60 leading-relaxed space-y-2 border-l-2 border-brand-gold">
            <p className="font-bold text-brand-navy">
              💡 Sitemap Otomatik Güncelleme Bilgilendirmesi:
            </p>
            <p>
              Resen Legal altyapısında <strong>sitemap.xml</strong> dosyası statik değildir; tamamen dinamiktir ve her çağrıldığında gerçek zamanlı (real-time) olarak güncellenir.
            </p>
            <p>
              Yönetim panelinden eklediğiniz yeni blog yazıları, durumları <strong>"Yayınlandı" (Published)</strong> olduğu sürece sitemap içerisine anında eklenir. Google ve diğer arama motorları periyodik aralıklarla sitemap'inizi tarayarak yeni yazıları otomatik olarak dizine ekler.
            </p>
          </div>

          {/* Recent Sitemap Indexing Events Log */}
          <div className="space-y-4 pt-8 border-t border-brand-navy/5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-[10px] uppercase tracking-widest font-black text-brand-navy/60">
                  Recent Indexing Events Log (Last 10 Runs)
                </h4>
                <p className="text-[9px] text-brand-navy/40 uppercase tracking-wider font-bold">
                  Historical Record of Google Search & Bot Scans
                </p>
              </div>
              <button
                onClick={fetchSitemapLogs}
                disabled={sitemapLogsLoading}
                className="text-brand-navy hover:text-brand-gold text-[9px] uppercase tracking-widest font-black flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={cn("w-3 h-3", sitemapLogsLoading && "animate-spin")} />
                Refresh Logs
              </button>
            </div>

            {sitemapLogsLoading && sitemapLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-brand-navy/40 animate-pulse italic">
                Loading indexing events...
              </div>
            ) : sitemapLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-brand-navy/40 border border-brand-navy/5 border-dashed rounded-sm italic bg-brand-offwhite">
                No indexing events recorded yet. Perform a scan or fetch /sitemap.xml to populate logs.
              </div>
            ) : (
              <div className="border border-brand-navy/5 rounded-sm overflow-hidden">
                <div className="bg-brand-offwhite px-4 py-3 border-b border-brand-navy/5 grid grid-cols-12 gap-4 text-[9px] uppercase tracking-widest font-black text-brand-navy/40">
                  <div className="col-span-4">Timestamp</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2">URLs Indexed</div>
                  <div className="col-span-4">Triggered By</div>
                </div>
                <div className="divide-y divide-brand-navy/5 bg-white">
                  {sitemapLogs.map((log) => {
                    const date = new Date(log.timestamp);
                    const formattedTime = isNaN(date.getTime())
                      ? "Unknown"
                      : date.toLocaleString("tr-TR", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false,
                        });

                    return (
                      <div key={log.id} className="px-4 py-3 grid grid-cols-12 gap-4 items-center hover:bg-brand-offwhite/30 transition-colors">
                        <div className="col-span-4 text-xs font-mono text-brand-navy">
                          {formattedTime}
                        </div>
                        <div className="col-span-2">
                          {log.status === "success" ? (
                            <span className="text-[8px] uppercase tracking-widest font-black px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-sm">
                              SUCCESS
                            </span>
                          ) : (
                            <span className="text-[8px] uppercase tracking-widest font-black px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-sm">
                              FAILED
                            </span>
                          )}
                        </div>
                        <div className="col-span-2 text-xs font-serif font-bold text-brand-navy pl-1">
                          {log.urlsCount}
                        </div>
                        <div className="col-span-4 text-[10px] uppercase tracking-wider font-bold text-brand-navy/60">
                          {log.triggeredBy || "Unknown"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderServices = () => {
    const handleSaveService = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      const formData = new FormData(e.target as HTMLFormElement);
      const serviceData = {
        title: { en: formData.get('title_en'), tr: formData.get('title_tr') },
        description: { en: formData.get('desc_en'), tr: formData.get('desc_tr') },
        fullDescription: { en: formData.get('full_en'), tr: formData.get('full_tr') },
        icon: formData.get('icon'),
        expertise: formData.get('expertise')?.toString().split(',').map(s => s.trim()) || [],
        order: Number(formData.get('order')) || 0,
        relatedCategory: formData.get('relatedCategory')?.toString() || ''
      };

      try {
        if (editingService?.id) {
          await updateDoc(doc(db, 'services', editingService.id), serviceData);
          await logActivity('UPDATE', 'services', editingService.id);
        } else {
          const docRef = await addDoc(collection(db, 'services'), serviceData);
          await logActivity('CREATE', 'services', docRef.id);
        }
        setEditingService(null);
        setIsAddingService(false);
      } catch (err) {
        console.error("Save service failed:", err);
      } finally {
        setIsSubmitting(false);
      }
    };

    const deleteService = async (id: string) => {
      if (!window.confirm("Remove this legal service?")) return;
      try {
        await deleteDoc(doc(db, 'services', id));
        await logActivity('DELETE', 'services', id);
      } catch (err) {
        console.error("Delete service failed:", err);
      }
    };

    if (isAddingService || editingService) {
      const initial = editingService || {
        title: { en: '', tr: '' },
        description: { en: '', tr: '' },
        fullDescription: { en: '', tr: '' },
        icon: 'Briefcase',
        expertise: [],
        order: MOCK_SERVICES.length + firestoreServices.length,
        relatedCategory: ''
      };

      return (
        <div className="max-w-4xl bg-white border border-brand-navy/5 rounded-sm shadow-xl p-12">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-sm uppercase tracking-[0.3em] font-black text-brand-navy">
              {editingService ? 'Refine Service Details' : 'Provision New Legal Service'}
            </h3>
            <button onClick={() => {setEditingService(null); setIsAddingService(false);}} className="text-[10px] uppercase tracking-widest font-bold text-brand-navy/40 hover:text-brand-navy flex items-center gap-2">
              <ArrowLeft className="w-3 h-3" /> Cancel
            </button>
          </div>
          
          <form onSubmit={handleSaveService} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-navy/40">Title (EN)</label>
                  <input name="title_en" defaultValue={initial.title?.en} required className="w-full bg-brand-offwhite border-none p-4 text-xs font-bold text-brand-navy" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-navy/40">Title (TR)</label>
                  <input name="title_tr" defaultValue={initial.title?.tr} required className="w-full bg-brand-offwhite border-none p-4 text-xs font-bold text-brand-navy" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-navy/40">Short Description (EN)</label>
                <textarea name="desc_en" defaultValue={initial.description?.en} rows={3} className="w-full bg-brand-offwhite border-none p-4 text-xs font-bold text-brand-navy resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-navy/40">Short Description (TR)</label>
                <textarea name="desc_tr" defaultValue={initial.description?.tr} rows={3} className="w-full bg-brand-offwhite border-none p-4 text-xs font-bold text-brand-navy resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-navy/40">Lucide Icon Name</label>
                  <input name="icon" defaultValue={initial.icon} className="w-full bg-brand-offwhite border-none p-4 text-xs font-bold text-brand-navy" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-navy/40">Order</label>
                  <input name="order" type="number" defaultValue={initial.order} className="w-full bg-brand-offwhite border-none p-4 text-xs font-bold text-brand-navy" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-navy/40">Full Service Detail (EN)</label>
                <textarea name="full_en" defaultValue={initial.fullDescription?.en} rows={5} className="w-full bg-brand-offwhite border-none p-4 text-xs font-bold text-brand-navy resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-navy/40">Full Service Detail (TR)</label>
                <textarea name="full_tr" defaultValue={initial.fullDescription?.tr} rows={5} className="w-full bg-brand-offwhite border-none p-4 text-xs font-bold text-brand-navy resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-navy/40">Expertise Areas (Comma separated)</label>
                <input name="expertise" defaultValue={initial.expertise?.join(', ')} className="w-full bg-brand-offwhite border-none p-4 text-xs font-bold text-brand-navy" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-navy/40">Related Blog Category / İlişkili Makale Kategorisi</label>
                <input 
                  name="relatedCategory" 
                  defaultValue={initial.relatedCategory || ''} 
                  list="blog-category-list"
                  placeholder="e.g. Şirketler Hukuku"
                  className="w-full bg-brand-offwhite border-none p-4 text-xs font-bold text-brand-navy" 
                />
                <datalist id="blog-category-list">
                  {blogCategories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
                <p className="text-[9px] text-brand-navy/40 mt-1 uppercase tracking-wider font-semibold">
                  * Related insights on this service detail page will pull from this category. If left empty, it falls back to matching service title.
                </p>
              </div>
            </div>

            <div className="md:col-span-2 pt-8">
              <button disabled={isSubmitting} type="submit" className="bg-brand-navy text-white px-10 py-5 text-[10px] uppercase tracking-[0.2em] font-black flex items-center gap-3 hover:bg-brand-gold transition-all shadow-xl">
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Updating Firm Capabilities...' : 'Deploy Service Update'}
              </button>
            </div>
          </form>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-sm uppercase tracking-[0.3em] font-black text-brand-navy">Service Portfolio</h3>
          <button onClick={() => setIsAddingService(true)} className="bg-brand-gold text-white px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-brand-navy transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Provision New Capability
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {firestoreServices.map((service: any) => (
            <div key={service.id} className="bg-white p-8 border border-brand-navy/5 rounded-sm group hover:shadow-lg transition-all relative">
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 bg-brand-offwhite flex items-center justify-center rounded-sm text-brand-navy group-hover:bg-brand-gold group-hover:text-white transition-all">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditingService(service)} className="p-2 text-brand-navy/20 hover:text-brand-gold transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => deleteService(service.id)} className="p-2 text-brand-navy/20 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <h4 className="text-sm font-bold text-brand-navy mb-2">{service.title?.en}</h4>
              <p className="text-[10px] text-brand-navy/40 uppercase tracking-widest font-bold mb-4">{service.icon}</p>
              <p className="text-[10px] text-brand-navy/60 line-clamp-2 leading-relaxed italic">
                "{service.description?.en}"
              </p>
            </div>
          ))}
          
          {/* Mock Services - Now editable to 'take ownership' */}
          {MOCK_SERVICES.filter(ms => !firestoreServices.find((fs:any) => fs.id === ms.id)).map((s: any) => (
            <div key={s.id} className="bg-white/50 p-8 border border-dashed border-brand-navy/10 rounded-sm group hover:shadow-md transition-all relative">
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 bg-brand-offwhite/50 flex items-center justify-center rounded-sm text-brand-navy/30 group-hover:bg-brand-gold/20 group-hover:text-brand-navy transition-all">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setEditingService({...s, id: undefined})} // Reset ID so it saves as new Firestore doc
                    className="p-2 text-brand-navy/20 hover:text-brand-gold transition-colors"
                    title="Edit to establish in Firestore"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <span className="text-[8px] uppercase tracking-widest font-black text-brand-navy/20">Initial Item</span>
                </div>
              </div>
              <h4 className="text-sm font-bold text-brand-navy/40 mb-2">{s.title?.en || s.title}</h4>
              <p className="text-[10px] text-brand-navy/20 uppercase tracking-widest font-bold mb-4">{s.icon}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSEOHealth = () => {
    const mergedPosts = [...firestoreBlog];
    MOCK_BLOG.forEach(mockPost => {
      if (!mergedPosts.find(p => p.id === mockPost.id)) {
        mergedPosts.push(mockPost as any as BlogPost);
      }
    });

    const analyzedPosts = mergedPosts.map(post => {
      const trTitle = post.title?.tr || post.title?.en || (typeof post.title === 'string' ? post.title : '');
      const trExcerpt = post.excerpt?.tr || post.excerpt?.en || (typeof post.excerpt === 'string' ? post.excerpt : '');
      const trDesc = post.metaDescription || trExcerpt;
      const slug = getPostSlug(post);
      const keywordsStr = post.seoKeywords || '';
      const keywordsList = keywordsStr ? keywordsStr.split(',').map(k => k.trim()).filter(Boolean) : [];
      const hasImage = !!post.image;
      const hasLanguage = !!post.language;

      const checks = [
        {
          id: 'title',
          name: 'Meta Title Tag',
          description: 'Optimum length: 40-70 characters. Appears as the clickable headline in search results.',
          value: trTitle,
          length: trTitle.length,
          status: !trTitle ? 'fail' : (trTitle.length >= 40 && trTitle.length <= 70) ? 'pass' : 'warn',
          feedback: !trTitle 
            ? 'Missing! Search engines will fallback to filename or header.' 
            : (trTitle.length < 40)
              ? `Too short (${trTitle.length} chars). Recommend adding descriptive keywords (target 40-70).`
              : (trTitle.length > 70)
                ? `Too long (${trTitle.length} chars). Headline may be truncated in Google search results.`
                : 'Excellent title length for optimal click-through rates.'
        },
        {
          id: 'description',
          name: 'Meta Description',
          description: 'Optimum length: 100-200 characters. Summarizes the content of the article for search results.',
          value: trDesc,
          length: trDesc.length,
          status: !trDesc ? 'fail' : (trDesc.length >= 100 && trDesc.length <= 200) ? 'pass' : 'warn',
          feedback: !trDesc 
            ? 'Missing! Search engines will autogenerate a description from random page text.' 
            : (trDesc.length < 100)
              ? `Too short (${trDesc.length} chars). Recommend explaining key takeaways (target 100-200).`
              : (trDesc.length > 200)
                ? `Too long (${trDesc.length} chars). Will be truncated in search snippets.`
                : 'Perfect description length. Clear, informative and engaging.'
        },
        {
          id: 'canonical',
          name: 'Canonical Tag Link',
          description: 'Must match a valid lowercase slug. Tells search engines which URL to index to prevent duplicate content issues.',
          value: slug ? `https://resenlegal.com/blog/${slug}` : '',
          length: slug.length,
          status: !slug ? 'fail' : /^[a-z0-9-_]+$/.test(slug) ? 'pass' : 'warn',
          feedback: !slug 
            ? 'Critical! No slug set. Cannot generate a canonical index URL.' 
            : !/^[a-z0-9-_]+$/.test(slug)
              ? 'Warning! Slug contains uppercase letters or invalid symbols. Use lowercase & hyphens only.'
              : 'Valid canonical URL structured correctly.'
        },
        {
          id: 'keywords',
          name: 'SEO Focus Keywords',
          description: 'Must have at least 3 comma-separated terms to anchor targeted search terms.',
          value: keywordsStr,
          length: keywordsList.length,
          status: keywordsList.length >= 3 ? 'pass' : (keywordsList.length > 0 ? 'warn' : 'fail'),
          feedback: keywordsList.length === 0 
            ? 'Missing! Add comma-separated search phrases (e.g., "göçmenlik, oturma izni").' 
            : keywordsList.length < 3
              ? `Few keywords (${keywordsList.length}/3). Add a couple more specific key phrases.`
              : 'Strong set of keywords configured.'
        },
        {
          id: 'ogImage',
          name: 'Open Graph (OG) Image',
          description: 'Provides a thumbnail graphic for rich preview card visual formatting on LinkedIn, Twitter, etc.',
          value: post.image,
          length: post.image ? 1 : 0,
          status: hasImage ? 'pass' : 'fail',
          feedback: !hasImage 
            ? 'Missing! Social platforms will display empty gray boxes when shared.' 
            : 'Open Graph cover art is correctly configured.'
        },
        {
          id: 'language',
          name: 'HTML Lang Directive',
          description: 'Tells search crawlers the native language spoken in the content (TR or EN) to display to correct search regions.',
          value: post.language || 'Not set',
          length: post.language ? post.language.length : 0,
          status: hasLanguage ? 'pass' : 'warn',
          feedback: !hasLanguage 
            ? 'Not set! Will default to overall site default. Highly recommend declaring the specific article language.' 
            : `Language correctly set to "${post.language.toUpperCase()}".`
        }
      ];

      const totalPoints = checks.reduce((acc, c) => acc + (c.status === 'pass' ? 2 : c.status === 'warn' ? 1 : 0), 0);
      const maxPoints = checks.length * 2;
      const score = Math.round((totalPoints / maxPoints) * 100);

      let rating: 'Excellent' | 'Good' | 'Needs Work' | 'Critical' = 'Critical';
      let ratingColor = 'text-red-700 bg-red-50 border-red-200';
      let ratingBadge = 'bg-red-500 text-white';
      if (score >= 90) {
        rating = 'Excellent';
        ratingColor = 'text-green-700 bg-green-50 border-green-200';
        ratingBadge = 'bg-green-600 text-white';
      } else if (score >= 75) {
        rating = 'Good';
        ratingColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
        ratingBadge = 'bg-emerald-600 text-white';
      } else if (score >= 50) {
        rating = 'Needs Work';
        ratingColor = 'text-amber-700 bg-amber-50 border-amber-200';
        ratingBadge = 'bg-amber-500 text-white';
      }

      return {
        post,
        score,
        rating,
        ratingColor,
        ratingBadge,
        checks,
        title: trTitle,
        slug,
        category: post.category,
        language: post.language || 'tr'
      };
    });

    // Calculate aggregated metrics
    const overallScore = Math.round(analyzedPosts.reduce((acc, p) => acc + p.score, 0) / Math.max(analyzedPosts.length, 1));
    const countExcellent = analyzedPosts.filter(p => p.rating === 'Excellent').length;
    const countGood = analyzedPosts.filter(p => p.rating === 'Good').length;
    const countNeedsWork = analyzedPosts.filter(p => p.rating === 'Needs Work').length;
    const countCritical = analyzedPosts.filter(p => p.rating === 'Critical').length;

    const missingTitles = analyzedPosts.filter(p => p.checks.find(c => c.id === 'title')?.status === 'fail').length;
    const missingDescriptions = analyzedPosts.filter(p => p.checks.find(c => c.id === 'description')?.status === 'fail').length;
    const missingKeywords = analyzedPosts.filter(p => p.checks.find(c => c.id === 'keywords')?.status === 'fail').length;
    const missingSlugs = analyzedPosts.filter(p => p.checks.find(c => c.id === 'canonical')?.status === 'fail').length;

    const brokenCount = linkScanResults.filter(l => l.status === 'broken').length;
    const okCount = linkScanResults.filter(l => l.status === 'ok').length;

    const filteredLinks = linkScanResults.filter(link => {
      const matchesStatus = linkFilter === 'all' || link.status === linkFilter;
      const matchesType = linkTypeFilter === 'all' || 
                          (linkTypeFilter === 'internal' && !link.isExternal) || 
                          (linkTypeFilter === 'external' && link.isExternal);
      return matchesStatus && matchesType;
    });

    // Filter posts according to query
    const filteredPosts = analyzedPosts.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(seoSearchQuery.toLowerCase()) || 
                            p.slug.toLowerCase().includes(seoSearchQuery.toLowerCase());
      const matchesHealth = seoHealthFilter === 'all' || p.rating === seoHealthFilter;
      const matchesLanguage = seoLanguageFilter === 'all' || p.language === seoLanguageFilter;
      return matchesSearch && matchesHealth && matchesLanguage;
    });

    return (
      <div className="space-y-10">
        {/* SEO Audit & Report Generator Card */}
        <div className="bg-gradient-to-r from-brand-navy to-brand-navy/90 p-8 rounded-sm text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-brand-navy/10 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-brand-gold/10 pointer-events-none blur-3xl" />
          
          <div className="space-y-2 relative z-10 max-w-2xl">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-gold" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-black text-brand-gold">SEO Audit Command Center</span>
            </div>
            <h3 className="text-xl font-serif font-bold text-white leading-tight">Executive SEO Metadata Report</h3>
            <p className="text-xs text-white/75 leading-relaxed">
              Generate and download an audit summarizing the SEO health and meta-tag status of all published and draft articles. This PDF highlights critical deficiencies (missing description, title length mismatches, missing OG images, invalid canonical links) for rapid indexing optimization.
            </p>
          </div>
          
          <button
            onClick={generateSeoPdfReport}
            className="bg-brand-gold hover:bg-white text-brand-navy hover:text-brand-navy px-8 py-4 text-[10px] uppercase tracking-[0.15em] font-black flex items-center gap-3.5 transition-all duration-300 shadow-lg shrink-0 group relative z-10"
          >
            <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
            Download PDF Audit Report
          </button>
        </div>

        {/* Hyperlink Integrity & Crawler Section */}
        <div className="bg-white border border-brand-navy/5 rounded-sm shadow-sm p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-navy/5 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-brand-gold" />
                <h3 className="text-xs uppercase tracking-[0.2em] font-black text-brand-navy">Hyperlink & Routing Integrity Scanner</h3>
              </div>
              <p className="text-[11px] text-brand-navy/50 leading-relaxed">
                Scan all blog post content for dead internal routes (e.g. broken article slugs, missing service pages) and broken external outbound web links.
              </p>
            </div>
            
            <div className="shrink-0 flex items-center gap-3">
              {lastScanTime && !isScanningLinks && (
                <span className="text-[9px] text-brand-navy/40 uppercase tracking-wider font-bold">
                  Last Scanned: {lastScanTime}
                </span>
              )}
              <button
                onClick={runLinkScan}
                disabled={isScanningLinks}
                className={cn(
                  "px-6 py-3 text-[10px] uppercase tracking-widest font-black flex items-center gap-2 transition-all shadow-sm",
                  isScanningLinks 
                    ? "bg-brand-navy/10 text-brand-navy/40 cursor-not-allowed" 
                    : "bg-brand-navy text-white hover:bg-brand-gold hover:text-brand-navy"
                )}
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isScanningLinks && "animate-spin")} />
                {isScanningLinks ? "Scanning..." : "Scan Blog Links"}
              </button>
            </div>
          </div>

          {/* Active Scanning Animation & Progress */}
          {isScanningLinks && (
            <div className="bg-brand-offwhite p-6 rounded-sm border border-brand-navy/5 space-y-4 animate-pulse">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-bold text-brand-navy">
                <span>{scanProgress.articleTitle}</span>
                <span>{scanProgress.current} / {scanProgress.total} links verified</span>
              </div>
              <div className="w-full bg-brand-navy/10 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-gold rounded-full transition-all duration-300" 
                  style={{ width: `${(scanProgress.current / Math.max(scanProgress.total, 1)) * 100}%` }}
                />
              </div>
              <p className="text-[9px] text-brand-navy/40 italic">
                Scanning outbound links via server proxy to prevent CORS restrictions. Please do not close this tab.
              </p>
            </div>
          )}

          {/* Statistics Grid */}
          {linkScanResults.length > 0 && !isScanningLinks && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-brand-offwhite p-4 border border-brand-navy/5 rounded-sm">
                <div className="text-[9px] uppercase tracking-wider font-black text-brand-navy/40 mb-1">Total Found Links</div>
                <div className="text-2xl font-serif font-black text-brand-navy">{linkScanResults.length}</div>
              </div>
              <div className="bg-green-50 p-4 border border-green-200/50 rounded-sm">
                <div className="text-[9px] uppercase tracking-wider font-black text-green-800/60 mb-1">Healthy Links (PASS)</div>
                <div className="text-2xl font-serif font-black text-green-700">{okCount}</div>
              </div>
              <div className={cn(
                "p-4 border rounded-sm",
                brokenCount > 0 ? "bg-red-50 border-red-200/50" : "bg-brand-offwhite border-brand-navy/5"
              )}>
                <div className={cn("text-[9px] uppercase tracking-wider font-black mb-1", brokenCount > 0 ? "text-red-800/60" : "text-brand-navy/40")}>Broken Links (FLAGGED)</div>
                <div className={cn("text-2xl font-serif font-black", brokenCount > 0 ? "text-red-700" : "text-brand-navy")}>{brokenCount}</div>
              </div>
            </div>
          )}

          {/* Results Table & Filter Controls */}
          {linkScanResults.length > 0 && !isScanningLinks && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-brand-offwhite p-4 rounded-sm border border-brand-navy/5">
                <div className="text-[9px] uppercase tracking-wider font-bold text-brand-navy/60">
                  Showing {filteredLinks.length} filtered links of {linkScanResults.length}
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="flex-1 sm:flex-none">
                    <select
                      value={linkFilter}
                      onChange={(e) => setLinkFilter(e.target.value as any)}
                      className="w-full bg-white border border-brand-navy/10 px-3 py-2 text-[9px] uppercase tracking-wider font-black text-brand-navy focus:ring-1 focus:ring-brand-gold"
                    >
                      <option value="all">All Statuses</option>
                      <option value="broken">Broken / Flagged Only</option>
                      <option value="ok">Healthy Links Only</option>
                    </select>
                  </div>

                  <div className="flex-1 sm:flex-none">
                    <select
                      value={linkTypeFilter}
                      onChange={(e) => setLinkTypeFilter(e.target.value as any)}
                      className="w-full bg-white border border-brand-navy/10 px-3 py-2 text-[9px] uppercase tracking-wider font-black text-brand-navy focus:ring-1 focus:ring-brand-gold"
                    >
                      <option value="all">All Link Types</option>
                      <option value="internal">Internal Only</option>
                      <option value="external">External Only</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Table list */}
              <div className="border border-brand-navy/5 rounded-sm overflow-hidden bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-brand-offwhite text-[9px] uppercase tracking-widest font-black text-brand-navy/60 border-b border-brand-navy/5">
                        <th className="p-4 pl-6">Link Anchor Text</th>
                        <th className="p-4">Target URL / Destination</th>
                        <th className="p-4">Source Post & Lang</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 pr-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-navy/5 text-xs">
                      {filteredLinks.map((link, idx) => (
                        <tr key={idx} className="hover:bg-brand-offwhite/50 transition-colors">
                          <td className="p-4 pl-6 font-bold text-brand-navy max-w-[180px] truncate">
                            "{link.text || 'Empty Anchor Text'}"
                          </td>
                          <td className="p-4 font-mono text-[10px] text-brand-navy/60 max-w-[240px] truncate">
                            <span title={link.url}>{link.url}</span>
                          </td>
                          <td className="p-4">
                            <div className="space-y-0.5">
                              <div className="font-bold text-brand-navy/80 max-w-[180px] truncate">{link.postTitle}</div>
                              <span className="inline-block text-[8px] uppercase tracking-wider bg-brand-navy/5 px-1 rounded text-brand-navy/60 font-bold">
                                {link.lang.toUpperCase()}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={cn(
                              "text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full font-bold",
                              link.isExternal ? "bg-amber-50 text-amber-800 border border-amber-200" : "bg-blue-50 text-blue-800 border border-blue-200"
                            )}>
                              {link.isExternal ? 'External' : 'Internal'}
                            </span>
                          </td>
                          <td className="p-4">
                            {link.status === 'ok' ? (
                              <span className="inline-flex items-center gap-1 text-green-700 font-bold text-[10px]">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                                PASS {link.statusCode ? `(${link.statusCode})` : ''}
                              </span>
                            ) : (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 text-red-700 font-bold text-[10px]">
                                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                  BROKEN {link.statusCode ? `(${link.statusCode})` : ''}
                                </span>
                                {link.error && (
                                  <p className="text-[9px] text-red-500/80 leading-normal max-w-[150px] font-medium">{link.error}</p>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <button
                              onClick={() => handleFixLink(link.postId)}
                              className="bg-brand-navy hover:bg-brand-gold text-white hover:text-brand-navy px-3 py-1.5 text-[9px] uppercase tracking-widest font-black transition-colors"
                            >
                              Fix Link
                            </button>
                          </td>
                        </tr>
                      ))}

                      {filteredLinks.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-12 text-center text-xs text-brand-navy/40 italic bg-white">
                            No links match the selected filter criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {linkScanResults.length === 0 && !isScanningLinks && (
            <div className="bg-brand-offwhite p-12 text-center border border-brand-navy/5 rounded-sm">
              <Globe className="w-8 h-8 text-brand-navy/20 mx-auto mb-3" />
              <p className="text-xs font-bold text-brand-navy">No scan history found</p>
              <p className="text-[10px] text-brand-navy/40 max-w-md mx-auto mt-1 mb-4">
                Click "Scan Blog Links" to analyze all internal routing and verify outbound hyper-links for 404 or dead ends.
              </p>
            </div>
          )}
        </div>

        {/* SEO Dashboard Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="bg-white p-8 border border-brand-navy/5 rounded-sm shadow-sm space-y-2 flex flex-col justify-center">
            <div className="text-[10px] uppercase tracking-widest font-black text-brand-navy/40">Overall Blog SEO Score</div>
            <div className="text-4xl font-serif text-brand-navy font-bold flex items-baseline gap-2">
              <span className={cn(
                overallScore >= 90 ? "text-green-600" : overallScore >= 75 ? "text-emerald-600" : overallScore >= 50 ? "text-amber-500" : "text-red-500"
              )}>
                {overallScore}%
              </span>
              <span className="text-xs text-brand-navy/30 font-sans font-normal">average score</span>
            </div>
            <div className="w-full bg-brand-navy/5 h-1.5 rounded-full overflow-hidden mt-2">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-1000",
                  overallScore >= 90 ? "bg-green-500" : overallScore >= 75 ? "bg-emerald-500" : overallScore >= 50 ? "bg-amber-400" : "bg-red-500"
                )}
                style={{ width: `${overallScore}%` }}
              />
            </div>
          </div>

          <div className="bg-white p-8 border border-brand-navy/5 rounded-sm shadow-sm space-y-3 col-span-2">
            <div className="text-[10px] uppercase tracking-widest font-black text-brand-navy/40 mb-1">Health Distribution</div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold text-brand-navy/60">
                  <span>Excellent</span>
                  <span className="text-green-600">{countExcellent} post{countExcellent !== 1 && 's'}</span>
                </div>
                <div className="w-full bg-brand-navy/5 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${(countExcellent / Math.max(analyzedPosts.length, 1)) * 100}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold text-brand-navy/60">
                  <span>Good</span>
                  <span className="text-emerald-600">{countGood} post{countGood !== 1 && 's'}</span>
                </div>
                <div className="w-full bg-brand-navy/5 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(countGood / Math.max(analyzedPosts.length, 1)) * 100}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold text-brand-navy/60">
                  <span>Needs Work</span>
                  <span className="text-amber-500">{countNeedsWork} post{countNeedsWork !== 1 && 's'}</span>
                </div>
                <div className="w-full bg-brand-navy/5 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(countNeedsWork / Math.max(analyzedPosts.length, 1)) * 100}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold text-brand-navy/60">
                  <span>Critical</span>
                  <span className="text-red-500">{countCritical} post{countCritical !== 1 && 's'}</span>
                </div>
                <div className="w-full bg-brand-navy/5 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${(countCritical / Math.max(analyzedPosts.length, 1)) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 border border-brand-navy/5 rounded-sm shadow-sm space-y-2">
            <div className="text-[10px] uppercase tracking-widest font-black text-brand-navy/40">Critical Deficiencies</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold text-brand-navy/70">
                <span>Missing Description</span>
                <span className={missingDescriptions > 0 ? "text-red-500 font-black" : "text-green-600"}>{missingDescriptions}</span>
              </div>
              <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold text-brand-navy/70">
                <span>Missing Keywords</span>
                <span className={missingKeywords > 0 ? "text-amber-600 font-black" : "text-green-600"}>{missingKeywords}</span>
              </div>
              <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold text-brand-navy/70">
                <span>Missing Slugs/Canonical</span>
                <span className={missingSlugs > 0 ? "text-red-500 font-black" : "text-green-600"}>{missingSlugs}</span>
              </div>
              <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold text-brand-navy/70">
                <span>Missing Title</span>
                <span className={missingTitles > 0 ? "text-red-500 font-black" : "text-green-600"}>{missingTitles}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-8 border border-brand-navy/5 rounded-sm shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="w-full md:flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-navy/30" />
              <input 
                type="text" 
                placeholder="Search articles by title, keywords or slug..."
                value={seoSearchQuery}
                onChange={(e) => setSeoSearchQuery(e.target.value)}
                className="w-full bg-brand-offwhite border-none pl-12 pr-4 py-4 text-xs font-bold text-brand-navy focus:ring-1 focus:ring-brand-gold transition-all"
              />
            </div>
            
            <div className="flex flex-wrap gap-4 w-full md:w-auto">
              <div className="space-y-1 flex-1 md:flex-none">
                <label className="text-[8px] uppercase tracking-widest font-black text-brand-navy/40">Health Status</label>
                <select 
                  value={seoHealthFilter}
                  onChange={(e) => setSeoHealthFilter(e.target.value as any)}
                  className="w-full bg-brand-offwhite border-none p-3 text-[10px] uppercase tracking-wider font-bold text-brand-navy focus:ring-1 focus:ring-brand-gold transition-all"
                >
                  <option value="all">All Grades</option>
                  <option value="Excellent">Excellent (&gt;= 90)</option>
                  <option value="Good">Good (75-89)</option>
                  <option value="Needs Work">Needs Work (50-74)</option>
                  <option value="Critical">Critical (&lt; 50)</option>
                </select>
              </div>

              <div className="space-y-1 flex-1 md:flex-none">
                <label className="text-[8px] uppercase tracking-widest font-black text-brand-navy/40">Language</label>
                <select 
                  value={seoLanguageFilter}
                  onChange={(e) => setSeoLanguageFilter(e.target.value as any)}
                  className="w-full bg-brand-offwhite border-none p-3 text-[10px] uppercase tracking-wider font-bold text-brand-navy focus:ring-1 focus:ring-brand-gold transition-all"
                >
                  <option value="all">All Languages</option>
                  <option value="tr">Turkish (TR)</option>
                  <option value="en">English (EN)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Audit List */}
        <div className="space-y-6">
          <h3 className="text-xs uppercase tracking-[0.25em] font-black text-brand-navy/60">
            Article SEO Audit Log ({filteredPosts.length} matches)
          </h3>

          <div className="space-y-4">
            {filteredPosts.map((record) => {
              const isOpen = selectedSeoPostId === record.post.id;
              
              return (
                <div 
                  key={record.post.id} 
                  className={cn(
                    "bg-white border rounded-sm transition-all overflow-hidden",
                    isOpen ? "border-brand-gold ring-1 ring-brand-gold/10 shadow-md" : "border-brand-navy/5 hover:border-brand-navy/20"
                  )}
                >
                  {/* Header row */}
                  <div 
                    onClick={() => setSelectedSeoPostId(isOpen ? null : record.post.id)}
                    className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-brand-navy group-hover:text-brand-gold transition-colors">
                          {record.title}
                        </span>
                        <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 bg-brand-navy/5 text-brand-navy font-bold rounded">
                          {record.language}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[9px] font-mono text-brand-navy/40 uppercase font-bold">
                        <span>slug: /{record.slug}</span>
                        <span>•</span>
                        <span>category: {record.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className={cn(
                          "inline-block text-[9px] uppercase tracking-widest font-black px-2.5 py-1 border rounded-sm",
                          record.ratingColor
                        )}>
                          {record.rating} ({record.score}%)
                        </span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingBlogPost(record.post);
                          setIsBlogFormOpen(true);
                        }}
                        className="bg-brand-navy hover:bg-brand-gold text-white px-3.5 py-2 text-[9px] uppercase tracking-widest font-black transition-colors"
                      >
                        Edit Metadata
                      </button>
                    </div>
                  </div>

                  {/* Checklist Drawer */}
                  {isOpen && (
                    <div className="border-t border-brand-navy/5 bg-brand-offwhite/50 p-8 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <h4 className="text-[10px] uppercase tracking-widest font-black text-brand-navy/40">
                            SEO Checklist Breakdown
                          </h4>
                          <div className="space-y-3">
                            {record.checks.map(check => (
                              <div key={check.id} className="bg-white p-4 border border-brand-navy/5 rounded-sm flex items-start gap-3.5">
                                <div className="shrink-0 mt-0.5">
                                  {check.status === 'pass' ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                  ) : check.status === 'warn' ? (
                                    <AlertCircle className="w-4 h-4 text-amber-500 animate-pulse" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                  )}
                                </div>
                                <div className="space-y-1 flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-brand-navy">{check.name}</span>
                                    <span className={cn(
                                      "text-[8px] uppercase tracking-widest font-black px-1 rounded-sm",
                                      check.status === 'pass' ? "bg-green-50 text-green-700" : check.status === 'warn' ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                                    )}>
                                      {check.status.toUpperCase()}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-brand-navy/60 leading-relaxed">
                                    {check.feedback}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Direct Metadata Preview & Quick Fix Info */}
                        <div className="space-y-6">
                          <div className="bg-white p-6 border border-brand-navy/5 rounded-sm space-y-4">
                            <h4 className="text-[10px] uppercase tracking-widest font-black text-brand-navy/40">
                              Google Search Snippet Preview
                            </h4>
                            <div className="space-y-1 font-sans">
                              <div className="text-[#1a0dab] text-lg font-normal hover:underline cursor-pointer font-sans truncate">
                                {record.title} | Resen Legal
                              </div>
                              <div className="text-[#006621] text-xs font-mono">
                                https://resenlegal.com/blog/{record.slug}
                              </div>
                              <div className="text-[#545454] text-xs leading-relaxed max-w-md line-clamp-2">
                                {record.checks.find(c => c.id === 'description')?.value || "Missing meta description. Click Edit Metadata to set a high-converting, keyword-rich SEO description."}
                              </div>
                            </div>
                          </div>

                          <div className="bg-white p-6 border border-brand-navy/5 rounded-sm space-y-4">
                            <h4 className="text-[10px] uppercase tracking-widest font-black text-brand-navy/40">
                              Quick Indexing Optimization Guidelines
                            </h4>
                            <ul className="space-y-2 text-[10px] text-brand-navy/60 leading-relaxed list-disc list-inside">
                              <li>Keep meta titles under 60 chars so they don't truncate on mobile devices.</li>
                              <li>Avoid duplicate content: ensure the slug matches the canonical URL.</li>
                              <li>Include 3-5 keywords that users actually search for.</li>
                              <li>Always provide an Open Graph Image for high LinkedIn click-through rate.</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredPosts.length === 0 && (
              <div className="p-16 text-center text-xs text-brand-navy/40 italic bg-white border border-brand-navy/5 rounded-sm">
                No blog posts matching the active search or health filters.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderBlogDashboard = () => {
    // Merge Firestore and Mock blog posts safely
    const mergedPosts = [...firestoreBlog];
    MOCK_BLOG.forEach(mockPost => {
      if (!mergedPosts.find(p => p.id === mockPost.id)) {
        mergedPosts.push(mockPost as any as BlogPost);
      }
    });

    // Extract unique categories safely
    const uniqueCategories = Array.from(new Set(mergedPosts.map(p => p.category))).filter(Boolean).sort();

    // Filter based on search & category & status
    const filteredPosts = mergedPosts.filter(post => {
      const titleText = getPostTitle(post).toLowerCase();
      const excerptText = getPostExcerpt(post).toLowerCase();
      const catText = (post.category || '').toLowerCase();
      const matchesSearch = titleText.includes(blogSearchQuery.toLowerCase()) || 
                            excerptText.includes(blogSearchQuery.toLowerCase()) ||
                            catText.includes(blogSearchQuery.toLowerCase());
      
      const matchesCategory = blogSelectedCategory === '' || post.category === blogSelectedCategory;
      
      const postStatus = (post as any).status || 'published';
      const matchesStatus = blogSelectedStatus === '' || postStatus === blogSelectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Stats
    const totalPublished = mergedPosts.filter(p => (p as any).status !== 'draft').length;
    const totalDrafts = mergedPosts.filter(p => (p as any).status === 'draft').length;
    const dbArticles = firestoreBlog.length;
    const totalCategoriesCount = uniqueCategories.length;
    const latestPostDate = mergedPosts.length > 0 
      ? [...mergedPosts].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date 
      : 'N/A';

    return (
      <div className="space-y-8">
        {/* Editorial Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/45 backdrop-blur-md p-6 rounded-sm border border-brand-navy/5">
          <div>
            <h3 className="text-xl font-serif text-brand-navy">Blog Editorial Executive Suite</h3>
            <p className="text-xs text-brand-navy/50 mt-1 font-light">Draft, curate, optimize SEO, and generate instant social shares for publications.</p>
          </div>
          <button
            onClick={() => {
              setEditingBlogPost(null);
              setIsBlogFormOpen(true);
            }}
            className="self-start md:self-center bg-brand-navy text-white px-8 py-3.5 text-[10px] uppercase tracking-[0.2em] font-black hover:bg-brand-gold hover:shadow-lg transition-all flex items-center gap-2 rounded-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Write Master Article
          </button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 border border-brand-navy/5 rounded-sm shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-brand-navy/5 rounded-bl-full flex items-center justify-center transition-transform group-hover:scale-110">
              <FileText className="w-5 h-5 text-brand-navy/30" />
            </div>
            <p className="text-[9px] uppercase tracking-[0.2em] font-black text-brand-navy/40">Publications Stream</p>
            <h4 className="text-3xl font-serif text-brand-navy mt-2">{totalPublished} <span className="text-xs font-sans text-brand-navy/50 ml-1 font-light">live</span></h4>
            <div className="text-[10px] text-brand-navy/40 mt-3 font-medium flex items-center gap-1.5">
              <span className="text-brand-gold font-bold">{dbArticles}</span> active database syncs
            </div>
          </div>

          <div className="bg-white p-6 border border-brand-navy/5 rounded-sm shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-50 rounded-bl-full flex items-center justify-center transition-transform group-hover:scale-110">
              <AlertCircle className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-[9px] uppercase tracking-[0.2em] font-black text-brand-navy/40">Saved Drafts</p>
            <h4 className="text-3xl font-serif text-orange-600 mt-2">{totalDrafts} <span className="text-xs font-sans text-brand-navy/50 ml-1 font-light">drafts</span></h4>
            <div className="text-[10px] text-brand-navy/40 mt-3 font-medium">
              In-progress publications
            </div>
          </div>

          <div className="bg-white p-6 border border-brand-navy/5 rounded-sm shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-brand-navy/5 rounded-bl-full flex items-center justify-center transition-transform group-hover:scale-110">
              <Globe className="w-5 h-5 text-brand-navy/30" />
            </div>
            <p className="text-[9px] uppercase tracking-[0.2em] font-black text-brand-navy/40">Editorial Topics</p>
            <h4 className="text-3xl font-serif text-brand-navy mt-2">{totalCategoriesCount}</h4>
            <div className="text-[10px] text-brand-navy/40 mt-3 font-medium">
              Targeted practice categories
            </div>
          </div>

          <div className="bg-white p-6 border border-brand-navy/5 rounded-sm shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full flex items-center justify-center transition-transform group-hover:scale-110">
              <Sparkles className="w-5 h-5 text-emerald-600/60" />
            </div>
            <p className="text-[9px] uppercase tracking-[0.2em] font-black text-brand-navy/40">CMS Editorial Status</p>
            <h4 className="text-lg font-bold text-emerald-600 mt-4 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Fully Equipped
            </h4>
            <div className="text-[10px] text-brand-navy/40 mt-3 font-medium">
              Rich-WYSIWYG & Auto Backup Active
            </div>
          </div>
        </div>

        {/* Filters and List */}
        <div className="bg-white rounded-sm border border-brand-navy/5 shadow-sm overflow-hidden">
          {/* Controls Bar */}
          <div className="p-6 border-b border-brand-navy/5 bg-white/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-navy/35" />
              <input
                type="text"
                placeholder="Search publications..."
                value={blogSearchQuery}
                onChange={e => setBlogSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-brand-navy/[0.02] border border-brand-navy/10 rounded-sm focus:border-brand-gold outline-none text-xs transition-all font-light"
              />
            </div>

            {/* Category and Status Filters */}
            <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
              <select
                value={blogSelectedCategory}
                onChange={e => setBlogSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-brand-navy/[0.02] border border-brand-navy/10 rounded-sm focus:border-brand-gold outline-none text-xs text-brand-navy font-light cursor-pointer"
              >
                <option value="">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{getCategoryTranslation(cat, i18n.language, firestoreServices)}</option>
                ))}
              </select>

              <select
                value={blogSelectedStatus}
                onChange={e => setBlogSelectedStatus(e.target.value as any)}
                className="px-4 py-2 bg-brand-navy/[0.02] border border-brand-navy/10 rounded-sm focus:border-brand-gold outline-none text-xs text-brand-navy font-light cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="published">Only Published</option>
                <option value="draft">Only Drafts</option>
              </select>

              { (blogSearchQuery || blogSelectedCategory || blogSelectedStatus) && (
                <button
                  onClick={() => { setBlogSearchQuery(''); setBlogSelectedCategory(''); setBlogSelectedStatus(''); }}
                  className="px-4 py-2 border border-brand-navy/10 hover:border-brand-gold hover:text-white transition-colors text-brand-navy text-xs font-bold rounded-sm uppercase tracking-wider cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Publications Table */}
          <div className="overflow-x-auto font-sans">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-navy/[0.02] border-b border-brand-navy/5 font-sans">
                  <th className="p-4 text-[9px] uppercase tracking-[0.15em] font-black text-brand-navy/55 pl-6 font-sans">Article Information</th>
                  <th className="p-4 text-[9px] uppercase tracking-[0.15em] font-black text-brand-navy/55 font-sans">Category</th>
                  <th className="p-4 text-[9px] uppercase tracking-[0.15em] font-black text-brand-navy/55 font-sans">Language</th>
                  <th className="p-4 text-[9px] uppercase tracking-[0.15em] font-black text-brand-navy/55 font-sans">Author</th>
                  <th className="p-4 text-[9px] uppercase tracking-[0.15em] font-black text-brand-navy/55 font-sans">Publish Date</th>
                  <th className="p-4 text-[9px] uppercase tracking-[0.15em] font-black text-brand-navy/55 font-sans">Views / Okunma</th>
                  <th className="p-4 text-[9px] uppercase tracking-[0.15em] font-black text-brand-navy/55 font-sans">Status</th>
                  <th className="p-4 text-[9px] uppercase tracking-[0.15em] font-black text-brand-navy/55 text-right pr-6 font-sans">Management Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-navy/[0.03]">
                {filteredPosts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-brand-navy/40 text-xs font-light">
                      No publication match your search filters.
                    </td>
                  </tr>
                ) : (
                  filteredPosts.map(post => {
                    const titleText = getPostTitle(post);
                    const excerptText = getPostExcerpt(post);
                    const isSystemMock = MOCK_BLOG.some(p => p.id === post.id) && !firestoreBlog.some(p => p.id === post.id);
                    const isDraft = (post as any).status === 'draft';

                    return (
                      <tr key={post.id} className="hover:bg-brand-navy/[0.01] transition-colors group">
                        <td className="p-4 pl-6 max-w-sm">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-10 bg-brand-navy/5 rounded-sm overflow-hidden border border-brand-navy/5 flex-shrink-0">
                              <img
                                src={post.image || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80"}
                                alt=""
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="min-w-0">
                              <h5 className="font-serif text-brand-navy text-xs font-bold truncate group-hover:text-brand-gold transition-colors">{titleText}</h5>
                              <p className="text-[10px] text-brand-navy/40 font-light truncate mt-0.5">{excerptText}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 bg-brand-gold/10 text-brand-navy text-[10px] font-medium tracking-wide rounded-sm border border-brand-gold/15">
                            {getCategoryTranslation(post.category, i18n.language, firestoreServices)}
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-brand-navy/5 text-brand-navy/85 text-[10px] font-bold tracking-wider rounded-sm border border-brand-navy/10 uppercase">
                            {post.language ? post.language.toUpperCase() : 'TR'}
                          </span>
                        </td>
                        <td className="p-4 text-[11px] font-medium text-brand-navy/60 whitespace-nowrap">
                          {findTeamMember(post.authorId, teamMembers)?.name || post.authorId || 'Anonymous'}
                        </td>
                        <td className="p-4 font-mono text-[10px] text-brand-navy/50 whitespace-nowrap">
                          {formatDateDMY(post.date)}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-brand-navy/70">
                            <Eye className="w-3.5 h-3.5 text-brand-navy/30" strokeWidth={2.5} />
                            <span>{post.views || 0}</span>
                          </div>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          {isDraft ? (
                            <span className="text-[8.5px] uppercase tracking-widest font-black text-orange-600 bg-orange-100/50 px-2 py-1 rounded-sm border border-orange-200/50 flex items-center gap-1.5 w-max">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                              TASLAK (DRAFT)
                            </span>
                          ) : isSystemMock ? (
                            <span className="text-[9px] uppercase tracking-widest font-black text-brand-navy/30 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-navy/30" />
                              System Built-in
                            </span>
                          ) : (
                            <span className="text-[9.5px] uppercase tracking-widest font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded-sm border border-emerald-200/50 flex items-center gap-1.5 w-max">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Yayınlandı
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right pr-6 whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/blog/${getPostSlug(post)}`}
                              target="_blank"
                              className="p-2 text-brand-navy/40 hover:text-brand-navy transition-colors bg-brand-navy/5 hover:bg-brand-navy/10 rounded-sm inline-block"
                              title="Live Preview"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => {
                                setSelectedSharePost(post);
                                setCopiedField(null);
                              }}
                              className="p-2 text-brand-navy/40 hover:text-brand-gold transition-colors bg-brand-gold/5 hover:bg-brand-gold/10 rounded-sm cursor-pointer"
                              title="Prepare Social Distribution Share"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingBlogPost(post);
                                setIsBlogFormOpen(true);
                              }}
                              className="p-2 text-brand-navy/40 hover:text-brand-gold transition-colors bg-brand-navy/5 hover:bg-brand-navy/10 rounded-sm cursor-pointer"
                              title="Edit in CMS"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteBlogPost(post.id)}
                              disabled={isSystemMock}
                              className={`p-2 rounded-sm transition-colors ${
                                isSystemMock 
                                  ? 'text-brand-navy/10 cursor-not-allowed bg-transparent' 
                                  : 'text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 cursor-pointer'
                              }`}
                              title={isSystemMock ? "System articles cannot be deleted" : "Delete from database"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* URL Slug Management Section */}
        <div className="bg-white border border-brand-navy/5 rounded-sm shadow-sm p-8 space-y-6">
          <div className="border-b border-brand-navy/5 pb-6">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-brand-gold" />
              <h3 className="text-xs uppercase tracking-[0.2em] font-black text-brand-navy">Blog URL Bağlantı & Slug Yönetim Paneli</h3>
            </div>
            <p className="text-[11px] text-brand-navy/50 leading-relaxed mt-1">
              Makalelerinizin web tarayıcısındaki adreslerini (URL slug) doğrudan buradan düzenleyebilirsiniz. Bu işlem SEO bütünlüğü ve kalıcı bağlantılar (canonical URLs) için son derece önemlidir.
            </p>
          </div>

          {slugSaveSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-sm flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{slugSaveSuccess}</span>
            </div>
          )}

          {slugSaveError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-sm flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{slugSaveError}</span>
            </div>
          )}

          <div className="border border-brand-navy/5 rounded-sm overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-brand-offwhite text-[9px] uppercase tracking-widest font-black text-brand-navy/60 border-b border-brand-navy/5">
                    <th className="p-4 pl-6">Makale Başlığı</th>
                    <th className="p-4">Dil</th>
                    <th className="p-4">Mevcut Bağlantı (Slug)</th>
                    <th className="p-4">Yeni URL Slug Girişi</th>
                    <th className="p-4 pr-6 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-navy/5 text-xs">
                  {firestoreBlog.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-xs text-brand-navy/40 italic bg-white">
                        Sistemde kayıtlı blog yazısı bulunamadı. Yeni bir makale oluşturun.
                      </td>
                    </tr>
                  ) : (
                    firestoreBlog.map((post) => {
                      const postId = post.id;
                      const title = getPostTitle(post);
                      const currentSlug = post.slug || getPostSlug(post);
                      const isEditing = editingSlugs[postId] !== undefined;
                      const editedValue = isEditing ? editingSlugs[postId] : currentSlug;

                      return (
                        <tr key={postId} className="hover:bg-brand-offwhite/50 transition-colors">
                          <td className="p-4 pl-6 font-bold text-brand-navy max-w-[200px] truncate">
                            {title}
                          </td>
                          <td className="p-4">
                            <span className="inline-block text-[8px] uppercase tracking-wider bg-brand-navy/5 px-2 py-0.5 rounded text-brand-navy/60 font-bold border border-brand-navy/10">
                              {(post.language || 'tr').toUpperCase()}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-[10px] text-brand-navy/60">
                            <span className="bg-brand-navy/[0.02] px-2 py-1 rounded border border-brand-navy/5">
                              /{currentSlug}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <input
                                type="text"
                                value={editedValue}
                                onChange={(e) => {
                                  const val = e.target.value.toLowerCase().replace(/\s+/g, '-');
                                  setEditingSlugs(prev => ({ ...prev, [postId]: val }));
                                }}
                                className="w-full max-w-[280px] bg-white border border-brand-navy/10 px-3 py-1.5 font-mono text-[11px] text-brand-navy focus:border-brand-gold outline-none transition-all"
                                placeholder="yeni-url-slug"
                              />
                              {isEditing && editedValue !== currentSlug && (
                                <p className="text-[9px] text-brand-gold font-bold">
                                  Yeni adres: <span className="font-mono">/blog/{editedValue}</span>
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {isEditing && editedValue !== currentSlug ? (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingSlugs(prev => {
                                        const next = { ...prev };
                                        delete next[postId];
                                        return next;
                                      });
                                    }}
                                    className="px-3 py-1.5 text-[9px] uppercase tracking-widest font-black text-brand-navy/50 hover:text-brand-navy hover:bg-brand-navy/5 transition-colors"
                                  >
                                    Vazgeç
                                  </button>
                                  <button
                                    onClick={() => handleUpdateSlug(postId, editedValue)}
                                    disabled={isUpdatingSlug === postId}
                                    className="bg-brand-navy hover:bg-brand-gold text-white hover:text-brand-navy px-4 py-1.5 text-[9px] uppercase tracking-widest font-black transition-colors"
                                  >
                                    {isUpdatingSlug === postId ? 'Güncelleniyor...' : 'Güncelle'}
                                  </button>
                                </>
                              ) : (
                                <span className="text-[9px] text-brand-navy/30 italic">Değişiklik yok</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Share Generator Modal Popup */}
        <AnimatePresence>
          {selectedSharePost && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div 
                className="absolute inset-0 bg-brand-navy/70 backdrop-blur-sm"
                onClick={() => setSelectedSharePost(null)}
              />
              <div className="relative w-full max-w-2xl bg-brand-offwhite rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-brand-gold/20 z-10 text-left">
                {/* Header */}
                <div className="p-5 bg-white border-b border-theme-border flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-brand-gold/10 rounded-sm text-brand-gold">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm uppercase tracking-widest font-black text-brand-navy">
                        Instant Social Copywriter Hub
                      </h3>
                      <p className="text-[10px] text-brand-navy/40 font-light mt-0.5">Quickly distribute legal publications to public feeds</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedSharePost(null)}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                  >
                    <CloseIcon className="w-5 h-5 text-brand-navy" />
                  </button>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto space-y-6 bg-brand-offwhite">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest font-black text-brand-gold">Target Article</span>
                    <h4 className="font-serif text-brand-navy text-md mt-1 font-bold">
                      {getPostTitle(selectedSharePost)}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* LinkedIn Card */}
                    <div className="bg-white p-5 border border-brand-navy/5 rounded-sm space-y-3 shadow-inner">
                      <div className="flex justify-between items-center border-b border-brand-navy/5 pb-2">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[#0077B5] flex items-center gap-1">
                          LinkedIn Professional Draft
                        </span>
                        <button
                          onClick={() => {
                            const title = getPostTitle(selectedSharePost);
                            const excerpt = getPostExcerpt(selectedSharePost);
                            const text = `💼 Hukuki Gelişmeler & Sektörel Analizler\n\nSizler için derlediğimiz güncel makalemiz yayınlandı: "${title}"\n\n"${excerpt}"\n\nResen Hukuk & Danışmanlık uzman kadrosu tarafından hazırlanan bu analizin detaylarını okumak için web sitemizi ziyaret edebilirsiniz.\n\n🔗 Okumak için tıklayın: https://resenlegal.com/blog/${getPostSlug(selectedSharePost)}\n\n#resenlegal #hukuk #danismanlik #kurumsal #${selectedSharePost.category?.replace(/\s+/g, '')}`;
                            navigator.clipboard.writeText(text);
                            setCopiedField('linkedin');
                          }}
                          className="px-3 py-1 bg-brand-navy/5 hover:bg-brand-gold hover:text-white transition-all text-[9.5px] font-black tracking-widest uppercase rounded-sm cursor-pointer"
                        >
                          {copiedField === 'linkedin' ? 'Copied ✅' : 'Copy Post'}
                        </button>
                      </div>
                      <pre className="text-xs bg-brand-navy/[0.01] p-3 rounded-sm text-brand-navy/85 font-sans whitespace-pre-wrap leading-relaxed select-all">
                        {`💼 Hukuki Gelişmeler & Sektörel Analizler\n\nSizler için derlediğimiz güncel makalemiz yayınlandı: "${getPostTitle(selectedSharePost)}"\n\n"${getPostExcerpt(selectedSharePost)}"\n\nResen Hukuk & Danışmanlık uzman kadrosu tarafından hazırlanan bu analizin detaylarını okumak için web sitemizi ziyaret edebilirsiniz.\n\n🔗 Okumak için tıklayın: https://resenlegal.com/blog/${getPostSlug(selectedSharePost)}\n\n#resenlegal #hukuk #danismanlik #kurumsal #${selectedSharePost.category?.replace(/\s+/g, '')}`}
                      </pre>
                    </div>

                    {/* X Twitter Card */}
                    <div className="bg-white p-5 border border-brand-navy/5 rounded-sm space-y-3 shadow-inner">
                      <div className="flex justify-between items-center border-b border-brand-navy/5 pb-2">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-black text-black flex items-center gap-1">
                          X (Twitter) Short Feed Draft
                        </span>
                        <button
                          onClick={() => {
                            const title = getPostTitle(selectedSharePost);
                            const excerpt = getPostExcerpt(selectedSharePost);
                            const text = `⚖️ Yeni Makale: "${title}"\n\n${excerpt.substring(0, 110)}...\n\nOkumak için tıklayın:\n🔗 https://resenlegal.com/blog/${getPostSlug(selectedSharePost)}\n\n#resenlegal #hukuk #${selectedSharePost.category?.replace(/\s+/g, '')}`;
                            navigator.clipboard.writeText(text);
                            setCopiedField('twitter');
                          }}
                          className="px-3 py-1 bg-brand-navy/5 hover:bg-brand-gold hover:text-white transition-all text-[9.5px] font-black tracking-widest uppercase rounded-sm cursor-pointer"
                        >
                          {copiedField === 'twitter' ? 'Copied ✅' : 'Copy Post'}
                        </button>
                      </div>
                      <pre className="text-xs bg-brand-navy/[0.01] p-3 rounded-sm text-brand-navy/85 font-sans whitespace-pre-wrap leading-relaxed select-all">
                        {`⚖️ Yeni Makale: "${getPostTitle(selectedSharePost)}"\n\n${getPostExcerpt(selectedSharePost).substring(0, 110)}...\n\nOkumak için tıklayın:\n🔗 https://resenlegal.com/blog/${getPostSlug(selectedSharePost)}\n\n#resenlegal #hukuk #${selectedSharePost.category?.replace(/\s+/g, '')}`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Footer close */}
                <div className="p-4 bg-white border-t border-theme-border flex justify-end">
                  <button
                    onClick={() => setSelectedSharePost(null)}
                    className="px-6 py-2 bg-brand-navy text-white text-xs uppercase tracking-widest font-black hover:bg-brand-gold transition-all cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderOverview = () => (

    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-8 border border-brand-navy/5 rounded-sm shadow-sm relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/5 -mr-8 -mt-8 rounded-full transition-transform group-hover:scale-110" />
          <div className="flex items-center justify-between mb-4 relative">
            <MessageSquare className="w-6 h-6 text-brand-gold" />
            <span className={cn(
              "text-[9px] uppercase tracking-widest font-black px-2 py-1",
              inquiriesError ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50"
            )}>
              {inquiriesError ? "Sync Error" : "Online"}
            </span>
          </div>
          <div className="text-3xl font-serif text-brand-navy group-hover:text-brand-gold transition-colors">
            {inquiriesLoading ? '...' : inquiries.length}
          </div>
          <div className="text-[10px] uppercase tracking-widest font-bold text-brand-navy/40 mt-1">Inquiries</div>
        </div>
        <div className="bg-white p-8 border border-brand-navy/5 rounded-sm shadow-sm relative group overflow-hidden">
          <div className="flex items-center justify-between mb-4 relative">
            <FileText className="w-6 h-6 text-brand-gold" />
          </div>
          <div className="text-3xl font-serif text-brand-navy group-hover:text-brand-gold transition-colors">{firestoreBlog.length + MOCK_BLOG.length}</div>
          <div className="text-[10px] uppercase tracking-widest font-bold text-brand-navy/40 mt-1">Blog Articles</div>
        </div>
        <div className="bg-white p-8 border border-brand-navy/5 rounded-sm shadow-sm relative group overflow-hidden">
          <div className="flex items-center justify-between mb-4 relative">
            <Users className="w-6 h-6 text-brand-gold" />
          </div>
          <div className="text-3xl font-serif text-brand-navy group-hover:text-brand-gold transition-colors">{firestoreTeam.length + MOCK_TEAM.length}</div>
          <div className="text-[10px] uppercase tracking-widest font-bold text-brand-navy/40 mt-1">Team Roster</div>
        </div>
        <div className="bg-white p-8 border border-brand-navy/5 rounded-sm shadow-sm relative group overflow-hidden cursor-pointer" onClick={() => setActiveTab('blog')}>
          <div className="flex items-center justify-between mb-4 relative">
            <Eye className="w-6 h-6 text-brand-gold" />
          </div>
          <div className="text-3xl font-serif text-brand-navy group-hover:text-brand-gold transition-colors">{totalViews}</div>
          <div className="text-[10px] uppercase tracking-widest font-bold text-brand-navy/40 mt-1">Total Article Views</div>
        </div>
        <div className="bg-brand-gold p-8 border border-brand-gold/5 rounded-sm shadow-xl relative group overflow-hidden cursor-pointer" onClick={() => setActiveTab('ai')}>
          <div className="flex items-center justify-between mb-4 relative">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl font-serif text-white">AI Hub</div>
          <div className="text-[10px] uppercase tracking-widest font-bold text-white/60 mt-1">Assistant Active</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-brand-navy/5 rounded-sm shadow-sm overflow-hidden">
          <div className="p-6 border-b border-brand-navy/5 flex items-center justify-between">
            <h3 className="text-sm uppercase tracking-[0.2em] font-black text-brand-navy">Recent Interaction Stream</h3>
            <button onClick={() => setActiveTab('messages')} className="text-[10px] uppercase tracking-widest font-black text-brand-gold hover:underline">View CRM</button>
          </div>
          <div className="divide-y divide-brand-navy/5">
            {inquiries.slice(0, 5).map((msg: any) => (
              <div key={msg.id} className="p-6 flex items-center justify-between hover:bg-brand-offwhite transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-offwhite flex items-center justify-center text-brand-navy text-[10px] font-bold">
                    {msg.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-brand-navy">{msg.name}</div>
                    <div className="text-[10px] text-brand-navy/60 uppercase tracking-widest font-bold">{msg.department} • <span className="opacity-40">{msg.createdAt?.toDate().toLocaleDateString()}</span></div>
                  </div>
                </div>
                <button onClick={() => setActiveTab('messages')} className="p-2 text-brand-navy/20 hover:text-brand-gold transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            ))}
            {inquiries.length === 0 && (
              <div className="p-12 text-center text-brand-navy/40 text-xs font-light italic">
                Awaiting new client interactions...
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-brand-navy p-8 rounded-sm shadow-xl text-white">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-black mb-6 opacity-40">Quick Management</h4>
            <div className="space-y-4">
              <Link to="/blog?admin=true" className="flex items-center justify-between p-4 bg-white/5 hover:bg-brand-gold transition-all rounded-sm group">
                <span className="text-[10px] uppercase tracking-widest font-black">Publish Article</span>
                <Plus className="w-4 h-4 text-brand-gold group-hover:text-white" />
              </Link>
              <button 
                onClick={() => setActiveTab('settings')}
                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-brand-gold transition-all rounded-sm group"
              >
                <span className="text-[10px] uppercase tracking-widest font-black">Update SEO</span>
                <Globe className="w-4 h-4 text-brand-gold group-hover:text-white" />
              </button>
              <button 
                onClick={() => setActiveTab('ai')}
                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-brand-gold transition-all rounded-sm group"
              >
                <span className="text-[10px] uppercase tracking-widest font-black">Legal AI Tools</span>
                <Sparkles className="w-4 h-4 text-brand-gold group-hover:text-white" />
              </button>
            </div>
          </div>

          <div className="bg-white p-8 border border-brand-navy/5 rounded-sm shadow-sm">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-black mb-4 text-brand-navy/40">Portal Status</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-brand-navy">Core System</span>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-brand-navy">Gemini AI Engine</span>
                <span className="w-2 h-2 rounded-full bg-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-brand-navy">Firestore Sync</span>
                <span className="w-2 h-2 rounded-full bg-green-500" />
              </div>
            </div>
          </div>

          {topArticles.length > 0 && (
            <div className="bg-white p-8 border border-brand-navy/5 rounded-sm shadow-sm">
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-black mb-4 text-brand-navy/40">Top Performing Insights</h4>
              <div className="space-y-4">
                {topArticles.map(post => (
                  <div key={post.id} className="flex items-center justify-between gap-3 group/item">
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold text-brand-navy truncate group-hover/item:text-brand-gold transition-colors">
                        {getTranslation(post.title, i18n.language, post.language)}
                      </div>
                      <span className="text-[9px] uppercase tracking-wider font-bold text-brand-navy/40">
                        {getCategoryTranslation(post.category, i18n.language, firestoreServices)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-brand-navy/70 whitespace-nowrap">
                      <Eye className="w-3.5 h-3.5 text-brand-navy/30" strokeWidth={2.5} />
                      <span>{post.views || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderMessages = () => (
    <div className="bg-white border border-brand-navy/5 rounded-sm shadow-sm overflow-hidden">
      <div className="p-8 border-b border-brand-navy/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-sm uppercase tracking-[0.3em] font-black text-brand-navy">Client Inquiries</h3>
          <div className="text-[10px] uppercase tracking-widest font-bold text-brand-navy/40">
            {inquiries.length} Messages Found
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        {inquiriesLoading ? (
          <div className="p-24 text-center">
            <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs uppercase tracking-widest font-bold text-brand-navy/40">Synchronizing Inquiries...</p>
          </div>
        ) : inquiriesError ? (
          <div className="p-24 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
            <p className="text-sm text-red-600 font-bold mb-2">Sync Permission Error</p>
            <p className="text-[10px] text-brand-navy/40 uppercase tracking-widest max-w-xs mx-auto">
              The system encountered a permission restriction. Please verify your administrative credentials or check firestore rules.
            </p>
            <div className="mt-4 p-4 bg-red-50 text-[9px] font-mono text-red-500 rounded-sm">
              {inquiriesError}
            </div>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-offwhite border-b border-brand-navy/5">
                <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-bold text-brand-navy/60">Sender</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-bold text-brand-navy/60">Subject</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-bold text-brand-navy/60">Date</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-bold text-brand-navy/60 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-navy/5">
              {inquiries.map((msg: any) => (
                <tr key={msg.id} className="hover:bg-brand-offwhite transition-colors group">
                  <td className="px-8 py-6">
                    <div className="text-sm font-bold text-brand-navy">{msg.name}</div>
                    <div className="text-[10px] text-brand-navy/60 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {msg.email}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-[10px] uppercase tracking-widest font-bold text-brand-gold mb-1">{msg.department || 'General'}</div>
                    <p className="text-xs text-brand-navy/60 line-clamp-1 max-w-md italic">"{msg.message}"</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-brand-navy/60 text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleString() : 'Recent submission...'}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => summarizeInquiry(msg.message)}
                        disabled={isSubmitting}
                        className="p-2 text-brand-gold hover:bg-brand-gold/10 rounded-sm transition-all"
                        title="AI Summarize"
                      >
                        <Sparkles className={`w-4 h-4 ${isSubmitting ? 'animate-pulse' : ''}`} />
                      </button>
                      <button 
                        onClick={() => alert(`Full Message from ${msg.name}:\n\n${msg.message}`)}
                        className="p-2 text-brand-navy/40 hover:text-brand-gold transition-colors"
                        title="Read Message"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteInquiry(msg.id)}
                        className="p-2 text-brand-navy/40 hover:text-red-600 transition-colors"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!inquiriesLoading && !inquiriesError && inquiries.length === 0 && (
          <div className="p-24 text-center">
            <div className="w-16 h-16 bg-brand-offwhite rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-brand-navy/20" />
            </div>
            <p className="text-sm text-brand-navy/40 italic font-light">Inbox is currently empty.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTeam = () => {
    const handleSaveMember = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      const formData = new FormData(e.target as HTMLFormElement);
      const memberData = {
        name: formData.get('name'),
        role: { en: formData.get('role_en'), tr: formData.get('role_tr') },
        bio: { en: formData.get('bio_en'), tr: formData.get('bio_tr') },
        image: formData.get('image'),
        email: formData.get('email'),
        social: {
          linkedin: formData.get('linkedin'),
          twitter: formData.get('twitter')
        },
        order: Number(formData.get('order')) || 0
      };

      try {
        if (editingMember?.id) {
          await setDoc(doc(db, 'team', editingMember.id), memberData, { merge: true });
          await logActivity('UPDATE', 'team', editingMember.id);
        } else {
          const docRef = await addDoc(collection(db, 'team'), memberData);
          await logActivity('CREATE', 'team', docRef.id);
        }
        setEditingMember(null);
        setIsAddingMember(false);
      } catch (err) {
        console.error("Save team failed:", err);
      } finally {
        setIsSubmitting(false);
      }
    };

    const deleteMember = async (id: string) => {
      if (!window.confirm("Remove this team member?")) return;
      try {
        await deleteDoc(doc(db, 'team', id));
        await logActivity('DELETE', 'team', id);
      } catch (err) {
        console.error("Delete team failed:", err);
      }
    };

    if (isAddingMember || editingMember) {
      const initial = editingMember || { 
        name: '', 
        role: { en: '', tr: '' }, 
        bio: { en: '', tr: '' }, 
        image: '', 
        email: '',
        social: { linkedin: '', twitter: '' },
        order: firestoreTeam.length
      };

      return (
        <div className="max-w-4xl bg-white border border-brand-navy/5 rounded-sm shadow-xl p-12">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-sm uppercase tracking-[0.3em] font-black text-brand-navy">
              {editingMember ? 'Modify Partner Profile' : 'Register New Partner'}
            </h3>
            <button onClick={() => {setEditingMember(null); setIsAddingMember(false);}} className="text-[10px] uppercase tracking-widest font-bold text-brand-navy/40 hover:text-brand-navy flex items-center gap-2">
              <ArrowLeft className="w-3 h-3" /> Cancel
            </button>
          </div>
          
          <form onSubmit={handleSaveMember} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-navy/40">Full Name</label>
                <input name="name" defaultValue={initial.name} required className="w-full bg-brand-offwhite border-none p-4 text-xs font-bold text-brand-navy" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-navy/40">Role (EN)</label>
                  <input name="role_en" defaultValue={initial.role?.en} required className="w-full bg-brand-offwhite border-none p-4 text-xs font-bold text-brand-navy" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-navy/40">Role (TR)</label>
                  <input name="role_tr" defaultValue={initial.role?.tr} required className="w-full bg-brand-offwhite border-none p-4 text-xs font-bold text-brand-navy" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-navy/40">Image URL</label>
                <input name="image" defaultValue={initial.image} required className="w-full bg-brand-offwhite border-none p-4 text-xs font-bold text-brand-navy" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-navy/40">Corporate Email</label>
                <input name="email" type="email" placeholder="example@resenlegal.com" defaultValue={initial.email} className="w-full bg-brand-offwhite border-none p-4 text-xs font-bold text-brand-navy" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-navy/40">LinkedIn Profile</label>
                  <input name="linkedin" defaultValue={initial.social?.linkedin} className="w-full bg-brand-offwhite border-none p-4 text-xs font-bold text-brand-navy" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-navy/40">Display Order</label>
                  <input name="order" type="number" defaultValue={initial.order} className="w-full bg-brand-offwhite border-none p-4 text-xs font-bold text-brand-navy" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-navy/40">Short Bio (EN)</label>
                <textarea name="bio_en" defaultValue={initial.bio?.en} rows={6} className="w-full bg-brand-offwhite border-none p-4 text-xs font-bold text-brand-navy resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-navy/40">Short Bio (TR)</label>
                <textarea name="bio_tr" defaultValue={initial.bio?.tr} rows={6} className="w-full bg-brand-offwhite border-none p-4 text-xs font-bold text-brand-navy resize-none" />
              </div>
            </div>

            <div className="md:col-span-2 pt-8">
              <button disabled={isSubmitting} type="submit" className="bg-brand-navy text-white px-10 py-5 text-[10px] uppercase tracking-[0.2em] font-black flex items-center gap-3 hover:bg-brand-gold transition-all shadow-xl">
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Processing...' : 'Deploy Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-sm uppercase tracking-[0.3em] font-black text-brand-navy">Active Council</h3>
          <button onClick={() => setIsAddingMember(true)} className="bg-brand-gold text-white px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-brand-navy transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Recruit Associate
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {firestoreTeam.map((member: any) => (
            <div key={member.id} className="bg-white border border-brand-navy/5 rounded-sm p-6 group shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 rounded-sm overflow-hidden shrink-0 border-2 border-brand-navy/5">
                  <img src={member.image || null} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-sm font-bold text-brand-navy">{member.name}</div>
                  <div className="text-[10px] uppercase tracking-widest text-brand-gold font-bold mt-1">
                    {member.role?.en}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-4 border-t border-brand-navy/5">
                <button onClick={() => setEditingMember(member)} className="flex-grow py-2 text-[10px] uppercase tracking-widest font-bold text-brand-navy/40 hover:text-white hover:bg-brand-navy transition-all border border-brand-navy/10 rounded-sm">
                  Edit
                </button>
                <button onClick={() => deleteMember(member.id)} className="px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-red-400 hover:text-white hover:bg-red-600 transition-all border border-red-600/10 rounded-sm">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}

          {/* Initial Members - Now Editable */}
          {MOCK_TEAM.filter(mt => !firestoreTeam.find((ft:any) => ft.id === mt.id || ft.name.toLowerCase() === mt.name.toLowerCase())).map((member: any) => (
            <div key={member.id} className="bg-white/50 border border-dashed border-brand-navy/10 rounded-sm p-6 group opacity-80 hover:opacity-100 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-sm overflow-hidden shrink-0 grayscale opacity-50">
                  <img src={member.image || null} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-xs font-bold text-brand-navy/50">{member.name}</div>
                  <div className="text-[9px] uppercase tracking-widest text-brand-gold/50 font-bold">
                    {member.role?.en || member.role}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-4 border-t border-brand-navy/10">
                <button 
                  onClick={() => setEditingMember(member)} // Keep ID to update/override existing mock member securely in Firestore
                  className="flex-grow py-2 text-[9px] uppercase tracking-widest font-black text-brand-navy/30 hover:text-brand-navy hover:border-brand-navy transition-all border border-transparent rounded-sm"
                >
                  Edit Initial Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-navy flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-brand-navy flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-brand-offwhite p-12 rounded-sm shadow-2xl space-y-8"
        >
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-brand-navy flex items-center justify-center rounded-sm mx-auto">
              <Shield className="w-8 h-8 text-brand-gold" />
            </div>
            <h1 className="text-2xl font-serif text-brand-navy">Management Portal</h1>
            <p className="text-xs uppercase tracking-widest font-bold opacity-60 text-brand-navy">
              Authorized Personnel Only
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 text-[10px] uppercase tracking-widest font-bold text-center flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={isSubmitting}
            className="w-full py-4 bg-brand-navy text-white text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-3 hover:bg-brand-gold transition-all disabled:opacity-50 shadow-lg"
          >
            <LogIn className="w-4 h-4" />
            {isSubmitting ? 'Authenticating...' : 'Secure Login'}
          </button>

          <Link 
            to="/" 
            className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold text-brand-navy/60 hover:text-brand-navy transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Return to Public Site
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-offwhite flex flex-col md:flex-row font-sans selection:bg-brand-gold/20">
      {/* Sidebar - Enhanced & Dynamic */}
      <aside className="w-full md:w-72 bg-brand-navy text-white md:min-h-screen flex flex-col border-r border-white/5 z-20">
        <div 
          onClick={() => setActiveTab('overview')}
          className="p-8 pb-4 flex items-center gap-4 cursor-pointer group transition-all"
        >
          <div className="w-10 h-10 bg-brand-gold flex items-center justify-center rounded-sm group-hover:scale-105 transition-transform">
            <Shield className="w-6 h-6 text-brand-navy" />
          </div>
          <div>
            <div className="text-lg font-serif tracking-tight text-white group-hover:text-brand-gold transition-colors">Resen Gate</div>
            <div className="text-[9px] uppercase tracking-widest font-black opacity-30">Management Node</div>
          </div>
        </div>

        <nav className="flex-grow p-4 space-y-1.5 mt-8">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'messages', icon: MessageSquare, label: 'Inquiries', badge: inquiries.length },
            { id: 'blog', icon: FileText, label: 'Blog Articles' },
            { id: 'seo', icon: ShieldCheck, label: 'SEO Health' },
            { id: 'ai', icon: Sparkles, label: 'Legal AI Hub' },
            { id: 'team', icon: Users, label: 'Team Profile' },
            { id: 'services', icon: Briefcase, label: 'Service Catalog' },
            { id: 'logs', icon: Activity, label: 'Audit Logs' },
            { id: 'settings', icon: SettingsIcon, label: 'System Settings' },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={cn(
                "w-full flex items-center gap-4 px-6 py-3.5 rounded-sm text-[11px] uppercase tracking-[0.15em] font-black transition-all group relative",
                activeTab === item.id 
                  ? "bg-brand-gold text-white shadow-xl shadow-brand-gold/10" 
                  : "text-white/40 hover:text-white hover:bg-white/[0.03]"
              )}
            >
              {activeTab === item.id && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-white rounded-r-full" 
                />
              )}
              <item.icon className={cn(
                "w-4 h-4 transition-all",
                activeTab === item.id ? "text-white scale-110" : "text-brand-gold group-hover:scale-110"
              )} />
              {item.label}
              {item.badge ? (
                <span className={cn(
                  "ml-auto px-1.5 py-0.5 rounded-sm text-[8px] font-black",
                  activeTab === item.id ? "bg-white/20" : "bg-brand-gold/10 text-brand-gold"
                )}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="p-8 pt-4 border-t border-white/5 space-y-6">
          <div className="flex flex-col gap-3">
            <Link to="/" className="flex items-center gap-3 text-[9px] text-white/30 hover:text-brand-gold transition-colors uppercase tracking-[0.2em] font-black">
              <ExternalLink className="w-3 h-3" />
              Public Environment
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-3 text-[9px] text-red-400/60 hover:text-red-400 transition-colors uppercase tracking-[0.2em] font-black">
              <LogOut className="w-3 h-3" />
              Terminate Session
            </button>
          </div>
          
          <div className="p-4 bg-white/5 rounded-sm border border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-3 h-3 text-brand-gold" />
              <span className="text-[9px] uppercase tracking-widest font-black text-white/40">Secure Status</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[8px] uppercase tracking-widest font-bold text-white/60">Live Synchronized</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-h-screen relative z-10 overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-brand-navy/5 p-8 md:px-16 flex flex-col md:flex-row md:items-center justify-between gap-6 sticky top-0 z-30">
          <div>
            <h2 className="text-3xl font-serif text-brand-navy capitalize tracking-tight flex items-center gap-4">
              {activeTab}
              {activeTab === 'ai' && <Sparkles className="w-6 h-6 text-brand-gold" />}
            </h2>
            <div className="flex items-center gap-3 mt-1.5 ">
              <div className="h-[1px] w-8 bg-brand-gold/30" />
              <p className="text-brand-navy/30 text-[9px] uppercase tracking-[0.3em] font-black">Firm Governance Portal</p>
            </div>
          </div>
          
            <div className="flex items-center gap-6">
              {user && !user.emailVerified && (
                <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-sm">
                  <AlertCircle className="w-3 h-3" />
                  <span className="text-[8px] uppercase tracking-widest font-black">Email Not Verified (Sync restricted)</span>
                </div>
              )}
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-widest font-black text-brand-navy">{user.displayName}</div>
                <div className="text-[9px] text-brand-navy/40 font-bold uppercase tracking-widest mt-1">
                  {isAdmin ? 'Senior Admin' : 'Unauthorized User'}
                </div>
              </div>
            <div className="w-12 h-12 rounded-sm border border-brand-navy/10 overflow-hidden shadow-inner p-1 bg-white">
               {user.photoURL ? (
                 <img src={user.photoURL} alt="Admin" className="w-full h-full object-cover rounded-sm" />
               ) : (
                 <div className="w-full h-full bg-brand-navy flex items-center justify-center text-brand-gold text-xs font-black rounded-sm">
                   {user.email?.charAt(0).toUpperCase()}
                 </div>
               )}
            </div>
          </div>
        </header>

        <div className="p-8 md:p-16 flex-grow overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full"
            >
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'messages' && renderMessages()}
              {activeTab === 'ai' && (
                <div className="h-full">
                   <AIAssistant isSubmitting={isSubmitting} logActivity={logActivity} />
                </div>
              )}
              {activeTab === 'team' && renderTeam()}
              {activeTab === 'services' && renderServices()}
              {activeTab === 'logs' && renderLogs()}
              {activeTab === 'settings' && renderSettings()}
              {activeTab === 'blog' && renderBlogDashboard()}
              {activeTab === 'seo' && renderSEOHealth()}
            </motion.div>
          </AnimatePresence>
        </div>
        <BlogForm 
          isOpen={isBlogFormOpen} 
          onClose={() => { 
            setIsBlogFormOpen(false); 
            setEditingBlogPost(null); 
          }} 
          initialData={editingBlogPost} 
        />
      </main>
    </div>
  );
}
