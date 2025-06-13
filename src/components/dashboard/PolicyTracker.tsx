
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Calendar, Users, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface Policy {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'review' | 'voting' | 'approved' | 'implemented';
  category: string;
  priority: 'low' | 'medium' | 'high';
  progress: number;
  votes_for: number;
  votes_against: number;
  created_at: string;
  deadline: string;
}

export function PolicyTracker() {
  const [policies, setPolicies] = useState<Policy[]>([
    {
      id: "1",
      title: "Climate Action Initiative 2024",
      description: "Comprehensive plan to reduce city carbon emissions by 50% by 2030",
      status: "voting",
      category: "Environment",
      priority: "high",
      progress: 75,
      votes_for: 23,
      votes_against: 5,
      created_at: "2024-01-10T00:00:00Z",
      deadline: "2024-01-25T00:00:00Z"
    },
    {
      id: "2",
      title: "Public Transportation Expansion",
      description: "Extension of bus routes to underserved neighborhoods",
      status: "review",
      category: "Transportation",
      priority: "high",
      progress: 60,
      votes_for: 0,
      votes_against: 0,
      created_at: "2024-01-12T00:00:00Z",
      deadline: "2024-02-01T00:00:00Z"
    },
    {
      id: "3",
      title: "Digital Services Modernization",
      description: "Upgrade city website and digital services for better citizen access",
      status: "approved",
      category: "Technology",
      priority: "medium",
      progress: 90,
      votes_for: 18,
      votes_against: 2,
      created_at: "2024-01-05T00:00:00Z",
      deadline: "2024-01-20T00:00:00Z"
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'voting': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'implemented': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'review': return <AlertCircle className="h-4 w-4" />;
      case 'voting': return <Users className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'implemented': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Tabs defaultValue="active" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="active">Active Policies</TabsTrigger>
        <TabsTrigger value="voting">Voting Phase</TabsTrigger>
        <TabsTrigger value="implemented">Implemented</TabsTrigger>
      </TabsList>

      <TabsContent value="active" className="space-y-4">
        {policies.filter(p => ['draft', 'review', 'approved'].includes(p.status)).map((policy) => (
          <Card key={policy.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(policy.status)}
                    {policy.title}
                  </CardTitle>
                  <CardDescription>{policy.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(policy.status)}>
                    {policy.status}
                  </Badge>
                  <Badge className={getPriorityColor(policy.priority)}>
                    {policy.priority} priority
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Calendar className="h-4 w-4" />
                    Deadline: {formatDate(policy.deadline)}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Days remaining: </span>
                    <span className={getDaysRemaining(policy.deadline) < 7 ? 'text-red-600' : 'text-green-600'}>
                      {getDaysRemaining(policy.deadline)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{policy.progress}%</span>
                  </div>
                  <Progress value={policy.progress} className="h-2" />
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">View Details</Button>
                <Button variant="outline" size="sm">Edit</Button>
                {policy.status === 'review' && (
                  <Button size="sm">Move to Voting</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="voting" className="space-y-4">
        {policies.filter(p => p.status === 'voting').map((policy) => (
          <Card key={policy.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {policy.title}
                  </CardTitle>
                  <CardDescription>{policy.description}</CardDescription>
                </div>
                <Badge className={getStatusColor(policy.status)}>
                  {policy.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Voting Results</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Votes For:</span>
                      <span className="font-medium">{policy.votes_for}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-red-600">Votes Against:</span>
                      <span className="font-medium">{policy.votes_against}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-1">
                      <span>Total Votes:</span>
                      <span className="font-medium">{policy.votes_for + policy.votes_against}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Vote Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{
                            width: `${(policy.votes_for / (policy.votes_for + policy.votes_against)) * 100}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-sm">
                        {Math.round((policy.votes_for / (policy.votes_for + policy.votes_against)) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                Voting ends: {formatDate(policy.deadline)}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">View Voting Details</Button>
                <Button variant="outline" size="sm">Export Results</Button>
                <Button size="sm">Close Voting</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="implemented" className="space-y-4">
        {policies.filter(p => p.status === 'implemented').map((policy) => (
          <Card key={policy.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    {policy.title}
                  </CardTitle>
                  <CardDescription>{policy.description}</CardDescription>
                </div>
                <Badge className={getStatusColor(policy.status)}>
                  {policy.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">View Impact Report</Button>
                <Button variant="outline" size="sm">View Implementation Details</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>
    </Tabs>
  );
}
