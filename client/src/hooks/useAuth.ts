import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { supabasePromise } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { getCachedSession } from "@/lib/supabaseSession";

type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    name?: string;
    avatar_url?: string;
  };
};

export function useAuth() {
  const [isSupabaseLoading, setIsSupabaseLoading] = useState(true);
  const queryClient = useQueryClient();

  // Initialize Supabase and check initial session once
  useEffect(() => {
    let mounted = true;
    
    const initSupabaseAuth = async () => {
      try {
        const supabase = await supabasePromise;
        
        // Only proceed if Supabase credentials are configured
        if (!supabase) {
          if (mounted) {
            setIsSupabaseLoading(false);
          }
          return;
        }
        
        // Just wait for initial session check
        // The session cache is managed at module level in supabase.ts
        await supabase.auth.getSession();
        
        if (mounted) {
          setIsSupabaseLoading(false);
        }
      } catch (error) {
        console.error('Error initializing Supabase auth:', error);
        if (mounted) {
          setIsSupabaseLoading(false);
        }
      }
    };

    initSupabaseAuth();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Query backend for user data
  // This works for both Supabase and Replit auth since getAuthHeaders() uses cached session
  const { data: backendUser, isLoading: isBackendLoading, error, isError } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !isSupabaseLoading,
  });

  // Sign out mutation
  const signOutMutation = useMutation({
    mutationFn: async () => {
      // Check if using Supabase auth by looking at cached session
      const session = getCachedSession();
      
      if (session) {
        const supabase = await supabasePromise;
        if (supabase) {
          await supabase.auth.signOut();
        }
      } else {
        // Sign out from Replit/dev auth
        const response = await fetch('/api/logout', { method: 'POST' });
        if (!response.ok) {
          throw new Error('Failed to sign out');
        }
      }
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = '/login';
    },
  });

  const isLoading = isSupabaseLoading || isBackendLoading;
  const user = backendUser;
  const isAuthenticated = !!(user && !isError);
  
  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    signOut: signOutMutation.mutate,
    isSigningOut: signOutMutation.isPending,
  };
}
