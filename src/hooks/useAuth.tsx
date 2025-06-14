
import { createContext, useContext, ReactNode, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { useAuthSession, AuthSessionHook } from './useAuthSession';
import { useUserProfile, UserProfileHook, Profile } from './useUserProfile';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean; // Combined loading state
  signIn: AuthSessionHook['signIn'];
  signUp: AuthSessionHook['signUp'];
  signOut: AuthSessionHook['signOut'];
  // Potentially expose fetchProfile if needed externally, though it's mostly internal now
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { 
    user, 
    // session, // session object is not directly exposed in context anymore, but used internally
    loadingInitial: loadingSession, 
    isProcessingAuthAction,
    signIn, 
    signUp, 
    signOut,
    onAuthStateChangeActive
  } = useAuthSession();

  const { 
    profile, 
    loadingProfile,
    // fetchProfile, // Not exposed directly to context for now
    // createProfile, // Not exposed directly to context for now
  } = useUserProfile({ user, onAuthStateChangeActive });

  // Combined loading state:
  // True if initial session is loading OR profile is loading OR an auth action is in progress.
  // onAuthStateChangeActive helps ensure we don't flash loading states unnecessarily before auth is settled.
  const loading = useMemo(() => {
    if (!onAuthStateChangeActive && loadingSession) return true; // Still waiting for initial auth events
    if (isProcessingAuthAction) return true; // Auth action like login/signup in progress
    if (user && loadingProfile) return true; // User exists, but profile is still loading
    if (!user && !profile && !loadingSession && onAuthStateChangeActive) return false; // No user, no profile, auth settled, not loading
    return loadingSession || (user ? loadingProfile : false); // General case
  }, [loadingSession, loadingProfile, isProcessingAuthAction, user, profile, onAuthStateChangeActive]);


  const value = useMemo(() => ({
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
  }), [user, profile, loading, signIn, signUp, signOut]);

  console.log('AuthProvider: Rendering with state:', { 
    userId: user?.id, 
    profileName: profile?.full_name, 
    loading, 
    loadingSession, 
    loadingProfile, 
    isProcessingAuthAction,
    onAuthStateChangeActive
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
