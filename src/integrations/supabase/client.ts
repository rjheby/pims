
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://keikssvjmvtdorueoibj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlaWtzc3ZqbXZ0ZG9ydWVvaWJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1NDc0NDcsImV4cCI6MjA2NDEyMzQ0N30.cDprszIsLwW8t6YklF-H6z4UKDICTwbjyIzsnYPHbWI";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Simple error handler for Supabase errors
export const handleSupabaseError = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Simple function to provide data with fallback
export const fetchWithFallback = async (table: string, queryFn: () => any) => {
  try {
    return await queryFn();
  } catch (error) {
    console.error(`Error fetching from ${table}:`, error);
    return { data: [], error };
  }
};
