
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostComposer } from "./PostComposer";
import { PollComposer } from "./PollComposer";
import { PostCard } from "./PostCard";
import { PollCard } from "./PollCard";
import { Plus, Filter, Loader2 } from "lucide-react";
import { usePosts } from "@/hooks/usePosts";
import { useSocialPolls } from "@/hooks/useSocialPolls";
import { useAuth } from "@/hooks/useAuth";

export function SocialFeed() {
  const [showPostComposer, setShowPostComposer] = useState(false);
  const [showPollComposer, setShowPollComposer] = useState(false);
  const [feedFilter, setFeedFilter] = useState<'all' | 'posts' | 'polls'>('all');
  
  const { posts, loading: postsLoading } = usePosts();
  const { polls, loading: pollsLoading } = useSocialPolls();
  const { profile } = useAuth();

  const canCreate = profile?.role === 'citizen';
  const isLoading = postsLoading || pollsLoading;

  console.log('SocialFeed: Rendering with data:', { 
    posts: posts.length, 
    polls: polls.length, 
    isLoading, 
    canCreate,
    profile: profile
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="text-center py-12">
          <CardContent className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Loading your community feed...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Composer Section */}
      {canCreate && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader className="pb-4">
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowPostComposer(true)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Share Your Voice
              </Button>
              <Button 
                onClick={() => setShowPollComposer(true)}
                variant="outline"
                className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Poll
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Filter Tabs */}
      <Tabs value={feedFilter} onValueChange={(value) => setFeedFilter(value as any)}>
        <TabsList className="grid w-full grid-cols-3 bg-gray-100">
          <TabsTrigger value="all" className="data-[state=active]:bg-white">All</TabsTrigger>
          <TabsTrigger value="posts" className="data-[state=active]:bg-white">Posts</TabsTrigger>
          <TabsTrigger value="polls" className="data-[state=active]:bg-white">Polls</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Show posts first, then polls */}
          {posts.length === 0 && polls.length === 0 ? (
            <Card className="text-center py-12 bg-gray-50">
              <CardContent>
                <div className="text-gray-500 mb-4">
                  <Filter className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <h3 className="text-lg font-medium">No posts yet</h3>
                  <p className="text-sm">Be the first to share something with your community!</p>
                </div>
                {canCreate && (
                  <Button onClick={() => setShowPostComposer(true)} className="mt-4">
                    Create First Post
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard key={`post-${post.id}`} post={post} />
              ))}
              {polls.map((poll) => (
                <PollCard key={`poll-${poll.id}`} poll={poll} />
              ))}
            </>
          )}
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          {posts.length === 0 ? (
            <Card className="text-center py-12 bg-gray-50">
              <CardContent>
                <div className="text-gray-500 mb-4">
                  <h3 className="text-lg font-medium">No posts yet</h3>
                  <p className="text-sm">Be the first to share a post!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </TabsContent>

        <TabsContent value="polls" className="space-y-4">
          {polls.length === 0 ? (
            <Card className="text-center py-12 bg-gray-50">
              <CardContent>
                <div className="text-gray-500 mb-4">
                  <h3 className="text-lg font-medium">No polls yet</h3>
                  <p className="text-sm">Be the first to create a poll!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            polls.map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Composers */}
      <PostComposer 
        isOpen={showPostComposer}
        onClose={() => setShowPostComposer(false)}
      />
      
      <PollComposer 
        isOpen={showPollComposer}
        onClose={() => setShowPollComposer(false)}
      />
    </div>
  );
}
