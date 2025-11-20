import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { createOrder } from "@/lib/supabase-orders";

const CreateOrder = () => {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"pending" | "in_progress" | "completed">("pending");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useSupabaseAuth();

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      return createOrder({ title: title.trim(), status }, user.id);
    },
    onSuccess: (order) => {
      toast({
        title: "Success",
        description: "Order created successfully",
      });
      navigate(`/orders/${order.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create order",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter an order title",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create orders",
        variant: "destructive",
      });
      return;
    }

    createOrderMutation.mutate();
  };

  const handleCancel = () => {
    navigate("/orders");
  };

  return (
    <main className="container mx-auto py-6">
      <Helmet>
        <title>Create Order | Bharat Connect Pro</title>
        <meta name="description" content="Create a new order with timeline tracking" />
      </Helmet>
      
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Create New Order</h1>
      </div>

      <div className="max-w-md space-y-4">
        <div>
          <Label htmlFor="title">Order Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter order title"
            className="mt-1"
            disabled={createOrderMutation.isPending}
          />
        </div>

        <div>
          <Label htmlFor="status">Initial Status</Label>
          <Select 
            value={status} 
            onValueChange={(value: any) => setStatus(value)}
            disabled={createOrderMutation.isPending}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3 pt-4">
          <Button 
            onClick={handleSave}
            disabled={createOrderMutation.isPending}
          >
            {createOrderMutation.isPending ? "Saving..." : "Save Order"}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={createOrderMutation.isPending}
          >
            Cancel
          </Button>
        </div>
      </div>
    </main>
  );
};

export default CreateOrder;
