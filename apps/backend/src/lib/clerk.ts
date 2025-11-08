import { clerkClient } from '@clerk/backend';

export const clerk = clerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

export async function getUserByClerkId(clerkId: string) {
  const { supabase } = await import('./supabase.js');

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();

  if (error) {
    console.error('Error fetching user by Clerk ID:', error);
    return null;
  }

  return user;
}
