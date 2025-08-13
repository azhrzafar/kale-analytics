'use client';

import React, { useState, useEffect } from 'react';
import {
	ChartBarIcon,
	EnvelopeIcon,
	CheckCircleIcon,
	ExclamationTriangleIcon,
	ArrowTrendingUpIcon,
	ArrowTrendingDownIcon,
	MinusIcon,
	FunnelIcon,
	CalendarIcon,
	UsersIcon,
	BellIcon,
	PlayIcon,
	PauseIcon,
	ExclamationCircleIcon,
	EyeIcon,
	MagnifyingGlassIcon,
	BuildingOfficeIcon,
	GlobeAltIcon,
	InformationCircleIcon,
} from '@heroicons/react/24/outline';
import {
	ChartBarIcon as ChartBarSolidIcon,
	EnvelopeIcon as EnvelopeSolidIcon,
	CheckCircleIcon as CheckCircleSolidIcon,
	ExclamationTriangleIcon as ExclamationTriangleSolidIcon,
} from '@heroicons/react/24/solid';
import { formatPercentage, formatNumber } from '@/lib/utils';
import { TimeSeriesChart, PlatformBreakdown } from './ChartComponents';
import DateRangeFilter from '../Common/DatePicker';

interface ExecutiveOverviewProps {
	timeFilter: any;
	preset?: string;
}

interface KPIMetric {
	id: string;
	label: string;
	value: number;
	change?: number;
	changeType?: 'positive' | 'negative' | 'neutral';
	subtitle?: string;
	icon?: any;
	format?: 'percentage' | 'number' | 'ratio';
	trend?: 'up' | 'down' | 'stable';
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

interface AlertData {
	id: string;
	type: 'warning' | 'error' | 'info';
	message: string;
	client?: string;
	metric?: string;
}

interface PlatformData {
	platform: string;
	sends: number;
	replies: number;
	replyRate: number;
	bounceRate: number;
	leads: number;
}

export default function ExecutiveOverview({
	timeFilter,
	preset,
}: ExecutiveOverviewProps) {
	const [selectedClient, setSelectedClient] = useState('all');
	const [selectedPlatform, setSelectedPlatform] = useState('all');
	const [timeframe, setTimeframe] = useState('30');
	const [selectedMetrics, setSelectedMetrics] = useState([
		'emails',
		'replies',
		'positive',
		'bounces',
	]);
	const [kpiData, setKpiData] = useState<KPIMetric[]>([]);
	const [topClients, setTopClients] = useState<ClientData[]>([]);
	const [alerts, setAlerts] = useState<AlertData[]>([]);
	const [platformData, setPlatformData] = useState<PlatformData[]>([]);
	const [loading, setLoading] = useState(true);

	// Mock data based on actual Supabase data volumes
	useEffect(() => {
		setLoading(true);

		// Simulate API call
		setTimeout(() => {
			// Core five metrics from client conversation
			setKpiData([
				{
					id: 'emails-sent',
					label: 'Emails Sent',
					value: 627560,
					// change: 8.7,
					// changeType: 'positive',
					// subtitle: 'vs last period',
					icon: EnvelopeSolidIcon,
					format: 'number',
					trend: 'up',
				},
				{
					id: 'contacts-reached',
					label: 'Unique Leads Contacted',
					value: 485000,
					// change: 6.2,
					// changeType: 'positive',
					// subtitle: 'vs last period',
					icon: UsersIcon,
					format: 'number',
					trend: 'up',
				},
				{
					id: 'total-replies',
					label: 'Reply Count',
					value: 56032,
					change: 15.2,
					// changeType: 'positive',
					icon: CheckCircleIcon,
					format: 'number',
					trend: 'up',
				},

				{
					id: 'positive-replies',
					label: 'Positive Reply Count',
					value: 40230,
					change: 18.7,
					// changeType: 'positive',
					icon: CheckCircleSolidIcon,
					format: 'number',
					trend: 'up',
				},

				{
					id: 'bounce-count',
					label: 'Bounce Count',
					value: 6543,
					change: -5.2,
					icon: ExclamationTriangleIcon,
					format: 'number',
					trend: 'down',
				},

				{
					id: 'send-to-positive-ratio',
					label: 'Send→Positive Ratio',
					value: 8.1,
					// change: -0.3,
					// changeType: 'positive',
					// subtitle: 'vs last period (1:8.1)',
					icon: FunnelIcon,
					format: 'ratio',
					trend: 'up',
				},
			]);

			// Platform performance data based on actual volumes
			setPlatformData([
				{
					platform: 'Bison',
					sends: 316121,
					replies: 7957,
					replyRate: 2.5,
					bounceRate: 1.8,
					leads: 285000,
				},
				{
					platform: 'Instantly',
					sends: 5719,
					replies: 24037,
					replyRate: 420.2,
					bounceRate: 2.1,
					leads: 185000,
				},
				{
					platform: 'Missive',
					sends: 5720,
					replies: 24038,
					replyRate: 420.2,
					bounceRate: 1.9,
					leads: 132320,
				},
			]);

			// Top clients based on actual data
			setTopClients([
				{
					id: 1,
					Domain: 'techcorp.com',
					Company_Name: 'TechCorp Solutions',
					Primary_Email: 'contact@techcorp.com',
					Primary_Number: '+1-555-0123',
					Contact_Title: 'CEO',
					Industry: 'Technology',
					Services: 'Software Development',
					Onboarding_Date: '2024-01-15',
					instantly_api: 'api_key_1',
					bison_api: 'api_key_2',
					instantly_api_v2: 'api_key_3',
				},
				{
					id: 2,
					Domain: 'innovate.com',
					Company_Name: 'Innovate Labs',
					Primary_Email: 'hello@innovate.com',
					Primary_Number: '+1-555-0124',
					Contact_Title: 'CTO',
					Industry: 'Technology',
					Services: 'AI Solutions',
					Onboarding_Date: '2024-01-10',
					instantly_api: 'api_key_4',
					bison_api: 'api_key_5',
					instantly_api_v2: 'api_key_6',
				},
				{
					id: 3,
					Domain: 'startup.com',
					Company_Name: 'StartupXYZ',
					Primary_Email: 'info@startup.com',
					Primary_Number: '+1-555-0125',
					Contact_Title: 'Operations Manager',
					Industry: 'Startup',
					Services: 'Growth Solutions',
					Onboarding_Date: '2024-01-05',
					instantly_api: 'api_key_7',
					bison_api: 'api_key_8',
					instantly_api_v2: 'api_key_9',
				},
			]);

			// Alerts based on actual data patterns
			setAlerts([
				{
					id: '1',
					type: 'warning',
					message: 'Bison platform showing 15% lower reply rates',
					client: 'TechCorp Solutions',
					metric: 'reply_rate',
				},
				{
					id: '2',
					type: 'info',
					message: 'Instantly campaigns performing 420% above average',
					metric: 'platform_performance',
				},
				{
					id: '3',
					type: 'error',
					message: '3 clients with bounce rates > 5% detected',
					client: 'StartupXYZ',
					metric: 'bounce_rate',
				},
				{
					id: '4',
					type: 'info',
					message: '602K+ leads processed this month',
					metric: 'lead_volume',
				},
			]);

			setLoading(false);
		}, 1000);
	}, [timeFilter, preset]);

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
		if (label.includes('Total Leads')) return 'bg-primary-50';
		if (label.includes('Total Sends')) return 'bg-success-50';
		if (label.includes('Total Replies')) return 'bg-secondary-50';
		if (label.includes('Reply Rate')) return 'bg-warning-50';
		if (label.includes('Active Inboxes')) return 'bg-info-50';
		if (label.includes('Active Campaigns')) return 'bg-neutral-50';
		return 'bg-neutral-100';
	};

	const getIconColor = (label: string) => {
		if (label.includes('Total Leads')) return 'text-primary-600';
		if (label.includes('Total Sends')) return 'text-success-600';
		if (label.includes('Total Replies')) return 'text-secondary-600';
		if (label.includes('Reply Rate')) return 'text-warning-600';
		if (label.includes('Active Inboxes')) return 'text-info-600';
		if (label.includes('Active Campaigns')) return 'text-neutral-600';
		return 'text-neutral-600';
	};

	const getAlertIcon = (type: string) => {
		switch (type) {
			case 'warning':
				return ExclamationTriangleIcon;
			case 'error':
				return ExclamationCircleIcon;
			case 'info':
				return InformationCircleIcon;
			default:
				return BellIcon;
		}
	};

	const getAlertColor = (type: string) => {
		switch (type) {
			case 'warning':
				return 'bg-warning-50 border-warning-200 text-warning-800';
			case 'error':
				return 'bg-danger-50 border-danger-200 text-danger-800';
			case 'info':
				return 'bg-primary-50 border-primary-200 text-primary-800';
			default:
				return 'bg-neutral-50 border-neutral-200 text-neutral-800';
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
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
					{Array.from({ length: 6 }).map((_, i) => (
						<div
							key={i}
							className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6"
						>
							<div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
							<div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
							<div className="h-3 bg-gray-200 rounded w-20"></div>
						</div>
					))}
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
							<h1 className="text-2xl font-bold text-gray-900">
								Executive Overview
							</h1>
							<p className="text-sm text-gray-600 mt-1">
								Cross-platform analytics across {formatNumber(137)} clients and{' '}
								{formatNumber(602320)} leads
							</p>
						</div>
						<div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
							<select
								value={selectedClient}
								onChange={(e) => setSelectedClient(e.target.value)}
								className="px-3 py-2 text-sm border rounded-sm focus:shadow-sm bg-white text-gray-900 focus:outline-none transition-all duration-200"
							>
								<option value="all">All Clients</option>
								<option value="techcorp">TechCorp Solutions</option>
								<option value="innovate">Innovate Labs</option>
								<option value="startup">StartupXYZ</option>
							</select>
							<select
								value={selectedPlatform}
								onChange={(e) => setSelectedPlatform(e.target.value)}
								className="px-3 py-2 text-sm border rounded-sm focus:shadow-sm bg-white text-gray-900 focus:outline-none transition-all duration-200"
							>
								<option value="all">All Platforms</option>
								<option value="bison">Bison</option>
								<option value="instantly">Instantly</option>
								<option value="missive">Missive</option>
							</select>
							<DateRangeFilter />
						</div>
					</div>
				</div>
			</div>

			{/* KPI Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
				{kpiData.map((metric) => {
					const ChangeIcon = getChangeIcon(metric.changeType ?? 'neutral');
					return (
						<div
							key={metric.id}
							className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6 hover:shadow-lg transition-all duration-200"
						>
							<div className="flex items-center justify-between">
								<div
									className={`p-2 rounded-sm ${getIconBackground(
										metric.label
									)}`}
								>
									<metric.icon
										className={`h-5 w-5 ${getIconColor(metric.label)}`}
									/>
								</div>
								<div
									className={`flex items-center space-x-1 ${getChangeColor(
										metric.changeType ??
											(metric.change && metric.change > 0
												? 'positive'
												: 'negative')
									)}`}
								>
									{metric.changeType && <ChangeIcon className="h-3 w-3" />}
									<span className="text-xs font-medium">
										{metric.change && metric.change > 0 ? '+' : ''}
										{metric.change && `${metric.change.toFixed(1)}%`}
									</span>
								</div>
							</div>
							<div className="mt-4">
								<div className="text-2xl font-bold text-gray-900">
									{metric.format === 'percentage'
										? `${metric.value.toFixed(1)}%`
										: metric.format === 'ratio'
										? `1:${metric.value.toFixed(1)}`
										: formatNumber(metric.value)}
								</div>
								<div className="text-sm font-medium text-gray-900">
									{metric.label}
								</div>
								<div className="text-xs text-gray-500">{metric.subtitle}</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Platform Performance Comparison */}
			<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
					<ChartBarIcon className="h-5 w-5 mr-2 text-primary-600" />
					Platform Performance Comparison
				</h3>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{platformData.map((platform) => (
						<div
							key={platform.platform}
							className="border border-primary-200 rounded-sm p-4"
						>
							<div className="flex items-center justify-between mb-3">
								<h4 className="text-lg font-semibold text-gray-900">
									{platform.platform}
								</h4>
								<span className="text-sm text-gray-500">
									{formatNumber(platform.leads)} leads
								</span>
							</div>
							<div className="space-y-3">
								<div className="flex justify-between">
									<span className="text-sm text-gray-600">Sends:</span>
									<span className="text-sm font-medium">
										{formatNumber(platform.sends)}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm text-gray-600">Replies:</span>
									<span className="text-sm font-medium">
										{formatNumber(platform.replies)}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm text-gray-600">Reply Rate:</span>
									<span className="text-sm font-medium text-success-600">
										{platform.replyRate.toFixed(1)}%
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm text-gray-600">Bounce Rate:</span>
									<span className="text-sm font-medium text-warning-600">
										{platform.bounceRate.toFixed(1)}%
									</span>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Charts Row */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Time Series Chart */}
				<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
						<ChartBarIcon className="h-5 w-5 mr-2 text-primary-600" />
						Send Volume Trends
					</h3>
					<TimeSeriesChart
						data={[
							{
								date: '2024-01-14',
								emails: 15000,
								replies: 1800,
								positive: 1200,
								bounces: 300,
							},
							{
								date: '2024-01-15',
								emails: 32000,
								replies: 4200,
								positive: 2800,
								bounces: 640,
							},
							{
								date: '2024-01-16',
								emails: 48000,
								replies: 6700,
								positive: 4500,
								bounces: 960,
							},
							{
								date: '2024-01-17',
								emails: 62000,
								replies: 8900,
								positive: 6200,
								bounces: 1240,
							},
							{
								date: '2024-01-18',
								emails: 75000,
								replies: 11200,
								positive: 7800,
								bounces: 1500,
							},
							{
								date: '2024-01-19',
								emails: 89000,
								replies: 13400,
								positive: 9500,
								bounces: 1780,
							},
							{
								date: '2024-01-20',
								emails: 102000,
								replies: 15600,
								positive: 11200,
								bounces: 2040,
							},
						]}
						selectedMetrics={selectedMetrics}
						onMetricToggle={(metric) => {
							setSelectedMetrics((prev) =>
								prev.includes(metric)
									? prev.filter((m) => m !== metric)
									: [...prev, metric]
							);
						}}
					/>
				</div>

				{/* Platform Breakdown */}
				<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
						<ChartBarIcon className="h-5 w-5 mr-2 text-primary-600" />
						Platform Distribution
					</h3>
					<PlatformBreakdown
						data={[
							{
								platform: 'Bison',
								percentage: 96.5,
								color: '#22c55e',
								value: 316121,
							},
							{
								platform: 'Instantly',
								percentage: 1.7,
								color: '#3b82f6',
								value: 5719,
							},
							{
								platform: 'Missive',
								percentage: 1.8,
								color: '#f59e0b',
								value: 5720,
							},
						]}
					/>
				</div>
			</div>

			{/* Top Clients & Alerts */}
			<div className="grid grid-cols-1 gap-6">
				{/* Top Clients */}
				<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 overflow-hidden">
					<div className="px-6 py-4 border-b border-primary-100 bg-primary-50/80">
						<h3 className="text-lg font-semibold text-gray-900 flex items-center">
							<BuildingOfficeIcon className="h-5 w-5 mr-2 text-primary-600" />
							Top Performing Clients
						</h3>
					</div>
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-primary-100">
							<thead className="bg-primary-50/50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
										Company Name
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
										Domain
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
										Industry
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
										Primary Email
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
										Onboarding Date
									</th>
									<th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white/50 divide-y divide-primary-100">
								{topClients.map((client, index) => (
									<tr
										key={client.id}
										className="hover:bg-primary-50/50 transition-colors duration-200"
										style={{ animationDelay: `${index * 50}ms` }}
									>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm font-medium text-gray-900">
												{client.Company_Name}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm font-medium text-gray-900">
												{client.Domain}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm font-medium text-gray-900">
												{client.Industry}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="text-sm text-gray-600">
												{client.Primary_Email}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="text-sm text-gray-600">
												{client.Onboarding_Date}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
											<div className="flex justify-end space-x-2">
												<button
													className="text-primary-600 hover:text-primary-900 transition-colors duration-200"
													title="View details"
												>
													<EyeIcon className="h-4 w-4" />
												</button>
												<button
													className="text-warning-600 hover:text-warning-900 transition-colors duration-200"
													title="Pause campaigns"
												>
													<PauseIcon className="h-4 w-4" />
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{/* Action Band */}
			<div className="grid grid-cols-1 gap-6">
				{/* Quick Actions */}
				<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">
						Quick Actions
					</h3>
					<div className="space-y-3">
						<button className="w-full flex items-center justify-between p-3 text-left bg-warning-50 border border-warning-200 rounded-sm hover:bg-warning-100 transition-colors duration-200">
							<div>
								<div className="font-medium text-warning-800">
									Optimize Bison Performance
								</div>
								<div className="text-sm text-warning-600">
									Reply rates 15% below average
								</div>
							</div>
							<ChartBarIcon className="h-5 w-5 text-warning-600" />
						</button>
						<button className="w-full flex items-center justify-between p-3 text-left bg-primary-50 border border-primary-200 rounded-sm hover:bg-primary-100 transition-colors duration-200">
							<div>
								<div className="font-medium text-primary-800">
									Scale Instantly Campaigns
								</div>
								<div className="text-sm text-primary-600">
									420% above average performance
								</div>
							</div>
							<PlayIcon className="h-5 w-5 text-primary-600" />
						</button>
						<button className="w-full flex items-center justify-between p-3 text-left bg-success-50 border border-success-200 rounded-sm hover:bg-success-100 transition-colors duration-200">
							<div>
								<div className="font-medium text-success-800">
									Lead Quality Analysis
								</div>
								<div className="text-sm text-success-600">
									602K+ leads to analyze
								</div>
							</div>
							<UsersIcon className="h-5 w-5 text-success-600" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
