import { NextResponse } from 'next/server';
import { getAuditLogs } from '@/lib/admin/audit-log';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const adminId = searchParams.get('adminId') || undefined;
    const targetUserId = searchParams.get('targetUserId') || undefined;
    const actionType = searchParams.get('actionType') || undefined;
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    // Fetch audit logs with filters
    const { logs, total } = await getAuditLogs({
      adminId,
      targetUserId,
      actionType,
      dateFrom,
      dateTo,
      limit,
      offset
    });

    return NextResponse.json({
      success: true,
      logs,
      total,
      limit,
      offset
    });

  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
