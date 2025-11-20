import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, Users, ShoppingBag, Calendar, Phone, Settings, 
  Plus, BarChart3, Archive, UserPlus
} from "lucide-react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useQuery } from "@tanstack/react-query";
import { getClients } from "@/lib/supabase-clients";
import { getOrders } from "@/lib/supabase-orders";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const mainNavItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Clients", url: "/clients", icon: Users },
  { title: "Orders", url: "/orders", icon: ShoppingBag },
  { title: "Events", url: "/events", icon: Calendar },
  { title: "Call Logs", url: "/calls", icon: Phone },
];

const quickActions = [
  { title: "New Client", url: "/clients/new", icon: UserPlus },
  { title: "New Order", url: "/orders/new", icon: Plus },
  { title: "Add Event", url: "/events/new", icon: Calendar },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { canDelete, canManageUsers } = useSupabaseAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  // Get stats from Supabase
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: () => getOrders()
  });

  const pendingOrders = orders.filter(o => o.status === "pending").length;

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const getNavClassName = (isActive: boolean) =>
    isActive 
      ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" 
      : "hover:bg-muted/50 transition-colors";

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent>
        {/* Brand */}
        <div className="p-4">
          {!collapsed ? (
            <h2 className="text-lg font-semibold text-primary">Bharat Connect</h2>
          ) : (
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>

        {/* Mini Stats */}
        {!collapsed && (
          <div className="px-4 pb-4">
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Clients</span>
                <Badge variant="secondary">{clients.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pending Orders</span>
                <Badge variant="outline">{pendingOrders}</Badge>
              </div>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"} 
                      className={getNavClassName(isActive(item.url))}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Quick Actions */}
        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className="hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section */}
        {(canDelete || canManageUsers) && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {canDelete && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to="/orders/bin"
                          className={getNavClassName(isActive("/orders/bin"))}
                        >
                          <Archive className="h-4 w-4" />
                          {!collapsed && <span>Orders Bin</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  {canManageUsers && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to="/users"
                          className={getNavClassName(isActive("/users"))}
                        >
                          <Settings className="h-4 w-4" />
                          {!collapsed && <span>User Management</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}