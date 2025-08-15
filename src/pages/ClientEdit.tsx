import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, ArrowLeft } from "lucide-react";
import { loadJSON, saveJSON } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import type { Client } from "./Clients";

const ClientEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const clients = loadJSON<Client[]>("clients", []);
    const foundClient = clients.find(c => c.id === id);
    setClient(foundClient || null);
    setLoading(false);
  }, [id]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const uploadProfilePhoto = () => {
    if (!client) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setClient(prev => prev ? { ...prev, profilePhoto: base64 } : null);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    const clients = loadJSON<Client[]>("clients", []);
    const updatedClients = clients.map(c => c.id === client.id ? client : c);
    saveJSON("clients", updatedClients);

    toast({
      title: "Client Updated",
      description: "Client profile has been updated successfully.",
    });

    navigate("/clients");
  };

  const updateField = (field: keyof Client, value: any) => {
    setClient(prev => prev ? { ...prev, [field]: value } : null);
  };

  if (loading) {
    return (
      <main className="container mx-auto py-6">
        <Card className="p-6">
          <div className="text-center">Loading client...</div>
        </Card>
      </main>
    );
  }

  if (!client) {
    return (
      <main className="container mx-auto py-6">
        <Card className="p-6">
          <div className="text-center">
            <h1 className="text-xl font-semibold mb-2">Client Not Found</h1>
            <p className="text-muted-foreground mb-4">The client you're looking for doesn't exist.</p>
            <Link to="/clients">
              <Button>Back to Clients</Button>
            </Link>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-6 max-w-2xl">
      <Helmet>
        <title>Edit {client.fullName} | Bharat Connect Pro</title>
        <meta name="description" content="Edit client profile information and contact details." />
      </Helmet>

      <div className="mb-6 flex items-center gap-3">
        <Link to="/clients">
          <Button size="icon" variant="outline">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">Edit Client</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo Section */}
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={client.profilePhoto} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                    {getInitials(client.fullName)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-background border opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={uploadProfilePhoto}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <Label className="text-base font-medium">Profile Photo</Label>
                <p className="text-sm text-muted-foreground">Click the camera icon to upload a photo</p>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={client.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={client.age || ''}
                  onChange={(e) => updateField('age', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>

              <div>
                <Label htmlFor="phones">Phone Numbers (comma separated) *</Label>
                <Input
                  id="phones"
                  value={client.phones.join(', ')}
                  onChange={(e) => updateField('phones', e.target.value.split(',').map(p => p.trim()).filter(Boolean))}
                  placeholder="e.g., +91 9876543210, +91 8765432109"
                  required
                />
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Address Information</h3>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={client.address || ''}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="village">Village</Label>
                  <Input
                    id="village"
                    value={client.village || ''}
                    onChange={(e) => updateField('village', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={client.city || ''}
                    onChange={(e) => updateField('city', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="block">Block</Label>
                  <Input
                    id="block"
                    value={client.block || ''}
                    onChange={(e) => updateField('block', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Save Changes
              </Button>
              <Link to="/clients" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default ClientEdit;