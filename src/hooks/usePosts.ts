import { useState, useEffect, useRef } from 'react'
import { supabase, Post } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()
  const channelRef = useRef<any>(null)
  const isSubscribedRef = useRef(false)
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    console.log('usePosts: Initializing with user:', user?.id)
    fetchPosts()

    // Clean up existing subscription
    if (channelRef.current) {
      try {
        supabase.removeChannel(channelRef.current)
      } catch (error) {
        console.log('Error removing existing channel:', error)
      }
      channelRef.current = null
      isSubscribedRef.current = false
    }

    // Subscribe to real-time updates with debouncing
    if (!channelRef.current && !isSubscribedRef.current) {
      channelRef.current = supabase
        .channel(`posts-realtime-${Date.now()}-${Math.random()}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'posts'
        }, (payload) => {
          console.log('Posts table changed:', payload)
          
          // Debounce the fetch to avoid multiple rapid calls
          if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current)
          }
          
          fetchTimeoutRef.current = setTimeout(() => {
            fetchPosts()
          }, 500) // Wait 500ms before fetching
        })
        .subscribe((status) => {
          console.log('Posts subscription status:', status)
          if (status === 'SUBSCRIBED') {
            isSubscribedRef.current = true
          }
        })
    }

    return () => {
      console.log('Cleaning up posts subscription')
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current)
      }
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current)
        } catch (error) {
          console.log('Error removing channel on cleanup:', error)
        }
        channelRef.current = null
        isSubscribedRef.current = false
      }
    }
  }, [user])

  const fetchPosts = async () => {
    try {
      console.log('usePosts: Fetching posts...')
      setLoading(true)
      
      // First, fetch main posts (no parent_id)
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .is('parent_id', null)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (postsError) {
        console.error('usePosts: Error fetching posts:', postsError)
        throw postsError
      }

      console.log('usePosts: Raw posts data:', postsData)

      // Then fetch profiles separately for each post
      const postsWithProfiles = await Promise.all(
        (postsData || []).map(async (post) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, email, role, profile_pic_url, verified')
            .eq('id', post.user_id)
            .single()

          return {
            ...post,
            profiles: profileData
          }
        })
      )

      // For each post, fetch its replies with profiles
      const postsWithReplies = await Promise.all(
        postsWithProfiles.map(async (post) => {
          const { data: repliesData } = await supabase
            .from('posts')
            .select('*')
            .eq('parent_id', post.id)
            .eq('status', 'active')
            .order('created_at', { ascending: true })

          // Fetch profiles for replies too
          const repliesWithProfiles = await Promise.all(
            (repliesData || []).map(async (reply) => {
              const { data: replyProfileData } = await supabase
                .from('profiles')
                .select('full_name, email, role, profile_pic_url, verified')
                .eq('id', reply.user_id)
                .single()

              return {
                ...reply,
                profiles: replyProfileData
              }
            })
          )

          console.log(`usePosts: Replies for post ${post.id}:`, repliesWithProfiles?.length || 0)
          return {
            ...post,
            replies: repliesWithProfiles || [],
            reply_count: repliesWithProfiles?.length || 0
          }
        })
      )

      console.log('usePosts: Posts with replies:', postsWithReplies.length)
      setPosts(postsWithReplies)
    } catch (error) {
      console.error('usePosts: Error in fetchPosts:', error)
      toast({
        title: "Error",
        description: "Failed to load posts. Please try again.",
        variant: "destructive"
      })
      setPosts([])
    } finally {
      setLoading(false)
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

      // Refresh posts after creating to show the new reply
      await fetchPosts()
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

      fetchPosts()
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

      fetchPosts()
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
