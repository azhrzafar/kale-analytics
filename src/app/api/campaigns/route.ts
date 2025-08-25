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
		const sortBy = searchParams.get('sortBy') || 'replyRate';
		const sortOrder = searchParams.get('sortOrder') || 'desc';
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '50');
		const offset = (page - 1) * limit;

		// Get additional client details
		const { data: allCampaigns, error: clientsError } = await supabase
			.from('Campaigns')
			.select('*')
			.order('id', { ascending: true });

		if (clientsError) {
			console.error('Error fetching clients:', clientsError);
			return NextResponse.json(
				{ success: false, error: 'Failed to fetch clients' },
				{ status: 500 }
			);
		}

		// Transform data for frontend
		const transformedCampaigns = allCampaigns?.map((campaign: any) => ({
			id: campaign.id,
			campaignId: campaign.campaign_id,
			name: campaign.campaign_name,
			client_id: campaign.client_id,
			platform: campaign.platform,
			status: campaign.status,
			sent: campaign.sent,
			connected: campaign.contacted,
			opens: campaign.opens,
			replies: campaign.replies,
			bounced: campaign.bounced,
			interested: campaign.interested,
			client_name: campaign.client_name,
		}));

		const responseTime = Date.now() - requestStart;

		return NextResponse.json({
			success: true,
			data: transformedCampaigns,
			pagination: {
				page,
				limit,
				total: allCampaigns.length || 0,
				totalPages: Math.ceil((allCampaigns.length || 0) / limit),
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
