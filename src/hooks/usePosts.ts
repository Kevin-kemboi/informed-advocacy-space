
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

  useEffect(() => {
    console.log('usePosts: Initializing with user:', user?.id)
    fetchPosts()

    // Clean up existing subscription
    if (channelRef.current && !isSubscribedRef.current) {
      try {
        supabase.removeChannel(channelRef.current)
      } catch (error) {
        console.log('Error removing existing channel:', error)
      }
      channelRef.current = null
      isSubscribedRef.current = false
    }

    // Subscribe to real-time updates
    if (!channelRef.current && !isSubscribedRef.current) {
      channelRef.current = supabase
        .channel(`posts-realtime-${Date.now()}-${Math.random()}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'posts'
        }, (payload) => {
          console.log('Posts table changed:', payload)
          fetchPosts()
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
      console.log('Fetching posts...')
      setLoading(true)
      
      // Fetch main posts (not replies) with profiles
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
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

      if (postsError) {
        console.error('Error fetching posts:', postsError)
        throw postsError
      }

      // For each post, fetch its replies
      const postsWithReplies = await Promise.all(
        (postsData || []).map(async (post) => {
          const { data: repliesData } = await supabase
            .from('posts')
            .select(`
              *,
              profiles (
                full_name,
                email,
                role,
                profile_pic_url,
                verified
              )
            `)
            .eq('parent_id', post.id)
            .eq('status', 'active')
            .order('created_at', { ascending: true })

          return {
            ...post,
            replies: repliesData || []
          }
        })
      )

      console.log('Posts fetched successfully:', postsWithReplies.length)
      setPosts(postsWithReplies)
    } catch (error) {
      console.error('Error fetching posts:', error)
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

      console.log('Creating post:', postData)
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
        console.error('Error creating post:', error)
        throw error
      }

      console.log('Post created successfully:', data)
      toast({
        title: postData.parent_id ? "Reply Posted" : "Post Created",
        description: postData.parent_id ? "Your reply has been posted successfully." : "Your post has been created successfully."
      })

      // Refresh posts after creating
      fetchPosts()
      return data
    } catch (error: any) {
      console.error('Error in createPost:', error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
      throw error
    }
  }

  return {
    posts,
    loading,
    createPost,
    refetch: fetchPosts
  }
}
