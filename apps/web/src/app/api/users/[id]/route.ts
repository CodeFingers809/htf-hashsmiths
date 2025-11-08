// Individual User Profile API
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/clerk-react/server';
import { getUserByClerkId } from '@/lib/auth/clerk-supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: currentUserId } = await auth();

    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id: targetUserId } = resolvedParams;

    // Check if user is viewing their own profile
    const currentUser = await getUserByClerkId(currentUserId);
    if (currentUser && currentUser.id === targetUserId) {
      return NextResponse.json({ error: 'own_profile', redirectTo: '/profile' }, { status: 400 });
    }

    // Use service client to bypass RLS for public profile viewing
    const { createServiceClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceClient() as any;

    // Fetch user profile with related data
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        display_name,
        first_name,
        last_name,
        avatar_url,
        city,
        state,
        date_of_birth,
        is_verified,
        account_type,
        created_at,
        user_sports:user_sports(
          sport_name,
          experience_level,
          years_experience,
          is_primary
        ),
        personal_records:personal_records(
          category,
          value,
          unit,
          verification_status,
          badge_level,
          achievement_date
        )
      `)
      .eq('id', targetUserId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      data: user
    });

  } catch (error) {
    console.error('Error in user profile API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}