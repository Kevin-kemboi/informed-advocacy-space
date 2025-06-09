
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Database, Server, Zap } from "lucide-react";

export function SystemHealth() {
  const metrics = [
    { name: "API Response Time", value: "245ms", status: "good", percentage: 85 },
    { name: "Database Performance", value: "98.9%", status: "excellent", percentage: 98 },
    { name: "Server Uptime", value: "99.97%", status: "excellent", percentage: 99 },
    { name: "Error Rate", value: "0.03%", status: "good", percentage: 97 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "secondary";
      case "good":
        return "outline";
      case "warning":
        return "secondary";
      case "critical":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">System Health</h2>
        <p className="text-gray-600">Monitor platform performance and status</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-500" />
              API Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-sm text-gray-600">All endpoints operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Database className="h-5 w-5 mr-2 text-blue-500" />
              Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-sm text-gray-600">Optimal performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Server className="h-5 w-5 mr-2 text-purple-500" />
              Servers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">3/3</div>
            <p className="text-sm text-gray-600">All servers running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Activity className="h-5 w-5 mr-2 text-green-500" />
              Load
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Normal</div>
            <p className="text-sm text-gray-600">Within limits</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Real-time system performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {metrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{metric.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(metric.status) as any}>
                      {metric.status}
                    </Badge>
                    <span className="text-sm font-mono">{metric.value}</span>
                  </div>
                </div>
                <Progress value={metric.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded border-green-200">
                <div>
                  <p className="font-medium text-green-800">System backup completed</p>
                  <p className="text-sm text-green-600">2 hours ago</p>
                </div>
                <Badge variant="secondary">Info</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded border-yellow-200">
                <div>
                  <p className="font-medium text-yellow-800">High API usage detected</p>
                  <p className="text-sm text-yellow-600">4 hours ago</p>
                </div>
                <Badge variant="outline">Warning</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded border-blue-200">
                <div>
                  <p className="font-medium text-blue-800">Security scan completed</p>
                  <p className="text-sm text-blue-600">1 day ago</p>
                </div>
                <Badge variant="outline">Info</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">CPU Usage</span>
                  <span className="text-sm">45%</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Memory Usage</span>
                  <span className="text-sm">67%</span>
                </div>
                <Progress value={67} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Storage Usage</span>
                  <span className="text-sm">34%</span>
                </div>
                <Progress value={34} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Bandwidth Usage</span>
                  <span className="text-sm">78%</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
