import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper function to fetch all records from a table using pagination
async function fetchAllRecords(
	tableName: string,
	selectQuery: string,
	batchSize: number = 1000
) {
	let allRecords: any[] = [];
	let from = 0;
	let hasMore = true;

	while (hasMore) {
		const { data, error, count } = await supabase
			.from(tableName)
			.select(selectQuery, { count: 'exact' })
			.range(from, from + batchSize - 1);

		if (error) {
			console.error(`Error fetching ${tableName}:`, error);
			break;
		}

		if (data) {
			allRecords = allRecords.concat(data);
		}

		// Check if we have more records
		if (count !== null && from + batchSize >= count) {
			hasMore = false;
		} else if (!data || data.length < batchSize) {
			hasMore = false;
		}

		from += batchSize;
	}

	return allRecords;
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const startDate = searchParams.get('startDate');
		const endDate = searchParams.get('endDate');
		const clientId = searchParams.get('clientId');
		const platform = searchParams.get('platform');

		// Get individual metrics using RPC functions
		const { data: uniqueLeadsConnected, error: uniqueLeadsConnectedError } =
			await supabase.rpc('get_unique_leads_connected');
		const platformFilter = platform && platform !== 'all' ? platform : null;
		const { data: totalEmailsSent, error: totalEmailsError } =
			await supabase.rpc('get_total_emails_sent', { platform: platformFilter });
		const { data: totalReplies, error: totalRepliesError } = await supabase.rpc(
			'get_total_replies',
			{ platform: platformFilter }
		);
		const { data: totalBounce, error: totalBounceError } = await supabase.rpc(
			'get_bounced_emails',
			{ platform: platformFilter }
		);
		const { data: bounceRate, error: bounceRateError } = await supabase.rpc(
			'get_bounced_rate',
			{ platform: platformFilter }
		);
		const { data: positiveReplies, error: positiveRepliesError } =
			await supabase.rpc('get_positive_replies', { platform: platformFilter });

		const { data: positiveRepliesRate, error: positiveRepliesRateError } =
			await supabase.rpc('get_positive_replies_rate', {
				platform: platformFilter,
			});

		// Log any errors
		[
			uniqueLeadsConnectedError,
			totalEmailsError,
			totalRepliesError,
			totalBounceError,
			bounceRateError,
			positiveRepliesError,
			positiveRepliesRateError,
		].forEach((error) => {
			if (error) console.error('RPC Error:', error);
		});

		// Calculate rates manually as fallback
		const replyRate =
			totalEmailsSent > 0 ? (totalReplies / totalEmailsSent) * 100 : 0;

		// Compute send → positive ratio from filtered values
		const sendPositiveRatio =
			totalEmailsSent > 0 && positiveReplies > 0
				? `${Math.round(totalEmailsSent / positiveReplies)}:1`
				: '0:0';

		return NextResponse.json({
			success: true,
			data: {
				totalEmailsSent,
				uniqueLeadsConnected,
				totalReplies,
				replyRate,
				totalBounce,
				bounceRate,
				positiveReplies,
				positiveRepliesRate,
				sendPositiveRatio,
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

// const { count: leadsData, error: leadsError } = await supabase
// 	.from('Leads')
// 	.select('*', { count: 'exact', head: true });

// if (leadsError) {
// 	console.error('Error fetching leads data:', leadsError);
// }
