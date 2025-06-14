
import { TwitterLayout } from "@/components/layout/TwitterLayout"
import { TwitterPostComposer } from "@/components/social/TwitterPostComposer"
import { TwitterPostCard } from "@/components/social/TwitterPostCard"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { usePosts } from "@/hooks/usePosts"
import { useAuth } from "@/hooks/useAuth"

export function TwitterFeed() {
  const { posts, loading, createPost } = usePosts()
  const { user, profile } = useAuth()

  console.log('TwitterFeed render:', { 
    user: user?.id, 
    profile: profile?.full_name, 
    postsCount: posts?.length, 
    loading,
    posts: posts?.slice(0, 2) // Log first 2 posts for debugging
  })

  const handleCreatePost = async (postData: {
    content: string
    category: string
    post_type: string
    media_urls: string[]
    location?: string
    hashtags?: string[]
  }) => {
    console.log('TwitterFeed: Creating post with data:', postData)
    try {
      await createPost(postData)
      console.log('TwitterFeed: Post created successfully')
    } catch (error) {
      console.error('TwitterFeed: Error creating post:', error)
    }
  }

  if (!user || !profile) {
    console.log('TwitterFeed: No user or profile, showing sign in message')
    return (
      <TwitterLayout>
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-gray-600">Please sign in to access the feed.</p>
          </CardContent>
        </Card>
      </TwitterLayout>
    )
  }

  return (
    <TwitterLayout>
      <div className="space-y-6">
        {/* Post Composer */}
        <TwitterPostComposer onSubmit={handleCreatePost} />

        {/* Posts Feed */}
        {loading ? (
          <Card className="text-center py-12">
            <CardContent className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-gray-600">Loading posts...</p>
            </CardContent>
          </Card>
        ) : posts.length === 0 ? (
          <Card className="text-center py-12 bg-gray-50">
            <CardContent>
              <div className="text-gray-500 mb-4">
                <h3 className="text-lg font-medium">No posts yet</h3>
                <p className="text-sm">Be the first to share something!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post, index) => {
              console.log(`TwitterFeed: Rendering post ${index}:`, { 
                id: post.id, 
                content: post.content?.substring(0, 50) + '...', 
                author: post.profiles?.full_name,
                replies: post.replies?.length 
              })
              return (
                <TwitterPostCard key={post.id} post={post} />
              )
            })}
          </div>
        )}
      </div>
    </TwitterLayout>
  )
}
