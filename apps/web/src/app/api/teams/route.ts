// Teams API routes
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/clerk-react/server';
import { createClient } from '@/lib/supabase/server';
import { getUserByClerkId } from '@/lib/auth/clerk-supabase';
import { TeamInsert } from '@/types/database';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const sport = searchParams.get('sport');
    const location = searchParams.get('location');
    const experienceLevel = searchParams.get('experience_level');
    const excludeUserTeams = searchParams.get('exclude_user_teams') === 'true';

    const { userId } = await auth();
    let currentUserId = null;

    // Get current user if authenticated and exclusion is requested
    if (userId && excludeUserTeams) {
      const user = await getUserByClerkId(userId);
      currentUserId = user?.id;
    }

    const supabase = await createClient();

    let query = supabase
      .from('teams')
      .select(`
        *,
        sport_category:sports_categories(*),
        members:team_members(
          id,
          role,
          status,
          user_id,
          user:users(
            id,
            display_name,
            avatar_url
          )
        ),
        created_by_user:users!teams_created_by_fkey(
          id,
          display_name,
          avatar_url
        )
      `)
      .eq('is_public', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    // Apply filters
    if (sport) {
      query = query.eq('sport_category.sport_name', sport);
    }

    if (location) {
      query = query.or(`location_city.ilike.%${location}%,location_state.ilike.%${location}%`);
    }

    if (experienceLevel) {
      query = query.eq('experience_level', experienceLevel);
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true })
      .eq('is_public', true)
      .eq('status', 'active');

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: teams, error } = await query;

    if (error) {
      console.error('Error fetching teams:', error);
      return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
    }

    // Filter out teams where user is already a member or creator
    let filteredTeams = teams;
    if (currentUserId && excludeUserTeams) {
      // Use service client to check memberships (bypasses RLS)
      const { createServiceClient } = await import('@/lib/supabase/server');
      const serviceSupabase = await createServiceClient();

      // Get all team memberships for current user
      const { data: userMemberships } = await (serviceSupabase as any)
        .from('team_members')
        .select('team_id')
        .eq('user_id', currentUserId)
        .eq('status', 'active');

      const memberTeamIds = new Set(userMemberships?.map((m: any) => m.team_id) || []);

      filteredTeams = teams?.filter((team: any) => {
        // Exclude if user is the creator
        if ((team as any).created_by === currentUserId) return false;

        // Exclude if user is a member (using service client data)
        if (memberTeamIds.has((team as any).id)) return false;

        return true;
      }) || [];
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      data: filteredTeams,
      pagination: {
        page,
        limit,
        count: filteredTeams?.length || 0,
        totalPages: Math.ceil((filteredTeams?.length || 0) / limit),
        hasNext: page < Math.ceil((filteredTeams?.length || 0) / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserByClerkId(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();

    // Generate a unique join code
    const generateJoinCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const teamData: TeamInsert = {
      name: body.name,
      description: body.description,
      sport_category_id: body.sport_category_id,
      event_id: body.event_id,
      max_members: body.max_members || 4,
      is_public: body.is_public ?? true,
      required_skills: body.required_skills || [],
      requirements: body.requirements || [],
      experience_level: body.experience_level,
      location_city: body.location_city,
      location_state: body.location_state,
      practice_schedule: body.practice_schedule,
      created_by: user.id,
      join_code: generateJoinCode(),
      current_members: 1, // Creator is the first member
    };

    const { createServiceClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceClient();

    // Start a transaction to create team and add creator as captain
    const { data: team, error: teamError } = await (supabase as any)
      .from('teams')
      .insert(teamData)
      .select(`
        *,
        sport_category:sports_categories(*)
      `)
      .single();

    if (teamError) {
      console.error('Error creating team:', teamError);
      return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
    }

    console.log('Team created successfully:', team.id);
    console.log('Adding creator as captain with user_id:', user.id);

    // Add creator as team captain
    const { error: memberError } = await (supabase as any)
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: user.id,
        role: 'captain',
        status: 'active',
        joined_at: new Date().toISOString(),
      });

    if (memberError) {
      console.error('Error adding team captain:', memberError);
      // Clean up the team if adding captain fails
      await (supabase as any).from('teams').delete().eq('id', team.id);
      return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
    }

    console.log('Successfully added creator as team captain');

    return NextResponse.json({ data: team }, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}