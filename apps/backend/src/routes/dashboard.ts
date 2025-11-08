import { Router, Response } from 'express';
import { AuthRequest, requireAuth } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { getUserByClerkId } from '../lib/clerk.js';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let user = await getUserByClerkId(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch recent events (limit 5)
    let recentEvents: any[] = [];
    try {
      const { data, error: eventsError } = await supabaseAdmin
        .from('events')
        .select('*')
        .eq('status', 'registration_open')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!eventsError) {
        recentEvents = data || [];
      }
    } catch (error) {
      console.error('Events table may not exist or be accessible:', error);
    }

    // Fetch user teams
    let userTeams = [];
    try {
      const { data, error: teamsError } = await supabaseAdmin
        .from('team_members')
        .select(`
          team_id,
          teams (
            id,
            name,
            sport,
            description,
            max_members,
            current_members,
            is_public,
            status,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (!teamsError) {
        userTeams = data || [];
      }
    } catch (error) {
      console.error('Teams tables may not exist or be accessible:', error);
    }

    // Fetch personal records (limit 5)
    let personalRecords: any[] = [];
    try {
      const { data, error: prError } = await supabaseAdmin
        .from('personal_records')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!prError) {
        personalRecords = data || [];
      }
    } catch (error) {
      console.error('Personal records table may not exist or be accessible:', error);
    }

    // Calculate stats
    const totalEvents = recentEvents?.length || 0;
    const totalTeams = userTeams?.length || 0;
    const totalPRs = personalRecords?.length || 0;

    // Calculate profile completion percentage
    let completionFields = 0;
    const totalFields = 10;

    if (user.first_name) completionFields++;
    if (user.last_name) completionFields++;
    if (user.email) completionFields++;
    if (user.phone) completionFields++;
    if (user.date_of_birth) completionFields++;
    if (user.gender) completionFields++;
    if (user.state) completionFields++;
    if (user.city) completionFields++;
    if (user.address) completionFields++;
    if (user.pincode) completionFields++;

    const profileCompletion = Math.round((completionFields / totalFields) * 100);

    const dashboardData = {
      user,
      recentEvents,
      userTeams: userTeams?.map((tm: any) => tm.teams).filter(Boolean) || [],
      personalRecords,
      stats: {
        totalEvents,
        totalTeams,
        totalPRs,
        profileCompletion
      }
    };

    return res.json({ data: dashboardData });

  } catch (error) {
    console.error('Error in dashboard API:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
