
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, AlertTriangle, ThumbsUp, MessageSquare } from "lucide-react";

export function AIInsights() {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              Citizen Sentiment Analysis
            </CardTitle>
            <CardDescription>AI-powered analysis of citizen feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Positive</span>
                  <span className="text-sm">64%</span>
                </div>
                <Progress value={64} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Neutral</span>
                  <span className="text-sm">22%</span>
                </div>
                <Progress value={22} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Negative</span>
                  <span className="text-sm">14%</span>
                </div>
                <Progress value={14} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Trending Issues
            </CardTitle>
            <CardDescription>Most discussed topics this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Infrastructure Repair</span>
                <Badge variant="secondary">+45%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Public Transportation</span>
                <Badge variant="secondary">+32%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Community Safety</span>
                <Badge variant="secondary">+28%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Environmental Issues</span>
                <Badge variant="secondary">+15%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            AI-Generated Priority Recommendations
          </CardTitle>
          <CardDescription>Based on citizen feedback and incident patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-red-500 pl-4 py-2">
              <h3 className="font-semibold text-red-700">Critical Priority</h3>
              <p className="text-sm text-gray-600">
                Water infrastructure in Downtown District requires immediate attention. 
                Multiple reports indicate aging pipes affecting 200+ households.
              </p>
              <div className="mt-2 flex gap-2">
                <Badge variant="destructive">Urgent</Badge>
                <Badge variant="outline">Infrastructure</Badge>
              </div>
            </div>

            <div className="border-l-4 border-orange-500 pl-4 py-2">
              <h3 className="font-semibold text-orange-700">High Priority</h3>
              <p className="text-sm text-gray-600">
                Traffic management system upgrades needed. Citizens report increased 
                congestion and safety concerns at major intersections.
              </p>
              <div className="mt-2 flex gap-2">
                <Badge variant="secondary">High</Badge>
                <Badge variant="outline">Transportation</Badge>
              </div>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4 py-2">
              <h3 className="font-semibold text-yellow-700">Medium Priority</h3>
              <p className="text-sm text-gray-600">
                Park maintenance and green space improvements. Community requests 
                for better recreational facilities and landscaping.
              </p>
              <div className="mt-2 flex gap-2">
                <Badge variant="outline">Medium</Badge>
                <Badge variant="outline">Parks & Recreation</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Insights Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <ThumbsUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="font-semibold">High Satisfaction</p>
              <p className="text-sm text-gray-600">Emergency response times</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="font-semibold">Action Needed</p>
              <p className="text-sm text-gray-600">Infrastructure maintenance</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold">Improving</p>
              <p className="text-sm text-gray-600">Citizen engagement</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
