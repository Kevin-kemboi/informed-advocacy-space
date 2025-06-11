
import { useState, useEffect } from 'react'
import { supabase, Post } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    console.log('usePosts: Initializing with user:', user?.id)
    fetchPosts()
    
    // Subscribe to real-time updates with a unique channel name
    const channel = supabase
      .channel('posts-realtime-updates-v2')
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
      })

    return () => {
      console.log('Cleaning up posts subscription')
      supabase.removeChannel(channel)
    }
  }, [user])

  const fetchPosts = async () => {
    try {
      console.log('Fetching posts...')
      setLoading(true)
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            full_name,
            email,
            role
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching posts:', error)
        throw error
      }
      
      console.log('Posts fetched successfully:', data?.length || 0)
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast({
        title: "Error",
        description: "Failed to load posts. Please try again.",
        variant: "destructive"
      })
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

      // Update likes count
      await supabase.rpc('increment_likes', { post_id: postId })
      
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

  return {
    posts,
    loading,
    createPost,
    likePost,
    flagPost,
    refetch: fetchPosts
  }
}
