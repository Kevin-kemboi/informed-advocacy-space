
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
  const subscriptionActiveRef = useRef(false)

  const cleanupSubscription = () => {
    if (channelRef.current) {
      console.log('useRealtimeSubscriptions: Cleaning up subscription')
      try {
        supabase.removeChannel(channelRef.current)
      } catch (error) {
        console.log('useRealtimeSubscriptions: Error cleaning up channel:', error)
      }
      channelRef.current = null
      subscriptionActiveRef.current = false
    }
  }

  const setupRealtimeSubscription = () => {
    // Prevent multiple subscriptions
    if (subscriptionActiveRef.current || channelRef.current) {
      console.log('useRealtimeSubscriptions: Subscription already active, skipping')
      return
    }

    if (!user) {
      console.log('useRealtimeSubscriptions: No user, skipping subscription setup')
      return
    }

    try {
      const channelName = `civic-connect-${user.id}-${Date.now()}`
      console.log('useRealtimeSubscriptions: Setting up unified subscription:', channelName)
      
      channelRef.current = supabase
        .channel(channelName)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'posts'
        }, (payload) => {
          console.log('useRealtimeSubscriptions: Posts table changed:', payload.eventType)
          if (mounted) {
            setTimeout(() => {
              if (mounted) {
                onPostsChange()
              }
            }, 500)
          }
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'polls'
        }, (payload) => {
          console.log('useRealtimeSubscriptions: Polls table changed:', payload.eventType)
          if (mounted) {
            setTimeout(() => {
              if (mounted) {
                onPollsChange()
              }
            }, 500)
          }
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'votes'
        }, (payload) => {
          console.log('useRealtimeSubscriptions: Votes table changed:', payload.eventType)
          if (mounted) {
            setTimeout(() => {
              if (mounted) {
                onVotesChange()
              }
            }, 500)
          }
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'likes'
        }, (payload) => {
          console.log('useRealtimeSubscriptions: Likes table changed:', payload.eventType)
          if (mounted) {
            setTimeout(() => {
              if (mounted) {
                onPostsChange()
              }
            }, 500)
          }
        })
        .subscribe((status) => {
          console.log('useRealtimeSubscriptions: Subscription status:', status)
          if (status === 'SUBSCRIBED') {
            subscriptionActiveRef.current = true
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            console.error('useRealtimeSubscriptions: Subscription failed')
            cleanupSubscription()
          }
        })
    } catch (error) {
      console.error('useRealtimeSubscriptions: Error setting up subscription:', error)
      cleanupSubscription()
    }
  }

  useEffect(() => {
    if (user && !subscriptionActiveRef.current) {
      setupRealtimeSubscription()
    }

    return () => {
      cleanupSubscription()
    }
  }, [user?.id, mounted])

  return { cleanupSubscription }
}
