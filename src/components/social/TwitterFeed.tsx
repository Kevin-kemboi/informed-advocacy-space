
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TwitterPostCard } from './TwitterPostCard'
import { TwitterPostComposer } from './TwitterPostComposer'
import { AnimatedBackground } from '@/components/ui/animated-background'
import { AnimatedText } from '@/components/ui/animated-text'
import { 
  TrendingUp, 
  Clock, 
  Hash, 
  Filter,
  Sparkles,
  Globe
} from 'lucide-react'
import { usePosts } from '@/hooks/usePosts'
import { useAuth } from '@/hooks/useAuth'

export function TwitterFeed() {
  const { user } = useAuth()
  const { posts, loading, createPost, likePost, flagPost, deletePost } = usePosts()
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  const handleCreatePost = async (postData: any) => {
    await createPost(postData.content, postData.media_urls)
  }

  const handleLike = async (postId: string) => {
    await likePost(postId)
  }

  const handleReply = (postId: string) => {
    console.log('Reply to:', postId)
    // Implement reply functionality
  }

  const handleRepost = (postId: string) => {
    console.log('Repost:', postId)
    // Implement repost functionality
  }

  const handleReport = async (postId: string, reason: string) => {
    await flagPost(postId, reason)
  }

  const handleDelete = async (postId: string) => {
    await deletePost(postId)
  }

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true
    return post.category === filter
  })

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    if (sortBy === 'popular') {
      return (b.likes_count + b.reply_count) - (a.likes_count + a.reply_count)
    }
    return 0
  })

  const trendingTopics = [
    { tag: 'HealthcareReform', posts: 142 },
    { tag: 'RoadSafety', posts: 89 },
    { tag: 'Education', posts: 67 },
    { tag: 'Environment', posts: 45 }
  ]

  return (
    <AnimatedBackground variant="aurora">
      <div className="min-h-screen">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200"
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <AnimatedText 
                    text="Community Voice" 
                    variant="gradient"
                    className="text-2xl font-bold"
                  />
                  <p className="text-sm text-gray-600">Share your voice, shape your community</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  <Globe className="w-3 h-3 mr-1" />
                  {posts.length} Active Posts
                </Badge>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Feed */}
            <div className="lg:col-span-3 space-y-6">
              {/* Post Composer */}
              {user && (
                <TwitterPostComposer onSubmit={handleCreatePost} />
              )}

              {/* Feed Controls */}
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <Tabs value={sortBy} onValueChange={setSortBy}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="recent" className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Recent
                      </TabsTrigger>
                      <TabsTrigger value="popular" className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Popular
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <Button
                      variant={filter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter('all')}
                    >
                      All
                    </Button>
                    {['crime', 'health', 'education', 'corruption', 'environment', 'emergency'].map((category) => (
                      <Button
                        key={category}
                        variant={filter === category ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter(category)}
                        className="capitalize"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Posts */}
              <div className="space-y-4">
                <AnimatePresence>
                  {loading ? (
                    <div className="text-center py-8">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"
                      />
                      <p className="text-gray-600 mt-2">Loading posts...</p>
                    </div>
                  ) : sortedPosts.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No posts yet. Be the first to share!</p>
                    </motion.div>
                  ) : (
                    sortedPosts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <TwitterPostCard
                          post={post}
                          onLike={handleLike}
                          onReply={handleReply}
                          onRepost={handleRepost}
                          onReport={handleReport}
                          onDelete={handleDelete}
                        />
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Trending Topics */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Hash className="w-5 h-5 text-blue-600" />
                      Trending Topics
                    </h3>
                    <div className="space-y-3">
                      {trendingTopics.map((topic, index) => (
                        <motion.div
                          key={topic.tag}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div>
                            <p className="font-medium text-blue-600">#{topic.tag}</p>
                            <p className="text-sm text-gray-500">{topic.posts} posts</p>
                          </div>
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-4">Community Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Posts</span>
                        <span className="font-bold">{posts.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active Today</span>
                        <span className="font-bold text-green-600">
                          {posts.filter(p => 
                            new Date(p.created_at).toDateString() === new Date().toDateString()
                          ).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Emergency Posts</span>
                        <span className="font-bold text-red-600">
                          {posts.filter(p => p.post_type === 'emergency').length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  )
}
