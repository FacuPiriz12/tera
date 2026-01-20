import React, { useState } from 'react';
import { ArrowRight, Mail, ShieldCheck, UserPlus } from 'lucide-react';
import { Link, useLocation } from "wouter";
import logoUrl from "@/assets/logo.png";
import { useTranslation } from "react-i18next";
import "@/auth-animations.css";

export default function EmailVerification() {
  const { t } = useTranslation('common');
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleVerify = () => {
    setIsLoading(true);
    
    // Try to get tokens from query string first (default Supabase behavior)
    const searchParams = new URLSearchParams(window.location.search);
    const tokenHash = searchParams.get('token_hash'); // Correct parameter for magic links
    const type = searchParams.get('type');
    
    // Also check hash for backward compatibility
    const hash = window.location.hash;
    const hashParams = new URLSearchParams(hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const hashType = hashParams.get('type');
    
    // Build confirmation URL with all available params
    if (tokenHash || accessToken) {
      // Preserve all params for confirmation page
      const confirmParams = new URLSearchParams();
      
      // Add query string params
      if (tokenHash) confirmParams.set('token_hash', tokenHash);
      if (type) confirmParams.set('type', type);
      
      // Add hash params if present
      if (accessToken) confirmParams.set('access_token', accessToken);
      if (refreshToken) confirmParams.set('refresh_token', refreshToken);
      if (hashType) confirmParams.set('type', hashType);
      
      window.location.href = '/auth/confirm?' + confirmParams.toString();
      return;
    }
    
    // Fallback: redirect to confirmation anyway (will handle errors there)
    window.location.href = '/auth/confirm' + window.location.search + hash;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
      <div className="mb-12">
        <Link href="/">
          <img src={logoUrl} alt="Logo" className="h-12 w-auto cursor-pointer" />
        </Link>
      </div>

      <div className="w-full max-w-lg bg-white rounded-[2.5rem] p-10 lg:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 text-center space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="relative inline-block mx-auto">
          <div className="absolute inset-0 bg-blue-400 blur-3xl opacity-20 rounded-full animate-pulse"></div>
          <div className="relative w-32 h-32 bg-gradient-to-br from-blue-50 to-white rounded-full flex items-center justify-center shadow-2xl border border-blue-50 overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-50/30 to-white opacity-50"></div>
             <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg flex items-center justify-center transform -rotate-6">
                <Mail className="w-10 h-10 text-white" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-400 rounded-full border-4 border-white flex items-center justify-center shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            {t('common.emailVerification.title')}
          </h1>
          <p className="text-gray-500 font-medium leading-relaxed">
            {t('common.emailVerification.description')}
          </p>
        </div>

        <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 text-center animate-in slide-in-from-bottom-2 duration-500">
          <p className="text-blue-800 font-semibold text-sm leading-relaxed">
            {t('common.emailVerification.info')}
          </p>
        </div>

        <div className="space-y-6">
          <button 
            onClick={handleVerify}
            disabled={isLoading}
            className="w-full bg-white border-2 border-gray-100 py-4 rounded-2xl font-bold text-blue-600 hover:border-blue-600 hover:bg-blue-50/30 transition-all flex items-center justify-center group shadow-sm hover:shadow-md disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('common.status.loading')}
              </span>
            ) : (
              <>
                {t('common.emailVerification.confirmButton')}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          <p className="text-[11px] text-gray-400 font-medium leading-tight px-4">
            {t('common.emailVerification.securityNote')}
          </p>
        </div>

        <div className="border-t border-gray-100 pt-8">
          <p className="text-gray-400 text-sm font-bold mb-4">{t('common.emailVerification.wrongEmail')}</p>
          <Link href="/signup">
            <button className="inline-flex items-center text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors group">
              <UserPlus className="w-4 h-4 mr-2" />
              {t('common.emailVerification.signupDifferent')}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
