import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { getCachedSession } from "@/lib/supabaseSession";

export interface GoogleAuthStatus {
  connected: boolean;
  hasValidToken: boolean;
}

export function useGoogleAuth() {
  const queryClient = useQueryClient();

  // Get Google auth status
  const {
    data: status,
    isLoading: isLoadingStatus,
    error: statusError
  } = useQuery<GoogleAuthStatus>({
    queryKey: ["/api/auth/google/status"],
    queryFn: getQueryFn({ on401: "returnNull" }), // Return null on 401 instead of throwing
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: true, // Always enabled to check Google auth status
  });

  // Connect Google Drive mutation
  const connectMutation = useMutation({
    mutationFn: async () => {
      // Get Supabase token if available
      const session = getCachedSession();
      let authUrl = "/api/auth/google";
      
      // Include token in URL for Supabase auth users
      if (session?.access_token) {
        authUrl += `?token=${encodeURIComponent(session.access_token)}`;
      }
      
      // First, fetch the auth URL to check if we get a redirect or an error
      const response = await fetch(authUrl, {
        method: 'GET',
        credentials: 'include',
        redirect: 'manual', // Don't follow redirects automatically
      });
      
      // If we get a redirect (302/303), the URL is in the Location header
      // But since we use redirect: 'manual', we get an opaque-redirect response
      // In this case, status is 0 and type is 'opaqueredirect'
      if (response.type === 'opaqueredirect' || response.status === 0 || response.redirected) {
        // The server wants to redirect us, so navigate to the auth URL
        window.location.href = authUrl;
        // Return a pending promise to keep the loading state while navigating
        return new Promise(() => {});
      }
      
      // If we got a non-redirect response, check for errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error de autenticación' }));
        throw new Error(errorData.message || 'No autorizado. Por favor, inicia sesión primero.');
      }
      
      // If OK but not a redirect, something unexpected happened
      // Still try to navigate
      window.location.href = authUrl;
      return new Promise(() => {});
    },
    onError: (error) => {
      console.error("Failed to start Google OAuth:", error);
    },
  });

  // Disconnect Google Drive mutation
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/google", {
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
      queryClient.invalidateQueries({ queryKey: ["/api/auth/google/status"] });
    },
    onError: (error) => {
      console.error("Failed to disconnect Google account:", error);
    },
  });

  // Check for OAuth callback result in URL
  const checkOAuthCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const googleAuth = urlParams.get('google_auth');
    
    if (googleAuth === 'success') {
      // Remove the parameter from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('google_auth');
      window.history.replaceState({}, document.title, url.toString());
      
      // Refetch status
      queryClient.invalidateQueries({ queryKey: ["/api/auth/google/status"] });
      
      return { success: true };
    } else if (googleAuth === 'error') {
      // Remove the parameter from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('google_auth');
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
    connectError: connectMutation.error,
    checkOAuthCallback,
  };
}