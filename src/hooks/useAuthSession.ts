import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

export interface AuthSessionHook {
  user: User | null;
  session: Session | null;
  loadingInitial: boolean;
  isProcessingAuthAction: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, fullName: string, role: 'citizen' | 'government_official' | 'admin') => Promise<any>;
  signOut: () => Promise<void>;
  onAuthStateChangeActive: boolean;
}

export function useAuthSession(): AuthSessionHook {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isProcessingAuthAction, setIsProcessingAuthAction] = useState(false);
  const [onAuthStateChangeActive, setOnAuthStateChangeActive] = useState(false);
  const { toast } = useToast();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      console.log('useAuthSession: Unmounted');
    };
  }, []);

  useEffect(() => {
    setLoadingInitial(true);
    console.log('useAuthSession: Initializing session check.');

    // Check initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!isMountedRef.current) {
        console.log('useAuthSession: getSession cb - unmounted, aborting.');
        return;
      }
      console.log('useAuthSession: Initial getSession() completed.', initialSession ? `User: ${initialSession.user.id}` : 'No initial session.');
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      if (!initialSession?.user) {
        setLoadingInitial(false);
      }
    }).catch(error => {
      if(isMountedRef.current) {
        console.error("useAuthSession: Error fetching initial session:", error);
        setLoadingInitial(false);
      }
    });

    // Listen to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        if (!isMountedRef.current) {
          console.log(`useAuthSession: onAuthStateChange (event: ${_event}) - unmounted, skipping.`);
          return;
        }
        console.log(`useAuthSession: onAuthStateChange - Event: ${_event}, User: ${currentSession?.user?.id}`);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoadingInitial(false); 
        setOnAuthStateChangeActive(true); 
      }
    );

    return () => {
      console.log('useAuthSession: Cleaning up auth state listener.');
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
      setOnAuthStateChangeActive(false);
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setIsProcessingAuthAction(true);
    try {
      console.log('useAuthSession: Attempting sign in for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      console.log('useAuthSession: Sign in successful');
      toast({ title: "Welcome back!", description: "You have successfully signed in." });
      return data;
    } catch (error: any) {
      console.error('useAuthSession: Sign in error:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
      throw error;
    } finally {
      if (isMountedRef.current) setIsProcessingAuthAction(false);
    }
  }, [toast]);

  const signUp = useCallback(async (email: string, password: string, fullName: string, role: 'citizen' | 'government_official' | 'admin') => {
    setIsProcessingAuthAction(true);
    try {
      console.log('useAuthSession: Attempting sign up for:', email, 'with role:', role);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role: role },
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      if (error) throw error;
      console.log('useAuthSession: Sign up successful:', data.user?.id);
      toast({ title: "Account created!", description: "Welcome to CivicConnect. Your account has been created successfully." });
      return data;
    } catch (error: any) {
      console.error('useAuthSession: Sign up error:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
      throw error;
    } finally {
      if (isMountedRef.current) setIsProcessingAuthAction(false);
    }
  }, [toast]);

  const signOut = useCallback(async () => {
    setIsProcessingAuthAction(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({ title: "Goodbye!", description: "You have been signed out successfully." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      if (isMountedRef.current) setIsProcessingAuthAction(false);
    }
  }, [toast]);

  return { user, session, loadingInitial, isProcessingAuthAction, signIn, signUp, signOut, onAuthStateChangeActive };
}
