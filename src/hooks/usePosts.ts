import { useState, useEffect, useRef } from 'react'
import { supabase, Post } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { PostsService } from '@/services/postsService'

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()
  const channelRef = useRef<any>(null)
  const mountedRef = useRef(true)
  const retryCountRef = useRef(0)
  const maxRetries = 3
  const hasSetupSubscription = useRef(false)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    console.log('usePosts: Initializing with user:', user?.id)
    fetchPosts()

    // Only set up subscription once and only when we have a user
    if (user && !hasSetupSubscription.current) {
      setupRealtimeSubscription()
      hasSetupSubscription.current = true
    }

    return () => {
      // Only cleanup on unmount or when user changes
      if (channelRef.current) {
        console.log('Cleaning up posts subscription')
        try {
          supabase.removeChannel(channelRef.current)
        } catch (error) {
          console.log('Error removing channel on cleanup:', error)
        }
        channelRef.current = null
        hasSetupSubscription.current = false
      }
    }
  }, [user?.id]) // Keep user?.id dependency but use ref to prevent duplicate subscriptions

  const setupRealtimeSubscription = () => {
    // Don't create new subscription if one already exists
    if (channelRef.current || hasSetupSubscription.current) {
      console.log('Posts subscription already exists, skipping setup')
      return
    }

    const channelName = `posts-realtime-${user?.id || 'anon'}-${Date.now()}`
    console.log('Setting up realtime subscription:', channelName)
    
    channelRef.current = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posts'
      }, (payload) => {
        console.log('Posts table changed:', payload.eventType)
        
        // Only update if component is still mounted
        if (mountedRef.current) {
          PostsService.debouncedFetch(() => {
            if (mountedRef.current) {
              fetchPosts()
            }
          }, 1000)
        }
      })
      .subscribe((status) => {
        console.log('Posts subscription status:', status)
      })
  }

  const fetchPosts = async () => {
    try {
      console.log('usePosts: Fetching posts...')
      setLoading(true)
      retryCountRef.current = 0
      
      // Use the PostsService which has the correct query
      const postsWithReplies = await fetchWithRetry()
      
      // Only update state if component is still mounted
      if (mountedRef.current) {
        if (postsWithReplies && postsWithReplies.length > 0) {
          console.log('usePosts: Posts with replies loaded:', postsWithReplies.length)
          setPosts(postsWithReplies)
        } else {
          console.log('usePosts: No posts returned from service')
          setPosts([])
        }
      }
    } catch (error) {
      console.error('usePosts: Error in fetchPosts:', error)
      if (mountedRef.current) {
        toast({
          title: "Error",
          description: "Failed to load posts. Please try again.",
          variant: "destructive"
        })
        setPosts([])
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }

  const fetchWithRetry = async () => {
    try {
      const posts = await PostsService.fetchPostsWithProfiles()
      if (posts.length === 0 && retryCountRef.current < maxRetries) {
        retryCountRef.current++
        console.log(`usePosts: Retry ${retryCountRef.current}/${maxRetries} - No posts returned, retrying...`)
        return new Promise(resolve => {
          setTimeout(async () => {
            const retryPosts = await fetchWithRetry()
            resolve(retryPosts)
          }, 1000)
        })
      }
      return posts
    } catch (error) {
      console.error('usePosts: Error in fetchWithRetry:', error)
      throw error
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

      console.log('usePosts: Creating post:', postData)
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

      if (error) {
        console.error('usePosts: Error creating post:', error)
        throw error
      }

      console.log('usePosts: Post created successfully:', data)
      toast({
        title: postData.parent_id ? "Reply Posted" : "Post Created",
        description: postData.parent_id ? "Your reply has been posted successfully." : "Your post has been created successfully."
      })

      // Immediate refresh for better UX, but debounced to prevent conflicts
      if (mountedRef.current) {
        PostsService.debouncedFetch(() => {
          if (mountedRef.current) {
            fetchPosts()
          }
        }, 500)
      }
      
      return data
    } catch (error: any) {
      console.error('usePosts: Error in createPost:', error)
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

      console.log('usePosts: Liking post:', postId)
      const { error } = await supabase
        .from('likes')
        .insert({
          post_id: postId,
          user_id: user.id
        })

      if (error) throw error

      toast({
        title: "Post Liked",
        description: "You liked this post."
      })

      // Debounced refresh
      if (mountedRef.current) {
        PostsService.debouncedFetch(() => {
          if (mountedRef.current) {
            fetchPosts()
          }
        }, 1000)
      }
    } catch (error: any) {
      console.error('usePosts: Error liking post:', error)
      toast({
        title: "Error",
        description: "Failed to like post.",
        variant: "destructive"
      })
    }
  }

  const flagPost = async (postId: string, reason: string) => {
    try {
      if (!user) throw new Error('User not authenticated')

      console.log('usePosts: Flagging post:', postId, reason)
      const { error } = await supabase
        .from('flags')
        .insert({
          post_id: postId,
          user_id: user.id,
          reason: reason
        })

      if (error) throw error

      toast({
        title: "Post Flagged",
        description: "Thank you for reporting this content."
      })
    } catch (error: any) {
      console.error('usePosts: Error flagging post:', error)
      toast({
        title: "Error",
        description: "Failed to flag post.",
        variant: "destructive"
      })
    }
  }

  const deletePost = async (postId: string) => {
    try {
      if (!user) throw new Error('User not authenticated')

      console.log('usePosts: Deleting post:', postId)
      const { error } = await supabase
        .from('posts')
        .update({ status: 'deleted' })
        .eq('id', postId)
        .eq('user_id', user.id)

      if (error) throw error

      toast({
        title: "Post Deleted",
        description: "Your post has been deleted."
      })

      // Debounced refresh
      if (mountedRef.current) {
        PostsService.debouncedFetch(() => {
          if (mountedRef.current) {
            fetchPosts()
          }
        }, 1000)
      }
    } catch (error: any) {
      console.error('usePosts: Error deleting post:', error)
      toast({
        title: "Error",
        description: "Failed to delete post.",
        variant: "destructive"
      })
    }
  }

  return {
    posts,
    loading,
    createPost,
    likePost,
    flagPost,
    deletePost,
    refetch: fetchPosts
  }
}
