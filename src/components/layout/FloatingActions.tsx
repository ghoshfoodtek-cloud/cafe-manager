import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, UserPlus, Users, ShoppingCart, Trash2, PhoneCall, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FloatingActions = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <DropdownMenu>
        <Tooltip>
          <DropdownMenuTrigger asChild>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                className="h-14 w-14 rounded-full shadow-lg hover-scale"
                aria-label="Quick actions"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
          </DropdownMenuTrigger>
          <TooltipContent side="left">Quick Actions</TooltipContent>
        </Tooltip>

        <DropdownMenuContent side="top" align="end" className="min-w-[14rem]">
          <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => navigate("/clients/new")}> 
            <UserPlus className="mr-2 h-4 w-4" /> New Client
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => navigate("/clients")}> 
            <Users className="mr-2 h-4 w-4" /> View Clients
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => navigate("/calls")}>
            <PhoneCall className="mr-2 h-4 w-4" /> Call Logs
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => navigate("/events/new")}> 
            <Calendar className="mr-2 h-4 w-4" /> Add Event
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => navigate("/orders")}> 
            <ShoppingCart className="mr-2 h-4 w-4" /> View Orders
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => navigate("/orders/bin")}> 
            <Trash2 className="mr-2 h-4 w-4" /> Orders Bin
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default FloatingActions;
