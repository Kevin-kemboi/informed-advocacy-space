
import { supabase } from '@/lib/supabase'

export class PostsService {
  private static fetchTimeoutId: NodeJS.Timeout | null = null
  private static isFetching = false

  static async fetchPostsWithProfiles() {
    // Prevent multiple simultaneous fetches
    if (this.isFetching) {
      return null
    }

    this.isFetching = true
    
    try {
      console.log('PostsService: Starting to fetch posts with profiles...')
      
      // First, try to get posts with a simpler query to debug
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .is('parent_id', null)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      console.log('PostsService: Simple posts query result:', { 
        data: postsData, 
        error: postsError,
        count: postsData?.length 
      })

      if (postsError) {
        console.error('PostsService: Error fetching posts:', postsError)
        return []
      }

      if (!postsData || postsData.length === 0) {
        console.log('PostsService: No posts found in database')
        return []
      }

      console.log('PostsService: Found posts, now fetching profiles...')
      
      // Manually fetch profiles for each post
      const postsWithProfiles = await Promise.all(
        postsData.map(async (post) => {
          console.log('PostsService: Fetching profile for post:', post.id, 'user_id:', post.user_id)
          
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name, email, role, profile_pic_url, verified')
            .eq('id', post.user_id)
            .maybeSingle()
          
          if (profileError) {
            console.error('PostsService: Error fetching profile for user:', post.user_id, profileError)
          }
          
          console.log('PostsService: Profile result for user:', post.user_id, profile)
          
          return {
            ...post,
            profiles: profile || {
              id: post.user_id,
              full_name: 'Unknown User',
              email: '',
              role: 'citizen',
              verified: false
            }
          }
        })
      )

      // Get all main post IDs for batch reply fetching
      const postIds = postsData.map(post => post.id)
      
      if (postIds.length === 0) {
        console.log('PostsService: No main posts found')
        return []
      }
      
      console.log('PostsService: Fetching replies for posts:', postIds)
      
      // Fetch replies
      const { data: repliesData, error: repliesError } = await supabase
        .from('posts')
        .select('*')
        .in('parent_id', postIds)
        .eq('status', 'active')
        .order('created_at', { ascending: true })

      console.log('PostsService: Replies query result:', { 
        data: repliesData, 
        error: repliesError,
        count: repliesData?.length 
      })

      if (repliesError) {
        console.error('PostsService: Error fetching replies:', repliesError)
      }

      // Fetch profiles for replies
      const repliesWithProfiles = await Promise.all(
        (repliesData || []).map(async (reply) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, email, role, profile_pic_url, verified')
            .eq('id', reply.user_id)
            .maybeSingle()
          
          return {
            ...reply,
            profiles: profile || {
              id: reply.user_id,
              full_name: 'Unknown User',
              email: '',
              role: 'citizen',
              verified: false
            }
          }
        })
      )

      // Group replies by parent_id
      const repliesByParent = repliesWithProfiles.reduce((acc, reply) => {
        if (!acc[reply.parent_id]) {
          acc[reply.parent_id] = []
        }
        acc[reply.parent_id].push(reply)
        return acc
      }, {} as Record<string, any[]>)

      // Combine posts with their replies
      const postsWithReplies = postsWithProfiles.map(post => ({
        ...post,
        replies: repliesByParent[post.id] || [],
        reply_count: (repliesByParent[post.id] || []).length
      }))

      console.log('PostsService: Final posts with replies:', postsWithReplies.length)
      console.log('PostsService: Sample post:', postsWithReplies[0])
      
      return postsWithReplies
    } catch (error) {
      console.error('PostsService: Critical error in fetchPostsWithProfiles:', error)
      return []
    } finally {
      this.isFetching = false
    }
  }

  static debouncedFetch(callback: () => void, delay = 1000) {
    if (this.fetchTimeoutId) {
      clearTimeout(this.fetchTimeoutId)
    }
    
    this.fetchTimeoutId = setTimeout(() => {
      callback()
      this.fetchTimeoutId = null
    }, delay)
  }
}
