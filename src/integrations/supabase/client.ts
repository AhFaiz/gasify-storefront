
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

// Enhanced debug functions for database operations with better error handling
const originalFrom = supabase.from.bind(supabase);
supabase.from = function debugFrom(table) {
  console.log(`Accessing table: ${table}`);
  
  const originalSelect = originalFrom(table).select;
  const wrappedFrom = originalFrom(table);
  
  wrappedFrom.select = function debugSelect(...args) {
    console.log(`Executing SELECT query on table '${table}' with arguments:`, args);
    const query = originalSelect.apply(this, args);
    
    const originalThen = query.then;
    query.then = function debugThen(onFulfilled, onRejected) {
      return originalThen.call(this, 
        (result) => {
          console.log(`Query result for '${table}':`, { 
            success: !result.error, 
            count: result.data?.length || 0,
            error: result.error,
            status: result.status,
            statusText: result.statusText
          });
          
          if (result.error) {
            console.error(`Error details for '${table}' query:`, result.error);
          } else if (!result.data || result.data.length === 0) {
            console.warn(`No data returned for '${table}' query. This may indicate: 
              1. The table is empty 
              2. The query conditions did not match any records
              3. RLS policies are preventing access to the data`);
              
            // Log additional information about the table structure
            supabase.from(table).select('*', { count: 'exact', head: true })
              .then(countResult => {
                console.log(`Table '${table}' metadata check:`, {
                  estimatedCount: countResult.count,
                  hasError: !!countResult.error,
                  error: countResult.error
                });
              });
          } else {
            console.log(`First item from '${table}' query:`, result.data[0]);
          }
          
          return onFulfilled(result);
        }, 
        (error) => {
          console.error(`Unhandled error in '${table}' query:`, error);
          return onRejected ? onRejected(error) : Promise.reject(error);
        }
      );
    };
    
    return query;
  };
  
  return wrappedFrom;
};
