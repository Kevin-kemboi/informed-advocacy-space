
import { useState, useEffect } from 'react'
import { supabase, Poll, PollVote } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

export function usePolls() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [userVotes, setUserVotes] = useState<PollVote[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchPolls()
    if (user) {
      fetchUserVotes()
    }

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('polls')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'polls'
      }, () => {
        fetchPolls()
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'poll_votes'
      }, () => {
        fetchPolls()
        if (user) fetchUserVotes()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  const fetchPolls = async () => {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select(`
          *,
          poll_votes (
            option_id
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Calculate vote counts for each option
      const pollsWithVotes = data?.map(poll => ({
        ...poll,
        options: poll.options.map((option: any) => ({
          ...option,
          votes: poll.poll_votes?.filter((vote: any) => vote.option_id === option.id).length || 0
        }))
      })) || []

      setPolls(pollsWithVotes)
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
        .from('poll_votes')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error
      setUserVotes(data || [])
    } catch (error) {
      console.error('Error fetching user votes:', error)
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
        .from('poll_votes')
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

  const createPoll = async (pollData: Omit<Poll, 'id' | 'created_by' | 'created_at'>) => {
    try {
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('polls')
        .insert({
          ...pollData,
          created_by: user.id
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

  return {
    polls,
    userVotes,
    loading,
    submitVote,
    createPoll,
    refetch: fetchPolls
  }
}
