import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadCallLogs, saveCallLogs, type CallLog } from "@/lib/calls";
import { Play, Trash2, Search, FileText } from "lucide-react";

const CallLogs = () => {
  const [logs, setLogs] = useState<CallLog[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setLogs(loadCallLogs());
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((l) => l.clientName.toLowerCase().includes(q) || l.phone.includes(q));
  }, [logs, query]);

  const remove = (id: string) => {
    const next = logs.filter((l) => l.id !== id);
    setLogs(next);
    saveCallLogs(next);
  };

  return (
    <main className="container mx-auto py-6">
      <Helmet>
        <title>Call Logs | Bharat Connect Pro</title>
        <meta name="description" content="Browse call logs with notes and voice notes." />
        <link rel="canonical" href="/calls" />
      </Helmet>

      <section className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Call Logs</h1>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name or phone" className="pl-8" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </section>

      {filtered.length === 0 ? (
        <Card className="p-6 text-muted-foreground">No calls yet.</Card>
      ) : (
        <ul className="divide-y rounded-md border">
          {filtered.map((l) => (
            <li key={l.id} className="flex items-center justify-between p-3">
              <div>
                <div className="font-medium">{l.clientName} <span className="text-muted-foreground">({l.phone})</span></div>
                <div className="text-sm text-muted-foreground">
                  {new Date(l.startedAt).toLocaleString()} • {l.durationSec ? `${Math.floor(l.durationSec/60)}m ${l.durationSec%60}s` : "--"}
                </div>
                {l.notes && <div className="mt-1 text-sm">📝 {l.notes}</div>}
              </div>
              <div className="flex items-center gap-2">
                {l.recording && (
                  <a
                    className="inline-flex items-center gap-2 rounded-md border px-3 py-1 text-sm hover:bg-accent"
                    href={`data:${l.recording.mime};base64,${l.recording.dataBase64}`}
                    download={`call-${l.id}.webm`}
                  >
                    <Play className="h-4 w-4" /> Audio
                  </a>
                )}
                <Button variant="ghost" size="icon" onClick={() => remove(l.id)} aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default CallLogs;
