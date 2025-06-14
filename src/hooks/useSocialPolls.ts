
import { useState, useEffect, useRef } from 'react'
import { Poll, Vote } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { PollsService } from '@/services/pollsService'

export function useSocialPolls() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [userVotes, setUserVotes] = useState<Vote[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const fetchPolls = async () => {
    try {
      setLoading(true)
      const pollsData = await PollsService.fetchPolls()
      
      if (mountedRef.current) {
        setPolls(pollsData)
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
      const votes = await PollsService.fetchUserVotes(user.id)
      if (mountedRef.current) {
        setUserVotes(votes)
      }
    } catch (error) {
      console.error('Error fetching user votes:', error)
    }
  }

  useEffect(() => {
    console.log('useSocialPolls: Initializing with user:', user?.id)
    fetchPolls()
    if (user) {
      fetchUserVotes()
    }
  }, [user?.id])

  const createPoll = async (question: string, options: string[], expiresAt?: string) => {
    try {
      if (!user) throw new Error('User not authenticated')

      const data = await PollsService.createPoll(question, options, expiresAt, user.id)
      
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

      await PollsService.submitVote(pollId, optionId, user.id)
      
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
    refetch: fetchPolls,
    refetchVotes: fetchUserVotes
  }
}
