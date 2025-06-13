
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, TrendingUp, Users, BarChart3, LogOut, Home, MessageSquare, FileText, Calendar } from "lucide-react";
import { AIInsights } from "@/components/ai/AIInsights";
import { IncidentMap } from "@/components/incidents/IncidentMap";
import { IncidentManager } from "@/components/dashboard/IncidentManager";
import { CitizenEngagement } from "@/components/dashboard/CitizenEngagement";
import { PolicyTracker } from "@/components/dashboard/PolicyTracker";

interface OfficialDashboardProps {
  user: any;
  onLogout: () => void;
}

export function OfficialDashboard({ user, onLogout }: OfficialDashboardProps) {
  console.log('OfficialDashboard: Rendering for user:', user);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Home className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Government Dashboard
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
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 animate-pulse" />
                Active Incidents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">42</div>
              <p className="text-red-100">+5 from yesterday</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 animate-pulse" />
                Resolved Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">18</div>
              <p className="text-green-100">Above average</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2 animate-pulse" />
                Citizen Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">89%</div>
              <p className="text-blue-100">+2% this week</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 animate-pulse" />
                Satisfaction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">4.2</div>
              <p className="text-purple-100">out of 5.0</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="incidents" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-lg shadow-md">
            <TabsTrigger value="incidents" className="data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all duration-200">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Incidents
            </TabsTrigger>
            <TabsTrigger value="engagement" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200">
              <MessageSquare className="h-4 w-4 mr-2" />
              Engagement
            </TabsTrigger>
            <TabsTrigger value="policies" className="data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all duration-200">
              <FileText className="h-4 w-4 mr-2" />
              Policies
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all duration-200">
              <BarChart3 className="h-4 w-4 mr-2" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="map" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all duration-200">
              <Home className="h-4 w-4 mr-2" />
              Map
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incidents" className="animate-fade-in">
            <Card className="bg-white/80 backdrop-blur-lg shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Incident Management
                </CardTitle>
                <CardDescription>
                  Monitor and manage community incidents requiring attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IncidentManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="animate-fade-in">
            <Card className="bg-white/80 backdrop-blur-lg shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Citizen Engagement
                </CardTitle>
                <CardDescription>
                  Monitor community feedback and respond to citizen concerns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CitizenEngagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies" className="animate-fade-in">
            <Card className="bg-white/80 backdrop-blur-lg shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  Policy Tracker
                </CardTitle>
                <CardDescription>
                  Track policy development, voting, and implementation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PolicyTracker />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="animate-fade-in">
            <AIInsights />
          </TabsContent>

          <TabsContent value="map" className="animate-fade-in">
            <IncidentMap />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
