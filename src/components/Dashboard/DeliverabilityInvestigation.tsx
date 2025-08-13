'use client';

import React, { useState, useEffect } from 'react';
import {
	ExclamationTriangleIcon,
	MagnifyingGlassIcon,
	ArrowUpIcon,
	ArrowDownIcon,
	ChartBarIcon,
	DocumentTextIcon,
	EyeIcon,
	LinkIcon,
	GlobeAltIcon,
	ShieldCheckIcon,
	ClockIcon,
	InformationCircleIcon,
	XCircleIcon,
	CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { formatNumber, formatPercentage } from '@/lib/utils';

interface DeliverabilityInvestigationProps {
	onBounceSelect?: (bounceId: string) => void;
}

interface BounceTrendData {
	date: string;
	provider: string;
	campaign: string;
	bounceCount: number;
	bounceRate: number;
	totalSends: number;
}

interface BouncePivotData {
	provider: string;
	domain: string;
	bounceCount: number;
	bounceRate: number;
	totalSends: number;
	trend: 'increasing' | 'decreasing' | 'stable';
}

interface BounceReason {
	id: string;
	reason: string;
	count: number;
	percentage: number;
	examples: BounceExample[];
}

interface BounceExample {
	id: number;
	email: string;
	domain: string;
	provider: string;
	reason: string;
	bounceType: string;
	timestamp: string;
	rawMessageId: string;
	campaign: string;
}

interface ReputationConnector {
	id: string;
	name: string;
	type: 'blacklist' | 'reputation' | 'spam_score';
	status: 'good' | 'warning' | 'critical';
	lastChecked: string;
	score?: number;
	details?: string;
	actionUrl?: string;
}

export default function DeliverabilityInvestigation({
	onBounceSelect,
}: DeliverabilityInvestigationProps) {
	const [bounceTrends, setBounceTrends] = useState<BounceTrendData[]>([]);
	const [bouncePivot, setBouncePivot] = useState<BouncePivotData[]>([]);
	const [bounceReasons, setBounceReasons] = useState<BounceReason[]>([]);
	const [reputationConnectors, setReputationConnectors] = useState<
		ReputationConnector[]
	>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [providerFilter, setProviderFilter] = useState<string>('all');
	const [domainFilter, setDomainFilter] = useState<string>('all');
	const [sortBy, setSortBy] = useState<
		'provider' | 'domain' | 'bounceRate' | 'bounceCount'
	>('bounceRate');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const [selectedTimeframe, setSelectedTimeframe] = useState<string>('7d');
	const router = useRouter();

	// Mock data for demonstration
	useEffect(() => {
		setLoading(true);

		// Simulate API call
		setTimeout(() => {
			setBounceTrends([
				{
					date: '2024-01-14',
					provider: 'Gmail',
					campaign: 'Q1 Tech Outreach',
					bounceCount: 12,
					bounceRate: 2.4,
					totalSends: 500,
				},
				{
					date: '2024-01-15',
					provider: 'Gmail',
					campaign: 'Q1 Tech Outreach',
					bounceCount: 15,
					bounceRate: 3.0,
					totalSends: 500,
				},
				{
					date: '2024-01-16',
					provider: 'Gmail',
					campaign: 'Q1 Tech Outreach',
					bounceCount: 18,
					bounceRate: 3.6,
					totalSends: 500,
				},
				{
					date: '2024-01-17',
					provider: 'Gmail',
					campaign: 'Q1 Tech Outreach',
					bounceCount: 22,
					bounceRate: 4.4,
					totalSends: 500,
				},
				{
					date: '2024-01-18',
					provider: 'Gmail',
					campaign: 'Q1 Tech Outreach',
					bounceCount: 25,
					bounceRate: 5.0,
					totalSends: 500,
				},
				{
					date: '2024-01-19',
					provider: 'Gmail',
					campaign: 'Q1 Tech Outreach',
					bounceCount: 28,
					bounceRate: 5.6,
					totalSends: 500,
				},
				{
					date: '2024-01-20',
					provider: 'Gmail',
					campaign: 'Q1 Tech Outreach',
					bounceCount: 30,
					bounceRate: 6.0,
					totalSends: 500,
				},
				{
					date: '2024-01-14',
					provider: 'Outlook',
					campaign: 'Developer Recruitment',
					bounceCount: 8,
					bounceRate: 1.6,
					totalSends: 500,
				},
				{
					date: '2024-01-15',
					provider: 'Outlook',
					campaign: 'Developer Recruitment',
					bounceCount: 10,
					bounceRate: 2.0,
					totalSends: 500,
				},
				{
					date: '2024-01-16',
					provider: 'Outlook',
					campaign: 'Developer Recruitment',
					bounceCount: 12,
					bounceRate: 2.4,
					totalSends: 500,
				},
				{
					date: '2024-01-17',
					provider: 'Outlook',
					campaign: 'Developer Recruitment',
					bounceCount: 14,
					bounceRate: 2.8,
					totalSends: 500,
				},
				{
					date: '2024-01-18',
					provider: 'Outlook',
					campaign: 'Developer Recruitment',
					bounceCount: 16,
					bounceRate: 3.2,
					totalSends: 500,
				},
				{
					date: '2024-01-19',
					provider: 'Outlook',
					campaign: 'Developer Recruitment',
					bounceCount: 18,
					bounceRate: 3.6,
					totalSends: 500,
				},
				{
					date: '2024-01-20',
					provider: 'Outlook',
					campaign: 'Developer Recruitment',
					bounceCount: 20,
					bounceRate: 4.0,
					totalSends: 500,
				},
			]);

			setBouncePivot([
				{
					provider: 'Gmail',
					domain: 'techcorp.com',
					bounceCount: 45,
					bounceRate: 3.2,
					totalSends: 1400,
					trend: 'increasing',
				},
				{
					provider: 'Gmail',
					domain: 'startupxyz.com',
					bounceCount: 28,
					bounceRate: 4.1,
					totalSends: 680,
					trend: 'increasing',
				},
				{
					provider: 'Outlook',
					domain: 'techcorp.com',
					bounceCount: 32,
					bounceRate: 2.8,
					totalSends: 1140,
					trend: 'stable',
				},
				{
					provider: 'Outlook',
					domain: 'startupxyz.com',
					bounceCount: 18,
					bounceRate: 3.5,
					totalSends: 520,
					trend: 'decreasing',
				},
				{
					provider: 'Yahoo',
					domain: 'techcorp.com',
					bounceCount: 15,
					bounceRate: 2.1,
					totalSends: 720,
					trend: 'stable',
				},
				{
					provider: 'Yahoo',
					domain: 'startupxyz.com',
					bounceCount: 12,
					bounceRate: 3.8,
					totalSends: 320,
					trend: 'increasing',
				},
			]);

			setBounceReasons([
				{
					id: '1',
					reason: 'User unknown',
					count: 156,
					percentage: 45.2,
					examples: [
						{
							id: 1,
							email: 'john.doe@company.com',
							domain: 'company.com',
							provider: 'Gmail',
							reason: 'User unknown',
							bounceType: 'hard',
							timestamp: '2024-01-20 14:32',
							rawMessageId: 'msg_123456789',
							campaign: 'Q1 Tech Outreach',
						},
						{
							id: 2,
							email: 'test@startupxyz.com',
							domain: 'startupxyz.com',
							provider: 'Outlook',
							reason: 'User unknown',
							bounceType: 'hard',
							timestamp: '2024-01-20 13:15',
							rawMessageId: 'msg_123456790',
							campaign: 'Developer Recruitment',
						},
					],
				},
				{
					id: '2',
					reason: 'Mailbox full',
					count: 67,
					percentage: 19.4,
					examples: [
						{
							id: 3,
							email: 'sarah@techcorp.com',
							domain: 'techcorp.com',
							provider: 'Gmail',
							reason: 'Mailbox full',
							bounceType: 'soft',
							timestamp: '2024-01-20 12:45',
							rawMessageId: 'msg_123456791',
							campaign: 'Q1 Tech Outreach',
						},
					],
				},
				{
					id: '3',
					reason: 'Domain not found',
					count: 45,
					percentage: 13.0,
					examples: [
						{
							id: 4,
							email: 'contact@invalid-domain.com',
							domain: 'invalid-domain.com',
							provider: 'Gmail',
							reason: 'Domain not found',
							bounceType: 'hard',
							timestamp: '2024-01-20 11:30',
							rawMessageId: 'msg_123456792',
							campaign: 'Q1 Tech Outreach',
						},
					],
				},
				{
					id: '4',
					reason: 'Spam detected',
					count: 34,
					percentage: 9.9,
					examples: [
						{
							id: 5,
							email: 'info@startupxyz.com',
							domain: 'startupxyz.com',
							provider: 'Yahoo',
							reason: 'Spam detected',
							bounceType: 'soft',
							timestamp: '2024-01-20 10:15',
							rawMessageId: 'msg_123456793',
							campaign: 'Developer Recruitment',
						},
					],
				},
				{
					id: '5',
					reason: 'Other',
					count: 43,
					percentage: 12.5,
					examples: [],
				},
			]);

			setReputationConnectors([
				{
					id: '1',
					name: 'Spamhaus',
					type: 'blacklist',
					status: 'good',
					lastChecked: '2024-01-20 16:00',
					score: 0,
					details: 'No blacklist entries found',
					actionUrl: 'https://www.spamhaus.org/lookup/',
				},
				{
					id: '2',
					name: 'Barracuda',
					type: 'reputation',
					status: 'good',
					lastChecked: '2024-01-20 15:30',
					score: 85,
					details: 'Good reputation score',
					actionUrl: 'https://www.barracudacentral.org/lookups',
				},
				{
					id: '3',
					name: 'SORBS',
					type: 'blacklist',
					status: 'warning',
					lastChecked: '2024-01-20 15:00',
					score: 0,
					details: 'Potential listing detected',
					actionUrl: 'http://www.sorbs.net/lookup.shtml',
				},
				{
					id: '4',
					name: 'SenderScore',
					type: 'reputation',
					status: 'good',
					lastChecked: '2024-01-20 14:30',
					score: 92,
					details: 'Excellent sender reputation',
					actionUrl: 'https://www.senderscore.org/',
				},
				{
					id: '5',
					name: 'URIBL',
					type: 'blacklist',
					status: 'good',
					lastChecked: '2024-01-20 14:00',
					score: 0,
					details: 'No blacklist entries found',
					actionUrl: 'http://uribl.com/',
				},
			]);

			setLoading(false);
		}, 1000);
	}, []);

	// Filter and sort bounce pivot data
	const filteredBouncePivot = bouncePivot
		.filter((item) => {
			const matchesSearch =
				item.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.domain.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesProvider =
				providerFilter === 'all' || item.provider === providerFilter;
			const matchesDomain =
				domainFilter === 'all' || item.domain === domainFilter;
			return matchesSearch && matchesProvider && matchesDomain;
		})
		.sort((a, b) => {
			let comparison = 0;
			switch (sortBy) {
				case 'provider':
					comparison = a.provider.localeCompare(b.provider);
					break;
				case 'domain':
					comparison = a.domain.localeCompare(b.domain);
					break;
				case 'bounceRate':
					comparison = a.bounceRate - b.bounceRate;
					break;
				case 'bounceCount':
					comparison = a.bounceCount - b.bounceCount;
					break;
			}
			return sortOrder === 'asc' ? comparison : -comparison;
		});

	const getTrendIcon = (trend: string) => {
		switch (trend) {
			case 'increasing':
				return ArrowUpIcon;
			case 'decreasing':
				return ArrowDownIcon;
			default:
				return InformationCircleIcon;
		}
	};

	const getTrendColor = (trend: string) => {
		switch (trend) {
			case 'increasing':
				return 'text-danger-600';
			case 'decreasing':
				return 'text-success-600';
			default:
				return 'text-neutral-500';
		}
	};

	const getReputationStatusColor = (status: string) => {
		switch (status) {
			case 'good':
				return 'text-success-600 bg-success-50 border-success-200';
			case 'warning':
				return 'text-warning-600 bg-warning-50 border-warning-200';
			case 'critical':
				return 'text-danger-600 bg-danger-50 border-danger-200';
			default:
				return 'text-neutral-600 bg-neutral-50 border-neutral-200';
		}
	};

	const getBounceTypeColor = (type: string) => {
		return type === 'hard'
			? 'text-danger-600 bg-danger-50 border-danger-200'
			: 'text-warning-600 bg-warning-50 border-warning-200';
	};

	const handleBounceSelect = (bounceId: string) => {
		if (onBounceSelect) {
			onBounceSelect(bounceId);
		} else {
			router.push(`/bounces/${bounceId}`);
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

				{/* Charts Skeleton */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<div className="bg-white/80 backdrop-blur-sm p-6 rounded-sm border border-primary-100 shadow-primary">
						<div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
						<div className="h-64 bg-gray-200 rounded"></div>
					</div>
					<div className="bg-white/80 backdrop-blur-sm p-6 rounded-sm border border-primary-100 shadow-primary">
						<div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
						<div className="h-64 bg-gray-200 rounded"></div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 overflow-hidden">
				<div className="px-6 py-4 border-b border-primary-100 bg-primary-50/80">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h2 className="text-lg font-semibold text-gray-900 flex items-center">
								<ExclamationTriangleIcon className="h-5 w-5 mr-2 text-primary-600" />
								Deliverability & Bounce Investigation
							</h2>
							<p className="text-sm text-gray-600 mt-1">
								Monitor bounce trends and investigate deliverability issues
							</p>
						</div>

						<div className="mt-4 sm:mt-0 flex flex-row flex-wrap gap-3 justify-end">
							{/* Timeframe Selector */}
							<select
								value={selectedTimeframe}
								onChange={(e) => setSelectedTimeframe(e.target.value)}
								className="px-3 py-2 text-sm border rounded-sm focus:shadow-sm bg-white text-gray-900 focus:outline-none transition-all duration-200"
							>
								<option value="7d">Last 7 days</option>
								<option value="14d">Last 14 days</option>
								<option value="30d">Last 30 days</option>
								<option value="90d">Last 90 days</option>
							</select>

							{/* Provider Filter */}
							<select
								value={providerFilter}
								onChange={(e) => setProviderFilter(e.target.value)}
								className="px-3 py-2 text-sm border rounded-sm focus:shadow-sm bg-white text-gray-900 focus:outline-none transition-all duration-200"
							>
								<option value="all">All Providers</option>
								<option value="Gmail">Gmail</option>
								<option value="Outlook">Outlook</option>
								<option value="Yahoo">Yahoo</option>
							</select>

							{/* Domain Filter */}
							<select
								value={domainFilter}
								onChange={(e) => setDomainFilter(e.target.value)}
								className="px-3 py-2 text-sm border rounded-sm focus:shadow-sm bg-white text-gray-900 focus:outline-none transition-all duration-200"
							>
								<option value="all">All Domains</option>
								<option value="techcorp.com">techcorp.com</option>
								<option value="startupxyz.com">startupxyz.com</option>
							</select>
						</div>
					</div>
				</div>
			</div>

			{/* Bounce Trend Timeline */}
			<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
					<ChartBarIcon className="h-5 w-5 mr-2 text-primary-600" />
					Bounce Trend Timeline (by Provider & Campaign)
				</h3>
				<div className="h-64 bg-gray-50 rounded-sm flex items-center justify-center">
					<ChartBarIcon className="h-12 w-12 text-gray-400" />
					<span className="ml-2 text-gray-500">
						Bounce trend chart will be rendered here
					</span>
				</div>
				<div className="mt-4 grid grid-cols-3 gap-4 text-center">
					<div>
						<div className="text-2xl font-bold text-gray-900">
							{formatNumber(
								bounceTrends.reduce((sum, item) => sum + item.bounceCount, 0)
							)}
						</div>
						<div className="text-sm text-gray-500">Total Bounces</div>
					</div>
					<div>
						<div className="text-2xl font-bold text-primary-600">
							{formatPercentage(
								(bounceTrends.reduce((sum, item) => sum + item.bounceCount, 0) /
									bounceTrends.reduce(
										(sum, item) => sum + item.totalSends,
										0
									)) *
									100
							)}
						</div>
						<div className="text-sm text-gray-500">Average Bounce Rate</div>
					</div>
					<div>
						<div className="text-2xl font-bold text-success-600">
							{bounceTrends.length}
						</div>
						<div className="text-sm text-gray-500">Data Points</div>
					</div>
				</div>
			</div>

			{/* Bounce Pivot Analysis */}
			<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold text-gray-900 flex items-center">
						<DocumentTextIcon className="h-5 w-5 mr-2 text-primary-600" />
						Bounce Analysis by Provider & Domain
					</h3>
					<div className="relative flex items-center">
						<MagnifyingGlassIcon
							className="h-4 w-4 absolute left-3 text-primary-500"
							aria-hidden="true"
						/>
						<input
							type="text"
							placeholder="Search providers/domains"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-8 pr-4 py-2 text-sm border rounded-sm focus:shadow-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-200"
							aria-label="Search providers/domains"
						/>
					</div>
				</div>
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-primary-100">
						<thead className="bg-primary-50/50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Provider
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Domain
								</th>
								<th
									onClick={() => {
										if (sortBy === 'bounceRate') {
											setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
										} else {
											setSortBy('bounceRate');
											setSortOrder('desc');
										}
									}}
									className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-primary-100 transition-colors duration-200"
								>
									<div className="flex items-center">
										Bounce Rate
										{sortBy === 'bounceRate' &&
											(sortOrder === 'asc' ? (
												<ArrowUpIcon className="h-4 w-4 ml-1 text-primary-500" />
											) : (
												<ArrowDownIcon className="h-4 w-4 ml-1 text-primary-500" />
											))}
									</div>
								</th>
								<th
									onClick={() => {
										if (sortBy === 'bounceCount') {
											setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
										} else {
											setSortBy('bounceCount');
											setSortOrder('desc');
										}
									}}
									className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-primary-100 transition-colors duration-200"
								>
									<div className="flex items-center">
										Bounce Count
										{sortBy === 'bounceCount' &&
											(sortOrder === 'asc' ? (
												<ArrowUpIcon className="h-4 w-4 ml-1 text-primary-500" />
											) : (
												<ArrowDownIcon className="h-4 w-4 ml-1 text-primary-500" />
											))}
									</div>
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Total Sends
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Trend
								</th>
							</tr>
						</thead>
						<tbody className="bg-white/50 divide-y divide-primary-100">
							{filteredBouncePivot.map((item, index) => {
								const TrendIcon = getTrendIcon(item.trend);
								return (
									<tr
										key={`${item.provider}-${item.domain}`}
										className="hover:bg-primary-50/50 transition-colors duration-200"
									>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm font-medium text-gray-900">
												{item.provider}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-600">{item.domain}</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm font-medium text-gray-900">
												{item.bounceRate.toFixed(1)}%
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												{formatNumber(item.bounceCount)}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-600">
												{formatNumber(item.totalSends)}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center space-x-2">
												<TrendIcon
													className={`h-4 w-4 ${getTrendColor(item.trend)}`}
												/>
												<span
													className={`text-sm ${getTrendColor(item.trend)}`}
												>
													{item.trend.charAt(0).toUpperCase() +
														item.trend.slice(1)}
												</span>
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>

			{/* Top Bounce Reasons and Sample Raw Messages */}
			<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
					<ExclamationTriangleIcon className="h-5 w-5 mr-2 text-primary-600" />
					Top Bounce Reasons and Sample Raw Messages
				</h3>
				<div className="space-y-4">
					{bounceReasons.map((reason) => (
						<div
							key={reason.id}
							className="border border-primary-200 rounded-sm p-4"
						>
							<div className="flex items-center justify-between mb-3">
								<div>
									<h4 className="text-sm font-medium text-gray-900">
										{reason.reason}
									</h4>
									<p className="text-xs text-gray-500">
										{formatNumber(reason.count)} bounces (
										{reason.percentage.toFixed(1)}%)
									</p>
								</div>
							</div>
							{reason.examples.length > 0 && (
								<div className="space-y-2">
									{reason.examples.map((example) => (
										<div key={example.id} className="bg-gray-50 rounded-sm p-3">
											<div className="flex items-start justify-between mb-2">
												<div className="flex-1">
													<div className="text-sm font-medium text-gray-900">
														{example.email}
													</div>
													<div className="text-xs text-gray-500">
														{example.domain} • {example.provider} •{' '}
														{example.campaign}
													</div>
												</div>
												<span
													className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getBounceTypeColor(
														example.bounceType
													)}`}
												>
													{example.bounceType.charAt(0).toUpperCase() +
														example.bounceType.slice(1)}
												</span>
											</div>
											<div className="text-xs text-gray-600 mb-2">
												Reason: {example.reason}
											</div>
											<div className="flex items-center justify-between text-xs text-gray-500">
												<span>
													{new Date(example.timestamp).toLocaleString()}
												</span>
												<button
													className="text-primary-600 hover:text-primary-900 transition-colors duration-200"
													onClick={() =>
														handleBounceSelect(example.id.toString())
													}
												>
													Trace: {example.rawMessageId}
												</button>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					))}
				</div>
			</div>

			{/* IP/Domain Reputation Connectors Panel */}
			<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
					<ShieldCheckIcon className="h-5 w-5 mr-2 text-primary-600" />
					IP/Domain Reputation Connectors
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{reputationConnectors.map((connector) => (
						<div
							key={connector.id}
							className="border border-primary-200 rounded-sm p-4"
						>
							<div className="flex items-start justify-between mb-3">
								<div className="flex-1">
									<h4 className="text-sm font-medium text-gray-900">
										{connector.name}
									</h4>
									<p className="text-xs text-gray-500 capitalize">
										{connector.type.replace('_', ' ')}
									</p>
								</div>
								<span
									className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getReputationStatusColor(
										connector.status
									)}`}
								>
									{connector.status.charAt(0).toUpperCase() +
										connector.status.slice(1)}
								</span>
							</div>
							<div className="space-y-2">
								<div className="text-xs text-gray-600">
									Last checked:{' '}
									{new Date(connector.lastChecked).toLocaleString()}
								</div>
								{connector.score !== undefined && (
									<div className="text-xs text-gray-600">
										Score: {connector.score}
									</div>
								)}
								<div className="text-xs text-gray-600">{connector.details}</div>
								{connector.actionUrl && (
									<a
										href={connector.actionUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center text-xs text-primary-600 hover:text-primary-900 transition-colors duration-200"
									>
										<LinkIcon className="h-3 w-3 mr-1" />
										Check {connector.name}
									</a>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
