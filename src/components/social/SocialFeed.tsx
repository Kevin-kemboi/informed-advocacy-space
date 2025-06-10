
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostComposer } from "./PostComposer";
import { PollComposer } from "./PollComposer";
import { PostCard } from "./PostCard";
import { PollCard } from "./PollCard";
import { Plus, Filter } from "lucide-react";
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
          {/* Combined feed of posts and polls sorted by date */}
          {[...posts, ...polls]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .map((item) => (
              'content' in item ? (
                <PostCard key={`post-${item.id}`} post={item} />
              ) : (
                <PollCard key={`poll-${item.id}`} poll={item} />
              )
            ))}
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </TabsContent>

        <TabsContent value="polls" className="space-y-4">
          {polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </TabsContent>
      </Tabs>

      {/* Empty state */}
      {!postsLoading && !pollsLoading && posts.length === 0 && polls.length === 0 && (
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
      )}

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
