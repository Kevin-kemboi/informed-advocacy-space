
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

  const handleCreatePost = async (postData: {
    content: string
    category: string
    post_type: string
    media_urls: string[]
    location?: string
    hashtags?: string[]
  }) => {
    await createPost(postData)
  }

  if (!user || !profile) {
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
            {posts.map((post) => (
              <TwitterPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </TwitterLayout>
  )
}
