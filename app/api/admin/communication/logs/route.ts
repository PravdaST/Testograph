import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_ID = 'e4ea078b-30b2-4347-801f-6d26a87318b6';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Filters
    const status = searchParams.get('status'); // 'sent', 'failed', 'pending', 'bounced'
    const recipientEmail = searchParams.get('recipient_email');
    const templateId = searchParams.get('template_id');
    const isBulk = searchParams.get('is_bulk');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const searchQuery = searchParams.get('search');

    // Build query
    let query = supabase
      .from('email_logs')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (recipientEmail) {
      query = query.eq('recipient_email', recipientEmail);
    }

    if (templateId) {
      query = query.eq('template_id', templateId);
    }

    if (isBulk !== null && isBulk !== undefined) {
      query = query.eq('is_bulk', isBulk === 'true');
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    if (searchQuery) {
      query = query.or(
        `recipient_email.ilike.%${searchQuery}%,` +
        `recipient_name.ilike.%${searchQuery}%,` +
        `subject.ilike.%${searchQuery}%`
      );
    }

    // Apply pagination and sorting
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: logs, error, count } = await query;

    if (error) {
      console.error('Error fetching email logs:', error);
      throw error;
    }

    // Get statistics
    const { data: stats } = await supabase.rpc('get_email_stats', {
      start_date: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: endDate || new Date().toISOString()
    });

    return NextResponse.json({
      logs: logs || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      stats: stats && stats[0] ? stats[0] : {
        total_sent: 0,
        total_failed: 0,
        total_opened: 0,
        total_clicked: 0,
        success_rate: 0
      }
    });

  } catch (error: any) {
    console.error('Error in email logs API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch email logs' },
      { status: 500 }
    );
  }
}

// Add CORS headers
export async function OPTIONS(request: Request) {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}
