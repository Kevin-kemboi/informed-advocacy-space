
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AuroraBackground } from '@/components/ui/aurora-background'
import { AnimatedList } from '@/components/ui/animated-list'
import { TwitterPostCard } from '@/components/social/TwitterPostCard'
import { PostComposer } from '@/components/social/PostComposer'
import { PollCard } from '@/components/social/PollCard'
import { useEnhancedPosts } from '@/hooks/useEnhancedPosts'
import { useSocialPolls } from '@/hooks/useSocialPolls'
import { useAuth } from '@/hooks/useAuth'

export function SocialFeed() {
  const { posts, loading: postsLoading } = useEnhancedPosts()
  const { polls, loading: pollsLoading } = useSocialPolls()
  const { profile, loading: authLoading } = useAuth()

  const canCreate = profile && ['citizen', 'government_official'].includes(profile.role)
  const isLoading = postsLoading || pollsLoading

  console.log('SocialFeed: Rendering with data:', {
    posts: posts.length,
    polls: polls.length,
    isLoading,
    canCreate,
    profile: profile ? {
      id: profile.id,
      full_name: profile.full_name,
      email: profile.email,
      role: profile.role,
      created_at: profile.created_at,
      profile_pic_url: profile.profile_pic_url,
      bio: profile.bio,
      location: profile.location,
      verified: profile.verified
    } : null,
    authLoading
  })

  // Combine and sort posts and polls by creation date
  const feedItems = [
    ...posts.map(post => ({ ...post, type: 'post' as const })),
    ...polls.map(poll => ({ ...poll, type: 'poll' as const }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="relative min-h-screen">
      <AuroraBackground className="absolute inset-0" />
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-2xl">
        {canCreate && (
          <div className="mb-8">
            <PostComposer isOpen={true} onClose={() => {}} />
          </div>
        )}

        {isLoading ? (
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
        ) : feedItems.length === 0 ? (
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
            </CardContent>
          </Card>
        ) : (
          <AnimatedList className="space-y-6">
            {feedItems.map((item) => 
              item.type === 'post' ? (
                <TwitterPostCard key={item.id} post={item} />
              ) : (
                <PollCard key={item.id} poll={item} />
              )
            )}
          </AnimatedList>
        )}
      </div>
    </div>
  )
}
