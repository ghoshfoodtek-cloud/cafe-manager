import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { loadJSON, saveJSON } from "@/lib/storage";
import type { Order } from "./Orders";
import { useToast } from "@/components/ui/use-toast";

const OrdersBin = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setOrders(loadJSON<Order[]>("orders", []));
  }, []);

  const trashed = useMemo(() => orders.filter(o => !!o.deletedAt), [orders]);

  const restore = (id: string) => {
    const updated = orders.map(o => o.id === id ? { ...o, deletedAt: undefined } : o);
    setOrders(updated);
    saveJSON("orders", updated);
    toast({ title: "Order restored" });
  };

  const destroy = (id: string) => {
    const updated = orders.filter(o => o.id !== id);
    setOrders(updated);
    saveJSON("orders", updated);
    toast({ title: "Order deleted permanently" });
  };

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
              <div className="text-sm text-muted-foreground">Deleted: {o.deletedAt ? new Date(o.deletedAt).toLocaleString() : ''}</div>
              <div className="mt-3 flex items-center gap-2">
                <Button size="sm" onClick={() => restore(o.id)}>Restore</Button>
                <Button size="sm" variant="destructive" onClick={() => destroy(o.id)}>Delete Permanently</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default OrdersBin;
