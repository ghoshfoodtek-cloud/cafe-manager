import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { loadJSON, saveJSON } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth-enhanced";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";

const AddGlobalEvent = () => {
  const [description, setDescription] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useSupabaseAuth();

  const handleSave = async () => {
    if (!description.trim()) {
      toast({
        title: "Error",
        description: "Please enter an event description",
        variant: "destructive",
      });
      return;
    }

    if (!user || !profile) {
      toast({
        title: "Error",
        description: "You must be logged in",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('global_events')
        .insert({
          description: description.trim(),
          created_by: user.id,
          created_by_name: profile.name,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event recorded successfully",
      });
      
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save event",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <main className="container mx-auto py-6">
      <Helmet>
        <title>Add Event | Bharat Connect Pro</title>
        <meta name="description" content="Record a global event" />
      </Helmet>
      
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Add Global Event</h1>
        <p className="text-muted-foreground mt-1">Record an event with current date and time</p>
      </div>

      <div className="max-w-md space-y-4">
        <div>
          <Label htmlFor="timestamp">Date & Time</Label>
          <Input
            id="timestamp"
            value={new Date().toLocaleString()}
            disabled
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="description">Event Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what happened..."
            className="mt-1 min-h-[100px]"
          />
        </div>

        <div>
          <Label htmlFor="createdBy">Reported By</Label>
          <Input
            id="createdBy"
            value={profile?.name || "Unknown"}
            disabled
            className="mt-1"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={handleSave}>Save Event</Button>
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
        </div>
      </div>
    </main>
  );
};

export default AddGlobalEvent;