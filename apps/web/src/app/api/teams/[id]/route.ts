// Individual Team API routes
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/clerk-react/server';
import { createClient } from '@/lib/supabase/server';
import { getUserByClerkId } from '@/lib/auth/clerk-supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const resolvedParams = await params;
    const teamId = resolvedParams.id;

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: team, error } = await supabase
      .from('teams')
      .select(`
        *,
        sport_category:sports_categories(*),
        members:team_members(
          id,
          role,
          status,
          user_id,
          joined_at,
          user:users(
            id,
            display_name,
            avatar_url,
            email
          )
        ),
        created_by_user:users!teams_created_by_fkey(
          id,
          display_name,
          avatar_url,
          email
        )
      `)
      .eq('id', teamId)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('Error fetching team:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Team not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 });
    }

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Check if user has access to this team
    let hasAccess = (team as any).is_public;

    if (userId) {
      const user = await getUserByClerkId(userId);
      if (user) {
        // User has access if they are the creator or a member
        hasAccess = hasAccess ||
          (team as any).created_by === user.id ||
          (team as any).members?.some((member: any) => member.user_id === user.id);
      }
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Use service client to get team members (bypasses RLS)
    const { createServiceClient } = await import('@/lib/supabase/server');
    const serviceSupabase = await createServiceClient();

    const { data: serviceMembers } = await (serviceSupabase as any)
      .from('team_members')
      .select(`
        id,
        role,
        status,
        user_id,
        joined_at,
        user:users(
          id,
          display_name,
          avatar_url,
          email
        )
      `)
      .eq('team_id', teamId);

    // If members found with service client, use that data
    if (serviceMembers && serviceMembers.length > 0) {
      const activeServiceMembers = serviceMembers.filter((member: any) => member.status === 'active');
      const teamWithServiceMembers = {
        ...(team as any),
        members: activeServiceMembers,
        current_members: activeServiceMembers.length
      };

      // Update the database member count if needed
      if ((team as any).current_members !== activeServiceMembers.length) {
        await (serviceSupabase as any)
          .from('teams')
          .update({ current_members: activeServiceMembers.length })
          .eq('id', teamId);
      }

      return NextResponse.json({ data: teamWithServiceMembers });
    }

    // If no members found but team has creator, add creator as captain
    if ((!serviceMembers || serviceMembers.length === 0) && (team as any).created_by) {
      const { error: memberError } = await (serviceSupabase as any)
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: (team as any).created_by,
          role: 'captain',
          status: 'active',
          joined_at: (team as any).created_at,
        });

      if (!memberError) {
        // Update team member count and refetch
        await (serviceSupabase as any)
          .from('teams')
          .update({ current_members: 1 })
          .eq('id', teamId);

        const teamWithNewMember = {
          ...(team as any),
          members: [{
            id: 'temp',
            role: 'captain',
            status: 'active',
            user_id: (team as any).created_by,
            joined_at: (team as any).created_at,
            user: { display_name: 'Team Captain' }
          }],
          current_members: 1
        };

        return NextResponse.json({ data: teamWithNewMember });
      }
    }

    // Use original team data if no service members found
    const activeMembers = (team as any).members?.filter((member: any) => member.status === 'active') || [];
    const currentMemberCount = activeMembers.length;

    // Update the database with the accurate member count if it's different
    if ((team as any).current_members !== currentMemberCount) {
      await (supabase as any)
        .from('teams')
        .update({ current_members: currentMemberCount })
        .eq('id', teamId);
    }

    const teamWithCounts = {
      ...(team as any),
      members: activeMembers,
      current_members: currentMemberCount
    };

    return NextResponse.json({ data: teamWithCounts });
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
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
    const supabase = await createClient();

    // Check if user is the team captain/creator
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('created_by')
      .eq('id', teamId)
      .single();

    if (teamError || !team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    if ((team as any).created_by !== user.id) {
      return NextResponse.json({ error: 'Only team captain can edit team details' }, { status: 403 });
    }

    // Use service client to update team (bypasses RLS)
    const { createServiceClient } = await import('@/lib/supabase/server');
    const serviceSupabase = await createServiceClient();

    // Update team using service client
    const { error: updateError } = await (serviceSupabase as any)
      .from('teams')
      .update({
        name: body.name,
        description: body.description,
        requirements: body.requirements,
        required_skills: body.required_skills,
        updated_at: new Date().toISOString()
      })
      .eq('id', teamId);

    if (updateError) {
      console.error('Error updating team:', updateError);
      return NextResponse.json({ error: 'Failed to update team' }, { status: 500 });
    }

    // Fetch updated team data with the regular client for response
    const { data: updatedTeam, error: fetchError } = await supabase
      .from('teams')
      .select(`
        *,
        sport_category:sports_categories(*)
      `)
      .eq('id', teamId)
      .single();

    if (fetchError) {
      // If regular client can't fetch, use service client
      const { data: serviceTeam } = await (serviceSupabase as any)
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
        .eq('id', teamId)
        .single();

      if (serviceTeam) {
        const activeMembers = (serviceTeam as any).members?.filter((member: any) => member.status === 'active') || [];
        const teamWithMembers = {
          ...(serviceTeam as any),
          members: activeMembers,
          current_members: activeMembers.length
        };
        return NextResponse.json({ data: teamWithMembers });
      }
    }

    // Return the updated team data
    return NextResponse.json({ data: updatedTeam });
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

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

    // Check if user is the team captain/creator
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('created_by, name')
      .eq('id', teamId)
      .single();

    if (teamError || !team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    if ((team as any).created_by !== user.id) {
      return NextResponse.json({ error: 'Only team captain can delete the team' }, { status: 403 });
    }

    // Delete team (this will cascade to team_members and team_invites due to foreign key constraints)
    const { error: deleteError } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId)
      .eq('created_by', user.id); // Additional safety check

    if (deleteError) {
      console.error('Error deleting team:', deleteError);
      return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 });
    }

    return NextResponse.json({ message: `Team "${(team as any).name}" has been deleted successfully` });
  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}