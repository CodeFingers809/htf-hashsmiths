// Clerk-Supabase integration utilities
import { currentUser } from '@clerk/clerk-react/server';
import { createServiceClient } from '@/lib/supabase/server';
import { UserInsert, UserUpdate, User } from '@/types/database';

export interface ClerkUser {
  id: string;
  emailAddresses: Array<{ emailAddress: string }>;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  phoneNumbers?: Array<{ phoneNumber: string }>;
}

/**
 * Convert Clerk user to Supabase user format
 */
export function clerkUserToSupabaseUser(clerkUser: ClerkUser): UserInsert {
  const hasBasicInfo = clerkUser.firstName && clerkUser.lastName;
  const completionPercentage = hasBasicInfo ? 40 : 20; // Higher if we have name from OAuth

  return {
    clerk_id: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress || '',
    first_name: clerkUser.firstName || undefined,
    last_name: clerkUser.lastName || undefined,
    display_name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || undefined,
    avatar_url: clerkUser.imageUrl || undefined,
    phone: clerkUser.phoneNumbers?.[0]?.phoneNumber || undefined,
    account_type: 'athlete',
    country: 'India',
    profile_completed: completionPercentage >= 80,
    profile_completion_percentage: completionPercentage,
    is_verified: clerkUser.emailAddresses[0]?.verification?.status === 'verified' || false,
    is_active: true,
  };
}

/**
 * Sync Clerk user with Supabase database
 * This function creates or updates a user in Supabase based on Clerk data
 */
export async function syncClerkUserWithSupabase(clerkUser: ClerkUser): Promise<User | null> {
  try {
    const supabase = await createServiceClient();

    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', clerkUser.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user:', fetchError);
      return null;
    }

    if (existingUser) {
      // User exists, update with latest Clerk data (preserve existing data if Clerk data is empty)
      const updateData: UserUpdate = {
        email: clerkUser.emailAddresses[0]?.emailAddress || existingUser.email,
        first_name: clerkUser.firstName || existingUser.first_name,
        last_name: clerkUser.lastName || existingUser.last_name,
        display_name: `${clerkUser.firstName || existingUser.first_name || ''} ${clerkUser.lastName || existingUser.last_name || ''}`.trim() || existingUser.display_name,
        avatar_url: clerkUser.imageUrl || existingUser.avatar_url,
        phone: clerkUser.phoneNumbers?.[0]?.phoneNumber || existingUser.phone,
        is_verified: clerkUser.emailAddresses[0]?.verification?.status === 'verified' || existingUser.is_verified,
      };

      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('clerk_id', clerkUser.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating user:', updateError);
        return null;
      }

      return updatedUser;
    } else {
      // User doesn't exist, create new user
      const newUserData = clerkUserToSupabaseUser(clerkUser);

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert(newUserData)
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user:', insertError);
        return null;
      }

      return newUser;
    }
  } catch (error) {
    console.error('Error syncing user with Supabase:', error);
    return null;
  }
}

/**
 * Get current authenticated user from Supabase
 * This function fetches the user based on the current Clerk session
 */
export async function getCurrentSupabaseUser(): Promise<User | null> {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return null;
    }

    // First try to sync the user to ensure data is up to date
    const syncedUser = await syncClerkUserWithSupabase(clerkUser);

    return syncedUser;
  } catch (error) {
    console.error('Error getting current Supabase user:', error);
    return null;
  }
}

/**
 * Get user by Clerk ID
 */
export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  try {
    const supabase = await createServiceClient();

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', clerkId)
      .single();

    if (error) {
      console.error('Error fetching user by Clerk ID:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error getting user by Clerk ID:', error);
    return null;
  }
}

/**
 * Calculate profile completion percentage
 */
export function calculateProfileCompletion(user: User): number {
  let completion = 20; // Base for having an account

  // Basic info (40%)
  if (user.first_name && user.last_name) completion += 10;
  if (user.avatar_url) completion += 10;
  if (user.phone) completion += 10;
  if (user.date_of_birth) completion += 10;

  // Location info (20%)
  if (user.state && user.city) completion += 10;
  if (user.pincode) completion += 10;

  // Additional info (20%)
  if (user.gender) completion += 10;
  if (user.address) completion += 10;

  return Math.min(completion, 100);
}

/**
 * Update user profile completion
 */
export async function updateProfileCompletion(userId: string): Promise<void> {
  try {
    const supabase = await createServiceClient();

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!user) return;

    const completionPercentage = calculateProfileCompletion(user);
    const isCompleted = completionPercentage >= 80;

    await supabase
      .from('users')
      .update({
        profile_completion_percentage: completionPercentage,
        profile_completed: isCompleted,
      })
      .eq('id', userId);
  } catch (error) {
    console.error('Error updating profile completion:', error);
  }
}