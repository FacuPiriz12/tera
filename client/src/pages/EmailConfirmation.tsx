import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { supabasePromise } from "@/lib/supabase";
import { setCachedSession } from "@/lib/supabaseSession";
import { useTranslation } from "react-i18next";
import { CheckCircle2, AlertCircle, Loader2, Mail, ShieldCheck, UserPlus, ArrowRight } from "lucide-react";
import logoUrl from "@/assets/logo.png";
import { queryClient } from "@/lib/queryClient";
import "@/auth-animations.css";

export default function EmailConfirmation() {
  const { t } = useTranslation(['auth', 'common']);
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const supabase = await supabasePromise;
        
        if (!supabase) {
          setStatus('error');
          setMessage(t('emailConfirmation.error'));
          return;
        }

        // Try to get params from query string first (default Supabase behavior)
        const searchParams = new URLSearchParams(window.location.search);
        const tokenHash = searchParams.get('token_hash'); // Correct parameter for magic links
        const type = searchParams.get('type');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        // Also check hash for backward compatibility
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');
        
        // Handle errors from either source
        const finalError = error || hashParams.get('error');
        const finalErrorDescription = errorDescription || hashParams.get('error_description');
        
        if (finalError) {
          console.error('Email confirmation error from URL:', { 
            error: finalError, 
            errorDescription: finalErrorDescription 
          });
          setStatus('error');
          
          // Show user-friendly message based on error
          if (finalErrorDescription?.includes('expired')) {
            setMessage(t('emailConfirmation.linkExpired', 'El enlace de verificación ha expirado. Por favor, solicita un nuevo correo de verificación.'));
          } else if (finalError === 'access_denied') {
            setMessage(t('emailConfirmation.invalidLink', 'El enlace de verificación no es válido o ya fue usado.'));
          } else if (finalErrorDescription?.includes('already been verified')) {
            setMessage(t('emailConfirmation.alreadyVerified', 'Este correo ya ha sido verificado. Intenta iniciar sesión.'));
          } else {
            setMessage(finalErrorDescription || t('emailConfirmation.error', 'Ocurrió un error al verificar tu correo.'));
          }
          return;
        }
        
        // Method 1: If we have a token_hash (most common with default Supabase email template)
        if (tokenHash && type) {
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as any
          });

          if (verifyError) {
            console.error('Token verification error:', verifyError);
            setStatus('error');
            setMessage(verifyError.message);
            return;
          }

          if (data.session) {
            setCachedSession(data.session);
            await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
            setStatus('success');
            setMessage(t('emailConfirmation.success'));
            setTimeout(() => setLocation('/'), 3000);
          } else {
            setStatus('error');
            setMessage(t('emailConfirmation.error'));
          }
          return;
        }
        
        // Method 2: If we have access_token and refresh_token (hash-based method)
        if (accessToken && refreshToken) {
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (sessionError) {
            console.error('Session error:', sessionError);
            setStatus('error');
            setMessage(sessionError.message);
            return;
          }

          setCachedSession(sessionData.session);
          await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
          setStatus('success');
          setMessage(t('emailConfirmation.success'));
          setTimeout(() => setLocation('/'), 3000);
          return;
        }
        
        setStatus('error');
        setMessage(t('emailConfirmation.invalidLink', 'El enlace de verificación no es válido o está incompleto.'));
        
      } catch (error) {
        console.error('Email confirmation error:', error);
        setStatus('error');
        setMessage(t('emailConfirmation.error'));
      }
    };

    confirmEmail();
  }, [t, setLocation]);

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
                {status === 'loading' && <Mail className="w-10 h-10 text-white" />}
                {status === 'success' && <CheckCircle2 className="w-10 h-10 text-white" />}
                {status === 'error' && <AlertCircle className="w-10 h-10 text-white" />}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-400 rounded-full border-4 border-white flex items-center justify-center shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            {status === 'loading' && t('emailConfirmation.verifying')}
            {status === 'success' && t('emailConfirmation.confirmed')}
            {status === 'error' && t('emailConfirmation.failed')}
          </h1>
          <p className="text-gray-500 font-medium leading-relaxed">
            {message || t('emailConfirmation.verifyingDescription')}
          </p>
        </div>

        {status === 'loading' && (
          <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 text-center animate-in slide-in-from-bottom-2 duration-500">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-2" />
            <p className="text-blue-800 font-semibold text-sm leading-relaxed">
              Confirmando tu dirección de correo electrónico...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-green-50/50 rounded-2xl p-6 border border-green-100 text-center animate-in slide-in-from-bottom-2 duration-500">
            <p className="text-green-800 font-semibold text-sm leading-relaxed">
              {t('emailConfirmation.confirmedDescription')}
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50/50 rounded-2xl p-6 border border-red-100 text-center animate-in slide-in-from-bottom-2 duration-500">
            <p className="text-red-800 font-semibold text-sm leading-relaxed">
              {t('emailConfirmation.failedDescription')}
            </p>
          </div>
        )}

        <div className="space-y-6">
          {status === 'success' ? (
            <button 
              onClick={() => setLocation('/')}
              className="w-full bg-blue-600 py-4 rounded-2xl font-bold text-white hover:bg-blue-700 transition-all flex items-center justify-center group shadow-sm hover:shadow-md"
            >
              {t('emailConfirmation.continueToApp')}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          ) : status === 'error' ? (
            <div className="space-y-3">
              <button 
                onClick={() => setLocation('/signup')}
                className="w-full bg-white border-2 border-gray-100 py-4 rounded-2xl font-bold text-blue-600 hover:border-blue-600 hover:bg-blue-50/30 transition-all flex items-center justify-center group shadow-sm hover:shadow-md"
              >
                {t('emailConfirmation.signupAgain', 'Registrarse nuevamente')}
              </button>
              <button 
                onClick={() => setLocation('/login')}
                className="w-full bg-white border-2 border-gray-100 py-4 rounded-2xl font-bold text-gray-600 hover:border-gray-400 hover:bg-gray-50/30 transition-all flex items-center justify-center group shadow-sm hover:shadow-md"
              >
                {t('emailConfirmation.tryLogin', 'Intentar iniciar sesión')}
              </button>
            </div>
          ) : (
            <p className="text-[11px] text-gray-400 font-medium leading-tight px-4">
              {t('common.emailVerification.securityNote')}
            </p>
          )}
        </div>

        <div className="border-t border-gray-100 pt-8">
          <p className="text-gray-400 text-sm font-bold mb-4">¿No eres tú?</p>
          <Link href="/auth">
            <button className="inline-flex items-center text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors group">
              <UserPlus className="w-4 h-4 mr-2" />
              Registrarse con otro correo
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
