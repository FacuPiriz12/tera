import { useEffect } from "react";
import { useBoxAuth } from "@/hooks/useBoxAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Folder,
  Lock,
  ArrowRight,
} from "lucide-react";
import BoxLogo from "@/components/BoxLogo";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

interface BoxConnectionProps {
  variant?: 'header' | 'card' | 'inline' | 'sidebar';
}

export default function BoxConnection({ variant = 'header' }: BoxConnectionProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isFree = (user?.membershipPlan || 'free') === 'free' && user?.role !== 'admin';
  const {
    isConnected,
    hasValidToken,
    connect,
    disconnect,
    isConnecting,
    isDisconnecting,
    isLoadingStatus,
    checkOAuthCallback
  } = useBoxAuth();
  const { toast } = useToast();
  const provider = 'Box';

  useEffect(() => {
    const result = checkOAuthCallback();
    if (result?.success) {
      toast({
        title: t('pages.integrations.connectSuccess'),
        description: t('pages.integrations.connectSuccessDesc', { provider }),
      });
    } else if (result?.error) {
      toast({
        title: t('pages.integrations.connectError'),
        description: t('pages.integrations.connectErrorDesc', { provider }),
        variant: "destructive",
      });
    }
  }, [checkOAuthCallback, toast]);

  const handleConnect = () => connect();

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: t('pages.integrations.disconnectSuccess'),
      description: t('pages.integrations.disconnectSuccessDesc', { provider }),
    });
  };

  if (variant === 'header') {
    if (isLoadingStatus) {
      return (
        <div className="flex items-center gap-2" data-testid="box-loading">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      );
    }
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={(isConnected && hasValidToken) ? undefined : handleConnect}
              disabled={isConnecting || isDisconnecting}
              className="flex items-center gap-2 h-8 px-2"
              data-testid="box-status"
            >
              <BoxLogo className="w-4 h-4" />
              {isConnected ? (
                hasValidToken ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                )
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isConnected ? (
              hasValidToken
                ? t('pages.integrations.tooltipConnected', { provider })
                : t('pages.integrations.tooltipExpired')
            ) : (
              t('pages.integrations.tooltipConnect', { provider })
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'card') {
    if (isFree) {
      return (
        <div className="flex items-center justify-between" data-testid="box-card">
          <Link href="/pricing">
            <Button variant="outline" size="sm" className="px-8 gap-2 border-amber-300 text-amber-700 hover:bg-amber-50">
              <Lock className="w-4 h-4" />
              Solo Pro
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
          <Badge variant="default" className="bg-amber-100 text-amber-700 border-0 ml-8">
            <Lock className="w-3 h-3 mr-1" />
            Pro
          </Badge>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-between" data-testid="box-card">
        <div className="flex gap-2">
          {isConnected ? (
            <>
              {!hasValidToken && (
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  size="sm"
                  className="px-8"
                  data-testid="button-reconnect-box"
                >
                  {isConnecting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {t('pages.integrations.reconnect')}
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-8"
                    disabled={isDisconnecting}
                    data-testid="button-disconnect-box"
                  >
                    {isDisconnecting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {t('pages.integrations.disconnect')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('pages.integrations.disconnectTitle', { provider })}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('pages.integrations.disconnectDesc', { provider })}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('pages.integrations.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDisconnect} data-testid="confirm-disconnect-box">
                      {t('pages.integrations.disconnect')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              variant="outline"
              size="sm"
              className="px-8 text-[#0061D5] border-slate-200"
              data-testid="button-connect-box"
            >
              {isConnecting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t('pages.integrations.connect')}
            </Button>
          )}
        </div>
        <div className="ml-8">
          {isConnected ? (
            hasValidToken ? (
              <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                <CheckCircle className="w-3 h-3 mr-1" />
                {t('pages.integrations.connected')}
              </Badge>
            ) : (
              <Badge variant="default" className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {t('pages.integrations.tokenExpired')}
              </Badge>
            )
          ) : (
            <Badge variant="default" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
              <XCircle className="w-3 h-3 mr-1" />
              {t('pages.integrations.disconnected')}
            </Badge>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'sidebar') {
    if (isLoadingStatus) {
      return (
        <div className="flex items-center gap-2 p-2 rounded-md bg-muted/20" data-testid="box-sidebar-loading">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{t('pages.integrations.verifying')}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-between p-2 rounded-md bg-muted/20 hover:bg-muted/30 transition-colors" data-testid="box-sidebar">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Folder className="w-4 h-4 flex-shrink-0 text-[#0061D5]" />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium truncate">Box</div>
            <div className="text-xs text-muted-foreground">
              {isConnected ? (
                hasValidToken ? (
                  <span className="text-green-600">{t('pages.integrations.connected')}</span>
                ) : (
                  <span className="text-orange-600">{t('pages.integrations.tokenExpired')}</span>
                )
              ) : (
                <span className="text-muted-foreground">{t('pages.integrations.disconnected')}</span>
              )}
            </div>
          </div>
        </div>
        {isConnected ? (
          <div className="flex items-center gap-1">
            {hasValidToken ? (
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            ) : (
              <Button onClick={handleConnect} variant="ghost" size="sm" className="h-6 px-2 text-xs" disabled={isConnecting} data-testid="button-reconnect-box-sidebar">
                {isConnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : t('pages.integrations.reconnect')}
              </Button>
            )}
          </div>
        ) : (
          <Button onClick={handleConnect} variant="ghost" size="sm" className="h-6 px-2 text-xs" disabled={isConnecting} data-testid="button-connect-box-sidebar">
            {isConnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : t('pages.integrations.connect')}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Button
      onClick={isConnected ? undefined : handleConnect}
      disabled={isConnecting || isDisconnecting}
      variant={isConnected ? "default" : "outline"}
      size="sm"
      className="flex items-center gap-2"
      data-testid="button-box-inline"
    >
      {(isConnecting || isDisconnecting) && <Loader2 className="w-4 h-4 animate-spin" />}
      <Folder className="w-4 h-4" />
      {isConnected ? t('pages.integrations.connected') : t('pages.integrations.connect')}
      {isConnected && (hasValidToken ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertTriangle className="w-4 h-4 text-orange-500" />)}
    </Button>
  );
}
