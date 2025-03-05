// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://antcvfmdbzzeebmyizob.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFudGN2Zm1kYnp6ZWVibXlpem9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwNzQ4NTUsImV4cCI6MjA1NjY1MDg1NX0.DnCU83XVrW2fwavjajnZy9Lgvxw6P2GKzS4CWHWLW7g";

// Export these values for direct API calls
export const SUPABASE_API_URL = SUPABASE_URL;
export const SUPABASE_API_KEY = SUPABASE_PUBLISHABLE_KEY;

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
});

// Add debug logging for easier development troubleshooting
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth event:', event, session);
});

// Directly expose raw fetch method for testing
export const rawFetch = async (url: string, options: RequestInit = {}) => {
  const fullUrl = `${SUPABASE_URL}${url.startsWith('/') ? url : '/' + url}`;
  console.log(`Direct fetch to: ${fullUrl}`);
  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        ...(options.headers || {}),
        'apikey': SUPABASE_PUBLISHABLE_KEY,
        'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      },
    });
    
    console.log(`Response status: ${response.status}`);
    const data = await response.json();
    console.log('Raw response data:', data);
    return data;
  } catch (error) {
    console.error('Raw fetch error:', error);
    throw error;
  }
};

// Enhanced debug for all database operations
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
            console.warn(`No data returned for '${table}' query. This might indicate: 
              1. The table is empty 
              2. The query conditions did not match any records
              3. RLS policies are preventing access to the data`);
              
            // Try a raw fetch as a fallback to check directly
            rawFetch(`/rest/v1/${table}?select=*`).then(rawData => {
              console.log(`Raw fetch of '${table}' returned:`, {
                count: Array.isArray(rawData) ? rawData.length : 'Not an array',
                data: rawData
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
  
  // Add debug for insert operations
  const originalInsert = wrappedFrom.insert;
  wrappedFrom.insert = function debugInsert(values, options) {
    console.log(`Executing INSERT into '${table}' with values:`, values);
    const query = originalInsert.call(this, values, options);
    
    const originalThen = query.then;
    query.then = function(onFulfilled, onRejected) {
      return originalThen.call(this,
        (result) => {
          console.log(`Insert result for '${table}':`, {
            success: !result.error,
            data: result.data,
            error: result.error
          });
          return onFulfilled(result);
        },
        (error) => {
          console.error(`Insert error for '${table}':`, error);
          return onRejected ? onRejected(error) : Promise.reject(error);
        }
      );
    };
    
    return query;
  };
  
  return wrappedFrom;
};
