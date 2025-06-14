import { useEffect, useState, createContext, useContext, ReactNode } from 'react'
import { supabase, getRoleFromEmail, validateEmailDomain } from '@/lib/supabase'
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

  useEffect(() => {
    console.log('Auth Provider: useEffect triggered. Initializing auth process.');
    
    let mounted = true

    const createProfile = async (userId: string): Promise<boolean> => {
      if (!mounted) {
        console.log(`Auth: createProfile (${userId}) - component unmounted, aborting.`);
        return false;
      }
      
      console.log(`Auth: createProfile (${userId}) - ENTERED. Mounted: ${mounted}`);
      let profileSet = false;

      try {
        console.log(`Auth: createProfile (${userId}) - Attempting to get user data from Supabase auth.`);
        const { data: userDataResponse, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userDataResponse.user) {
          console.error(`Auth: createProfile (${userId}) - Failed to get user data from Supabase auth. Error:`, userError);
          if (mounted && !profile) {
            const criticalFallbackProfile: Profile = {
              id: userId, full_name: 'Error User', email: `user_${userId.substring(0,8)}@error.com`, role: 'citizen', verified: false, created_at: new Date().toISOString()
            };
            setProfile(criticalFallbackProfile);
            profileSet = true;
            console.log(`Auth: createProfile (${userId}) - Used CRITICAL FALLBACK profile due to getUser error.`);
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
          const fallbackProfile: Profile = {
            id: userId, full_name: profileData.full_name, email: profileData.email, role: profileData.role, verified: false, created_at: new Date().toISOString()
          };
          if (mounted) {
            setProfile(fallbackProfile);
            profileSet = true;
            console.log(`Auth: createProfile (${userId}) - Used FALLBACK profile due to DB insert error.`);
          }
          return profileSet;
        }

        if (newProfile) {
          console.log(`Auth: createProfile (${userId}) - Profile CREATED and SET successfully from DB:`, newProfile.full_name);
          if (mounted) {
            setProfile(newProfile);
            profileSet = true;
          }
        } else {
          console.log(`Auth: createProfile (${userId}) - Profile creation in DB did not return data. Using FALLBACK.`);
           const fallbackProfile: Profile = {
            id: userId, full_name: profileData.full_name, email: profileData.email, role: profileData.role, verified: false, created_at: new Date().toISOString()
          };
          if (mounted) {
            setProfile(fallbackProfile);
            profileSet = true;
          }
        }
        console.log(`Auth: createProfile (${userId}) - EXITED successfully. Profile set: ${profileSet}`);
        return profileSet;

      } catch (error: any) {
        console.error(`Auth: createProfile (${userId}) - CRITICAL CATCH_BLOCK error:`, error);
        if (mounted && !profile) {
            const criticalFallbackProfile: Profile = {
              id: userId, full_name: 'Exception User', email: `user_${userId.substring(0,8)}@exception.com`, role: 'citizen', verified: false, created_at: new Date().toISOString()
            };
            setProfile(criticalFallbackProfile);
            profileSet = true;
            console.log(`Auth: createProfile (${userId}) - Used CRITICAL FALLBACK profile due to CATCH_BLOCK error.`);
        }
        return profileSet;
      }
    };

    const fetchProfile = async (userId: string) => {
      if (!mounted) {
        console.log(`Auth: fetchProfile (${userId}) - component unmounted, aborting.`);
        return;
      }
      console.log(`Auth: fetchProfile (${userId}) - ENTERED. Mounted: ${mounted}`);
      let profileSuccessfullyRetrievedOrCreated = false;

      try {
        console.log(`Auth: fetchProfile (${userId}) - TRY_BLOCK_ENTERED. About to query DB. Mounted: ${mounted}`);

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        console.log(`Auth: fetchProfile (${userId}) - DB_QUERY_COMPLETED. Error: ${!!error}, Data: ${!!data}. Mounted: ${mounted}`);
        if (error) {
          console.error(`Auth: fetchProfile (${userId}) - Error fetching profile from DB:`, error);
        }

        if (data) {
          console.log(`Auth: fetchProfile (${userId}) - Profile FOUND in DB and SET:`, data.full_name);
          if (mounted) {
            setProfile(data);
            profileSuccessfullyRetrievedOrCreated = true;
          }
        } else {
          console.log(`Auth: fetchProfile (${userId}) - No profile in DB. Attempting to CREATE new profile.`);
          profileSuccessfullyRetrievedOrCreated = await createProfile(userId);
          if (profileSuccessfullyRetrievedOrCreated) {
            console.log(`Auth: fetchProfile (${userId}) - Profile creation attempt SUCCEEDED (profile should be set).`);
          } else {
            console.log(`Auth: fetchProfile (${userId}) - Profile creation attempt FAILED (profile might not be set or used fallback).`);
          }
        }
      } catch (error: any) {
        console.error(`Auth: fetchProfile (${userId}) - CRITICAL CATCH_BLOCK error: ${error.message}. Mounted: ${mounted}`);
        if (mounted && !profile) {
            const emergencyFallback: Profile = {
              id: userId, full_name: 'Emergency User', email: `emergency_${userId.substring(0,8)}@example.com`, role: 'citizen', created_at: new Date().toISOString()
            };
            setProfile(emergencyFallback);
            profileSuccessfullyRetrievedOrCreated = true;
            console.log(`Auth: fetchProfile (${userId}) - Used EMERGENCY FALLBACK profile due to CATCH_BLOCK error.`);
        }
      } finally {
        console.log(`Auth: fetchProfile (${userId}) - FINALLY_BLOCK_ENTERED. Mounted: ${mounted}`);
        if (mounted) {
          setLoading(false); 
          console.log(`Auth: fetchProfile (${userId}) - setLoading(false) called in FINALLY (MOUNTED). Profile set status: ${profileSuccessfullyRetrievedOrCreated}. Current profile name: ${profile?.full_name}. New loading state: false.`);
        } else {
          console.log(`Auth: fetchProfile (${userId}) - FINALLY_BLOCK (UNMOUNTED). Loading state was: ${loading}. Not calling setLoading.`);
        }
      }
    };

    const initializeAuth = async () => {
      console.log('Auth Provider: initializeAuth - ENTERED.');
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('Auth Provider: initializeAuth - Session check result:', { 
          sessionExists: !!session, userId: session?.user?.id, error: !!error 
        });
        
        if (error) {
          console.error('Auth Provider: initializeAuth - Error getting session:', error);
          if (mounted) setLoading(false);
          return;
        }
        
        if (mounted) {
          setUser(session?.user ?? null);
          if (session?.user) {
            console.log('Auth Provider: initializeAuth - Existing session found. Fetching profile for user:', session.user.id);
            await fetchProfile(session.user.id);
          } else {
            console.log('Auth Provider: initializeAuth - No existing session. Setting loading to false.');
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Auth Provider: initializeAuth - CRITICAL CATCH_BLOCK error:', error);
        if (mounted) setLoading(false);
      }
      console.log('Auth Provider: initializeAuth - EXITED.');
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log(`Auth: onAuthStateChange - Event: ${event}, User ID: ${session?.user?.id}. Mounted: ${mounted}`);
        
        if (!mounted) {
          console.log('Auth: onAuthStateChange - Component unmounted, skipping updates.');
          return;
        }
        
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log(`Auth: onAuthStateChange - User event (${event}). Queueing profile fetch for user: ${session.user.id}`);
          // It's possible setLoading(true) might be needed here if not already loading,
          // but fetchProfile's finally block should manage it.
          // if (!loading) setLoading(true); // Consider if this helps, but might cause flickers.
          setTimeout(async () => {
            if (mounted) {
              console.log(`Auth: onAuthStateChange - Executing DEFERRED profile fetch for user: ${session.user!.id}`);
              await fetchProfile(session.user!.id);
            } else {
              console.log(`Auth: onAuthStateChange - Component unmounted BEFORE deferred profile fetch for user: ${session.user!.id}`);
            }
          }, 0);
        } else {
          console.log(`Auth: onAuthStateChange - User signed out event (${event}). Clearing profile and setting loading to false.`);
          setProfile(null);
          setLoading(false); 
        }
      }
    );

    return () => {
      console.log('Auth Provider: useEffect cleanup. Unsubscribing from auth state changes. Setting mounted to false.');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array ensures this runs only on mount and unmount

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
      // Profile and loading state will be handled by onAuthStateChange
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

  console.log('Auth Provider: Rendering with state:', { 
    userId: user?.id, 
    profileName: profile?.full_name, 
    profileRole: profile?.role,
    isProfileObject: !!profile,
    loading 
  });

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
