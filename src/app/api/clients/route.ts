import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
	try {
		const requestStart = Date.now();

		const { searchParams } = new URL(request.url);
		const searchTerm = searchParams.get('search') || '';
		const sortBy = searchParams.get('sortBy') || 'emailsSent';
		const sortOrder = searchParams.get('sortOrder') || 'desc';

		const { data: clientStats, error: statsError } = await supabase
			.from('client_email_stats_mv')
			.select('*')
			.order('emails_sent', { ascending: false });

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
		// Combine client stats with client details
		const clientsWithStats =
			clientStats?.map((stat: any) => {
				return {
					id: stat.client_id.toString(),
					name: stat.company_name || '',
					onboardDate: stat.onboarding_date || '',
					services: stat.services ? stat.services.split(',') : [],
					emailsSent: stat.emails_sent || 0,
					replies: stat.replies_received || 0,
					replyRate: stat.reply_rate || 0,
					positiveReplies: stat.positive_replies || 0,
					positiveReplyRate: stat.positive_reply_rate || 0,
					bounces: stat.bounces || 0,
					bounceRate: stat.bounce_rate || 0,
					uniqueLeads: stat.leads_generated || 0,
					// Additional client fields
					domain: stat.domain || '',
					primaryEmail: stat.primary_email || '',
					industry: stat.industry || '',
					personal_sending_capacity_per_day:
						stat.personal_sending_capacity_per_day || 0,
					work_sending_capacity_per_day:
						stat.work_sending_capacity_per_day || 0,
					// Additional stats
					platforms_used: stat.platforms_used || 0,
					first_send_date: stat.first_send_date || '',
					last_send_date: stat.last_send_date || '',
					avg_daily_sends: stat.avg_daily_sends || 0,
					bison_sends: stat.bison_sends || 0,
					instantly_sends: stat.instantly_sends || 0,
					bison_replies: stat.bison_replies || 0,
					instantly_replies: stat.instantly_replies || 0,
					bison_positive: stat.bison_positive || 0,
					instantly_positive: stat.instantly_positive || 0,
					total_campaigns: stat.total_campaigns || 0,
				};
			}) || [];

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
					comparison = b.emailsSent - a.emailsSent;
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
