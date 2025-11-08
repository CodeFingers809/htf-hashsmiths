import { Router, Response } from 'express';
import { AuthRequest, requireAuth } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { getUserByClerkId } from '../lib/clerk.js';
import multer from 'multer';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  }
});

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES: Record<string, string[]> = {
  'uploads': ['image/', 'video/', 'application/pdf'],
  'pr-videos': ['video/'],
  'user-avatars': ['image/'],
  'team-media': ['image/'],
};

// POST /api/files/upload - Upload file
router.post('/upload', requireAuth, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await getUserByClerkId(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const file = req.file;
    const bucket = (req.body.bucket as string) || 'uploads';
    const usageType = (req.body.usage_type as string) || 'general';
    const relatedEntityType = req.body.related_entity_type as string;
    const relatedEntityId = req.body.related_entity_id as string;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return res.status(400).json({ error: 'File too large. Maximum size is 50MB' });
    }

    // Validate file type
    const allowedTypes = ALLOWED_TYPES[bucket];
    if (!allowedTypes) {
      return res.status(400).json({ error: 'Invalid bucket' });
    }

    const isValidType = allowedTypes.some(type => file.mimetype.startsWith(type.replace('/', '')));

    if (!isValidType) {
      return res.status(400).json({
        error: `Invalid file type. Allowed types for ${bucket}: ${allowedTypes.join(', ')}`
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.originalname.split('.').pop();
    const filename = `${user.id}/${timestamp}-${randomString}.${fileExtension}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading file to Supabase Storage:', {
        error: uploadError,
        bucket,
        filename,
        fileSize: file.size,
        fileType: file.mimetype
      });
      return res.status(500).json({
        error: 'Failed to upload file',
        details: uploadError.message
      });
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(filename);

    // Save file metadata to database
    const fileData = {
      user_id: user.id,
      filename: filename,
      original_filename: file.originalname,
      file_path: uploadData.path,
      file_size_bytes: file.size,
      file_type: file.mimetype.startsWith('image/') ? 'image' :
                 file.mimetype.startsWith('video/') ? 'video' : 'document',
      mime_type: file.mimetype,
      storage_bucket: bucket,
      usage_type: usageType,
      related_entity_type: relatedEntityType || null,
      related_entity_id: relatedEntityId || null,
      is_public: bucket === 'uploads',
      processing_status: 'completed',
      public_url: publicUrlData.publicUrl,
    };

    const { data: fileRecord, error: dbError } = await supabaseAdmin
      .from('files')
      .insert(fileData)
      .select()
      .single();

    if (dbError) {
      console.error('Error saving file metadata:', dbError);
      // Clean up uploaded file if database insert fails
      await supabaseAdmin.storage.from(bucket).remove([filename]);
      return res.status(500).json({ error: 'Failed to save file metadata' });
    }

    // For video files, you might want to trigger video processing here
    if (file.mimetype.startsWith('video/')) {
      console.log('Video uploaded, processing should be triggered:', fileRecord.id);
    }

    return res.status(201).json({
      data: {
        file: {
          id: fileRecord.id,
          filename: fileRecord.filename,
          original_filename: fileRecord.original_filename,
          public_url: fileRecord.public_url || publicUrlData.publicUrl,
          file_path: fileRecord.file_path,
          file_type: fileRecord.file_type,
          file_size: fileRecord.file_size_bytes,
          mime_type: fileRecord.mime_type,
        }
      }
    });

  } catch (error) {
    console.error('Error in file upload:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
