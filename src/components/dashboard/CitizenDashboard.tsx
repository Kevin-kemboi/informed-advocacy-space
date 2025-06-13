
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Vote, LogOut, Users, TrendingUp, Home } from "lucide-react";
import { SocialFeed } from "@/components/social/SocialFeed";
import { AIChat } from "@/components/ai/AIChat";

interface CitizenDashboardProps {
  user: any;
  onLogout: () => void;
}

export function CitizenDashboard({ user, onLogout }: CitizenDashboardProps) {
  console.log('CitizenDashboard: Rendering for user:', user)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300 hover:scale-105">
              <Home className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CivicConnect
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
        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2 animate-pulse" />
                Community Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">1,247</div>
              <p className="text-blue-100">Active citizens</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Vote className="h-5 w-5 mr-2 animate-pulse" />
                Active Polls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">23</div>
              <p className="text-green-100">Awaiting your vote</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 animate-pulse" />
                Impact Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">95</div>
              <p className="text-purple-100">Community rating</p>
            </CardContent>
          </Card>
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
            <SocialFeed />
          </TabsContent>

          <TabsContent value="ai-chat" className="animate-fade-in">
            <div className="max-w-4xl mx-auto">
              <Card className="bg-white/80 backdrop-blur-lg shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    AI Civic Assistant
                  </CardTitle>
                  <CardDescription>
                    Ask questions about government policies, get help understanding civic processes, or learn about your community.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AIChat />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
