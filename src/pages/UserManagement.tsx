import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { ExternalLink, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const UserManagement = () => {
  const { canManageUsers } = useSupabaseAuth();

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
      
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8" />
              User Management
            </h1>
            <p className="text-muted-foreground mt-2">Manage user accounts and permissions through Supabase</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Supabase Authentication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This application now uses Supabase for secure authentication and user management. 
              All user accounts are managed through the Supabase dashboard with proper security controls.
            </p>
            
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <h3 className="font-semibold">To manage users:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Click the button below to open the Supabase dashboard</li>
                <li>Navigate to Authentication → Users</li>
                <li>Invite new users or manage existing ones</li>
                <li>Assign roles using the "user_roles" table in the database</li>
              </ol>
            </div>

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

            <div className="mt-6 p-4 border border-muted rounded-lg">
              <h4 className="font-semibold mb-2">Security Notes</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• All authentication is now handled securely by Supabase</li>
                <li>• User roles are stored in a separate table with proper RLS policies</li>
                <li>• Admin privileges cannot be manipulated client-side</li>
                <li>• All sensitive operations require server-side validation</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default UserManagement;