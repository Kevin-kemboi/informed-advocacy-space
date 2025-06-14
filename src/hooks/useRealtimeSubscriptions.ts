
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
  const isInitializedRef = useRef(false)

  const cleanupSubscription = () => {
    if (channelRef.current) {
      console.log('useRealtimeSubscriptions: Cleaning up subscription')
      try {
        // Use unsubscribe first, then remove channel
        channelRef.current.unsubscribe()
        supabase.removeChannel(channelRef.current)
      } catch (error) {
        console.log('useRealtimeSubscriptions: Error cleaning up channel:', error)
      }
      channelRef.current = null
    }
    isInitializedRef.current = false
  }

  const setupRealtimeSubscription = () => {
    // Prevent multiple subscriptions
    if (isInitializedRef.current || !user || !mounted) {
      console.log('useRealtimeSubscriptions: Subscription already initialized or conditions not met, skipping')
      return
    }

    // Cleanup any existing subscription first
    cleanupSubscription()
    
    try {
      // Mark as initialized immediately
      isInitializedRef.current = true
      
      // Create a unique channel name with timestamp to avoid conflicts
      const timestamp = Date.now()
      const channelName = `civic-connect-${user.id}-${timestamp}`
      console.log('useRealtimeSubscriptions: Setting up subscription:', channelName)
      
      channelRef.current = supabase
        .channel(channelName)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'posts'
        }, (payload) => {
          console.log('useRealtimeSubscriptions: Posts table changed:', payload.eventType)
          if (mounted) {
            onPostsChange()
          }
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'polls'
        }, (payload) => {
          console.log('useRealtimeSubscriptions: Polls table changed:', payload.eventType)
          if (mounted) {
            onPollsChange()
          }
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'votes'
        }, (payload) => {
          console.log('useRealtimeSubscriptions: Votes table changed:', payload.eventType)
          if (mounted) {
            onVotesChange()
          }
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'likes'
        }, (payload) => {
          console.log('useRealtimeSubscriptions: Likes table changed:', payload.eventType)
          if (mounted) {
            onPostsChange()
          }
        })
        .subscribe((status) => {
          console.log('useRealtimeSubscriptions: Subscription status:', status)
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            console.error('useRealtimeSubscriptions: Subscription failed with status:', status)
            cleanupSubscription()
          }
        })
    } catch (error) {
      console.error('useRealtimeSubscriptions: Error setting up subscription:', error)
      isInitializedRef.current = false
      channelRef.current = null
    }
  }

  useEffect(() => {
    if (user && mounted && !isInitializedRef.current) {
      setupRealtimeSubscription()
    }

    return () => {
      cleanupSubscription()
    }
  }, [user?.id, mounted])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupSubscription()
    }
  }, [])

  return { cleanupSubscription }
}
