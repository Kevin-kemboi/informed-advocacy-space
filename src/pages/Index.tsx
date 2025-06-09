
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, MessageSquare, Vote, AlertTriangle, Users, TrendingUp, Shield, Zap, Heart, Globe } from "lucide-react";
import { AuthModal } from "@/components/auth/AuthModal";
import { CitizenDashboard } from "@/components/dashboard/CitizenDashboard";
import { OfficialDashboard } from "@/components/dashboard/OfficialDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";

export default function Index() {
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Mock user for demo - in real app this would come from Supabase auth
  useEffect(() => {
    const mockUser = localStorage.getItem('mockUser');
    if (mockUser) {
      setUser(JSON.parse(mockUser));
    }
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem('mockUser', JSON.stringify(userData));
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('mockUser');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CivicConnect
              </span>
            </div>
            <Button 
              onClick={() => setShowAuthModal(true)}
              className="civic-button-primary"
            >
              Get Started
            </Button>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-20 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Zap className="h-4 w-4" />
              Powered by AI for Better Governance
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Your Voice in
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                Digital Democracy
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Bridge the gap between citizens and government with AI-powered education, 
              transparent reporting, and meaningful participation in the decisions that shape your community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => setShowAuthModal(true)}
                className="civic-button-primary text-lg px-8 py-4"
              >
                <Users className="h-5 w-5 mr-2" />
                Join as Citizen
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => setShowAuthModal(true)}
                className="civic-button-secondary text-lg px-8 py-4"
              >
                <Shield className="h-5 w-5 mr-2" />
                Official Portal
              </Button>
            </div>
          </div>

          {/* Features Grid with Enhanced Design */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <Card className="civic-card group animate-scale-in">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">AI-Powered Education</CardTitle>
                <CardDescription className="text-gray-600">
                  Transform complex government documents into clear, actionable insights with our intelligent AI assistant
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-700 font-medium">✨ Smart Features:</p>
                  <ul className="text-sm text-blue-600 mt-2 space-y-1">
                    <li>• Document summarization</li>
                    <li>• Interactive Q&A</li>
                    <li>• Policy impact analysis</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card className="civic-card group animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Smart Incident Reporting</CardTitle>
                <CardDescription className="text-gray-600">
                  Report issues with rich media, automatic location detection, and real-time status tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-sm text-orange-700 font-medium">📍 Advanced Reporting:</p>
                  <ul className="text-sm text-orange-600 mt-2 space-y-1">
                    <li>• Photo & video uploads</li>
                    <li>• GPS location tagging</li>
                    <li>• Priority classification</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card className="civic-card group animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Vote className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Democratic Participation</CardTitle>
                <CardDescription className="text-gray-600">
                  Shape your community through transparent polling, feedback collection, and data-driven insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-700 font-medium">🗳️ Your Voice Matters:</p>
                  <ul className="text-sm text-green-600 mt-2 space-y-1">
                    <li>• Real-time polling</li>
                    <li>• Opinion aggregation</li>
                    <li>• Impact visualization</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Stats Section */}
          <div className="civic-card-gradient p-12 mb-20 animate-slide-in-right">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">Transforming Communities</h2>
              <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                Join thousands of citizens and officials already making a difference through digital engagement
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div className="group">
                <div className="text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">1,247</div>
                <div className="text-blue-100 font-medium">Active Citizens</div>
                <div className="text-blue-200 text-sm">+23% this month</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">342</div>
                <div className="text-blue-100 font-medium">Issues Resolved</div>
                <div className="text-blue-200 text-sm">89% satisfaction</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">89</div>
                <div className="text-blue-100 font-medium">Active Polls</div>
                <div className="text-blue-200 text-sm">78% participation</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">95%</div>
                <div className="text-blue-100 font-medium">Trust Rating</div>
                <div className="text-blue-200 text-sm">Community verified</div>
              </div>
            </div>
          </div>

          {/* Trust & Security Section */}
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-8">Built for Trust & Transparency</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Secure & Private</h4>
                <p className="text-gray-600 text-sm">Enterprise-grade security with full data privacy compliance</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Data-Driven</h4>
                <p className="text-gray-600 text-sm">AI-powered insights help officials make informed decisions</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Community First</h4>
                <p className="text-gray-600 text-sm">Designed by citizens, for citizens, with accessibility in mind</p>
              </div>
            </div>
          </div>
        </div>

        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
        />
      </div>
    );
  }

  // Render appropriate dashboard based on user role
  const renderDashboard = () => {
    switch (user.role) {
      case 'government_official':
        return <OfficialDashboard user={user} onLogout={handleLogout} />;
      case 'admin':
        return <AdminDashboard user={user} onLogout={handleLogout} />;
      default:
        return <CitizenDashboard user={user} onLogout={handleLogout} />;
    }
  };

  return renderDashboard();
}
