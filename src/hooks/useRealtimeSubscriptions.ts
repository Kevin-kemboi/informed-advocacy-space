
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

  const cleanupSubscription = () => {
    if (channelRef.current && isSubscribedRef.current) {
      console.log('useRealtimeSubscriptions: Cleaning up subscription')
      try {
        supabase.removeChannel(channelRef.current)
      } catch (error) {
        console.log('useRealtimeSubscriptions: Error cleaning up channel:', error)
      }
      channelRef.current = null
      isSubscribedRef.current = false
    }
  }

  const setupRealtimeSubscription = () => {
    // Prevent multiple subscriptions
    if (isSubscribedRef.current || !user || !mounted) {
      console.log('useRealtimeSubscriptions: Subscription already active or user/mounted not ready, skipping')
      return
    }

    try {
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

      // Subscribe only once
      if (!isSubscribedRef.current) {
        channelRef.current.subscribe((status) => {
          console.log('useRealtimeSubscriptions: Subscription status:', status)
          if (status === 'SUBSCRIBED') {
            isSubscribedRef.current = true
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            console.error('useRealtimeSubscriptions: Subscription failed with status:', status)
            isSubscribedRef.current = false
            channelRef.current = null
          }
        })
      }
    } catch (error) {
      console.error('useRealtimeSubscriptions: Error setting up subscription:', error)
      isSubscribedRef.current = false
      channelRef.current = null
    }
  }

  useEffect(() => {
    if (user && mounted && !isSubscribedRef.current) {
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
