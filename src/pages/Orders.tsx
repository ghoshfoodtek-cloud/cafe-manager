import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { loadJSON, saveJSON } from "@/lib/storage";

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

  useEffect(() => {
    setOrders(loadJSON<Order[]>("orders", []));
  }, []);

  const createOrder = () => {
    const list = loadJSON<Order[]>("orders", []);
    const order: Order = {
      id: String(Date.now()),
      title: `New Order #${(list.length + 1).toString().padStart(3, "0")}`,
      status: "pending",
      createdAt: new Date().toISOString(),
      events: [],
    };
    list.unshift(order);
    saveJSON("orders", list);
    setOrders(list);
    navigate(`/orders/${order.id}`);
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
              <div className="mb-1 text-lg font-medium">{o.title}</div>
              <div className="text-sm text-muted-foreground">Created: {new Date(o.createdAt).toLocaleString()}</div>
              <div className="mt-2 text-sm">Status: {o.status.replace("_", " ")}</div>
              <Link to={`/orders/${o.id}`} className="mt-3 inline-block text-sm text-primary underline-offset-4 hover:underline">View timeline</Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default Orders;
