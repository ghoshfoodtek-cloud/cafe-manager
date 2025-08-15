import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { loadJSON, saveJSON } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "./Orders";

const CreateOrder = () => {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"pending" | "in_progress" | "completed">("pending");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSave = () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter an order title",
        variant: "destructive",
      });
      return;
    }

    const list = loadJSON<Order[]>("orders", []);
    
    // Generate truly unique ID
    const generateUniqueId = () => {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`;
    };
    
    let uniqueId;
    do {
      uniqueId = generateUniqueId();
    } while (list.some(order => order.id === uniqueId));
    
    const order: Order = {
      id: uniqueId,
      title: title.trim(),
      status,
      createdAt: new Date().toISOString(),
      events: [],
    };
    
    const updatedList = [order, ...list];
    saveJSON("orders", updatedList);
    
    toast({
      title: "Success",
      description: "Order created successfully",
    });
    
    navigate(`/orders/${order.id}`);
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
          />
        </div>

        <div>
          <Label htmlFor="status">Initial Status</Label>
          <Select value={status} onValueChange={(value: any) => setStatus(value)}>
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
          <Button onClick={handleSave}>Save Order</Button>
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
        </div>
      </div>
    </main>
  );
};

export default CreateOrder;