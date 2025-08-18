import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const startDate = searchParams.get('startDate') || undefined;
		const endDate = searchParams.get('endDate') || undefined;
		const platform = searchParams.get('platform');

		// Build args only for provided values to let SQL defaults kick in
		const args: Record<string, any> = {};
		if (startDate) args.start_date = startDate;
		if (endDate) args.end_date = endDate;
		if (platform && platform !== 'all') args.platform_filter = platform;

		const { data, error } = await supabase.rpc('get_send_volume_trends', args);

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
