import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Clients from "./pages/Clients";
import ClientNew from "./pages/ClientNew";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import OrdersBin from "./pages/OrdersBin";
import AppHeader from "./components/layout/AppHeader";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppHeader />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/new" element={<ClientNew />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/bin" element={<OrdersBin />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
