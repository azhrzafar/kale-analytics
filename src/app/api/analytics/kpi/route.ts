import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const startDate = searchParams.get('startDate');
		const endDate = searchParams.get('endDate');
		const clientId = searchParams.get('clientId');
		const platform = searchParams.get('platform');

		// Build args for the filtered KPI function
		const args: Record<string, any> = {};
		if (startDate) args.start_date = new Date(startDate);
		if (endDate) args.end_date = new Date(endDate);
		if (platform && platform !== 'all') args.platform_filter = platform;
		if (clientId && clientId !== 'all')
			args.client_id_filter = parseInt(clientId);

		// Use the new filtered KPI function from materialized views
		const { data: kpiData, error } = await supabase.rpc(
			'get_kpi_overview_filtered',
			args
		);

		if (error) {
			console.error('Error fetching KPI data:', error);
			return NextResponse.json(
				{ success: false, error: error.message },
				{ status: 500 }
			);
		}

		// The function returns a single row with all KPI metrics
		const kpi = kpiData?.[0] || {
			total_emails_sent: 0,
			total_replies: 0,
			reply_rate: 0,
			total_bounce: 0,
			bounce_rate: 0,
			positive_replies: 0,
			positive_replies_rate: 0,
			unique_leads_connected: 0,
			send_positive_ratio: '0:0',
		};

		return NextResponse.json({
			success: true,
			data: {
				totalEmailsSent: kpi.total_emails_sent || 0,
				uniqueLeadsConnected: kpi.unique_leads_connected || 0,
				totalReplies: kpi.total_replies || 0,
				replyRate: kpi.reply_rate || 0,
				totalBounce: kpi.total_bounce || 0,
				bounceRate: kpi.bounce_rate || 0,
				positiveReplies: kpi.positive_replies || 0,
				positiveRepliesRate: kpi.positive_replies_rate || 0,
				sendPositiveRatio: kpi.send_positive_ratio || '0:0',
			},
			filters: {
				startDate,
				endDate,
				clientId,
				platform,
			},
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error('API Error:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
