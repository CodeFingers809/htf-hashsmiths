// Leave team API endpoint
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/clerk-react/server';
import { createClient } from '@/lib/supabase/server';
import { getUserByClerkId } from '@/lib/auth/clerk-supabase';

export async function DELETE(
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

    const supabase = await createClient();

    // Get team and member details
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, name, created_by, current_members')
      .eq('id', teamId)
      .single();

    if (teamError || !team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Check if user is team captain - captains cannot leave their own team
    if (team.created_by === user.id) {
      return NextResponse.json({
        error: 'Team captains cannot leave their own team. Transfer leadership or delete the team instead.'
      }, { status: 400 });
    }

    // Find user's membership
    const { data: membership, error: memberError } = await supabase
      .from('team_members')
      .select('id, role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (memberError || !membership) {
      return NextResponse.json({ error: 'You are not a member of this team' }, { status: 404 });
    }

    // Remove user from team
    const { error: removeError } = await supabase
      .from('team_members')
      .delete()
      .eq('id', membership.id);

    if (removeError) {
      console.error('Error leaving team:', removeError);
      return NextResponse.json({ error: 'Failed to leave team' }, { status: 500 });
    }

    // Update team member count
    const { error: updateError } = await supabase
      .from('teams')
      .update({
        current_members: Math.max(0, (team.current_members || 1) - 1)
      })
      .eq('id', teamId);

    if (updateError) {
      console.error('Error updating team member count:', updateError);
    }

    return NextResponse.json({ message: `Successfully left ${team.name}` });
  } catch (error) {
    console.error('Error leaving team:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}