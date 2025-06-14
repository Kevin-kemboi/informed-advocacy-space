
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, TrendingUp, Users, BarChart3, LogOut, Home, MessageSquare, FileText, Activity } from "lucide-react";
import { UnifiedPostCard } from "@/components/shared/UnifiedPostCard";
import { AIInsights } from "@/components/ai/AIInsights";
import { IncidentMap } from "@/components/incidents/IncidentMap";
import { GradientText } from "@/components/ui/gradient-text";
import { CountUp } from "@/components/ui/count-up";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { ParticlesBackground } from "@/components/ui/particles-background";
import { UnifiedDataService } from "@/services/unifiedDataService";
import { useAuth } from "@/hooks/useAuth";

interface OfficialDashboardProps {
  user: any;
  onLogout: () => void;
}

export function OfficialDashboard({ user, onLogout }: OfficialDashboardProps) {
  const { profile } = useAuth()
  const [posts, setPosts] = useState([])
  const [filteredPosts, setFilteredPosts] = useState([])
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')

  console.log('OfficialDashboard: Rendering for user:', user);

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    filterPosts()
  }, [posts, selectedCategory])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      console.log('OfficialDashboard: Loading real data from UnifiedDataService...')
      
      const [allPosts, analytics] = await Promise.all([
        UnifiedDataService.fetchAllPosts(),
        UnifiedDataService.getAnalyticsData()
      ])

      setPosts(allPosts)
      setAnalyticsData(analytics)
      console.log('OfficialDashboard: Loaded posts:', allPosts.length)
    } catch (error) {
      console.error('OfficialDashboard: Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterPosts = () => {
    if (selectedCategory === 'all') {
      setFilteredPosts(posts)
    } else {
      setFilteredPosts(posts.filter(post => post.category === selectedCategory))
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

  const categories = [
    { id: 'all', name: 'All Posts', color: 'bg-gray-100 text-gray-800' },
    { id: 'crime', name: 'Crime & Safety', color: 'bg-red-100 text-red-800' },
    { id: 'health', name: 'Health', color: 'bg-green-100 text-green-800' },
    { id: 'education', name: 'Education', color: 'bg-blue-100 text-blue-800' },
    { id: 'environment', name: 'Environment', color: 'bg-emerald-100 text-emerald-800' },
    { id: 'emergency', name: 'Emergency', color: 'bg-orange-100 text-orange-800' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="p-8">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Loading government dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Enhanced Background */}
      <AuroraBackground />
      <ParticlesBackground particleCount={30} color="#3b82f6" />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Home className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                <GradientText variant="government">Government Dashboard</GradientText>
              </h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.full_name || 'Official'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge 
              variant="outline" 
              className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1"
            >
              🏛️ {user?.role?.replace('_', ' ') || 'government official'}
            </Badge>
            <Button variant="outline" onClick={onLogout} className="hover:bg-red-50 hover:text-red-600 transition-all duration-200">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Real Stats from Database */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Total Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                <CountUp value={analyticsData?.totalPosts || 0} duration={2} />
              </div>
              <p className="text-red-100">All citizen posts</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Today's Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                <CountUp value={analyticsData?.recentPosts || 0} duration={1.5} />
              </div>
              <p className="text-green-100">New today</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Total Replies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                <CountUp value={analyticsData?.totalReplies || 0} duration={2.5} />
              </div>
              <p className="text-blue-100">Citizen responses</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {analyticsData?.engagementRate || '0'}%
              </div>
              <p className="text-purple-100">Response rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-lg shadow-md">
            <TabsTrigger value="posts" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <MessageSquare className="h-4 w-4 mr-2" />
              Citizen Posts
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="map" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Home className="h-4 w-4 mr-2" />
              Incident Map
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6">
            {/* Category Filter */}
            <Card className="bg-white/80 backdrop-blur-lg">
              <CardHeader>
                <CardTitle>Filter by Category</CardTitle>
                <CardDescription>View posts by specific categories to focus on relevant issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <Badge
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                        selectedCategory === category.id ? 'bg-blue-600 text-white' : category.color
                      }`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                      {analyticsData?.categoryStats?.[category.id] && (
                        <span className="ml-1">({analyticsData.categoryStats[category.id]})</span>
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Posts Feed */}
            <Card className="bg-white/80 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Live Citizen Posts
                  {selectedCategory !== 'all' && (
                    <Badge variant="outline" className="ml-2">
                      {categories.find(c => c.id === selectedCategory)?.name}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Real-time posts from citizens - same data as citizen dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
                    <p className="text-gray-600">
                      {selectedCategory === 'all' 
                        ? 'No citizen posts available yet.' 
                        : `No posts in the ${categories.find(c => c.id === selectedCategory)?.name} category.`
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6 max-h-[600px] overflow-y-auto">
                    {filteredPosts.map((post) => (
                      <UnifiedPostCard
                        key={post.id}
                        post={post}
                        onReply={handleReply}
                        showGovActions={true}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <AIInsights />
          </TabsContent>

          <TabsContent value="map">
            <IncidentMap />
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle>Posts by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analyticsData?.categoryStats || {}).map(([category, count]) => (
                      <div key={category} className="flex justify-between items-center">
                        <span className="capitalize">{category}</span>
                        <Badge variant="outline">{String(count)}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Posts</span>
                      <span className="font-semibold">{analyticsData?.totalPosts || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Replies</span>
                      <span className="font-semibold">{analyticsData?.totalReplies || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Likes</span>
                      <span className="font-semibold">{analyticsData?.totalLikes || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Engagement Rate</span>
                      <span className="font-semibold">{analyticsData?.engagementRate || 0}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
