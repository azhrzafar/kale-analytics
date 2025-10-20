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

		const { data: clientData, error } = await supabase
			.from('client_email_stats_mv')
			.select('*')
			.eq('client_id', clientId)
			.single();
		if (error) {
			console.error('Database error:', error);
			return NextResponse.json(
				{ error: 'Failed to fetch client data' },
				{ status: 500 }
			);
		}

		const personalDailyCapacity = Number(
			clientData.personal_sending_capacity_per_day ?? 0
		);
		const workDailyCapacity = Number(
			clientData.work_sending_capacity_per_day ?? 0
		);
		const totalDailyCapacity = personalDailyCapacity + workDailyCapacity;

		// Date math (inclusive days)
		const today = new Date();
		const defaultStart = new Date(today);
		defaultStart.setDate(defaultStart.getDate() - 6);
		const startDateObj = clientData.first_send_date
			? new Date(clientData.first_send_date)
			: defaultStart;
		const endDateObj = clientData.last_send_date
			? new Date(clientData.last_send_date)
			: today;
		const startTs = new Date(startDateObj.toDateString()).getTime();
		const endTs = new Date(endDateObj.toDateString()).getTime();
		const numDays =
			startTs <= endTs
				? Math.floor((endTs - startTs) / (1000 * 60 * 60 * 24)) + 1
				: 0;

		const expectedPersonalSends = personalDailyCapacity * numDays;
		const expectedWorkSends = workDailyCapacity * numDays;
		const expectedTotalSends = totalDailyCapacity * numDays;

		// Execute query
		const { data: campaigns, error: campaignsError } = await supabase
			.from('campaigns')
			.select('*', { count: 'exact' })
			.eq('client_id', clientId);

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
				campaign_id: campaign.camp_id,
				campaign_name: campaign.campaign_name,
				platform: campaign.platform,
				status: campaign.status,
				sends: campaign.sent,
				leads: campaign.contacted, // Note: keeping 'connected' for frontend compatibility
				replies: campaign.replies,
				bounced: campaign.bounced,
				positive: campaign.interested,
				reply_rate:
					campaign.sent > 0 ? (campaign.replies / campaign.sent) * 100 : 0,
				positive_rate:
					campaign.replies > 0
						? (campaign.interested / campaign.replies) * 100
						: 0,
				bounce_rate:
					campaign.sent > 0 ? (campaign.bounced / campaign.sent) * 100 : 0,
				send_to_positive_ratio:
					campaign.interested > 0 ? campaign.sent / campaign.interested : 0,
			})) || [];
		console.log({ clientData });
		// Transform the data for frontend consumption
		const transformedData = {
			// Basic client info
			client: {
				id: clientData.client_id,
				name: clientData.company_name,
				domain: clientData.domain,
				email: clientData.primary_email,
				phone: clientData.client_phone,
				contactTitle: clientData.contact_title,
				industry: clientData.industry,
				services: clientData.services,
				onboardingDate: clientData.onboarding_date,
				personal_sending_capacity_per_day:
					clientData.personal_sending_capacity_per_day,
				work_sending_capacity_per_day: clientData.work_sending_capacity_per_day,
			},

			// KPI Metrics
			kpiData: [
				{
					id: 'emails-sent',
					label: 'Emails Sent',
					value: clientData.emails_sent,
					format: 'number',
					icon: 'EnvelopeSolidIcon',
					color: 'primary',
				},
				{
					id: 'emails-sent-capacity',
					label: 'Utilization',
					value: (clientData.total_emails_sent / expectedTotalSends) * 100,
					subValue: `Max Capacity: ${expectedTotalSends}`,
					format: 'percentage',
					icon: 'CheckCircleIcon',
					color: 'warning',
				},
				// {
				// 	id: 'total-replies',
				// 	label: 'Total Replies',
				// 	value: clientData.total_replies,
				// 	format: 'number',
				// 	icon: 'CheckCircleIcon',
				// 	color: 'success',
				// },
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
					color: 'danger',
				},
			],

			// Campaign data
			campaigns: transformedCampaigns || [],

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

			// Capacity (manual-first)
			capacity: {
				personalDaily: personalDailyCapacity,
				workDaily: workDailyCapacity,
				totalDaily: totalDailyCapacity,
				totalDays: numDays,
				expected: {
					start: startDateObj.toISOString().slice(0, 10),
					end: endDateObj.toISOString().slice(0, 10),
					days: numDays,
					instantly: expectedPersonalSends,
					bison: expectedWorkSends,
					total: expectedTotalSends,
				},
			},

			// Activity summary
			activity: {
				totalCampaigns: clientData.total_campaigns,
				uniqueLeads: clientData.leads_generated,
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

export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const clientId = parseInt(params.id);
		if (isNaN(clientId)) {
			return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
		}

		const body = await request.json();
		const personal = Number(body?.personal_sending_capacity_per_day);
		const work = Number(body?.work_sending_capacity_per_day);

		if (
			(Number.isNaN(personal) && Number.isNaN(work)) ||
			(personal !== undefined && personal < 0) ||
			(work !== undefined && work < 0)
		) {
			return NextResponse.json(
				{ error: 'Provide non-negative numbers for at least one capacity' },
				{ status: 400 }
			);
		}

		const updatePayload: Record<string, number> = {};
		if (!Number.isNaN(personal)) {
			updatePayload['personal_sending_capacity_per_day'] = personal;
		}
		if (!Number.isNaN(work)) {
			updatePayload['work_sending_capacity_per_day'] = work;
		}

		const { error } = await supabase
			.from('clients')
			.update(updatePayload)
			.eq('id', clientId);

		if (error) {
			console.error('Failed to update client capacities', error);
			return NextResponse.json(
				{ error: 'Failed to update capacities' },
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true });
	} catch (err) {
		console.error('PATCH error:', err);
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
