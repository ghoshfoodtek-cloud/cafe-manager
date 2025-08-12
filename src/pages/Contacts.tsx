import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, Notebook, Clock, Search, MoreVertical } from "lucide-react";
import { loadJSON } from "@/lib/storage";
import type { Client } from "./Clients";
import InCallSheet from "@/components/calls/InCallSheet";

const Contacts = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<{ client: Client | null; phone: string | null }>({ client: null, phone: null });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setClients(loadJSON<Client[]>("clients", []));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) =>
      c.fullName.toLowerCase().includes(q) || c.phones.some((p) => p.includes(q))
    );
  }, [clients, query]);

  const openCall = (client: Client, phone: string) => {
    setSelected({ client, phone });
    setOpen(true);
  };

  return (
    <main className="container mx-auto py-6">
      <Helmet>
        <title>Contacts | Bharat Connect Pro</title>
        <meta name="description" content="Contacts-style clients with quick call, logs, and notes." />
        <link rel="canonical" href="/clients" />
      </Helmet>

      <section className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Contacts</h1>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone"
            className="pl-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </section>

      {filtered.length === 0 ? (
        <Card className="p-6 text-muted-foreground">No contacts found.</Card>
      ) : (
        <ul className="divide-y rounded-md border">
          {filtered.map((c) => (
            <li key={c.id} className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary font-medium">
                  {c.fullName.split(" ").map(w => w[0]).slice(0,2).join("")}
                </div>
                <div>
                  <div className="font-medium">{c.fullName}</div>
                  <div className="text-sm text-muted-foreground">{c.phones[0] || "No phone"}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {c.phones[0] && (
                  <Button size="sm" onClick={() => openCall(c, c.phones[0])}>
                    <Phone className="mr-2 h-4 w-4" /> Call
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => openCall(c, c.phones[0] || "") }>
                  <Notebook className="mr-2 h-4 w-4" /> Notes
                </Button>
                <Button size="icon" variant="ghost" aria-label="More options">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <InCallSheet open={open} onOpenChange={setOpen} client={selected.client} phone={selected.phone} />
    </main>
  );
};

export default Contacts;
