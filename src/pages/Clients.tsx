import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { loadJSON } from "@/lib/storage";

export type Client = {
  id: string;
  fullName: string;
  age?: number;
  phones: string[];
  address?: string;
  createdAt: string;
};

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    setClients(loadJSON<Client[]>("clients", []));
  }, []);

  return (
    <main className="container mx-auto py-6">
      <Helmet>
        <title>Clients CRM | Bharat Connect Pro</title>
        <meta name="description" content="Manage client profiles, contacts, and documents in your secure CRM." />
        <link rel="canonical" href="/clients" />
      </Helmet>
      <section className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clients CRM</h1>
        <Link to="/clients/new"><Button>New Client</Button></Link>
      </section>

      {clients.length === 0 ? (
        <div className="rounded-lg border p-6 text-muted-foreground">
          No clients yet. Create your first client profile.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((c) => (
            <li key={c.id} className="rounded-lg border p-4">
              <div className="mb-2 text-lg font-medium">{c.fullName}</div>
              <div className="text-sm text-muted-foreground">Created: {new Date(c.createdAt).toLocaleString()}</div>
              <div className="mt-2 text-sm">Phones: {c.phones.join(", ")}</div>
              {c.address && <div className="mt-1 text-sm">Address: {c.address}</div>}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default Clients;
