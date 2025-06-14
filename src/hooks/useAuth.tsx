import { useEffect, useState, createContext, useContext, ReactNode, useCallback, useRef } from 'react'
import { supabase, getRoleFromEmail } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { useToast } from '@/hooks/use-toast'

interface Profile {
  id: string
  full_name: string
  email: string
  role: 'citizen' | 'government_official' | 'admin'
  profile_pic_url?: string
  verified?: boolean
  bio?: string
  location?: string
  created_at: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, fullName: string, role: 'citizen' | 'government_official' | 'admin') => Promise<any>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const isMountedRef = useRef(true);
  const fetchProfileInProgressRef = useRef<string | null>(null);

  // Ref to hold the current profile state for use in callbacks without making profile a direct dep of the callback
  const profileRef = useRef<Profile | null>(null);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      console.log('Auth Provider: Component unmounted. isMountedRef set to false.');
    };
  }, []);

  const createProfile = useCallback(async (userId: string): Promise<boolean> => {
    if (!isMountedRef.current) {
      console.log(`Auth: createProfile (${userId}) - component unmounted, aborting.`);
      return false;
    }
    
    console.log(`Auth: createProfile (${userId}) - ENTERED. Mounted: ${isMountedRef.current}. Current profile via ref:`, profileRef.current?.full_name);
    let profileSet = false;

    try {
      console.log(`Auth: createProfile (${userId}) - Attempting to get user data from Supabase auth.`);
      const { data: userDataResponse, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userDataResponse.user) {
        console.error(`Auth: createProfile (${userId}) - Failed to get user data from Supabase auth. Error:`, userError);
        if (isMountedRef.current && !profileRef.current) { // Use profileRef for this check
          const criticalFallbackProfile: Profile = {
            id: userId, full_name: 'Error User', email: `user_${userId.substring(0,8)}@error.com`, role: 'citizen', verified: false, created_at: new Date().toISOString()
          };
          setProfile(criticalFallbackProfile);
          profileSet = true;
          console.log(`Auth: createProfile (${userId}) - Used CRITICAL FALLBACK profile due to getUser error. Profile ref was null.`);
        }
        return profileSet;
      }

      const currentUser = userDataResponse.user;
      const profileData = {
        id: userId,
        full_name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'User',
        email: currentUser.email || `fallback_${userId.substring(0,8)}@example.com`,
        role: (currentUser.user_metadata?.role as 'citizen' | 'government_official' | 'admin') || getRoleFromEmail(currentUser.email || '') || 'citizen'
      };

      console.log(`Auth: createProfile (${userId}) - Inserting profile into DB with data:`, profileData);
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();
      
      if (createError) {
        console.error(`Auth: createProfile (${userId}) - Error inserting profile into DB:`, createError);
        // This fallback doesn't depend on profileRef.current for its condition, so it's fine
        const fallbackProfile: Profile = {
          id: userId, full_name: profileData.full_name, email: profileData.email, role: profileData.role, verified: false, created_at: new Date().toISOString()
        };
        if (isMountedRef.current) {
          setProfile(fallbackProfile);
          profileSet = true;
          console.log(`Auth: createProfile (${userId}) - Used FALLBACK profile due to DB insert error.`);
        }
        return profileSet;
      }

      if (newProfile) {
        console.log(`Auth: createProfile (${userId}) - Profile CREATED and SET successfully from DB:`, newProfile.full_name);
        if (isMountedRef.current) {
          setProfile(newProfile);
          profileSet = true;
        }
      } else {
        console.log(`Auth: createProfile (${userId}) - Profile creation in DB did not return data. Using FALLBACK.`);
         const fallbackProfile: Profile = {
          id: userId, full_name: profileData.full_name, email: profileData.email, role: profileData.role, verified: false, created_at: new Date().toISOString()
        };
        if (isMountedRef.current) {
          setProfile(fallbackProfile);
          profileSet = true;
        }
      }
      console.log(`Auth: createProfile (${userId}) - EXITED successfully. Profile set: ${profileSet}`);
      return profileSet;

    } catch (error: any) {
      console.error(`Auth: createProfile (${userId}) - CRITICAL CATCH_BLOCK error:`, error);
      if (isMountedRef.current && !profileRef.current) { // Use profileRef for this check
          const criticalFallbackProfile: Profile = {
            id: userId, full_name: 'Exception User', email: `user_${userId.substring(0,8)}@exception.com`, role: 'citizen', verified: false, created_at: new Date().toISOString()
          };
          setProfile(criticalFallbackProfile);
          profileSet = true;
          console.log(`Auth: createProfile (${userId}) - Used CRITICAL FALLBACK profile due to CATCH_BLOCK error. Profile ref was null.`);
      }
      return profileSet;
    }
  }, []); // Stable: depends only on imports (supabase, getRoleFromEmail) and profileRef for conditional logic

  const fetchProfile = useCallback(async (userId: string) => {
    if (!isMountedRef.current) {
      console.log(`Auth: fetchProfile (${userId}) - component unmounted, aborting.`);
      return;
    }

    if (fetchProfileInProgressRef.current === userId) {
      console.log(`Auth: fetchProfile (${userId}) - Fetch already in progress for this user. Aborting duplicate call.`);
      return;
    }
    fetchProfileInProgressRef.current = userId;
    
    console.log(`Auth: fetchProfile (${userId}) - ENTERED. Mounted: ${isMountedRef.current}. Current profile via ref:`, profileRef.current?.full_name);
    let profileSuccessfullyRetrievedOrCreated = false;

    try {
      console.log(`Auth: fetchProfile (${userId}) - TRY_BLOCK_ENTERED. About to query DB. Mounted: ${isMountedRef.current}`);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      console.log(`Auth: fetchProfile (${userId}) - DB_QUERY_COMPLETED. Error: ${!!error}, Data: ${!!data}. Mounted: ${isMountedRef.current}`);
      if (error) {
        console.error(`Auth: fetchProfile (${userId}) - Error fetching profile from DB:`, error);
      }

      if (data) {
        console.log(`Auth: fetchProfile (${userId}) - Profile FOUND in DB and SET:`, data.full_name);
        if (isMountedRef.current) {
          setProfile(data); // This setProfile is fine
          profileSuccessfullyRetrievedOrCreated = true;
        }
      } else {
        console.log(`Auth: fetchProfile (${userId}) - No profile in DB. Attempting to CREATE new profile.`);
        profileSuccessfullyRetrievedOrCreated = await createProfile(userId); // createProfile is stable
        if (profileSuccessfullyRetrievedOrCreated) {
          console.log(`Auth: fetchProfile (${userId}) - Profile creation attempt SUCCEEDED (profile should be set).`);
        } else {
          console.log(`Auth: fetchProfile (${userId}) - Profile creation attempt FAILED (profile might not be set or used fallback).`);
        }
      }
    } catch (error: any) {
      console.error(`Auth: fetchProfile (${userId}) - CRITICAL CATCH_BLOCK error: ${error.message}. Mounted: ${isMountedRef.current}`);
      if (isMountedRef.current && !profileRef.current) { // Use profileRef for this check
          const emergencyFallback: Profile = {
            id: userId, full_name: 'Emergency User', email: `emergency_${userId.substring(0,8)}@example.com`, role: 'citizen', created_at: new Date().toISOString()
          };
          setProfile(emergencyFallback); // This setProfile is fine
          profileSuccessfullyRetrievedOrCreated = true; 
          console.log(`Auth: fetchProfile (${userId}) - Used EMERGENCY FALLBACK profile due to CATCH_BLOCK error. Profile ref was null.`);
      }
    } finally {
      console.log(`Auth: fetchProfile (${userId}) - FINALLY_BLOCK_ENTERED. Mounted: ${isMountedRef.current}`);
      if (isMountedRef.current) {
        setLoading(false); 
        console.log(`Auth: fetchProfile (${userId}) - setLoading(false) called in FINALLY (MOUNTED). Profile fetched/created status: ${profileSuccessfullyRetrievedOrCreated}. New loading state: false.`);
      }
      if (fetchProfileInProgressRef.current === userId) {
         fetchProfileInProgressRef.current = null; 
      }
      console.log(`Auth: fetchProfile (${userId}) - EXITED. fetchProfileInProgressRef: ${fetchProfileInProgressRef.current}`);
    }
  }, [createProfile]); // Stable: depends on stable createProfile and imports (supabase)

  useEffect(() => {
    // Set loading true at the start of the auth initialization process.
    // It will be set to false by fetchProfile or if no session is found.
    setLoading(true);
    console.log('Auth Provider: Main auth useEffect triggered. Initializing auth process.');

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMountedRef.current) {
        console.log('Auth Provider: getSession callback - component unmounted, aborting.');
        return;
      }
      console.log('Auth Provider: Initial getSession() completed.', session ? `User: ${session.user.id}` : 'No initial session.');
      if (!session?.user) {
        // If getSession shows no user, and onAuthStateChange hasn't potentially run yet.
        setUser(null);
        setProfile(null);
        setLoading(false); // Explicitly set loading to false.
        console.log('Auth Provider: Initial getSession - No active session found, ensuring user/profile null and loading false.');
      }
      // If a session exists, onAuthStateChange (event: INITIAL_SESSION) is expected to handle fetching the profile.
    }).catch(error => {
      if(isMountedRef.current) {
        console.error("Auth Provider: Error fetching initial session:", error);
        setLoading(false); // Ensure loading is false on error
      } else {
        console.log('Auth Provider: getSession().catch - component unmounted, aborting.');
      }
    });
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMountedRef.current) {
          console.log(`Auth: onAuthStateChange (event: ${event}) - component unmounted, skipping.`);
          return;
        }
        
        // Use a local variable for current loading state to avoid stale closure issues if `loading` was a dep
        const currentLoadingState = loading; 
        console.log(`Auth: onAuthStateChange - Event: ${event}, User ID: ${session?.user?.id}. Current loading state before changes: ${currentLoadingState}`);
        
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Set loading true if not already loading and a significant event occurs,
          // and no fetch is already in progress for this user.
          if (!currentLoadingState && 
              (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') &&
              fetchProfileInProgressRef.current !== session.user.id) {
            console.log(`Auth: onAuthStateChange - Event ${event} for user ${session.user.id}. Setting loading to true before fetchProfile.`);
            setLoading(true);
          }
          await fetchProfile(session.user.id); // fetchProfile handles setting loading to false.
        } else {
          setProfile(null);
          setLoading(false); 
          if (fetchProfileInProgressRef.current) {
            console.log(`Auth: onAuthStateChange - No user session, clearing fetchProfileInProgressRef for ${fetchProfileInProgressRef.current}. Event: ${event}`);
            fetchProfileInProgressRef.current = null;
          }
          console.log(`Auth: onAuthStateChange - No user session. Profile cleared, loading set to false. Event: ${event}`);
        }
      }
    );

    return () => {
      console.log('Auth Provider: Main auth useEffect cleanup. Unsubscribing from auth state changes.');
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [fetchProfile]); // fetchProfile is now stable.

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      console.log('Sign in successful')
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      })

      return data
    } catch (error: any) {
      console.error('Sign in error:', error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  const signUp = async (email: string, password: string, fullName: string, role: 'citizen' | 'government_official' | 'admin') => {
    try {
      console.log('Attempting sign up for:', email, 'with role:', role)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      })

      if (error) throw error

      console.log('Sign up successful:', data.user?.id)
      toast({
        title: "Account created!",
        description: "Welcome to CivicConnect. Your account has been created successfully.",
      })
      return data
    } catch (error: any) {
      console.error('Sign up error:', error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast({
        title: "Goodbye!",
        description: "You have been signed out successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
