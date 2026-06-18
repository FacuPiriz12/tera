import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCachedSession } from "@/lib/supabaseSession";
import { getAuthHeaders } from "@/lib/queryClient";

export interface OneDriveAuthStatus {
  connected: boolean;
  hasValidToken: boolean;
}

export function useOneDriveAuth() {
  const queryClient = useQueryClient();

  const { data: status, isLoading: isLoadingStatus, error: statusError } = useQuery<OneDriveAuthStatus>({
    queryKey: ["/api/auth/onedrive/status"],
    queryFn: async () => {
      const headers = await getAuthHeaders();
      const response = await fetch("/api/auth/onedrive/status", { credentials: "include", headers });
      if (!response.ok) {
        if (response.status === 401) return null;
        throw new Error('Failed to check OneDrive auth status');
      }
      return response.json();
    },
    refetchInterval: 30000,
  });

  const connect = () => {
    const session = getCachedSession();
    let authUrl = "/api/auth/onedrive";
    if (session?.access_token) authUrl += `?token=${encodeURIComponent(session.access_token)}`;
    window.location.href = authUrl;
  };

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/onedrive", { method: "DELETE", credentials: "include" });
      if (!response.ok) throw new Error('Failed to disconnect OneDrive');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/auth/onedrive/status"] }),
  });

  const checkOAuthCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const result = urlParams.get('onedrive_auth');
    if (result) {
      const url = new URL(window.location.href);
      url.searchParams.delete('onedrive_auth');
      window.history.replaceState({}, document.title, url.toString());
      queryClient.invalidateQueries({ queryKey: ["/api/auth/onedrive/status"] });
      return result === 'success' ? { success: true } : { error: true };
    }
    return null;
  };

  return {
    status,
    isLoadingStatus,
    statusError,
    isConnected: status?.connected || false,
    hasValidToken: status?.hasValidToken || false,
    connect,
    disconnect: disconnectMutation.mutate,
    isConnecting: false,
    isDisconnecting: disconnectMutation.isPending,
    checkOAuthCallback,
  };
}
