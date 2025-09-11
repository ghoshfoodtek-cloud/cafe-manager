import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthContext";
import { RequireAuth } from "@/components/auth/RequireAuth";
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
import Login from "./pages/Login";
import UserManagement from "./pages/UserManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <RequireAuth>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/clients" element={<ClientList />} />
                  <Route path="/clients/new" element={<ClientNew />} />
                  <Route path="/clients/:id/edit" element={<ClientEdit />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/orders/new" element={<CreateOrder />} />
                  <Route path="/orders/bin" element={
                    <RequireAuth requireAdmin>
                      <OrdersBin />
                    </RequireAuth>
                  } />
                  <Route path="/orders/:id" element={<OrderDetail />} />
                  <Route path="/events/new" element={<AddGlobalEvent />} />
                  <Route path="/events" element={<EventLogs />} />
                  <Route path="/calls" element={<CallLogs />} />
                  <Route path="/users" element={
                    <RequireAuth requireAdmin>
                      <UserManagement />
                    </RequireAuth>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </MainLayout>
            </RequireAuth>
          } />
        </Routes>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
