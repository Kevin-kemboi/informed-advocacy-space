
import { createContext, useContext, ReactNode, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { useAuthSession, AuthSessionHook } from './useAuthSession';
import { useUserProfile, UserProfileHook, Profile } from './useUserProfile';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: AuthSessionHook['signIn'];
  signUp: AuthSessionHook['signUp'];
  signOut: AuthSessionHook['signOut'];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { 
    user, 
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
  } = useUserProfile({ user, onAuthStateChangeActive });

  const loading = useMemo(() => {
    if (!onAuthStateChangeActive && loadingSession) return true;
    if (isProcessingAuthAction) return true;
    if (user && loadingProfile) return true;
    if (!user && !profile && !loadingSession && onAuthStateChangeActive) return false;
    return loadingSession || (user ? loadingProfile : false);
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
