
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
  const currentUserIdRef = useRef<string | null>(null)

  const cleanupSubscription = () => {
    console.log('useRealtimeSubscriptions: Starting cleanup')
    
    if (channelRef.current) {
      try {
        // Only unsubscribe if we actually subscribed
        if (isSubscribedRef.current) {
          console.log('useRealtimeSubscriptions: Unsubscribing from channel')
          channelRef.current.unsubscribe()
        }
        
        // Remove the channel from Supabase
        console.log('useRealtimeSubscriptions: Removing channel')
        supabase.removeChannel(channelRef.current)
      } catch (error) {
        console.error('useRealtimeSubscriptions: Error during cleanup:', error)
      }
      
      channelRef.current = null
    }
    
    isSubscribedRef.current = false
    currentUserIdRef.current = null
    console.log('useRealtimeSubscriptions: Cleanup completed')
  }

  const setupRealtimeSubscription = () => {
    console.log('useRealtimeSubscriptions: Setting up subscription for user:', user?.id)
    
    // Don't setup if we already have an active subscription for this user
    if (channelRef.current && isSubscribedRef.current && currentUserIdRef.current === user?.id) {
      console.log('useRealtimeSubscriptions: Subscription already exists for this user')
      return
    }

    // Clean up any existing subscription first
    if (channelRef.current) {
      console.log('useRealtimeSubscriptions: Cleaning up existing subscription before creating new one')
      cleanupSubscription()
    }

    // Create a new channel with a unique name
    const channelName = `civic-realtime-${user.id}-${Date.now()}`
    console.log('useRealtimeSubscriptions: Creating new channel:', channelName)
    
    try {
      channelRef.current = supabase
        .channel(channelName)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'posts'
        }, (payload) => {
          console.log('useRealtimeSubscriptions: Posts table changed:', payload)
          if (mounted && currentUserIdRef.current === user.id) {
            onPostsChange()
          }
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'polls'
        }, (payload) => {
          console.log('useRealtimeSubscriptions: Polls table changed:', payload)
          if (mounted && currentUserIdRef.current === user.id) {
            onPollsChange()
          }
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'votes'
        }, (payload) => {
          console.log('useRealtimeSubscriptions: Votes table changed:', payload)
          if (mounted && currentUserIdRef.current === user.id) {
            onVotesChange()
          }
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'likes'
        }, (payload) => {
          console.log('useRealtimeSubscriptions: Likes table changed:', payload)
          if (mounted && currentUserIdRef.current === user.id) {
            onPostsChange()
          }
        })

      // Subscribe only once and track the subscription status
      console.log('useRealtimeSubscriptions: Subscribing to channel...')
      channelRef.current.subscribe((status) => {
        console.log('useRealtimeSubscriptions: Subscription status:', status)
        
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true
          currentUserIdRef.current = user.id
          console.log('useRealtimeSubscriptions: Successfully subscribed')
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.error('useRealtimeSubscriptions: Subscription failed with status:', status)
          isSubscribedRef.current = false
          currentUserIdRef.current = null
          // Don't cleanup here as it might cause infinite loops
        }
      })
      
    } catch (error) {
      console.error('useRealtimeSubscriptions: Error setting up subscription:', error)
      cleanupSubscription()
    }
  }

  useEffect(() => {
    console.log('useRealtimeSubscriptions: Effect triggered', { 
      userId: user?.id, 
      mounted, 
      hasChannel: !!channelRef.current,
      isSubscribed: isSubscribedRef.current,
      currentUser: currentUserIdRef.current
    })

    if (user && mounted) {
      // Only setup if we don't have a subscription for this user
      if (!channelRef.current || !isSubscribedRef.current || currentUserIdRef.current !== user.id) {
        setupRealtimeSubscription()
      }
    } else if (!user) {
      // Clean up when user logs out
      console.log('useRealtimeSubscriptions: User logged out, cleaning up')
      cleanupSubscription()
    }

    // Cleanup function for when component unmounts or user changes
    return () => {
      if (!user || currentUserIdRef.current !== user?.id) {
        console.log('useRealtimeSubscriptions: Effect cleanup triggered')
        cleanupSubscription()
      }
    }
  }, [user?.id, mounted])

  // Additional cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('useRealtimeSubscriptions: Component unmounting, final cleanup')
      cleanupSubscription()
    }
  }, [])

  return { 
    cleanupSubscription,
    isSubscribed: isSubscribedRef.current,
    channelName: channelRef.current?.topic
  }
}
