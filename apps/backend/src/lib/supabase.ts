import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client for regular operations (respects RLS)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Service client for admin operations (bypasses RLS)
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);
