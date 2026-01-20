import React, { useState } from 'react';
import { Lock, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useLocation } from "wouter";
import { Link } from "@/components/ui/Link";
import logoUrl from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const passwordRequirements = [
    { label: t('auth.resetPassword.req.lowercase', 'one lowercase character'), met: /[a-z]/.test(password) },
    { label: t('auth.resetPassword.req.special', 'one special character'), met: /[^A-Za-z0-9]/.test(password) },
    { label: t('auth.resetPassword.req.uppercase', 'one uppercase character'), met: /[A-Z]/.test(password) },
    { label: t('auth.resetPassword.req.minimum', '8 character minimum'), met: password.length >= 8 },
    { label: t('auth.resetPassword.req.number', 'one number'), met: /[0-9]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: t('auth.signup.validation.passwordsDoNotMatch', 'Las contraseñas no coinciden'),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call for password reset
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      toast({
        title: t('auth.resetPassword.successTitle', 'Contraseña actualizada'),
        description: t('auth.resetPassword.successDesc', 'Tu contraseña ha sido restablecida con éxito.'),
      });
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t('auth.resetPassword.successTitle', '¡Todo listo!')}
            </h1>
            <p className="text-gray-600 mb-8">
              {t('auth.resetPassword.successLongDesc', 'Tu contraseña ha sido actualizada. Ahora puedes iniciar sesión con tu nueva clave.')}
            </p>
            <Link href="/login">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 py-6 rounded-xl font-semibold">
                {t('landing.auth.signup.signIn', 'Ir al Inicio de Sesión')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/">
          <div className="flex items-center justify-center mb-12 cursor-pointer group">
            <img src={logoUrl} alt="TERA Logo" className="h-20 w-auto group-hover:scale-105 transition-transform duration-300" />
          </div>
        </Link>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="mb-8 text-left">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t('auth.resetPassword.title', 'Choose new password')}
            </h1>
            <p className="text-gray-600 text-sm">
              {t('auth.resetPassword.description', 'Almost done. Enter your new password and youre all set.')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="new-password" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('landing.auth.signup.passwordLabel', 'New password')}
              </label>
              <div className="relative group">
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="myemailaddress@gmail.com"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirm-new-password" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('landing.auth.signup.confirmPasswordLabel', 'Cofirm new password')}
              </label>
              <div className="relative group">
                <input
                  id="confirm-new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 py-2">
              {passwordRequirements.map((req, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? 'bg-green-600' : 'bg-gray-200'}`}>
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                  <span className={`text-xs ${req.met ? 'text-green-700' : 'text-gray-500'}`}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white font-semibold py-6 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center group"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : null}
              {t('auth.resetPassword.submitButton', 'Reset password')}
            </Button>
          </form>

          <div className="mt-6">
            <Link href="/login">
              <button className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('landing.auth.footer.back', 'Back to login')}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
