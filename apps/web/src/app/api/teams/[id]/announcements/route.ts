// Team announcements API - Captain-only announcements
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/clerk-react/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getUserByClerkId } from '@/lib/auth/clerk-supabase';

// GET - Fetch team announcements
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

    const supabase = await createServiceClient();

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

    console.log('Announcements access check:', {
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

    // Use service client to check for existing announcement conversation
    const serviceClient = await createServiceClient();

    // First try to get conversation with the settings filter
    let { data: conversation } = await serviceClient
      .from('conversations')
      .select('*')
      .eq('team_id', teamId)
      .eq('type', 'team')
      .eq('is_active', true)
      .not('settings', 'is', null)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    console.log('Found announcement conversation:', { conversation });

    // If announcement conversation doesn't exist, create it
    if (!conversation) {
      const { data: team } = await supabase
        .from('teams')
        .select('name, created_by')
        .eq('id', teamId)
        .single();
      const { data: newConv, error: createError } = await serviceClient
        .from('conversations')
        .insert({
          type: 'team',
          title: `${team?.name || 'Team'} Announcements`,
          description: 'Official team updates and announcements',
          team_id: teamId,
          created_by: team?.created_by,
          is_active: true,
          settings: { announcement_mode: true }
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating announcements:', createError);
        return NextResponse.json({ error: 'Failed to create announcements' }, { status: 500 });
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
            role: member.user_id === team?.created_by ? 'admin' : 'member',
            joined_at: new Date().toISOString()
          }))
        );
      }
    }

    // Fetch announcements (messages)
    const { data: announcements, error: announcementsError } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id(id, display_name, avatar_url)
      `)
      .eq('conversation_id', conversation.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(50);

    if (announcementsError) {
      console.error('Error fetching announcements:', announcementsError);
      return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        announcements: announcements.reverse(),
        conversation_id: conversation.id
      }
    });
  } catch (error) {
    console.error('Error in announcements GET:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Create announcement (captain only)
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

    const body = await req.json();
    const { content, priority = 'normal' } = body;

    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'Announcement content is required' }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // Verify user is team captain
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('created_by, name')
      .eq('id', teamId)
      .single();

    if (teamError || !team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    if (team.created_by !== user.id) {
      return NextResponse.json({
        error: 'Only the team captain can post announcements'
      }, { status: 403 });
    }

    // Get or create announcements conversation
    let { data: conversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('team_id', teamId)
      .eq('type', 'team')
      .eq('is_active', true)
      .eq('settings->>announcement_mode', 'true')
      .single();

    if (!conversation) {
      const serviceClient = await createServiceClient();
      const { data: newConv, error: createError } = await serviceClient
        .from('conversations')
        .insert({
          type: 'team',
          title: `${team.name} Announcements`,
          description: 'Official team updates and announcements',
          team_id: teamId,
          created_by: user.id,
          is_active: true,
          settings: { announcement_mode: true }
        })
        .select()
        .single();

      if (createError) {
        return NextResponse.json({ error: 'Failed to create announcements' }, { status: 500 });
      }

      conversation = newConv;

      // Add all team members
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
            role: member.user_id === user.id ? 'admin' : 'member',
            joined_at: new Date().toISOString()
          }))
        );
      }
    }

    // Create announcement message
    const serviceClient = await createServiceClient();
    const { data: announcement, error: messageError } = await serviceClient
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: user.id,
        content,
        message_type: 'announcement',
        priority
      })
      .select(`
        *,
        sender:sender_id(id, display_name, avatar_url)
      `)
      .single();

    if (messageError) {
      console.error('Error creating announcement:', messageError);
      return NextResponse.json({ error: 'Failed to post announcement' }, { status: 500 });
    }

    // Notify all team members
    const { data: teamMembers } = await supabase
      .from('team_members')
      .select('user_id')
      .eq('team_id', teamId)
      .eq('status', 'active')
      .neq('user_id', user.id);

    if (teamMembers && teamMembers.length > 0) {
      await supabase.from('notifications').insert(
        teamMembers.map(member => ({
          user_id: member.user_id,
          type: 'team_announcement',
          title: `Team Announcement: ${team.name}`,
          message: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
          data: { team_id: teamId, announcement_id: announcement.id },
          action_url: `/teams/${teamId}`,
          priority,
          related_entity_type: 'message',
          related_entity_id: announcement.id
        }))
      );
    }

    return NextResponse.json({
      announcement,
      message: 'Announcement posted successfully'
    });
  } catch (error) {
    console.error('Error in announcements POST:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
