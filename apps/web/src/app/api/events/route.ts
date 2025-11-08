// Events API routes
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/clerk-react/server';
import { createClient } from '@/lib/supabase/server';
import { getUserByClerkId } from '@/lib/auth/clerk-supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const level = searchParams.get('level');
    const sport = searchParams.get('sport');
    const status = searchParams.get('status') || 'registration_open';
    const featured = searchParams.get('featured');

    // Use service client for public events to bypass RLS
    const { createServiceClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceClient() as any;

    let query = supabase
      .from('events')
      .select(`
        *,
        sport_category:sports_categories(*)
      `)
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

    // Get total count for pagination (use same service client)
    const { count } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('is_public', true)
      .match(
        Object.fromEntries([
          level && ['level', level],
          status && ['status', status],
          featured === 'true' && ['is_featured', true],
        ].filter(Boolean))
      );

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: events, error } = await query;

    if (error) {
      console.error('Error fetching events:', error);
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
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
    console.error('Error fetching events:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : error,
      hint: 'Check Supabase connection and table existence',
      code: ''
    });
    return NextResponse.json({
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
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

    // Check if user is admin or official
    if (!['admin', 'official'].includes(user.account_type)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();

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

    const supabase = await createClient();

    const { data: event, error } = await supabase
      .from('events')
      .insert(eventData)
      .select(`
        *,
        sport_category:sports_categories(*)
      `)
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }

    return NextResponse.json({ data: event }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : error,
      hint: 'Check Supabase connection and authentication',
      code: ''
    });
    return NextResponse.json({
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}