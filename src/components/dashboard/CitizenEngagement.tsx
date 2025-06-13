
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquare, ThumbsUp, Flag, Users, TrendingUp, Eye } from "lucide-react";

interface EngagementItem {
  id: string;
  type: 'post' | 'poll' | 'comment';
  content: string;
  author: string;
  category: string;
  engagement_score: number;
  likes: number;
  flags: number;
  created_at: string;
}

export function CitizenEngagement() {
  const [engagementData, setEngagementData] = useState<EngagementItem[]>([
    {
      id: "1",
      type: "post",
      content: "The new bike lanes on Main Street are causing more traffic congestion. We need better planning for future infrastructure projects.",
      author: "Sarah Johnson",
      category: "Transportation",
      engagement_score: 85,
      likes: 23,
      flags: 1,
      created_at: "2024-01-15T10:30:00Z"
    },
    {
      id: "2",
      type: "poll",
      content: "Should the city invest more in renewable energy initiatives?",
      author: "Mike Chen",
      category: "Environment",
      engagement_score: 92,
      likes: 45,
      flags: 0,
      created_at: "2024-01-15T09:15:00Z"
    },
    {
      id: "3",
      type: "post",
      content: "The library's extended hours have been incredibly helpful for working parents. Thank you to the city council for this decision!",
      author: "Anna Davis",
      category: "Public Services",
      engagement_score: 78,
      likes: 18,
      flags: 0,
      created_at: "2024-01-14T16:45:00Z"
    }
  ]);

  const [response, setResponse] = useState("");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'post': return <MessageSquare className="h-4 w-4" />;
      case 'poll': return <TrendingUp className="h-4 w-4" />;
      case 'comment': return <MessageSquare className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Transportation': return 'bg-blue-100 text-blue-800';
      case 'Environment': return 'bg-green-100 text-green-800';
      case 'Public Services': return 'bg-purple-100 text-purple-800';
      case 'Infrastructure': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEngagementLevel = (score: number) => {
    if (score >= 90) return { level: 'Very High', color: 'text-green-600' };
    if (score >= 70) return { level: 'High', color: 'text-blue-600' };
    if (score >= 50) return { level: 'Medium', color: 'text-yellow-600' };
    return { level: 'Low', color: 'text-gray-600' };
  };

  const handleRespond = (itemId: string) => {
    if (!response.trim()) return;
    
    // In a real app, this would send the response to the backend
    console.log(`Official response to ${itemId}:`, response);
    setResponse("");
    setSelectedItem(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-gray-600">This week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Priority Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-gray-600">Needs attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-gray-600">Within 24h</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2</div>
            <p className="text-xs text-gray-600">Out of 5.0</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {engagementData.map((item) => {
          const engagement = getEngagementLevel(item.engagement_score);
          
          return (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(item.type)}
                    <span className="font-medium capitalize">{item.type}</span>
                    <Badge className={getCategoryColor(item.category)}>
                      {item.category}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${engagement.color}`}>
                      {engagement.level} Engagement
                    </div>
                    <div className="text-xs text-gray-500">
                      Score: {item.engagement_score}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-700">{item.content}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-4">
                    <span>By {item.author}</span>
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      {item.likes}
                    </div>
                    {item.flags > 0 && (
                      <div className="flex items-center gap-1 text-red-600">
                        <Flag className="h-4 w-4" />
                        {item.flags}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {Math.round(item.engagement_score * 1.5)}
                    </div>
                  </div>
                </div>

                {selectedItem === item.id ? (
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    <Label htmlFor="response">Official Response</Label>
                    <Textarea
                      id="response"
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Provide an official response to this citizen engagement..."
                      className="min-h-[100px]"
                    />
                    <div className="flex gap-2">
                      <Button onClick={() => handleRespond(item.id)} disabled={!response.trim()}>
                        Submit Response
                      </Button>
                      <Button variant="outline" onClick={() => setSelectedItem(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedItem(item.id)}
                    >
                      Respond
                    </Button>
                    <Button variant="outline" size="sm">
                      Mark as Priority
                    </Button>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
