
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
  const subscriptionIdRef = useRef<string | null>(null)

  const cleanupSubscription = () => {
    if (channelRef.current && subscriptionIdRef.current) {
      console.log('useRealtimeSubscriptions: Cleaning up subscription:', subscriptionIdRef.current)
      try {
        channelRef.current.unsubscribe()
        supabase.removeChannel(channelRef.current)
      } catch (error) {
        console.log('useRealtimeSubscriptions: Error cleaning up channel:', error)
      }
      channelRef.current = null
      subscriptionIdRef.current = null
    }
  }

  const setupRealtimeSubscription = () => {
    // Don't setup if we already have an active subscription
    if (subscriptionIdRef.current || !user || !mounted) {
      console.log('useRealtimeSubscriptions: Subscription already exists or conditions not met, skipping')
      return
    }

    try {
      // Create unique subscription ID
      const subscriptionId = `civic-connect-${user.id}-${Date.now()}-${Math.random()}`
      subscriptionIdRef.current = subscriptionId
      
      console.log('useRealtimeSubscriptions: Setting up subscription:', subscriptionId)
      
      channelRef.current = supabase
        .channel(subscriptionId)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'posts'
        }, (payload) => {
          console.log('useRealtimeSubscriptions: Posts table changed:', payload.eventType)
          if (mounted && subscriptionIdRef.current === subscriptionId) {
            onPostsChange()
          }
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'polls'
        }, (payload) => {
          console.log('useRealtimeSubscriptions: Polls table changed:', payload.eventType)
          if (mounted && subscriptionIdRef.current === subscriptionId) {
            onPollsChange()
          }
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'votes'
        }, (payload) => {
          console.log('useRealtimeSubscriptions: Votes table changed:', payload.eventType)
          if (mounted && subscriptionIdRef.current === subscriptionId) {
            onVotesChange()
          }
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'likes'
        }, (payload) => {
          console.log('useRealtimeSubscriptions: Likes table changed:', payload.eventType)
          if (mounted && subscriptionIdRef.current === subscriptionId) {
            onPostsChange()
          }
        })
        .subscribe((status) => {
          console.log('useRealtimeSubscriptions: Subscription status:', status, 'for:', subscriptionId)
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            console.error('useRealtimeSubscriptions: Subscription failed with status:', status)
            if (subscriptionIdRef.current === subscriptionId) {
              cleanupSubscription()
            }
          }
        })
    } catch (error) {
      console.error('useRealtimeSubscriptions: Error setting up subscription:', error)
      subscriptionIdRef.current = null
      channelRef.current = null
    }
  }

  useEffect(() => {
    if (user && mounted) {
      setupRealtimeSubscription()
    }

    return cleanupSubscription
  }, [user?.id, mounted])

  // Additional cleanup on unmount
  useEffect(() => {
    return cleanupSubscription
  }, [])

  return { cleanupSubscription }
}
