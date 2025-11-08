import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/clerk-react/server';
import { getUserByClerkId } from '@/lib/auth/clerk-supabase';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { createServiceClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceClient();

    // Get teams where user is a member
    const { data: teams, error } = await supabase
      .from('team_members')
      .select(`
        team:teams (
          id,
          name,
          description,
          max_members,
          status,
          created_at,
          join_code,
          created_by,
          sport_category:sports_categories(*)
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (error) {
      logger.error('Error fetching user teams:', error);
      return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
    }

    // Transform the data and get team members for each team
    const teamsWithMembers = await Promise.all(
      (teams || []).map(async (teamData: any) => {
        const team = teamData.team;
        if (!team) return null;

        // Get all members for this team
        const { data: members, error: membersError } = await supabase
          .from('team_members')
          .select(`
            id,
            user_id,
            role,
            status,
            user:users (
              id,
              display_name,
              avatar_url
            )
          `)
          .eq('team_id', team.id)
          .eq('status', 'active');

        if (membersError) {
          logger.error('Error fetching team members:', membersError);
          return {
            ...team,
            current_members: 0,
            members: []
          };
        }

        return {
          ...team,
          current_members: members?.length || 0,
          members: (members || []).map((member: any) => ({
            id: member.id,
            user_id: member.user_id,
            display_name: member.user?.display_name || 'Unknown User',
            avatar_url: member.user?.avatar_url || null,
            role: member.role || 'member',
            status: member.status
          }))
        };
      })
    );

    // Filter out null teams
    const validTeams = teamsWithMembers.filter(team => team !== null);

    return NextResponse.json({
      data: validTeams,
      count: validTeams.length
    });

  } catch (error) {
    logger.error('Error in get my teams:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}