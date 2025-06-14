
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AuroraBackground } from '@/components/ui/aurora-background'
import { AnimatedList } from '@/components/ui/animated-list'
import { TwitterPostCard } from '@/components/social/TwitterPostCard'
import { PostComposer } from '@/components/social/PostComposer'
import { PollComposer } from '@/components/social/PollComposer'
import { PollCard } from '@/components/social/PollCard'
import { usePosts } from '@/hooks/usePosts'
import { useSocialPolls } from '@/hooks/useSocialPolls'
import { useRealtimeSubscriptions } from '@/hooks/useRealtimeSubscriptions'
import { useAuth } from '@/hooks/useAuth'
import { Plus, MessageSquare, BarChart3 } from 'lucide-react'

export function SocialFeed() {
  const { posts, loading: postsLoading, refetch: refetchPosts } = usePosts()
  const { polls, loading: pollsLoading, refetch: refetchPolls, refetchVotes } = useSocialPolls()
  const { user, profile } = useAuth()
  const [showPostComposer, setShowPostComposer] = useState(false)
  const [showPollComposer, setShowPollComposer] = useState(false)

  // Set up unified realtime subscriptions
  useRealtimeSubscriptions({
    user,
    onPostsChange: refetchPosts,
    onPollsChange: refetchPolls,
    onVotesChange: refetchVotes,
    mounted: true
  })

  const canCreate = profile && ['citizen', 'government_official'].includes(profile.role)
  const isLoading = postsLoading || pollsLoading

  console.log('SocialFeed: Rendering with data:', {
    posts: posts?.length || 0,
    polls: polls?.length || 0,
    isLoading,
    canCreate,
    profile: profile?.full_name
  })

  // Combine and sort posts and polls by creation date
  const feedItems = [
    ...(posts || []).map(post => ({ ...post, type: 'post' as const })),
    ...(polls || []).map(poll => ({ ...poll, type: 'poll' as const }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  if (isLoading) {
    return (
      <div className="relative min-h-screen">
        <AuroraBackground className="absolute inset-0" />
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-2xl">
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="flex space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      <AuroraBackground className="absolute inset-0" />
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-2xl">
        {canCreate && (
          <div className="mb-8 space-y-4">
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => setShowPostComposer(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <MessageSquare className="w-4 h-4" />
                Create Post
              </Button>
              <Button
                onClick={() => setShowPollComposer(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Create Poll
              </Button>
            </div>

            <PostComposer 
              isOpen={showPostComposer} 
              onClose={() => setShowPostComposer(false)} 
            />
            <PollComposer 
              isOpen={showPollComposer} 
              onClose={() => setShowPollComposer(false)} 
            />
          </div>
        )}

        {feedItems.length === 0 ? (
          <Card className="p-8 text-center">
            <CardHeader>
              <CardTitle>No posts yet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                {canCreate 
                  ? "Be the first to share something with your community!" 
                  : "Check back later for community updates."
                }
              </p>
              {canCreate && (
                <div className="mt-4 flex gap-3 justify-center">
                  <Button
                    onClick={() => setShowPostComposer(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create Your First Post
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <AnimatedList className="space-y-6">
            {feedItems.map((item) => 
              item.type === 'post' ? (
                <TwitterPostCard key={`post-${item.id}`} post={item} />
              ) : (
                <PollCard key={`poll-${item.id}`} poll={item} />
              )
            )}
          </AnimatedList>
        )}
      </div>
    </div>
  )
}
