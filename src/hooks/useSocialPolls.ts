import { useState, useEffect, useRef } from 'react'
import { supabase, Poll, Vote } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

export function useSocialPolls() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [userVotes, setUserVotes] = useState<Vote[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()
  const pollsChannelRef = useRef<any>(null)
  const votesChannelRef = useRef<any>(null)
  const mountedRef = useRef(true)
  const subscriptionActiveRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    console.log('useSocialPolls: Initializing with user:', user?.id)
    fetchPolls()
    if (user) {
      fetchUserVotes()
    }

    // Only setup subscriptions once and when user is available
    if (user && !subscriptionActiveRef.current) {
      setupRealtimeSubscriptions()
    }

    return () => {
      cleanupSubscriptions()
    }
  }, [user?.id])

  const cleanupSubscriptions = () => {
    if (pollsChannelRef.current) {
      console.log('useSocialPolls: Cleaning up polls subscription')
      try {
        supabase.removeChannel(pollsChannelRef.current)
      } catch (error) {
        console.log('useSocialPolls: Error cleaning up polls channel:', error)
      }
      pollsChannelRef.current = null
    }
    
    if (votesChannelRef.current) {
      console.log('useSocialPolls: Cleaning up votes subscription')
      try {
        supabase.removeChannel(votesChannelRef.current)
      } catch (error) {
        console.log('useSocialPolls: Error cleaning up votes channel:', error)
      }
      votesChannelRef.current = null
    }
    
    subscriptionActiveRef.current = false
  }

  const setupRealtimeSubscriptions = () => {
    // Prevent multiple subscriptions
    if (subscriptionActiveRef.current || pollsChannelRef.current || votesChannelRef.current) {
      console.log('useSocialPolls: Subscriptions already active, skipping')
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
          console.log('useSocialPolls: Polls table changed:', payload.eventType)
          if (mountedRef.current) {
            setTimeout(() => {
              if (mountedRef.current) {
                fetchPolls()
              }
            }, 500)
          }
        })
        .subscribe((status) => {
          console.log('useSocialPolls: Polls subscription status:', status)
          if (status === 'SUBSCRIBED') {
            subscriptionActiveRef.current = true
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            console.error('useSocialPolls: Polls subscription failed')
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
          console.log('useSocialPolls: Votes table changed:', payload.eventType)
          if (mountedRef.current) {
            setTimeout(() => {
              if (mountedRef.current) {
                fetchPolls()
                if (user) fetchUserVotes()
              }
            }, 500)
          }
        })
        .subscribe((status) => {
          console.log('useSocialPolls: Votes subscription status:', status)
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            console.error('useSocialPolls: Votes subscription failed')
            if (votesChannelRef.current) {
              supabase.removeChannel(votesChannelRef.current)
              votesChannelRef.current = null
            }
          }
        })
    } catch (error) {
      console.error('useSocialPolls: Error setting up subscriptions:', error)
      cleanupSubscriptions()
    }
  }

  const fetchPolls = async () => {
    try {
      console.log('Fetching polls...')
      setLoading(true)
      
      const { data: pollsData, error: pollsError } = await supabase
        .from('polls')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (pollsError) {
        console.error('Error fetching polls:', pollsError)
        throw pollsError
      }

      if (pollsData && pollsData.length > 0) {
        const userIds = [...new Set(pollsData.map(poll => poll.user_id))]
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email, role')
          .in('id', userIds)

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError)
        }

        const pollsWithProfiles = pollsData.map(poll => ({
          ...poll,
          profiles: profilesData?.find(profile => profile.id === poll.user_id) || null
        }))

        console.log('Polls fetched successfully:', pollsWithProfiles.length)
        if (mountedRef.current) {
          setPolls(pollsWithProfiles)
        }
      } else {
        console.log('No polls found')
        if (mountedRef.current) {
          setPolls([])
        }
      }
    } catch (error) {
      console.error('Error fetching polls:', error)
      if (mountedRef.current) {
        toast({
          title: "Error",
          description: "Failed to load polls. Please try again.",
          variant: "destructive"
        })
        setPolls([])
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }

  const fetchUserVotes = async () => {
    try {
      if (!user) return

      console.log('Fetching user votes...')
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching user votes:', error)
        throw error
      }
      
      console.log('User votes fetched successfully:', data?.length || 0)
      if (mountedRef.current) {
        setUserVotes(data || [])
      }
    } catch (error) {
      console.error('Error fetching user votes:', error)
    }
  }

  const createPoll = async (question: string, options: string[], expiresAt?: string) => {
    try {
      if (!user) throw new Error('User not authenticated')

      const pollOptions = options.map((text, index) => ({
        id: `option_${index + 1}`,
        text,
        votes: 0
      }))

      console.log('Creating poll:', question)
      const { data, error } = await supabase
        .from('polls')
        .insert({
          question,
          options: pollOptions,
          expires_at: expiresAt || null,
          user_id: user.id
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating poll:', error)
        throw error
      }

      console.log('Poll created successfully:', data)
      toast({
        title: "Poll Created",
        description: "Your poll has been created successfully."
      })

      if (mountedRef.current) {
        fetchPolls()
      }
      return data
    } catch (error: any) {
      console.error('Error in createPoll:', error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
      throw error
    }
  }

  const submitVote = async (pollId: string, optionId: string) => {
    try {
      if (!user) throw new Error('User not authenticated')

      const existingVote = userVotes.find(vote => vote.poll_id === pollId)
      if (existingVote) {
        throw new Error('You have already voted on this poll')
      }

      console.log('Submitting vote:', pollId, optionId)
      const { error } = await supabase
        .from('votes')
        .insert({
          poll_id: pollId,
          user_id: user.id,
          option_id: optionId
        })

      if (error) {
        console.error('Error submitting vote:', error)
        throw error
      }

      console.log('Vote submitted successfully')
      toast({
        title: "Vote Submitted",
        description: "Your vote has been recorded successfully."
      })

      if (mountedRef.current) {
        fetchPolls()
        fetchUserVotes()
      }
    } catch (error: any) {
      console.error('Error in submitVote:', error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
      throw error
    }
  }

  const hasUserVoted = (pollId: string): boolean => {
    return userVotes.some(vote => vote.poll_id === pollId)
  }

  return {
    polls,
    userVotes,
    loading,
    createPoll,
    submitVote,
    hasUserVoted,
    refetch: fetchPolls
  }
}
