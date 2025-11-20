import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getOrders, updateOrder, deleteOrder } from "@/lib/supabase-orders";

const OrdersBin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  });

  const trashed = useMemo(() => orders.filter(o => !!o.deletedAt), [orders]);

  const restoreMutation = useMutation({
    mutationFn: async (id: string) => {
      return updateOrder(id, { deletedAt: undefined });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({ title: "Order restored" });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to restore order",
        variant: "destructive" 
      });
    },
  });

  const destroyMutation = useMutation({
    mutationFn: async (id: string) => {
      return deleteOrder(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({ title: "Order deleted permanently" });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to delete order",
        variant: "destructive" 
      });
    },
  });

  const restore = (id: string) => {
    restoreMutation.mutate(id);
  };

  const destroy = (id: string) => {
    destroyMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <main className="container mx-auto py-6">
        <div className="rounded-lg border p-6">
          <p className="text-muted-foreground">Loading bin...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-6">
      <Helmet>
        <title>Orders Bin | Bharat Connect Pro</title>
        <meta name="description" content="Recover or permanently delete orders moved to bin." />
        <link rel="canonical" href="/orders/bin" />
      </Helmet>

      <section className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Orders Bin</h1>
        <Link to="/orders"><Button variant="outline">Back to Orders</Button></Link>
      </section>

      {trashed.length === 0 ? (
        <div className="rounded-lg border p-6 text-muted-foreground">Bin is empty.</div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trashed.map((o) => (
            <li key={o.id} className="rounded-lg border p-4">
              <div className="mb-1 text-lg font-medium">{o.title}</div>
              <div className="text-sm text-muted-foreground">
                Deleted: {o.deletedAt ? new Date(o.deletedAt).toLocaleString() : ''}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Button 
                  size="sm" 
                  onClick={() => restore(o.id)}
                  disabled={restoreMutation.isPending || destroyMutation.isPending}
                >
                  {restoreMutation.isPending ? "Restoring..." : "Restore"}
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => destroy(o.id)}
                  disabled={restoreMutation.isPending || destroyMutation.isPending}
                >
                  {destroyMutation.isPending ? "Deleting..." : "Delete Permanently"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default OrdersBin;
