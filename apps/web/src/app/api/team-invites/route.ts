// Team Invites API routes
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/clerk-react/server';
import { getUserByClerkId } from '@/lib/auth/clerk-supabase';

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

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'sent' | 'received' | 'team_requests'
    const team_id = searchParams.get('team_id');
    const status = searchParams.get('status');

    const { createServiceClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceClient() as any;

    let query = supabase
      .from('team_invites')
      .select(`
        *,
        team:teams(
          id,
          name,
          sport_category:sports_categories(*)
        ),
        inviter:users!team_invites_inviter_id_fkey(
          id,
          display_name,
          avatar_url
        ),
        invitee:users!team_invites_invitee_id_fkey(
          id,
          display_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    // Filter based on type
    if (type === 'sent') {
      query = query.eq('inviter_id', user.id);
    } else if (type === 'received') {
      query = query.eq('invitee_id', user.id);
    } else if (type === 'team_requests') {
      // Get requests for teams where user is captain/creator
      const { data: userTeams } = await supabase
        .from('teams')
        .select('id')
        .eq('created_by', user.id);

      if (userTeams && userTeams.length > 0) {
        const teamIds = userTeams.map(t => t.id);
        query = query.in('team_id', teamIds).eq('type', 'join_request');
      } else {
        // User has no teams, return empty result
        return NextResponse.json({ data: [] });
      }
    }

    // Apply additional filters
    if (team_id) {
      query = query.eq('team_id', team_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: invites, error } = await query;

    if (error) {
      console.error('Error fetching team invites:', error);
      return NextResponse.json({ error: 'Failed to fetch team invites' }, { status: 500 });
    }

    return NextResponse.json({ data: invites });
  } catch (error) {
    console.error('Error fetching team invites:', error);
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
    const { team_id, team_code, type = 'join_request', message } = body;

    const { createServiceClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceClient() as any;

    let teamId = team_id;

    // If team_code is provided, find the team
    if (team_code && !teamId) {
      const { data: team } = await supabase
        .from('teams')
        .select('id, created_by, max_members, current_members')
        .eq('join_code', team_code.toUpperCase())
        .eq('status', 'active')
        .single();

      if (!team) {
        return NextResponse.json({ error: 'Invalid team code' }, { status: 404 });
      }

      teamId = team.id;

      // Check if team is full
      if (team.max_members && team.current_members >= team.max_members) {
        return NextResponse.json({ error: 'Team is full' }, { status: 400 });
      }

      // Check if user is already a member
      const { data: membership } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (membership) {
        return NextResponse.json({ error: 'You are already a member of this team' }, { status: 400 });
      }

      // Check if user already has a pending request
      const { data: existingRequest } = await supabase
        .from('team_invites')
        .select('id')
        .eq('team_id', teamId)
        .eq('invitee_id', user.id)
        .eq('type', 'join_request')
        .eq('status', 'pending')
        .single();

      if (existingRequest) {
        return NextResponse.json({ error: 'You already have a pending request for this team' }, { status: 400 });
      }
    }

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID or team code is required' }, { status: 400 });
    }

    // Get team details
    const { data: team } = await supabase
      .from('teams')
      .select('created_by, name')
      .eq('id', teamId)
      .single();

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const inviteData = {
      team_id: teamId,
      inviter_id: user.id,
      invitee_id: user.id, // For join requests, user is both inviter and invitee
      type,
      message: message || `${user.display_name} wants to join your team`,
      status: 'pending',
      role: 'member',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };

    const { data: invite, error } = await supabase
      .from('team_invites')
      .insert(inviteData)
      .select(`
        *,
        team:teams(
          id,
          name,
          sport_category:sports_categories(*)
        ),
        inviter:users!team_invites_inviter_id_fkey(
          id,
          display_name,
          avatar_url
        ),
        invitee:users!team_invites_invitee_id_fkey(
          id,
          display_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error creating team invite:', error);
      return NextResponse.json({ error: 'Failed to create team invite' }, { status: 500 });
    }

    // Create notification for team captain
    await supabase
      .from('notifications')
      .insert({
        user_id: team.created_by,
        type: 'team_join_request',
        title: 'New Team Join Request',
        message: `${user.display_name} wants to join ${team.name}`,
        data: {
          team_id: teamId,
          invite_id: invite.id,
          requester_id: user.id
        },
        priority: 'medium',
        action_url: `/teams/${teamId}/requests`,
        related_entity_type: 'team_invite',
        related_entity_id: invite.id,
        is_read: false
      });

    return NextResponse.json({ data: invite }, { status: 201 });
  } catch (error) {
    console.error('Error creating team invite:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
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
    const { invite_id, status: newStatus, response_message } = body;

    if (!['accepted', 'declined'].includes(newStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const { createServiceClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceClient() as any;

    // Get the invite
    const { data: invite, error: fetchError } = await supabase
      .from('team_invites')
      .select(`
        *,
        team:teams(id, name, created_by, max_members, current_members)
      `)
      .eq('id', invite_id)
      .single();

    if (fetchError || !invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    // Check if user can respond to this invite
    // For join requests: team captain can approve/decline
    // For invitations: invitee can accept/decline
    const canRespond =
      (invite.type === 'join_request' && invite.team.created_by === user.id) ||
      (invite.type === 'invitation' && invite.invitee_id === user.id);

    if (!canRespond) {
      return NextResponse.json({ error: 'Not authorized to respond to this invite' }, { status: 403 });
    }

    // Check if invite is still valid
    if (invite.status !== 'pending') {
      return NextResponse.json({ error: 'Invite is no longer pending' }, { status: 400 });
    }

    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Invite has expired' }, { status: 400 });
    }

    // If accepting, check team capacity
    if (newStatus === 'accepted') {
      if (invite.team.max_members && invite.team.current_members >= invite.team.max_members) {
        return NextResponse.json({ error: 'Team is now full' }, { status: 400 });
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', invite.team_id)
        .eq('user_id', invite.invitee_id)
        .eq('status', 'active')
        .single();

      if (existingMember) {
        return NextResponse.json({ error: 'User is already a team member' }, { status: 400 });
      }

      // Add user to team
      await supabase
        .from('team_members')
        .insert({
          team_id: invite.team_id,
          user_id: invite.invitee_id,
          role: invite.role || 'member',
          status: 'active',
          joined_at: new Date().toISOString()
        });

      // Update team member count
      await supabase
        .from('teams')
        .update({
          current_members: invite.team.current_members + 1
        })
        .eq('id', invite.team_id);
    }

    // Update invite status (for responses that should remain in history) or delete (for simple join requests)
    let updatedInvite;
    let updateError;

    if (invite.type === 'join_request') {
      // For join requests, delete the record after processing to keep management clean
      const { error: deleteError } = await supabase
        .from('team_invites')
        .delete()
        .eq('id', invite_id);

      if (deleteError) {
        console.error('Error deleting team invite:', deleteError);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
      }

      // Return a formatted response for deleted invite
      updatedInvite = {
        id: invite.id,
        status: newStatus,
        responded_at: new Date().toISOString(),
        response_message,
        team: invite.team,
        inviter: invite.inviter,
        invitee: invite.invitee
      };
    } else {
      // For formal invitations, update status to maintain history
      const { data, error } = await supabase
        .from('team_invites')
        .update({
          status: newStatus,
          responded_at: new Date().toISOString(),
          response_message
        })
        .eq('id', invite_id)
        .select(`
          *,
          team:teams(
            id,
            name,
            sport_category:sports_categories(*)
          ),
          inviter:users!team_invites_inviter_id_fkey(
            id,
            display_name,
            avatar_url
          ),
          invitee:users!team_invites_invitee_id_fkey(
            id,
            display_name,
            avatar_url
          )
        `)
        .single();

      updatedInvite = data;
      updateError = error;
    }

    if (updateError) {
      console.error('Error updating team invite:', updateError);
      return NextResponse.json({ error: 'Failed to update invite' }, { status: 500 });
    }

    // Create notification for the requester
    const notificationUserId = invite.type === 'join_request' ? invite.invitee_id : invite.inviter_id;
    await supabase
      .from('notifications')
      .insert({
        user_id: notificationUserId,
        type: `team_request_${newStatus}`,
        title: `Team Request ${newStatus === 'accepted' ? 'Accepted' : 'Declined'}`,
        message: newStatus === 'accepted'
          ? `Your request to join ${invite.team.name} has been accepted!`
          : `Your request to join ${invite.team.name} has been declined.`,
        data: {
          team_id: invite.team_id,
          invite_id: invite.id
        },
        priority: 'medium',
        action_url: newStatus === 'accepted' ? `/teams/${invite.team_id}` : '/teams',
        related_entity_type: 'team_invite',
        related_entity_id: invite.id,
        is_read: false
      });

    return NextResponse.json({ data: updatedInvite });
  } catch (error) {
    console.error('Error updating team invite:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}