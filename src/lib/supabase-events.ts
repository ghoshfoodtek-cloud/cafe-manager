import { supabase } from "@/integrations/supabase/client";

export interface GlobalEvent {
  id: string;
  description: string;
  created_by_name: string;
  created_at: string;
  created_by: string | null;
}

export async function getGlobalEvents(): Promise<GlobalEvent[]> {
  const { data, error } = await supabase
    .from("global_events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createGlobalEvent(
  description: string,
  createdByName: string
): Promise<GlobalEvent> {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from("global_events")
    .insert({
      description,
      created_by_name: createdByName,
      created_by: user?.id
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
