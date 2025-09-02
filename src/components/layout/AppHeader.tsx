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
    <header className="border-b bg-background">
      <nav className="container mx-auto flex items-center justify-between py-3">
        <Link to="/" className="text-lg font-semibold text-foreground">
          Bharat Connect Pro
        </Link>
        <div className="flex items-center gap-2">
          <NavLink
            to="/clients"
            className={({ isActive }) =>
              cn(
                "px-3 py-2 rounded-md text-sm text-foreground hover:bg-accent",
                isActive && "bg-accent"
              )
            }
          >
            Clients
          </NavLink>
          <NavLink
            to="/orders"
            className={({ isActive }) =>
              cn(
                "px-3 py-2 rounded-md text-sm text-foreground hover:bg-accent",
                isActive && "bg-accent"
              )
            }
          >
            Orders
          </NavLink>
          <Link to="/clients/new">
            <Button size="sm">New Client</Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{user?.name}</span>
                <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                  {user?.role}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
              <DropdownMenuItem onClick={handleLogout}>
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
