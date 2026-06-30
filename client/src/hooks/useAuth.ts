import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { supabasePromise } from "@/lib/supabase";
import { useEffect, useState, useRef } from "react";
import { getCachedSession, setCachedSession } from "@/lib/supabaseSession";
import { useToast } from "@/hooks/use-toast";
import i18n from "@/lib/i18n";

export function useAuth() {
  const [isSupabaseLoading, setIsSupabaseLoading] = useState(true);
  const queryClient = useQueryClient();
  const invalidatingRef = useRef(false);
  const lastEventRef = useRef<string>('');
  const { toast } = useToast();

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

        if (!supabase) {
          if (mounted) setIsSupabaseLoading(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        setCachedSession(session);

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Supabase auth state changed:', event, session ? 'Session present' : 'No session');

          if (event === 'SIGNED_OUT') {
            setCachedSession(null);
            try {
              await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
              if (logoutSyncRef.current.resolve) {
                if (logoutSyncRef.current.timer) clearTimeout(logoutSyncRef.current.timer);
                logoutSyncRef.current.resolve();
                logoutSyncRef.current = { promise: null, resolve: null, reject: null, timer: null };
              }
            } catch (error) {
              console.error('Error during SIGNED_OUT handling:', error);
              if (logoutSyncRef.current.reject) {
                if (logoutSyncRef.current.timer) clearTimeout(logoutSyncRef.current.timer);
                logoutSyncRef.current.reject(error);
                logoutSyncRef.current = { promise: null, resolve: null, reject: null, timer: null };
              }
            }
            return;
          }

          // SIGNED_IN is handled directly by loginMutation (sets query data immediately)
          // or by EmailConfirmation.tsx (which calls invalidateQueries itself).
          // Invalidating here causes a race condition: the refetch fires before
          // the mutation's onSuccess sets the data, returning null and logging the user out.
          if (event === 'SIGNED_IN') {
            setCachedSession(session);
            return;
          }

          if (lastEventRef.current === event && invalidatingRef.current) {
            console.log('Skipping duplicate auth event:', event);
            return;
          }

          lastEventRef.current = event;
          setCachedSession(session);

          if (session) {
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

        if (mounted) setIsSupabaseLoading(false);
      } catch (error) {
        console.error('Error initializing Supabase auth:', error);
        if (mounted) setIsSupabaseLoading(false);
      }
    };

    initSupabaseAuth();

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
      if (logoutSyncRef.current.timer) clearTimeout(logoutSyncRef.current.timer);
      logoutSyncRef.current = { promise: null, resolve: null, reject: null, timer: null };
    };
  }, [queryClient]);

  const { data: backendUser, isLoading: isBackendLoading, error, isError, isFetching } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 5 * 60 * 1000,
    enabled: !isSupabaseLoading,
  });

  const signOutMutation = useMutation({
    mutationFn: async () => {
      const session = getCachedSession();

      if (session) {
        const supabase = await supabasePromise;
        if (supabase) {
          if (logoutSyncRef.current.timer) clearTimeout(logoutSyncRef.current.timer);
          if (logoutSyncRef.current.reject) logoutSyncRef.current.reject(new Error('Previous logout cancelled'));

          const logoutPromise = new Promise<void>((resolve, reject) => {
            logoutSyncRef.current = {
              promise: null,
              resolve,
              reject,
              timer: setTimeout(() => {
                reject(new Error('Logout timeout'));
              }, 4000),
            };
          });
          logoutSyncRef.current.promise = logoutPromise;

          try {
            const { error } = await supabase.auth.signOut();
            if (error) {
              if (logoutSyncRef.current.timer) clearTimeout(logoutSyncRef.current.timer);
              logoutSyncRef.current = { promise: null, resolve: null, reject: null, timer: null };
              throw new Error(`Failed to sign out: ${error.message}`);
            }
            await logoutPromise;
          } catch (error) {
            if (logoutSyncRef.current.timer) clearTimeout(logoutSyncRef.current.timer);
            logoutSyncRef.current = { promise: null, resolve: null, reject: null, timer: null };
            throw error;
          }
        }
      } else {
        const response = await fetch('/api/logout', { method: 'POST' });
        if (!response.ok) throw new Error('Failed to sign out');
      }
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = '/login';
    },
    onError: (error) => {
      console.error('Logout failed:', error);
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string; username?: string }) => {
      const supabase = await supabasePromise;
      if (!supabase) throw new Error("Auth service not configured");

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email || credentials.username || '',
        password: credentials.password,
      });

      if (error) throw error;

      // Cache session immediately so API calls in this same tick have the token
      setCachedSession(data.session);

      // Fetch backend user with the new token to get the correct shape
      const response = await fetch('/api/auth/user', {
        headers: { Authorization: `Bearer ${data.session.access_token}` }
      });

      if (!response.ok) {
        // Non-fatal: return a minimal user object so navigation can proceed
        return { id: data.user.id, email: data.user.email };
      }

      return response.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/user"], user);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al iniciar sesión",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string; firstName?: string; lastName?: string }) => {
      const supabase = await supabasePromise;
      if (!supabase) throw new Error("Auth service not configured");

      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            first_name: credentials.firstName,
            last_name: credentials.lastName,
            language: i18n.language?.split('-')[0],
          }
        }
      });

      if (error) throw error;
      return data.user;
    },
    onSuccess: () => {
      // Don't set query data — user needs email verification first
    },
    onError: (error: Error) => {
      toast({
        title: "Error al registrarse",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
    loginMutation,
    registerMutation,
  };
}
