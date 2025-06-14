import { useState, useEffect, useRef } from 'react'
import { supabase, Post } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

export function useEnhancedPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set())
  const [userReposts, setUserReposts] = useState<Set<string>>(new Set())
  const { user } = useAuth()
  const { toast } = useToast()
  const channelRef = useRef<any>(null)
  const mountedRef = useRef(true)
  const hasSetupSubscription = useRef(false)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    fetchPosts()
    if (user) {
      fetchUserInteractions()
    }
    
    // Only set up subscription once and only when we have a user
    if (user && !hasSetupSubscription.current) {
      setupRealtimeSubscription()
      hasSetupSubscription.current = true
    }

    return () => {
      // Only cleanup on unmount or when user changes
      if (channelRef.current) {
        console.log('Cleaning up enhanced posts subscription')
        try {
          supabase.removeChannel(channelRef.current)
        } catch (error) {
          console.log('Error removing enhanced posts channel on cleanup:', error)
        }
        channelRef.current = null
        hasSetupSubscription.current = false
      }
    }
  }, [user?.id]) // Keep user?.id dependency but use ref to prevent duplicate subscriptions

  const setupRealtimeSubscription = () => {
    // Don't create new subscription if one already exists
    if (channelRef.current || hasSetupSubscription.current) {
      console.log('Enhanced posts subscription already exists, skipping setup')
      return
    }

    const channelName = `enhanced-posts-${user?.id || 'anon'}-${Date.now()}`
    console.log('Setting up enhanced posts realtime subscription:', channelName)
    
    channelRef.current = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posts'
      }, () => {
        console.log('Enhanced posts table changed')
        if (mountedRef.current) {
          fetchPosts()
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'likes'
      }, () => {
        console.log('Enhanced posts likes table changed')
        if (mountedRef.current) {
          fetchPosts()
          if (user) fetchUserInteractions()
        }
      })
      .subscribe((status) => {
        console.log('Enhanced posts subscription status:', status)
      })
  }

  const fetchPosts = async () => {
    try {
      setLoading(true)
      
      // Fetch posts with enhanced data
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            email,
            role,
            profile_pic_url,
            verified
          )
        `)
        .in('moderation_status', ['active', 'flagged'])
        .order('created_at', { ascending: false })

      if (postsError) throw postsError

      // Fetch replies for each post
      const postsWithReplies = await Promise.all(
        (postsData || []).map(async (post) => {
          if (post.reply_count > 0) {
            const { data: replies } = await supabase
              .from('posts')
              .select(`
                *,
                profiles:user_id (
                  id,
                  full_name,
                  email,
                  role,
                  profile_pic_url,
                  verified
                )
              `)
              .eq('parent_id', post.id)
              .order('created_at', { ascending: true })
              .limit(10)
            
            return { ...post, replies: replies || [] }
          }
          return post
        })
      )

      if (mountedRef.current) {
        setPosts(postsWithReplies as Post[])
      }
    } catch (error) {
      console.error('Error fetching enhanced posts:', error)
      if (mountedRef.current) {
        toast({
          title: "Error",
          description: "Failed to load posts",
          variant: "destructive"
        })
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }

  const fetchUserInteractions = async () => {
    if (!user) return

    try {
      // Fetch user likes
      const { data: likes } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', user.id)

      if (likes && mountedRef.current) {
        setUserLikes(new Set(likes.map(like => like.post_id)))
      }

      // Fetch user reposts
      const { data: reposts } = await supabase
        .from('reposts')
        .select('post_id')
        .eq('user_id', user.id)

      if (reposts && mountedRef.current) {
        setUserReposts(new Set(reposts.map(repost => repost.post_id)))
      }
    } catch (error) {
      console.error('Error fetching user interactions:', error)
    }
  }

  const createPost = async (postData: {
    content: string
    category: string
    post_type: string
    media_urls: string[]
    location?: string
    hashtags?: string[]
    parent_id?: string
  }) => {
    try {
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('posts')
        .insert({
          content: postData.content,
          category: postData.category,
          post_type: postData.post_type,
          media_urls: postData.media_urls,
          location: postData.location,
          hashtags: postData.hashtags,
          parent_id: postData.parent_id,
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Post Created",
        description: "Your post has been shared successfully."
      })

      if (mountedRef.current) {
        fetchPosts()
      }
      return data
    } catch (error: any) {
      console.error('Error creating post:', error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
      throw error
    }
  }

  const likePost = async (postId: string) => {
    try {
      if (!user) throw new Error('User not authenticated')

      if (userLikes.has(postId)) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)

        setUserLikes(prev => {
          const newSet = new Set(prev)
          newSet.delete(postId)
          return newSet
        })
      } else {
        // Like
        await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: user.id
          })

        setUserLikes(prev => new Set([...prev, postId]))
        
        // Increment likes count
        await supabase.rpc('increment_likes', { post_id: postId })
      }

      if (mountedRef.current) {
        fetchPosts()
      }
    } catch (error: any) {
      console.error('Error liking post:', error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const repostPost = async (postId: string, comment?: string) => {
    try {
      if (!user) throw new Error('User not authenticated')

      if (userReposts.has(postId)) {
        // Remove repost
        await supabase
          .from('reposts')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)

        setUserReposts(prev => {
          const newSet = new Set(prev)
          newSet.delete(postId)
          return newSet
        })
      } else {
        // Add repost
        await supabase
          .from('reposts')
          .insert({
            post_id: postId,
            user_id: user.id,
            comment
          })

        setUserReposts(prev => new Set([...prev, postId]))
      }

      if (mountedRef.current) {
        fetchPosts()
      }
      toast({
        title: userReposts.has(postId) ? "Repost Removed" : "Reposted",
        description: userReposts.has(postId) ? "Post removed from your profile" : "Post shared to your profile"
      })
    } catch (error: any) {
      console.error('Error reposting:', error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const reportPost = async (postId: string, reason: string) => {
    try {
      if (!user) throw new Error('User not authenticated')

      await supabase
        .from('reports')
        .insert({
          post_id: postId,
          reporter_id: user.id,
          reason
        })

      toast({
        title: "Post Reported",
        description: "Thank you for helping keep our community safe."
      })
    } catch (error: any) {
      console.error('Error reporting post:', error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const deletePost = async (postId: string) => {
    try {
      if (!user) throw new Error('User not authenticated')

      await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      toast({
        title: "Post Deleted",
        description: "The post has been removed successfully."
      })

      if (mountedRef.current) {
        fetchPosts()
      }
    } catch (error: any) {
      console.error('Error deleting post:', error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  return {
    posts,
    loading,
    userLikes,
    userReposts,
    createPost,
    likePost,
    repostPost,
    reportPost,
    deletePost,
    refetch: fetchPosts
  }
}
