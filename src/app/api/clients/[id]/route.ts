import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const clientId = parseInt(params.id);

		if (isNaN(clientId)) {
			return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
		}

		// Fetch client detail analytics from materialized view
		const { data, error } = await supabase.rpc('get_client_detail_analytics', {
			client_id_filter: clientId,
		});

		if (error) {
			console.error('Database error:', error);
			return NextResponse.json(
				{ error: 'Failed to fetch client data' },
				{ status: 500 }
			);
		}

		if (!data || data.length === 0) {
			return NextResponse.json({ error: 'Client not found' }, { status: 404 });
		}

		const clientData = data[0];

		// Transform the data for frontend consumption
		const transformedData = {
			// Basic client info
			client: {
				id: clientData.client_id,
				name: clientData.client_name,
				domain: clientData.client_domain,
				email: clientData.client_email,
				phone: clientData.client_phone,
				contactTitle: clientData.contact_title,
				industry: clientData.industry,
				services: clientData.services,
				onboardingDate: clientData.onboarding_date,
			},

			// KPI Metrics
			kpiData: [
				{
					id: 'emails-sent',
					label: 'Emails Sent',
					value: clientData.total_emails_sent,
					format: 'number',
					icon: 'EnvelopeSolidIcon',
					color: 'primary',
				},

				{
					id: 'total-replies',
					label: 'Total Replies',
					value: clientData.total_replies,
					format: 'number',
					icon: 'CheckCircleIcon',
					color: 'success',
				},
				{
					id: 'reply-rate',
					label: 'Reply Rate',
					value: clientData.reply_rate,
					format: 'percentage',
					icon: 'EnvelopeIcon',
					color: 'primary',
				},
				{
					id: 'positive-rate',
					label: 'Positive Reply Rate',
					value: clientData.positive_reply_rate,
					format: 'percentage',
					icon: 'CheckCircleSolidIcon',
					color: 'secondary',
				},
				{
					id: 'bounce-rate',
					label: 'Bounce Rate',
					value: clientData.bounce_rate,
					format: 'percentage',
					icon: 'ExclamationTriangleIcon',
					color: 'warning',
				},
			],

			// Campaign data
			campaigns: clientData.campaigns_data || [],

			// Recent replies
			recentReplies: clientData.recent_replies || [],

			// Daily trends for charts
			dailyTrends: clientData.daily_trends || [],

			// Platform breakdown
			platformBreakdown: {
				bison: {
					sends: clientData.bison_sends,
					replies: clientData.bison_replies,
					positive: clientData.bison_positive,
				},
				instantly: {
					sends: clientData.instantly_sends,
					replies: clientData.instantly_replies,
					positive: clientData.instantly_positive,
				},
			},

			// Activity summary
			activity: {
				totalCampaigns: clientData.total_campaigns,
				uniqueLeads: clientData.unique_leads_contacted,
				platformsUsed: clientData.platforms_used,
				firstSendDate: clientData.first_send_date,
				lastSendDate: clientData.last_send_date,
				avgDailySends: clientData.avg_daily_sends,

				// Calculate additional activity metrics
				daysSinceLastActivity: clientData.last_send_date
					? Math.ceil(
							(new Date().getTime() -
								new Date(clientData.last_send_date).getTime()) /
								(1000 * 60 * 60 * 24)
					  )
					: null,
				avgRepliesPerDay:
					clientData.total_replies &&
					clientData.first_send_date &&
					clientData.last_send_date
						? clientData.total_replies /
						  Math.max(
								1,
								Math.ceil(
									(new Date(clientData.last_send_date).getTime() -
										new Date(clientData.first_send_date).getTime()) /
										(1000 * 60 * 60 * 24)
								)
						  )
						: null,
				mostActiveHour: calculateMostActiveHour(clientData.daily_trends || []),
			},
		};

		return NextResponse.json(transformedData);
	} catch (error) {
		console.error('API error:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

function calculateMostActiveHour(dailyTrends: any[]): string {
	if (!dailyTrends || dailyTrends.length === 0) return '';

	// Find day with highest sends
	const mostActiveDay = dailyTrends.reduce((best, current) => {
		return (current.sends || 0) > (best.sends || 0) ? current : best;
	});

	if (mostActiveDay && mostActiveDay.sends > 0) {
		// For now, return the date. In a real implementation, you'd have hourly data
		const date = new Date(mostActiveDay.date);
		return `${date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
		})}`;
	}

	return '';
}
