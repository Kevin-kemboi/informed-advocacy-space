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
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error)
        setLoading(false)
        return
      }
      console.log('Auth Provider: Initial session:', session?.user?.id)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    }).catch((error) => {
      console.error('Auth Provider: Session fetch failed:', error)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => {
      console.log('Auth Provider: Cleanup')
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (userId: string) => {
    console.log('Auth: Starting fetchProfile for user:', userId)
    
    try {
      console.log('Auth: Attempting to fetch profile from database...')
      
      // Test basic Supabase connection first
      console.log('Auth: Testing Supabase connection...')
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
      
      console.log('Auth: Connection test result:', { testData, testError })
      
      if (testError) {
        console.error('Auth: Supabase connection failed:', testError)
        throw new Error(`Database connection failed: ${testError.message}`)
      }

      // Now try to fetch the specific profile
      console.log('Auth: Fetching profile for user ID:', userId)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      console.log('Auth: Profile query completed')
      console.log('Auth: Query result - data:', data)
      console.log('Auth: Query result - error:', error)

      if (error) {
        console.error('Auth: Database error fetching profile:', error)
        throw error
      }

      if (!data) {
        console.log('Auth: No profile found, creating new profile...')
        
        // Get user data for creating profile
        console.log('Auth: Getting user data for profile creation...')
        const { data: userData, error: userError } = await supabase.auth.getUser()
        console.log('Auth: User data result:', { userData: userData?.user?.email, userError })
        
        if (userError) {
          console.error('Auth: Error getting user data:', userError)
          throw userError
        }

        if (!userData.user) {
          console.error('Auth: No user data available for profile creation')
          throw new Error('No user data available')
        }

        const profileData = {
          id: userId,
          full_name: userData.user.user_metadata?.full_name || userData.user.email?.split('@')[0] || 'User',
          email: userData.user.email || '',
          role: 'citizen' as const
        }

        console.log('Auth: Creating new profile with data:', profileData)

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single()
        
        console.log('Auth: Profile creation result:', { newProfile, createError })
        
        if (createError) {
          console.error('Auth: Error creating profile:', createError)
          toast({
            title: "Profile Creation Error",
            description: `Failed to create profile: ${createError.message}`,
            variant: "destructive",
          })
          throw createError
        }

        console.log('Auth: Profile created successfully:', newProfile)
        setProfile(newProfile)
      } else {
        console.log('Auth: Profile fetched successfully:', data)
        setProfile(data)
      }
    } catch (error: any) {
      console.error('Auth: Critical error in fetchProfile:', error)
      console.error('Auth: Error stack:', error.stack)
      toast({
        title: "Profile Error",
        description: `Failed to load profile: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      })
      // Set profile to null but don't keep loading forever
      setProfile(null)
    } finally {
      console.log('Auth: Setting loading to false')
      setLoading(false)
    }
  }

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

  console.log('Auth Provider: Current state:', { user: user?.id, profile: profile?.full_name, loading })

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
