// User connections API - Friend requests, connections, blocking
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/clerk-react/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getUserByClerkId } from '@/lib/auth/clerk-supabase';

// GET - Fetch user connections
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
    const type = searchParams.get('type') || 'all'; // all, friends, pending, blocked
    const supabase = await createClient();

    let query = supabase
      .from('user_connections')
      .select(`
        *,
        connected_user:connected_user_id(id, display_name, avatar_url, account_type, city, state),
        initiator:initiated_by(id, display_name)
      `)
      .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`);

    // Filter by type
    if (type === 'friends') {
      query = query.eq('status', 'accepted').eq('is_blocked', false);
    } else if (type === 'pending') {
      query = query.eq('status', 'pending').eq('connected_user_id', user.id);
    } else if (type === 'blocked') {
      query = query.eq('is_blocked', true).eq('blocked_by', user.id);
    } else {
      query = query.eq('is_blocked', false);
    }

    const { data: connections, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching connections:', error);
      return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 });
    }

    return NextResponse.json({ connections });
  } catch (error) {
    console.error('Error in connections GET:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Send friend request or connection
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
    const { connected_user_id, message, connection_type = 'friend' } = body;

    if (!connected_user_id) {
      return NextResponse.json({ error: 'Connected user ID is required' }, { status: 400 });
    }

    if (connected_user_id === user.id) {
      return NextResponse.json({ error: 'Cannot connect with yourself' }, { status: 400 });
    }

    const supabase = await createClient();

    // Check if connection already exists
    const { data: existing } = await supabase
      .from('user_connections')
      .select('*')
      .or(`and(user_id.eq.${user.id},connected_user_id.eq.${connected_user_id}),and(user_id.eq.${connected_user_id},connected_user_id.eq.${user.id})`)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Connection already exists' }, { status: 400 });
    }

    // Create connection request
    const serviceClient = await createServiceClient();
    const { data: connection, error } = await serviceClient
      .from('user_connections')
      .insert({
        user_id: user.id,
        connected_user_id,
        connection_type,
        status: 'pending',
        initiated_by: user.id,
        message: message || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating connection:', error);
      return NextResponse.json({ error: 'Failed to send connection request' }, { status: 500 });
    }

    // Create notification
    await serviceClient.from('notifications').insert({
      user_id: connected_user_id,
      type: 'connection_request',
      title: 'New Connection Request',
      message: `${user.display_name || 'Someone'} wants to connect with you`,
      data: { connection_id: connection.id, user_id: user.id },
      action_url: '/connections',
      related_entity_type: 'user_connection',
      related_entity_id: connection.id
    });

    return NextResponse.json({ connection, message: 'Connection request sent successfully' });
  } catch (error) {
    console.error('Error in connections POST:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
