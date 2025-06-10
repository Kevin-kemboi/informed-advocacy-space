
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Vote, Users, TrendingUp, Shield, Zap, Heart, Globe, Sparkles } from "lucide-react";
import { AuthModal } from "@/components/auth/AuthModal";
import { CitizenDashboard } from "@/components/dashboard/CitizenDashboard";
import { OfficialDashboard } from "@/components/dashboard/OfficialDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, profile, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Globe className="h-8 w-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading CivicConnect...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse">
                <Globe className="h-7 w-7 text-white" />
              </div>
              <div>
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CivicConnect
                </span>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Sparkles className="h-3 w-3" />
                  Social Civic Engagement Platform
                </div>
              </div>
            </div>
            <Button 
              onClick={() => setShowAuthModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Join Community
            </Button>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-20 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-6 py-3 rounded-full text-sm font-semibold mb-8 animate-scale-in">
              <Zap className="h-4 w-4" />
              Next-Gen Civic Engagement Platform
            </div>
            <h1 className="text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Your Voice in
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent block">
                Social Democracy
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Connect, engage, and influence your community through our innovative social media platform 
              designed specifically for civic participation. Share posts, create polls, and make your voice heard.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                size="lg" 
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Users className="h-5 w-5 mr-2" />
                Join as Citizen
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => setShowAuthModal(true)}
                className="border-2 border-gray-300 hover:border-blue-400 text-gray-700 hover:text-blue-600 text-lg px-10 py-4 rounded-xl transition-all duration-300"
              >
                <Shield className="h-5 w-5 mr-2" />
                Official Access
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-lg animate-scale-in">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <MessageSquare className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl mb-3">Social Civic Feed</CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Share your thoughts, report issues, and engage with your community through our Twitter-like social feed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                  <p className="text-sm text-blue-700 font-medium mb-2">✨ Smart Features:</p>
                  <ul className="text-sm text-blue-600 space-y-1">
                    <li>• Real-time community posts</li>
                    <li>• Image & video sharing</li>
                    <li>• Like and flag system</li>
                    <li>• Role-based interactions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-lg animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Vote className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl mb-3">Interactive Polls</CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Create and participate in community polls with real-time results and visual analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                  <p className="text-sm text-green-700 font-medium mb-2">🗳️ Democracy Tools:</p>
                  <ul className="text-sm text-green-600 space-y-1">
                    <li>• One-click poll creation</li>
                    <li>• Real-time vote tracking</li>
                    <li>• Visual result analytics</li>
                    <li>• Timed poll expiration</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-lg animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl mb-3">Role-Based Access</CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Secure, role-based platform ensuring appropriate access for citizens, officials, and administrators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                  <p className="text-sm text-purple-700 font-medium mb-2">🔐 Access Control:</p>
                  <ul className="text-sm text-purple-600 space-y-1">
                    <li>• Email domain validation</li>
                    <li>• Citizens create content</li>
                    <li>• Officials monitor & vote</li>
                    <li>• Admins manage platform</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Stats Section */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 mb-20 animate-slide-in-right shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-5xl font-bold text-white mb-6">Empowering Communities</h2>
                <p className="text-blue-100 text-xl max-w-3xl mx-auto">
                  Join thousands of engaged citizens shaping the future of their communities through social civic engagement
                </p>
              </div>
              <div className="grid md:grid-cols-4 gap-8 text-center">
                <div className="group">
                  <div className="text-5xl font-bold text-white mb-3 group-hover:scale-110 transition-transform duration-300">2,847</div>
                  <div className="text-blue-100 font-medium text-lg">Active Citizens</div>
                  <div className="text-blue-200 text-sm">+45% growth</div>
                </div>
                <div className="group">
                  <div className="text-5xl font-bold text-white mb-3 group-hover:scale-110 transition-transform duration-300">1,234</div>
                  <div className="text-blue-100 font-medium text-lg">Community Posts</div>
                  <div className="text-blue-200 text-sm">This month</div>
                </div>
                <div className="group">
                  <div className="text-5xl font-bold text-white mb-3 group-hover:scale-110 transition-transform duration-300">156</div>
                  <div className="text-blue-100 font-medium text-lg">Active Polls</div>
                  <div className="text-blue-200 text-sm">87% participation</div>
                </div>
                <div className="group">
                  <div className="text-5xl font-bold text-white mb-3 group-hover:scale-110 transition-transform duration-300">98%</div>
                  <div className="text-blue-100 font-medium text-lg">Satisfaction</div>
                  <div className="text-blue-200 text-sm">Community rated</div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust & Security Section */}
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-12">Built for Trust & Engagement</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Secure & Private</h4>
                <p className="text-gray-600">Enterprise-grade security with role-based access control and data privacy compliance</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Real-Time Insights</h4>
                <p className="text-gray-600">Live polls, instant feedback, and community analytics help drive informed decisions</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Community First</h4>
                <p className="text-gray-600">Designed with accessibility and inclusion in mind, fostering meaningful civic participation</p>
              </div>
            </div>
          </div>
        </div>

        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    );
  }

  // Render appropriate dashboard based on user role
  const renderDashboard = () => {
    switch (profile.role) {
      case 'government_official':
        return <OfficialDashboard user={profile} onLogout={signOut} />;
      case 'admin':
        return <AdminDashboard user={profile} onLogout={signOut} />;
      default:
        return <CitizenDashboard user={profile} onLogout={signOut} />;
    }
  };

  return renderDashboard();
}
