import { Router, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

const router = Router();

// GET /api/sports-categories - Get all sports categories
router.get('/', async (req, res: Response) => {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('sports_categories')
      .select('*')
      .order('sport_name', { ascending: true })
      .order('category', { ascending: true });

    if (error) {
      console.error('Error fetching sports categories:', error);
      // Return empty data instead of error for missing table
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log('Sports categories table not found, returning empty data');
        return res.json({
          data: [],
          grouped: {},
          count: 0
        });
      }
      return res.status(500).json({ error: 'Failed to fetch sports categories' });
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

    return res.json({
      data: safeCategories,
      grouped: groupedCategories,
      count: safeCategories.length
    });
  } catch (error) {
    console.error('Error fetching sports categories:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
