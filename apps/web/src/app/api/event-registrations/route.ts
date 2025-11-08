// Event Registration API routes
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/clerk-react/server';
import { getUserByClerkId } from '@/lib/auth/clerk-supabase';
import { logger } from '@/lib/logger';
import { rateLimit, validateRequest, sanitizeInput, schemas } from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    if (!rateLimit(`registration-${userId}`, 5, 60000)) {
      return NextResponse.json({ error: 'Too many registration attempts. Please try again later.' }, { status: 429 });
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const rawBody = await req.json();

    // Validate and sanitize input
    const body = sanitizeInput(rawBody);
    const validatedData = validateRequest(body, schemas.eventRegistration);
    const { event_id, registration_type, team_id, team_members, emergency_contact, dietary_requirements, medical_conditions, experience_level, motivation, additional_notes } = validatedData;

    if (!event_id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const { createServiceClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceClient();

    // Check if event exists and is open for registration
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', event_id)
      .eq('status', 'registration_open')
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found or registration closed' }, { status: 404 });
    }

    // Check if registration deadline has passed
    if (new Date() > new Date(event.registration_end_date)) {
      return NextResponse.json({ error: 'Registration deadline has passed' }, { status: 400 });
    }

    // Check if event is full
    if (event.current_participants >= event.max_participants) {
      return NextResponse.json({ error: 'Event is full' }, { status: 400 });
    }

    // Check if user is already registered
    const { data: existingRegistration } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', event_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (existingRegistration) {
      return NextResponse.json({ error: 'Already registered for this event' }, { status: 400 });
    }

    // Check age eligibility
    if (user.date_of_birth) {
      const age = new Date().getFullYear() - new Date(user.date_of_birth).getFullYear();
      if (age < event.min_age || age > event.max_age) {
        return NextResponse.json({
          error: `Age requirement not met. Event is for ages ${event.min_age}-${event.max_age}`
        }, { status: 400 });
      }
    }

    // Check gender eligibility
    if (event.gender_restriction !== 'any' && user.gender !== event.gender_restriction) {
      return NextResponse.json({
        error: `This event is restricted to ${event.gender_restriction} participants`
      }, { status: 400 });
    }

    // Create registration using correct schema
    const registrationData = {
      event_id,
      user_id: user.id,
      team_id: team_id || null,
      registration_type: registration_type || 'individual',
      status: 'active',
      payment_status: 'pending',
      payment_amount: (event.registration_fee || 0) + (event.processing_fee || 0),
      additional_info: {
        team_members: team_members || null,
        experience_level: experience_level || null,
        motivation: motivation || null,
        additional_notes: additional_notes || null
      },
      emergency_contact: emergency_contact || null,
      medical_info: medical_conditions || null,
      dietary_requirements: dietary_requirements || null
    };

    const { data: registration, error: regError } = await supabase
      .from('event_registrations')
      .insert(registrationData)
      .select(`
        *,
        event:events(*),
        user:users(id, display_name, avatar_url)
      `)
      .single();

    if (regError) {
      logger.error('Error creating event registration:', regError);
      return NextResponse.json({ error: 'Failed to register for event' }, { status: 500 });
    }

    // Update event participant count
    await supabase
      .from('events')
      .update({ current_participants: event.current_participants + 1 })
      .eq('id', event_id);

    return NextResponse.json({
      data: registration,
      message: 'Successfully registered for event'
    }, { status: 201 });

  } catch (error) {
    logger.error('Error in event registration:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

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

    const { createServiceClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceClient();

    const { data: registrations, error } = await supabase
      .from('event_registrations')
      .select(`
        *,
        event:events(*),
        user:users(id, display_name, avatar_url)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching user registrations:', error);
      return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
    }

    return NextResponse.json({ data: registrations });

  } catch (error) {
    logger.error('Error in get registrations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}