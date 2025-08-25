'use client';

import React, { useState, useEffect } from 'react';
import {
	EnvelopeIcon,
	CheckCircleIcon,
	ExclamationTriangleIcon,
	CalendarIcon,
	UsersIcon,
	ChatBubbleLeftRightIcon,
	DocumentTextIcon,
	ClockIcon,
	ChartBarIcon,
	BuildingOfficeIcon,
	GlobeAltIcon,
	PhoneIcon,
	UserIcon,
	ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import {
	EnvelopeIcon as EnvelopeSolidIcon,
	CheckCircleIcon as CheckCircleSolidIcon,
} from '@heroicons/react/24/solid';
import { formatNumber } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface ClientDetailProps {
	clientId: string;
}

interface ClientData {
	id: number;
	name: string;
	domain: string;
	email: string;
	phone: string;
	contactTitle: string;
	industry: string;
	services: string;
	onboardingDate: string;
}

interface KPIMetric {
	id: string;
	label: string;
	value: number;
	format: 'percentage' | 'number';
	icon: string;
	color: string;
}

interface CampaignData {
	campaign_id: number;
	campaign_name: string;
	platform: string;
	sends: number;
	leads: number;
	replies: number;
	positive: number;
	reply_rate: number;
	positive_rate: number;
	bounce_rate: number;
	send_to_positive_ratio: number;
}

interface ReplyData {
	reply_id: string;
	created_at: string;
	sentiment: string;
	platform: string;
	campaign_name: string;
	lead_email: string;
	content: string;
}

interface PlatformBreakdown {
	bison: {
		sends: number;
		replies: number;
		positive: number;
	};
	instantly: {
		sends: number;
		replies: number;
		positive: number;
	};
}

interface ActivityData {
	totalCampaigns: number;
	uniqueLeads: number;
	platformsUsed: number;
	firstSendDate: string;
	lastSendDate: string;
	avgDailySends: number;
	daysSinceLastActivity: number;
	avgRepliesPerDay: number;
	mostActiveHour: string;
}

interface ClientDetailResponse {
	client: ClientData;
	kpiData: KPIMetric[];
	campaigns: CampaignData[];
	recentReplies: ReplyData[];
	dailyTrends: any[];
	platformBreakdown: PlatformBreakdown;
	activity: ActivityData;
}

export default function ClientDetail({ clientId }: ClientDetailProps) {
	const [clientData, setClientData] = useState<ClientDetailResponse | null>(
		null
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedCampaign, setSelectedCampaign] = useState<CampaignData | null>(
		null
	);
	const [platformFilter, setPlatformFilter] = useState<string>('all');
	const router = useRouter();
	// Get unique platforms from campaigns
	const uniquePlatforms = clientData?.campaigns
		? Array.from(new Set(clientData.campaigns.map((c) => c.platform)))
		: [];

	// Filter campaigns based on platform filter
	const filteredCampaigns =
		clientData?.campaigns?.filter(
			(campaign) =>
				platformFilter === 'all' || campaign.platform === platformFilter
		) || [];

	// Function to truncate campaign name and add tooltip
	const truncateCampaignName = (name: string, maxWords: number = 4) => {
		const words = name.split(' ');
		if (words.length <= maxWords) return name;
		return words.slice(0, maxWords).join(' ') + '...';
	};

	// Fetch client data from API
	useEffect(() => {
		let isMounted = true;

		const fetchClientData = async () => {
			try {
				setLoading(true);
				setError(null);

				const response = await fetch(`/api/clients/${clientId}`);
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const data = await response.json();

				// Only update state if component is still mounted
				if (isMounted) {
					// Remove duplicate campaigns based on platform + campaign_id combination
					if (data.campaigns && data.campaigns.length > 0) {
						const uniqueCampaigns = data.campaigns.filter(
							(campaign: any, index: number, self: any[]) =>
								index ===
								self.findIndex(
									(c: any) =>
										c.platform === campaign.platform &&
										c.campaign_id === campaign.campaign_id
								)
						);
						data.campaigns = uniqueCampaigns;
					}

					// Remove duplicate replies based on reply_id
					if (data.recentReplies && data.recentReplies.length > 0) {
						const uniqueReplies = data.recentReplies.filter(
							(reply: any, index: number, self: any[]) =>
								index ===
								self.findIndex((r: any) => r.reply_id === reply.reply_id)
						);
						data.recentReplies = uniqueReplies;
					}

					setClientData(data);

					// Set first campaign as selected by default
					if (data.campaigns && data.campaigns.length > 0) {
						setSelectedCampaign(data.campaigns[0]);
					}
				}
			} catch (err) {
				console.error('Error fetching client data:', err);
				if (isMounted) {
					setError(
						err instanceof Error ? err.message : 'Failed to fetch client data'
					);
				}
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		};

		fetchClientData();

		// Cleanup function to prevent memory leaks
		return () => {
			isMounted = false;
		};
	}, [clientId]);

	const getIconComponent = (iconName: string) => {
		const iconMap: { [key: string]: any } = {
			EnvelopeIcon,
			CheckCircleIcon,
			CheckCircleSolidIcon,
			ExclamationTriangleIcon,
			EnvelopeSolidIcon,
		};
		return iconMap[iconName] || EnvelopeIcon;
	};

	const getIconBackground = (color: string) => {
		const colorMap: { [key: string]: string } = {
			primary: 'bg-primary-50',
			success: 'bg-success-50',
			secondary: 'bg-secondary-50',
			warning: 'bg-warning-50',
		};
		return colorMap[color] || 'bg-neutral-100';
	};

	const getIconColor = (color: string) => {
		const colorMap: { [key: string]: string } = {
			primary: 'text-primary-600',
			success: 'text-success-600',
			secondary: 'text-secondary-600',
			warning: 'text-warning-600',
		};
		return colorMap[color] || 'text-neutral-600';
	};

	const formatValue = (metric: KPIMetric) => {
		switch (metric.format) {
			case 'percentage':
				return `${metric.value.toFixed(1)}%`;
			case 'number':
				return formatNumber(metric.value);
			default:
				return metric.value.toString();
		}
	};

	if (loading) {
		return (
			<div className="space-y-6 animate-pulse">
				{/* Header Skeleton */}
				<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
					<div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
					<div className="h-4 bg-gray-200 rounded w-48"></div>
				</div>

				{/* KPI Cards Skeleton */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
					{[...Array(5)].map((_, index) => (
						<div
							key={index}
							className="bg-white/80 backdrop-blur-sm p-4 rounded-sm border border-primary-100 shadow-primary"
						>
							<div className="flex items-center justify-between mb-3">
								<div className="w-10 h-10 bg-gray-200 rounded-sm"></div>
								<div className="w-16 h-4 bg-gray-200 rounded"></div>
							</div>
							<div className="h-8 bg-gray-200 rounded mb-2"></div>
							<div className="h-4 bg-gray-200 rounded w-24"></div>
						</div>
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center py-12">
				<ExclamationTriangleIcon className="h-12 w-12 text-warning-500 mx-auto mb-4" />
				<p className="text-gray-500 mb-2">Error loading client data</p>
				<p className="text-sm text-gray-400">{error}</p>
			</div>
		);
	}

	if (!clientData) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500">Client not found</p>
			</div>
		);
	}

	const { client, kpiData, recentReplies, platformBreakdown, activity } =
		clientData;

	return (
		<div className="space-y-6">
			{/* Client Header */}
			<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 overflow-hidden">
				<div className="px-6 py-4 border-b border-primary-100 bg-primary-50/80">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
						<div>
							<div className="flex items-center mb-2">
								<button
									onClick={() => router.back()}
									className="mr-3 p-1 rounded-md hover:bg-gray-100 transition-colors duration-200"
								>
									<ArrowLeftIcon className="h-5 w-5 text-gray-600" />
								</button>
								<h2 className="text-lg font-semibold text-gray-900 flex items-center">
									<BuildingOfficeIcon className="h-5 w-5 mr-2 text-primary-600" />
									{client.name}
								</h2>
							</div>
							<div className="flex flex-wrap items-center gap-4 mt-2">
								<div className="flex items-center text-sm text-gray-600">
									<GlobeAltIcon className="h-4 w-4 mr-1" />
									{client.domain}
								</div>
								<div className="flex items-center text-sm text-gray-600">
									<CalendarIcon className="h-4 w-4 mr-1" />
									Onboarded:{' '}
									{new Date(client.onboardingDate).toLocaleDateString()}
								</div>
								<div className="flex items-center text-sm text-gray-600">
									<UsersIcon className="h-4 w-4 mr-1" />
									{activity.platformsUsed} Platform
									{activity.platformsUsed !== 1 ? 's' : ''}
								</div>
								<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-success-600 bg-success-50 border border-success-200">
									Active
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Client Contact Info */}
				<div className="px-6 py-4 bg-white/50">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
						{client.contactTitle && (
							<div className="flex items-center">
								<UserIcon className="h-4 w-4 mr-2 text-gray-400" />
								<span className="text-gray-600">{client.contactTitle}</span>
							</div>
						)}
						{client.email && (
							<div className="flex items-center">
								<EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
								<span className="text-gray-600">{client.email}</span>
							</div>
						)}
						{client.phone && (
							<div className="flex items-center">
								<PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
								<span className="text-gray-600">{client.phone}</span>
							</div>
						)}
					</div>
					<div className="mt-3 text-sm flex flex-wrap gap-2 items-center">
						{client.industry && (
							<>
								<span className="text-gray-500">Industry:</span>{' '}
								{client.industry}
							</>
						)}
						{client.industry && client.services && (
							<span className="text-gray-500">|</span>
						)}
						{client.services && (
							<>
								<span className="text-gray-500">Services:</span>
								{client.services}
							</>
						)}
					</div>
				</div>
			</div>

			{/* KPI Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
				{kpiData.map((metric, index) => {
					const Icon = getIconComponent(metric.icon);
					const iconBg = getIconBackground(metric.color);
					const iconColor = getIconColor(metric.color);

					return (
						<div
							key={`${metric.id}-${index}`}
							className="bg-white/80 backdrop-blur-sm p-4 rounded-sm border border-primary-100 shadow-primary hover:shadow-primary-lg hover:border-primary-200 transition-all duration-200 cursor-pointer group"
							style={{ animationDelay: `${index * 50}ms` }}
						>
							<div className="flex items-start justify-between mb-3">
								<div
									className={`flex-shrink-0 p-2.5 rounded-sm ${iconBg} shadow-sm`}
								>
									<Icon className={`h-4 w-4 ${iconColor}`} />
								</div>
							</div>

							<div className="space-y-1">
								<h3 className="text-sm font-medium text-gray-500 truncate">
									{metric.label}
								</h3>
								<p className="text-2xl font-bold text-gray-900">
									{formatValue(metric)}
								</p>
							</div>

							{/* Hover effect */}
							<div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-sm"></div>
						</div>
					);
				})}
			</div>

			{/* Platform Performance Summary */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
						<ClockIcon className="h-5 w-5 mr-2 text-primary-600" />
						Activity Summary
					</h3>
					<div className="space-y-2.5">
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-500">Total Campaigns:</span>
							<span className="text-sm font-medium text-gray-900">
								{activity.totalCampaigns}
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-500">Unique Leads:</span>
							<span className="text-sm font-medium text-gray-900">
								{formatNumber(activity.uniqueLeads)}
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-500">Avg Sends/Day:</span>
							<span className="text-sm font-medium text-gray-900">
								{activity.avgDailySends?.toFixed(1) || 0}
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-500">Avg Replies/Day:</span>
							<span className="text-sm font-medium text-gray-900">
								{activity.avgRepliesPerDay
									? activity.avgRepliesPerDay.toFixed(1)
									: 'N/A'}
							</span>
						</div>

						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-500">Most Active Day:</span>
							<span className="text-sm font-medium text-gray-900">
								{activity.mostActiveHour || 'N/A'}
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-500">
								Days Since Last Activity:
							</span>
							<span
								className={`text-sm font-medium ${
									activity.daysSinceLastActivity > 7
										? 'text-orange-600'
										: 'text-green-600'
								}`}
							>
								{activity.daysSinceLastActivity
									? `${activity.daysSinceLastActivity} days`
									: 'N/A'}
							</span>
						</div>
					</div>

					{/* Additional Activity Insights */}
					<div className="border-t border-gray-200 pt-3 mt-3">
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-500">First Send:</span>
							<span className="text-sm font-medium text-gray-900">
								{activity.firstSendDate
									? new Date(activity.firstSendDate).toLocaleDateString()
									: 'N/A'}
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-500">Last Send:</span>
							<span className="text-sm font-medium text-gray-900">
								{activity.lastSendDate
									? new Date(activity.lastSendDate).toLocaleDateString()
									: 'N/A'}
							</span>
						</div>
					</div>
				</div>

				<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
						<ChartBarIcon className="h-5 w-5 mr-2 text-primary-600" />
						Platform Performance
					</h3>

					<div className="space-y-4">
						{Object.entries(platformBreakdown).map(
							([platform, data], index) => (
								<div
									key={`platform-${platform}-${index}`}
									className="border border-gray-200 rounded-sm p-4"
								>
									<div className="flex items-center justify-between mb-2">
										<h4 className="font-medium text-gray-900 capitalize">
											{platform}
										</h4>
										<span className="text-sm text-gray-500">
											{formatNumber(data.sends)} sends
										</span>
									</div>
									<div className="grid grid-cols-4 gap-2 text-sm">
										<div>
											<span className="text-gray-500">Replies:</span>
											<div className="font-medium">
												{formatNumber(data.replies)}
											</div>
										</div>

										<div>
											<span className="text-gray-500">Reply Rate:</span>
											<div className="font-medium">
												{data.sends > 0
													? ((data.replies / data.sends) * 100).toFixed(1)
													: 0}
												%
											</div>
										</div>
										<div>
											<span className="text-gray-500">Positive Replies:</span>
											<div className="font-medium text-success-600">
												{formatNumber(data.positive)}
											</div>
										</div>
										<div>
											<span className="text-gray-500">Positive Rate:</span>
											<div className="font-medium">
												{data.sends > 0
													? ((data.positive / data.replies) * 100).toFixed(1)
													: 0}
												%
											</div>
										</div>
									</div>
								</div>
							)
						)}
					</div>
				</div>
			</div>

			{/* Campaigns Table */}
			{filteredCampaigns.length > 0 && (
				<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 overflow-hidden">
					<div className="px-6 py-4 border-b border-primary-100 bg-primary-50/80">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
							<div>
								<h2 className="text-lg font-semibold text-gray-900 flex items-center">
									<DocumentTextIcon className="h-5 w-5 mr-2 text-primary-600" />
									Campaigns ({filteredCampaigns.length})
								</h2>
								<p className="text-sm text-gray-600 mt-1">
									Campaign performance overview
								</p>
							</div>
							<div className="mt-4 sm:mt-0">
								<div className="flex bg-white/80 backdrop-blur-sm border border-primary-200 rounded-sm p-1">
									{['all', 'instantly', 'bison'].map((platform) => (
										<button
											key={platform}
											onClick={() => setPlatformFilter(platform)}
											className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors duration-200 ${
												platformFilter === platform
													? 'bg-primary-100 text-primary-700 shadow-sm'
													: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
											}`}
										>
											{platform.charAt(0).toUpperCase() + platform.slice(1)}
										</button>
									))}
								</div>
							</div>
						</div>
					</div>

					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-primary-100">
							<thead className="bg-primary-50/50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
										Campaign
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
										Platform
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
										Sent
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
										Leads
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
										Replies
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
										Positive
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
										Reply Rate
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
										Positive Rate
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
										Bounce Rate
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
										Send→Positive
									</th>
								</tr>
							</thead>
							<tbody className="bg-white/50 divide-y divide-primary-100">
								{filteredCampaigns.map((campaign, index) => (
									<tr
										key={`${campaign.platform}-${campaign.campaign_id}-${index}`}
										className={`hover:bg-primary-50/50 transition-colors duration-200 cursor-pointer ${
											selectedCampaign?.campaign_id === campaign.campaign_id &&
											selectedCampaign?.platform === campaign.platform
												? 'bg-primary-50/50'
												: ''
										}`}
										onClick={() =>
											router.push(`/campaigns/${campaign.campaign_id}`)
										}
										style={{ animationDelay: `${index * 50}ms` }}
									>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="relative group">
												<div className="text-sm font-medium text-gray-900">
													{truncateCampaignName(campaign.campaign_name)}
												</div>
												<div className="absolute left-0 bottom-full mb-2 hidden w-max max-w-xs rounded-md bg-gray-800 px-2 py-1 text-xs text-white shadow-md opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:block">
													{campaign.campaign_name}
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="text-sm text-gray-600 capitalize">
												{campaign.platform}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm font-medium text-gray-900">
												{formatNumber(campaign.sends)}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												{formatNumber(campaign.leads)}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm font-medium text-gray-900">
												{formatNumber(campaign.replies)}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm font-medium text-success-600">
												{formatNumber(campaign.positive)}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												{campaign.reply_rate.toFixed(1)}%
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												{campaign.positive_rate.toFixed(1)}%
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												{campaign.bounce_rate.toFixed(1)}%
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm font-medium text-gray-900">
												{campaign.send_to_positive_ratio.toFixed(0)} : 1
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Empty State */}
			{filteredCampaigns.length === 0 && recentReplies.length === 0 && (
				<div className="text-center py-12">
					<DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
					<p className="text-gray-500 mb-2">No campaign data available</p>
					<p className="text-sm text-gray-400">
						This client hasn't sent any campaigns yet or data is still being
						processed.
					</p>
				</div>
			)}
		</div>
	);
}
