'use client';

import React, { useState, useEffect } from 'react';
import {
	EnvelopeIcon,
	CheckCircleIcon,
	ExclamationTriangleIcon,
	ArrowTrendingUpIcon,
	ArrowTrendingDownIcon,
	MinusIcon,
	CalendarIcon,
	UsersIcon,
	PlayIcon,
	PauseIcon,
	EyeIcon,
	ArrowPathIcon,
	ChatBubbleLeftRightIcon,
	LightBulbIcon,
	DocumentTextIcon,
	ClockIcon,
	ChartBarIcon,
} from '@heroicons/react/24/outline';
import {
	EnvelopeIcon as EnvelopeSolidIcon,
	CheckCircleIcon as CheckCircleSolidIcon,
} from '@heroicons/react/24/solid';
import { formatPercentage, formatNumber } from '@/lib/utils';
import { SparklineChart } from './ChartComponents';

interface ClientDetailProps {
	clientId: string;
}

interface ClientData {
	id: number;
	Domain: string;
	Company_Name: string;
	Primary_Email: string;
	Primary_Number: string;
	Contact_Title: string;
	Industry: string;
	Services: string;
	Onboarding_Date: string;
	instantly_api: string;
	bison_api: string;
	instantly_api_v2: string;
}

interface ClientKPIMetric {
	id: string;
	label: string;
	value: number;
	change: number;
	changeType: 'positive' | 'negative' | 'neutral';
	baseline: number;
	subtitle: string;
	icon: any;
	format: 'percentage' | 'number' | 'ratio';
}

interface CampaignData {
	id: number;
	campaign_id: string;
	campaign_name: string;
	platform: string;
	client_id: number;
	sent: number;
	contacted: number;
	opens: number;
	replies: number;
	bounced: number;
	interested: number;
	status: string;
	client_name: string;
	Onboarding_Date: string;
}

interface StepData {
	step: string;
	variant: string;
	sent: number;
	replies: number;
	positiveReplies: number;
	bounceRate: number;
	replyRate: number;
	positiveRate: number;
}

interface RecommendationData {
	id: string;
	type: 'warning' | 'suggestion' | 'action';
	title: string;
	description: string;
	priority: 'high' | 'medium' | 'low';
	action?: string;
}

interface ReplySample {
	id: string;
	content: string;
	sentiment: 'positive' | 'negative' | 'neutral';
	platform: string;
	timestamp: string;
	leadEmail: string;
}

export default function ClientDetail({ clientId }: ClientDetailProps) {
	const [client, setClient] = useState<ClientData | null>(null);
	const [kpiData, setKpiData] = useState<ClientKPIMetric[]>([]);
	const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
	const [selectedCampaign, setSelectedCampaign] = useState<CampaignData | null>(
		null
	);
	const [stepData, setStepData] = useState<StepData[]>([]);
	const [recommendations, setRecommendations] = useState<RecommendationData[]>(
		[]
	);
	const [replySamples, setReplySamples] = useState<ReplySample[]>([]);
	const [loading, setLoading] = useState(true);

	// Mock data for demonstration
	useEffect(() => {
		setLoading(true);

		// Simulate API call
		setTimeout(() => {
			setClient({
				id: parseInt(clientId),
				Domain: 'n2.com',
				Company_Name: 'N2',
				Primary_Email: 'contact@n2.com',
				Primary_Number: '+1-555-0123',
				Contact_Title: 'CEO',
				Industry: 'Technology',
				Services: 'Software Development',
				Onboarding_Date: '2024-01-15',
				instantly_api: 'api_key_1',
				bison_api: 'api_key_2',
				instantly_api_v2: 'api_key_3',
			});

			setKpiData([
				{
					id: 'reply-rate',
					label: 'Reply Rate',
					value: 14.2,
					change: 2.1,
					changeType: 'positive',
					baseline: 12.1,
					subtitle: 'vs baseline',
					icon: EnvelopeIcon,
					format: 'percentage',
				},
				{
					id: 'reply-count',
					label: 'Total Replies',
					value: 847,
					change: -5.2,
					changeType: 'negative',
					baseline: 893,
					subtitle: 'vs baseline',
					icon: CheckCircleIcon,
					format: 'number',
				},
				{
					id: 'positive-rate',
					label: 'Positive Reply Rate',
					value: 72.3,
					change: 1.8,
					changeType: 'positive',
					baseline: 70.5,
					subtitle: 'vs baseline',
					icon: CheckCircleSolidIcon,
					format: 'percentage',
				},
				{
					id: 'bounce-rate',
					label: 'Bounce Rate',
					value: 2.8,
					change: -0.5,
					changeType: 'positive',
					baseline: 3.3,
					subtitle: 'vs baseline',
					icon: ExclamationTriangleIcon,
					format: 'percentage',
				},
				{
					id: 'emails-sent',
					label: 'Emails Sent',
					value: 5967,
					change: 12.3,
					changeType: 'positive',
					baseline: 5312,
					subtitle: 'vs baseline',
					icon: EnvelopeSolidIcon,
					format: 'number',
				},
			]);

			setCampaigns([
				{
					id: 1,
					campaign_id: 'camp_001',
					campaign_name: 'Q1 Tech Outreach',
					platform: 'Instantly',
					client_id: parseInt(clientId),
					sent: 1250,
					contacted: 1180,
					opens: 450,
					replies: 187,
					bounced: 26,
					interested: 134,
					status: 'active',
					client_name: 'N2',
					Onboarding_Date: '2024-01-15',
				},
				{
					id: 2,
					campaign_id: 'camp_002',
					campaign_name: 'Developer Recruitment',
					platform: 'Bison',
					client_id: parseInt(clientId),
					sent: 890,
					contacted: 845,
					opens: 320,
					replies: 98,
					bounced: 28,
					interested: 67,
					status: 'active',
					client_name: 'N2',
					Onboarding_Date: '2024-01-15',
				},
				{
					id: 3,
					campaign_id: 'camp_003',
					campaign_name: 'Startup Partnership',
					platform: 'Instantly',
					client_id: parseInt(clientId),
					sent: 567,
					contacted: 534,
					opens: 210,
					replies: 45,
					bounced: 12,
					interested: 33,
					status: 'paused',
					client_name: 'N2',
					Onboarding_Date: '2024-01-15',
				},
			]);

			setStepData([
				{
					step: 'Introduction',
					variant: 'A',
					sent: 450,
					replies: 67,
					positiveReplies: 48,
					bounceRate: 1.8,
					replyRate: 14.9,
					positiveRate: 71.6,
				},
				{
					step: 'Introduction',
					variant: 'B',
					sent: 420,
					replies: 58,
					positiveReplies: 39,
					bounceRate: 2.1,
					replyRate: 13.8,
					positiveRate: 67.2,
				},
				{
					step: 'Follow-up',
					variant: 'A',
					sent: 380,
					replies: 62,
					positiveReplies: 47,
					bounceRate: 1.5,
					replyRate: 16.3,
					positiveRate: 75.8,
				},
			]);

			setRecommendations([
				{
					id: '1',
					type: 'warning',
					title: 'High Bounce Rate Detected',
					description:
						'Campaign "Startup Partnership" has a 4.1% bounce rate, above the 3% threshold.',
					priority: 'high',
					action: 'Pause campaign and review email list quality',
				},
				{
					id: '2',
					type: 'suggestion',
					title: 'Optimize Variant A',
					description:
						'Introduction Variant A shows 8% better positive reply rate than Variant B.',
					priority: 'medium',
					action: 'Scale up Variant A and pause Variant B',
				},
				{
					id: '3',
					type: 'action',
					title: 'Create Follow-up Sequence',
					description:
						'Follow-up emails show 16.3% reply rate vs 14.4% for initial emails.',
					priority: 'low',
					action: 'Implement automated follow-up sequence',
				},
			]);

			setReplySamples([
				{
					id: '1',
					content:
						'Hi! Your tech solutions look exactly like what we need. Can we schedule a call next week?',
					sentiment: 'positive',
					platform: 'Instantly',
					timestamp: '2024-01-20 14:32',
					leadEmail: 'john@startup.com',
				},
				{
					id: '2',
					content:
						"Thanks for reaching out. We're currently evaluating our tech stack. Will keep you in mind.",
					sentiment: 'neutral',
					platform: 'Bison',
					timestamp: '2024-01-19 09:15',
					leadEmail: 'sarah@techcorp.com',
				},
				{
					id: '3',
					content:
						"This is exactly what we've been looking for! Our team is excited to learn more.",
					sentiment: 'positive',
					platform: 'Instantly',
					timestamp: '2024-01-18 16:45',
					leadEmail: 'mike@innovate.com',
				},
			]);

			setSelectedCampaign(campaigns[0]);
			setLoading(false);
		}, 1000);
	}, [clientId]);

	const getChangeIcon = (changeType: string) => {
		switch (changeType) {
			case 'positive':
				return ArrowTrendingUpIcon;
			case 'negative':
				return ArrowTrendingDownIcon;
			default:
				return MinusIcon;
		}
	};

	const getChangeColor = (changeType: string) => {
		switch (changeType) {
			case 'positive':
				return 'text-success-600';
			case 'negative':
				return 'text-danger-600';
			default:
				return 'text-neutral-500';
		}
	};

	const getIconBackground = (label: string) => {
		if (label.includes('Reply Rate')) return 'bg-primary-50';
		if (label.includes('Total Replies')) return 'bg-success-50';
		if (label.includes('Positive')) return 'bg-secondary-50';
		if (label.includes('Bounce')) return 'bg-warning-50';
		if (label.includes('Emails Sent')) return 'bg-primary-50';
		return 'bg-neutral-100';
	};

	const getIconColor = (label: string) => {
		if (label.includes('Reply Rate')) return 'text-primary-600';
		if (label.includes('Total Replies')) return 'text-success-600';
		if (label.includes('Positive')) return 'text-secondary-600';
		if (label.includes('Bounce')) return 'text-warning-600';
		if (label.includes('Emails Sent')) return 'text-primary-600';
		return 'text-neutral-600';
	};

	const formatValue = (metric: ClientKPIMetric) => {
		switch (metric.format) {
			case 'percentage':
				return `${metric.value.toFixed(1)}%`;
			case 'number':
				return formatNumber(metric.value);
			case 'ratio':
				return `1 per ${metric.value.toFixed(1)}`;
			default:
				return metric.value.toString();
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'active':
				return 'text-success-600 bg-success-50 border-success-200';
			case 'paused':
				return 'text-warning-600 bg-warning-50 border-warning-200';
			case 'completed':
				return 'text-neutral-600 bg-neutral-50 border-neutral-200';
			case 'draft':
				return 'text-primary-600 bg-primary-50 border-primary-200';
			default:
				return 'text-neutral-600 bg-neutral-50 border-neutral-200';
		}
	};

	const getRecommendationColor = (type: string) => {
		switch (type) {
			case 'warning':
				return 'text-warning-600 bg-warning-50 border-warning-200';
			case 'suggestion':
				return 'text-primary-600 bg-primary-50 border-primary-200';
			case 'action':
				return 'text-success-600 bg-success-50 border-success-200';
			default:
				return 'text-neutral-600 bg-neutral-50 border-neutral-200';
		}
	};

	const getSentimentColor = (sentiment: string) => {
		switch (sentiment) {
			case 'positive':
				return 'text-success-600 bg-success-50 border-success-200';
			case 'negative':
				return 'text-danger-600 bg-danger-50 border-danger-200';
			case 'neutral':
				return 'text-neutral-600 bg-neutral-50 border-neutral-200';
			default:
				return 'text-neutral-600 bg-neutral-50 border-neutral-200';
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

	if (!client) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500">Client not found</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Client Header */}
			<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 overflow-hidden">
				<div className="px-6 py-4 border-b border-primary-100 bg-primary-50/80">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h2 className="text-lg font-semibold text-gray-900 flex items-center">
								{client.Company_Name}
							</h2>
							<div className="flex items-center space-x-4 mt-1">
								<div className="flex items-center text-sm text-gray-600">
									<CalendarIcon className="h-4 w-4 mr-1" />
									Onboarded:{' '}
									{new Date(client.Onboarding_Date).toLocaleDateString()}
								</div>
								<div className="flex items-center text-sm text-gray-600">
									<UsersIcon className="h-4 w-4 mr-1" />
									Platforms: {client.instantly_api ? 'Instantly' : 'Bison'}
								</div>
								<span
									className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
										'active'
									)}`}
								>
									Active
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Client KPI Bar */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
				{kpiData.map((metric, index) => {
					const Icon = metric.icon;
					const ChangeIcon = getChangeIcon(metric.changeType);
					const changeColor = getChangeColor(metric.changeType);
					const iconBg = getIconBackground(metric.label);
					const iconColor = getIconColor(metric.label);

					return (
						<div
							key={metric.id}
							className="bg-white/80 backdrop-blur-sm p-4 rounded-sm border border-primary-100 shadow-primary hover:shadow-primary-lg hover:border-primary-200 transition-all duration-200 cursor-pointer relative"
							style={{ animationDelay: `${index * 50}ms` }}
						>
							<div className="flex items-start justify-between mb-3">
								<div
									className={`flex-shrink-0 p-2.5 rounded-sm ${iconBg} shadow-sm`}
								>
									<Icon className={`h-4 w-4 ${iconColor}`} />
								</div>
								{metric.change !== 0 && (
									<div className="flex items-center space-x-1">
										<ChangeIcon className={`h-3 w-3 ${changeColor}`} />
										<span className={`text-xs font-medium ${changeColor}`}>
											{Math.abs(metric.change).toFixed(1)}%
										</span>
									</div>
								)}
							</div>

							<div className="space-y-1">
								<h3 className="text-sm font-medium text-gray-500 truncate">
									{metric.label}
								</h3>
								<p className="text-2xl font-bold text-gray-900">
									{formatValue(metric)}
								</p>
								<p className="text-xs text-gray-500 leading-tight">
									{metric.subtitle}
								</p>
							</div>

							{/* Hover effect */}
							<div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-sm"></div>
						</div>
					);
				})}
			</div>

			{/* Campaign Table */}
			<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 overflow-hidden">
				<div className="px-6 py-4 border-b border-primary-100 bg-primary-50/80">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h2 className="text-lg font-semibold text-gray-900 flex items-center">
								Campaigns
							</h2>
							<p className="text-sm text-gray-600 mt-1">
								{campaigns.length} active campaigns
							</p>
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
									Unique Leads
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Replies
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Positive
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Bounce %
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Send→Positive
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Last Send
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Status
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Trend
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white/50 divide-y divide-primary-100">
							{campaigns.map((campaign, index) => (
								<tr
									key={campaign.id}
									className={`hover:bg-primary-50/50 transition-colors duration-200 cursor-pointer ${
										selectedCampaign?.id === campaign.id
											? 'bg-primary-50/50'
											: ''
									}`}
									onClick={() => setSelectedCampaign(campaign)}
									style={{ animationDelay: `${index * 50}ms` }}
								>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm font-medium text-gray-900">
											{campaign.campaign_name}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span className="text-sm text-gray-600">
											{campaign.platform}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm font-medium text-gray-900">
											{formatNumber(campaign.sent)}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-gray-900">
											{formatNumber(campaign.contacted)}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm font-medium text-gray-900">
											{formatNumber(campaign.replies)}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm font-medium text-gray-900">
											{formatNumber(campaign.replies)}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-gray-900">
											{campaign.bounced.toFixed(1)}%
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm font-medium text-gray-900">
											1 per {campaign.interested.toFixed(1)}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-gray-600">
											{new Date(campaign.Onboarding_Date).toLocaleDateString()}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
												'active'
											)}`}
										>
											Active
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<SparklineChart
											data={[52, 48, 61, 55, 49, 58, 53]}
											color="bg-primary-500"
										/>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
										<div className="flex justify-end space-x-2">
											<button
												className="text-primary-600 hover:text-primary-900 transition-colors duration-200"
												title="Open in platform"
											>
												<EyeIcon className="h-4 w-4" />
											</button>
											<button
												className="text-warning-600 hover:text-warning-900 transition-colors duration-200"
												title="Pause campaign"
											>
												<PauseIcon className="h-4 w-4" />
											</button>
											<button
												className="text-neutral-600 hover:text-neutral-900 transition-colors duration-200"
												title="Reassign"
											>
												<ArrowPathIcon className="h-4 w-4" />
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Campaign Detail and Recommendations */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Campaign Detail */}
				<div className="lg:col-span-2 space-y-6">
					{/* Campaign Timeline */}
					<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							{selectedCampaign?.campaign_name} - Timeline
						</h3>
						<div className="h-64 bg-gray-50 rounded-sm flex items-center justify-center">
							<ChartBarIcon className="h-12 w-12 text-gray-400" />
							<span className="ml-2 text-gray-500">
								Timeline chart will be rendered here
							</span>
						</div>
					</div>

					{/* Step Breakdown */}
					<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							Step Breakdown
						</h3>
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-primary-100">
								<thead className="bg-primary-50/50">
									<tr>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
											Step
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
											Variant
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
											Sent
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
											Replies
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
											Positive
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
											Reply Rate
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
											Positive Rate
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
											Bounce %
										</th>
									</tr>
								</thead>
								<tbody className="bg-white/50 divide-y divide-primary-100">
									{stepData.map((step, index) => (
										<tr
											key={index}
											className="hover:bg-primary-50/50 transition-colors duration-200"
										>
											<td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
												{step.step}
											</td>
											<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
												{step.variant}
											</td>
											<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
												{formatNumber(step.sent)}
											</td>
											<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
												{formatNumber(step.replies)}
											</td>
											<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
												{formatNumber(step.positiveReplies)}
											</td>
											<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
												{step.replyRate.toFixed(1)}%
											</td>
											<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
												{step.positiveRate.toFixed(1)}%
											</td>
											<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
												{step.bounceRate.toFixed(1)}%
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>

				{/* Recommendations Panel */}
				<div className="space-y-6">
					<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold text-gray-900 flex items-center">
								<LightBulbIcon className="h-5 w-5 mr-2 text-primary-600" />
								Recommendations
							</h3>
						</div>
						<div className="space-y-3">
							{recommendations.map((rec) => (
								<div
									key={rec.id}
									className={`p-3 rounded-sm border ${getRecommendationColor(
										rec.type
									)}`}
								>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<h4 className="text-sm font-medium mb-1">{rec.title}</h4>
											<p className="text-xs mb-2">{rec.description}</p>
											{rec.action && (
												<button className="text-xs font-medium hover:underline transition-colors duration-200">
													{rec.action}
												</button>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Raw Replies Sampling */}
					<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold text-gray-900 flex items-center">
								<ChatBubbleLeftRightIcon className="h-5 w-5 mr-2 text-primary-600" />
								Recent Replies
							</h3>
						</div>
						<div className="space-y-3">
							{replySamples.map((reply) => (
								<div
									key={reply.id}
									className={`p-3 rounded-sm border ${getSentimentColor(
										reply.sentiment
									)}`}
								>
									<div className="flex items-start justify-between mb-2">
										<span className="text-xs font-medium">
											{reply.leadEmail}
										</span>
										<div className="flex items-center space-x-2">
											<span className="text-xs text-gray-500">
												{reply.platform}
											</span>
											<ClockIcon className="h-3 w-3 text-gray-400" />
											<span className="text-xs text-gray-500">
												{new Date(reply.timestamp).toLocaleDateString()}
											</span>
										</div>
									</div>
									<p className="text-sm mb-2 line-clamp-3">{reply.content}</p>
									<button className="text-xs font-medium hover:underline transition-colors duration-200">
										View full message
									</button>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
