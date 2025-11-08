// File upload API route
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/clerk-react/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getUserByClerkId } from '@/lib/auth/clerk-supabase';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = {
  'uploads': ['image/*', 'video/*', 'application/pdf'],
  'pr-videos': ['video/*'],
  'user-avatars': ['image/*'],
  'team-media': ['image/*'],
};

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

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string || 'uploads';
    const usageType = formData.get('usage_type') as string || 'general';
    const relatedEntityType = formData.get('related_entity_type') as string;
    const relatedEntityId = formData.get('related_entity_id') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 50MB' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ALLOWED_TYPES[bucket as keyof typeof ALLOWED_TYPES];
    if (!allowedTypes) {
      return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 });
    }

    const isValidType = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', ''));
      }
      return file.type === type;
    });

    if (!isValidType) {
      return NextResponse.json({
        error: `Invalid file type. Allowed types for ${bucket}: ${allowedTypes.join(', ')}`
      }, { status: 400 });
    }

    // Use service client for storage operations and DB inserts (bypasses RLS)
    const supabase = await createServiceClient();

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const filename = `${user.id}/${timestamp}-${randomString}.${fileExtension}`;

    // Convert File to ArrayBuffer for Supabase
    const fileBuffer = await file.arrayBuffer();

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filename, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading file to Supabase Storage:', {
        error: uploadError,
        bucket,
        filename,
        fileSize: file.size,
        fileType: file.type
      });
      return NextResponse.json({
        error: 'Failed to upload file',
        details: uploadError.message
      }, { status: 500 });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filename);

    // Save file metadata to database
    const fileData = {
      user_id: user.id,
      filename: filename,
      original_name: file.name,
      file_path: uploadData.path,
      file_size: file.size,
      file_type: file.type.startsWith('image/') ? 'image' :
                 file.type.startsWith('video/') ? 'video' : 'document',
      mime_type: file.type,
      bucket_name: bucket,
      upload_context: usageType,
      description: relatedEntityType ? `${relatedEntityType}: ${relatedEntityId}` : null,
      is_public: bucket === 'uploads' ? true : false,
      is_verified: false,
      metadata: {
        public_url: publicUrlData.publicUrl,
        related_entity_type: relatedEntityType,
        related_entity_id: relatedEntityId,
      },
    };

    const { data: fileRecord, error: dbError } = await supabase
      .from('files')
      .insert(fileData)
      .select()
      .single();

    if (dbError) {
      console.error('Error saving file metadata:', dbError);
      // Clean up uploaded file if database insert fails
      await supabase.storage.from(bucket).remove([filename]);
      return NextResponse.json({ error: 'Failed to save file metadata' }, { status: 500 });
    }

    // For video files, you might want to trigger video processing here
    if (file.type.startsWith('video/')) {
      // TODO: Trigger video processing job
      console.log('Video uploaded, processing should be triggered:', fileRecord.id);
    }

    return NextResponse.json({
      data: {
        file: {
          id: fileRecord.id,
          filename: fileRecord.filename,
          original_name: fileRecord.original_name,
          public_url: fileRecord.metadata?.public_url || publicUrlData.publicUrl,
          file_path: fileRecord.file_path,
          file_type: fileRecord.file_type,
          file_size: fileRecord.file_size,
          mime_type: fileRecord.mime_type,
        }
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error in file upload:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}