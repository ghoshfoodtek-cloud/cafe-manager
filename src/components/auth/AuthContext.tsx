import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/user';
import { getCurrentUser, initializeUsers } from '@/lib/auth-enhanced';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAssociate: boolean;
  canDelete: boolean;
  canManageUsers: boolean;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const refreshAuth = () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  };

  useEffect(() => {
    initializeUsers();
    refreshAuth();
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isAssociate = user?.role === 'associate';
  const canDelete = isAdmin;
  const canManageUsers = isAdmin;

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isAdmin,
      isAssociate,
      canDelete,
      canManageUsers,
      refreshAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};