
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, AlertTriangle, Vote, LogOut, Plus, MapPin } from "lucide-react";
import { IncidentReportModal } from "@/components/incidents/IncidentReportModal";
import { AIChat } from "@/components/ai/AIChat";
import { PollsList } from "@/components/polls/PollsList";
import { OpinionForm } from "@/components/opinions/OpinionForm";

interface CitizenDashboardProps {
  user: any;
  onLogout: () => void;
}

export function CitizenDashboard({ user, onLogout }: CitizenDashboardProps) {
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showOpinionForm, setShowOpinionForm] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CivicConnect</h1>
            <p className="text-sm text-gray-600">Welcome, {user.full_name}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline">{user.role}</Badge>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowIncidentModal(true)}>
            <CardHeader className="pb-3">
              <AlertTriangle className="h-8 w-8 text-orange-500 mb-2" />
              <CardTitle className="text-lg">Report Issue</CardTitle>
              <CardDescription>Report local problems or emergencies</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowOpinionForm(true)}>
            <CardHeader className="pb-3">
              <MessageSquare className="h-8 w-8 text-blue-500 mb-2" />
              <CardTitle className="text-lg">Share Opinion</CardTitle>
              <CardDescription>Submit feedback on government policies</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <Vote className="h-8 w-8 text-green-500 mb-2" />
              <CardTitle className="text-lg">Active Polls</CardTitle>
              <CardDescription>Participate in community decisions</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="polls">Polls</TabsTrigger>
            <TabsTrigger value="ai-chat">AI Assistant</TabsTrigger>
            <TabsTrigger value="my-reports">My Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">Voted on "City Budget 2024"</p>
                        <p className="text-sm text-gray-600">2 hours ago</p>
                      </div>
                      <Badge variant="outline">Poll</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">Reported pothole on Main St</p>
                        <p className="text-sm text-gray-600">1 day ago</p>
                      </div>
                      <Badge variant="outline">Incident</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Community Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Community Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Issues Resolved This Month</span>
                      <Badge variant="secondary">23</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Polls</span>
                      <Badge variant="secondary">7</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Community Participation</span>
                      <Badge variant="secondary">78%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="polls">
            <PollsList userRole="citizen" />
          </TabsContent>

          <TabsContent value="ai-chat">
            <AIChat />
          </TabsContent>

          <TabsContent value="my-reports">
            <Card>
              <CardHeader>
                <CardTitle>My Reports</CardTitle>
                <CardDescription>Track your submitted incidents and feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Pothole on Main Street</h3>
                      <Badge variant="outline">In Progress</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Large pothole causing traffic issues</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      Main St & 2nd Ave
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Broken Streetlight</h3>
                      <Badge variant="secondary">Resolved</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Streetlight out for several days</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      Oak Street
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <IncidentReportModal 
        isOpen={showIncidentModal}
        onClose={() => setShowIncidentModal(false)}
      />

      <OpinionForm 
        isOpen={showOpinionForm}
        onClose={() => setShowOpinionForm(false)}
      />
    </div>
  );
}
