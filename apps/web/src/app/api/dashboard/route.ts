// Dashboard API route
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/clerk-react/server';
import { createClient } from '@/lib/supabase/server';
import { getUserByClerkId } from '@/lib/auth/clerk-supabase';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let user = await getUserByClerkId(userId);

    if (!user) {
      // User doesn't exist in Supabase, try to sync from Clerk
      const { currentUser } = await import('@clerk/clerk-react/server');
      const clerkUser = await currentUser();

      if (clerkUser) {
        const { syncClerkUserWithSupabase } = await import('@/lib/auth/clerk-supabase');
        user = await syncClerkUserWithSupabase(clerkUser);
      }

      if (!user) {
        return NextResponse.json({ error: 'User not found and sync failed' }, { status: 404 });
      }
    }

    const supabase = await createClient();

    // Fetch recent events (limit 5) - use service client to bypass RLS
    let recentEvents: any[] = [];
    try {
      const { createServiceClient } = await import('@/lib/supabase/server');
      const serviceSupabase = await createServiceClient();

      const { data, error: eventsError } = await serviceSupabase
        .from('events')
        .select('*')
        .eq('status', 'registration_open')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (eventsError) {
        console.error('Error fetching recent events:', eventsError);
      } else {
        recentEvents = data || [];
      }
    } catch (error) {
      console.error('Events table may not exist or be accessible:', error);
    }

    // Fetch user teams
    let userTeams = [];
    try {
      const { data, error: teamsError } = await supabase
        .from('team_members')
        .select(`
          team_id,
          teams (
            id,
            name,
            sport,
            description,
            max_members,
            current_members,
            is_public,
            status,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (teamsError) {
        console.error('Error fetching user teams:', teamsError);
      } else {
        userTeams = data || [];
      }
    } catch (error) {
      console.error('Teams tables may not exist or be accessible:', error);
    }

    // Fetch personal records (limit 5)
    let personalRecords: any[] = [];
    try {
      const { data, error: prError } = await supabase
        .from('personal_records')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (prError) {
        console.error('Error fetching personal records:', prError);
      } else {
        personalRecords = data || [];
      }
    } catch (error) {
      console.error('Personal records table may not exist or be accessible:', error);
    }

    // Calculate stats
    const totalEvents = recentEvents?.length || 0;
    const totalTeams = userTeams?.length || 0;
    const totalPRs = personalRecords?.length || 0;

    // Calculate profile completion percentage
    let completionFields = 0;
    const totalFields = 10; // Adjust based on required profile fields

    if (user.first_name) completionFields++;
    if (user.last_name) completionFields++;
    if (user.email) completionFields++;
    if (user.phone) completionFields++;
    if (user.date_of_birth) completionFields++;
    if (user.gender) completionFields++;
    if (user.state) completionFields++;
    if (user.city) completionFields++;
    if (user.address) completionFields++;
    if (user.pincode) completionFields++;

    const profileCompletion = Math.round((completionFields / totalFields) * 100);

    const dashboardData = {
      user,
      recentEvents,
      userTeams: userTeams?.map(tm => tm.teams).filter(Boolean) || [],
      personalRecords,
      stats: {
        totalEvents,
        totalTeams,
        totalPRs,
        profileCompletion
      }
    };

    return NextResponse.json({
      data: dashboardData
    }, { status: 200 });

  } catch (error) {
    console.error('Error in dashboard API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}