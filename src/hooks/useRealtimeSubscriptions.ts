
import { useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface UseRealtimeSubscriptionsProps {
  user: any
  onPostsChange: () => void
  onPollsChange: () => void
  onVotesChange: () => void
  mounted: boolean
}

export function useRealtimeSubscriptions({ 
  user, 
  onPostsChange, 
  onPollsChange, 
  onVotesChange, 
  mounted 
}: UseRealtimeSubscriptionsProps) {
  const channelRef = useRef<any>(null)
  const isSubscribedRef = useRef(false)
  const userIdRef = useRef<string | null>(null)

  const cleanupSubscription = () => {
    if (channelRef.current) {
      console.log('useRealtimeSubscriptions: Cleaning up subscription')
      try {
        // Only unsubscribe if we actually subscribed
        if (isSubscribedRef.current) {
          channelRef.current.unsubscribe()
          isSubscribedRef.current = false
        }
        supabase.removeChannel(channelRef.current)
      } catch (error) {
        console.log('useRealtimeSubscriptions: Error cleaning up channel:', error)
      }
      channelRef.current = null
    }
    userIdRef.current = null
  }

  const setupRealtimeSubscription = () => {
    // Don't setup if conditions aren't met or if we already have a subscription for this user
    if (!user || !mounted || userIdRef.current === user.id || isSubscribedRef.current) {
      console.log('useRealtimeSubscriptions: Skipping subscription setup', {
        hasUser: !!user,
        mounted,
        currentUserId: userIdRef.current,
        newUserId: user?.id,
        isSubscribed: isSubscribedRef.current
      })
      return
    }

    // Clean up any existing subscription before creating a new one
    cleanupSubscription()

    try {
      userIdRef.current = user.id
      
      // Create a unique channel name that includes user ID and timestamp
      const channelName = `civic-connect-${user.id}-${Date.now()}`
      console.log('useRealtimeSubscriptions: Setting up subscription:', channelName)
      
      channelRef.current = supabase
        .channel(channelName)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'posts'
        }, (payload) => {
          console.log('useRealtimeSubscriptions: Posts table changed:', payload.eventType)
          if (mounted && userIdRef.current === user.id) {
            onPostsChange()
          }
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'polls'
        }, (payload) => {
          console.log('useRealtimeSubscriptions: Polls table changed:', payload.eventType)
          if (mounted && userIdRef.current === user.id) {
            onPollsChange()
          }
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'votes'
        }, (payload) => {
          console.log('useRealtimeSubscriptions: Votes table changed:', payload.eventType)
          if (mounted && userIdRef.current === user.id) {
            onVotesChange()
          }
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'likes'
        }, (payload) => {
          console.log('useRealtimeSubscriptions: Likes table changed:', payload.eventType)
          if (mounted && userIdRef.current === user.id) {
            onPostsChange()
          }
        })

      // Subscribe and track the subscription status
      channelRef.current.subscribe((status) => {
        console.log('useRealtimeSubscriptions: Subscription status:', status, 'for channel:', channelName)
        
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.error('useRealtimeSubscriptions: Subscription failed with status:', status)
          isSubscribedRef.current = false
          // Clean up on error, but only if this is still the current user
          if (userIdRef.current === user.id) {
            cleanupSubscription()
          }
        }
      })
    } catch (error) {
      console.error('useRealtimeSubscriptions: Error setting up subscription:', error)
      cleanupSubscription()
    }
  }

  useEffect(() => {
    if (user && mounted) {
      setupRealtimeSubscription()
    } else if (!user) {
      // Clean up if user is removed
      cleanupSubscription()
    }

    return cleanupSubscription
  }, [user?.id, mounted])

  // Additional cleanup on unmount
  useEffect(() => {
    return cleanupSubscription
  }, [])

  return { cleanupSubscription }
}
