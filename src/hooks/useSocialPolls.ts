
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
    fetchPolls()
    if (user) {
      fetchUserVotes()
    }

    // Subscribe to real-time updates with unique channel names
    const pollsChannel = supabase
      .channel('polls-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'polls'
      }, () => {
        fetchPolls()
      })
      .subscribe()

    const votesChannel = supabase
      .channel('votes-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'votes'
      }, () => {
        fetchPolls()
        if (user) fetchUserVotes()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(pollsChannel)
      supabase.removeChannel(votesChannel)
    }
  }, [user])

  const fetchPolls = async () => {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select(`
          *,
          profiles:profiles!polls_user_id_fkey (
            full_name,
            email,
            role
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPolls(data || [])
    } catch (error) {
      console.error('Error fetching polls:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserVotes = async () => {
    try {
      if (!user) return

      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error
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

      if (error) throw error

      toast({
        title: "Poll Created",
        description: "Your poll has been created successfully."
      })

      return data
    } catch (error: any) {
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

      const { error } = await supabase
        .from('votes')
        .insert({
          poll_id: pollId,
          user_id: user.id,
          option_id: optionId
        })

      if (error) throw error

      toast({
        title: "Vote Submitted",
        description: "Your vote has been recorded successfully."
      })
    } catch (error: any) {
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
