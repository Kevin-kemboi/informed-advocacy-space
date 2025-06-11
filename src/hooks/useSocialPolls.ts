
import { useState, useEffect } from 'react'
import { supabase, Poll, Vote } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

export function useSocialPolls() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [userVotes, setUserVotes] = useState<Vote[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    console.log('useSocialPolls: Initializing with user:', user?.id)
    fetchPolls()
    if (user) {
      fetchUserVotes()
    }

    // Subscribe to real-time updates with unique channel names
    const pollsChannel = supabase
      .channel('polls-realtime-updates-v2')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'polls'
      }, (payload) => {
        console.log('Polls table changed:', payload)
        fetchPolls()
      })
      .subscribe((status) => {
        console.log('Polls subscription status:', status)
      })

    const votesChannel = supabase
      .channel('votes-realtime-updates-v2')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'votes'
      }, (payload) => {
        console.log('Votes table changed:', payload)
        fetchPolls()
        if (user) fetchUserVotes()
      })
      .subscribe((status) => {
        console.log('Votes subscription status:', status)
      })

    return () => {
      console.log('Cleaning up polls and votes subscriptions')
      supabase.removeChannel(pollsChannel)
      supabase.removeChannel(votesChannel)
    }
  }, [user])

  const fetchPolls = async () => {
    try {
      console.log('Fetching polls...')
      setLoading(true)
      
      const { data, error } = await supabase
        .from('polls')
        .select(`
          *,
          profiles (
            full_name,
            email,
            role
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching polls:', error)
        throw error
      }
      
      console.log('Polls fetched successfully:', data?.length || 0)
      setPolls(data || [])
    } catch (error) {
      console.error('Error fetching polls:', error)
      toast({
        title: "Error",
        description: "Failed to load polls. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
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
      setUserVotes(data || [])
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

      // Refresh polls after creating
      fetchPolls()
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

      // Check if user already voted
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

      // Refresh data after voting
      fetchPolls()
      fetchUserVotes()
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
