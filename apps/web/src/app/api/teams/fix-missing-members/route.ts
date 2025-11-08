// Fix missing team creators as team members
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/clerk-react/server';
import { getUserByClerkId } from '@/lib/auth/clerk-supabase';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow admin users or for development - add proper auth check here
    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { createServiceClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceClient();

    // Find teams where creator is not in team_members
    const { data: teamsWithoutCreator, error: teamsError } = await (supabase as any)
      .from('teams')
      .select(`
        id,
        created_by,
        name,
        created_at
      `)
      .eq('status', 'active');

    if (teamsError) {
      console.error('Error fetching teams:', teamsError);
      return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
    }

    console.log(`Found ${teamsWithoutCreator?.length} teams to check`);

    const teamsToFix = [];

    for (const team of teamsWithoutCreator || []) {
      // Check if creator is already a member
      const { data: existingMember } = await (supabase as any)
        .from('team_members')
        .select('id')
        .eq('team_id', team.id)
        .eq('user_id', team.created_by)
        .single();

      if (!existingMember) {
        teamsToFix.push(team);
      }
    }

    console.log(`Found ${teamsToFix.length} teams missing creator as member`);

    // Fix each team by adding creator as captain
    const results = [];
    for (const team of teamsToFix) {
      try {
        const { error: memberError } = await (supabase as any)
          .from('team_members')
          .insert({
            team_id: team.id,
            user_id: team.created_by,
            role: 'captain',
            status: 'active',
            joined_at: team.created_at, // Use team creation date
          });

        if (memberError) {
          console.error(`Failed to add creator to team ${team.id}:`, memberError);
          results.push({ team: team.name, status: 'error', error: memberError.message });
        } else {
          // Update team member count
          await (supabase as any)
            .from('teams')
            .update({ current_members: 1 })
            .eq('id', team.id);

          console.log(`Successfully added creator to team ${team.name}`);
          results.push({ team: team.name, status: 'fixed' });
        }
      } catch (error: any) {
        console.error(`Error fixing team ${team.id}:`, error);
        results.push({ team: team.name, status: 'error', error: error.message });
      }
    }

    return NextResponse.json({
      message: `Fixed ${results.filter(r => r.status === 'fixed').length} teams`,
      results
    });
  } catch (error) {
    console.error('Error fixing teams:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}