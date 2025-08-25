import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const requestStart = Date.now();
		const idParam = params.id;

		if (!idParam || typeof idParam !== 'string') {
			return NextResponse.json(
				{ success: false, error: 'Invalid campaign id' },
				{ status: 400 }
			);
		}

		// Try lookup by campaign_id (external id)
		let { data: byExternal, error: byExternalErr } = await supabase
			.from('Campaigns')
			.select('*')
			.eq('campaign_id', idParam)
			.limit(1);

		let row = byExternal && byExternal.length > 0 ? byExternal[0] : null;

		// Fallback: numeric id lookup
		if (!row && /^\d+$/.test(idParam)) {
			const numericId = parseInt(idParam, 10);
			const { data: byNumeric, error: byNumericErr } = await supabase
				.from('Campaigns')
				.select('*')
				.eq('id', numericId)
				.limit(1);
			row = byNumeric && byNumeric.length > 0 ? byNumeric[0] : null;
			if (byNumericErr) {
				console.error('Supabase error numeric:', byNumericErr);
			}
		}

		if (byExternalErr) {
			console.error('Supabase error external:', byExternalErr);
		}

		if (!row) {
			return NextResponse.json(
				{ success: false, error: 'Campaign not found' },
				{ status: 404 }
			);
		}

		const sent = Number(row.sent || 0);
		const replies = Number(row.replies || 0);
		const positive = Number(row.interested || 0);
		const bounced = Number(row.bounced || 0);
		const connected = Number(row.contacted || 0);
		const opens = Number(row.opens || 0);

		const safeRate = (num: number, den: number) =>
			den > 0 ? (num / den) * 100 : 0;

		const responsePayload = {
			id: String(row.id),
			campaignId: String(row.campaign_id),
			name: row.campaign_name,
			platform: row.platform,
			status: row.status || 'draft',
			workspace: row.client_name || '—',
			sent,
			replies,
			positiveReplies: positive,
			opens,
			leads: connected,
			bounces: bounced,
			replyRate: safeRate(replies, sent),
			positiveRate: safeRate(positive, replies),
			bounceRate: safeRate(bounced, sent),
			kpiData: [
				{
					id: 'sent',
					label: 'Emails Sent',
					value: sent,
					format: 'number',
					icon: 'EnvelopeSolidIcon',
					color: 'primary',
				},
				{
					id: 'opens',
					label: 'Opens',
					value: opens,
					format: 'number',
					icon: 'EnvelopeIcon',
					color: 'primary',
				},
				{
					id: 'replies',
					label: 'Replies',
					value: replies,
					format: 'number',
					icon: 'CheckCircleIcon',
					color: 'success',
				},
				{
					id: 'positive',
					label: 'Interested',
					value: positive,
					format: 'number',
					icon: 'CheckCircleSolidIcon',
					color: 'secondary',
				},
				{
					id: 'leads',
					label: 'Leads Contacted',
					value: connected,
					format: 'number',
					icon: 'UsersIcon',
					color: 'primary',
				},
				{
					id: 'bounced',
					label: 'Bounced',
					value: bounced,
					format: 'number',
					icon: 'ExclamationTriangleIcon',
					color: 'warning',
				},
				{
					id: 'replyRate',
					label: 'Reply Rate',
					value: safeRate(replies, sent),
					format: 'percentage',
					icon: 'EnvelopeIcon',
					color: 'primary',
				},
				{
					id: 'positiveRate',
					label: 'Positive Rate',
					value: safeRate(positive, replies),
					format: 'percentage',
					icon: 'CheckCircleSolidIcon',
					color: 'secondary',
				},
				{
					id: 'bounceRate',
					label: 'Bounce Rate',
					value: safeRate(bounced, sent),
					format: 'percentage',
					icon: 'ExclamationTriangleIcon',
					color: 'warning',
				},
			],
		};

		const responseTime = Date.now() - requestStart;

		return NextResponse.json({
			success: true,
			data: responsePayload,
			meta: {
				responseTime: `${responseTime}ms`,
				timestamp: new Date().toISOString(),
			},
		});
	} catch (error) {
		console.error('Error in campaign detail API:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
