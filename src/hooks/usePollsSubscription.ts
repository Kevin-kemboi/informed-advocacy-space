
import { useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface UsePollsSubscriptionProps {
  user: any
  onDataChange: () => void
  mounted: boolean
}

export function usePollsSubscription({ user, onDataChange, mounted }: UsePollsSubscriptionProps) {
  const pollsChannelRef = useRef<any>(null)
  const votesChannelRef = useRef<any>(null)
  const subscriptionActiveRef = useRef(false)

  const cleanupSubscriptions = () => {
    if (pollsChannelRef.current) {
      console.log('usePollsSubscription: Cleaning up polls subscription')
      try {
        supabase.removeChannel(pollsChannelRef.current)
      } catch (error) {
        console.log('usePollsSubscription: Error cleaning up polls channel:', error)
      }
      pollsChannelRef.current = null
    }
    
    if (votesChannelRef.current) {
      console.log('usePollsSubscription: Cleaning up votes subscription')
      try {
        supabase.removeChannel(votesChannelRef.current)
      } catch (error) {
        console.log('usePollsSubscription: Error cleaning up votes channel:', error)
      }
      votesChannelRef.current = null
    }
    
    subscriptionActiveRef.current = false
  }

  const setupRealtimeSubscriptions = () => {
    // Prevent multiple subscriptions
    if (subscriptionActiveRef.current || pollsChannelRef.current || votesChannelRef.current) {
      console.log('usePollsSubscription: Subscriptions already active, skipping')
      return
    }

    try {
      // Subscribe to polls changes
      const pollsChannelName = `polls-feed-${user?.id || 'anon'}-${Date.now()}`
      pollsChannelRef.current = supabase
        .channel(pollsChannelName)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'polls'
        }, (payload) => {
          console.log('usePollsSubscription: Polls table changed:', payload.eventType)
          if (mounted) {
            setTimeout(() => {
              if (mounted) {
                onDataChange()
              }
            }, 500)
          }
        })
        .subscribe((status) => {
          console.log('usePollsSubscription: Polls subscription status:', status)
          if (status === 'SUBSCRIBED') {
            subscriptionActiveRef.current = true
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            console.error('usePollsSubscription: Polls subscription failed')
            if (pollsChannelRef.current) {
              supabase.removeChannel(pollsChannelRef.current)
              pollsChannelRef.current = null
            }
          }
        })

      // Subscribe to votes changes
      const votesChannelName = `votes-feed-${user?.id || 'anon'}-${Date.now() + 1}`
      votesChannelRef.current = supabase
        .channel(votesChannelName)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'votes'
        }, (payload) => {
          console.log('usePollsSubscription: Votes table changed:', payload.eventType)
          if (mounted) {
            setTimeout(() => {
              if (mounted) {
                onDataChange()
              }
            }, 500)
          }
        })
        .subscribe((status) => {
          console.log('usePollsSubscription: Votes subscription status:', status)
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            console.error('usePollsSubscription: Votes subscription failed')
            if (votesChannelRef.current) {
              supabase.removeChannel(votesChannelRef.current)
              votesChannelRef.current = null
            }
          }
        })
    } catch (error) {
      console.error('usePollsSubscription: Error setting up subscriptions:', error)
      cleanupSubscriptions()
    }
  }

  useEffect(() => {
    if (user && !subscriptionActiveRef.current) {
      setupRealtimeSubscriptions()
    }

    return () => {
      cleanupSubscriptions()
    }
  }, [user?.id, mounted])

  return { cleanupSubscriptions }
}
