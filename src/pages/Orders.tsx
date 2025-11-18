import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { getOrders, deleteOrder as deleteOrderDB } from "@/lib/supabase-orders";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Notebook, ArrowRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileOrderCard } from "@/components/mobile/MobileOrderCard";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { useMobileNavigation } from "@/hooks/useMobileNavigation";
import { Home, Users as UsersIcon, FileText } from "lucide-react";

export type OrderEvent = {
  id: string;
  timestamp: string;
  title: string;
  note?: string;
  attachments?: string[]; // data URLs
};

export type Order = {
  id: string;
  title: string;
  clientId?: string;
  status: "pending" | "in_progress" | "completed";
  createdAt: string;
  events: OrderEvent[];
  deletedAt?: string; // moved to bin timestamp
};

const Orders = () => {
  const queryClient = useQueryClient();
  const { canDelete, user } = useSupabaseAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: allOrders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  });

  const orders = allOrders
    .filter((o: any) => !o.deleted_at)
    .map((o: any) => ({
      id: o.id,
      title: o.title,
      clientId: o.client_id || undefined,
      status: o.status as "pending" | "in_progress" | "completed",
      createdAt: o.created_at,
      events: o.order_events?.map((e: any) => ({
        id: e.id,
        timestamp: e.created_at,
        title: e.title,
        note: e.note || undefined,
        attachments: e.attachments || undefined,
      })) || [],
      deletedAt: o.deleted_at || undefined,
    }));
  const isMobile = useIsMobile();

  const navigationSections = [
    { id: 'dashboard', path: '/', title: 'Dashboard', icon: Home },
    { id: 'clients', path: '/clients', title: 'Clients', icon: UsersIcon },
    { id: 'orders', path: '/orders', title: 'Orders', icon: FileText },
  ];

  const { swipeGestures } = useMobileNavigation(navigationSections);

  const deleteMutation = useMutation({
    mutationFn: deleteOrderDB,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Success",
        description: "Order deleted permanently",
      });
    },
  });

  const createOrder = () => {
    navigate("/orders/new");
  };

  const deleteOrder = (orderId: string) => {
    deleteMutation.mutate(orderId);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "in_progress":
        return "status-in-progress";
      case "completed":
        return "status-completed";
      default:
        return "";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
  };


  return (
    <main className="container mx-auto py-6" {...(isMobile ? swipeGestures : {})}>
      <Helmet>
        <title>Orders & Timelines | Bharat Connect Pro</title>
        <meta name="description" content="Track detailed order timelines, add events, and manage documents." />
        <link rel="canonical" href="/orders" />
      </Helmet>
      <section className="mb-8 section-spacing">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h1">Orders</h1>
            <p className="text-muted-foreground mt-1">Track detailed order timelines and manage documents</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/orders/bin">
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                View Bin
              </Button>
            </Link>
            <Button onClick={createOrder}>Create Order</Button>
          </div>
        </div>
      </section>

      {orders.filter(o => !o.deletedAt).length === 0 ? (
        <Card className="empty-state">
          <div className="space-y-4">
            <div className="h-16 w-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Notebook className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-h4 mb-2">No active orders</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get started by creating your first order or check items in the bin.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={createOrder}>Create Order</Button>
              <Link to="/orders/bin">
                <Button variant="outline">View Bin</Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : isMobile ? (
        <PullToRefresh onRefresh={() => queryClient.invalidateQueries({ queryKey: ['orders'] })}>
          <div className="space-y-4">
            {orders.filter(o => !o.deletedAt).map((order) => (
              <MobileOrderCard
                key={order.id}
                order={order}
                onDelete={() => deleteOrder(order.id)}
                getStatusClass={getStatusClass}
                formatStatus={formatStatus}
              />
            ))}
          </div>
        </PullToRefresh>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {orders.filter(o => !o.deletedAt).map((o) => (
            <Card key={o.id} className="interactive-card p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-h4 mb-1">{o.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(o.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="status"
                      className={getStatusClass(o.status)}
                    >
                      {formatStatus(o.status)}
                    </Badge>
                  </div>
                  <Link 
                    to={`/orders/${o.id}`} 
                    className="inline-flex items-center text-sm text-primary hover:text-primary/80 font-medium"
                  >
                    View timeline
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
                {canDelete && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Order</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the order "{o.title}". This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteOrder(o.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
};

export default Orders;
