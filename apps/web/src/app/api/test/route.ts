// Test API route - No authentication required
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Also test with service client (bypasses RLS)
    const { createServiceClient } = await import('@/lib/supabase/server');
    const serviceSupabase = await createServiceClient();

    // Test events table - check raw data
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, title, slug, status, is_public')
      .limit(3);

    // Test events with public filter
    const { data: publicEvents, error: publicError } = await supabase
      .from('events')
      .select('id, title, slug, status, is_public')
      .eq('is_public', true)
      .limit(3);

    // Test with service client (bypasses RLS)
    const { data: serviceEvents, error: serviceError } = await serviceSupabase
      .from('events')
      .select('id, title, slug, status, is_public')
      .limit(3);

    // Test sports categories
    const { data: categories, error: categoriesError } = await supabase
      .from('sports_categories')
      .select('id, sport_name, category')
      .limit(3);

    return NextResponse.json({
      status: 'success',
      database_connection: 'OK',
      events: {
        count: events?.length || 0,
        data: events || [],
        error: eventsError?.message || null
      },
      publicEvents: {
        count: publicEvents?.length || 0,
        data: publicEvents || [],
        error: publicError?.message || null
      },
      serviceEvents: {
        count: serviceEvents?.length || 0,
        data: serviceEvents || [],
        error: serviceError?.message || null
      },
      categories: {
        count: categories?.length || 0,
        data: categories || [],
        error: categoriesError?.message || null
      }
    });

  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}