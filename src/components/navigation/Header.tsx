
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Home, LogOut, User, Settings, Keyboard } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useEffect } from "react"
import { useNavigation } from "@/hooks/useNavigation"

export function Header() {
  const { user, profile, signOut } = useAuth()
  const { goBack, goForward } = useNavigation()

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + Left Arrow = Back
      if (event.altKey && event.key === 'ArrowLeft') {
        event.preventDefault()
        goBack()
      }
      // Alt + Right Arrow = Forward
      if (event.altKey && event.key === 'ArrowRight') {
        event.preventDefault()
        goForward()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goBack, goForward])

  if (!user || !profile) return null

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Home className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CivicVoice
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Badge variant="outline" className="hidden sm:inline-flex">
            {profile.role.replace('_', ' ')}
          </Badge>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden md:flex">
                  <Keyboard className="h-4 w-4 mr-2" />
                  Shortcuts
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm space-y-1">
                  <div><kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Alt + ←</kbd> Go Back</div>
                  <div><kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Alt + →</kbd> Go Forward</div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={profile.profile_pic_url} alt={profile.full_name} />
                  <AvatarFallback>
                    {profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{profile.full_name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {profile.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
