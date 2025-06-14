
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
      }
      console.log('Auth Provider: Initial session:', session?.user?.id)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
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
    try {
      console.log('Fetching profile for user:', userId)
      setLoading(true)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        
        // If profile doesn't exist, try to create one with default values
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating default profile...')
          const { data: userData } = await supabase.auth.getUser()
          if (userData.user) {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                full_name: userData.user.user_metadata?.full_name || 'User',
                email: userData.user.email || '',
                role: 'citizen'
              })
              .select()
              .single()
            
            if (createError) {
              console.error('Error creating profile:', createError)
              toast({
                title: "Profile Error",
                description: "There was an issue creating your profile. Please contact support.",
                variant: "destructive",
              })
            } else {
              console.log('Profile created successfully:', newProfile)
              setProfile(newProfile)
            }
          }
        } else {
          toast({
            title: "Profile Error",
            description: "Failed to load profile. Please try refreshing the page.",
            variant: "destructive",
          })
        }
      } else {
        console.log('Profile fetched successfully:', data)
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast({
        title: "Error",
        description: "Failed to load profile. Please try refreshing the page.",
        variant: "destructive",
      })
    } finally {
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

  console.log('Auth Provider: Current state:', { user: user?.id, profile: profile?.id, loading })

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
