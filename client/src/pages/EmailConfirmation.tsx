import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabasePromise } from "@/lib/supabase";
import { setCachedSession } from "@/lib/supabaseSession";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import CloneDriveLogo from "@/components/CloneDriveLogo";
import { queryClient } from "@/lib/queryClient";

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
        const hashType = hashParams.get('type');
        const hashError = hashParams.get('error');
        const hashErrorDescription = hashParams.get('error_description');
        
        // Handle errors from either source
        const finalError = error || hashError;
        const finalErrorDescription = errorDescription || hashErrorDescription;
        
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
          console.log('Verifying with token_hash method');
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
            // Update the session cache manually
            setCachedSession(data.session);
            
            // Invalidate auth query to force refetch with new session
            await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
            
            setStatus('success');
            setMessage(t('emailConfirmation.success'));
            
            // Redirect to home after 2 seconds using navigation (not full reload)
            setTimeout(() => {
              setLocation('/');
            }, 2000);
          } else {
            setStatus('error');
            setMessage(t('emailConfirmation.error'));
          }
          return;
        }
        
        // Method 2: If we have access_token and refresh_token (hash-based method)
        if (accessToken && refreshToken) {
          console.log('Verifying with session method');
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

          // Update the session cache manually
          setCachedSession(sessionData.session);
          
          // Invalidate auth query to force refetch with new session
          await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });

          setStatus('success');
          setMessage(t('emailConfirmation.success'));
          
          // Redirect to home after 2 seconds using navigation (not full reload)
          setTimeout(() => {
            setLocation('/');
          }, 2000);
          return;
        }
        
        // No valid tokens found
        setStatus('error');
        setMessage(t('emailConfirmation.invalidLink', 'El enlace de verificación no es válido o está incompleto.'));
        
      } catch (error) {
        console.error('Email confirmation error:', error);
        setStatus('error');
        setMessage(t('emailConfirmation.error'));
      }
    };

    confirmEmail();
  }, [t]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mx-auto mb-4">
            <CloneDriveLogo className="h-14" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {status === 'loading' && t('emailConfirmation.verifying')}
            {status === 'success' && t('emailConfirmation.confirmed')}
            {status === 'error' && t('emailConfirmation.failed')}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {status === 'loading' && t('emailConfirmation.verifyingDescription')}
            {status === 'success' && t('emailConfirmation.confirmedDescription')}
            {status === 'error' && t('emailConfirmation.failedDescription')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex justify-center">
            {status === 'loading' && (
              <Loader2 className="h-16 w-16 text-blue-500 animate-spin" data-testid="icon-loading" />
            )}
            {status === 'success' && (
              <CheckCircle2 className="h-16 w-16 text-green-500" data-testid="icon-success" />
            )}
            {status === 'error' && (
              <AlertCircle className="h-16 w-16 text-red-500" data-testid="icon-error" />
            )}
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground" data-testid="text-message">
              {message}
            </p>
          </div>

          {status === 'success' && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                {t('emailConfirmation.redirecting')}
              </p>
              <Button 
                onClick={() => setLocation('/')}
                className="w-full"
                data-testid="button-continue"
              >
                {t('emailConfirmation.continueToApp')}
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-amber-900 dark:text-amber-100">
                  {t('emailConfirmation.troubleshooting', 'Consejo: Si el enlace sigue sin funcionar, asegúrate de hacer clic directamente desde tu correo en lugar de copiar y pegar la URL.')}
                </p>
              </div>
              <Button 
                onClick={() => setLocation('/signup')}
                className="w-full"
                data-testid="button-signup-again"
              >
                {t('emailConfirmation.signupAgain', 'Registrarse nuevamente')}
              </Button>
              <Button 
                onClick={() => setLocation('/login')}
                variant="outline"
                className="w-full"
                data-testid="button-login"
              >
                {t('emailConfirmation.tryLogin', 'Intentar iniciar sesión')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
