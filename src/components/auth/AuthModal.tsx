
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Verification codes for special roles (in production, these would be from a secure source)
const VERIFICATION_CODES = {
  admin: "ADMIN2024",
  government_official: "GOVT2024"
};

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<'citizen' | 'government_official' | 'admin'>("citizen");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleRoleChange = (newRole: 'citizen' | 'government_official' | 'admin') => {
    setRole(newRole);
    setShowVerification(newRole !== 'citizen');
    setVerificationCode("");
  };

  const validateVerificationCode = (selectedRole: string, code: string): boolean => {
    if (selectedRole === 'citizen') return true;
    return VERIFICATION_CODES[selectedRole as keyof typeof VERIFICATION_CODES] === code;
  };

  const handleLogin = async () => {
    if (!email || !password) return;
    
    setLoading(true);
    try {
      await signIn(email, password);
      onClose();
      resetForm();
    } catch (error) {
      // Error is handled in useAuth hook
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !fullName) return;
    
    if (showVerification && !validateVerificationCode(role, verificationCode)) {
      alert("Invalid verification code for the selected role.");
      return;
    }
    
    setLoading(true);
    try {
      await signUp(email, password, fullName, role);
      onClose();
      resetForm();
    } catch (error) {
      // Error is handled in useAuth hook
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setRole("citizen");
    setVerificationCode("");
    setShowVerification(false);
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
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button onClick={handleLogin} className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Login"}
                </Button>
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
                    disabled={loading}
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
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <Select value={role} onValueChange={handleRoleChange} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="citizen">Citizen</SelectItem>
                      <SelectItem value="government_official">Government Official</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {showVerification && (
                  <div>
                    <Label htmlFor="verificationCode">Verification Code</Label>
                    <Input
                      id="verificationCode"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Enter verification code"
                      disabled={loading}
                    />
                    <Alert className="mt-2">
                      <AlertDescription>
                        {role === 'admin' 
                          ? "Admin access requires a verification code. Contact your system administrator."
                          : "Government Official access requires a verification code. Contact your department administrator."
                        }
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
                
                <Button onClick={handleRegister} className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Register"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
