import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser, UserProfile } from '@/lib/supabase-auth';

interface SupabaseAuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAssociate: boolean;
  canDelete: boolean;
  canManageUsers: boolean;
  loading: boolean;
  refreshAuth: () => Promise<void>;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | null>(null);

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

interface SupabaseAuthProviderProps {
  children: ReactNode;
}

export const SupabaseAuthProvider: React.FC<SupabaseAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAuth = async () => {
    try {
      const currentProfile = await getCurrentUser();
      setProfile(currentProfile);
    } catch (error) {
      console.error('Error refreshing auth:', error);
      setProfile(null);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Defer fetching profile to avoid deadlock
        if (currentSession?.user) {
          setTimeout(() => {
            refreshAuth();
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        setTimeout(() => {
          refreshAuth();
        }, 0);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = profile?.role === 'admin';
  const isAssociate = profile?.role === 'associate';
  const canDelete = isAdmin;
  const canManageUsers = isAdmin;

  return (
    <SupabaseAuthContext.Provider value={{
      user,
      session,
      profile,
      isAuthenticated,
      isAdmin,
      isAssociate,
      canDelete,
      canManageUsers,
      loading,
      refreshAuth,
    }}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};
