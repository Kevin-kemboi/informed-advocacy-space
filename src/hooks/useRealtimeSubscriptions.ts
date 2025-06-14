
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
  const subscriptionStateRef = useRef<'idle' | 'subscribing' | 'subscribed' | 'error'>('idle')
  const currentUserRef = useRef<string | null>(null)

  const cleanupSubscription = () => {
    if (channelRef.current && subscriptionStateRef.current !== 'idle') {
      try {
        channelRef.current.unsubscribe()
        supabase.removeChannel(channelRef.current)
      } catch (error) {
        // Silently handle cleanup errors
      }
      channelRef.current = null
    }
    subscriptionStateRef.current = 'idle'
    currentUserRef.current = null
  }

  const setupRealtimeSubscription = () => {
    // Prevent multiple subscriptions
    if (!user || !mounted || subscriptionStateRef.current !== 'idle' || currentUserRef.current === user.id) {
      return
    }

    // Clean up any existing subscription
    cleanupSubscription()

    try {
      subscriptionStateRef.current = 'subscribing'
      currentUserRef.current = user.id
      
      // Create channel with unique name
      const channelName = `civic-realtime-${user.id}-${Date.now()}`
      
      channelRef.current = supabase
        .channel(channelName)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'posts'
        }, (payload) => {
          if (mounted && currentUserRef.current === user.id && subscriptionStateRef.current === 'subscribed') {
            onPostsChange()
          }
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'polls'
        }, (payload) => {
          if (mounted && currentUserRef.current === user.id && subscriptionStateRef.current === 'subscribed') {
            onPollsChange()
          }
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'votes'
        }, (payload) => {
          if (mounted && currentUserRef.current === user.id && subscriptionStateRef.current === 'subscribed') {
            onVotesChange()
          }
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'likes'
        }, (payload) => {
          if (mounted && currentUserRef.current === user.id && subscriptionStateRef.current === 'subscribed') {
            onPostsChange()
          }
        })

      // Subscribe with status tracking
      channelRef.current.subscribe((status) => {
        if (currentUserRef.current === user.id) {
          if (status === 'SUBSCRIBED') {
            subscriptionStateRef.current = 'subscribed'
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            subscriptionStateRef.current = 'error'
            cleanupSubscription()
          }
        }
      })
    } catch (error) {
      subscriptionStateRef.current = 'error'
      cleanupSubscription()
    }
  }

  useEffect(() => {
    if (user && mounted && subscriptionStateRef.current === 'idle') {
      setupRealtimeSubscription()
    } else if (!user && subscriptionStateRef.current !== 'idle') {
      cleanupSubscription()
    }

    return cleanupSubscription
  }, [user?.id, mounted])

  // Cleanup on unmount
  useEffect(() => {
    return cleanupSubscription
  }, [])

  return { cleanupSubscription }
}
