import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { isAdminEmail } from '../constants/auth';
import LegalModal from './LegalModal';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const [modalContent, setModalContent] = useState<{ title: string; content: string } | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const handleLogout = () => signOut(auth);

  const isAdmin = isAdminEmail(user?.email);

  const dataProtectionContent = t('legal.dataProtection.content');
  const cookiePolicyContent = t('legal.cookiePolicy.content');
  const privacyPolicyContent = t('legal.privacyPolicy.content');

  return (
    <>
      <footer className="bg-bg-deep pt-8 pb-4 border-t border-theme-border transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Top Section: Logo */}
          <div className="flex justify-center md:justify-start mb-2">
            <Link 
              to="/" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2 group shrink-0"
            >
              <span className="text-xl font-serif font-bold tracking-tighter text-brand-navy">
                RESEN <span className="font-normal text-brand-gold">LEGAL</span>
              </span>
            </Link>
          </div>
          
          {/* Middle Section: Centered Tagline - Highly Compact */}
          <div className="py-6 flex justify-center items-center">
            <div className="text-[10px] md:text-xs uppercase tracking-[0.6em] font-bold text-gray-400 text-center leading-relaxed max-w-2xl px-4">
              {t('footer.tagline')}
            </div>
          </div>

          {/* Bottom Section: Legal and Copyright - Reduced spacing */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-6 border-t border-theme-border/10">
            <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-2">
              <button 
                onClick={() => setModalContent({ title: t('legal.dataProtection.title'), content: dataProtectionContent })}
                className="text-[9px] uppercase tracking-widest font-bold text-gray-400 hover:text-brand-gold transition-colors"
              >
                {t('legal.dataProtection.label')}
              </button>
              <button 
                onClick={() => setModalContent({ title: t('legal.cookiePolicy.title'), content: cookiePolicyContent })}
                className="text-[9px] uppercase tracking-widest font-bold text-gray-400 hover:text-brand-gold transition-colors"
              >
                {t('legal.cookiePolicy.label')}
              </button>
              <button 
                onClick={() => setModalContent({ title: t('legal.privacyPolicy.title'), content: privacyPolicyContent })}
                className="text-[9px] uppercase tracking-widest font-bold text-gray-400 hover:text-brand-gold transition-colors"
              >
                {t('legal.privacyPolicy.label')}
              </button>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="text-[9px] tracking-[0.2em] text-gray-400 opacity-60 uppercase font-medium">
                &copy; {new Date().getFullYear()} Resen Legal. {t('footer.rights')}
              </div>

               {/* subtle Logout if user is logged in */}
               {user && (
                 <div className="border-inline-start border-theme-border/20 ps-8 flex items-center gap-4">
                    {isAdmin && (
                      <span className="text-[9px] uppercase tracking-widest font-bold bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded-sm">
                        Admin
                      </span>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="text-[9px] uppercase tracking-widest font-bold text-gray-400 hover:text-brand-gold transition-colors flex items-center gap-1"
                      title="Logout"
                    >
                      <LogOut className="w-3 h-3" />
                    </button>
                  </div>
               )}
            </div>
          </div>
        </div>
      </footer>

      <LegalModal 
        isOpen={!!modalContent} 
        onClose={() => setModalContent(null)} 
        title={modalContent?.title || ''} 
        content={modalContent?.content || ''} 
      />
    </>
  );
};

export default Footer;
