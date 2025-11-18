-- Fix Issue #1: RLS infinite recursion on user_roles table
-- Drop existing problematic policies that query user_roles within user_roles
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;

-- Create new policies using the has_role() security definer function to avoid recursion
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Fix Issue #2: Profiles table exposed to unauthenticated users
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- Create policy requiring authentication
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Fix Issue #3: Clients table PII accessible to all employees
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all clients" ON public.clients;

-- Create policies restricting access to own clients or admin
CREATE POLICY "Users can view own clients"
ON public.clients
FOR SELECT
TO authenticated
USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'::app_role));