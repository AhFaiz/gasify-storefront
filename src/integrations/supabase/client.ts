
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://antcvfmdbzzeebmyizob.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFudGN2Zm1kYnp6ZWVibXlpem9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwNzQ4NTUsImV4cCI6MjA1NjY1MDg1NX0.DnCU83XVrW2fwavjajnZy9Lgvxw6P2GKzS4CWHWLW7g";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'x-app-version': '1.0.0',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Add debug logging for easier development troubleshooting
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth event:', event, session);
});

// Add additional debugging for database operations
const originalFrom = supabase.from.bind(supabase);
supabase.from = function debugFrom(table) {
  console.log(`Accessing table: ${table}`);
  return originalFrom(table);
};
