
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Shield, Ban } from "lucide-react";

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");

  const users = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@email.com",
      role: "citizen",
      status: "active",
      joinDate: "2024-01-15",
      lastActive: "2 hours ago"
    },
    {
      id: 2,
      name: "Sarah Wilson",
      email: "sarah.wilson@gov.com",
      role: "government_official",
      status: "active",
      joinDate: "2023-12-08",
      lastActive: "1 hour ago"
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike.johnson@email.com",
      role: "citizen",
      status: "suspended",
      joinDate: "2024-01-10",
      lastActive: "3 days ago"
    },
    {
      id: 4,
      name: "Emily Chen",
      email: "emily.chen@email.com",
      role: "citizen",
      status: "active",
      joinDate: "2024-01-20",
      lastActive: "30 minutes ago"
    }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "government_official":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "secondary";
      case "suspended":
        return "destructive";
      default:
        return "outline";
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Manage user accounts and roles</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">Joined {user.joinDate} • Last active {user.lastActive}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={getRoleColor(user.role) as any}>
                    {user.role}
                  </Badge>
                  <Badge variant={getStatusColor(user.status) as any}>
                    {user.status}
                  </Badge>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline">
                      <Shield className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Ban className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Users</span>
                <Badge variant="secondary">1,247</Badge>
              </div>
              <div className="flex justify-between">
                <span>Active Citizens</span>
                <Badge variant="secondary">1,156</Badge>
              </div>
              <div className="flex justify-between">
                <span>Government Officials</span>
                <Badge variant="secondary">89</Badge>
              </div>
              <div className="flex justify-between">
                <span>Administrators</span>
                <Badge variant="secondary">2</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm">
                <p className="font-medium">New registrations</p>
                <p className="text-gray-600">+15 today</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">Active sessions</p>
                <p className="text-gray-600">892 users online</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">Account suspensions</p>
                <p className="text-gray-600">3 this week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Citizens</span>
                <span>92.7%</span>
              </div>
              <div className="flex justify-between">
                <span>Officials</span>
                <span>7.1%</span>
              </div>
              <div className="flex justify-between">
                <span>Admins</span>
                <span>0.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
