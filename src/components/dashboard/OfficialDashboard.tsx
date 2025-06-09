
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, TrendingUp, Users, BarChart3, LogOut, MapPin } from "lucide-react";
import { AIInsights } from "@/components/ai/AIInsights";
import { IncidentMap } from "@/components/incidents/IncidentMap";

interface OfficialDashboardProps {
  user: any;
  onLogout: () => void;
}

export function OfficialDashboard({ user, onLogout }: OfficialDashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Government Dashboard</h1>
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
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                Active Incidents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">42</div>
              <p className="text-sm text-gray-600">+5 from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                Resolved Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">18</div>
              <p className="text-sm text-gray-600">Above average</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-500" />
                Citizen Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">89%</div>
              <p className="text-sm text-gray-600">+2% this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
                Satisfaction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">4.2</div>
              <p className="text-sm text-gray-600">out of 5.0</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="incidents" className="space-y-6">
          <TabsList>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="map">Incident Map</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="incidents">
            <Card>
              <CardHeader>
                <CardTitle>Priority Incidents</CardTitle>
                <CardDescription>Incidents requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 border-red-200 bg-red-50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Water Main Break</h3>
                      <Badge variant="destructive">Critical</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Major water main break affecting 200+ homes</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        Downtown District
                      </div>
                      <Button size="sm">Assign Team</Button>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 border-orange-200 bg-orange-50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Traffic Light Malfunction</h3>
                      <Badge variant="secondary">High</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Traffic lights not working at major intersection</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        Main St & 5th Ave
                      </div>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Pothole Cluster</h3>
                      <Badge variant="outline">Medium</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Multiple potholes reported in residential area</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        Oak Street District
                      </div>
                      <Button size="sm" variant="outline">Schedule Repair</Button>
                    </div>
                  </div>
                </div>
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
              <Card>
                <CardHeader>
                  <CardTitle>Response Times</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Average Response Time</span>
                      <Badge variant="secondary">2.4 hours</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Critical Issues</span>
                      <Badge variant="secondary">18 min</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Resolution Rate</span>
                      <Badge variant="secondary">94%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Issue Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Infrastructure</span>
                      <Badge variant="secondary">45%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Public Services</span>
                      <Badge variant="secondary">28%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Environmental</span>
                      <Badge variant="secondary">18%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Emergency</span>
                      <Badge variant="secondary">9%</Badge>
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
