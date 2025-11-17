import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { supabasePromise } from "@/lib/supabase";
import { useEffect, useState } from "react";

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
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isSupabaseLoading, setIsSupabaseLoading] = useState(true);
  const queryClient = useQueryClient();

  // Initialize Supabase auth listener
  useEffect(() => {
    let mounted = true;
    let cleanup: (() => void) | undefined;
    
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
        
        // Get initial session (cache is already set at module level in supabase.ts)
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setSupabaseUser(session?.user || null);
          setIsSupabaseLoading(false);
        }
        
        // Listen for auth changes (cache is updated at module level, we just update UI)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event);
            if (mounted) {
              setSupabaseUser(session?.user || null);
              // Only invalidate on sign in/out, not on token refresh
              if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
                queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
              }
            }
          }
        );

        cleanup = () => {
          subscription.unsubscribe();
        };
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
      cleanup?.();
    };
  }, [queryClient]);

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
      // Sign out from Supabase if user is using Supabase auth
      if (supabaseUser) {
        const supabase = await supabasePromise;
        await supabase.auth.signOut();
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
      setSupabaseUser(null);
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
