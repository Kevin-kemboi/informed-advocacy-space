
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
      // Single query to get all posts with profiles using a join
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (
            id,
            full_name,
            email,
            role,
            profile_pic_url,
            verified
          )
        `)
        .is('parent_id', null)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (postsError) throw postsError

      // Get all main post IDs for batch reply fetching
      const postIds = postsData?.map(post => post.id) || []
      
      // Single query to get all replies for all posts
      const { data: repliesData, error: repliesError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (
            id,
            full_name,
            email,
            role,
            profile_pic_url,
            verified
          )
        `)
        .in('parent_id', postIds)
        .eq('status', 'active')
        .order('created_at', { ascending: true })

      if (repliesError) throw repliesError

      // Group replies by parent_id
      const repliesByParent = (repliesData || []).reduce((acc, reply) => {
        if (!acc[reply.parent_id]) {
          acc[reply.parent_id] = []
        }
        acc[reply.parent_id].push(reply)
        return acc
      }, {} as Record<string, any[]>)

      // Combine posts with their replies
      const postsWithReplies = (postsData || []).map(post => ({
        ...post,
        replies: repliesByParent[post.id] || [],
        reply_count: (repliesByParent[post.id] || []).length
      }))

      return postsWithReplies
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
