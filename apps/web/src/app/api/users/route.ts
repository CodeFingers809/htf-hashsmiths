// Users API routes
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/clerk-react/server';
import { getUserByClerkId, updateProfileCompletion } from '@/lib/auth/clerk-supabase';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to get user, if not found, sync from Clerk
    let user = await getUserByClerkId(userId);

    if (!user) {
      // Import getCurrentSupabaseUser to sync user
      const { getCurrentSupabaseUser } = await import('@/lib/auth/clerk-supabase');
      user = await getCurrentSupabaseUser();

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to get user, if not found, sync from Clerk
    let user = await getUserByClerkId(userId);
    console.log('User from getUserByClerkId:', user?.id || 'null');

    if (!user) {
      console.log('User not found, attempting to sync from Clerk...');
      // Import getCurrentSupabaseUser to sync user
      const { getCurrentSupabaseUser } = await import('@/lib/auth/clerk-supabase');
      user = await getCurrentSupabaseUser();
      console.log('User after sync:', user?.id || 'null');

      if (!user) {
        console.error('Failed to sync user from Clerk');
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    }

    const body = await req.json();
    console.log('Request body:', body);

    // Input validation
    if (body.phone && !/^\+?[\d\s\-\(\)]{10,15}$/.test(body.phone)) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    if (body.pincode && !/^\d{6}$/.test(body.pincode)) {
      return NextResponse.json({ error: 'Pincode must be 6 digits' }, { status: 400 });
    }

    if (body.date_of_birth && body.date_of_birth !== '') {
      const date = new Date(body.date_of_birth);
      if (isNaN(date.getTime())) {
        return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
      }
      // Check if user is at least 10 years old
      const minAge = new Date();
      minAge.setFullYear(minAge.getFullYear() - 10);
      if (date > minAge) {
        return NextResponse.json({ error: 'User must be at least 10 years old' }, { status: 400 });
      }
    }

    // Build update data dynamically to avoid undefined values
    const updateData: Record<string, any> = {};

    if (body.first_name !== undefined && body.first_name !== '') updateData.first_name = body.first_name;
    if (body.last_name !== undefined && body.last_name !== '') updateData.last_name = body.last_name;
    if (body.display_name !== undefined && body.display_name !== '') updateData.display_name = body.display_name;
    if (body.phone !== undefined && body.phone !== '') updateData.phone = body.phone;
    if (body.date_of_birth !== undefined && body.date_of_birth !== '') updateData.date_of_birth = body.date_of_birth;
    if (body.gender !== undefined && body.gender !== '') updateData.gender = body.gender;
    if (body.state !== undefined && body.state !== '') updateData.state = body.state;
    if (body.city !== undefined && body.city !== '') updateData.city = body.city;
    if (body.address !== undefined && body.address !== '') updateData.address = body.address;
    if (body.pincode !== undefined && body.pincode !== '') updateData.pincode = body.pincode;
    if (body.latitude !== undefined) updateData.latitude = body.latitude;
    if (body.longitude !== undefined) updateData.longitude = body.longitude;

    console.log('Update data built:', updateData);
    console.log('User to update:', { id: user.id, clerk_id: user.clerk_id });

    const { createServiceClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceClient();

    const { data: updatedUser, error } = await (supabase as any)
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      console.error('Update data:', updateData);
      console.error('User ID:', user.id);
      return NextResponse.json({
        error: 'Failed to update user',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    // Update profile completion
    try {
      await updateProfileCompletion(user.id);
    } catch (compError) {
      console.error('Error updating profile completion:', compError);
      // Don't fail the whole request if profile completion update fails
    }

    return NextResponse.json({ data: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}