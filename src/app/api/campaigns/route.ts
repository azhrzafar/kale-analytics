import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
	try {
		const requestStart = Date.now();
		const { searchParams } = new URL(request.url);

		// Query parameters
		const searchTerm = searchParams.get('search') || '';
		const statusFilter = searchParams.get('status') || 'all';
		const platformFilter = searchParams.get('platform') || 'all';
		const clientFilter = searchParams.get('clientId') || 'all';
		const sortBy = searchParams.get('sortBy') || 'created_at';
		const sortOrder = searchParams.get('sortOrder') || 'desc';
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '50');
		const offset = (page - 1) * limit;

		let cleints = await supabase
			.from('clients')
			.select('*', { count: 'exact' });
		// Build the query
		let query = supabase.from('campaigns').select('*', { count: 'exact' });

		// Apply search filter
		if (searchTerm) {
			query = query.or(
				`campaign_name.ilike.%${searchTerm}%,campaign_id.ilike.%${searchTerm}%`
			);
		}

		// Apply status filter
		if (statusFilter !== 'all') {
			query = query.eq('status', statusFilter);
		}

		// Apply platform filter
		if (platformFilter !== 'all') {
			query = query.eq('platform', platformFilter);
		}

		// Apply client filter
		if (clientFilter !== 'all') {
			query = query.eq('client_id', clientFilter);
		}

		// Apply sorting
		const ascending = sortOrder === 'asc';
		query = query.order(sortBy, { ascending });

		// Apply pagination
		query = query.range(offset, offset + limit - 1);

		// Execute query
		const { data: campaigns, error: campaignsError, count } = await query;

		if (campaignsError) {
			console.error('Error fetching campaigns:', campaignsError);
			return NextResponse.json(
				{ success: false, error: 'Failed to fetch campaigns' },
				{ status: 500 }
			);
		}

		// Transform data for frontend (field names match your new schema)
		const transformedCampaigns =
			campaigns?.map((campaign: any) => ({
				id: campaign.id,
				campaignId: campaign.campaign_id,
				name: campaign.campaign_name,
				client_id: campaign.client_id,
				platform: campaign.platform,
				status: campaign.status,
				sent: campaign.sent,
				connected: campaign.contacted, // Note: keeping 'connected' for frontend compatibility
				opens: campaign.opens,
				replies: campaign.replies,
				bounced: campaign.bounced,
				interested: campaign.interested,
				client_name: campaign.client_name,
				created_at: campaign.created_at,
				updated_at: campaign.updated_at,
			})) || [];

		const responseTime = Date.now() - requestStart;

		return NextResponse.json({
			success: true,
			data: transformedCampaigns,
			pagination: {
				page,
				limit,
				total: count || 0,
				totalPages: Math.ceil((count || 0) / limit),
			},
			meta: {
				responseTime: `${responseTime}ms`,
				timestamp: new Date().toISOString(),
			},
		});
	} catch (error) {
		console.error('Error in campaigns API:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
