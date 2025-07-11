
import { useAuth } from "@/hooks/useAuth"
import { CitizenDashboard } from "@/components/dashboard/CitizenDashboard"
import { OfficialDashboard } from "@/components/dashboard/OfficialDashboard"
import { AdminDashboard } from "@/components/dashboard/AdminDashboard"
import { AuthModal } from "@/components/auth/AuthModal"
import { LandingPage } from "@/components/landing/LandingPage"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function Index() {
  const { user, profile, loading, signOut } = useAuth()

  console.log('Index: Rendering with state:', { 
    user: user?.id, 
    profile: profile?.full_name, 
    role: profile?.role,
    loading 
  })

  if (loading) {
    console.log('Index: Auth loading, showing spinner')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <Card className="text-center py-12 px-8">
          <CardContent className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Loading your profile...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user || !profile) {
    console.log('Index: No user or profile, showing landing page', { user: !!user, profile: !!profile })
    return <LandingPage />
  }

  console.log('Index: Rendering dashboard for role:', profile.role)
  
  switch (profile.role) {
    case 'admin':
      return <AdminDashboard user={profile} onLogout={signOut} />
    case 'government_official':
      return <OfficialDashboard user={profile} onLogout={signOut} />
    case 'citizen':
    default:
      return <CitizenDashboard user={profile} onLogout={signOut} />
  }
}
