// User reporting API
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/clerk-react/server';
import { createClient } from '@/lib/supabase/server';
import { getUserByClerkId } from '@/lib/auth/clerk-supabase';

// POST - Create a report
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
    const { reported_user_id, report_type, description, evidence_urls } = body;

    if (!reported_user_id || !report_type || !description) {
      return NextResponse.json({
        error: 'Reported user ID, report type, and description are required'
      }, { status: 400 });
    }

    if (reported_user_id === user.id) {
      return NextResponse.json({ error: 'Cannot report yourself' }, { status: 400 });
    }

    const validReportTypes = ['harassment', 'spam', 'inappropriate_content', 'fake_profile', 'cheating', 'other'];
    if (!validReportTypes.includes(report_type)) {
      return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    const supabase = await createClient();

    // Check if user has already reported this user recently (within 24 hours)
    const { data: recentReport } = await supabase
      .from('reported_accounts')
      .select('id, created_at')
      .eq('reporter_id', user.id)
      .eq('reported_user_id', reported_user_id)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .single();

    if (recentReport) {
      return NextResponse.json({
        error: 'You have already reported this user recently. Please wait 24 hours before reporting again.'
      }, { status: 429 });
    }

    // Create report
    const { data: report, error } = await supabase
      .from('reported_accounts')
      .insert({
        reporter_id: user.id,
        reported_user_id,
        report_type,
        description,
        evidence_urls: evidence_urls || [],
        status: 'pending',
        severity: 'medium'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating report:', error);
      return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
    }

    return NextResponse.json({
      report,
      message: 'Report submitted successfully. Our team will review it shortly.'
    });
  } catch (error) {
    console.error('Error in reports POST:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET - Fetch user's reports (only their own reports)
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const supabase = await createClient();

    const { data: reports, error } = await supabase
      .from('reported_accounts')
      .select(`
        *,
        reported_user:reported_user_id(id, display_name, avatar_url)
      `)
      .eq('reporter_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reports:', error);
      return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    }

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Error in reports GET:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
