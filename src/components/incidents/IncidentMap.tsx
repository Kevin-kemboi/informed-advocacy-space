
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, AlertTriangle, Wrench, TreePine } from "lucide-react";

export function IncidentMap() {
  const incidents = [
    { id: 1, title: "Water Main Break", type: "emergency", lat: 40.7128, lng: -74.0060, priority: "critical" },
    { id: 2, title: "Pothole Repair", type: "infrastructure", lat: 40.7589, lng: -73.9851, priority: "medium" },
    { id: 3, title: "Tree Down", type: "environmental", lat: 40.7831, lng: -73.9712, priority: "high" },
    { id: 4, title: "Streetlight Out", type: "infrastructure", lat: 40.7505, lng: -73.9934, priority: "low" },
  ];

  const getIncidentIcon = (type: string) => {
    switch (type) {
      case "emergency":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "infrastructure":
        return <Wrench className="h-4 w-4 text-orange-500" />;
      case "environmental":
        return <TreePine className="h-4 w-4 text-green-500" />;
      default:
        return <MapPin className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "destructive";
      case "high":
        return "secondary";
      case "medium":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Incident Map</CardTitle>
          <CardDescription>Geographic view of all reported incidents</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for actual map component */}
          <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Interactive Map</p>
              <p className="text-sm text-gray-500">
                In a real implementation, this would show an interactive map with incident markers
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {incidents.map((incident) => (
              <div key={incident.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getIncidentIcon(incident.type)}
                  <div>
                    <p className="font-medium">{incident.title}</p>
                    <p className="text-sm text-gray-600">
                      {incident.lat.toFixed(4)}, {incident.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
                <Badge variant={getPriorityColor(incident.priority) as any}>
                  {incident.priority}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
