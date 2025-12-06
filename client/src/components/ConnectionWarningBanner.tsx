import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function ConnectionWarningBanner() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const { data: googleStatus } = useQuery({
    queryKey: ["/api/auth/google/status"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    refetchInterval: 30000,
    enabled: isAuthenticated,
  });

  const { data: dropboxStatus } = useQuery({
    queryKey: ["/api/auth/dropbox/status"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    refetchInterval: 30000,
    enabled: isAuthenticated,
  });

  const hasGoogleConnected = googleStatus?.connected && googleStatus?.hasValidToken;
  const hasDropboxConnected = dropboxStatus?.connected && dropboxStatus?.hasValidToken;
  const hasAnyAccountConnected = hasGoogleConnected || hasDropboxConnected;

  if (!isAuthenticated || hasAnyAccountConnected) {
    return null;
  }

  return (
    <div className="flex justify-center py-3 bg-background">
      <div 
        className="inline-flex items-center gap-3 px-4 py-2 bg-card border border-border rounded-full shadow-sm"
        data-testid="banner-connection-warning"
      >
        <span className="flex items-center justify-center w-5 h-5 bg-amber-500 rounded-full">
          <AlertCircle className="w-3 h-3 text-white" />
        </span>
        <span className="text-sm text-muted-foreground">
          {t('dashboard.noAccountConnected')}{" "}
          <Link 
            href="/integrations" 
            className="font-medium text-primary hover:underline"
          >
            {t('dashboard.integrations')}
          </Link>{" "}
          {t('dashboard.toStartWorking')}
        </span>
      </div>
    </div>
  );
}
