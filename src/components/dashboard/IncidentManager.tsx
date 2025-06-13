
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, MapPin, Clock, User, MessageSquare } from "lucide-react";

interface Incident {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'resolved';
  location: string;
  reported_by: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export function IncidentManager() {
  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: "1",
      title: "Water Main Break",
      description: "Major water main break affecting 200+ homes in downtown district",
      priority: "critical",
      status: "pending",
      location: "Downtown District, Main St",
      reported_by: "Sarah Johnson",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    {
      id: "2",
      title: "Traffic Light Malfunction",
      description: "Traffic lights not working at major intersection causing congestion",
      priority: "high",
      status: "in_progress",
      location: "Main St & 5th Ave",
      reported_by: "Mike Chen",
      assigned_to: "Traffic Department",
      created_at: "2024-01-15T09:15:00Z",
      updated_at: "2024-01-15T11:00:00Z"
    },
    {
      id: "3",
      title: "Pothole Cluster",
      description: "Multiple potholes reported in residential area affecting vehicle safety",
      priority: "medium",
      status: "pending",
      location: "Oak Street District",
      reported_by: "Anna Davis",
      created_at: "2024-01-14T16:45:00Z",
      updated_at: "2024-01-14T16:45:00Z"
    }
  ]);

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [assigneeName, setAssigneeName] = useState("");
  const [statusUpdate, setStatusUpdate] = useState("");

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAssignTeam = (incidentId: string) => {
    if (!assigneeName.trim()) return;
    
    setIncidents(prev => prev.map(incident => 
      incident.id === incidentId 
        ? { ...incident, assigned_to: assigneeName, status: 'in_progress', updated_at: new Date().toISOString() }
        : incident
    ));
    setAssigneeName("");
  };

  const handleStatusChange = (incidentId: string, newStatus: string) => {
    setIncidents(prev => prev.map(incident => 
      incident.id === incidentId 
        ? { ...incident, status: newStatus as any, updated_at: new Date().toISOString() }
        : incident
    ));
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
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {incidents.map((incident) => (
          <Card key={incident.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  {incident.title}
                </CardTitle>
                <Badge className={getPriorityColor(incident.priority)}>
                  {incident.priority}
                </Badge>
              </div>
              <CardDescription className="text-sm">
                {incident.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                {incident.location}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                Reported by {incident.reported_by}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                {formatDate(incident.created_at)}
              </div>

              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(incident.status)}>
                  {incident.status.replace('_', ' ')}
                </Badge>
                {incident.assigned_to && (
                  <span className="text-sm text-gray-600">
                    Assigned to: {incident.assigned_to}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {incident.status === 'pending' && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Assign to team/person"
                      value={assigneeName}
                      onChange={(e) => setAssigneeName(e.target.value)}
                      className="text-sm"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handleAssignTeam(incident.id)}
                      disabled={!assigneeName.trim()}
                    >
                      Assign
                    </Button>
                  </div>
                )}
                
                <Select onValueChange={(value) => handleStatusChange(incident.id, value)}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Update status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
