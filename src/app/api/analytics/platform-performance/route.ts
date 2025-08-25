import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const startDate = searchParams.get('startDate');
		const endDate = searchParams.get('endDate');
		const clientId = searchParams.get('clientId');
		const platform = searchParams.get('platform');

		// Build args for the filtered platform comparison function
		const args: Record<string, any> = {};
		if (startDate) args.start_date = new Date(startDate);
		if (endDate) args.end_date = new Date(endDate);
		if (clientId && clientId !== 'all')
			args.client_id_filter = parseInt(clientId);

		// Use the new filtered platform comparison function from materialized views
		const { data: platformData, error } = await supabase.rpc(
			'get_platform_comparison_filtered',
			args
		);

		if (error) {
			console.error('Error fetching platform performance data:', error);
			return NextResponse.json(
				{ success: false, error: error.message },
				{ status: 500 }
			);
		}

		// Filter by platform if specified (client-side filtering for consistency)
		let filteredPlatformData = platformData || [];
		if (platform && platform !== 'all') {
			const normalized = platform.toLowerCase();
			filteredPlatformData = filteredPlatformData.filter((p: any) =>
				(p.platform || '').toString().toLowerCase().includes(normalized)
			);
		}

		// Transform data to match the expected format
		const formattedPlatformData = filteredPlatformData.map((platform: any) => ({
			platform: platform.platform,
			sends: platform.sends || 0,
			replies: platform.replies || 0,
			replyRate: platform.reply_rate || 0,
			bounceRate: platform.bounce_rate || 0,
			leads: platform.leads || 0,
			positiveRate: platform.positive_rate || 0,
			campaigns: platform.campaigns || 0,
			positive: platform.positive || 0,
			bounces: platform.bounces || 0,
		}));

		return NextResponse.json({
			success: true,
			data: formattedPlatformData,
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
