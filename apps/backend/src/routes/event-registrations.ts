import { Router, Response } from 'express';
import { AuthRequest, requireAuth } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { getUserByClerkId } from '../lib/clerk.js';

const router = Router();

// POST /api/event-registrations - Register for event
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
    const {
      event_id,
      registration_type,
      team_id,
      emergency_contact,
      dietary_requirements,
      medical_conditions,
      additional_notes
    } = body;

    if (!event_id) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    // Check if event exists and is open for registration
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', event_id)
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
    if (event.max_participants && event.current_participants >= event.max_participants) {
      return res.status(400).json({ error: 'Event is full' });
    }

    // Check if user is already registered
    const { data: existingRegistration } = await supabaseAdmin
      .from('event_registrations')
      .select('id')
      .eq('event_id', event_id)
      .eq('user_id', user.id)
      .eq('status', 'confirmed')
      .single();

    if (existingRegistration) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }

    // Check age eligibility
    if (user.date_of_birth && (event.min_age || event.max_age)) {
      const age = new Date().getFullYear() - new Date(user.date_of_birth).getFullYear();
      if ((event.min_age && age < event.min_age) || (event.max_age && age > event.max_age)) {
        return res.status(400).json({
          error: `Age requirement not met. Event is for ages ${event.min_age}-${event.max_age}`
        });
      }
    }

    // Check gender eligibility
    if (event.gender_restriction && event.gender_restriction !== 'any' && user.gender !== event.gender_restriction) {
      return res.status(400).json({
        error: `This event is restricted to ${event.gender_restriction} participants`
      });
    }

    // Create registration
    const registrationData = {
      event_id,
      user_id: user.id,
      team_id: team_id || null,
      registration_type: registration_type || 'individual',
      status: 'confirmed',
      payment_status: 'pending',
      payment_amount: (event.registration_fee || 0) + (event.processing_fee || 0),
      additional_info: {
        additional_notes: additional_notes || null
      },
      emergency_contact: emergency_contact || null,
      medical_info: medical_conditions || null,
      dietary_requirements: dietary_requirements || null
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
      .eq('id', event_id);

    return res.status(201).json({
      data: registration,
      message: 'Successfully registered for event'
    });

  } catch (error) {
    console.error('Error in event registration:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/event-registrations - Get user's registrations
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { data: registrations, error } = await supabaseAdmin
      .from('event_registrations')
      .select(`
        *,
        event:events(*),
        user:users(id, display_name, avatar_url)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user registrations:', error);
      return res.status(500).json({ error: 'Failed to fetch registrations' });
    }

    return res.json({ data: registrations });

  } catch (error) {
    console.error('Error in get registrations:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
