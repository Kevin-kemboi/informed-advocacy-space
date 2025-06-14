
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Users, Shield, Crown, Mail, Lock, User } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"

interface AuthModalProps {
  onClose?: () => void
}

export function AuthModal({ onClose }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState("citizen")
  const { signIn, signUp } = useAuth()
  const { toast } = useToast()

  const handleSignIn = async () => {
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      await signIn(email, password)
      onClose?.()
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in."
      })
    } catch (error: any) {
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async () => {
    if (!email || !password || !fullName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      await signUp(email, password, fullName, role)
      onClose?.()
      toast({
        title: "Welcome to CivicConnect!",
        description: "Your account has been created successfully."
      })
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleIcon = (roleType: string) => {
    switch (roleType) {
      case 'admin': return <Crown className="h-4 w-4" />
      case 'government_official': return <Shield className="h-4 w-4" />
      default: return <Users className="h-4 w-4" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-lg shadow-2xl border-0">
        <CardHeader className="relative">
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute right-2 top-2 h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <CardTitle className="text-2xl text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to CivicConnect
          </CardTitle>
          <CardDescription className="text-center">
            Join your community and make your voice heard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="signin" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button 
                onClick={handleSignIn} 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="citizen">
                      <div className="flex items-center gap-2">
                        {getRoleIcon('citizen')}
                        <span>Citizen</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="government_official">
                      <div className="flex items-center gap-2">
                        {getRoleIcon('government_official')}
                        <span>Government Official</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleSignUp} 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
