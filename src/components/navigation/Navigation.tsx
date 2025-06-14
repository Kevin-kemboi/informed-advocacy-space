
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Home,
  RotateCcw,
  Menu
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigation } from "@/hooks/useNavigation";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

export function Navigation() {
  const { canGoBack, canGoForward, goBack, goForward, breadcrumbs, navigate } = useNavigation();
  const { profile } = useAuth();

  const quickActions = [
    { 
      label: 'Dashboard', 
      path: '/', 
      icon: Home,
      show: !!profile 
    },
    { 
      label: 'Refresh Page', 
      action: () => window.location.reload(), 
      icon: RotateCcw,
      show: true 
    }
  ];

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-lg border-b border-gray-200">
      {/* Back/Forward Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={goBack}
          disabled={!canGoBack}
          className="h-8 w-8 p-0"
          title="Go back"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={goForward}
          disabled={!canGoForward}
          className="h-8 w-8 p-0"
          title="Go forward"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Breadcrumbs */}
      <div className="flex-1 mx-4">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center">
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {index === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage className="font-medium">
                      {crumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link 
                        to={crumb.path}
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Quick Actions Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Menu className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {quickActions
            .filter(action => action.show)
            .map((action, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => {
                  if (action.path) {
                    navigate(action.path);
                  } else if (action.action) {
                    action.action();
                  }
                }}
                className="flex items-center gap-2"
              >
                <action.icon className="h-4 w-4" />
                {action.label}
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
