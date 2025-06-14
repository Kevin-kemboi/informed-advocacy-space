
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, Repeat2, Share, Flag, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { GlareCard } from '@/components/ui/glare-card'
import { CountUp } from '@/components/ui/count-up'
import { formatTimeAgo, getCategoryColor, getRoleBadgeColor } from '@/lib/supabase'
import type { Post } from '@/lib/supabase'

interface EnhancedPostCardProps {
  post: Post
  onLike?: () => void
  onReply?: () => void
  onRepost?: () => void
  onShare?: () => void
  onReport?: () => void
}

export function EnhancedPostCard({ 
  post, 
  onLike, 
  onReply, 
  onRepost, 
  onShare, 
  onReport 
}: EnhancedPostCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isReposted, setIsReposted] = useState(false)

  const handleLike = () => {
    setIsLiked(!isLiked)
    onLike?.()
  }

  const handleRepost = () => {
    setIsReposted(!isReposted)
    onRepost?.()
  }

  return (
    <GlareCard className="mb-4 transition-all duration-300 hover:shadow-xl">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start space-x-3 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={post.profiles?.profile_pic_url} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
              {post.profiles?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-semibold text-gray-900 truncate">
                {post.profiles?.full_name || 'Unknown User'}
              </h4>
              
              {post.profiles?.verified && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                >
                  <span className="text-white text-xs">✓</span>
                </motion.div>
              )}
              
              <Badge 
                variant="outline" 
                className={getRoleBadgeColor(post.profiles?.role || 'citizen')}
              >
                {post.profiles?.role?.replace('_', ' ') || 'citizen'}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{formatTimeAgo(post.created_at)}</span>
              <span>•</span>
              <Badge 
                variant="secondary" 
                className={getCategoryColor(post.category)}
              >
                {post.category}
              </Badge>
              {post.post_type && (
                <>
                  <span>•</span>
                  <span className="capitalize">{post.post_type}</span>
                </>
              )}
            </div>
          </div>
          
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
          
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {post.hashtags.map((tag, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className="text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  #{tag}
                </motion.span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Media */}
        {post.media_urls && post.media_urls.length > 0 && (
          <motion.div 
            className="mb-4 rounded-lg overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <img 
              src={post.media_urls[0]} 
              alt="Post media" 
              className="w-full h-auto max-h-96 object-cover"
            />
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLike}
              className={`flex items-center space-x-2 text-sm transition-colors ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              <CountUp value={post.likes_count || 0} className="font-medium" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onReply}
              className="flex items-center space-x-2 text-sm text-gray-500 hover:text-blue-500 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              <CountUp value={post.reply_count || 0} className="font-medium" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRepost}
              className={`flex items-center space-x-2 text-sm transition-colors ${
                isReposted ? 'text-green-500' : 'text-gray-500 hover:text-green-500'
              }`}
            >
              <Repeat2 className="h-5 w-5" />
              <CountUp value={post.repost_count || 0} className="font-medium" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onShare}
              className="flex items-center space-x-2 text-sm text-gray-500 hover:text-purple-500 transition-colors"
            >
              <Share className="h-5 w-5" />
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReport}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            <Flag className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </GlareCard>
  )
}
