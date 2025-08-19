('use client');

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
} from '@heroicons/react/24/outline';
import {
	ChartBarIcon as ChartBarSolidIcon,
	EnvelopeIcon as EnvelopeSolidIcon,
	CheckCircleIcon as CheckCircleSolidIcon,
	ExclamationTriangleIcon as ExclamationTriangleSolidIcon,
} from '@heroicons/react/24/solid';
import { formatPercentage, formatNumber } from '@/lib/utils';
// import { TimeSeriesChart, PlatformBreakdown } from './ChartComponents';
import DateRangeFilter from '../Common/DatePicker';

interface ExecutiveOverviewProps {
	timeFilter: any;
	preset?: string;
}

interface KPIMetric {
	id: string;
	label: string;
	value: number;
	change: number;
	changeType: 'positive' | 'negative' | 'neutral';
	subtitle: string;
	icon: any;
	format: 'percentage' | 'number' | 'ratio';
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
	const [loading, setLoading] = useState(true);

	// Mock data for demonstration
	useEffect(() => {
		setLoading(true);

		// Simulate API call
		setTimeout(() => {
			setKpiData([
				{
					id: 'reply-rate',
					label: 'Reply Rate',
					value: 12.4,
					change: 2.1,
					changeType: 'positive',
					subtitle: 'vs last period',
					icon: EnvelopeIcon,
					format: 'percentage',
					trend: 'up',
				},
				{
					id: 'reply-count',
					label: 'Total Replies',
					value: 1247,
					change: -5.2,
					changeType: 'negative',
					subtitle: 'vs last period',
					icon: CheckCircleIcon,
					format: 'number',
					trend: 'down',
				},
				{
					id: 'positive-rate',
					label: 'Positive Reply Rate',
					value: 68.3,
					change: 1.8,
					changeType: 'positive',
					subtitle: 'vs last period',
					icon: CheckCircleSolidIcon,
					format: 'percentage',
					trend: 'up',
				},
				{
					id: 'bounce-rate',
					label: 'Bounce Rate',
					value: 3.2,
					change: -0.5,
					changeType: 'positive',
					subtitle: 'vs last period',
					icon: ExclamationTriangleIcon,
					format: 'percentage',
					trend: 'down',
				},
				{
					id: 'emails-sent',
					label: 'Emails Sent',
					value: 10047,
					change: 12.3,
					changeType: 'positive',
					subtitle: 'vs last period',
					icon: EnvelopeSolidIcon,
					format: 'number',
					trend: 'up',
				},
				{
					id: 'unique-leads',
					label: 'Unique Leads',
					value: 8234,
					change: 8.7,
					changeType: 'positive',
					subtitle: 'vs last period',
					icon: UsersIcon,
					format: 'number',
					trend: 'up',
				},
			]);

			setTopClients([
				{
					id: 1,
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
				},
				{
					id: 2,
					Domain: 'terraboost.com',
					Company_Name: 'Terraboost',
					Primary_Email: 'hello@terraboost.com',
					Primary_Number: '+1-555-0124',
					Contact_Title: 'CTO',
					Industry: 'Agriculture',
					Services: 'Farming Solutions',
					Onboarding_Date: '2024-01-10',
					instantly_api: 'api_key_4',
					bison_api: 'api_key_5',
					instantly_api_v2: 'api_key_6',
				},
				{
					id: 3,
					Domain: 'shipwithmina.com',
					Company_Name: 'Ship with mina',
					Primary_Email: 'info@shipwithmina.com',
					Primary_Number: '+1-555-0125',
					Contact_Title: 'Operations Manager',
					Industry: 'Logistics',
					Services: 'Shipping Solutions',
					Onboarding_Date: '2024-01-05',
					instantly_api: 'api_key_7',
					bison_api: 'api_key_8',
					instantly_api_v2: 'api_key_9',
				},
			]);

			setAlerts([
				{
					id: '1',
					type: 'warning',
					message: '3 clients with bounce rate > 5%',
					client: 'Ship with mina',
					metric: 'bounce_rate',
				},
				{
					id: '2',
					type: 'error',
					message: 'Reply rate dropped 15% for TechCorp',
					client: 'N2',
					metric: 'reply_rate',
				},
				{
					id: '3',
					type: 'info',
					message: '5 campaigns need attention',
					metric: 'campaigns',
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
		if (label.includes('Reply Rate')) return 'bg-primary-50';
		if (label.includes('Total Replies')) return 'bg-success-50';
		if (label.includes('Positive')) return 'bg-secondary-50';
		if (label.includes('Bounce')) return 'bg-warning-50';
		if (label.includes('Emails Sent')) return 'bg-primary-50';
		if (label.includes('Unique Leads')) return 'bg-neutral-50';
		return 'bg-neutral-100';
	};

	const getIconColor = (label: string) => {
		if (label.includes('Reply Rate')) return 'text-primary-600';
		if (label.includes('Total Replies')) return 'text-success-600';
		if (label.includes('Positive')) return 'text-secondary-600';
		if (label.includes('Bounce')) return 'text-warning-600';
		if (label.includes('Emails Sent')) return 'text-primary-600';
		if (label.includes('Unique Leads')) return 'text-neutral-600';
		return 'text-neutral-600';
	};

	const formatValue = (metric: KPIMetric) => {
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
				return 'text-success-600 bg-success-50';
			case 'paused':
				return 'text-warning-600 bg-warning-50';
			case 'warning':
				return 'text-danger-600 bg-danger-50';
			default:
				return 'text-neutral-600 bg-neutral-50';
		}
	};

	const getAlertIcon = (type: string) => {
		switch (type) {
			case 'warning':
				return ExclamationTriangleIcon;
			case 'error':
				return ExclamationCircleIcon;
			case 'info':
				return BellIcon;
			default:
				return BellIcon;
		}
	};

	const getAlertColor = (type: string) => {
		switch (type) {
			case 'warning':
				return 'text-warning-600 bg-warning-50 border-warning-200';
			case 'error':
				return 'text-danger-600 bg-danger-50 border-danger-200';
			case 'info':
				return 'text-primary-600 bg-primary-50 border-primary-200';
			default:
				return 'text-neutral-600 bg-neutral-50 border-neutral-200';
		}
	};

	const handleMetricToggle = (metric: string) => {
		setSelectedMetrics((prev) =>
			prev.includes(metric)
				? prev.filter((m) => m !== metric)
				: [...prev, metric]
		);
	};

	if (loading) {
		return (
			<div className="space-y-6 animate-pulse">
				{/* Header Skeleton */}
				<div className="flex flex-wrap gap-4 items-center justify-between">
					<div className="h-10 bg-gray-200 rounded-lg w-64"></div>
					<div className="flex gap-2">
						<div className="h-10 bg-gray-200 rounded-lg w-32"></div>
						<div className="h-10 bg-gray-200 rounded-lg w-32"></div>
						<div className="h-10 bg-gray-200 rounded-lg w-24"></div>
					</div>
				</div>

				{/* KPI Cards Skeleton */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
					{[...Array(6)].map((_, index) => (
						<div
							key={index}
							className="bg-white rounded-xl border border-gray-100 p-6"
						>
							<div className="flex items-center justify-between mb-4">
								<div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
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

	return (
		<div className="space-y-6">
			{/* Header with Filters */}
			<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 overflow-hidden">
				<div className="px-6 py-4 border-b border-primary-100 bg-primary-50/80">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h2 className="text-lg font-semibold text-gray-900 flex items-center">
								Executive Overview
							</h2>
							<p className="text-sm text-gray-600 mt-1">
								Last updated: {new Date().toLocaleTimeString()}
							</p>
						</div>

						<div className="mt-4 sm:mt-0 flex flex-row flex-wrap gap-3 justify-end">
							{/* Client Selector */}
							<div className="relative flex items-center">
								<FunnelIcon
									className="h-4 w-4 absolute left-3 text-primary-500"
									aria-hidden="true"
								/>
								<select
									value={selectedClient}
									onChange={(e) => setSelectedClient(e.target.value)}
									className="pl-8 pr-4 py-2 text-sm border rounded-sm focus:shadow-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-200"
									aria-label="Filter by client"
								>
									<option value="all">All Clients</option>
									<option value="techcorp">N2</option>
									<option value="global">Terraboost</option>
									<option value="startup">Ship with mina</option>
								</select>
							</div>

							{/* Platform Toggle */}
							<div className="flex bg-white/80 backdrop-blur-sm border border-primary-200 rounded-sm p-1">
								{['all', 'instantly', 'bison', 'mixed'].map((platform) => (
									<button
										key={platform}
										onClick={() => setSelectedPlatform(platform)}
										className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors duration-200 ${
											selectedPlatform === platform
												? 'bg-primary-100 text-primary-700 shadow-sm'
												: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
										}`}
									>
										{platform.charAt(0).toUpperCase() + platform.slice(1)}
									</button>
								))}
							</div>

							{/* Timeframe Picker */}
							{/* <div className="flex bg-white/80 backdrop-blur-sm border border-primary-200 rounded-sm p-1">
								{['7', '14', '30', '90', 'custom'].map((days) => (
									<button
										key={days}
										onClick={() => setTimeframe(days)}
										className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors duration-200 ${
											timeframe === days
												? 'bg-primary-100 text-primary-700 shadow-sm'
												: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
										}`}
									>
										{days === 'custom' ? 'Custom' : `${days}d`}
									</button>
								))}
							</div> */}
							<DateRangeFilter />
						</div>
					</div>
				</div>
			</div>

			{/* KPI Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
				{kpiData.map((metric, index) => {
					const Icon = metric.icon;
					const ChangeIcon = getChangeIcon(metric.changeType);
					const changeColor = getChangeColor(metric.changeType);
					const iconBg = getIconBackground(metric.label);
					const iconColor = getIconColor(metric.label);

					return (
						<div
							key={metric.id}
							className="group bg-white/80 backdrop-blur-sm p-4 rounded-sm border border-primary-100 shadow-primary hover:shadow-primary-lg hover:border-primary-200 transition-all duration-200 cursor-pointer relative"
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

			{/* Secondary KPI */}
			<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="text-lg font-semibold text-gray-900">
							Send → Positive Ratio
						</h3>
						<p className="text-sm text-gray-500">
							Efficiency metric for campaign performance
						</p>
					</div>
					<div className="text-right">
						<div className="text-3xl font-bold text-primary-600">1 per 8.1</div>
						<div className="flex items-center justify-end space-x-1 text-success-600">
							<ArrowTrendingUpIcon className="h-4 w-4" />
							<span className="text-sm font-medium">+0.3</span>
						</div>
					</div>
				</div>
			</div>

			{/* Charts Row */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Time Series Chart */}
				<div className="lg:col-span-2 bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-semibold text-gray-900">
							Performance Timeline
						</h3>
					</div>
					{/* <TimeSeriesChart
						data={[]}
						selectedMetrics={selectedMetrics}
						onMetricToggle={handleMetricToggle}
					/> */}
				</div>

				{/* Platform Breakdown */}
				<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">
						Platform Breakdown
					</h3>
					{/* <PlatformBreakdown
						data={[
							{
								platform: 'Instantly',
								percentage: 45,
								color: '#3b82f6',
								value: 4521,
							},
							{
								platform: 'Bison',
								percentage: 35,
								color: '#22c55e',
								value: 3517,
							},
							{
								platform: 'Missive',
								percentage: 20,
								color: '#f59e0b',
								value: 2009,
							},
						]}
					/> */}
				</div>
			</div>

			{/* Top Clients Table */}
			<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 overflow-hidden">
				{/* Header */}
				<div className="px-6 py-4 border-b border-primary-100 bg-primary-50/80">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h2 className="text-lg font-semibold text-gray-900 flex items-center">
								Top Clients Performance
							</h2>
							<p className="text-sm text-gray-600 mt-1">
								{topClients.length} clients showing best performance
							</p>
						</div>
						<div className="mt-4 sm:mt-0">
							<button className="btn btn-primary inline-flex items-center">
								View All Clients
							</button>
						</div>
					</div>
				</div>

				{/* Table */}
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

			{/* Action Band */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Quick Actions */}
				<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">
						Quick Actions
					</h3>
					<div className="space-y-3">
						<button className="w-full flex items-center justify-between p-3 text-left bg-warning-50 border border-warning-200 rounded-sm hover:bg-warning-100 transition-colors duration-200">
							<div>
								<div className="font-medium text-warning-800">
									Pause High Bounce Campaigns
								</div>
								<div className="text-sm text-warning-600">
									3 campaigns with bounce rate &gt; 5%
								</div>
							</div>
							<PauseIcon className="h-5 w-5 text-warning-600" />
						</button>
						<button className="w-full flex items-center justify-between p-3 text-left bg-primary-50 border border-primary-200 rounded-sm hover:bg-primary-100 transition-colors duration-200">
							<div>
								<div className="font-medium text-primary-800">Assign Tasks</div>
								<div className="text-sm text-primary-600">
									5 clients need attention
								</div>
							</div>
							<UsersIcon className="h-5 w-5 text-primary-600" />
						</button>
						<button className="w-full flex items-center justify-between p-3 text-left bg-success-50 border border-success-200 rounded-sm hover:bg-success-100 transition-colors duration-200">
							<div>
								<div className="font-medium text-success-800">
									Backfill Data
								</div>
								<div className="text-sm text-success-600">
									Last 30 days missing
								</div>
							</div>
							<PlayIcon className="h-5 w-5 text-success-600" />
						</button>
					</div>
				</div>

				{/* Alerts */}
				<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-semibold text-gray-900">
							Active Alerts
						</h3>
						<span className="text-sm text-gray-500">
							{alerts.length} active
						</span>
					</div>
					<div className="space-y-3">
						{alerts.map((alert) => {
							const AlertIcon = getAlertIcon(alert.type);
							return (
								<div
									key={alert.id}
									className={`flex items-start space-x-3 p-3 rounded-sm border ${getAlertColor(
										alert.type
									)}`}
								>
									<AlertIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
									<div className="flex-1">
										<div className="text-sm font-medium">{alert.message}</div>
										{alert.client && (
											<div className="text-xs mt-1">
												Client:{' '}
												<span className="font-medium">{alert.client}</span>
											</div>
										)}
									</div>
									<button className="text-xs font-medium hover:underline transition-colors duration-200">
										View
									</button>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}
