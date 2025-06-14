
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

    const fetchProfile = async (userId: string) => {
      if (!mounted) return
      
      try {
        console.log('Auth: Fetching profile for user:', userId)

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle()

        console.log('Auth: Profile query result:', { data, error })

        if (error) {
          console.error('Auth: Error fetching profile:', error)
          // Create profile if it doesn't exist
          await createProfile(userId)
          return
        }

        if (!data) {
          console.log('Auth: No profile found, creating new profile')
          await createProfile(userId)
        } else {
          console.log('Auth: Profile found:', data)
          if (mounted) {
            setProfile(data)
            setLoading(false)
          }
        }
      } catch (error: any) {
        console.error('Auth: Error in fetchProfile:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    const createProfile = async (userId: string) => {
      if (!mounted) return
      
      try {
        console.log('Auth: Creating profile for user:', userId)
        
        const { data: userData, error: userError } = await supabase.auth.getUser()
        
        if (userError || !userData.user) {
          console.error('Auth: Cannot create profile - no user data:', userError)
          if (mounted) setLoading(false)
          return
        }

        const profileData = {
          id: userId,
          full_name: userData.user.user_metadata?.full_name || 
                     userData.user.user_metadata?.name || 
                     userData.user.email?.split('@')[0] || 
                     'User',
          email: userData.user.email || '',
          role: (userData.user.user_metadata?.role as 'citizen' | 'government_official' | 'admin') || 'citizen'
        }

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single()
        
        if (createError) {
          console.error('Auth: Error creating profile:', createError)
          if (mounted) setLoading(false)
          return
        }

        console.log('Auth: Profile created successfully:', newProfile)
        if (mounted) {
          setProfile(newProfile)
          setLoading(false)
        }
      } catch (error: any) {
        console.error('Auth: Error creating profile:', error)
        if (mounted) setLoading(false)
      }
    }

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        console.log('Auth Provider: Initial session check:', { 
          sessionExists: !!session, 
          userId: session?.user?.id,
          error 
        })
        
        if (error) {
          console.error('Auth Provider: Error getting session:', error)
          if (mounted) setLoading(false)
          return
        }
        
        if (mounted) {
          setUser(session?.user ?? null)
          if (session?.user) {
            console.log('Auth Provider: Found existing session, fetching profile...')
            await fetchProfile(session.user.id)
          } else {
            console.log('Auth Provider: No existing session')
            setLoading(false)
          }
        }
      } catch (error) {
        console.error('Auth Provider: Session fetch failed:', error)
        if (mounted) setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, 'User ID:', session?.user?.id)
        
        if (!mounted) return
        
        setUser(session?.user ?? null)
        
        if (session?.user) {
          console.log('Auth: User signed in, fetching profile...')
          await fetchProfile(session.user.id)
        } else {
          console.log('Auth: User signed out')
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => {
      console.log('Auth Provider: Cleanup')
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

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

  console.log('Auth Provider: Current state:', { 
    user: user?.id, 
    profile: profile ? {
      id: profile.id,
      full_name: profile.full_name,
      email: profile.email,
      role: profile.role
    } : null, 
    loading 
  })

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
