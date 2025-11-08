// Coaches API routes
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
    const maxFee = searchParams.get('max_fee');

    // Get current user to filter them out
    let currentUserId: string | null = null;
    if (userId) {
      const user = await getUserByClerkId(userId);
      currentUserId = user?.id || null;
    }

    // Use service client to bypass RLS for public coach profiles
    const { createServiceClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceClient();

    let query = supabase
      .from('coach_profiles')
      .select(`
        *,
        user:users!coach_profiles_user_id_fkey(
          id,
          display_name,
          first_name,
          last_name,
          avatar_url,
          city,
          state,
          is_verified
        )
      `)
      .eq('verification_status', 'verified')
      .order('rating', { ascending: false });

    // Filter out current user
    if (currentUserId) {
      query = query.neq('user_id', currentUserId);
    }

    // Apply filters
    if (sport) {
      query = query.contains('specializations', [sport]);
    }

    if (location) {
      query = query.or(`user.city.ilike.%${location}%,user.state.ilike.%${location}%`);
    }

    if (maxFee) {
      query = query.lte('fee_per_month', parseInt(maxFee));
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('coach_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('verification_status', 'verified');

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: coaches, error } = await query;

    if (error) {
      console.error('Error fetching coaches:', error);
      return NextResponse.json({ error: 'Failed to fetch coaches' }, { status: 500 });
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      data: coaches,
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
    console.error('Error fetching coaches:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}