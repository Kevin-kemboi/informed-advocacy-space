
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ProfileCard } from '@/components/ui/profile-card'
import { 
  Heart, 
  MessageCircle, 
  Repeat2, 
  Share,
  MapPin,
  Clock,
  Send,
  X
} from 'lucide-react'
import { formatTimeAgo, getCategoryColor } from '@/lib/supabase'
import { Post } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { usePosts } from '@/hooks/usePosts'

interface TwitterPostCardProps {
  post: Post
  isReply?: boolean
}

export function TwitterPostCard({ post, isReply = false }: TwitterPostCardProps) {
  const { user, profile } = useAuth()
  const { createPost } = usePosts()
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)

  console.log('TwitterPostCard render:', { 
    postId: post.id, 
    isReply, 
    author: post.profiles?.full_name,
    repliesCount: post.replies?.length || post.reply_count || 0,
    showReplyForm,
    hasReplies: post.replies && post.replies.length > 0
  })

  const handleReply = async () => {
    if (!replyContent.trim() || !user) return
    
    console.log('TwitterPostCard: Submitting reply:', { postId: post.id, content: replyContent })
    setIsSubmittingReply(true)
    try {
      await createPost({
        content: replyContent.trim(),
        category: 'general',
        post_type: 'opinion',
        media_urls: [],
        parent_id: post.id
      })
      setReplyContent('')
      setShowReplyForm(false)
      console.log('TwitterPostCard: Reply submitted successfully')
    } catch (error) {
      console.error('TwitterPostCard: Error creating reply:', error)
    } finally {
      setIsSubmittingReply(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={isReply ? "ml-8 mt-4 border-l-2 border-gray-200 pl-4" : ""}
    >
      <Card className="border-gray-200 bg-white hover:bg-gray-50/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <ProfileCard 
              user={{
                full_name: post.profiles?.full_name || 'User',
                role: post.profiles?.role || 'citizen',
                profile_pic_url: post.profiles?.profile_pic_url,
                verified: post.profiles?.verified || false
              }}
              size="md"
            />
            
            <div className="flex-1 min-w-0">
              {/* Post Header */}
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-gray-900 truncate">
                  {post.profiles?.full_name || 'User'}
                </span>
                <span className="text-gray-500 text-sm flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(post.created_at)}
                </span>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getCategoryColor(post.category)}`}
                >
                  {post.category}
                </Badge>
              </div>

              {/* Post Content */}
              <div className="mb-3">
                <p className="text-gray-900 whitespace-pre-wrap break-words">
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
                        className="w-full h-32 object-cover rounded-lg border"
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
                      <span key={index} className="text-blue-600 text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons - Only show for main posts, not replies */}
              {!isReply && (
                <div className="flex items-center justify-between max-w-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                    onClick={() => {
                      console.log('TwitterPostCard: Reply button clicked')
                      setShowReplyForm(!showReplyForm)
                    }}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {post.replies?.length || post.reply_count || 0}
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
                    className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    {post.likes_count || 0}
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

              {/* Reply Form - Only show for main posts */}
              {!isReply && showReplyForm && user && profile && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 border-t pt-4"
                >
                  <div className="flex gap-3">
                    <ProfileCard 
                      user={{
                        full_name: profile.full_name || 'User',
                        role: profile.role || 'citizen',
                        profile_pic_url: profile.profile_pic_url,
                        verified: profile.verified || false
                      }}
                      size="sm"
                    />
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
                            <X className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleReply}
                            disabled={!replyContent.trim() || isSubmittingReply}
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

      {/* Replies Section - Only show for main posts and when replies exist */}
      {!isReply && post.replies && post.replies.length > 0 && (
        <div className="mt-2">
          {post.replies.map((reply) => {
            console.log('TwitterPostCard: Rendering reply:', { 
              replyId: reply.id, 
              content: reply.content?.substring(0, 30) + '...',
              author: reply.profiles?.full_name 
            })
            return (
              <TwitterPostCard key={reply.id} post={reply} isReply={true} />
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
