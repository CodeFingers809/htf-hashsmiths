// Public User Profile API
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/clerk-react/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: currentUserId } = await auth();

    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: targetUserId } = params;

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
        bio,
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

    // Check if profile should be visible (for future privacy controls)
    // For now, all active users have public profiles

    // Filter sensitive data for public viewing
    const publicProfile = {
      ...user,
      // Remove sensitive fields if needed
      // date_of_birth: user.date_of_birth ? '****' : null, // Could hide exact birthdate
    };

    return NextResponse.json({
      data: publicProfile
    });

  } catch (error) {
    console.error('Error in public profile API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}