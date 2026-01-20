import React from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import { useLocation } from "wouter";
import { Link } from "@/components/ui/Link";
import logoUrl from "@/assets/logo.png";
import { useTranslation } from "react-i18next";

export default function EmailSentPage() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const email = searchParams.get('email') || 'tu correo';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-full max-w-md">
        <Link href="/">
          <div className="flex items-center justify-center mb-12 cursor-pointer group">
            <img src={logoUrl} alt="TERA Logo" className="h-20 w-auto group-hover:scale-105 transition-transform duration-300" />
          </div>
        </Link>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Send className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('common.forgotPassword.successTitle')}
            </h1>
            <p className="text-gray-600 text-lg">
              {t('common.forgotPassword.successDesc', { email })}
            </p>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <Link href="/login">
              <button className="w-full flex items-center justify-center text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.forgotPassword.backToLogin')}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
