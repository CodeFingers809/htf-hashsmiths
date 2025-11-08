// Temporary endpoint to manually sync current Clerk user with Supabase
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/clerk-react/server';
import { syncClerkUserWithSupabase } from '@/lib/auth/clerk-supabase';

export async function POST() {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('Syncing user:', clerkUser.id);

    const supabaseUser = await syncClerkUserWithSupabase(clerkUser);

    if (!supabaseUser) {
      return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'User synced successfully',
      user: supabaseUser
    });

  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}