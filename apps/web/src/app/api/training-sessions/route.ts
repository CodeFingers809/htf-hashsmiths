// Training Sessions API routes
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/clerk-react/server';
import { createClient } from '@/lib/supabase/server';
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const session_type = searchParams.get('session_type');
    const sport_category_id = searchParams.get('sport_category_id');
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');
    const team_id = searchParams.get('team_id');
    const coach_id = searchParams.get('coach_id');

    const supabase = await createClient();

    let query = supabase
      .from('training_sessions')
      .select(`
        *,
        sport_category:sports_categories(*),
        coach:users!training_sessions_coach_id_fkey(id, display_name, avatar_url),
        team:teams(id, name),
        exercises:training_exercises(*)
      `)
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('start_time', { ascending: false });

    // Apply filters
    if (session_type) {
      query = query.eq('session_type', session_type);
    }

    if (sport_category_id) {
      query = query.eq('sport_category_id', sport_category_id);
    }

    if (team_id) {
      query = query.eq('team_id', team_id);
    }

    if (coach_id) {
      query = query.eq('coach_id', coach_id);
    }

    if (date_from) {
      query = query.gte('date', date_from);
    }

    if (date_to) {
      query = query.lte('date', date_to);
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('training_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: sessions, error } = await query;

    if (error) {
      console.error('Error fetching training sessions:', error);
      return NextResponse.json({ error: 'Failed to fetch training sessions' }, { status: 500 });
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      data: sessions,
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
    console.error('Error fetching training sessions:', error);
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

    const sessionData = {
      ...body,
      user_id: user.id,
      is_public: body.is_public ?? false,
    };

    const supabase = await createClient();

    const { data: session, error } = await supabase
      .from('training_sessions')
      .insert(sessionData)
      .select(`
        *,
        sport_category:sports_categories(*),
        coach:users!training_sessions_coach_id_fkey(id, display_name, avatar_url),
        team:teams(id, name)
      `)
      .single();

    if (error) {
      console.error('Error creating training session:', error);
      return NextResponse.json({ error: 'Failed to create training session' }, { status: 500 });
    }

    return NextResponse.json({ data: session }, { status: 201 });
  } catch (error) {
    console.error('Error creating training session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
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
    const { session_id, ...updateData } = body;

    const supabase = await createClient();

    // Verify session ownership
    const { data: existingSession } = await supabase
      .from('training_sessions')
      .select('user_id')
      .eq('id', session_id)
      .single();

    if (!existingSession || existingSession.user_id !== user.id) {
      return NextResponse.json({ error: 'Session not found or access denied' }, { status: 404 });
    }

    const { data: session, error } = await supabase
      .from('training_sessions')
      .update(updateData)
      .eq('id', session_id)
      .select(`
        *,
        sport_category:sports_categories(*),
        coach:users!training_sessions_coach_id_fkey(id, display_name, avatar_url),
        team:teams(id, name),
        exercises:training_exercises(*)
      `)
      .single();

    if (error) {
      console.error('Error updating training session:', error);
      return NextResponse.json({ error: 'Failed to update training session' }, { status: 500 });
    }

    return NextResponse.json({ data: session });
  } catch (error) {
    console.error('Error updating training session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
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
    const session_id = searchParams.get('session_id');

    if (!session_id) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify session ownership
    const { data: existingSession } = await supabase
      .from('training_sessions')
      .select('user_id')
      .eq('id', session_id)
      .single();

    if (!existingSession || existingSession.user_id !== user.id) {
      return NextResponse.json({ error: 'Session not found or access denied' }, { status: 404 });
    }

    // Delete associated exercises first
    await supabase
      .from('training_exercises')
      .delete()
      .eq('session_id', session_id);

    // Delete the session
    const { error } = await supabase
      .from('training_sessions')
      .delete()
      .eq('id', session_id);

    if (error) {
      console.error('Error deleting training session:', error);
      return NextResponse.json({ error: 'Failed to delete training session' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Training session deleted successfully' });
  } catch (error) {
    console.error('Error deleting training session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}