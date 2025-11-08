// NOTE: This file is for API routes only - will be moved to backend
// Supabase server configuration for API routes
import { createServerClient } from '@supabase/ssr';
import { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const createClient = async () => {
  // Note: This won't work in Vite without a backend
  // This is kept for API routes that will be moved to backend
  throw new Error('Server-side Supabase client not supported in Vite. Use client.ts instead or move to backend.');
};

// Service role client for admin operations (use carefully!)
export const createServiceClient = async () => {
  if (!supabaseServiceKey) {
    throw new Error('Missing Supabase service role key');
  }

  return createServerClient<Database>(
    supabaseUrl,
    supabaseServiceKey,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // Do nothing for service client
        },
      },
    }
  );
};

// Middleware client for auth handling
export const createMiddlewareClient = (request: Request) => {
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          const cookies = new Map(
            request.headers.get('cookie')
              ?.split('; ')
              .map(cookie => cookie.split('=') as [string, string]) ?? []
          );
          return Array.from(cookies.entries()).map(([name, value]) => ({ name, value }));
        },
        setAll(cookiesToSet) {
          // This will be handled by the middleware response
        },
      },
    }
  );
};