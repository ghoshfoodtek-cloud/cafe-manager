import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import { SupabaseRequireAuth } from "@/components/auth/SupabaseRequireAuth";
import { MainLayout } from "@/components/layout/MainLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ClientList from "./pages/ClientList";
import ClientNew from "./pages/ClientNew";
import ClientEdit from "./pages/ClientEdit";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import OrdersBin from "./pages/OrdersBin";
import CreateOrder from "./pages/CreateOrder";
import AddGlobalEvent from "./pages/AddGlobalEvent";
import EventLogs from "./pages/EventLogs";
import CallLogs from "./pages/CallLogs";
import Auth from "./pages/Auth";
import UserManagement from "./pages/UserManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SupabaseAuthProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/*" element={
            <SupabaseRequireAuth>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/clients" element={<ClientList />} />
                  <Route path="/clients/new" element={<ClientNew />} />
                  <Route path="/clients/:id/edit" element={<ClientEdit />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/orders/new" element={<CreateOrder />} />
                  <Route path="/orders/bin" element={
                    <SupabaseRequireAuth requireAdmin>
                      <OrdersBin />
                    </SupabaseRequireAuth>
                  } />
                  <Route path="/orders/:id" element={<OrderDetail />} />
                  <Route path="/events/new" element={<AddGlobalEvent />} />
                  <Route path="/events" element={<EventLogs />} />
                  <Route path="/calls" element={<CallLogs />} />
                  <Route path="/users" element={
                    <SupabaseRequireAuth requireAdmin>
                      <UserManagement />
                    </SupabaseRequireAuth>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </MainLayout>
            </SupabaseRequireAuth>
          } />
        </Routes>
      </SupabaseAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
