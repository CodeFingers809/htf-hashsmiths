// User Preferences API routes
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

    const supabase = await createClient();

    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching user preferences:', error);
      return NextResponse.json({ error: 'Failed to fetch user preferences' }, { status: 500 });
    }

    // Return default preferences if none exist
    if (!preferences) {
      const defaultPreferences = {
        user_id: user.id,
        notifications_enabled: true,
        email_notifications: true,
        push_notifications: true,
        sms_notifications: false,
        notification_frequency: 'daily',
        notification_types: {
          achievements: true,
          events: true,
          team_updates: true,
          training_reminders: true,
          messages: true
        },
        profile_visibility: 'public',
        show_performance_data: true,
        show_location: true,
        show_contact_info: false,
        show_training_data: true,
        allow_team_invites: true,
        allow_coach_contact: true,
        performance_tracking_enabled: true,
        auto_sync_devices: false,
        metric_units: 'metric',
        auto_share_achievements: false,
        performance_goals_public: false,
        theme: 'dark',
        language: 'en',
        timezone: 'Asia/Kolkata',
        date_format: 'DD/MM/YYYY',
        time_format: '24h',
        currency: 'INR',
        preferred_contact_method: 'email',
        marketing_emails: false,
        coaching_tips: true,
        performance_reports: true,
        default_session_privacy: 'private',
        reminder_notifications: true,
        workout_rest_reminders: true,
        form_check_reminders: true,
      };

      return NextResponse.json({ data: defaultPreferences });
    }

    return NextResponse.json({ data: preferences });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
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

    const preferencesData = {
      user_id: user.id,
      ...body,
    };

    const supabase = await createClient();

    // Check if preferences already exist
    const { data: existingPreferences } = await supabase
      .from('user_preferences')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingPreferences) {
      return NextResponse.json({ error: 'User preferences already exist. Use PATCH to update.' }, { status: 400 });
    }

    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .insert(preferencesData)
      .select()
      .single();

    if (error) {
      console.error('Error creating user preferences:', error);
      return NextResponse.json({ error: 'Failed to create user preferences' }, { status: 500 });
    }

    return NextResponse.json({ data: preferences }, { status: 201 });
  } catch (error) {
    console.error('Error creating user preferences:', error);
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

    const supabase = await createClient();

    // Check if preferences exist, create if they don't
    const { data: existingPreferences } = await supabase
      .from('user_preferences')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let preferences;
    let error;

    if (existingPreferences) {
      // Update existing preferences
      const result = await supabase
        .from('user_preferences')
        .update(body)
        .eq('user_id', user.id)
        .select()
        .single();

      preferences = result.data;
      error = result.error;
    } else {
      // Create new preferences with the provided data
      const preferencesData = {
        user_id: user.id,
        ...body,
      };

      const result = await supabase
        .from('user_preferences')
        .insert(preferencesData)
        .select()
        .single();

      preferences = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error updating user preferences:', error);
      return NextResponse.json({ error: 'Failed to update user preferences' }, { status: 500 });
    }

    return NextResponse.json({ data: preferences });
  } catch (error) {
    console.error('Error updating user preferences:', error);
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

    const supabase = await createClient();

    const { error } = await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting user preferences:', error);
      return NextResponse.json({ error: 'Failed to delete user preferences' }, { status: 500 });
    }

    return NextResponse.json({ message: 'User preferences reset to defaults' });
  } catch (error) {
    console.error('Error deleting user preferences:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}