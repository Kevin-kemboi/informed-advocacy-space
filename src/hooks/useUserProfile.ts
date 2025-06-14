
import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase, getRoleFromEmail } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: 'citizen' | 'government_official' | 'admin';
  profile_pic_url?: string;
  verified?: boolean;
  bio?: string;
  location?: string;
  created_at: string;
}

interface UseUserProfileProps {
  user: User | null;
  onAuthStateChangeActive: boolean; // To trigger profile fetch after auth state settles
}

export interface UserProfileHook {
  profile: Profile | null;
  loadingProfile: boolean;
  fetchProfile: (userId: string, currentUser?: User | null) => Promise<void>;
  createProfile: (userId: string, currentUser: User) => Promise<boolean>;
}

export function useUserProfile({ user, onAuthStateChangeActive }: UseUserProfileProps): UserProfileHook {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const isMountedRef = useRef(true);
  const fetchProfileInProgressRef = useRef<string | null>(null);
  const profileRef = useRef<Profile | null>(null);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      console.log('useUserProfile: Unmounted');
    };
  }, []);

  const createProfile = useCallback(async (userId: string, currentUser: User): Promise<boolean> => {
    if (!isMountedRef.current) {
      console.log(`useUserProfile: createProfile (${userId}) - unmounted, aborting.`);
      return false;
    }
    console.log(`useUserProfile: createProfile (${userId}) - ENTERED.`);
    let profileSet = false;

    try {
      const profileData = {
        id: userId,
        full_name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'User',
        email: currentUser.email || `fallback_${userId.substring(0,8)}@example.com`,
        role: (currentUser.user_metadata?.role as Profile['role']) || getRoleFromEmail(currentUser.email || '') || 'citizen'
      };

      console.log(`useUserProfile: createProfile (${userId}) - Inserting profile into DB with data:`, profileData);
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();
      
      if (createError) {
        console.error(`useUserProfile: createProfile (${userId}) - Error inserting profile into DB:`, createError);
        const fallbackProfile: Profile = { ...profileData, verified: false, created_at: new Date().toISOString() };
        if (isMountedRef.current) setProfile(fallbackProfile);
        profileSet = true;
        return profileSet;
      }

      if (newProfile) {
        console.log(`useUserProfile: createProfile (${userId}) - Profile CREATED and SET:`, newProfile.full_name);
        if (isMountedRef.current) setProfile(newProfile);
        profileSet = true;
      } else {
         const fallbackProfile: Profile = { ...profileData, verified: false, created_at: new Date().toISOString() };
        if (isMountedRef.current) setProfile(fallbackProfile);
        profileSet = true;
      }
      return profileSet;
    } catch (error: any) {
      console.error(`useUserProfile: createProfile (${userId}) - CRITICAL CATCH_BLOCK error:`, error);
      if (isMountedRef.current && !profileRef.current) {
        const criticalFallbackProfile: Profile = {
          id: userId, full_name: 'Exception User', email: `user_${userId.substring(0,8)}@exception.com`, role: 'citizen', verified: false, created_at: new Date().toISOString()
        };
        setProfile(criticalFallbackProfile);
        profileSet = true;
      }
      return profileSet;
    }
  }, []); // Dependencies: supabase, getRoleFromEmail (imports)

  const fetchProfile = useCallback(async (userId: string, currentUser?: User | null) => {
    if (!isMountedRef.current) {
      console.log(`useUserProfile: fetchProfile (${userId}) - unmounted, aborting.`);
      return;
    }
    if (fetchProfileInProgressRef.current === userId) {
      console.log(`useUserProfile: fetchProfile (${userId}) - Fetch already in progress.`);
      return;
    }
    fetchProfileInProgressRef.current = userId;
    setLoadingProfile(true);
    console.log(`useUserProfile: fetchProfile (${userId}) - ENTERED.`);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) console.error(`useUserProfile: fetchProfile (${userId}) - Error fetching from DB:`, error);

      if (data) {
        if (isMountedRef.current) setProfile(data);
      } else if (currentUser) { // Only attempt create if currentUser details are available
        console.log(`useUserProfile: fetchProfile (${userId}) - No profile in DB. Attempting to CREATE.`);
        await createProfile(userId, currentUser);
      } else {
        console.log(`useUserProfile: fetchProfile (${userId}) - No profile in DB and no currentUser to create one.`);
         if (isMountedRef.current) setProfile(null); // Ensure profile is null if not found and cannot be created
      }
    } catch (error: any) {
      console.error(`useUserProfile: fetchProfile (${userId}) - CRITICAL CATCH_BLOCK error: ${error.message}.`);
      if (isMountedRef.current && !profileRef.current) {
          const emergencyFallback: Profile = {
            id: userId, full_name: 'Emergency User', email: `emergency_${userId.substring(0,8)}@example.com`, role: 'citizen', created_at: new Date().toISOString()
          };
          setProfile(emergencyFallback);
      }
    } finally {
      if (isMountedRef.current) setLoadingProfile(false);
      if (fetchProfileInProgressRef.current === userId) fetchProfileInProgressRef.current = null;
      console.log(`useUserProfile: fetchProfile (${userId}) - EXITED.`);
    }
  }, [createProfile]); // Dependency: createProfile

  useEffect(() => {
    // This effect now triggers profile fetching based on user changes from useAuthSession
    // and when onAuthStateChangeActive becomes true (signifying auth state has settled)
    if (user?.id && onAuthStateChangeActive) {
      console.log(`useUserProfile: User detected (${user.id}) and auth state active. Fetching profile.`);
      fetchProfile(user.id, user);
    } else if (!user && onAuthStateChangeActive) {
      console.log('useUserProfile: No user detected and auth state active. Clearing profile and stopping load.');
      if (isMountedRef.current) {
        setProfile(null);
        setLoadingProfile(false);
         if (fetchProfileInProgressRef.current) fetchProfileInProgressRef.current = null;
      }
    } else if (!user && !onAuthStateChangeActive && profile !== null) {
      // Initial state before onAuthStateChange has run, if there's somehow a stale profile
      if (isMountedRef.current) {
        setProfile(null);
      }
    }
  }, [user, fetchProfile, onAuthStateChangeActive]);


  return { profile, loadingProfile, fetchProfile, createProfile };
}
