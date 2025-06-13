
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Shield, User, Crown, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Enhanced verification system with multiple codes per role
const VERIFICATION_CODES = {
  admin: ["ADMIN2024", "SUPER_ADMIN_2024", "CITY_ADMIN_KEY"],
  government_official: ["GOVT2024", "OFFICIAL_ACCESS_2024", "MUNICIPAL_KEY_2024"]
};

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<'citizen' | 'government_official' | 'admin'>("citizen");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const { signIn, signUp } = useAuth();

  const handleRoleChange = (newRole: 'citizen' | 'government_official' | 'admin') => {
    setRole(newRole);
    setShowVerification(newRole !== 'citizen');
    setVerificationCode("");
    setVerificationStatus('idle');
  };

  const validateVerificationCode = (selectedRole: string, code: string): boolean => {
    if (selectedRole === 'citizen') return true;
    const validCodes = VERIFICATION_CODES[selectedRole as keyof typeof VERIFICATION_CODES] || [];
    return validCodes.includes(code);
  };

  const handleVerificationCodeChange = (code: string) => {
    setVerificationCode(code);
    if (code.length > 0 && role !== 'citizen') {
      const isValid = validateVerificationCode(role, code);
      setVerificationStatus(isValid ? 'valid' : 'invalid');
    } else {
      setVerificationStatus('idle');
    }
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
    setVerificationStatus('idle');
  };

  const getRoleIcon = (roleType: string) => {
    switch (roleType) {
      case 'admin': return <Crown className="h-4 w-4" />;
      case 'government_official': return <Shield className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (roleType: string) => {
    switch (roleType) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'government_official': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            Join CivicConnect
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>
                  Sign in to your CivicConnect account
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
                <Button onClick={handleLogin} className="w-full" disabled={loading || !email || !password}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  Join the civic engagement platform
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
                    placeholder="Minimum 6 characters"
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label>Account Type</Label>
                  <Select value={role} onValueChange={handleRoleChange} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="citizen">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Citizen
                        </div>
                      </SelectItem>
                      <SelectItem value="government_official">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Government Official
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4" />
                          Administrator
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {role && (
                    <div className="mt-2">
                      <Badge className={`${getRoleColor(role)}`}>
                        {getRoleIcon(role)}
                        <span className="ml-1 capitalize">{role.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                  )}
                </div>
                
                {showVerification && (
                  <div>
                    <Label htmlFor="verificationCode">
                      Access Code
                      {verificationStatus === 'valid' && <CheckCircle className="inline h-4 w-4 ml-1 text-green-600" />}
                      {verificationStatus === 'invalid' && <AlertCircle className="inline h-4 w-4 ml-1 text-red-600" />}
                    </Label>
                    <Input
                      id="verificationCode"
                      value={verificationCode}
                      onChange={(e) => handleVerificationCodeChange(e.target.value)}
                      placeholder="Enter your access code"
                      disabled={loading}
                      className={
                        verificationStatus === 'valid' ? 'border-green-500' :
                        verificationStatus === 'invalid' ? 'border-red-500' : ''
                      }
                    />
                    <Alert className="mt-2">
                      <AlertDescription>
                        {role === 'admin' 
                          ? "Administrator access requires a special access code. Contact your system administrator or use: ADMIN2024, SUPER_ADMIN_2024, or CITY_ADMIN_KEY"
                          : "Government Official access requires verification. Contact your department administrator or use: GOVT2024, OFFICIAL_ACCESS_2024, or MUNICIPAL_KEY_2024"
                        }
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
                
                <Button 
                  onClick={handleRegister} 
                  className="w-full" 
                  disabled={
                    loading || 
                    !email || 
                    !password || 
                    !fullName ||
                    (showVerification && verificationStatus !== 'valid')
                  }
                >
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
