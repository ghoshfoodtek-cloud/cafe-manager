import { supabase } from "@/integrations/supabase/client";

export type AppRole = 'admin' | 'associate';

export interface UserProfile {
  id: string;
  name: string;
  role?: AppRole;
}

// Get current session
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

// Get current user with role
export const getCurrentUser = async (): Promise<UserProfile | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  return {
    id: user.id,
    name: profile?.name || 'User',
    role: roleData?.role as AppRole | undefined,
  };
};

// Check if user has a specific role
export const hasRole = async (userId: string, role: AppRole): Promise<boolean> => {
  const { data } = await supabase.rpc('has_role', {
    _user_id: userId,
    _role: role,
  });
  return data === true;
};

// Sign up new user
export const signUp = async (email: string, password: string, name: string) => {
  const redirectUrl = `${window.location.origin}/`;
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        name,
      },
    },
  });
  
  return { data, error };
};

// Sign in existing user
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
};

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Create admin user (only callable by existing admin)
export const createAdmin = async (email: string, password: string, name: string) => {
  const { data, error } = await signUp(email, password, name);
  if (error || !data.user) return { error };

  // Add admin role
  const { error: roleError } = await supabase
    .from('user_roles')
    .insert({
      user_id: data.user.id,
      role: 'admin',
    });

  return { data, error: roleError };
};

// Create associate user (only callable by admin)
export const createAssociate = async (email: string, password: string, name: string) => {
  const { data, error } = await signUp(email, password, name);
  if (error || !data.user) return { error };

  // Add associate role
  const { error: roleError } = await supabase
    .from('user_roles')
    .insert({
      user_id: data.user.id,
      role: 'associate',
    });

  return { data, error: roleError };
};
