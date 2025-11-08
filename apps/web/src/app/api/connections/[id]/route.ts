// Individual connection management - accept, decline, block, remove
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/clerk-react/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getUserByClerkId } from '@/lib/auth/clerk-supabase';

// PATCH - Accept/decline connection request or block user
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const resolvedParams = await params;
    const connectionId = resolvedParams.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { action, response_message } = body; // actions: accept, decline, block

    if (!action || !['accept', 'decline', 'block'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get connection
    const { data: connection, error: fetchError } = await supabase
      .from('user_connections')
      .select('*')
      .eq('id', connectionId)
      .single();

    if (fetchError || !connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    // Verify user is part of this connection
    if (connection.user_id !== user.id && connection.connected_user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (action === 'accept') {
      // Only the recipient can accept
      if (connection.connected_user_id !== user.id) {
        return NextResponse.json({ error: 'Only the recipient can accept requests' }, { status: 403 });
      }

      const { error: updateError } = await supabase
        .from('user_connections')
        .update({
          status: 'accepted',
          connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', connectionId);

      if (updateError) {
        console.error('Error accepting connection:', updateError);
        return NextResponse.json({ error: 'Failed to accept connection' }, { status: 500 });
      }

      // Notify the requester
      const serviceClient = await createServiceClient();
      await serviceClient.from('notifications').insert({
        user_id: connection.user_id,
        type: 'connection_accepted',
        title: 'Connection Accepted',
        message: `${user.display_name || 'Someone'} accepted your connection request`,
        data: { connection_id: connectionId },
        action_url: `/connections`,
        related_entity_type: 'user_connection',
        related_entity_id: connectionId
      });

      return NextResponse.json({ message: 'Connection accepted successfully' });
    } else if (action === 'decline') {
      const { error: updateError } = await supabase
        .from('user_connections')
        .update({
          status: 'declined',
          updated_at: new Date().toISOString()
        })
        .eq('id', connectionId);

      if (updateError) {
        console.error('Error declining connection:', updateError);
        return NextResponse.json({ error: 'Failed to decline connection' }, { status: 500 });
      }

      return NextResponse.json({ message: 'Connection declined' });
    } else if (action === 'block') {
      const { error: updateError } = await supabase
        .from('user_connections')
        .update({
          is_blocked: true,
          blocked_by: user.id,
          blocked_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', connectionId);

      if (updateError) {
        console.error('Error blocking user:', updateError);
        return NextResponse.json({ error: 'Failed to block user' }, { status: 500 });
      }

      return NextResponse.json({ message: 'User blocked successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in connection PATCH:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Remove connection (unfriend)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const resolvedParams = await params;
    const connectionId = resolvedParams.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const supabase = await createClient();

    // Get connection to verify ownership
    const { data: connection, error: fetchError } = await supabase
      .from('user_connections')
      .select('*')
      .eq('id', connectionId)
      .single();

    if (fetchError || !connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    // Verify user is part of this connection
    if (connection.user_id !== user.id && connection.connected_user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete the connection
    const { error: deleteError } = await supabase
      .from('user_connections')
      .delete()
      .eq('id', connectionId);

    if (deleteError) {
      console.error('Error removing connection:', deleteError);
      return NextResponse.json({ error: 'Failed to remove connection' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Connection removed successfully' });
  } catch (error) {
    console.error('Error in connection DELETE:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
