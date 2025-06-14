
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Heart, 
  MessageCircle, 
  Repeat2, 
  Share,
  Flag,
  MoreHorizontal,
  Send,
  Clock,
  MapPin,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDistanceToNow } from 'date-fns'
import { Post } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { usePosts } from '@/hooks/usePosts'

interface UnifiedPostCardProps {
  post: Post
  isReply?: boolean
  onReply?: (postId: string, content: string) => void
  showAdminActions?: boolean
  showGovActions?: boolean
}

export function UnifiedPostCard({ 
  post, 
  isReply = false, 
  onReply,
  showAdminActions = false,
  showGovActions = false
}: UnifiedPostCardProps) {
  const { profile } = useAuth()
  const { likePost, flagPost, deletePost } = usePosts()
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes_count || 0)
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)

  const handleLike = async () => {
    if (!isLiked) {
      try {
        await likePost(post.id)
        setIsLiked(true)
        setLikeCount(prev => prev + 1)
      } catch (error) {
        console.error('Error liking post:', error)
      }
    }
  }

  const handleReply = async () => {
    if (!replyContent.trim() || !onReply) return
    
    setIsSubmittingReply(true)
    try {
      await onReply(post.id, replyContent.trim())
      setReplyContent('')
      setShowReplyForm(false)
    } catch (error) {
      console.error('Error submitting reply:', error)
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const handleFlag = async () => {
    try {
      await flagPost(post.id, 'Inappropriate content')
    } catch (error) {
      console.error('Error flagging post:', error)
    }
  }

  const handleDelete = async () => {
    try {
      await deletePost(post.id)
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  const canDelete = profile && (profile.id === post.user_id || profile.role === 'admin')
  const canModerate = profile && (profile.role === 'admin' || profile.role === 'government_official')

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700 border-red-200'
      case 'government_official': return 'bg-blue-100 text-blue-700 border-blue-200'
      default: return 'bg-green-100 text-green-700 border-green-200'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return '👑'
      case 'government_official': return '🏛️'
      default: return '👤'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'crime': return 'bg-red-100 text-red-800'
      case 'health': return 'bg-green-100 text-green-800'
      case 'education': return 'bg-blue-100 text-blue-800'
      case 'corruption': return 'bg-purple-100 text-purple-800'
      case 'environment': return 'bg-emerald-100 text-emerald-800'
      case 'emergency': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isReply ? 'ml-8 mt-4 border-l-2 border-gray-200 pl-4' : ''}`}
    >
      <Card className="bg-white hover:bg-gray-50/50 transition-all duration-300 border border-gray-200 hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex gap-3">
            {/* Avatar */}
            <Avatar className="w-12 h-12 ring-2 ring-blue-100">
              <AvatarImage src={post.profiles?.profile_pic_url} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {post.profiles?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900 truncate">
                    {post.profiles?.full_name || 'Anonymous User'}
                  </span>
                  <Badge variant="outline" className={`text-xs ${getRoleColor(post.profiles?.role || 'citizen')}`}>
                    {getRoleIcon(post.profiles?.role || 'citizen')} {post.profiles?.role?.replace('_', ' ') || 'citizen'}
                  </Badge>
                  <Badge variant="outline" className={`text-xs ${getCategoryColor(post.category)}`}>
                    {post.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </div>
                </div>
                
                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canDelete && (
                      <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                    {canModerate && (
                      <DropdownMenuItem onClick={handleFlag}>
                        <Flag className="h-4 w-4 mr-2" />
                        Flag Content
                      </DropdownMenuItem>
                    )}
                    {showGovActions && (
                      <DropdownMenuItem>
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Assign to Department
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Content */}
              <div className="mb-3">
                <p className="text-gray-900 whitespace-pre-wrap break-words leading-relaxed">
                  {post.content}
                </p>
                
                {/* Media */}
                {post.media_urls && post.media_urls.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {post.media_urls.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Post media ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border hover:shadow-lg transition-shadow duration-300"
                      />
                    ))}
                  </div>
                )}

                {/* Location */}
                {post.location && (
                  <div className="flex items-center gap-1 mt-2 text-gray-500 text-sm">
                    <MapPin className="w-3 h-3" />
                    <span>{post.location}</span>
                  </div>
                )}

                {/* Hashtags */}
                {post.hashtags && post.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {post.hashtags.map((tag, index) => (
                      <span key={index} className="text-blue-600 text-sm hover:underline cursor-pointer">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {!isReply && (
                <div className="flex items-center justify-between max-w-md border-t pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                    onClick={() => setShowReplyForm(!showReplyForm)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {post.reply_count || 0}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-green-600 hover:bg-green-50"
                  >
                    <Repeat2 className="w-4 h-4 mr-2" />
                    {post.repost_count || 0}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-gray-500 hover:text-red-600 hover:bg-red-50 ${
                      isLiked ? 'text-red-600' : ''
                    }`}
                    onClick={handleLike}
                    disabled={isLiked}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                    {likeCount}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                  >
                    <Share className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Reply Form */}
              {!isReply && showReplyForm && profile && onReply && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 border-t pt-4"
                >
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={profile.profile_pic_url} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                        {profile.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder={`Reply to ${post.profiles?.full_name || 'this post'}...`}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="border-none resize-none focus:ring-0 mb-3"
                        rows={2}
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {280 - replyContent.length} characters remaining
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowReplyForm(false)
                              setReplyContent('')
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleReply}
                            disabled={!replyContent.trim() || isSubmittingReply}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            {isSubmittingReply ? 'Replying...' : 'Reply'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Replies Section */}
      {!isReply && post.replies && post.replies.length > 0 && (
        <div className="mt-2">
          {post.replies.map((reply) => (
            <UnifiedPostCard 
              key={reply.id} 
              post={reply} 
              isReply={true}
              showAdminActions={showAdminActions}
              showGovActions={showGovActions}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}
