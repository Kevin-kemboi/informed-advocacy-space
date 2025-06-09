
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Shield, Activity, Settings, LogOut, Plus } from "lucide-react";
import { UserManagement } from "@/components/admin/UserManagement";
import { SystemHealth } from "@/components/admin/SystemHealth";

interface AdminDashboardProps {
  user: any;
  onLogout: () => void;
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome, {user.fullName}</p>
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
        {/* System Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-500" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">1,247</div>
              <p className="text-sm text-gray-600">+23 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Shield className="h-5 w-5 mr-2 text-green-500" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">99.9%</div>
              <p className="text-sm text-gray-600">Uptime</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Activity className="h-5 w-5 mr-2 text-purple-500" />
                Daily Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">892</div>
              <p className="text-sm text-gray-600">Users today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Settings className="h-5 w-5 mr-2 text-orange-500" />
                API Calls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">45.2K</div>
              <p className="text-sm text-gray-600">Today</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="system">System Health</TabsTrigger>
            <TabsTrigger value="content">Content Moderation</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="system">
            <SystemHealth />
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Content Moderation Queue</CardTitle>
                <CardDescription>Review flagged content and user reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 border-yellow-200 bg-yellow-50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Flagged Opinion Post</h3>
                      <Badge variant="outline">Pending Review</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">"Government policies are completely wrong..."</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Approve</Button>
                      <Button size="sm" variant="destructive">Remove</Button>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Spam Report</h3>
                      <Badge variant="outline">Resolved</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Multiple duplicate incident reports from same user</p>
                    <p className="text-xs text-gray-500">Resolved by removing duplicates</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>User Registration</span>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>AI Features</span>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Email Notifications</span>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Maintenance Mode</span>
                    <Badge variant="outline">Disabled</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>OpenAI Integration</span>
                    <Badge variant="secondary">Connected</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Email Service</span>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Maps API</span>
                    <Badge variant="secondary">Connected</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>File Storage</span>
                    <Badge variant="secondary">Active</Badge>
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
