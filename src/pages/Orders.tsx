import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { loadJSON, saveJSON } from "@/lib/storage";
import { isAdmin, initializeDefaultAdmin } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

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
  const [orders, setOrders] = useState<Order[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    initializeDefaultAdmin();
    setOrders(loadJSON<Order[]>("orders", []));
  }, []);

  const createOrder = () => {
    navigate("/orders/new");
  };

  const deleteOrder = (orderId: string) => {
    const list = loadJSON<Order[]>("orders", []);
    const updatedList = list.filter(o => o.id !== orderId);
    saveJSON("orders", updatedList);
    setOrders(updatedList);
    
    toast({
      title: "Success",
      description: "Order deleted permanently",
    });
  };


  return (
    <main className="container mx-auto py-6">
      <Helmet>
        <title>Orders & Timelines | Bharat Connect Pro</title>
        <meta name="description" content="Track detailed order timelines, add events, and manage documents." />
        <link rel="canonical" href="/orders" />
      </Helmet>
      <section className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <div className="flex items-center gap-2">
          <Link to="/orders/bin"><Button variant="outline">View Bin</Button></Link>
          <Button onClick={createOrder}>Create Order</Button>
        </div>
      </section>

      {orders.filter(o => !o.deletedAt).length === 0 ? (
        <div className="rounded-lg border p-6 text-muted-foreground">
          No active orders. Create a new order or view items in the bin.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orders.filter(o => !o.deletedAt).map((o) => (
            <li key={o.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-1 text-lg font-medium">{o.title}</div>
                  <div className="text-sm text-muted-foreground">Created: {new Date(o.createdAt).toLocaleString()}</div>
                  <div className="mt-2 text-sm">Status: {o.status.replace("_", " ")}</div>
                  <Link to={`/orders/${o.id}`} className="mt-3 inline-block text-sm text-primary underline-offset-4 hover:underline">View timeline</Link>
                </div>
                {isAdmin() && (
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
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default Orders;
