import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, MessageCircle, Edit, Camera, ChevronDown, ChevronUp } from "lucide-react";
import { loadJSON, saveJSON } from "@/lib/storage";

export type Client = {
  id: string;
  fullName: string;
  age?: number;
  phones: string[];
  address?: string;
  city?: string;
  village?: string;
  block?: string;
  createdAt: string;
  profilePhoto?: string; // base64 or URL
};

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    setClients(loadJSON<Client[]>("clients", []));
  }, []);

  const toggleCard = (clientId: string) => {
    setExpandedCard(expandedCard === clientId ? null : clientId);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const makeCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const openWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const uploadProfilePhoto = (clientId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    
    const cleanup = () => {
      document.body.removeChild(input);
      // Force remove any potential scroll lock
      document.body.style.overflow = '';
      document.body.removeAttribute('data-scroll-locked');
    };
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      cleanup();
      
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const updatedClients = clients.map(client => 
          client.id === clientId 
            ? { ...client, profilePhoto: base64 }
            : client
        );
        setClients(updatedClients);
        saveJSON("clients", updatedClients);
      };
      reader.readAsDataURL(file);
    };
    
    input.oncancel = cleanup;
    
    document.body.appendChild(input);
    input.click();
  };

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
        <Card className="p-6">
          <div className="text-center text-muted-foreground">
            No clients yet. Create your first client profile.
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => {
            const isExpanded = expandedCard === client.id;
            
            return (
              <Card 
                key={client.id} 
                className="overflow-hidden transition-all duration-200 hover:shadow-md"
              >
                <CardContent className="p-0">
                  {/* Main card content - always visible */}
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Profile photo section */}
                      <div className="relative group">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={client.profilePhoto} />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {getInitials(client.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-background border opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => uploadProfilePhoto(client.id)}
                        >
                          <Camera className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Client info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base truncate">{client.fullName}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {client.phones[0] || "No phone"}
                        </p>
                        {(client.city || client.village) && (
                          <p className="text-xs text-muted-foreground truncate">
                            {[client.village, client.city].filter(Boolean).join(", ")}
                          </p>
                        )}
                      </div>

                      {/* Expand/collapse button */}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleCard(client.id)}
                        className="h-8 w-8 shrink-0"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded content - conditionally visible */}
                  {isExpanded && (
                    <div className="border-t bg-muted/50 p-4 space-y-3">
                      {/* Additional info */}
                      <div className="grid gap-2 text-sm">
                        {client.address && (
                          <div>
                            <span className="text-muted-foreground">Address:</span> {client.address}
                          </div>
                        )}
                        {client.block && (
                          <div>
                            <span className="text-muted-foreground">Block:</span> {client.block}
                          </div>
                        )}
                        {client.age && (
                          <div>
                            <span className="text-muted-foreground">Age:</span> {client.age}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Created: {new Date(client.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Quick action buttons */}
                      <div className="flex gap-2">
                        {client.phones[0] && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => makeCall(client.phones[0])}
                              className="flex-1"
                            >
                              <Phone className="h-4 w-4 mr-2" />
                              Call
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openWhatsApp(client.phones[0])}
                              className="flex-1"
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              WhatsApp
                            </Button>
                          </>
                        )}
                        <Link to={`/clients/${client.id}/edit`} className="flex-1">
                          <Button size="sm" variant="secondary" className="w-full">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default Clients;
