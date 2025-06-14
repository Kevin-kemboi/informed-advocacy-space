
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
      
      // Single query to get all posts with profiles using the correct foreign key relationship
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

      console.log('PostsService: Posts query result:', { data: postsData, error: postsError })

      if (postsError) {
        console.error('PostsService: Error fetching posts:', postsError)
        // Instead of throwing, let's try a simpler query
        console.log('PostsService: Trying simpler query without foreign key...')
        
        const { data: simplePosts, error: simpleError } = await supabase
          .from('posts')
          .select('*')
          .is('parent_id', null)
          .eq('status', 'active')
          .order('created_at', { ascending: false })

        if (simpleError) {
          console.error('PostsService: Simple query also failed:', simpleError)
          return []
        }

        console.log('PostsService: Simple posts query successful:', simplePosts?.length)
        
        // Manually fetch profiles for each post
        const postsWithProfiles = await Promise.all(
          (simplePosts || []).map(async (post) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, full_name, email, role, profile_pic_url, verified')
              .eq('id', post.user_id)
              .single()
            
            return {
              ...post,
              profiles: profile
            }
          })
        )

        return postsWithProfiles
      }

      // Get all main post IDs for batch reply fetching
      const postIds = postsData?.map(post => post.id) || []
      
      if (postIds.length === 0) {
        console.log('PostsService: No main posts found')
        return []
      }
      
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

      console.log('PostsService: Replies query result:', { data: repliesData, error: repliesError })

      if (repliesError) {
        console.error('PostsService: Error fetching replies:', repliesError)
        // Don't throw here, just proceed without replies
      }

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

      console.log('PostsService: Final posts with replies:', postsWithReplies.length)
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
