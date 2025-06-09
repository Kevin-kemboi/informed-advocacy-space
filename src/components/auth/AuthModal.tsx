
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userData: any) => void;
}

export function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("citizen");
  const { toast } = useToast();

  const handleLogin = () => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    // Mock authentication - in real app this would use Supabase auth
    const userData = {
      id: Date.now().toString(),
      email,
      fullName: email === "admin@gov.com" ? "Admin User" : 
               email === "official@gov.com" ? "Government Official" : "Citizen User",
      role: email === "admin@gov.com" ? "admin" : 
            email === "official@gov.com" ? "government_official" : "citizen"
    };

    onLogin(userData);
    toast({
      title: "Welcome!",
      description: `Logged in as ${userData.role}`
    });
  };

  const handleRegister = () => {
    if (!email || !password || !fullName) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    // Mock registration
    const userData = {
      id: Date.now().toString(),
      email,
      fullName,
      role
    };

    onLogin(userData);
    toast({
      title: "Account Created!",
      description: "Welcome to CivicConnect"
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join CivicConnect</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button onClick={handleLogin} className="w-full">
                  Login
                </Button>
                <div className="text-sm text-muted-foreground">
                  <p>Demo accounts:</p>
                  <p>• admin@gov.com (Admin)</p>
                  <p>• official@gov.com (Government Official)</p>
                  <p>• Any other email (Citizen)</p>
                  <p>Password: any</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Register</CardTitle>
                <CardDescription>
                  Create a new account to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <RadioGroup value={role} onValueChange={setRole}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="citizen" id="citizen" />
                      <Label htmlFor="citizen">Citizen</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="government_official" id="official" />
                      <Label htmlFor="official">Government Official</Label>
                    </div>
                  </RadioGroup>
                </div>
                <Button onClick={handleRegister} className="w-full">
                  Register
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
