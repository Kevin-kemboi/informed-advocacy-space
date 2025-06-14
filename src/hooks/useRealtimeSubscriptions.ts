
import { useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface UseRealtimeSubscriptionsProps {
  user: any
  onPostsChange: () => void
  onPollsChange: () => void
  onVotesChange: () => void
  mounted: boolean
}

// Global singleton to prevent multiple subscriptions
class RealtimeManager {
  private static instance: RealtimeManager
  private channel: any = null
  private isSubscribed = false
  private subscribers = new Set<string>()
  private callbacks = new Map<string, {
    onPostsChange: () => void
    onPollsChange: () => void
    onVotesChange: () => void
  }>()
  private currentUserId: string | null = null

  static getInstance(): RealtimeManager {
    if (!RealtimeManager.instance) {
      RealtimeManager.instance = new RealtimeManager()
    }
    return RealtimeManager.instance
  }

  subscribe(
    subscriberId: string, 
    userId: string, 
    callbacks: {
      onPostsChange: () => void
      onPollsChange: () => void
      onVotesChange: () => void
    }
  ) {
    console.log('RealtimeManager: Subscribe request from:', subscriberId, 'for user:', userId)
    
    // Store callbacks for this subscriber
    this.callbacks.set(subscriberId, callbacks)
    this.subscribers.add(subscriberId)

    // If we need to create/recreate subscription for new user
    if (!this.channel || !this.isSubscribed || this.currentUserId !== userId) {
      this.cleanup()
      this.createSubscription(userId)
    }
  }

  unsubscribe(subscriberId: string) {
    console.log('RealtimeManager: Unsubscribe request from:', subscriberId)
    
    this.subscribers.delete(subscriberId)
    this.callbacks.delete(subscriberId)

    // If no more subscribers, cleanup everything
    if (this.subscribers.size === 0) {
      console.log('RealtimeManager: No more subscribers, cleaning up')
      this.cleanup()
    }
  }

  private createSubscription(userId: string) {
    if (this.isSubscribed && this.channel) {
      console.log('RealtimeManager: Already subscribed, skipping')
      return
    }

    console.log('RealtimeManager: Creating new subscription for user:', userId)
    
    try {
      const channelName = `civic-realtime-${userId}-${Date.now()}`
      
      this.channel = supabase
        .channel(channelName)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'posts'
        }, (payload) => {
          console.log('RealtimeManager: Posts table changed:', payload)
          this.notifySubscribers('posts')
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'polls'
        }, (payload) => {
          console.log('RealtimeManager: Polls table changed:', payload)
          this.notifySubscribers('polls')
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'votes'
        }, (payload) => {
          console.log('RealtimeManager: Votes table changed:', payload)
          this.notifySubscribers('votes')
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'likes'
        }, (payload) => {
          console.log('RealtimeManager: Likes table changed:', payload)
          this.notifySubscribers('posts')
        })

      this.channel.subscribe((status: string) => {
        console.log('RealtimeManager: Subscription status:', status)
        
        if (status === 'SUBSCRIBED') {
          this.isSubscribed = true
          this.currentUserId = userId
          console.log('RealtimeManager: Successfully subscribed')
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.error('RealtimeManager: Subscription failed with status:', status)
          this.isSubscribed = false
          this.currentUserId = null
        }
      })
      
    } catch (error) {
      console.error('RealtimeManager: Error creating subscription:', error)
      this.cleanup()
    }
  }

  private notifySubscribers(type: 'posts' | 'polls' | 'votes') {
    this.callbacks.forEach((callbacks) => {
      try {
        switch (type) {
          case 'posts':
            callbacks.onPostsChange()
            break
          case 'polls':
            callbacks.onPollsChange()
            break
          case 'votes':
            callbacks.onVotesChange()
            break
        }
      } catch (error) {
        console.error('RealtimeManager: Error in callback:', error)
      }
    })
  }

  private cleanup() {
    console.log('RealtimeManager: Cleaning up subscription')
    
    if (this.channel) {
      try {
        if (this.isSubscribed) {
          this.channel.unsubscribe()
        }
        supabase.removeChannel(this.channel)
      } catch (error) {
        console.error('RealtimeManager: Error during cleanup:', error)
      }
      
      this.channel = null
    }
    
    this.isSubscribed = false
    this.currentUserId = null
  }
}

export function useRealtimeSubscriptions({ 
  user, 
  onPostsChange, 
  onPollsChange, 
  onVotesChange, 
  mounted 
}: UseRealtimeSubscriptionsProps) {
  const subscriberIdRef = useRef(`subscriber-${Math.random().toString(36).substr(2, 9)}`)
  const managerRef = useRef(RealtimeManager.getInstance())

  useEffect(() => {
    const subscriberId = subscriberIdRef.current
    
    console.log('useRealtimeSubscriptions: Effect triggered', { 
      subscriberId,
      userId: user?.id, 
      mounted
    })

    if (user && mounted) {
      managerRef.current.subscribe(subscriberId, user.id, {
        onPostsChange,
        onPollsChange,
        onVotesChange
      })
    }

    return () => {
      console.log('useRealtimeSubscriptions: Cleanup for subscriber:', subscriberId)
      managerRef.current.unsubscribe(subscriberId)
    }
  }, [user?.id, mounted, onPostsChange, onPollsChange, onVotesChange])

  return { 
    isSubscribed: true, // Simplified return since manager handles the state
    channelName: 'managed-by-singleton'
  }
}
