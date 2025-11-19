import { Link } from "react-router-dom";
import { UserPlus, Plus, Calendar, BarChart3, Phone, Archive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

const quickActionItems = [
  {
    title: "New Client",
    description: "Add a new client to your CRM",
    icon: UserPlus,
    href: "/clients/new",
    variant: "default" as const,
  },
  {
    title: "Create Order",
    description: "Start a new order process",
    icon: Plus,
    href: "/orders/new",
    variant: "outline" as const,
  },
  {
    title: "Add Event",
    description: "Log a new global event",
    icon: Calendar,
    href: "/events/new",
    variant: "outline" as const,
  },
  {
    title: "View Reports",
    description: "Access analytics and reports",
    icon: BarChart3,
    href: "/",
    variant: "ghost" as const,
  },
];

export function QuickActions() {
  const { canDelete, canManageUsers } = useSupabaseAuth();

  const adminActions = [
    ...(canDelete ? [{
      title: "Orders Bin",
      description: "Manage deleted orders",
      icon: Archive,
      href: "/orders/bin",
      variant: "ghost" as const,
    }] : []),
    ...(canManageUsers ? [{
      title: "Manage Users",
      description: "User administration panel",
      icon: Phone,
      href: "/users",
      variant: "ghost" as const,
    }] : []),
  ];

  const allActions = [...quickActionItems, ...adminActions];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {allActions.map((action) => (
            <Link key={action.title} to={action.href}>
              <Button 
                variant={action.variant} 
                className="h-auto w-full justify-start p-4 text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <action.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}