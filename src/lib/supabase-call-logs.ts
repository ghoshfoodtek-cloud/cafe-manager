import { supabase } from "@/integrations/supabase/client";
import type { CallLog } from "./calls";

export type { CallLog };

export async function getCallLogs(): Promise<CallLog[]> {
  const { data, error } = await supabase
    .from("call_logs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching call logs:", error);
    throw error;
  }

  return (data || []).map((row) => ({
    id: row.id,
    clientId: row.client_id,
    clientName: row.client_name,
    phone: row.phone,
    startedAt: row.started_at,
    endedAt: row.ended_at || undefined,
    durationSec: row.duration_sec || undefined,
    notes: row.notes || undefined,
    recording: row.recording_mime && row.recording_data
      ? {
          mime: row.recording_mime,
          dataBase64: row.recording_data,
        }
      : undefined,
  }));
}

export async function createCallLog(log: Omit<CallLog, "id">): Promise<CallLog> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User must be authenticated to create call logs");
  }

  const { data, error } = await supabase
    .from("call_logs")
    .insert({
      client_id: log.clientId,
      client_name: log.clientName,
      phone: log.phone,
      started_at: log.startedAt,
      ended_at: log.endedAt || null,
      duration_sec: log.durationSec || null,
      notes: log.notes || null,
      recording_mime: log.recording?.mime || null,
      recording_data: log.recording?.dataBase64 || null,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating call log:", error);
    throw error;
  }

  return {
    id: data.id,
    clientId: data.client_id,
    clientName: data.client_name,
    phone: data.phone,
    startedAt: data.started_at,
    endedAt: data.ended_at || undefined,
    durationSec: data.duration_sec || undefined,
    notes: data.notes || undefined,
    recording: data.recording_mime && data.recording_data
      ? {
          mime: data.recording_mime,
          dataBase64: data.recording_data,
        }
      : undefined,
  };
}

export async function deleteCallLog(id: string): Promise<void> {
  const { error } = await supabase
    .from("call_logs")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting call log:", error);
    throw error;
  }
}
