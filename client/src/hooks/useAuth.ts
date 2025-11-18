import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { supabasePromise } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { getCachedSession, setCachedSession } from "@/lib/supabaseSession";

export function useAuth() {
  const [isSupabaseLoading, setIsSupabaseLoading] = useState(true);
  const queryClient = useQueryClient();

  // Initialize Supabase and check initial session once
  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | undefined;
    
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
        
        // Get initial session and update cache
        const { data: { session } } = await supabase.auth.getSession();
        setCachedSession(session);
        
        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Supabase auth state changed:', event, session ? 'Session present' : 'No session');
          setCachedSession(session);
          
          // Refetch user data when auth state changes
          if (session) {
            await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
          } else {
            queryClient.setQueryData(["/api/auth/user"], null);
          }
        });
        
        unsubscribe = () => subscription.unsubscribe();
        
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
      if (unsubscribe) {
        unsubscribe();
      }
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
      // Check if using Supabase auth by looking at cached session
      const session = getCachedSession();
      
      if (session) {
        const supabase = await supabasePromise;
        if (supabase) {
          await supabase.auth.signOut();
          setCachedSession(null);
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
