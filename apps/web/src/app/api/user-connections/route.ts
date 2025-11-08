// User Connections API routes
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
    const connection_type = searchParams.get('connection_type');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const supabase = await createClient();

    let query = supabase
      .from('user_connections')
      .select(`
        *,
        connected_user:users!user_connections_connected_user_id_fkey(
          id,
          display_name,
          first_name,
          last_name,
          avatar_url,
          city,
          state,
          account_type
        ),
        initiator:users!user_connections_initiated_by_fkey(
          id,
          display_name,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    // Apply filters
    if (connection_type) {
      query = query.eq('connection_type', connection_type);
    }

    if (status) {
      query = query.eq('status', status);
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('user_connections')
      .select('*', { count: 'exact', head: true })
      .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`);

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: connections, error } = await query;

    if (error) {
      console.error('Error fetching user connections:', error);
      return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 });
    }

    // Process connections to show the other user's data
    const processedConnections = connections?.map(connection => {
      const otherUser = connection.user_id === user.id ? connection.connected_user :
                      connection.connected_user_id === user.id ? connection.connected_user : null;

      return {
        ...connection,
        other_user: otherUser,
        is_initiator: connection.initiated_by === user.id
      };
    });

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      data: processedConnections,
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
    console.error('Error fetching user connections:', error);
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
    const { connected_user_id, connection_type, message } = body;

    if (!connected_user_id) {
      return NextResponse.json({ error: 'Connected user ID is required' }, { status: 400 });
    }

    if (connected_user_id === user.id) {
      return NextResponse.json({ error: 'Cannot connect to yourself' }, { status: 400 });
    }

    const supabase = await createClient();

    // Check if connection already exists
    const { data: existingConnection } = await supabase
      .from('user_connections')
      .select('id, status')
      .or(`and(user_id.eq.${user.id},connected_user_id.eq.${connected_user_id}),and(user_id.eq.${connected_user_id},connected_user_id.eq.${user.id})`)
      .single();

    if (existingConnection) {
      return NextResponse.json({
        error: existingConnection.status === 'pending' ? 'Connection request already sent' : 'Users already connected'
      }, { status: 400 });
    }

    const connectionData = {
      user_id: user.id,
      connected_user_id,
      connection_type: connection_type || 'follow',
      status: 'pending',
      initiated_by: user.id,
      message,
      interaction_count: 0,
      connection_strength: 0.1,
    };

    const { data: connection, error } = await supabase
      .from('user_connections')
      .insert(connectionData)
      .select(`
        *,
        connected_user:users!user_connections_connected_user_id_fkey(
          id,
          display_name,
          first_name,
          last_name,
          avatar_url,
          city,
          state,
          account_type
        )
      `)
      .single();

    if (error) {
      console.error('Error creating connection:', error);
      return NextResponse.json({ error: 'Failed to create connection' }, { status: 500 });
    }

    return NextResponse.json({ data: connection }, { status: 201 });
  } catch (error) {
    console.error('Error creating connection:', error);
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
    const { connection_id, status } = body;

    if (!connection_id || !status) {
      return NextResponse.json({ error: 'Connection ID and status are required' }, { status: 400 });
    }

    if (!['accepted', 'declined', 'blocked'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify connection exists and user is the receiver
    const { data: existingConnection } = await supabase
      .from('user_connections')
      .select('*')
      .eq('id', connection_id)
      .eq('connected_user_id', user.id)
      .eq('status', 'pending')
      .single();

    if (!existingConnection) {
      return NextResponse.json({ error: 'Connection not found or cannot be modified' }, { status: 404 });
    }

    const updateData: any = { status };

    if (status === 'accepted') {
      updateData.connected_at = new Date().toISOString();
    }

    const { data: connection, error } = await supabase
      .from('user_connections')
      .update(updateData)
      .eq('id', connection_id)
      .select(`
        *,
        connected_user:users!user_connections_connected_user_id_fkey(
          id,
          display_name,
          first_name,
          last_name,
          avatar_url,
          city,
          state,
          account_type
        ),
        initiator:users!user_connections_initiated_by_fkey(
          id,
          display_name,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error updating connection:', error);
      return NextResponse.json({ error: 'Failed to update connection' }, { status: 500 });
    }

    return NextResponse.json({ data: connection });
  } catch (error) {
    console.error('Error updating connection:', error);
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
    const connection_id = searchParams.get('connection_id');

    if (!connection_id) {
      return NextResponse.json({ error: 'Connection ID required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify connection exists and user is part of it
    const { data: existingConnection } = await supabase
      .from('user_connections')
      .select('*')
      .eq('id', connection_id)
      .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`)
      .single();

    if (!existingConnection) {
      return NextResponse.json({ error: 'Connection not found or access denied' }, { status: 404 });
    }

    const { error } = await supabase
      .from('user_connections')
      .delete()
      .eq('id', connection_id);

    if (error) {
      console.error('Error deleting connection:', error);
      return NextResponse.json({ error: 'Failed to delete connection' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Connection deleted successfully' });
  } catch (error) {
    console.error('Error deleting connection:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}