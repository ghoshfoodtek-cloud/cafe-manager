import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadJSON } from "@/lib/storage";
import type { Client } from "@/types/client";
import type { Order } from "./Orders";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

const daysAgo = (d: number) => {
  const dt = new Date();
  dt.setDate(dt.getDate() - d);
  dt.setHours(0, 0, 0, 0);
  return dt;
};

const Index = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setClients(loadJSON<Client[]>("clients", []));
    setOrders(loadJSON<Order[]>("orders", []));
  }, []);

  const stats = useMemo(() => {
    const totalClients = clients.length;
    const since7 = daysAgo(7).getTime();
    const newClients7 = clients.filter(c => new Date(c.createdAt).getTime() >= since7).length;

    const totalOrders = orders.length;
    const pending = orders.filter(o => o.status === "pending").length;
    const inProgress = orders.filter(o => o.status === "in_progress").length;
    const completed = orders.filter(o => o.status === "completed").length;

    const events7 = orders.reduce((sum, o) => sum + o.events.filter(e => new Date(e.timestamp).getTime() >= since7).length, 0);

    // Build last 14 days orders per day
    const map: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = daysAgo(i);
      const key = d.toISOString().slice(0, 10);
      map[key] = 0;
    }
    orders.forEach(o => {
      const key = new Date(o.createdAt).toISOString().slice(0, 10);
      if (key in map) map[key] += 1;
    });
    const series = Object.keys(map).sort().map(k => ({ date: k.slice(5), orders: map[k] }));

    return { totalClients, newClients7, totalOrders, pending, inProgress, completed, events7, series };
  }, [clients, orders]);

  return (
    <main className="min-h-screen bg-background">
      <Helmet>
        <title>Dashboard Analytics | Bharat Connect Pro</title>
        <meta name="description" content="Overview analytics for clients and orders with recent activity." />
        <link rel="canonical" href="/" />
      </Helmet>

      <section className="container mx-auto py-8">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold">Dashboard Analytics</h1>
          <p className="mt-2 text-muted-foreground">Local overview of your CRM data. Connect Supabase to persist across devices.</p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle>Total Clients</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{stats.totalClients}</div>
              <div className="text-sm text-muted-foreground">+{stats.newClients7} in last 7 days</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle>Total Orders</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{stats.totalOrders}</div>
              <div className="text-sm text-muted-foreground">Events (7d): {stats.events7}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle>In Progress</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{stats.inProgress}</div>
              <div className="text-sm text-muted-foreground">Pending: {stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle>Completed</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">Conversion of total</div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2"><CardTitle>Orders Created (Last 14 days)</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.series} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} width={30} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))' }} />
                  <Area type="monotone" dataKey="orders" stroke="hsl(var(--primary))" fill="url(#ordersGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </section>
      </section>
    </main>
  );
};

export default Index;
