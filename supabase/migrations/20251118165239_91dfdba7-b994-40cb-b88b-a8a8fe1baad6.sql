-- Fix security warning: Add search_path to handle_updated_at function
-- This prevents potential privilege escalation attacks by ensuring the function
-- only accesses objects in the public schema

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;