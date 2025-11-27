import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCachedSession } from "@/lib/supabaseSession";
import { getAuthHeaders } from "@/lib/queryClient";

export interface DropboxAuthStatus {
  connected: boolean;
  hasValidToken: boolean;
}

export function useDropboxAuth() {
  const queryClient = useQueryClient();

  // Get Dropbox auth status
  const {
    data: status,
    isLoading: isLoadingStatus,
    error: statusError
  } = useQuery<DropboxAuthStatus>({
    queryKey: ["/api/auth/dropbox/status"],
    queryFn: async () => {
      const headers = await getAuthHeaders();
      const response = await fetch("/api/auth/dropbox/status", {
        credentials: "include",
        headers,
      });
      if (!response.ok) {
        if (response.status === 401) {
          return null;
        }
        throw new Error('Failed to check auth status');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: true, // Always enabled to check Dropbox auth status
  });

  // Connect Dropbox mutation
  const connectMutation = useMutation({
    mutationFn: async () => {
      // Get Supabase token if available
      const session = getCachedSession();
      let authUrl = "/api/auth/dropbox";
      
      // Include token in URL for Supabase auth users
      if (session?.access_token) {
        authUrl += `?token=${encodeURIComponent(session.access_token)}`;
      }
      
      // This will redirect to Dropbox OAuth
      window.location.href = authUrl;
    },
    onError: (error) => {
      console.error("Failed to start Dropbox OAuth:", error);
    },
  });

  // Disconnect Dropbox mutation
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/dropbox", {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch status
      queryClient.invalidateQueries({ queryKey: ["/api/auth/dropbox/status"] });
    },
    onError: (error) => {
      console.error("Failed to disconnect Dropbox account:", error);
    },
  });

  // Check for OAuth callback result in URL
  const checkOAuthCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const dropboxAuth = urlParams.get('dropbox_auth');
    
    if (dropboxAuth === 'success') {
      // Remove the parameter from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('dropbox_auth');
      window.history.replaceState({}, document.title, url.toString());
      
      // Refetch status
      queryClient.invalidateQueries({ queryKey: ["/api/auth/dropbox/status"] });
      
      return { success: true };
    } else if (dropboxAuth === 'error') {
      // Remove the parameter from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('dropbox_auth');
      window.history.replaceState({}, document.title, url.toString());
      
      return { error: true };
    }
    
    return null;
  };

  return {
    status,
    isLoadingStatus,
    statusError,
    isConnected: status?.connected || false,
    hasValidToken: status?.hasValidToken || false,
    connect: connectMutation.mutate,
    disconnect: disconnectMutation.mutate,
    isConnecting: connectMutation.isPending,
    isDisconnecting: disconnectMutation.isPending,
    checkOAuthCallback,
  };
}