import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    // Verify webhook signature
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      logger.error('Missing CLERK_WEBHOOK_SECRET');
      return NextResponse.json({ error: 'Missing webhook secret' }, { status: 500 });
    }

    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      logger.error('Missing svix headers');
      return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
    }

    const payload = await req.text();
    const body = JSON.parse(payload);

    const wh = new Webhook(WEBHOOK_SECRET);

    let evt;
    try {
      evt = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      logger.error('Webhook verification failed:', err);
      return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 });
    }

    const { id } = evt.data;
    const eventType = evt.type;

    logger.info(`Webhook received: ${eventType} for user ${id}`);

    // Handle user deletion
    if (eventType === 'user.deleted') {
      const { createServiceClient } = await import('@/lib/supabase/server');
      const supabase = await createServiceClient();

      // Get user data before moving to deleted_users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', id)
        .single();

      if (userError) {
        logger.error('Error fetching user for deletion:', userError);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Move user data to deleted_users table
      const deletedUserData = {
        ...userData,
        original_user_id: userData.id,
        deleted_at: new Date().toISOString(),
        deletion_reason: 'user_requested',
        clerk_deletion_event_id: evt.id
      };

      // Insert into deleted_users
      const { error: insertError } = await supabase
        .from('deleted_users')
        .insert(deletedUserData);

      if (insertError) {
        logger.error('Error inserting into deleted_users:', insertError);
        return NextResponse.json({ error: 'Failed to archive user data' }, { status: 500 });
      }

      // Move related data to archive tables
      await Promise.all([
        // Archive personal records
        supabase.rpc('archive_user_personal_records', { user_id: userData.id }),

        // Archive team memberships
        supabase.rpc('archive_user_team_memberships', { user_id: userData.id }),

        // Archive event registrations
        supabase.rpc('archive_user_event_registrations', { user_id: userData.id }),

        // Archive files
        supabase.rpc('archive_user_files', { user_id: userData.id })
      ]);

      // Finally delete the user from active users table
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('clerk_id', id);

      if (deleteError) {
        logger.error('Error deleting user:', deleteError);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
      }

      logger.info(`Successfully archived and deleted user: ${id}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    logger.error('Error in user deletion webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}