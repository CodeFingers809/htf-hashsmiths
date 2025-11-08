// Athletes API routes
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/clerk-react/server';
import { createClient } from '@/lib/supabase/server';
import { getUserByClerkId } from '@/lib/auth/clerk-supabase';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const sport = searchParams.get('sport');
    const location = searchParams.get('location');
    const level = searchParams.get('level');
    const age_min = searchParams.get('age_min');
    const age_max = searchParams.get('age_max');

    // Get current user to filter them out
    let currentUserId: string | null = null;
    if (userId) {
      const user = await getUserByClerkId(userId);
      currentUserId = user?.id || null;
    }

    // Use service client to bypass RLS for public athlete profiles
    const { createServiceClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceClient();

    let query = supabase
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
          badge_level
        )
      `)
      .eq('account_type', 'athlete')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    // Filter out current user
    if (currentUserId) {
      query = query.neq('id', currentUserId);
    }

    // Apply filters
    if (sport) {
      query = query.eq('user_sports.sport_name', sport);
    }

    if (location) {
      query = query.or(`city.ilike.%${location}%,state.ilike.%${location}%`);
    }

    if (level) {
      query = query.eq('user_sports.experience_level', level);
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('account_type', 'athlete')
      .eq('is_active', true);

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: athletes, error } = await query;

    if (error) {
      console.error('Error fetching athletes:', error);
      return NextResponse.json({ error: 'Failed to fetch athletes' }, { status: 500 });
    }

    // Process athletes to calculate age and get best personal record
    const processedAthletes = athletes?.map(athlete => {
      const age = athlete.date_of_birth
        ? Math.floor((new Date().getTime() - new Date(athlete.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : null;

      const primarySport = athlete.user_sports?.find((sport: any) => sport.is_primary) || athlete.user_sports?.[0];

      const bestRecord = athlete.personal_records?.reduce((best: any, record: any) => {
        if (!best || (record.verification_status === 'verified' && best.verification_status !== 'verified')) {
          return record;
        }
        return best;
      }, null);

      return {
        ...athlete,
        age,
        primary_sport: primarySport,
        best_personal_record: bestRecord
      };
    });

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      data: processedAthletes,
      pagination: {
        page,
        limit,
        count: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching athletes:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}