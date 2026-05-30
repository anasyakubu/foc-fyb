import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isConfigured = !!(url && key);

// Falsy client when not configured; the SetupScreen guards the app before anything calls it.
export const supabase: SupabaseClient = isConfigured
  ? createClient(url!, key!)
  : (null as unknown as SupabaseClient);

export const PORTRAITS_BUCKET = 'portraits';
