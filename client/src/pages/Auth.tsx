import React, { useState, useEffect, useMemo } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Database, Zap, TrendingUp, Users, FileText, BarChart3, Globe } from 'lucide-react';
import { useLocation, Link } from "wouter";
import logoUrl from "@/assets/logo.png";
import "@/auth-animations.css";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthPage() {
  const { t, i18n } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [, setLocation] = useLocation();
  const { loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();

  const [floatingIcons, setFloatingIcons] = useState<any[]>([]);

  // Get a random welcome message based on the current language
  const welcomeMessage = useMemo(() => {
    const messages = t('welcomeMessages', { returnObjects: true });
    if (Array.isArray(messages) && messages.length > 0) {
      const randomIndex = Math.floor(Math.random() * messages.length);
      return messages[randomIndex];
    }
    return t('landing.auth.login.title'); // Fallback
  }, [t, i18n.language]);

  useEffect(() => {
    const icons = [
      { Icon: Database, delay: 0, duration: 20 },
      { Icon: Zap, delay: 2, duration: 25 },
      { Icon: FileText, delay: 4, duration: 22 },
      { Icon: BarChart3, delay: 6, duration: 24 },
      { Icon: Users, delay: 8, duration: 23 },
      { Icon: TrendingUp, delay: 10, duration: 21 }
    ];
    setFloatingIcons(icons);
  }, []);

  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'register') {
      setIsRegistering(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRegistering) {
      if (password !== confirmPassword) {
        toast({
          title: "Error",
          description: "Las contraseñas no coinciden",
          variant: "destructive",
        });
        return;
      }
      
      const names = name.split(' ');
      const firstName = names[0];
      const lastName = names.slice(1).join(' ');

      registerMutation.mutate({
        email,
        password,
        firstName,
        lastName,
      }, {
        onSuccess: () => {
          setLocation("/signup/success");
        }
      });
    } else {
      loginMutation.mutate({
        username: email,
        password,
        email,
      }, {
        onSuccess: () => {
          setLocation("/");
        }
      });
    }
  };

  const isLoading = loginMutation?.isPending || registerMutation?.isPending;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row overflow-hidden relative">
      {/* Language Selector Overlay */}
      <div className="absolute top-4 right-4 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="bg-white/50 backdrop-blur-sm border border-gray-200">
              <Globe className="w-4 h-4 mr-2" />
              <span className="uppercase">{i18n.language.split('-')[0]}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => i18n.changeLanguage('es')}>
              Español
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => i18n.changeLanguage('en')}>
              English
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => i18n.changeLanguage('pt')}>
              Português
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Left Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 perspective-1000">
        <div className={`w-full max-w-md flip-card-inner ${isRegistering ? 'flip-card-flipped' : ''}`}>
          {/* Front Face - Login */}
          <div className="backface-hidden w-full">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center justify-center mb-12 cursor-pointer group">
                <img src={logoUrl} alt="TERA Logo" className="h-24 w-auto group-hover:scale-105 transition-transform duration-300" />
              </div>
            </Link>

            {/* Welcome Text */}
            <div className="mb-10 text-center">
              <AnimatePresence mode="wait">
                <motion.h1 
                  key={isRegistering ? 'register' : welcomeMessage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-4xl font-bold text-gray-900 mb-3 tracking-tight"
                >
                  {isRegistering ? t('auth.signup.title') : welcomeMessage}
                </motion.h1>
              </AnimatePresence>
              <p className="text-gray-600">
                {isRegistering 
                  ? t('auth.signup.subtitle') 
                  : t('auth.login.description')}
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field (only for register) */}
              {isRegistering && (
                <div>
                  <label htmlFor="name-register" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('auth.signup.nameLabel')}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Users className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    </div>
                    <input
                      id="name-register"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('auth.signup.namePlaceholder')}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email-login" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('auth.login.emailLabel')}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    id="email-login"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('auth.login.emailPlaceholder')}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password-login" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('auth.login.passwordLabel')}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    id="password-login"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field (only for register) */}
              {isRegistering && (
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('auth.signup.confirmPasswordLabel')}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    </div>
                    <input
                      id="confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>
              )}

              {!isRegistering && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                    />
                    <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                      {t('auth.login.rememberMe', 'Recordarme')}
                    </span>
                  </label>
                  <Link href="/forgot-password">
                    <span className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer">
                      {t('auth.login.forgotPassword')}
                    </span>
                  </Link>
                </div>
              )}

              {isRegistering && (
                <div className="flex items-center mt-4">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    required
                  />
                  <span className="ml-2 text-xs text-gray-600">
                    {t('auth.signup.acceptTerms.part1')} <Link href="/terms" className="text-blue-600 font-bold hover:underline">{t('auth.signup.acceptTerms.termsLink')}</Link> {t('auth.signup.acceptTerms.and')} <Link href="/privacy" className="text-blue-600 font-bold hover:underline">{t('auth.signup.acceptTerms.privacyLink')}</Link>
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group relative overflow-hidden"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {isRegistering ? t('auth.signup.createAccountButton') : t('auth.login.signInButton')}
                  </>
                ) : (
                  <>
                    <span className="relative z-10">{isRegistering ? t('auth.signup.createAccountButton') : t('auth.login.signInButton')}</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform relative z-10" />
                    <div className="absolute inset-0 bg-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                  </>
                )}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-50 text-gray-500">{t('landing.auth.login.orContinueWith', 'O Inicia Con')}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-white hover:shadow-md transition-all group">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">Google</span>
              </button>

              <button className="flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-white hover:shadow-md transition-all group">
                <svg className="w-5 h-5 mr-2 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">Apple</span>
              </button>
            </div>

            <p className="mt-8 text-center text-gray-600">
              {isRegistering ? t('landing.auth.signup.hasAccount') : t('landing.auth.login.noAccount')}{' '}
              <button 
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
              >
                {isRegistering ? t('landing.auth.signup.signIn') : t('landing.auth.login.signUpNow', 'Regístrate Ahora')}
              </button>
            </p>

            {/* Footer Copyright */}
            <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col items-center justify-center">
              <p className="text-[12px] font-normal text-[#6a7282]">{t('landing.footer.rights', { year: 2026 })}</p>
              <div className="flex items-center mt-4">
                <span className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                  {t('landing.footer.status')}
                </span>
              </div>
            </div>
          </div>

          {/* Back Face - Register */}
          <div className="backface-hidden w-full rotate-y-180 absolute top-0 left-0 hidden">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center justify-center mb-8 cursor-pointer group">
                <img src={logoUrl} alt="TERA Logo" className="h-20 w-auto group-hover:scale-105 transition-transform duration-300" />
              </div>
            </Link>

            {/* Welcome Text */}
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                {t('auth.signup.title')}
              </h1>
              <p className="text-sm text-gray-600">
                {t('auth.signup.subtitle')}
              </p>
            </div>

            {/* Register Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name-register" className="block text-sm font-semibold text-gray-700 mb-1">
                  Nombre completo
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Users className="h-4 w-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    id="name-register"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email-register" className="block text-sm font-semibold text-gray-700 mb-1">
                  {t('auth.login.emailLabel')}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    id="email-register"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('auth.login.emailPlaceholder')}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password-register" className="block text-sm font-semibold text-gray-700 mb-1">
                  {t('auth.login.passwordLabel')}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    id="password-register"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-semibold text-gray-700 mb-1">
                  {t('auth.signup.confirmPasswordLabel')}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  required
                />
                <span className="ml-2 text-xs text-gray-600">
                  {t('auth.signup.acceptTerms.part1')} <Link href="/terms" className="text-blue-600 font-bold hover:underline">{t('auth.signup.acceptTerms.termsLink')}</Link> {t('auth.signup.acceptTerms.and')} <Link href="/privacy" className="text-blue-600 font-bold hover:underline">{t('auth.signup.acceptTerms.privacyLink')}</Link>
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 mt-4"
              >
                {isLoading ? t('status.loading') : t('auth.signup.createAccountButton')}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              {t('auth.signup.hasAccount')}{' '}
              <button 
                type="button"
                onClick={() => setIsRegistering(false)}
                className="font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                {t('auth.signup.signIn')}
              </button>
            </p>

            {/* Footer Copyright */}
            <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col items-center justify-center">
              <p className="text-[12px] font-normal text-[#6a7282]">{t('landing.footer.rights', { year: 2026 })}</p>
              <div className="flex items-center mt-3">
                <span className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                  {t('landing.footer.status')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Feature Showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
        {/* Floating Icons Animation */}
        <div className="absolute inset-0">
          {floatingIcons.map((item, idx) => {
            const Icon = item.Icon;
            return (
              <div
                key={idx}
                className="absolute text-white/10"
                style={{
                  left: `${15 + (idx * 15)}%`,
                  top: `${10 + (idx * 12)}%`,
                  animation: `float ${item.duration}s ease-in-out infinite`,
                  animationDelay: `${item.delay}s`
                }}
              >
                <Icon className="w-12 h-12" />
              </div>
            );
          })}
        </div>
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-16 text-white text-center">
          <div className="max-w-xl">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              {t('auth.showcase.title')}
            </h2>
            <p className="text-blue-100 text-lg mb-12">
              {t('auth.showcase.description')}
            </p>
            {/* Dashboard Mockup Preview */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl transform hover:scale-[1.02] transition-all duration-500 overflow-hidden">
              <div className="w-full aspect-[4/3] bg-white rounded-xl overflow-hidden shadow-inner">
                {/* Simplified Mockup UI */}
                <div className="h-full w-full flex flex-col bg-gray-50 text-left">
                  <div className="h-10 border-b border-gray-100 flex items-center px-4 gap-1.5 bg-white">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                    <div className="ml-4 h-5 w-32 bg-gray-100 rounded-md" />
                  </div>
                  <div className="flex-1 p-4 grid grid-cols-4 gap-4">
                    {/* Sidebar mockup */}
                    <div className="col-span-1 space-y-3">
                      <div className="h-4 w-full bg-blue-100 rounded" />
                      <div className="h-4 w-4/5 bg-gray-100 rounded" />
                      <div className="h-4 w-3/4 bg-gray-100 rounded" />
                      <div className="h-4 w-5/6 bg-gray-100 rounded" />
                      <div className="pt-4 space-y-2">
                        <div className="h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-lg border border-blue-50" />
                      </div>
                    </div>
                    {/* Main content mockup */}
                    <div className="col-span-3 space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="h-20 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col p-3">
                          <div className="h-2 w-1/2 bg-gray-100 rounded mb-2" />
                          <div className="h-4 w-3/4 bg-blue-200 rounded" />
                        </div>
                        <div className="h-20 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col p-3">
                          <div className="h-2 w-1/2 bg-gray-100 rounded mb-2" />
                          <div className="h-4 w-3/4 bg-blue-200 rounded" />
                        </div>
                        <div className="h-20 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col p-3">
                          <div className="h-2 w-1/2 bg-gray-100 rounded mb-2" />
                          <div className="h-4 w-3/4 bg-blue-200 rounded" />
                        </div>
                      </div>
                      <div className="h-40 bg-white border border-gray-100 rounded-xl shadow-sm p-4">
                        <div className="flex justify-between items-center mb-4">
                          <div className="h-3 w-24 bg-gray-100 rounded" />
                          <div className="h-3 w-12 bg-blue-100 rounded" />
                        </div>
                        <div className="flex items-end gap-2 h-20">
                          <div className="flex-1 bg-blue-200 rounded-t h-1/2" />
                          <div className="flex-1 bg-blue-400 rounded-t h-3/4" />
                          <div className="flex-1 bg-blue-300 rounded-t h-2/3" />
                          <div className="flex-1 bg-blue-500 rounded-t h-full" />
                          <div className="flex-1 bg-blue-100 rounded-t h-1/3" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
