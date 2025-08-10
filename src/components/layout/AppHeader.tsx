import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AppHeader = () => {
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
        </div>
      </nav>
    </header>
  );
};

export default AppHeader;
