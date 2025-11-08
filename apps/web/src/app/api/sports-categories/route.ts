// Sports Categories API routes
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { createServiceClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceClient() as any;

    const { data: categories, error } = await supabase
      .from('sports_categories')
      .select('*')
      .order('sport_name', { ascending: true })
      .order('category', { ascending: true });

    if (error) {
      console.error('Error fetching sports categories:', error);
      // Return empty data instead of error for missing table
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log('Sports categories table not found, returning empty data');
        return NextResponse.json({
          data: [],
          grouped: {},
          count: 0
        });
      }
      return NextResponse.json({ error: 'Failed to fetch sports categories' }, { status: 500 });
    }

    const safeCategories = categories || [];

    // Group categories by sport
    const groupedCategories = safeCategories.reduce((acc, category: any) => {
      if (!acc[category.sport_name]) {
        acc[category.sport_name] = [];
      }
      acc[category.sport_name].push(category);
      return acc;
    }, {} as Record<string, any[]>);

    return NextResponse.json({
      data: safeCategories,
      grouped: groupedCategories,
      count: safeCategories.length
    });
  } catch (error) {
    console.error('Error fetching sports categories:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : error,
      hint: 'Check Supabase connection and table existence',
      code: ''
    });
    return NextResponse.json({
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}