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
        // Get the hash from URL (contains the confirmation token or error)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        // Check for errors first (like otp_expired, access_denied, etc.)
        const error = hashParams.get('error');
        const errorCode = hashParams.get('error_code');
        const errorDescription = hashParams.get('error_description');
        
        if (error) {
          console.error('Email confirmation error from URL:', { error, errorCode, errorDescription });
          setStatus('error');
          
          // Show user-friendly message based on error code
          if (errorCode === 'otp_expired' || errorDescription?.includes('expired')) {
            setMessage(t('emailConfirmation.linkExpired', 'El enlace de verificación ha expirado. Por favor, solicita un nuevo correo de verificación.'));
          } else if (errorCode === '403' || error === 'access_denied') {
            setMessage(t('emailConfirmation.invalidLink', 'El enlace de verificación no es válido o ya fue usado.'));
          } else if (errorDescription?.includes('already been verified')) {
            setMessage(t('emailConfirmation.alreadyVerified', 'Este correo ya ha sido verificado. Intenta iniciar sesión.'));
          } else {
            setMessage(errorDescription || t('emailConfirmation.error', 'Ocurrió un error al verificar tu correo.'));
          }
          return;
        }
        
        // If no error, try to get tokens
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (type === 'signup' && accessToken && refreshToken) {
          const supabase = await supabasePromise;
          
          if (!supabase) {
            setStatus('error');
            setMessage(t('emailConfirmation.error'));
            return;
          }
          
          // Set the session with the tokens from the URL
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
          
          // Clear and refetch auth queries
          queryClient.clear();
          await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });

          setStatus('success');
          setMessage(t('emailConfirmation.success'));
          
          // Redirect to home after 2 seconds
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else {
          setStatus('error');
          setMessage(t('emailConfirmation.invalidLink'));
        }
      } catch (error) {
        console.error('Email confirmation error:', error);
        setStatus('error');
        setMessage(t('emailConfirmation.error'));
      }
    };

    confirmEmail();
  }, [t, setLocation]);

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
              <Loader2 className="h-16 w-16 text-primary animate-spin" data-testid="icon-loading" />
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
                onClick={() => window.location.href = '/'}
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
