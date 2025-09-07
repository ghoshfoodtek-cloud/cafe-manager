import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthContext";
import { logout } from "@/lib/auth-enhanced";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { User, LogOut, Settings } from "lucide-react";

const AppHeader = () => {
  const { user, canManageUsers, refreshAuth } = useAuth();

  const handleLogout = () => {
    logout();
    refreshAuth();
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <nav className="container mx-auto flex items-center justify-between py-4">
        <Link to="/" className="text-h3 font-bold text-foreground hover:text-primary transition-colors">
          Bharat Connect Pro
        </Link>
        <div className="flex items-center gap-1">
          <div className="flex items-center bg-background-subtle rounded-lg p-1 mr-3">
            <NavLink
              to="/clients"
              className={({ isActive }) =>
                cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-background-hover"
                )
              }
            >
              Clients
            </NavLink>
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-background-hover"
                )
              }
            >
              Orders
            </NavLink>
          </div>
          
          <Link to="/clients/new">
            <Button size="sm" className="mr-2">New Client</Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2 h-9">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-sm font-medium">{user?.name}</span>
                  <Badge 
                    variant={user?.role === 'admin' ? 'default' : 'secondary'} 
                    className="text-xs capitalize"
                  >
                    {user?.role}
                  </Badge>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {canManageUsers && (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/users" className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      User Management
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
};

export default AppHeader;
