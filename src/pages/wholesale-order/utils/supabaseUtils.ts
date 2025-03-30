
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Json } from "@/integrations/supabase/types";

// Utility function for safer Supabase queries
export function supabaseSafeFrom<T>(
  client: SupabaseClient,
  table: string
) {
  return client.from(table);
}

// Utility function for safer Supabase RPC calls
export function supabaseSafeRpc<T>(
  client: SupabaseClient,
  procedure: string,
  params?: Record<string, any>
) {
  return client.rpc(procedure, params);
}
