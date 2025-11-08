import { Router, Response } from 'express';
import { AuthRequest, requireAuth, optionalAuth } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { getUserByClerkId } from '../lib/clerk.js';

const router = Router();

// GET /api/events - List all events
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '12');
    const level = req.query.level as string;
    const sport = req.query.sport as string;
    const status = (req.query.status as string) || 'registration_open';
    const featured = req.query.featured as string;

    let query = supabaseAdmin
      .from('events')
      .select(`
        *,
        sport_category:sports_categories(*)
      `, { count: 'exact' })
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    // Apply filters
    if (level) {
      query = query.eq('level', level);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    if (sport) {
      query = query.eq('sport_category.sport_name', sport);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: events, error, count } = await query;

    if (error) {
      console.error('Error fetching events:', error);
      return res.status(500).json({ error: 'Failed to fetch events' });
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return res.json({
      data: events,
      pagination: {
        page,
        limit,
        count: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/events - Create new event
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

    // Check if user is admin or official
    if (!['admin', 'official'].includes(user.account_type)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const body = req.body;

    // Generate slug from title
    const slug = body.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const eventData = {
      ...body,
      slug,
      created_by: user.id,
      current_participants: 0,
    };

    const { data: event, error } = await supabaseAdmin
      .from('events')
      .insert(eventData)
      .select(`
        *,
        sport_category:sports_categories(*)
      `)
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return res.status(500).json({ error: 'Failed to create event' });
    }

    return res.status(201).json({ data: event });
  } catch (error) {
    console.error('Error creating event:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/events/:id - Get single event
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    let query = supabaseAdmin
      .from('events')
      .select(`
        *,
        sport_category:sports_categories(*)
      `)
      .eq('is_public', true);

    // Check if id is a UUID or slug
    if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      query = query.eq('id', id);
    } else {
      query = query.eq('slug', id);
    }

    const { data: event, error } = await query.single();

    if (error) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.json({ data: event });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /api/events/:id - Update event
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

    const { id } = req.params;

    // Check if user owns the event or is admin
    const { data: event, error: fetchError } = await supabaseAdmin
      .from('events')
      .select('created_by')
      .eq('id', id)
      .single();

    if (fetchError || !event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.created_by !== user.id && user.account_type !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const body = req.body;

    const { data: updatedEvent, error } = await supabaseAdmin
      .from('events')
      .update(body)
      .eq('id', id)
      .select(`
        *,
        sport_category:sports_categories(*)
      `)
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update event' });
    }

    return res.json({ data: updatedEvent });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /api/events/:id - Delete event (soft delete)
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

    const { id } = req.params;

    // Check if user owns the event or is admin
    const { data: event, error: fetchError } = await supabaseAdmin
      .from('events')
      .select('created_by')
      .eq('id', id)
      .single();

    if (fetchError || !event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.created_by !== user.id && user.account_type !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Soft delete by setting status to cancelled
    const { error } = await supabaseAdmin
      .from('events')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Failed to delete event' });
    }

    return res.json({ message: 'Event cancelled successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/events/:id/register - Register for event
router.post('/:id/register', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { id: eventId } = req.params;
    const body = req.body;

    // Check if event exists and is open for registration
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', eventId)
      .eq('status', 'registration_open')
      .single();

    if (eventError || !event) {
      return res.status(404).json({ error: 'Event not found or registration closed' });
    }

    // Check if registration deadline has passed
    if (new Date() > new Date(event.registration_end_date)) {
      return res.status(400).json({ error: 'Registration deadline has passed' });
    }

    // Check if event is full
    if (event.current_participants >= event.max_participants) {
      return res.status(400).json({ error: 'Event is full' });
    }

    // Check if user is already registered
    const { data: existingRegistration } = await supabaseAdmin
      .from('event_registrations')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .eq('status', 'confirmed')
      .single();

    if (existingRegistration) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }

    // Check age eligibility
    if (user.date_of_birth) {
      const age = new Date().getFullYear() - new Date(user.date_of_birth).getFullYear();
      if ((event.min_age && age < event.min_age) || (event.max_age && age > event.max_age)) {
        return res.status(400).json({
          error: `Age requirement not met. Event is for ages ${event.min_age}-${event.max_age}`
        });
      }
    }

    // Create registration
    const registrationData = {
      event_id: eventId,
      user_id: user.id,
      team_id: body.team_id || null,
      registration_type: body.registration_type || 'individual',
      status: 'confirmed',
      payment_status: 'pending',
      payment_amount: (event.registration_fee || 0) + (event.processing_fee || 0),
      additional_info: body.additional_info || {},
      emergency_contact: body.emergency_contact || null,
      medical_info: body.medical_info || null,
      dietary_requirements: body.dietary_requirements || null
    };

    const { data: registration, error: regError } = await supabaseAdmin
      .from('event_registrations')
      .insert(registrationData)
      .select(`
        *,
        event:events(*),
        user:users(id, display_name, avatar_url)
      `)
      .single();

    if (regError) {
      console.error('Error creating event registration:', regError);
      return res.status(500).json({ error: 'Failed to register for event' });
    }

    // Update event participant count
    await supabaseAdmin
      .from('events')
      .update({ current_participants: event.current_participants + 1 })
      .eq('id', eventId);

    return res.status(201).json({
      data: registration,
      message: 'Successfully registered for event'
    });

  } catch (error) {
    console.error('Error in event registration:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
