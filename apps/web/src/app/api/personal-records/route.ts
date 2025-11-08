// Personal Records API routes
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/clerk-react/server';
import { createClient } from '@/lib/supabase/server';
import { getUserByClerkId } from '@/lib/auth/clerk-supabase';
import { PersonalRecordInsert } from '@/types/database';

// Badge levels and criteria
const BADGE_CRITERIA = {
  'Elite': { color: 'text-yellow-500', icon: 'Crown' },
  'Strong': { color: 'text-purple-500', icon: 'Dumbbell' },
  'Fast': { color: 'text-cyan-500', icon: 'Zap' },
  'Endurance': { color: 'text-green-500', icon: 'Activity' },
};

function determineBadgeLevel(category: string, value: number, unit: string): string | null {
  // Simplified badge logic - you can enhance this based on your requirements
  switch (category.toLowerCase()) {
    case '100m sprint':
      if (unit === 'seconds') {
        if (value <= 10.5) return 'Elite';
        if (value <= 11.5) return 'Fast';
        if (value <= 12.5) return 'Strong';
      }
      break;
    case 'bench press':
    case 'squat':
    case 'deadlift':
      if (unit === 'kg') {
        if (value >= 150) return 'Elite';
        if (value >= 100) return 'Strong';
        if (value >= 80) return 'Fast';
      }
      break;
    case 'marathon':
      if (unit === 'minutes') {
        if (value <= 150) return 'Elite'; // 2:30:00
        if (value <= 180) return 'Endurance'; // 3:00:00
        if (value <= 240) return 'Strong'; // 4:00:00
      }
      break;
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get('user_id');
    const verified = searchParams.get('verified');

    if (!userId && !userIdParam) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service client to bypass RLS for public records
    const { createServiceClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceClient();
    let query = supabase
      .from('personal_records')
      .select(`
        *,
        sport_category:sports_categories(*),
        user:users!personal_records_user_id_fkey(
          id,
          display_name,
          avatar_url
        ),
        primary_video:files!personal_records_primary_video_id_fkey(
          id,
          filename,
          file_path,
          metadata
        )
      `)
      .order('created_at', { ascending: false });

    if (userIdParam) {
      // Viewing someone else's PRs - only show public verified ones
      const targetUser = await getUserByClerkId(userIdParam);
      if (!targetUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      query = query
        .eq('user_id', targetUser.id)
        .eq('is_public', true)
        .eq('verification_status', 'verified');
    } else {
      // Viewing own PRs
      const user = await getUserByClerkId(userId!);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      query = query.eq('user_id', user.id);

      if (verified === 'true') {
        query = query.eq('verification_status', 'verified');
      }
    }

    const { data: records, error } = await query;

    if (error) {
      console.error('Error fetching personal records:', error);
      return NextResponse.json({ error: 'Failed to fetch personal records' }, { status: 500 });
    }

    // Add badge information
    const recordsWithBadges = records.map(record => ({
      ...record,
      badge: record.badge_level ? {
        level: record.badge_level,
        ...BADGE_CRITERIA[record.badge_level as keyof typeof BADGE_CRITERIA]
      } : null
    }));

    return NextResponse.json({ data: recordsWithBadges });
  } catch (error) {
    console.error('Error fetching personal records:', error);
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

    // Determine badge level
    const badgeLevel = determineBadgeLevel(body.category, body.value, body.unit);

    const recordData: PersonalRecordInsert = {
      user_id: user.id,
      sport_category_id: body.sport_category_id,
      category: body.category,
      value: body.value,
      unit: body.unit,
      description: body.description,
      achievement_date: body.achievement_date,
      location: body.location,
      event_context: body.event_context,
      weather_conditions: body.weather_conditions,
      equipment_used: body.equipment_used,
      verification_method: body.verification_method || 'video',
      badge_level: badgeLevel,
      badge_criteria_met: badgeLevel ? { level: badgeLevel, category: body.category } : null,
      primary_video_id: body.primary_video_id,
      secondary_videos: body.secondary_videos || [],
      is_public: body.is_public ?? true,
      verification_status: 'pending',
      manual_review_required: false,
    };

    const { createServiceClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceClient();

    const { data: record, error } = await supabase
      .from('personal_records')
      .insert(recordData)
      .select(`
        *,
        sport_category:sports_categories(*),
        user:users!personal_records_user_id_fkey(
          id,
          display_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error creating personal record:', error);
      return NextResponse.json({ error: 'Failed to create personal record' }, { status: 500 });
    }

    // Add badge information
    const recordWithBadge = {
      ...record,
      badge: record.badge_level ? {
        level: record.badge_level,
        ...BADGE_CRITERIA[record.badge_level as keyof typeof BADGE_CRITERIA]
      } : null
    };

    return NextResponse.json({ data: recordWithBadge }, { status: 201 });
  } catch (error) {
    console.error('Error creating personal record:', error);
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
    const recordId = searchParams.get('id');

    if (!recordId) {
      return NextResponse.json({ error: 'Record ID is required' }, { status: 400 });
    }

    const { createServiceClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceClient();

    // First, fetch the record to get video IDs and verify ownership
    const { data: record, error: fetchError } = await supabase
      .from('personal_records')
      .select('user_id, primary_video_id, secondary_videos')
      .eq('id', recordId)
      .single();

    if (fetchError || !record) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    // Verify ownership
    if (record.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You can only delete your own records' }, { status: 403 });
    }

    // Collect all file IDs to delete
    const fileIds = [];
    if (record.primary_video_id) {
      fileIds.push(record.primary_video_id);
    }
    if (record.secondary_videos && Array.isArray(record.secondary_videos)) {
      fileIds.push(...record.secondary_videos);
    }

    // Delete associated files from storage
    if (fileIds.length > 0) {
      // Get file paths from files table
      const { data: files, error: filesError } = await supabase
        .from('files')
        .select('file_path, bucket_name')
        .in('id', fileIds);

      if (!filesError && files) {
        // Delete from storage bucket
        for (const file of files) {
          const bucketName = file.bucket_name || 'pr-videos';
          const { error: storageError } = await supabase.storage
            .from(bucketName)
            .remove([file.file_path]);

          if (storageError) {
            console.error(`Error deleting file from storage: ${file.file_path}`, storageError);
          }
        }

        // Delete file records from database
        const { error: deleteFilesError } = await supabase
          .from('files')
          .delete()
          .in('id', fileIds);

        if (deleteFilesError) {
          console.error('Error deleting file records:', deleteFilesError);
        }
      }
    }

    // Delete the personal record
    const { error: deleteError } = await supabase
      .from('personal_records')
      .delete()
      .eq('id', recordId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting personal record:', deleteError);
      return NextResponse.json({ error: 'Failed to delete personal record' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Personal record deleted successfully' });
  } catch (error) {
    console.error('Error deleting personal record:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}