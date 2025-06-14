
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AuthModal } from "@/components/auth/AuthModal"
import { AuroraBackground } from "@/components/ui/aurora-background"
import { ParticlesBackground } from "@/components/ui/particles-background"
import { GradientText } from "@/components/ui/gradient-text"
import { CountUp } from "@/components/ui/count-up"
import { TiltedCard } from "@/components/ui/tilted-card"
import { 
  Users, 
  Vote, 
  MessageSquare, 
  Shield, 
  BarChart3, 
  Bell,
  ArrowRight,
  CheckCircle,
  Star,
  Globe,
  Heart,
  Zap
} from "lucide-react"

export function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Enhanced Background */}
      <AuroraBackground />
      <ParticlesBackground particleCount={50} color="#3b82f6" />

      {/* Navigation */}
      <header className="relative z-50 bg-white/80 backdrop-blur-lg shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold">
              <GradientText variant="civic">CivicConnect</GradientText>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => setShowAuthModal(true)}
              className="hover:scale-105 transition-transform"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => setShowAuthModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-4 py-2 text-sm font-medium">
              🎉 Welcome to the Future of Civic Engagement
            </Badge>
            
            <h1 className="text-6xl md:text-7xl font-bold leading-tight">
              <GradientText variant="civic">Connect</GradientText> with Your{" "}
              <span className="text-gray-900">Community</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Join thousands of citizens, officials, and community leaders in meaningful conversations that shape our future. Your voice matters.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4 h-auto hover:scale-105 transition-all shadow-lg"
              >
                <Users className="mr-2 h-5 w-5" />
                Join as Citizen
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => setShowAuthModal(true)}
                className="text-lg px-8 py-4 h-auto hover:scale-105 transition-all border-2 border-blue-300 hover:border-blue-500"
              >
                <Shield className="mr-2 h-5 w-5" />
                Official Access
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <TiltedCard className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center py-8">
              <div className="text-4xl font-bold mb-2">
                <CountUp value={15000} duration={2} />+
              </div>
              <p className="text-blue-100">Active Citizens</p>
            </TiltedCard>

            <TiltedCard className="bg-gradient-to-r from-green-500 to-green-600 text-white text-center py-8">
              <div className="text-4xl font-bold mb-2">
                <CountUp value={342} duration={1.5} />
              </div>
              <p className="text-green-100">Ongoing Polls</p>
            </TiltedCard>

            <TiltedCard className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-center py-8">
              <div className="text-4xl font-bold mb-2">
                <CountUp value={95} duration={2.5} />%
              </div>
              <p className="text-purple-100">Satisfaction Rate</p>
            </TiltedCard>

            <TiltedCard className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center py-8">
              <div className="text-4xl font-bold mb-2">
                <CountUp value={1247} duration={2} />
              </div>
              <p className="text-orange-100">Issues Resolved</p>
            </TiltedCard>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Why Choose <GradientText variant="government">CivicConnect</GradientText>?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful tools designed to strengthen democracy and build better communities together.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-white/80 backdrop-blur-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">Real-time Discussions</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600 leading-relaxed">
                  Engage in meaningful conversations with your community. Share ideas, ask questions, and collaborate on solutions that matter.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-white/80 backdrop-blur-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Vote className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">Democratic Polling</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600 leading-relaxed">
                  Participate in polls and surveys that shape local policies. Your opinion drives decisions that affect your daily life.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-white/80 backdrop-blur-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">AI-Powered Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600 leading-relaxed">
                  Get intelligent analysis of community trends, policy impacts, and civic data to make informed decisions.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-white/80 backdrop-blur-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Bell className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">Smart Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600 leading-relaxed">
                  Stay informed about important community updates, new polls, and responses to your contributions automatically.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-white/80 backdrop-blur-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">Secure Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600 leading-relaxed">
                  Built with enterprise-grade security to protect your data and ensure authentic civic participation.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-white/80 backdrop-blur-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">Instant Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600 leading-relaxed">
                  See your contributions make a real difference with direct connections to local officials and policy makers.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="container mx-auto px-4 py-20 bg-white/50 backdrop-blur-lg">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Trusted by <GradientText variant="civic">Communities</GradientText>
            </h2>
            <p className="text-xl text-gray-600">See what our users are saying about CivicConnect</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-0 bg-white/80 backdrop-blur-lg hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "CivicConnect has revolutionized how our community engages with local government. The platform is intuitive and powerful."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    S
                  </div>
                  <div>
                    <p className="font-semibold">Sarah Johnson</p>
                    <p className="text-sm text-gray-600">Community Leader</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/80 backdrop-blur-lg hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Finally, a platform where citizens can have their voices heard and see real impact from their participation."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    M
                  </div>
                  <div>
                    <p className="font-semibold">Michael Chen</p>
                    <p className="text-sm text-gray-600">Local Business Owner</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/80 backdrop-blur-lg hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "The AI insights help us understand community needs better and make data-driven decisions for our constituents."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                    A
                  </div>
                  <div>
                    <p className="font-semibold">Alex Rodriguez</p>
                    <p className="text-sm text-gray-600">City Council Member</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl">
              <CardContent className="p-12">
                <h2 className="text-4xl font-bold mb-6">
                  Ready to Make a Difference?
                </h2>
                <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
                  Join thousands of engaged citizens who are shaping the future of their communities every day.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    onClick={() => setShowAuthModal(true)}
                    className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4 h-auto hover:scale-105 transition-all font-semibold"
                  >
                    <Heart className="mr-2 h-5 w-5" />
                    Start Your Journey
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => setShowAuthModal(true)}
                    className="border-2 border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 h-auto hover:scale-105 transition-all"
                  >
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">CivicConnect</span>
              </div>
              <p className="text-gray-400">
                Empowering communities through technology and democratic participation.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Community Feed</li>
                <li>Polling System</li>
                <li>AI Insights</li>
                <li>Government Portal</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Twitter</li>
                <li>Facebook</li>
                <li>LinkedIn</li>
                <li>Newsletter</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CivicConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  )
}
