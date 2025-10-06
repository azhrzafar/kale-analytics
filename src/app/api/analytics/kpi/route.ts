import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const startDateRaw = searchParams.get('startDate') || null;
		const endDateRaw = searchParams.get('endDate') || null;

		// Convert to ISO (YYYY-MM-DD)
		const startDate = startDateRaw
			? new Date(startDateRaw).toISOString().split('T')[0]
			: undefined;
		const endDate = endDateRaw
			? new Date(endDateRaw).toISOString().split('T')[0]
			: undefined;

		const platform =
			searchParams.get('platform') === 'all'
				? null
				: searchParams.get('platform');
		const clientId =
			searchParams.get('clientId') === 'all'
				? null
				: searchParams.get('clientId');

		const { data, error } = await supabase.rpc('get_kpi_totals', {
			_client_id: clientId ?? null,
			_platform: platform ?? null,
			_start_date: startDate ?? null,
			_end_date: endDate ?? null,
		});

		if (error) {
			console.error('Error fetching KPI data:', error);
			return NextResponse.json(
				{ success: false, error: error.message },
				{ status: 500 }
			);
		}

		const kpi = data[0];

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
