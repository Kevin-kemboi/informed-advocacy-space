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
    
    // Clean up any existing subscription first
    if (channelRef.current && !isSubscribedRef.current) {
      try {
        supabase.removeChannel(channelRef.current)
      } catch (error) {
        console.log('Error removing existing channel:', error)
      }
      channelRef.current = null
      isSubscribedRef.current = false
    }

    // Only create subscription if we don't already have one
    if (!channelRef.current && !isSubscribedRef.current) {
      // Create new subscription with a unique channel name
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
      
      // First try without profiles join to see if basic query works
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (postsError) {
        console.error('Error fetching posts:', postsError)
        throw postsError
      }

      // If we have posts, try to get profiles separately
      if (postsData && postsData.length > 0) {
        const userIds = [...new Set(postsData.map(post => post.user_id))]
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email, role')
          .in('id', userIds)

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError)
          // Continue without profiles if there's an error
        }

        // Combine posts with profiles
        const postsWithProfiles = postsData.map(post => ({
          ...post,
          profiles: profilesData?.find(profile => profile.id === post.user_id) || null
        }))

        console.log('Posts fetched successfully:', postsWithProfiles.length)
        setPosts(postsWithProfiles)
      } else {
        console.log('No posts found')
        setPosts([])
      }
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

  const createPost = async (content: string, mediaUrls: string[] = []) => {
    try {
      if (!user) throw new Error('User not authenticated')

      console.log('Creating post with content:', content)
      const { data, error } = await supabase
        .from('posts')
        .insert({
          content,
          media_urls: mediaUrls,
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
        title: "Post Created",
        description: "Your post has been shared successfully."
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

  const likePost = async (postId: string) => {
    try {
      if (!user) throw new Error('User not authenticated')

      console.log('Liking post:', postId)
      const { error } = await supabase
        .from('likes')
        .insert({
          post_id: postId,
          user_id: user.id
        })

      if (error) {
        console.error('Error liking post:', error)
        throw error
      }

      // Use the database function to increment likes count
      const { error: incrementError } = await supabase
        .rpc('increment_likes', { post_id: postId })

      if (incrementError) {
        console.error('Error incrementing likes count:', incrementError)
      }
      
      console.log('Post liked successfully')
      toast({
        title: "Post Liked",
        description: "You liked this post."
      })

      // Refresh posts to show updated like count
      fetchPosts()
    } catch (error: any) {
      console.error('Error in likePost:', error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const flagPost = async (postId: string, reason?: string) => {
    try {
      if (!user) throw new Error('User not authenticated')

      console.log('Flagging post:', postId)
      const { error } = await supabase
        .from('flags')
        .insert({
          post_id: postId,
          user_id: user.id,
          reason
        })

      if (error) {
        console.error('Error flagging post:', error)
        throw error
      }

      console.log('Post flagged successfully')
      toast({
        title: "Post Flagged",
        description: "This post has been reported for review."
      })
    } catch (error: any) {
      console.error('Error in flagPost:', error)
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

      console.log('Deleting post:', postId)
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      if (error) {
        console.error('Error deleting post:', error)
        throw error
      }

      console.log('Post deleted successfully')
      toast({
        title: "Post Deleted",
        description: "The post has been removed successfully."
      })

      // Refresh posts after deleting
      fetchPosts()
    } catch (error: any) {
      console.error('Error in deletePost:', error)
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
    createPost,
    likePost,
    flagPost,
    deletePost,
    refetch: fetchPosts
  }
}
