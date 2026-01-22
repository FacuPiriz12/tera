import React from 'react';
import { ArrowLeft, Mail, ExternalLink, Clock } from 'lucide-react';
import { Link, useLocation } from "wouter";
import logoUrl from "@/assets/logo.png";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import "@/auth-animations.css";

export default function SignupSuccess() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-12">
        <Link href="/">
          <img src={logoUrl} alt="Logo" className="h-24 w-auto cursor-pointer" />
        </Link>
      </div>

      <div className="w-full max-w-lg bg-white rounded-[2.5rem] p-10 lg:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-blue-400 blur-3xl opacity-20 rounded-full animate-pulse"></div>
          <div className="relative w-32 h-32 bg-gradient-to-br from-blue-50 to-white rounded-full flex items-center justify-center shadow-2xl border border-blue-50 overflow-hidden mx-auto">
             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-50/30 to-white opacity-50"></div>
             <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg flex items-center justify-center transform -rotate-6">
                <Mail className="w-10 h-10 text-white" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full border-4 border-white flex items-center justify-center shadow-sm animate-spin-slow">
                  <Clock className="w-4 h-4 text-white" />
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            {t('common.signupSuccess.title')}
          </h1>
          <p className="text-gray-500 font-medium">
            {t('common.signupSuccess.subtitle')} <br />
            {t('common.signupSuccess.checkEmailDescription')}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 text-left space-y-4 border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.04)] mx-auto w-full">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
            {t('common.signupSuccess.nextStepsTitle')}
          </h3>
          <div className="flex items-start space-x-4">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">1</span>
            <p className="text-gray-700 font-medium">
              {t('common.signupSuccess.step1')}
            </p>
          </div>
          <div className="flex items-start space-x-4">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">2</span>
            <p className="text-gray-700 font-medium">
              {t('common.signupSuccess.step2')}
            </p>
          </div>
          <div className="flex items-start space-x-4">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">3</span>
            <p className="text-gray-700 font-medium">
              {t('common.signupSuccess.step3')}
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <Button 
            onClick={() => setLocation('/login')}
            className="w-full bg-blue-600 text-white py-8 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            {t('common.signupSuccess.continueToLogin')}
          </Button>

          <Button 
            onClick={() => setLocation('/')}
            variant="ghost"
            className="w-full text-gray-500 font-bold hover:bg-transparent hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.signupSuccess.backToHome')}
          </Button>
        </div>
      </div>
    </div>
  );
}
