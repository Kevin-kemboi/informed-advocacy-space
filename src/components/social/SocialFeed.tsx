
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostComposer } from "./PostComposer";
import { PollComposer } from "./PollComposer";
import { EnhancedPostCard } from "./EnhancedPostCard";
import { PollCard } from "./PollCard";
import { Plus, Filter, Loader2, RefreshCw } from "lucide-react";
import { usePosts } from "@/hooks/usePosts";
import { useSocialPolls } from "@/hooks/useSocialPolls";
import { useAuth } from "@/hooks/useAuth";
import { AnimatedList } from "@/components/ui/animated-list";
import { GradientText } from "@/components/ui/gradient-text";
import { TiltedCard } from "@/components/ui/tilted-card";

export function SocialFeed() {
  const [showPostComposer, setShowPostComposer] = useState(false);
  const [showPollComposer, setShowPollComposer] = useState(false);
  const [feedFilter, setFeedFilter] = useState<'all' | 'posts' | 'polls'>('all');
  
  const { posts, loading: postsLoading, refetch: refetchPosts } = usePosts();
  const { polls, loading: pollsLoading } = useSocialPolls();
  const { profile, user, loading: authLoading } = useAuth();

  const canCreate = profile?.role === 'citizen';
  const isLoading = postsLoading || pollsLoading || authLoading;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchPosts();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  console.log('SocialFeed: Rendering with data:', { 
    posts: posts.length, 
    polls: polls.length, 
    isLoading, 
    canCreate,
    profile: profile,
    authLoading
  });

  if (authLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="text-center py-12">
          <CardContent className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Loading your profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-gray-600">Please sign in to access the community feed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Enhanced Composer Section */}
      <TiltedCard className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">
              <GradientText>Community Feed</GradientText>
            </h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          {canCreate ? (
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
          ) : (
            <div className="text-center p-4 bg-gray-100 rounded-lg">
              <p className="text-gray-600">
                {!profile ? 'Loading profile...' : 
                 profile.role === 'government_official' ? 'Government officials can view and vote on content.' :
                 profile.role === 'admin' ? 'Administrators can moderate content.' :
                 'Only citizens can create posts and polls.'}
              </p>
              {profile && profile.role !== 'citizen' && (
                <p className="text-sm text-gray-500 mt-2">
                  Your role: {profile.role?.replace('_', ' ')}
                </p>
              )}
            </div>
          )}
        </CardHeader>
      </TiltedCard>

      {/* Filter Tabs */}
      <Tabs value={feedFilter} onValueChange={(value) => setFeedFilter(value as any)}>
        <TabsList className="grid w-full grid-cols-3 bg-gray-100">
          <TabsTrigger value="all" className="data-[state=active]:bg-white">All</TabsTrigger>
          <TabsTrigger value="posts" className="data-[state=active]:bg-white">Posts</TabsTrigger>
          <TabsTrigger value="polls" className="data-[state=active]:bg-white">Polls</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <Card className="text-center py-12">
              <CardContent className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-gray-600">Loading community content...</p>
              </CardContent>
            </Card>
          ) : posts.length === 0 && polls.length === 0 ? (
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
            <AnimatedList staggerDelay={0.05}>
              {[...posts, ...polls]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((item) => (
                  'question' in item ? (
                    <PollCard key={`poll-${item.id}`} poll={item} />
                  ) : (
                    <EnhancedPostCard key={`post-${item.id}`} post={item} />
                  )
                ))}
            </AnimatedList>
          )}
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          {isLoading ? (
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
                  <p className="text-sm">Be the first to share a post!</p>
                </div>
                {canCreate && (
                  <Button onClick={() => setShowPostComposer(true)} className="mt-4">
                    Create First Post
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <AnimatedList staggerDelay={0.05}>
              {posts.map((post) => (
                <EnhancedPostCard key={post.id} post={post} />
              ))}
            </AnimatedList>
          )}
        </TabsContent>

        <TabsContent value="polls" className="space-y-4">
          {isLoading ? (
            <Card className="text-center py-12">
              <CardContent className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-gray-600">Loading polls...</p>
              </CardContent>
            </Card>
          ) : polls.length === 0 ? (
            <Card className="text-center py-12 bg-gray-50">
              <CardContent>
                <div className="text-gray-500 mb-4">
                  <h3 className="text-lg font-medium">No polls yet</h3>
                  <p className="text-sm">Be the first to create a poll!</p>
                </div>
                {canCreate && (
                  <Button onClick={() => setShowPollComposer(true)} className="mt-4">
                    Create First Poll
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <AnimatedList staggerDelay={0.05}>
              {polls.map((poll) => (
                <PollCard key={poll.id} poll={poll} />
              ))}
            </AnimatedList>
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
