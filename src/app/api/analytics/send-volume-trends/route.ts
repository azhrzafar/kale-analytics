import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const startDate = searchParams.get('startDate') || undefined;
		const endDate = searchParams.get('endDate') || undefined;
		const platform = searchParams.get('platform');
		const clientId = searchParams.get('clientId');

		// Build args for the filtered send volume trends function
		const args: Record<string, any> = {};
		if (startDate) args.start_date = new Date(startDate);
		if (endDate) args.end_date = new Date(endDate);
		if (platform && platform !== 'all') args.platform_filter = platform;
		if (clientId && clientId !== 'all')
			args.client_id_filter = parseInt(clientId);

		// Use the new filtered send volume trends function from materialized views
		const { data, error } = await supabase.rpc(
			'get_send_volume_trend_filtered',
			args
		);

		if (error) {
			console.error('Error fetching send volume trends:', error);
			return NextResponse.json(
				{ success: false, error: error.message },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			data: data || [],
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
