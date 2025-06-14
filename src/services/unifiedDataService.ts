
import { supabase } from '@/lib/supabase'

export class UnifiedDataService {
  // Fetch all posts with unified structure for all dashboards
  static async fetchAllPosts() {
    try {
      console.log('UnifiedDataService: Fetching all posts...')
      
      // First, let's check if there are any posts at all
      const { data: allPosts, error: allPostsError } = await supabase
        .from('posts')
        .select('*')
        .limit(10)

      console.log('UnifiedDataService: Total posts in database:', allPosts?.length || 0)
      if (allPostsError) {
        console.error('UnifiedDataService: Error fetching basic posts:', allPostsError)
      }

      // Get posts with profiles using the proper foreign key relationship
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_profiles_fkey (
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
        .limit(50)

      if (postsError) {
        console.error('UnifiedDataService: Error fetching posts with profiles:', postsError)
        
        // Fallback: try to fetch posts without the foreign key join
        console.log('UnifiedDataService: Trying fallback method...')
        const { data: fallbackPosts, error: fallbackError } = await supabase
          .from('posts')
          .select('*')
          .is('parent_id', null)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(50)

        if (fallbackError) {
          console.error('UnifiedDataService: Fallback also failed:', fallbackError)
          return []
        }

        if (!fallbackPosts || fallbackPosts.length === 0) {
          console.log('UnifiedDataService: No posts found in fallback')
          return []
        }

        // Manually fetch profiles for fallback posts
        const userIds = [...new Set(fallbackPosts.map(post => post.user_id))]
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, email, role, profile_pic_url, verified')
          .in('id', userIds)

        const profilesMap = (profilesData || []).reduce((acc, profile) => {
          acc[profile.id] = profile
          return acc
        }, {} as Record<string, any>)

        // Combine posts with profiles manually
        const postsWithProfiles = fallbackPosts.map(post => ({
          ...post,
          profiles: profilesMap[post.user_id] || null
        }))

        console.log('UnifiedDataService: Fallback posts with profiles:', postsWithProfiles.length)
        return postsWithProfiles
      }

      if (!postsData || postsData.length === 0) {
        console.log('UnifiedDataService: No posts found')
        return []
      }

      console.log('UnifiedDataService: Found posts:', postsData.length)

      // Get replies for all posts
      const postIds = postsData.map(post => post.id)
      const { data: repliesData } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_profiles_fkey (
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

      // Group replies by parent_id
      const repliesByParent = (repliesData || []).reduce((acc, reply) => {
        if (!acc[reply.parent_id]) {
          acc[reply.parent_id] = []
        }
        acc[reply.parent_id].push(reply)
        return acc
      }, {} as Record<string, any[]>)

      // Combine posts with their replies
      const postsWithReplies = postsData.map(post => ({
        ...post,
        replies: repliesByParent[post.id] || [],
        reply_count: (repliesByParent[post.id] || []).length
      }))

      console.log('UnifiedDataService: Posts with replies processed:', postsWithReplies.length)
      return postsWithReplies
    } catch (error) {
      console.error('UnifiedDataService: Critical error:', error)
      return []
    }
  }

  // Get posts filtered by category (for government dashboard)
  static async fetchPostsByCategory(category: string) {
    const allPosts = await this.fetchAllPosts()
    return allPosts.filter(post => post.category === category)
  }

  // Get posts by priority/urgency (for government dashboard)
  static async fetchPostsByPriority() {
    const allPosts = await this.fetchAllPosts()
    
    // Categorize by urgency based on category and keywords
    const emergencyKeywords = ['emergency', 'urgent', 'help', 'danger', 'fire', 'accident']
    
    return allPosts.map(post => {
      let priority = 'low'
      
      if (post.category === 'emergency') {
        priority = 'critical'
      } else if (post.category === 'crime' || post.category === 'health') {
        priority = 'high'
      } else if (emergencyKeywords.some(keyword => 
        post.content.toLowerCase().includes(keyword)
      )) {
        priority = 'high'
      }
      
      return { ...post, priority }
    }).sort((a, b) => {
      const priorityOrder = { critical: 3, high: 2, medium: 1, low: 0 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  // Get analytics data based on real posts
  static async getAnalyticsData() {
    const allPosts = await this.fetchAllPosts()
    
    const categoryStats = allPosts.reduce((acc, post) => {
      acc[post.category] = (acc[post.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalPosts = allPosts.length
    const totalReplies = allPosts.reduce((sum, post) => sum + (post.reply_count || 0), 0)
    const totalLikes = allPosts.reduce((sum, post) => sum + (post.likes_count || 0), 0)

    const recentPosts = allPosts.filter(post => {
      const postDate = new Date(post.created_at)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return postDate > yesterday
    }).length

    return {
      totalPosts,
      totalReplies,
      totalLikes,
      recentPosts,
      categoryStats,
      engagementRate: totalPosts > 0 ? ((totalReplies + totalLikes) / totalPosts * 100).toFixed(1) : '0'
    }
  }

  // Create a new post
  static async createPost(postData: {
    content: string
    category: string
    post_type: string
    media_urls: string[]
    location?: string
    hashtags?: string[]
    parent_id?: string
    user_id: string
  }) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single()

      if (error) throw error

      console.log('UnifiedDataService: Post created successfully:', data)
      return data
    } catch (error) {
      console.error('UnifiedDataService: Error creating post:', error)
      throw error
    }
  }

  // Create a reply to a post
  static async createReply(parentId: string, content: string, userId: string) {
    return this.createPost({
      content,
      category: 'general',
      post_type: 'opinion',
      media_urls: [],
      parent_id: parentId,
      user_id: userId
    })
  }
}
