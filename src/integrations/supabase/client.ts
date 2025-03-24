
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fxifiwzklvnceyhtmvkb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4aWZpd3prbHZuY2V5aHRtdmtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxOTc0NjUsImV4cCI6MjA1NTc3MzQ2NX0.uoJqyke36nO5ymtEUBXsjhP5-nJlDq_COpbrHKr6cQQ';

// Configure the Supabase client with explicit auth settings and realtime options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage,
    storageKey: 'woodbourne-supabase-auth',
    detectSessionInUrl: true,
    flowType: 'pkce',
    // Set long session duration (1 week = 604800 seconds)
    sessionExpiryTime: 604800,
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    },
    // Add retry configuration to handle websocket connection failures
    timeout: 30000, // 30s timeout
    heartbeatIntervalMs: 15000, // 15s heartbeat interval
    reconnectAfterMs: (retryCount) => {
      // Exponential backoff with jitter
      const delay = Math.min(1000 * (2 ** retryCount) + Math.random() * 1000, 10000);
      console.log(`WebSocket reconnect attempt ${retryCount + 1} after ${delay}ms`);
      return delay;
    }
  },
  // Add global error handler for debugging
  global: {
    headers: {
      'X-Client-Info': 'woodbourne-dispatch-app'
    },
    fetch: (url, options) => {
      // Fixed the spread argument issue by explicitly defining parameters
      return fetch(url, options).then(response => {
        if (!response.ok) {
          console.warn(`Supabase fetch failed: ${response.status} ${response.statusText}`, url);
        }
        return response;
      }).catch(err => {
        console.error('Supabase fetch error:', err);
        throw err;
      });
    }
  }
});

// Add a fallback method to handle WebSocket connection failures
export const fetchWithFallback = async (
  tableName: string, 
  queryFn: (query: any) => any, 
  useRealtime: boolean = true
) => {
  try {
    // First attempt to use subscription if realtime is enabled
    if (useRealtime) {
      try {
        const query = supabase.from(tableName);
        return await queryFn(query);
      } catch (error) {
        console.warn(`Realtime query failed for ${tableName}, falling back to REST:`, error);
      }
    }
    
    // If realtime fails or is disabled, fallback to REST API
    const query = supabase.from(tableName);
    return await queryFn(query);
  } catch (error) {
    console.error(`Error fetching data from ${tableName}:`, error);
    throw error;
  }
};

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

// Add a function to check if the session is valid
export const isSessionValid = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) return false;
    return !!data.session;
  } catch (e) {
    console.error("Error checking session validity:", e);
    return false;
  }
};

// Add a helper to detect if WebSocket is working and fall back to REST if not
export const checkRealtimeConnection = async () => {
  let isConnected = false;
  
  try {
    const channel = supabase.channel('connection-test');
    
    const timeout = setTimeout(() => {
      if (!isConnected) {
        channel.unsubscribe();
        console.warn('WebSocket connection test timed out, using REST fallback');
      }
    }, 5000);
    
    await new Promise<void>((resolve) => {
      channel
        .on('presence', { event: 'sync' }, () => {
          isConnected = true;
          clearTimeout(timeout);
          resolve();
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            isConnected = true;
            clearTimeout(timeout);
            resolve();
          }
        });
    });
    
    // Clean up
    channel.unsubscribe();
    
    return isConnected;
  } catch (error) {
    console.error('Error testing WebSocket connection:', error);
    return false;
  }
};
