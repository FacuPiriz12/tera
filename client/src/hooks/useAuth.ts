import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { supabasePromise } from "@/lib/supabase";
import { useEffect, useState, useRef } from "react";
import { getCachedSession, setCachedSession } from "@/lib/supabaseSession";

export function useAuth() {
  const [isSupabaseLoading, setIsSupabaseLoading] = useState(true);
  const queryClient = useQueryClient();
  const invalidatingRef = useRef(false);
  const lastEventRef = useRef<string>('');

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
          
          // Prevent processing duplicate events
          if (lastEventRef.current === event && invalidatingRef.current) {
            console.log('Skipping duplicate auth event:', event);
            return;
          }
          
          lastEventRef.current = event;
          setCachedSession(session);
          
          // Refetch user data when auth state changes
          if (session) {
            // Only invalidate if not already invalidating
            if (!invalidatingRef.current) {
              invalidatingRef.current = true;
              try {
                await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
              } catch (error) {
                console.error('Error invalidating auth query:', error);
              } finally {
                invalidatingRef.current = false;
              }
            }
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
  const { data: backendUser, isLoading: isBackendLoading, error, isError, isFetching } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Always check on mount to ensure fresh auth state
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

  // Only show loading if we're actually loading (not if we have an error)
  // isFetching ensures we're actively making a request
  const isLoading = isSupabaseLoading || (isBackendLoading && isFetching && !isError);
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
