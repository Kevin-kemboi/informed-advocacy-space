
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Vote, LogOut, Users, TrendingUp, Home, Plus } from "lucide-react";
import { UnifiedPostCard } from "@/components/shared/UnifiedPostCard";
import { PostComposer } from "@/components/social/PostComposer";
import { PollComposer } from "@/components/social/PollComposer";
import { PollCard } from "@/components/social/PollCard";
import { AIChat } from "@/components/ai/AIChat";
import { GradientText } from "@/components/ui/gradient-text";
import { CountUp } from "@/components/ui/count-up";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { ParticlesBackground } from "@/components/ui/particles-background";
import { TiltedCard } from "@/components/ui/tilted-card";
import { AnimatedList } from "@/components/ui/animated-list";
import { UnifiedDataService } from "@/services/unifiedDataService";
import { useSocialPolls } from "@/hooks/useSocialPolls";
import { useAuth } from "@/hooks/useAuth";

interface CitizenDashboardProps {
  user: any;
  onLogout: () => void;
}

export function CitizenDashboard({ user, onLogout }: CitizenDashboardProps) {
  const { profile } = useAuth()
  const { polls } = useSocialPolls()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPostComposer, setShowPostComposer] = useState(false)
  const [showPollComposer, setShowPollComposer] = useState(false)
  const [analyticsData, setAnalyticsData] = useState(null)

  console.log('CitizenDashboard: Rendering for user:', user)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      console.log('CitizenDashboard: Loading data from UnifiedDataService...')
      
      const [allPosts, analytics] = await Promise.all([
        UnifiedDataService.fetchAllPosts(),
        UnifiedDataService.getAnalyticsData()
      ])

      setPosts(allPosts)
      setAnalyticsData(analytics)
      console.log('CitizenDashboard: Loaded posts:', allPosts.length)
    } catch (error) {
      console.error('CitizenDashboard: Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async (postData: {
    content: string
    category: string
    post_type: string
    media_urls: string[]
    location?: string
    hashtags?: string[]
  }) => {
    if (!profile) return
    
    try {
      await UnifiedDataService.createPost({
        ...postData,
        user_id: profile.id
      })
      setShowPostComposer(false)
      // Reload data to show new post
      await loadDashboardData()
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }

  const handleReply = async (postId: string, content: string) => {
    if (!profile) return
    
    try {
      await UnifiedDataService.createReply(postId, content, profile.id)
      // Reload data to show new reply
      await loadDashboardData()
    } catch (error) {
      console.error('Error creating reply:', error)
    }
  }

  // Combine and sort posts and polls by creation date
  const feedItems = [
    ...(posts || []).map(post => ({ ...post, type: 'post' as const })),
    ...(polls || []).map(poll => ({ ...poll, type: 'poll' as const }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="p-8">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Enhanced Background */}
      <AuroraBackground />
      <ParticlesBackground particleCount={30} color="#3b82f6" />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300 hover:scale-105">
              <Home className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                <GradientText variant="civic">CivicConnect</GradientText>
              </h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.full_name || 'User'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge 
              variant="outline" 
              className="bg-green-50 text-green-700 border-green-200 px-3 py-1 hover:bg-green-100 transition-colors duration-200"
            >
              👤 {user?.role?.replace('_', ' ') || 'citizen'}
            </Badge>
            <Button variant="outline" onClick={onLogout} className="hover:bg-red-50 hover:text-red-600 transition-all duration-200 hover:scale-105">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <TiltedCard className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2 animate-pulse" />
                Total Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                <CountUp value={analyticsData?.totalPosts || 0} duration={2} />
              </div>
              <p className="text-blue-100">Community posts</p>
            </CardContent>
          </TiltedCard>

          <TiltedCard className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Vote className="h-5 w-5 mr-2 animate-pulse" />
                Active Polls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                <CountUp value={polls?.length || 0} duration={1.5} />
              </div>
              <p className="text-green-100">Awaiting your vote</p>
            </CardContent>
          </TiltedCard>

          <TiltedCard className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 animate-pulse" />
                Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                <CountUp value={parseFloat(analyticsData?.engagementRate || '0')} duration={2.5} />%
              </div>
              <p className="text-purple-100">Community rating</p>
            </CardContent>
          </TiltedCard>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-lg shadow-md">
            <TabsTrigger value="feed" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200 hover:scale-105">
              <Home className="h-4 w-4 mr-2" />
              Community Feed
            </TabsTrigger>
            <TabsTrigger value="ai-chat" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all duration-200 hover:scale-105">
              <MessageSquare className="h-4 w-4 mr-2" />
              AI Assistant
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="animate-fade-in">
            {/* Create Post/Poll Buttons */}
            <div className="mb-8 space-y-4">
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => setShowPostComposer(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <MessageSquare className="w-4 h-4" />
                  Create Post
                </Button>
                <Button
                  onClick={() => setShowPollComposer(true)}
                  variant="outline"
                  className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Vote className="w-4 h-4" />
                  Create Poll
                </Button>
              </div>

              <PostComposer 
                isOpen={showPostComposer} 
                onClose={() => setShowPostComposer(false)}
                onSubmit={handleCreatePost}
              />
              <PollComposer 
                isOpen={showPollComposer} 
                onClose={() => setShowPollComposer(false)} 
              />
            </div>

            {/* Feed */}
            {feedItems.length === 0 ? (
              <TiltedCard className="p-8 text-center bg-white/80 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle>
                    <GradientText variant="civic">No posts yet</GradientText>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Be the first to share something with your community!
                  </p>
                  <Button
                    onClick={() => setShowPostComposer(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Create Your First Post
                  </Button>
                </CardContent>
              </TiltedCard>
            ) : (
              <AnimatedList className="space-y-6">
                {feedItems.map((item) => 
                  item.type === 'post' ? (
                    <UnifiedPostCard 
                      key={`post-${item.id}`} 
                      post={item} 
                      onReply={handleReply}
                    />
                  ) : (
                    <PollCard key={`poll-${item.id}`} poll={item} />
                  )
                )}
              </AnimatedList>
            )}
          </TabsContent>

          <TabsContent value="ai-chat" className="animate-fade-in">
            <div className="max-w-4xl mx-auto">
              <TiltedCard className="bg-white/80 backdrop-blur-lg shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <GradientText variant="government">AI Civic Assistant</GradientText>
                  </CardTitle>
                  <CardDescription>
                    Ask questions about government policies, get help understanding civic processes, or learn about your community.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AIChat />
                </CardContent>
              </TiltedCard>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
