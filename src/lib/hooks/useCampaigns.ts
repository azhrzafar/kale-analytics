import { useState, useCallback, useEffect } from 'react';

interface Campaign {
	id: string;
	campaignId: string;
	name: string;
	platform: string;
	status: 'active' | 'paused' | 'completed' | 'draft';
	workspace: string;
	client_id?: string;
	sent: number;
	replies: number;
	positiveReplies: number;
	replyRate: number;
	positiveRate: number;
	bounceRate: number;
	opens: number;
	leads: number;
}

interface CampaignDetail {
	id: string;
	campaignId: string;
	name: string;
	platform: string;
	status: 'active' | 'paused' | 'completed' | 'draft';
	workspace: string;
	sent: number;
	replies: number;
	positiveReplies: number;
	bounces: number;
	replyRate: number;
	positiveRate: number;
	bounceRate: number;
	uniqueLeads: number;
	sparklineData: number[];
	kpiData: Array<{
		id: string;
		label: string;
		value: number;
		format: 'number' | 'percentage';
		icon: string;
		color: string;
	}>;
	funnelData: Array<{
		stage: string;
		count: number;
		conversionRate: number;
		previousStage: string | null;
	}>;
	dailyTrends: Array<{
		date: string;
		sends: number;
		replies: number;
		positive: number;
		bounces: number;
	}>;
	recentReplies: Array<{
		reply_id: string;
		created_at: string;
		sentiment_label: string;
		lead_id: string;
		platform: string;
	}>;
	bounceData: Array<{
		reply_id: string;
		created_at: string;
		sentiment_label: string;
		lead_id: string;
	}>;
	leadEngagement: Array<{
		lead_id: string;
		lead_email: string;
		created_at: string;
		subject: string;
	}>;
	recentActivity: Array<{
		activityType: string;
		activityDate: string;
		leadEmail: string;
		sentiment?: string;
		subject?: string;
		platform: string;
	}>;
	deliverabilityMetrics: Array<{
		metricName: string;
		metricValue: number;
		metricRate: number;
		description: string;
	}>;
}

interface CampaignsResponse<TRow = any> {
	success: boolean;
	data: TRow[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
	meta: {
		responseTime: string;
		timestamp: string;
	};
}

// Shape returned by /api/campaigns
interface ApiCampaignRow {
	id: string | number;
	campaignId: string;
	name: string;
	client_id?: string | number;
	client_name?: string;
	platform: string;
	status: 'active' | 'paused' | 'completed' | 'draft' | string;
	sent?: number;
	connected?: number;
	opens?: number;
	replies?: number;
	bounced?: number;
	interested?: number;
}

interface CampaignDetailResponse {
	success: boolean;
	data: CampaignDetail;
	meta: {
		responseTime: string;
		timestamp: string;
	};
}

const transformPlatform = (platform: string) => {
	if (platform === 'Email Bison') return 'Bison';
	return platform;
};

export function useCampaigns() {
	const [campaigns, setCampaigns] = useState<Campaign[]>([]);
	const [campaignDetail, setCampaignDetail] = useState<CampaignDetail | null>(
		null
	);
	const [loading, setLoading] = useState(false);
	const [detailLoading, setDetailLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [detailError, setDetailError] = useState<string | null>(null);
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 50,
		total: 0,
		totalPages: 0,
	});
	const [filters, setFilters] = useState({
		search: '',
		status: 'all',
		platform: 'all',
		clientId: 'all',
		sortBy: 'replyRate' as
			| 'name'
			| 'replyRate'
			| 'positiveRate'
			| 'bounceRate'
			| 'sent'
			| 'createdDate',
		sortOrder: 'desc' as 'asc' | 'desc',
		page: 1,
		limit: 50,
	});

	const fetchCampaigns = useCallback(
		async (
			params: {
				search?: string;
				status?: string;
				platform?: string;
				clientId?: string;
				sortBy?: string;
				sortOrder?: string;
				page?: number;
				limit?: number;
			} = {}
		) => {
			setLoading(true);
			setError(null);

			try {
				const searchParams = new URLSearchParams();

				if (params.search) searchParams.append('search', params.search);
				if (params.status) searchParams.append('status', params.status);
				if (params.platform) searchParams.append('platform', params.platform);
				if (params.clientId) searchParams.append('clientId', params.clientId);
				if (params.sortBy) searchParams.append('sortBy', params.sortBy);
				if (params.sortOrder)
					searchParams.append('sortOrder', params.sortOrder);
				if (params.page) searchParams.append('page', params.page.toString());
				if (params.limit) searchParams.append('limit', params.limit.toString());

				const response = await fetch(
					`/api/campaigns?${searchParams.toString()}`
				);

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const result: CampaignsResponse<ApiCampaignRow> = await response.json();

				if (result.success) {
					const transformed: Campaign[] = (result.data || []).map(
						(row: ApiCampaignRow) => {
							const sent = Number(row.sent ?? 0);
							const replies = Number(row.replies ?? 0);
							const positive = Number(row.interested ?? 0);
							const bounced = Number(row.bounced ?? 0);
							const leads = Number(row.connected ?? 0);
							const opens = Number(row.opens ?? 0);
							const safeRate = (num: number, den: number) =>
								den > 0 ? (num / den) * 100 : 0;

							return {
								id: String(row.id),
								campaignId: row.campaignId,
								name: row.name,
								platform: transformPlatform(row.platform),
								status: (row.status as Campaign['status']) || 'draft',
								workspace: row.client_name || '—',
								client_id: row.client_id ? String(row.client_id) : undefined,
								sent,
								replies,
								positiveReplies: positive,
								replyRate: safeRate(replies, sent),
								positiveRate: safeRate(positive, replies),
								bounceRate: safeRate(bounced, sent),
								opens,
								leads,
							};
						}
					);

					setCampaigns(transformed);
					setPagination(result.pagination);
				} else {
					throw new Error('Failed to fetch campaigns');
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : 'An error occurred');
				console.error('Error fetching campaigns:', err);
			} finally {
				setLoading(false);
			}
		},
		[]
	);

	const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
		setFilters((prev) => ({ ...prev, ...newFilters }));
	}, []);

	const refreshCampaigns = useCallback(() => {
		fetchCampaigns(filters);
	}, [fetchCampaigns, filters]);

	const fetchCampaignDetail = useCallback(async (campaignId: string) => {
		setDetailLoading(true);
		setDetailError(null);

		try {
			const response = await fetch(`/api/campaigns/${campaignId}`);

			if (!response.ok) {
				if (response.status === 404) {
					throw new Error('Campaign not found');
				}
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result: CampaignDetailResponse = await response.json();

			if (result.success) {
				setCampaignDetail(result.data);
			} else {
				throw new Error('Failed to fetch campaign details');
			}
		} catch (err) {
			setDetailError(err instanceof Error ? err.message : 'An error occurred');
			console.error('Error fetching campaign detail:', err);
		} finally {
			setDetailLoading(false);
		}
	}, []);

	const updateCampaignStatus = useCallback(
		async (campaignId: string, status: string) => {
			try {
				const response = await fetch(`/api/campaigns/${campaignId}/status`, {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ status }),
				});

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				// Refresh campaigns list after status update
				refreshCampaigns();

				return true;
			} catch (err) {
				console.error('Error updating campaign status:', err);
				return false;
			}
		},
		[refreshCampaigns]
	);

	// Fetch campaigns when filters change
	useEffect(() => {
		fetchCampaigns(filters);
	}, [filters, fetchCampaigns]);

	return {
		campaigns,
		campaignDetail,
		loading,
		detailLoading,
		error,
		detailError,
		pagination,
		filters,
		fetchCampaigns,
		fetchCampaignDetail,
		updateCampaignStatus,
		updateFilters,
		refreshCampaigns,
	};
}
