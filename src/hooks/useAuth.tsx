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
    console.log('Auth Provider: Starting initialization')
    
    let mounted = true

    // createProfile should return a boolean indicating if a profile was successfully set (including fallback)
    const createProfile = async (userId: string): Promise<boolean> => {
      if (!mounted) return false;
      
      let profileSet = false;
      try {
        console.log('Auth: Creating profile for user:', userId);
        
        const { data: userDataResponse, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userDataResponse.user) {
          console.error('Auth: Cannot create profile - no user data:', userError);
          // Attempt to set a minimal fallback if user data fetch fails but we have a userId
          if (mounted && !profile) { // Check if profile is still not set
            const criticalFallbackProfile: Profile = {
              id: userId,
              full_name: 'Error User',
              email: `user_${userId.substring(0,8)}@error.com`,
              role: 'citizen',
              verified: false,
              created_at: new Date().toISOString()
            };
            setProfile(criticalFallbackProfile);
            profileSet = true;
            console.log('Auth: Using critical fallback profile in createProfile due to getUser error');
          }
          return profileSet;
        }

        const currentUser = userDataResponse.user;
        const profileData = {
          id: userId,
          full_name: currentUser.user_metadata?.full_name || 
                     currentUser.user_metadata?.name || 
                     currentUser.email?.split('@')[0] || 
                     'User',
          email: currentUser.email || '',
          role: (currentUser.user_metadata?.role as 'citizen' | 'government_official' | 'admin') || 'citizen'
        };

        console.log('Auth: Inserting profile with data:', profileData);

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single(); // Using single() here, ensure RLS allows reading the newly inserted row.
        
        if (createError) {
          console.error('Auth: Error creating profile in DB:', createError);
          const fallbackProfile: Profile = {
            id: userId,
            full_name: profileData.full_name,
            email: profileData.email,
            role: profileData.role,
            verified: false,
            created_at: new Date().toISOString()
          };
          
          if (mounted) {
            console.log('Auth: Using fallback profile after DB create error');
            setProfile(fallbackProfile);
            profileSet = true;
          }
          return profileSet;
        }

        if (newProfile) {
          console.log('Auth: Profile created successfully in DB:', newProfile);
          if (mounted) {
            setProfile(newProfile);
            profileSet = true;
          }
        } else {
          console.log('Auth: Profile creation did not return data, using fallback.');
           const fallbackProfile: Profile = {
            id: userId,
            full_name: profileData.full_name,
            email: profileData.email,
            role: profileData.role,
            verified: false,
            created_at: new Date().toISOString()
          };
          if (mounted) {
            setProfile(fallbackProfile);
            profileSet = true;
          }
        }
        return profileSet;
      } catch (error: any) {
        console.error('Auth: Critical error in createProfile function:', error);
        if (mounted && !profile) { // Check if profile is still not set
            const criticalFallbackProfile: Profile = {
              id: userId,
              full_name: 'Exception User',
              email: `user_${userId.substring(0,8)}@exception.com`,
              role: 'citizen',
              verified: false,
              created_at: new Date().toISOString()
            };
            setProfile(criticalFallbackProfile);
            profileSet = true;
            console.log('Auth: Using critical fallback profile in createProfile catch block');
        }
        return profileSet;
      }
    };

    const fetchProfile = async (userId: string) => {
      if (!mounted) return;
      
      let profileSuccessfullyRetrievedOrCreated = false;
      try {
        console.log('Auth: Fetching profile for user:', userId);

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        console.log('Auth: Profile query completed:', { data: !!data, error: !!error });

        if (error) {
          console.error('Auth: Error fetching profile from DB:', error);
          // Do not throw; proceed to attempt creation or use fallback.
        }

        if (data) {
          console.log('Auth: Profile found in DB:', data.full_name);
          if (mounted) {
            setProfile(data);
            profileSuccessfullyRetrievedOrCreated = true;
          }
        } else {
          console.log('Auth: No profile found in DB, attempting to create new profile.');
          profileSuccessfullyRetrievedOrCreated = await createProfile(userId);
          if (profileSuccessfullyRetrievedOrCreated) {
            console.log('Auth: Profile creation attempt resulted in profile being set.');
          } else {
            console.log('Auth: Profile creation attempt did not result in profile being set.');
          }
        }
      } catch (error: any) {
        console.error('Auth: Critical error in fetchProfile function:', error);
        // If a truly unexpected error occurs, we might still want a fallback.
        if (mounted && !profile) { // Check if profile is still not set
            const emergencyFallback: Profile = {
              id: userId, full_name: 'Emergency User', email: '', role: 'citizen', created_at: new Date().toISOString()
            };
            setProfile(emergencyFallback);
            profileSuccessfullyRetrievedOrCreated = true;
            console.log('Auth: Set emergency fallback in fetchProfile catch.');
        }
      } finally {
        if (mounted) {
          console.log('Auth: fetchProfile finally block. Profile set status:', profileSuccessfullyRetrievedOrCreated, 'Current profile state name:', profile?.full_name);
          setLoading(false); 
          console.log('Auth: setLoading(false) in fetchProfile finally. New loading state:', false);
        }
      }
    };

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('Auth Provider: Initial session check:', { 
          sessionExists: !!session, 
          userId: session?.user?.id,
          error: !!error 
        });
        
        if (error) {
          console.error('Auth Provider: Error getting session:', error);
          if (mounted) setLoading(false);
          return;
        }
        
        if (mounted) {
          setUser(session?.user ?? null);
          if (session?.user) {
            console.log('Auth Provider: Found existing session, fetching profile for user:', session.user.id);
            await fetchProfile(session.user.id); // fetchProfile will handle setLoading(false)
          } else {
            console.log('Auth Provider: No existing session.');
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Auth Provider: Session fetch failed:', error);
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => { // Removed async
        console.log('Auth state changed:', event, 'User ID:', session?.user?.id);
        
        if (!mounted) {
          console.log('Auth: onAuthStateChange - component unmounted, skipping updates.');
          return;
        }
        
        setUser(session?.user ?? null); // Synchronous update
        
        if (session?.user) {
          console.log('Auth: User event (signed in/token refreshed), queueing profile fetch for user:', session.user.id);
          setTimeout(async () => {
            if (mounted) { // Re-check mounted inside timeout
              console.log('Auth: Executing deferred profile fetch for user:', session.user!.id);
              await fetchProfile(session.user!.id); // fetchProfile handles its own setLoading(false)
            } else {
              console.log('Auth: Component unmounted before deferred profile fetch for user:', session.user!.id);
            }
          }, 0);
        } else {
          console.log('Auth: User signed out event. Clearing profile and setting loading to false.');
          setProfile(null);
          setLoading(false); 
        }
      }
    );

    return () => {
      console.log('Auth Provider: Cleanup. Unsubscribing from auth state changes.');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
    user: user?.id, 
    profileName: profile?.full_name, 
    profileRole: profile?.role,
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
