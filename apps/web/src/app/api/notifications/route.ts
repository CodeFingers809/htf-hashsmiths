// Notifications API routes
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
    const limit = parseInt(searchParams.get('limit') || '20');
    const unread_only = searchParams.get('unread_only') === 'true';
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');

    const supabase = await createClient();

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Apply filters
    if (unread_only) {
      query = query.eq('is_read', false);
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    // Filter out expired notifications
    const now = new Date().toISOString();
    query = query.or(`expires_at.is.null,expires_at.gt.${now}`);

    // Get total count for pagination
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .or(`expires_at.is.null,expires_at.gt.${now}`);

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: notifications, error } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      data: notifications,
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
    console.error('Error fetching notifications:', error);
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

    // For creating notifications, we'll typically want admin/system level access
    // But allow users to create notifications for testing purposes
    const notificationData = {
      user_id: body.target_user_id || user.id, // Allow targeting other users if admin
      type: body.type,
      title: body.title,
      message: body.message,
      data: body.data || {},
      priority: body.priority || 'medium',
      action_url: body.action_url,
      action_type: body.action_type,
      expires_at: body.expires_at,
      related_entity_type: body.related_entity_type,
      related_entity_id: body.related_entity_id,
      is_read: false,
    };

    const supabase = await createClient();

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
    }

    return NextResponse.json({ data: notification }, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
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
    const { notification_id, notification_ids, mark_all_read, ...updateData } = body;

    const supabase = await createClient();

    if (mark_all_read) {
      // Mark all notifications as read for the user
      const { data: notifications, error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('is_read', false)
        .select();

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 });
      }

      return NextResponse.json({
        data: notifications,
        message: `Marked ${notifications?.length || 0} notifications as read`
      });
    }

    if (notification_ids && Array.isArray(notification_ids)) {
      // Mark multiple notifications as read
      const { data: notifications, error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .in('id', notification_ids)
        .select();

      if (error) {
        console.error('Error marking notifications as read:', error);
        return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 });
      }

      return NextResponse.json({ data: notifications });
    }

    if (notification_id) {
      // Update single notification
      if (updateData.is_read && !updateData.read_at) {
        updateData.read_at = new Date().toISOString();
      }

      const { data: notification, error } = await supabase
        .from('notifications')
        .update(updateData)
        .eq('id', notification_id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating notification:', error);
        return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
      }

      return NextResponse.json({ data: notification });
    }

    return NextResponse.json({ error: 'notification_id, notification_ids, or mark_all_read is required' }, { status: 400 });
  } catch (error) {
    console.error('Error updating notification:', error);
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
    const notification_id = searchParams.get('notification_id');
    const delete_all_read = searchParams.get('delete_all_read') === 'true';

    const supabase = await createClient();

    if (delete_all_read) {
      // Delete all read notifications for the user
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)
        .eq('is_read', true);

      if (error) {
        console.error('Error deleting read notifications:', error);
        return NextResponse.json({ error: 'Failed to delete notifications' }, { status: 500 });
      }

      return NextResponse.json({ message: 'All read notifications deleted successfully' });
    }

    if (notification_id) {
      // Delete single notification
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notification_id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting notification:', error);
        return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
      }

      return NextResponse.json({ message: 'Notification deleted successfully' });
    }

    return NextResponse.json({ error: 'notification_id or delete_all_read is required' }, { status: 400 });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}