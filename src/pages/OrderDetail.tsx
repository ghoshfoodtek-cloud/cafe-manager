import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { loadJSON, saveJSON } from "@/lib/storage";
import { captureFromCamera, pickFromGallery } from "@/lib/capture";
import type { Order, OrderEvent } from "./Orders";
import type { Client } from "./Clients";

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [eventTitle, setEventTitle] = useState("");
  const [eventNote, setEventNote] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [clientQuery, setClientQuery] = useState("");

  useEffect(() => {
    setOrders(loadJSON<Order[]>("orders", []));
    setClients(loadJSON<Client[]>("clients", []));
  }, []);

  const order = useMemo(() => orders.find(o => o.id === id), [orders, id]);
  const isInBin = useMemo(() => !!order?.deletedAt, [order]);

  // Removed auto-creation logic that was causing phantom orders

  const addEvent = () => {
    if (!order) return;
    if (!eventTitle.trim()) {
      toast({ title: "Event title required", variant: "destructive" });
      return;
    }
    const evt: OrderEvent = {
      id: String(Date.now()),
      title: eventTitle.trim(),
      note: eventNote.trim() || undefined,
      timestamp: new Date().toISOString(),
      attachments,
    };
    const updated = orders.map(o => o.id === order.id ? { ...o, events: [evt, ...o.events] } : o);
    setOrders(updated);
    saveJSON("orders", updated);
    setEventTitle("");
    setEventNote("");
    setAttachments([]);
    toast({ title: "Event added", description: evt.title });
  };

  const linkClient = (clientId: string) => {
    if (!order) return;
    const updated = orders.map(o => o.id === order.id ? { ...o, clientId } : o);
    setOrders(updated);
    saveJSON("orders", updated);
    toast({ title: "Client linked", description: clients.find(c => c.id === clientId)?.fullName });
  };

  const moveToBin = () => {
    if (!order) return;
    const updated = orders.map(o => o.id === order.id ? { ...o, deletedAt: new Date().toISOString() } : o);
    setOrders(updated);
    saveJSON("orders", updated);
    toast({ title: "Moved to bin" });
    navigate("/orders");
  };

  const restoreFromBin = () => {
    if (!order) return;
    const updated = orders.map(o => o.id === order.id ? { ...o, deletedAt: undefined } : o);
    setOrders(updated);
    saveJSON("orders", updated);
    toast({ title: "Order restored" });
  };

  const deletePermanently = () => {
    if (!order) return;
    const updated = orders.filter(o => o.id !== order.id);
    setOrders(updated);
    saveJSON("orders", updated);
    toast({ title: "Order deleted permanently" });
    navigate("/orders");
  };

  const doCapture = async (mode: 'camera' | 'gallery') => {
    const dataUrl = mode === 'camera' ? await captureFromCamera() : await pickFromGallery();
    if (dataUrl) {
      setAttachments(prev => [dataUrl, ...prev]);
    } else {
      toast({ title: "Capture not available", description: "Use file picker below on web.", variant: "destructive" });
    }
  };

  const onFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAttachments(prev => [String(reader.result), ...prev]);
    reader.readAsDataURL(file);
    e.currentTarget.value = "";
  };

  const filteredClients = useMemo(() => {
    const q = clientQuery.trim().toLowerCase();
    if (!q) return clients.slice(0, 5);
    return clients.filter(c => c.fullName.toLowerCase().includes(q) || c.phones.some(p => p.includes(q))).slice(0, 8);
  }, [clientQuery, clients]);

  if (!order) {
    return (
      <main className="container mx-auto py-6">
        <div className="rounded-lg border p-6">
          <h1 className="text-xl font-semibold mb-2">Order Not Found</h1>
          <p className="text-muted-foreground mb-4">The order you're looking for doesn't exist.</p>
          <Link to="/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-6">
      <Helmet>
        <title>{`${order.title} Timeline | Bharat Connect Pro`}</title>
        <meta name="description" content="Detailed order timeline with events and document capture." />
        <link rel="canonical" href={`/orders/${order.id}`} />
      </Helmet>

      <section className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{order.title}</h1>
          <p className="text-sm text-muted-foreground">Created {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">Status: {order.status.replace("_", " ")}</div>
          {!isInBin ? (
            <Button size="sm" variant="outline" onClick={moveToBin}>Move to Bin</Button>
          ) : (
            <>
              <Button size="sm" onClick={restoreFromBin}>Restore</Button>
              <Button size="sm" variant="destructive" onClick={deletePermanently}>Delete Permanently</Button>
            </>
          )}
        </div>
      </section>

      <section className="mb-6 rounded-lg border p-4">
        <h2 className="mb-3 text-lg font-medium">Link to Client</h2>
        {order.clientId ? (
          <div className="text-sm">Linked: {clients.find(c => c.id === order.clientId)?.fullName}
            <Button className="ml-3" size="sm" variant="outline" onClick={() => linkClient("")}>Unlink</Button>
          </div>
        ) : (
          <div className="grid gap-3">
            <Input placeholder="Search by name or phone" value={clientQuery} onChange={(e) => setClientQuery(e.target.value)} />
            <div className="grid gap-2">
              {filteredClients.map(c => (
                <button key={c.id} onClick={() => linkClient(c.id)} className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-left hover:bg-accent">
                  <span>{c.fullName}</span>
                  <span className="text-sm text-muted-foreground">{c.phones[0]}</span>
                </button>
              ))}
              {filteredClients.length === 0 && (
                <div className="text-sm text-muted-foreground">No match. <Link to="/clients/new" className="text-primary underline-offset-4 hover:underline">Create new profile</Link></div>
              )}
            </div>
          </div>
        )}
      </section>

      <section className="mb-6 rounded-lg border p-4">
        <h2 className="mb-3 text-lg font-medium">Add Event</h2>
        <div className="grid gap-3">
          <Input placeholder="Event title (e.g., Documents submitted)" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} />
          <Textarea placeholder="Optional note" value={eventNote} onChange={(e) => setEventNote(e.target.value)} />
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="secondary" onClick={() => doCapture('camera')}>Use Camera</Button>
            <Button type="button" variant="secondary" onClick={() => doCapture('gallery')}>Pick from Gallery</Button>
            <label className="ml-auto text-sm text-muted-foreground">
              or upload
              <input type="file" accept="image/*,application/pdf" onChange={onFilePicked} className="ml-2" />
            </label>
            <Button onClick={addEvent}>Add Event</Button>
          </div>
          {attachments.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {attachments.map((src, idx) => (
                <img key={idx} src={src} alt={`event-attachment-${idx}`} className="h-28 w-full rounded-md object-cover" loading="lazy" />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-lg border">
        <h2 className="border-b p-4 text-lg font-medium">Timeline</h2>
        {order.events.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">No events yet.</div>
        ) : (
          <ul className="divide-y">
            {order.events.map(evt => (
              <li key={evt.id} className="p-4">
                <div className="mb-1 flex items-center justify-between">
                  <div className="font-medium">{evt.title}</div>
                  <div className="text-sm text-muted-foreground">{new Date(evt.timestamp).toLocaleString()}</div>
                </div>
                {evt.note && <div className="mb-2 text-sm">{evt.note}</div>}
                {evt.attachments && evt.attachments.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {evt.attachments.map((src, idx) => (
                      <img key={idx} src={src} alt={`attachment-${idx}`} className="h-24 w-full rounded-md object-cover" loading="lazy" />
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};

export default OrderDetail;
