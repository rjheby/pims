
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fxifiwzklvnceyhtmvkb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4aWZpd3prbHZuY2V5aHRtdmtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxOTc0NjUsImV4cCI6MjA1NTc3MzQ2NX0.uoJqyke36nO5ymtEUBXsjhP5-nJlDq_COpbrHKr6cQQ';

// Add error handling and retry logic for fetch operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});

// Add a helper function to handle common fetch errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  
  // Check for network-related errors
  if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
    console.log('Network error detected. Please check your internet connection.');
    return 'Network error. Please check your connection and try again.';
  }
  
  // Check for auth errors
  if (error.code && (error.code === 'auth/invalid-auth' || error.code.includes('auth'))) {
    console.log('Authentication error detected.');
    return 'Authentication error. Please log in again.';
  }
  
  return error.message || 'An unexpected error occurred';
};
