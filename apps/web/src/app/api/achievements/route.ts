// Achievements API routes
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/clerk-react/server';
import { createClient } from '@/lib/supabase/server';
import { getUserByClerkId } from '@/lib/auth/clerk-supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const rarity = searchParams.get('rarity');
    const active_only = searchParams.get('active_only') !== 'false';
    const public_only = searchParams.get('public_only') !== 'false';

    // Use service client to get achievements (public data)
    const { createServiceClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceClient();

    let query = supabase
      .from('achievements')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }

    if (rarity) {
      query = query.eq('rarity', rarity);
    }

    if (active_only) {
      query = query.eq('is_active', true);
    }

    if (public_only) {
      query = query.eq('is_secret', false);
    }

    const { data: achievements, error } = await query;

    if (error) {
      console.error('Error fetching achievements:', error);
      return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 });
    }

    return NextResponse.json({ data: achievements });
  } catch (error) {
    console.error('Error fetching achievements:', error);
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

    // Check if user is admin or official (only they can create achievements)
    if (!['admin', 'official'].includes(user.account_type)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();

    const achievementData = {
      ...body,
      unlock_count: 0,
      is_active: body.is_active ?? true,
      is_secret: body.is_secret ?? false,
    };

    const supabase = await createClient();

    const { data: achievement, error } = await supabase
      .from('achievements')
      .insert(achievementData)
      .select()
      .single();

    if (error) {
      console.error('Error creating achievement:', error);
      return NextResponse.json({ error: 'Failed to create achievement' }, { status: 500 });
    }

    return NextResponse.json({ data: achievement }, { status: 201 });
  } catch (error) {
    console.error('Error creating achievement:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}