
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
  const isSubscribingRef = useRef(false)
  const isSubscribedRef = useRef(false)

  const cleanupSubscription = () => {
    if (channelRef.current) {
      console.log('useRealtimeSubscriptions: Cleaning up subscription')
      try {
        supabase.removeChannel(channelRef.current)
      } catch (error) {
        console.log('useRealtimeSubscriptions: Error cleaning up channel:', error)
      }
      channelRef.current = null
    }
    isSubscribingRef.current = false
    isSubscribedRef.current = false
  }

  const setupRealtimeSubscription = () => {
    // Prevent multiple subscriptions - check both subscribing and subscribed states
    if (isSubscribingRef.current || isSubscribedRef.current || !user || !mounted) {
      console.log('useRealtimeSubscriptions: Subscription already in progress or active, skipping')
      return
    }

    try {
      // Set subscribing flag immediately to prevent race conditions
      isSubscribingRef.current = true
      
      const channelName = `civic-connect-${user.id}`
      console.log('useRealtimeSubscriptions: Setting up unified subscription:', channelName)
      
      channelRef.current = supabase
        .channel(channelName, {
          config: {
            broadcast: { self: false },
            presence: { key: user.id }
          }
        })
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

      // Subscribe to the channel
      channelRef.current.subscribe((status) => {
        console.log('useRealtimeSubscriptions: Subscription status:', status)
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true
          isSubscribingRef.current = false
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.error('useRealtimeSubscriptions: Subscription failed with status:', status)
          isSubscribedRef.current = false
          isSubscribingRef.current = false
          channelRef.current = null
        }
      })
    } catch (error) {
      console.error('useRealtimeSubscriptions: Error setting up subscription:', error)
      isSubscribedRef.current = false
      isSubscribingRef.current = false
      channelRef.current = null
    }
  }

  useEffect(() => {
    if (user && mounted && !isSubscribingRef.current && !isSubscribedRef.current) {
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
