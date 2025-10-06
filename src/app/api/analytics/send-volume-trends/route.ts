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
		const { data, error } = await supabase.rpc('get_daily_stats_grouped', {
			_client_id: clientId,
			_platform: platform,
			_start_date: startDate,
			_end_date: endDate,
		});

		if (error) {
			console.error('Error fetching grouped data:', error);
		}

		// Map RPC result to desired shape
		const sendVolumeTrends = (data || []).map((row: any) => ({
			date: row.activity_date,
			sends: Number(row.total_emails ?? 0),
			replies: Number(row.total_replies ?? 0),
			positive: Number(row.total_positive ?? 0),
			bounces: Number(row.total_bounces ?? 0),
		}));

		if (error) {
			console.error('Error fetching send volume trends:', error);
			return NextResponse.json(
				{ success: false, error: error.message },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			data: sendVolumeTrends || [],
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
