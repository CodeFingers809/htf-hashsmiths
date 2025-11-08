// Temporary endpoint to fix missing team memberships
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/clerk-react/server';
import { createServiceClient } from '@/lib/supabase/server';
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

    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const supabase = await createServiceClient();

    // Check if user is team creator
    const { data: team } = await supabase
      .from('teams')
      .select('created_by, name')
      .eq('id', teamId)
      .single();

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    if (team.created_by !== user.id) {
      return NextResponse.json({ error: 'Only team creator can fix membership' }, { status: 403 });
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ message: 'Already a team member', member: existing });
    }

    // Add as captain
    const { data: member, error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: user.id,
        role: 'captain',
        status: 'active',
        joined_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (memberError) {
      console.error('Error adding team member:', memberError);
      return NextResponse.json({ error: 'Failed to add member' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Membership fixed!', member });
  } catch (error) {
    console.error('Error in fix-membership:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
