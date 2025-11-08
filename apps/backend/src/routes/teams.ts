import { Router, Response } from 'express';
import { AuthRequest, requireAuth, optionalAuth } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { getUserByClerkId } from '../lib/clerk.js';
import { TeamInsert } from '../types/database.js';

const router = Router();

// Generate a unique join code
const generateJoinCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// GET /api/teams - List all teams
router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '12');
    const sport = req.query.sport as string;
    const location = req.query.location as string;
    const experienceLevel = req.query.experience_level as string;
    const excludeUserTeams = req.query.exclude_user_teams === 'true';

    const userId = req.auth?.userId;
    let currentUserId = null;

    // Get current user if authenticated and exclusion is requested
    if (userId && excludeUserTeams) {
      const user = await getUserByClerkId(userId);
      currentUserId = user?.id;
    }

    let query = supabaseAdmin
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
      `, { count: 'exact' })
      .eq('is_public', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    // Apply filters
    if (sport) {
      query = query.eq('sport_category.sport_name', sport);
    }

    if (location) {
      query = query.or(`location_city.ilike.%${location}%,location_state.ilike.%${location}%`);
    }

    if (experienceLevel) {
      query = query.eq('experience_level', experienceLevel);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: teams, error, count } = await query;

    if (error) {
      console.error('Error fetching teams:', error);
      return res.status(500).json({ error: 'Failed to fetch teams' });
    }

    // Filter out teams where user is already a member or creator
    let filteredTeams = teams;
    if (currentUserId && excludeUserTeams) {
      // Get all team memberships for current user
      const { data: userMemberships } = await supabaseAdmin
        .from('team_members')
        .select('team_id')
        .eq('user_id', currentUserId)
        .eq('status', 'active');

      const memberTeamIds = new Set(userMemberships?.map((m: any) => m.team_id) || []);

      filteredTeams = teams?.filter((team: any) => {
        // Exclude if user is the creator
        if (team.created_by === currentUserId) return false;

        // Exclude if user is a member
        if (memberTeamIds.has(team.id)) return false;

        return true;
      }) || [];
    }

    const totalPages = Math.ceil((filteredTeams?.length || 0) / limit);

    return res.json({
      data: filteredTeams,
      pagination: {
        page,
        limit,
        count: filteredTeams?.length || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/teams - Create new team
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const body = req.body;

    const teamData: TeamInsert = {
      name: body.name,
      description: body.description,
      sport_category_id: body.sport_category_id,
      event_id: body.event_id,
      max_members: body.max_members || 4,
      is_public: body.is_public ?? true,
      required_skills: body.required_skills || [],
      requirements: body.requirements || [],
      experience_level: body.experience_level,
      location_city: body.location_city,
      location_state: body.location_state,
      practice_schedule: body.practice_schedule,
      created_by: user.id,
      join_code: generateJoinCode(),
      current_members: 1,
    };

    // Create team
    const { data: team, error: teamError } = await supabaseAdmin
      .from('teams')
      .insert(teamData)
      .select(`
        *,
        sport_category:sports_categories(*)
      `)
      .single();

    if (teamError) {
      console.error('Error creating team:', teamError);
      return res.status(500).json({ error: 'Failed to create team' });
    }

    // Add creator as team captain
    const { error: memberError } = await supabaseAdmin
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: user.id,
        role: 'captain',
        status: 'active',
        joined_at: new Date().toISOString(),
      });

    if (memberError) {
      console.error('Error adding team captain:', memberError);
      // Clean up the team if adding captain fails
      await supabaseAdmin.from('teams').delete().eq('id', team.id);
      return res.status(500).json({ error: 'Failed to create team' });
    }

    return res.status(201).json({ data: team });
  } catch (error) {
    console.error('Error creating team:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/teams/my-teams - Get user's teams
router.get('/my-teams', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get teams where user is a member
    const { data: teams, error } = await supabaseAdmin
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
      console.error('Error fetching user teams:', error);
      return res.status(500).json({ error: 'Failed to fetch teams' });
    }

    // Transform the data and get team members for each team
    const teamsWithMembers = await Promise.all(
      (teams || []).map(async (teamData: any) => {
        const team = teamData.team;
        if (!team) return null;

        // Get all members for this team
        const { data: members, error: membersError } = await supabaseAdmin
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
          console.error('Error fetching team members:', membersError);
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

    return res.json({
      data: validTeams,
      count: validTeams.length
    });

  } catch (error) {
    console.error('Error in get my teams:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/teams/:id - Get single team
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    const { id: teamId } = req.params;

    if (!teamId) {
      return res.status(400).json({ error: 'Team ID is required' });
    }

    const { data: team, error } = await supabaseAdmin
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
        return res.status(404).json({ error: 'Team not found' });
      }
      return res.status(500).json({ error: 'Failed to fetch team' });
    }

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user has access to this team
    let hasAccess = team.is_public;

    if (userId) {
      const user = await getUserByClerkId(userId);
      if (user) {
        // User has access if they are the creator or a member
        hasAccess = hasAccess ||
          team.created_by === user.id ||
          team.members?.some((member: any) => member.user_id === user.id);
      }
    }

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get accurate member count
    const { data: serviceMembers } = await supabaseAdmin
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

    // Use service members if available
    if (serviceMembers && serviceMembers.length > 0) {
      const activeServiceMembers = serviceMembers.filter((member: any) => member.status === 'active');
      const teamWithServiceMembers = {
        ...team,
        members: activeServiceMembers,
        current_members: activeServiceMembers.length
      };

      // Update the database member count if needed
      if (team.current_members !== activeServiceMembers.length) {
        await supabaseAdmin
          .from('teams')
          .update({ current_members: activeServiceMembers.length })
          .eq('id', teamId);
      }

      return res.json({ data: teamWithServiceMembers });
    }

    // Use original team data if no service members found
    const activeMembers = team.members?.filter((member: any) => member.status === 'active') || [];
    const currentMemberCount = activeMembers.length;

    const teamWithCounts = {
      ...team,
      members: activeMembers,
      current_members: currentMemberCount
    };

    return res.json({ data: teamWithCounts });
  } catch (error) {
    console.error('Error fetching team:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /api/teams/:id - Update team
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { id: teamId } = req.params;

    if (!teamId) {
      return res.status(400).json({ error: 'Team ID is required' });
    }

    // Check if user is the team captain/creator
    const { data: team, error: teamError } = await supabaseAdmin
      .from('teams')
      .select('created_by')
      .eq('id', teamId)
      .single();

    if (teamError || !team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (team.created_by !== user.id) {
      return res.status(403).json({ error: 'Only team captain can edit team details' });
    }

    const body = req.body;

    // Update team
    const { error: updateError } = await supabaseAdmin
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
      return res.status(500).json({ error: 'Failed to update team' });
    }

    // Fetch updated team data
    const { data: updatedTeam, error: fetchError } = await supabaseAdmin
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

    if (fetchError) {
      console.error('Error fetching updated team:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch updated team' });
    }

    const activeMembers = updatedTeam.members?.filter((member: any) => member.status === 'active') || [];
    const teamWithMembers = {
      ...updatedTeam,
      members: activeMembers,
      current_members: activeMembers.length
    };

    return res.json({ data: teamWithMembers });
  } catch (error) {
    console.error('Error updating team:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /api/teams/:id - Delete team
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { id: teamId } = req.params;

    if (!teamId) {
      return res.status(400).json({ error: 'Team ID is required' });
    }

    // Check if user is the team captain/creator
    const { data: team, error: teamError } = await supabaseAdmin
      .from('teams')
      .select('created_by, name')
      .eq('id', teamId)
      .single();

    if (teamError || !team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (team.created_by !== user.id) {
      return res.status(403).json({ error: 'Only team captain can delete the team' });
    }

    // Delete team (this will cascade to team_members and team_invites due to foreign key constraints)
    const { error: deleteError } = await supabaseAdmin
      .from('teams')
      .delete()
      .eq('id', teamId)
      .eq('created_by', user.id); // Additional safety check

    if (deleteError) {
      console.error('Error deleting team:', deleteError);
      return res.status(500).json({ error: 'Failed to delete team' });
    }

    return res.json({ message: `Team "${team.name}" has been deleted successfully` });
  } catch (error) {
    console.error('Error deleting team:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/teams/:id/join - Join team
router.post('/:id/join', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { id: teamId } = req.params;

    if (!teamId) {
      return res.status(400).json({ error: 'Team ID is required' });
    }

    const body = req.body;
    const { join_code } = body;

    // Get team details
    const { data: team, error: teamError } = await supabaseAdmin
      .from('teams')
      .select('id, name, join_code, max_members, current_members, is_public')
      .eq('id', teamId)
      .eq('status', 'active')
      .single();

    if (teamError || !team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Verify join code if provided
    if (join_code && team.join_code !== join_code.toUpperCase()) {
      return res.status(400).json({ error: 'Invalid join code' });
    }

    // Check if team requires join code and it wasn't provided
    if (!team.is_public && !join_code) {
      return res.status(400).json({ error: 'Join code required for this team' });
    }

    // Check if team is full
    if (team.max_members && team.current_members >= team.max_members) {
      return res.status(400).json({ error: 'Team is full' });
    }

    // Check if user is already a member
    const { data: existingMember } = await supabaseAdmin
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (existingMember) {
      return res.status(400).json({ error: 'You are already a member of this team' });
    }

    // Add user to team
    const { data: newMember, error: memberError } = await supabaseAdmin
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
      return res.status(500).json({ error: 'Failed to join team' });
    }

    // Update team member count
    const { error: updateError } = await supabaseAdmin
      .from('teams')
      .update({
        current_members: (team.current_members || 0) + 1
      })
      .eq('id', teamId);

    if (updateError) {
      console.error('Error updating team member count:', updateError);
    }

    return res.json({
      message: `Successfully joined ${team.name}!`,
      member: newMember
    });
  } catch (error) {
    console.error('Error joining team:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /api/teams/:id/leave - Leave team
router.delete('/:id/leave', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { id: teamId } = req.params;

    if (!teamId) {
      return res.status(400).json({ error: 'Team ID is required' });
    }

    // Get team and member details
    const { data: team, error: teamError } = await supabaseAdmin
      .from('teams')
      .select('id, name, created_by, current_members')
      .eq('id', teamId)
      .single();

    if (teamError || !team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user is team captain - captains cannot leave their own team
    if (team.created_by === user.id) {
      return res.status(400).json({
        error: 'Team captains cannot leave their own team. Transfer leadership or delete the team instead.'
      });
    }

    // Find user's membership
    const { data: membership, error: memberError } = await supabaseAdmin
      .from('team_members')
      .select('id, role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (memberError || !membership) {
      return res.status(404).json({ error: 'You are not a member of this team' });
    }

    // Remove user from team
    const { error: removeError } = await supabaseAdmin
      .from('team_members')
      .delete()
      .eq('id', membership.id);

    if (removeError) {
      console.error('Error leaving team:', removeError);
      return res.status(500).json({ error: 'Failed to leave team' });
    }

    // Update team member count
    const { error: updateError } = await supabaseAdmin
      .from('teams')
      .update({
        current_members: Math.max(0, (team.current_members || 1) - 1)
      })
      .eq('id', teamId);

    if (updateError) {
      console.error('Error updating team member count:', updateError);
    }

    return res.json({ message: `Successfully left ${team.name}` });
  } catch (error) {
    console.error('Error leaving team:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /api/teams/:id/members - Remove team member
router.delete('/:id/members', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { id: teamId } = req.params;

    if (!teamId) {
      return res.status(400).json({ error: 'Team ID is required' });
    }

    const body = req.body;
    const { member_id } = body;

    if (!member_id) {
      return res.status(400).json({ error: 'Member ID is required' });
    }

    // Check if user is team captain
    const { data: team, error: teamError } = await supabaseAdmin
      .from('teams')
      .select('created_by, current_members')
      .eq('id', teamId)
      .single();

    if (teamError || !team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (team.created_by !== user.id) {
      return res.status(403).json({ error: 'Only team captain can remove members' });
    }

    // Get member details before removal
    const { data: member, error: memberError } = await supabaseAdmin
      .from('team_members')
      .select('user_id, role')
      .eq('id', member_id)
      .eq('team_id', teamId)
      .single();

    if (memberError || !member) {
      console.error('Member lookup error:', memberError);
      return res.status(404).json({ error: 'Member not found' });
    }

    // Cannot remove captain/self
    if (member.role === 'captain' || member.user_id === user.id) {
      return res.status(400).json({ error: 'Cannot remove team captain' });
    }

    // Remove member
    const { error: removeError } = await supabaseAdmin
      .from('team_members')
      .delete()
      .eq('id', member_id)
      .eq('team_id', teamId);

    if (removeError) {
      console.error('Error removing team member:', removeError);
      return res.status(500).json({ error: 'Failed to remove member' });
    }

    // Update team member count
    const { error: updateError } = await supabaseAdmin
      .from('teams')
      .update({
        current_members: Math.max(0, (team.current_members || 1) - 1)
      })
      .eq('id', teamId);

    if (updateError) {
      console.error('Error updating team member count:', updateError);
    }

    return res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing team member:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
