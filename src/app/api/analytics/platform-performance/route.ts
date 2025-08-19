import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const startDate = searchParams.get('startDate');
		const endDate = searchParams.get('endDate');
		const clientId = searchParams.get('clientId');
		const platform = searchParams.get('platform');

		// Get platform performance data using individual RPC functions
		const [bisonResult, instantlyResult] = await Promise.all([
			supabase.rpc('get_bison_performance'),
			supabase.rpc('get_instantly_performance'),
		]);

		// Check for errors
		if (bisonResult.error) {
			console.error('Error fetching Bison data:', bisonResult.error);
		}
		if (instantlyResult.error) {
			console.error('Error fetching Instantly data:', instantlyResult.error);
		}
		// Consolidate all platform data (and optionally filter by a selected platform)
		let allPlatformData = [
			...(bisonResult.data || []),
			...(instantlyResult.data || []),
		];
		if (platform && platform !== 'all') {
			const normalized = platform.toLowerCase();
			allPlatformData = allPlatformData.filter((p: any) =>
				(p.platform || '').toString().toLowerCase().includes(normalized)
			);
		}

		// Transform data to match the expected format
		const formattedPlatformData = allPlatformData.map((platform: any) => ({
			platform: platform.platform,
			sends: platform.sends || 0,
			replies: platform.replies || 0,
			replyRate: platform.reply_rate || 0,
			bounceRate: platform.bounce_rate || 0,
			leads: platform.leads || 0,
			positiveRate: platform.positive_rate || 0,
			campaigns: platform.campaigns || 0,
		}));

		return NextResponse.json({
			success: true,
			data: formattedPlatformData,
			rawData: {
				bison: bisonResult.data,
				instantly: instantlyResult.data,
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
