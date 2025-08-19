import { NextRequest, NextResponse } from 'next/server';
import { createOptimizedSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
	try {
		const requestStart = Date.now();

		const { searchParams } = new URL(request.url);
		const searchTerm = searchParams.get('search') || '';
		const sortBy = searchParams.get('sortBy') || 'replyRate';
		const sortOrder = searchParams.get('sortOrder') || 'desc';

		// Use the materialized-view backed RPC for client statistics
		const { data: clientStats, error: statsError } =
			await createOptimizedSupabaseClient().rpc('get_client_statistics_mat');

		if (statsError) {
			console.error('Error fetching client statistics:', {
				statsError,
				durationSeconds: (Date.now() - requestStart) / 1000,
			});
			return NextResponse.json(
				{ error: 'Failed to fetch client statistics' },
				{ status: 500 }
			);
		}

		// Get additional client details
		const { data: clients, error: clientsError } =
			await createOptimizedSupabaseClient()
				.from('Clients')
				.select('*')
				.order('id', { ascending: true });

		if (clientsError) {
			console.error('Error fetching clients:', clientsError);
			return NextResponse.json(
				{ error: 'Failed to fetch clients' },
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
			let comparison = 0;
			switch (sortBy) {
				case 'name':
					comparison = a.name.localeCompare(b.name);
					break;
				case 'replyRate':
					comparison = a.replyRate - b.replyRate;
					break;
				case 'positiveReplies':
					comparison = a.positiveReplies - b.positiveReplies;
					break;
				case 'bounceRate':
					comparison = a.bounceRate - b.bounceRate;
					break;
				case 'emailsSent':
					comparison = a.emailsSent - b.emailsSent;
					break;
				case 'uniqueLeads':
					comparison = a.uniqueLeads - b.uniqueLeads;
					break;
				default:
					comparison = a.replyRate - b.replyRate;
			}
			return sortOrder === 'asc' ? comparison : -comparison;
		});

		return NextResponse.json({
			success: true,
			data: filteredClients,
			total: filteredClients.length,
			timestamp: new Date().toISOString(),
			durationSeconds: (Date.now() - requestStart) / 1000,
		});
	} catch (error) {
		console.error('API Error:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
