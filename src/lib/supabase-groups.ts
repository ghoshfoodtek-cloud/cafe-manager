import { supabase } from "@/integrations/supabase/client";

export interface ContactGroup {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export async function getContactGroups(): Promise<ContactGroup[]> {
  const { data, error } = await supabase
    .from("contact_groups")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createContactGroup(name: string): Promise<ContactGroup> {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from("contact_groups")
    .insert({
      name,
      created_by: user?.id
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateContactGroup(
  id: string,
  name: string
): Promise<ContactGroup> {
  const { data, error } = await supabase
    .from("contact_groups")
    .update({ name })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
