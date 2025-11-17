import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Mail, ArrowRight } from "lucide-react";
import CloneDriveLogo from "@/components/CloneDriveLogo";

export default function EmailVerification() {
  const { t } = useTranslation(['auth', 'common']);
  const [, setLocation] = useLocation();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = () => {
    setIsConfirming(true);
    
    // Try to get tokens from query string first (default Supabase behavior)
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    
    // Also check hash for backward compatibility
    const hash = window.location.hash;
    const hashParams = new URLSearchParams(hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const hashType = hashParams.get('type');
    
    // Build confirmation URL with all available params
    if (token || accessToken) {
      // Preserve all params for confirmation page
      const confirmParams = new URLSearchParams();
      
      // Add query string params
      if (token) confirmParams.set('token', token);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mx-auto mb-4">
            <CloneDriveLogo className="h-14" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {t('emailVerification.title', 'Verifica tu correo')}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t('emailVerification.description', 'Haz clic en el botón de abajo para confirmar tu dirección de correo electrónico')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-6">
              <Mail className="h-12 w-12 text-primary" data-testid="icon-mail" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100 text-center">
                {t('emailVerification.info', 'Estás a un paso de completar tu registro. Confirma tu correo para activar tu cuenta.')}
              </p>
            </div>

            <Button 
              onClick={handleConfirm}
              disabled={isConfirming}
              className="w-full h-12 text-base font-semibold"
              data-testid="button-confirm-email"
            >
              {isConfirming ? (
                t('common:status.loading', 'Cargando...')
              ) : (
                <>
                  {t('emailVerification.confirmButton', 'Confirmar mi correo')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                {t('emailVerification.securityNote', 'Este paso adicional protege tu cuenta contra verificaciones automáticas no autorizadas')}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                {t('emailVerification.wrongEmail', '¿No eres tú?')}
              </p>
              <Button 
                onClick={() => setLocation('/signup')}
                variant="ghost"
                size="sm"
                data-testid="button-signup-different"
              >
                {t('emailVerification.signupDifferent', 'Registrarse con otro correo')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
