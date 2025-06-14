
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProfileCard } from '@/components/ui/profile-card'
import { 
  Heart, 
  MessageCircle, 
  Repeat2, 
  Share, 
  Flag, 
  Trash2,
  MoreHorizontal,
  AlertTriangle
} from 'lucide-react'
import { Post } from '@/lib/supabase'
import { formatTimeAgo, getCategoryColor } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface TwitterPostCardProps {
  post: Post
  onLike: (postId: string) => void
  onReply: (postId: string) => void
  onRepost: (postId: string) => void
  onReport: (postId: string, reason: string) => void
  onDelete: (postId: string) => void
  isLiked?: boolean
  isReposted?: boolean
}

export function TwitterPostCard({
  post,
  onLike,
  onReply,
  onRepost,
  onReport,
  onDelete,
  isLiked = false,
  isReposted = false
}: TwitterPostCardProps) {
  const { user } = useAuth()
  const [showReplyForm, setShowReplyForm] = useState(false)
  
  const canDelete = user?.id === post.user_id || user?.role === 'admin'
  const canModerate = user?.role === 'admin' || user?.role === 'government_official'

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `Post by ${post.profiles?.full_name}`,
        text: post.content,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-gray-200 hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <ProfileCard 
                user={{
                  full_name: post.profiles?.full_name || 'Unknown User',
                  role: post.profiles?.role || 'citizen',
                  profile_pic_url: post.profiles?.profile_pic_url,
                  verified: post.profiles?.verified
                }}
                size="md"
              />
              <div className="flex items-center gap-2 mt-1">
                <span className="text-gray-500 text-sm">
                  {formatTimeAgo(post.created_at)}
                </span>
                <Badge className={`text-xs ${getCategoryColor(post.category)}`}>
                  {post.category}
                </Badge>
                {post.post_type === 'emergency' && (
                  <Badge variant="destructive" className="text-xs animate-pulse">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Emergency
                  </Badge>
                )}
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(post.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Post
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onReport(post.id, 'inappropriate')}>
                  <Flag className="mr-2 h-4 w-4" />
                  Report Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content */}
          <div className="mb-4">
            <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
              {post.content}
            </p>
            
            {/* Hashtags */}
            {post.hashtags && post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {post.hashtags.map((tag, index) => (
                  <span key={index} className="text-blue-600 hover:text-blue-800 cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            
            {/* Media */}
            {post.media_urls && post.media_urls.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
                {post.media_urls.map((url, index) => (
                  <motion.img
                    key={index}
                    src={url}
                    alt="Post media"
                    className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => window.open(url, '_blank')}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onReply(post.id)}
                className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">{post.reply_count}</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onRepost(post.id)}
                className={`flex items-center gap-2 transition-colors ${
                  isReposted ? 'text-green-600' : 'text-gray-500 hover:text-green-600'
                }`}
              >
                <Repeat2 className="w-5 h-5" />
                <span className="text-sm">{post.repost_count}</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onLike(post.id)}
                className={`flex items-center gap-2 transition-colors ${
                  isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-sm">{post.likes_count}</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleShare}
                className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
              >
                <Share className="w-5 h-5" />
              </motion.button>
            </div>
            
            {post.location && (
              <span className="text-xs text-gray-500">{post.location}</span>
            )}
          </div>

          {/* Replies */}
          {post.replies && post.replies.length > 0 && (
            <div className="mt-4 pl-4 border-l-2 border-gray-100 space-y-3">
              {post.replies.slice(0, 3).map((reply) => (
                <TwitterPostCard
                  key={reply.id}
                  post={reply}
                  onLike={onLike}
                  onReply={onReply}
                  onRepost={onRepost}
                  onReport={onReport}
                  onDelete={onDelete}
                />
              ))}
              {post.replies.length > 3 && (
                <Button variant="ghost" size="sm" className="text-blue-600">
                  Show {post.replies.length - 3} more replies
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
