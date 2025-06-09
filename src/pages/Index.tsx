
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, MessageSquare, Vote, AlertTriangle, Users, TrendingUp } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              CivicConnect
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Empowering citizens through transparent governance, informed participation, 
              and direct engagement with government processes.
            </p>
            <Button 
              size="lg" 
              onClick={() => setShowAuthModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              Get Started
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card>
              <CardHeader>
                <MessageSquare className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>AI-Powered Education</CardTitle>
                <CardDescription>
                  Understand complex government documents with AI-powered summaries and explanations
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <AlertTriangle className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle>Incident Reporting</CardTitle>
                <CardDescription>
                  Report local issues with photos, location data, and multimedia support
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Vote className="h-10 w-10 text-green-600 mb-2" />
                <CardTitle>Public Polling</CardTitle>
                <CardDescription>
                  Participate in community decisions and voice your opinions on key issues
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Stats Section */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-center mb-8">Platform Impact</h2>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">1,247</div>
                <div className="text-gray-600">Active Citizens</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600">342</div>
                <div className="text-gray-600">Issues Resolved</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">89</div>
                <div className="text-gray-600">Active Polls</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">95%</div>
                <div className="text-gray-600">Satisfaction Rate</div>
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
