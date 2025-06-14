
import { supabase } from '@/lib/supabase'

export class PostsService {
  private static fetchTimeoutId: NodeJS.Timeout | null = null
  private static isFetching = false

  static async fetchPostsWithProfiles() {
    // Prevent multiple simultaneous fetches
    if (this.isFetching) {
      console.log('PostsService: Already fetching, skipping...')
      return null
    }

    this.isFetching = true
    
    try {
      console.log('PostsService: Starting to fetch posts with profiles...')
      
      // Debug: Check if we can access the tables
      const { data: tableCheck, error: tableError } = await supabase
        .from('posts')
        .select('count', { count: 'exact', head: true })

      console.log('PostsService: Table access check:', { 
        count: tableCheck, 
        error: tableError 
      })

      if (tableError) {
        console.error('PostsService: Cannot access posts table:', tableError)
        return []
      }

      // First, get posts with a basic query
      console.log('PostsService: Fetching basic posts...')
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .is('parent_id', null)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20)

      console.log('PostsService: Basic posts query result:', { 
        data: postsData?.length, 
        error: postsError,
        firstPost: postsData?.[0]
      })

      if (postsError) {
        console.error('PostsService: Error fetching posts:', postsError)
        return []
      }

      if (!postsData || postsData.length === 0) {
        console.log('PostsService: No posts found in database')
        
        // Debug: Check total count of posts
        const { count } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
        
        console.log('PostsService: Total posts in database:', count)
        return []
      }

      console.log('PostsService: Found posts, now fetching profiles...')
      
      // Get unique user IDs
      const userIds = [...new Set(postsData.map(post => post.user_id))]
      console.log('PostsService: Fetching profiles for users:', userIds)

      // Batch fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, profile_pic_url, verified')
        .in('id', userIds)

      console.log('PostsService: Profiles query result:', { 
        profilesCount: profilesData?.length, 
        error: profilesError,
        profiles: profilesData
      })

      // Create a map of profiles for quick lookup
      const profilesMap = new Map()
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap.set(profile.id, profile)
        })
      }

      // Manually attach profiles to posts
      const postsWithProfiles = postsData.map(post => {
        const profile = profilesMap.get(post.user_id) || {
          id: post.user_id,
          full_name: 'Unknown User',
          email: '',
          role: 'citizen',
          verified: false
        }
        
        console.log('PostsService: Attaching profile to post:', {
          postId: post.id,
          userId: post.user_id,
          profileFound: !!profilesMap.get(post.user_id),
          profileName: profile.full_name
        })
        
        return {
          ...post,
          profiles: profile
        }
      })

      // Fetch replies
      const postIds = postsData.map(post => post.id)
      console.log('PostsService: Fetching replies for posts:', postIds)
      
      const { data: repliesData, error: repliesError } = await supabase
        .from('posts')
        .select('*')
        .in('parent_id', postIds)
        .eq('status', 'active')
        .order('created_at', { ascending: true })

      console.log('PostsService: Replies query result:', { 
        repliesCount: repliesData?.length, 
        error: repliesError 
      })

      // Attach profiles to replies
      const repliesWithProfiles = (repliesData || []).map(reply => {
        const profile = profilesMap.get(reply.user_id) || {
          id: reply.user_id,
          full_name: 'Unknown User',
          email: '',
          role: 'citizen',
          verified: false
        }
        
        return {
          ...reply,
          profiles: profile
        }
      })

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

      console.log('PostsService: Final result:', {
        postsCount: postsWithReplies.length,
        firstPostWithProfile: postsWithReplies[0] ? {
          id: postsWithReplies[0].id,
          content: postsWithReplies[0].content?.substring(0, 50),
          authorName: postsWithReplies[0].profiles?.full_name,
          repliesCount: postsWithReplies[0].replies?.length
        } : null
      })
      
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
