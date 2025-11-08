// Team chat API - Get or create team conversation
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/clerk-react/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getUserByClerkId } from '@/lib/auth/clerk-supabase';

// GET - Get team chat conversation
export async function GET(
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

    const supabase = await createClient();

    // Verify user is a team member or team creator
    const { data: team } = await supabase
      .from('teams')
      .select('created_by')
      .eq('id', teamId)
      .single();

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const isCreator = team.created_by === user.id;

    console.log('Team chat access check:', {
      teamId,
      userId: user.id,
      creatorId: team.created_by,
      isCreator
    });

    if (!isCreator) {
      const { data: membership } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      console.log('Membership check result:', { membership });

      if (!membership) {
        return NextResponse.json({
          error: 'Not a member of this team',
          debug: { userId: user.id, teamId, isCreator: false }
        }, { status: 403 });
      }
    }

    // Use service client to check for existing chat conversation (not announcements)
    const serviceClient = await createServiceClient();

    let { data: conversation } = await serviceClient
      .from('conversations')
      .select('*')
      .eq('team_id', teamId)
      .eq('type', 'team')
      .eq('is_active', true)
      .is('settings', null)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    console.log('Found chat conversation:', { conversation });

    // If conversation doesn't exist, create it
    if (!conversation) {
      const { data: team } = await supabase
        .from('teams')
        .select('name')
        .eq('id', teamId)
        .single();
      const { data: newConv, error: createError } = await serviceClient
        .from('conversations')
        .insert({
          type: 'team',
          title: `${team?.name || 'Team'} Chat`,
          description: 'Team discussion and coordination',
          team_id: teamId,
          created_by: user.id,
          is_active: true
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating team conversation:', createError);
        return NextResponse.json({ error: 'Failed to create team chat' }, { status: 500 });
      }

      conversation = newConv;

      // Add all team members as participants
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId)
        .eq('status', 'active');

      if (teamMembers && teamMembers.length > 0) {
        await serviceClient.from('conversation_participants').insert(
          teamMembers.map(member => ({
            conversation_id: conversation!.id,
            user_id: member.user_id,
            role: 'member',
            joined_at: new Date().toISOString()
          }))
        );
      }
    }

    // Verify user is a participant (they should be if they're a team member)
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', conversation.id)
      .eq('user_id', user.id)
      .single();

    // If not a participant, add them
    if (!participant) {
      const serviceClient = await createServiceClient();
      await serviceClient.from('conversation_participants').insert({
        conversation_id: conversation.id,
        user_id: user.id,
        role: 'member',
        joined_at: new Date().toISOString()
      });
    }

    return NextResponse.json({ data: { conversation } });
  } catch (error) {
    console.error('Error in team chat GET:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
