// User Goals API routes
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
    const status = searchParams.get('status');
    const goal_type = searchParams.get('goal_type');
    const sport_category_id = searchParams.get('sport_category_id');
    const priority = searchParams.get('priority');
    const public_only = searchParams.get('public_only') === 'true';

    const supabase = await createClient();

    let query = supabase
      .from('user_goals')
      .select(`
        *,
        sport_category:sports_categories(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (goal_type) {
      query = query.eq('goal_type', goal_type);
    }

    if (sport_category_id) {
      query = query.eq('sport_category_id', sport_category_id);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    if (public_only) {
      query = query.eq('is_public', true);
    }

    const { data: goals, error } = await query;

    if (error) {
      console.error('Error fetching user goals:', error);
      return NextResponse.json({ error: 'Failed to fetch user goals' }, { status: 500 });
    }

    return NextResponse.json({ data: goals });
  } catch (error) {
    console.error('Error fetching user goals:', error);
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

    const goalData = {
      ...body,
      user_id: user.id,
      status: body.status || 'active',
      progress_percentage: body.progress_percentage || 0,
      is_public: body.is_public ?? false,
      current_value: body.current_value || 0,
    };

    const supabase = await createClient();

    const { data: goal, error } = await supabase
      .from('user_goals')
      .insert(goalData)
      .select(`
        *,
        sport_category:sports_categories(*)
      `)
      .single();

    if (error) {
      console.error('Error creating user goal:', error);
      return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
    }

    return NextResponse.json({ data: goal }, { status: 201 });
  } catch (error) {
    console.error('Error creating user goal:', error);
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
    const { goal_id, ...updateData } = body;

    const supabase = await createClient();

    // Verify goal ownership
    const { data: existingGoal } = await supabase
      .from('user_goals')
      .select('user_id, current_value, target_value')
      .eq('id', goal_id)
      .single();

    if (!existingGoal || existingGoal.user_id !== user.id) {
      return NextResponse.json({ error: 'Goal not found or access denied' }, { status: 404 });
    }

    // Calculate progress percentage if current_value or target_value is updated
    if (updateData.current_value !== undefined || updateData.target_value !== undefined) {
      const currentValue = updateData.current_value !== undefined ? updateData.current_value : existingGoal.current_value;
      const targetValue = updateData.target_value !== undefined ? updateData.target_value : existingGoal.target_value;

      if (targetValue && targetValue > 0) {
        updateData.progress_percentage = Math.min(100, Math.round((currentValue / targetValue) * 100));
      }

      // Auto-complete goal if target is reached
      if (currentValue >= targetValue && updateData.status !== 'completed') {
        updateData.status = 'completed';
        updateData.completed_at = new Date().toISOString();
      }
    }

    const { data: goal, error } = await supabase
      .from('user_goals')
      .update(updateData)
      .eq('id', goal_id)
      .select(`
        *,
        sport_category:sports_categories(*)
      `)
      .single();

    if (error) {
      console.error('Error updating user goal:', error);
      return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
    }

    return NextResponse.json({ data: goal });
  } catch (error) {
    console.error('Error updating user goal:', error);
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
    const goal_id = searchParams.get('goal_id');

    if (!goal_id) {
      return NextResponse.json({ error: 'Goal ID required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify goal ownership
    const { data: existingGoal } = await supabase
      .from('user_goals')
      .select('user_id')
      .eq('id', goal_id)
      .single();

    if (!existingGoal || existingGoal.user_id !== user.id) {
      return NextResponse.json({ error: 'Goal not found or access denied' }, { status: 404 });
    }

    const { error } = await supabase
      .from('user_goals')
      .delete()
      .eq('id', goal_id);

    if (error) {
      console.error('Error deleting user goal:', error);
      return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting user goal:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}