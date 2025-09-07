import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getAllUsers, switchUser, createAssociate, getCurrentUser } from '@/lib/auth-enhanced';
import { useAuth } from '@/components/auth/AuthContext';
import { User } from '@/types/user';
import { toast } from 'sonner';
import { UserPlus, LogIn } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { refreshAuth, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newAssociateName, setNewAssociateName] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
      return;
    }
    
    const allUsers = getAllUsers();
    setUsers(allUsers.filter(u => u.isActive !== false));
  }, [isAuthenticated, navigate]);

  const handleLogin = () => {
    if (!selectedUserId) {
      toast.error('Please select a user');
      return;
    }

    const success = switchUser(selectedUserId);
    if (success) {
      refreshAuth();
      toast.success('Logged in successfully');
      navigate('/', { replace: true });
    } else {
      toast.error('Failed to login');
    }
  };

  const handleCreateAssociate = () => {
    if (!newAssociateName.trim()) {
      toast.error('Please enter a name');
      return;
    }

    try {
      const newUser = createAssociate(newAssociateName.trim());
      setUsers(prev => [...prev, newUser]);
      setNewAssociateName('');
      setShowCreateDialog(false);
      toast.success('Associate created successfully');
    } catch (error) {
      toast.error('Failed to create associate');
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - Bharat Connect Pro</title>
        <meta name="description" content="Login to access your CRM system" />
      </Helmet>
      
      <div className="min-h-screen bg-background-subtle flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto h-12 w-12 bg-primary rounded-full flex items-center justify-center">
              <LogIn className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-h2">Bharat Connect Pro</CardTitle>
            <p className="text-muted-foreground">Select your user account to continue</p>
          </CardHeader>
          
          <CardContent className="content-spacing">
            <div className="tight-spacing">
              <Label htmlFor="user-select" className="text-sm font-medium">Select User</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger id="user-select" className="h-11">
                  <SelectValue placeholder="Choose a user account" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {user.role}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleLogin} 
              className="w-full h-11" 
              disabled={!selectedUserId}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </Button>

            <div className="text-center pt-2">
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Associate
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-h3">Create New Associate</DialogTitle>
                  </DialogHeader>
                  <div className="content-spacing">
                    <div className="tight-spacing">
                      <Label htmlFor="associate-name" className="text-sm font-medium">Name</Label>
                      <Input
                        id="associate-name"
                        value={newAssociateName}
                        onChange={(e) => setNewAssociateName(e.target.value)}
                        placeholder="Enter associate name"
                        className="h-11"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={handleCreateAssociate} className="flex-1">
                        Create
                      </Button>
                      <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Login;