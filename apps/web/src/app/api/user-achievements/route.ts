// User Achievements API routes
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
    const showcased_only = searchParams.get('showcased_only') === 'true';

    const supabase = await createClient();

    let query = supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq('user_id', user.id)
      .order('unlocked_at', { ascending: false });

    if (showcased_only) {
      query = query.eq('is_showcased', true);
    }

    const { data: userAchievements, error } = await query;

    if (error) {
      console.error('Error fetching user achievements:', error);
      return NextResponse.json({ error: 'Failed to fetch user achievements' }, { status: 500 });
    }

    return NextResponse.json({ data: userAchievements });
  } catch (error) {
    console.error('Error fetching user achievements:', error);
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
    const { achievement_id, progress_data, unlock_source } = body;

    const supabase = await createClient();

    // Check if user already has this achievement
    const { data: existingAchievement } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', user.id)
      .eq('achievement_id', achievement_id)
      .single();

    if (existingAchievement) {
      return NextResponse.json({ error: 'Achievement already unlocked' }, { status: 400 });
    }

    const achievementData = {
      user_id: user.id,
      achievement_id,
      progress_data,
      unlock_source,
      unlocked_at: new Date().toISOString(),
      is_showcased: false,
      notification_sent: false,
      shared_socially: false,
    };

    const { data: userAchievement, error } = await supabase
      .from('user_achievements')
      .insert(achievementData)
      .select(`
        *,
        achievement:achievements(*)
      `)
      .single();

    if (error) {
      console.error('Error unlocking achievement:', error);
      return NextResponse.json({ error: 'Failed to unlock achievement' }, { status: 500 });
    }

    // Update the achievement unlock count
    await supabase.rpc('increment_achievement_unlock_count', {
      achievement_id: achievement_id
    });

    return NextResponse.json({ data: userAchievement }, { status: 201 });
  } catch (error) {
    console.error('Error unlocking achievement:', error);
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
    const { achievement_id, is_showcased, shared_socially } = body;

    const supabase = await createClient();

    const updateData: any = {};
    if (typeof is_showcased === 'boolean') updateData.is_showcased = is_showcased;
    if (typeof shared_socially === 'boolean') updateData.shared_socially = shared_socially;

    const { data: userAchievement, error } = await supabase
      .from('user_achievements')
      .update(updateData)
      .eq('user_id', user.id)
      .eq('achievement_id', achievement_id)
      .select(`
        *,
        achievement:achievements(*)
      `)
      .single();

    if (error) {
      console.error('Error updating user achievement:', error);
      return NextResponse.json({ error: 'Failed to update achievement' }, { status: 500 });
    }

    return NextResponse.json({ data: userAchievement });
  } catch (error) {
    console.error('Error updating user achievement:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}