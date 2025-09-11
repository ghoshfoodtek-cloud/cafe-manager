import { useMemo } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Users, ShoppingBag, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { loadJSON } from "@/lib/storage";
import type { Client } from "@/types/client";

interface Order {
  id: string;
  clientId: string;
  status: string;
  createdAt: string;
  events: Array<{ timestamp: string; type: string; description: string; }>;
}

export function RecentActivity() {
  const clients = loadJSON<Client[]>("clients", []);
  const orders = loadJSON<Order[]>("orders", []);

  const recentData = useMemo(() => {
    // Get recent clients (last 5)
    const recentClients = clients
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);

    // Get recent orders (last 5)
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);

    // Get recent events from orders
    const recentEvents = orders
      .flatMap(order => 
        order.events.map(event => ({
          ...event,
          orderId: order.id,
          clientId: order.clientId
        }))
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 3);

    return { recentClients, recentOrders, recentEvents };
  }, [clients, orders]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      {/* Recent Clients */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Recent Clients
            </CardTitle>
            <Link to="/clients">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentData.recentClients.length > 0 ? (
            recentData.recentClients.map((client) => (
              <Link 
                key={client.id} 
                to={`/clients/${client.id}/edit`}
                className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{client.fullName}</div>
                    <div className="text-sm text-muted-foreground">{client.phones?.[0] || "No phone"}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(client.createdAt), "MMM d")}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No clients yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Recent Orders
            </CardTitle>
            <Link to="/orders">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentData.recentOrders.length > 0 ? (
            recentData.recentOrders.map((order) => {
              const client = clients.find(c => c.id === order.clientId);
              return (
                <Link 
                  key={order.id} 
                  to={`/orders/${order.id}`}
                  className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Order #{order.id.slice(-6)}</div>
                      <div className="text-sm text-muted-foreground">
                        {client?.fullName || "Unknown Client"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(order.createdAt), "MMM d")}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No orders yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Activity
            </CardTitle>
            <Link to="/events">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentData.recentEvents.length > 0 ? (
            recentData.recentEvents.map((event, index) => (
              <div key={index} className="flex items-start gap-3 p-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{event.type}</div>
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {event.description}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {format(new Date(event.timestamp), "MMM d, HH:mm")}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}