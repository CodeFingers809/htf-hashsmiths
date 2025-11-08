import { Router, Response } from 'express';
import { AuthRequest, requireAuth } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { getUserByClerkId } from '../lib/clerk.js';

const router = Router();

// GET /api/notifications - Get user notifications
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

    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '20');
    const unread_only = req.query.unread_only === 'true';
    const type = req.query.type as string;
    const priority = req.query.priority as string;

    let query = supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact' })
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

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: notifications, error, count } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return res.status(500).json({ error: 'Failed to fetch notifications' });
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return res.json({
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
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/notifications - Create notification
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

    const notificationData = {
      user_id: body.target_user_id || user.id,
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

    const { data: notification, error } = await supabaseAdmin
      .from('notifications')
      .insert(notificationData)
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return res.status(500).json({ error: 'Failed to create notification' });
    }

    return res.status(201).json({ data: notification });
  } catch (error) {
    console.error('Error creating notification:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PATCH /api/notifications - Update notifications (mark as read)
router.patch('/', requireAuth, async (req: AuthRequest, res: Response) => {
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
    const { notification_id, notification_ids, mark_all_read, ...updateData } = body;

    if (mark_all_read) {
      // Mark all notifications as read for the user
      const { data: notifications, error } = await supabaseAdmin
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
        return res.status(500).json({ error: 'Failed to mark notifications as read' });
      }

      return res.json({
        data: notifications,
        message: `Marked ${notifications?.length || 0} notifications as read`
      });
    }

    if (notification_ids && Array.isArray(notification_ids)) {
      // Mark multiple notifications as read
      const { data: notifications, error } = await supabaseAdmin
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
        return res.status(500).json({ error: 'Failed to mark notifications as read' });
      }

      return res.json({ data: notifications });
    }

    if (notification_id) {
      // Update single notification
      if (updateData.is_read && !updateData.read_at) {
        updateData.read_at = new Date().toISOString();
      }

      const { data: notification, error } = await supabaseAdmin
        .from('notifications')
        .update(updateData)
        .eq('id', notification_id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating notification:', error);
        return res.status(500).json({ error: 'Failed to update notification' });
      }

      return res.json({ data: notification });
    }

    return res.status(400).json({ error: 'notification_id, notification_ids, or mark_all_read is required' });
  } catch (error) {
    console.error('Error updating notification:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /api/notifications - Delete notifications
router.delete('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await getUserByClerkId(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const notification_id = req.query.notification_id as string;
    const delete_all_read = req.query.delete_all_read === 'true';

    if (delete_all_read) {
      // Delete all read notifications for the user
      const { error } = await supabaseAdmin
        .from('notifications')
        .delete()
        .eq('user_id', user.id)
        .eq('is_read', true);

      if (error) {
        console.error('Error deleting read notifications:', error);
        return res.status(500).json({ error: 'Failed to delete notifications' });
      }

      return res.json({ message: 'All read notifications deleted successfully' });
    }

    if (notification_id) {
      // Delete single notification
      const { error } = await supabaseAdmin
        .from('notifications')
        .delete()
        .eq('id', notification_id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting notification:', error);
        return res.status(500).json({ error: 'Failed to delete notification' });
      }

      return res.json({ message: 'Notification deleted successfully' });
    }

    return res.status(400).json({ error: 'notification_id or delete_all_read is required' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
