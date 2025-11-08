import { Router, Response } from 'express';
import { AuthRequest, requireAuth } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { getUserByClerkId } from '../lib/clerk.js';

const router = Router();

// Helper function to update profile completion
async function updateProfileCompletion(userId: string) {
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (!user) return;

  let completionFields = 0;
  const totalFields = 10;

  if (user.first_name) completionFields++;
  if (user.last_name) completionFields++;
  if (user.email) completionFields++;
  if (user.phone) completionFields++;
  if (user.date_of_birth) completionFields++;
  if (user.gender) completionFields++;
  if (user.state) completionFields++;
  if (user.city) completionFields++;
  if (user.address) completionFields++;
  if (user.pincode) completionFields++;

  const profileCompletionPercentage = Math.round((completionFields / totalFields) * 100);
  const profileCompleted = profileCompletionPercentage === 100;

  await supabaseAdmin
    .from('users')
    .update({
      profile_completion_percentage: profileCompletionPercentage,
      profile_completed: profileCompleted
    })
    .eq('id', userId);
}

// GET /api/users - Get current user
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Try to get user
    let user = await getUserByClerkId(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ data: user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /api/users - Update user
router.put('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Try to get user
    let user = await getUserByClerkId(userId);
    console.log('User from getUserByClerkId:', user?.id || 'null');

    if (!user) {
      console.error('Failed to sync user from Clerk');
      return res.status(404).json({ error: 'User not found' });
    }

    const body = req.body;
    console.log('Request body:', body);

    // Input validation
    if (body.phone && !/^\+?[\d\s\-\(\)]{10,15}$/.test(body.phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    if (body.pincode && !/^\d{6}$/.test(body.pincode)) {
      return res.status(400).json({ error: 'Pincode must be 6 digits' });
    }

    if (body.date_of_birth && body.date_of_birth !== '') {
      const date = new Date(body.date_of_birth);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }
      // Check if user is at least 10 years old
      const minAge = new Date();
      minAge.setFullYear(minAge.getFullYear() - 10);
      if (date > minAge) {
        return res.status(400).json({ error: 'User must be at least 10 years old' });
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

    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      console.error('Update data:', updateData);
      console.error('User ID:', user.id);
      return res.status(500).json({
        error: 'Failed to update user',
        details: error.message,
        code: error.code
      });
    }

    // Update profile completion
    try {
      await updateProfileCompletion(user.id);
    } catch (compError) {
      console.error('Error updating profile completion:', compError);
      // Don't fail the whole request if profile completion update fails
    }

    return res.json({ data: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
