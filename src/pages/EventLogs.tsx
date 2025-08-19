import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { loadJSON } from "@/lib/storage";
import { GlobalEvent } from "@/types/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, User, FileDown } from "lucide-react";
import { format, parseISO } from "date-fns";

const EventLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const events = loadJSON<GlobalEvent[]>("globalEvents", []);

  const filteredEvents = useMemo(() => {
    if (!searchTerm) return events;
    
    return events.filter((event) =>
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [events, searchTerm]);

  const exportEvents = () => {
    const dataStr = JSON.stringify(filteredEvents, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `event-logs-${format(new Date(), 'yyyy-MM-dd')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const formatEventDate = (timestamp: string) => {
    try {
      return format(parseISO(timestamp), "PPpp");
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Helmet>
        <title>Event Logs - CRM</title>
        <meta name="description" content="View and manage global event logs" />
      </Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Event Logs</h1>
          <p className="text-muted-foreground">
            View all global events ({filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'})
          </p>
        </div>
        
        <Button onClick={exportEvents} variant="outline" className="flex items-center gap-2">
          <FileDown className="h-4 w-4" />
          Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by description or creator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm ? "No events match your search criteria." : "No events have been recorded yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredEvents
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <p className="text-lg font-medium">{event.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatEventDate(event.timestamp)}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {event.createdBy}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {event.id.slice(-8)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>
    </div>
  );
};

export default EventLogs;