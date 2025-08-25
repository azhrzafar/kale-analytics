import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const startDate = searchParams.get('startDate');
		const endDate = searchParams.get('endDate');
		const platform = searchParams.get('platform');
		const clientId = searchParams.get('clientId');
		const searchTerm = searchParams.get('search') || '';
		const sortBy = searchParams.get('sortBy') || 'replyRate';
		const sortOrder = searchParams.get('sortOrder') || 'desc';

		// Build args for the filtered client statistics function
		const args: Record<string, any> = {};
		if (startDate) args.start_date = startDate;
		if (endDate) args.end_date = endDate;
		if (platform && platform !== 'all') args.platform_filter = platform;
		if (clientId && clientId !== 'all')
			args.client_id_filter = parseInt(clientId);

		// Use the materialized view backed function for client statistics
		const { data: clientStats, error } = await supabase.rpc(
			'get_client_statistics_mat'
		);

		if (error) {
			console.error('Error fetching client statistics:', error);
			return NextResponse.json(
				{ success: false, error: error.message },
				{ status: 500 }
			);
		}

		// Get additional client details
		const { data: clients, error: clientsError } = await supabase
			.from('Clients')
			.select('*')
			.order('id', { ascending: true });

		if (clientsError) {
			console.error('Error fetching clients:', clientsError);
			return NextResponse.json(
				{ success: false, error: 'Failed to fetch clients' },
				{ status: 500 }
			);
		}

		// Combine client stats with client details
		const clientsWithStats = clientStats.map((stat: any) => {
			const client = clients.find((c: any) => c.id === stat.client_id);

			return {
				id: stat.client_id.toString(),
				name: stat.client_name || '',
				onboardDate: stat.client_onboard_date || '',
				services: stat.client_services ? stat.client_services.split(',') : [],
				emailsSent: stat.emails_sent || 0,
				replies: stat.replies || 0,
				replyRate: stat.reply_rate || 0,
				positiveReplies: stat.positive_replies || 0,
				positiveReplyRate: stat.positive_reply_rate || 0,
				bounces: stat.bounces || 0,
				bounceRate: stat.bounce_rate || 0,
				uniqueLeads: stat.unique_leads || 0,
				// Additional client fields
				domain: stat.client_domain || '',
				primaryEmail: client?.['Primary Email'] || '',
				primaryNumber: client?.['Primary Number'] || '',
				contactTitle: client?.['Contact Title'] || '',
				industry: client?.Industry || '',
				instantlyApi: client?.instantly_api || '',
				bisonApi: client?.bison_api || '',
				instantlyApiV2: client?.instantly_api_v2 || '',
			};
		});

		// Filter by search term
		let filteredClients = clientsWithStats;
		if (searchTerm) {
			filteredClients = clientsWithStats.filter(
				(client: any) =>
					client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					client.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
					client.industry.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		// Sort the results
		filteredClients.sort((a: any, b: any) => {
			const aValue = a[sortBy] || 0;
			const bValue = b[sortBy] || 0;

			if (sortOrder === 'asc') {
				return aValue > bValue ? 1 : -1;
			} else {
				return aValue < bValue ? 1 : -1;
			}
		});

		return NextResponse.json({
			success: true,
			data: filteredClients,
			filters: {
				startDate,
				endDate,
				platform,
				clientId,
				searchTerm,
				sortBy,
				sortOrder,
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
