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
  
  // Logout coordination ref - tracks promise for signOut/listener sync
  const logoutSyncRef = useRef<{
    promise: Promise<void> | null;
    resolve: (() => void) | null;
    reject: ((reason?: unknown) => void) | null;
    timer: ReturnType<typeof setTimeout> | null;
  }>({
    promise: null,
    resolve: null,
    reject: null,
    timer: null,
  });

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
          
          // Handle SIGNED_OUT event for logout coordination
          if (event === 'SIGNED_OUT') {
            setCachedSession(null);
            
            try {
              // Invalidate auth query and wait for it to complete
              await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
              
              // Resolve the logout promise if one is pending
              if (logoutSyncRef.current.resolve) {
                if (logoutSyncRef.current.timer) {
                  clearTimeout(logoutSyncRef.current.timer);
                }
                logoutSyncRef.current.resolve();
                logoutSyncRef.current = {
                  promise: null,
                  resolve: null,
                  reject: null,
                  timer: null,
                };
              }
            } catch (error) {
              console.error('Error during SIGNED_OUT handling:', error);
              // Reject the logout promise on error
              if (logoutSyncRef.current.reject) {
                if (logoutSyncRef.current.timer) {
                  clearTimeout(logoutSyncRef.current.timer);
                }
                logoutSyncRef.current.reject(error);
                logoutSyncRef.current = {
                  promise: null,
                  resolve: null,
                  reject: null,
                  timer: null,
                };
              }
            }
            return;
          }
          
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
      // Cleanup logout sync on unmount
      if (logoutSyncRef.current.timer) {
        clearTimeout(logoutSyncRef.current.timer);
      }
      logoutSyncRef.current = {
        promise: null,
        resolve: null,
        reject: null,
        timer: null,
      };
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
          // Clear any pending logout promise
          if (logoutSyncRef.current.timer) {
            clearTimeout(logoutSyncRef.current.timer);
          }
          if (logoutSyncRef.current.reject) {
            logoutSyncRef.current.reject(new Error('Previous logout cancelled'));
          }
          
          // Create new promise for this logout
          const logoutPromise = new Promise<void>((resolve, reject) => {
            logoutSyncRef.current = {
              promise: null, // Will be set below
              resolve,
              reject,
              timer: setTimeout(() => {
                reject(new Error('Logout timeout - onAuthStateChange listener did not fire'));
              }, 4000),
            };
          });
          logoutSyncRef.current.promise = logoutPromise;
          
          try {
            // Sign out from Supabase - this will trigger onAuthStateChange SIGNED_OUT
            const { error } = await supabase.auth.signOut();
            
            if (error) {
              // Clean up promise on error
              if (logoutSyncRef.current.timer) {
                clearTimeout(logoutSyncRef.current.timer);
              }
              logoutSyncRef.current = {
                promise: null,
                resolve: null,
                reject: null,
                timer: null,
              };
              throw new Error(`Failed to sign out: ${error.message}`);
            }
            
            // Wait for the onAuthStateChange listener to process SIGNED_OUT
            // and resolve the promise after clearing session and invalidating queries
            await logoutPromise;
          } catch (error) {
            // Clean up on any error
            if (logoutSyncRef.current.timer) {
              clearTimeout(logoutSyncRef.current.timer);
            }
            logoutSyncRef.current = {
              promise: null,
              resolve: null,
              reject: null,
              timer: null,
            };
            throw error;
          }
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
      // Clear query cache and redirect to login
      // The listener has already updated the cached session and invalidated queries
      queryClient.clear();
      window.location.href = '/login';
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      // Do NOT redirect or clear cache on error
      // The user should remain on the current page with their session intact
      // Surface the error to the UI so user can retry
      // TODO: Show toast/error message to user
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
