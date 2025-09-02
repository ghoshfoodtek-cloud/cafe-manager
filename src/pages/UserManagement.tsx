import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getAllUsers, createAssociate, updateUser, deactivateUser } from '@/lib/auth-enhanced';
import { useAuth } from '@/components/auth/AuthContext';
import { User } from '@/types/user';
import { toast } from 'sonner';
import { UserPlus, Edit, UserX, Users } from 'lucide-react';

const UserManagement = () => {
  const { canManageUsers, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newAssociateName, setNewAssociateName] = useState('');
  const [editName, setEditName] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = getAllUsers();
    setUsers(allUsers);
  };

  const handleCreateAssociate = () => {
    if (!newAssociateName.trim()) {
      toast.error('Please enter a name');
      return;
    }

    try {
      createAssociate(newAssociateName.trim());
      loadUsers();
      setNewAssociateName('');
      setShowCreateDialog(false);
      toast.success('Associate created successfully');
    } catch (error) {
      toast.error('Failed to create associate');
    }
  };

  const handleUpdateUser = () => {
    if (!editingUser || !editName.trim()) {
      toast.error('Please enter a valid name');
      return;
    }

    const success = updateUser(editingUser.id, { name: editName.trim() });
    if (success) {
      loadUsers();
      setEditingUser(null);
      setEditName('');
      toast.success('User updated successfully');
    } else {
      toast.error('Failed to update user');
    }
  };

  const handleDeactivateUser = (userId: string) => {
    if (userId === currentUser?.id) {
      toast.error('Cannot deactivate yourself');
      return;
    }

    const success = deactivateUser(userId);
    if (success) {
      loadUsers();
      toast.success('User deactivated successfully');
    } else {
      toast.error('Failed to deactivate user');
    }
  };

  const startEdit = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
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

  return (
    <>
      <Helmet>
        <title>User Management - Bharat Connect Pro</title>
        <meta name="description" content="Manage user accounts and permissions" />
      </Helmet>
      
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage user accounts and permissions</p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Create Associate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Associate</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="associate-name">Name</Label>
                  <Input
                    id="associate-name"
                    value={newAssociateName}
                    onChange={(e) => setNewAssociateName(e.target.value)}
                    placeholder="Enter associate name"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateAssociate} className="flex-1">
                    Create Associate
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              All Users ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Created {new Date(user.createdAt).toLocaleDateString()}
                        {user.id === currentUser?.id && ' (You)'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                      {user.isActive === false && (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Dialog 
                      open={editingUser?.id === user.id} 
                      onOpenChange={(open) => !open && setEditingUser(null)}
                    >
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => startEdit(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit User</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                              id="edit-name"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              placeholder="Enter user name"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleUpdateUser} className="flex-1">
                              Update
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setEditingUser(null)} 
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {user.id !== currentUser?.id && user.isActive !== false && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <UserX className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Deactivate User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to deactivate {user.name}? They will no longer be able to log in.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeactivateUser(user.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Deactivate
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              ))}

              {users.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No users found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default UserManagement;