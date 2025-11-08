// Clerk webhook handler for user synchronization
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { syncClerkUserWithSupabase } from '@/lib/auth/clerk-supabase';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Error occurred -- no svix headers' }, { status: 400 });
  }

  // Get the body
  const payload = await req.text();

  // Create a new Svix instance with your secret.
  const wh = new Webhook(webhookSecret);

  let evt: any;

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as any;
  } catch (err) {
    return NextResponse.json({ error: 'Error occurred' }, { status: 400 });
  }

  const { type, data } = evt;


  try {
    switch (type) {
      case 'user.created':
      case 'user.updated':
        // Sync user data with Supabase
        const clerkUser = {
          id: data.id,
          emailAddresses: data.email_addresses,
          firstName: data.first_name,
          lastName: data.last_name,
          imageUrl: data.image_url,
          phoneNumbers: data.phone_numbers,
        };

        const supabaseUser = await syncClerkUserWithSupabase(clerkUser);

        if (!supabaseUser) {
          return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
        }

        break;

      case 'user.deleted':
        // Handle user deletion - mark as inactive instead of deleting
        // This preserves data integrity for teams, events, etc.
        const { createServiceClient } = await import('@/lib/supabase/server');
        const supabase = await createServiceClient();

        const { error } = await supabase
          .from('users')
          .update({
            is_active: false,
            updated_at: new Date().toISOString()
          })
          .eq('clerk_id', data.id);

        if (error) {
          return NextResponse.json({ error: 'Failed to deactivate user' }, { status: 500 });
        }

        break;

      default:
        // Unhandled webhook type - no action needed
    }

    return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}