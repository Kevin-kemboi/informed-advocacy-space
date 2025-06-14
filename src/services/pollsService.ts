
import { supabase, Poll } from '@/lib/supabase'

export class PollsService {
  static async fetchPolls(): Promise<Poll[]> {
    console.log('Fetching polls...')
    
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
      return pollsWithProfiles
    } else {
      console.log('No polls found')
      return []
    }
  }

  static async fetchUserVotes(userId: string) {
    console.log('Fetching user votes...')
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching user votes:', error)
      throw error
    }
    
    console.log('User votes fetched successfully:', data?.length || 0)
    return data || []
  }

  static async createPoll(
    question: string, 
    options: string[], 
    expiresAt: string | null | undefined,
    userId: string
  ) {
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
        user_id: userId
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating poll:', error)
      throw error
    }

    console.log('Poll created successfully:', data)
    return data
  }

  static async submitVote(pollId: string, optionId: string, userId: string) {
    console.log('Submitting vote:', pollId, optionId)
    const { error } = await supabase
      .from('votes')
      .insert({
        poll_id: pollId,
        user_id: userId,
        option_id: optionId
      })

    if (error) {
      console.error('Error submitting vote:', error)
      throw error
    }

    console.log('Vote submitted successfully')
  }
}
