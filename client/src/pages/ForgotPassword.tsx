import React, { useState } from 'react';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { useLocation } from "wouter";
import { Link } from "@/components/ui/Link";
import logoUrl from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

import { apiRequest } from "@/lib/queryClient";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await apiRequest("POST", "/api/auth/forgot-password", { email });
      
      toast({
        title: t('common.forgotPassword.successTitle'),
        description: t('common.forgotPassword.successDesc'),
      });
      
      // En un flujo real, aquí el usuario iría a revisar su correo.
      // Pero para la demo, lo llevamos al login después de un momento.
      setTimeout(() => setLocation("/login"), 3000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center justify-center mb-12 cursor-pointer group">
            <img src={logoUrl} alt="TERA Logo" className="h-20 w-auto group-hover:scale-105 transition-transform duration-300" />
          </div>
        </Link>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('common.forgotPassword.title')}
            </h1>
            <p className="text-gray-600">
              {t('common.forgotPassword.description')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email-forgot" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('common.forgotPassword.emailLabel')}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  id="email-forgot"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('common.forgotPassword.emailPlaceholder')}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white font-semibold py-6 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center group"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              )}
              {t('common.forgotPassword.submitButton')}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <Link href="/login">
              <button className="w-full flex items-center justify-center text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">
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
