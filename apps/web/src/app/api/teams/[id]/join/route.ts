// Join team API endpoint
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/clerk-react/server';
import { createClient } from '@/lib/supabase/server';
import { getUserByClerkId } from '@/lib/auth/clerk-supabase';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const resolvedParams = await params;
    const teamId = resolvedParams.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { join_code } = body;

    const supabase = await createClient();

    // Get team details
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, name, join_code, max_members, current_members, is_public')
      .eq('id', teamId)
      .eq('status', 'active')
      .single();

    if (teamError || !team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Verify join code if provided
    if (join_code && team.join_code !== join_code.toUpperCase()) {
      return NextResponse.json({ error: 'Invalid join code' }, { status: 400 });
    }

    // Check if team requires join code and it wasn't provided
    if (!team.is_public && !join_code) {
      return NextResponse.json({ error: 'Join code required for this team' }, { status: 400 });
    }

    // Check if team is full
    if (team.max_members && team.current_members >= team.max_members) {
      return NextResponse.json({ error: 'Team is full' }, { status: 400 });
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (existingMember) {
      return NextResponse.json({ error: 'You are already a member of this team' }, { status: 400 });
    }

    // Add user to team
    const { data: newMember, error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: user.id,
        role: 'member',
        status: 'active',
        joined_at: new Date().toISOString()
      })
      .select()
      .single();

    if (memberError) {
      console.error('Error adding team member:', memberError);
      return NextResponse.json({ error: 'Failed to join team' }, { status: 500 });
    }

    // Update team member count
    const { error: updateError } = await supabase
      .from('teams')
      .update({
        current_members: (team.current_members || 0) + 1
      })
      .eq('id', teamId);

    if (updateError) {
      console.error('Error updating team member count:', updateError);
    }

    return NextResponse.json({
      message: `Successfully joined ${team.name}!`,
      member: newMember
    });
  } catch (error) {
    console.error('Error joining team:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}