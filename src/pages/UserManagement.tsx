import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { ExternalLink, Users, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RoleRequest {
  id: string;
  user_id: string;
  email: string;
  requested_role: 'admin' | 'associate';
  status: string;
  created_at: string;
}

const UserManagement = () => {
  const { canManageUsers, user } = useSupabaseAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('role_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setRequests((data ?? []) as RoleRequest[]);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    if (canManageUsers) fetchRequests();
  }, [canManageUsers, fetchRequests]);

  const handleApprove = async (req: RoleRequest) => {
    setActingId(req.id);
    try {
      const { error: roleErr } = await supabase
        .from('user_roles')
        .insert({ user_id: req.user_id, role: req.requested_role });

      if (roleErr && !roleErr.message.includes('duplicate')) {
        throw roleErr;
      }

      const { error: updErr } = await supabase
        .from('role_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq('id', req.id);

      if (updErr) throw updErr;

      toast({ title: 'Approved', description: `${req.email} is now ${req.requested_role}.` });
      await fetchRequests();
    } catch (err: any) {
      toast({ title: 'Failed to approve', description: err.message, variant: 'destructive' });
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (req: RoleRequest) => {
    setActingId(req.id);
    try {
      const { error } = await supabase
        .from('role_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq('id', req.id);

      if (error) throw error;
      toast({ title: 'Rejected', description: `Request from ${req.email} rejected.` });
      await fetchRequests();
    } catch (err: any) {
      toast({ title: 'Failed to reject', description: err.message, variant: 'destructive' });
    } finally {
      setActingId(null);
    }
  };

  if (!canManageUsers) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">You don't have permission to access user management.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const supabaseProjectId = "xussfezfrnmorpfouslg";
  const supabaseUsersUrl = `https://supabase.com/dashboard/project/${supabaseProjectId}/auth/users`;

  return (
    <>
      <Helmet>
        <title>User Management - Bharat Connect Pro</title>
        <meta name="description" content="Manage user accounts and permissions" />
      </Helmet>

      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8" />
              User Management
            </h1>
            <p className="text-muted-foreground mt-2">Manage user accounts and permissions</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pending Role Requests</span>
              {requests.length > 0 && (
                <Badge variant="secondary">{requests.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Loading requests...
              </div>
            ) : requests.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No pending role requests.
              </p>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{req.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={req.requested_role === 'admin' ? 'default' : 'outline'}>
                          {req.requested_role}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(req.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(req)}
                        disabled={actingId === req.id}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(req)}
                        disabled={actingId === req.id}
                      >
                        {actingId === req.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <Check className="h-4 w-4 mr-1" />
                        )}
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supabase Authentication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This application uses Supabase for secure authentication and user management.
              All user accounts are managed through the Supabase dashboard with proper security controls.
            </p>

            <div className="flex gap-3">
              <Button asChild>
                <a
                  href={supabaseUsersUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Supabase User Management
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default UserManagement;
