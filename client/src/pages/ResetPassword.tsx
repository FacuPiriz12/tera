import React, { useState } from 'react';
import { Lock, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useLocation, Link } from "wouter";
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
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('auth.resetPassword.title', 'Nueva Contraseña')}
            </h1>
            <p className="text-gray-600">
              {t('auth.resetPassword.description', 'Elige una contraseña segura para proteger tu cuenta.')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="new-password" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('landing.auth.signup.passwordLabel', 'Nueva Contraseña')}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm-new-password" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('landing.auth.signup.confirmPasswordLabel', 'Confirmar Contraseña')}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  id="confirm-new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
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
              ) : null}
              {t('auth.resetPassword.submitButton', 'Actualizar Contraseña')}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <Link href="/login">
              <button className="w-full flex items-center justify-center text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('landing.auth.footer.back', 'Volver al inicio de sesión')}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
