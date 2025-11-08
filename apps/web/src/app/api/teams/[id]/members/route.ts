// Team members management API
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

    const body = await req.json();
    const { member_id } = body;

    if (!member_id) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Check if user is team captain
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('created_by, current_members')
      .eq('id', teamId)
      .single();

    if (teamError || !team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    if ((team as any).created_by !== user.id) {
      return NextResponse.json({ error: 'Only team captain can remove members' }, { status: 403 });
    }

    // Use service client to bypass RLS for member operations
    const { createServiceClient } = await import('@/lib/supabase/server');
    const serviceSupabase = await createServiceClient();

    // Get member details before removal using service client
    const { data: member, error: memberError } = await (serviceSupabase as any)
      .from('team_members')
      .select('user_id, role')
      .eq('id', member_id)
      .eq('team_id', teamId)
      .single();

    if (memberError || !member) {
      console.error('Member lookup error:', memberError);
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Cannot remove captain/self
    if ((member as any).role === 'captain' || (member as any).user_id === user.id) {
      return NextResponse.json({ error: 'Cannot remove team captain' }, { status: 400 });
    }

    // Remove member using service client
    const { error: removeError } = await (serviceSupabase as any)
      .from('team_members')
      .delete()
      .eq('id', member_id)
      .eq('team_id', teamId);

    if (removeError) {
      console.error('Error removing team member:', removeError);
      return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
    }

    // Update team member count using service client
    const { error: updateError } = await (serviceSupabase as any)
      .from('teams')
      .update({
        current_members: Math.max(0, ((team as any).current_members || 1) - 1)
      })
      .eq('id', teamId);

    if (updateError) {
      console.error('Error updating team member count:', updateError);
    }

    return NextResponse.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}