// Generate signed URLs for private file access
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/clerk-react/server';
import { createServiceClient } from '@/lib/supabase/server';

const URL_EXPIRY_TIME = 3600; // 1 hour in seconds

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { filePath, bucket = 'pr-videos', expiresIn = URL_EXPIRY_TIME } = await req.json();

    if (!filePath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 });
    }

    // Use service client to generate signed URLs
    const supabase = await createServiceClient();

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('Error generating signed URL:', error);
      return NextResponse.json({
        error: 'Failed to generate signed URL',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
    });

  } catch (error) {
    console.error('Error in signed URL generation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Batch generate signed URLs for multiple files
export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { files, bucket = 'pr-videos', expiresIn = URL_EXPIRY_TIME } = await req.json();

    if (!files || !Array.isArray(files)) {
      return NextResponse.json({ error: 'Files array is required' }, { status: 400 });
    }

    const supabase = await createServiceClient();

    const signedUrls = await Promise.all(
      files.map(async (filePath: string) => {
        const { data, error } = await supabase.storage
          .from(bucket)
          .createSignedUrl(filePath, expiresIn);

        if (error) {
          console.error(`Error generating signed URL for ${filePath}:`, error);
          return { filePath, error: error.message };
        }

        return {
          filePath,
          signedUrl: data.signedUrl,
          expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
        };
      })
    );

    return NextResponse.json({ signedUrls });

  } catch (error) {
    console.error('Error in batch signed URL generation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}