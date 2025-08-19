import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Create a connection pool for better performance
const pool = new Pool({
	connectionString: process.env.SUPABASE_DB_URL || process.env.DATABASE_URL, // direct connection string
	max: 20, // maximum number of clients in pool
	idleTimeoutMillis: 30000, // close idle clients after 30 seconds
	connectionTimeoutMillis: 2000, // return error after 2 seconds if connection could not be established
	statement_timeout: 300000, // 5 minutes statement timeout
	ssl:
		process.env.NODE_ENV === 'production'
			? { rejectUnauthorized: false }
			: false,
});

export async function GET(request: NextRequest) {
	const client = await pool.connect();

	try {
		const { searchParams } = new URL(request.url);
		const searchTerm = searchParams.get('search') || '';
		const sortBy = searchParams.get('sortBy') || 'replyRate';
		const sortOrder = searchParams.get('sortOrder') || 'desc';

		// Read from the materialized view-backed function
		const res = await client.query('SELECT * FROM get_client_statistics_mat()');

		if (!res.rows || res.rows.length === 0) {
			return NextResponse.json({
				success: true,
				data: [],
				total: 0,
				timestamp: new Date().toISOString(),
			});
		}

		// Transform the database results to match the expected format
		const clientsWithStats = res.rows.map((stat) => {
			// Mock change percentages for now (in a real scenario, you'd compare with previous period)
			const replyRateChange = Math.random() * 10 - 5; // -5 to +5
			const positiveRepliesChange = Math.random() * 10 - 5;
			const bounceRateChange = Math.random() * 5 - 2.5; // -2.5 to +2.5
			const emailsSentChange = Math.random() * 20 - 10; // -10 to +10
			const uniqueLeadsChange = Math.random() * 15 - 7.5; // -7.5 to +7.5

			return {
				id: stat.client_id?.toString() || '',
				name: stat.client_name || '',
				onboardDate: stat.client_onboard_date || '',
				services: stat.client_services ? stat.client_services.split(',') : [],
				replyRate: parseFloat(stat.reply_rate?.toString() || '0'),
				replyRateChange: parseFloat(replyRateChange.toFixed(1)),
				positiveReplies: parseInt(stat.positive_replies) || 0,
				positiveRepliesChange: parseFloat(positiveRepliesChange.toFixed(1)),
				bounceRate: parseFloat(stat.bounce_rate?.toString() || '0'),
				bounceRateChange: parseFloat(bounceRateChange.toFixed(1)),
				emailsSent: parseInt(stat.emails_sent) || 0,
				emailsSentChange: parseFloat(emailsSentChange.toFixed(1)),
				uniqueLeads: parseInt(stat.unique_leads) || 0,
				uniqueLeadsChange: parseFloat(uniqueLeadsChange.toFixed(1)),
				// Additional client fields
				domain: stat.client_domain || '',
				primaryEmail: '', // Not available in this query, would need separate query
				primaryNumber: '', // Not available in this query, would need separate query
				contactTitle: '', // Not available in this query, would need separate query
				industry: '', // Not available in this query, would need separate query
				instantlyApi: '', // Not available in this query, would need separate query
				bisonApi: '', // Not available in this query, would need separate query
				instantlyApiV2: '', // Not available in this query, would need separate query
			};
		});

		// Filter by search term
		let filteredClients = clientsWithStats;
		if (searchTerm) {
			filteredClients = clientsWithStats.filter(
				(client) =>
					client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					client.domain.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		// Sort the results
		filteredClients.sort((a, b) => {
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
		});
	} catch (error) {
		console.error('Database Error:', error);
		return NextResponse.json(
			{
				error: 'Database connection error',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	} finally {
		client.release();
	}
}

// Optional: Health check endpoint
export async function HEAD() {
	const client = await pool.connect();
	try {
		await client.query('SELECT 1');
		client.release();
		return new Response(null, { status: 200 });
	} catch (error) {
		client.release();
		return new Response(null, { status: 500 });
	}
}
