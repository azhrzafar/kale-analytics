'use client';

import React, { useState, useEffect } from 'react';
import DateRangeFilter from '../../Common/DatePicker';
import { useClients } from '@/lib/hooks/useClients';
import {
	KPICards,
	PlatformPerformance,
	SendVolumeTrends,
	TopPerformingClients,
	QuickActions,
} from './parts';

import { KPIMetric, AlertData, PlatformData } from './utils/types';
import { parseKpiData } from './utils/misc';
import { DateRange } from '@/lib/types';
import { useDateFilter } from '@/lib/appContext';

export default function ExecutiveOverview() {
	const {
		dateFilter: { preset, range },
	} = useDateFilter();
	const [selectedClient, setSelectedClient] = useState('all');
	const [selectedPlatform, setSelectedPlatform] = useState('all');

	// Separate loading states for different sections
	const [kpiLoading, setKpiLoading] = useState(true);
	const [platformLoading, setPlatformLoading] = useState(true);
	const [timeSeriesLoading, setTimeSeriesLoading] = useState(true);

	// Data states
	const [kpiData, setKpiData] = useState<KPIMetric[]>([]);
	const [alerts, setAlerts] = useState<AlertData[]>([]);
	const [platformData, setPlatformData] = useState<PlatformData[]>([]);
	const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);

	const { clients, loading: clientsLoading } = useClients();

	// Fetch KPI data
	const fetchKpiData = async ({
		platform,
		client,
		date,
	}: {
		platform: string;
		client: string;
		date: DateRange;
	}) => {
		setKpiLoading(true);
		try {
			const response = await fetch(
				`/api/analytics/kpi?platform=${platform}&clientId=${client}&startDate=${date.startDate}&endDate=${date.endDate}`
			);
			const { data } = await response.json();

			setKpiData(parseKpiData(data) as KPIMetric[]);
		} catch (error) {
			console.error('Error fetching KPI data:', error);
		} finally {
			setKpiLoading(false);
		}
	};

	// Fetch platform data
	const fetchPlatformData = async (
		{
			date,
			client,
		}: {
			date: DateRange;
			client: string;
		} = { date: range, client: selectedClient }
	) => {
		setPlatformLoading(true);
		try {
			const response = await fetch(
				`/api/analytics/platform-performance?startDate=${date.startDate}&endDate=${date.endDate}&clientId=${client}`
			);
			const { data } = await response.json();
			setPlatformData(data);
		} catch (error) {
			console.error('Error fetching platform performance data:', error);
		} finally {
			setPlatformLoading(false);
		}
	};

	// Fetch time series data
	const fetchTimeSeriesData = async ({
		platform,
		client,
		date,
	}: {
		platform: string;
		client: string;
		date: DateRange;
	}) => {
		setTimeSeriesLoading(true);
		try {
			const response = await fetch(
				`/api/analytics/send-volume-trends?platform=${platform}&clientId=${client}&startDate=${date.startDate}&endDate=${date.endDate}`
			);
			const { data } = await response.json();
			setTimeSeriesData(data);
		} catch (error) {
			console.error('Error fetching time series data:', error);
		} finally {
			setTimeSeriesLoading(false);
		}
	};

	// Fetch alerts
	const fetchAlerts = async () => {
		try {
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
		} catch (error) {
			console.error('Error fetching alerts:', error);
		}
	};

	// Load KPI and time series data when filters change
	useEffect(() => {
		fetchKpiData({
			platform: selectedPlatform,
			client: selectedClient,
			date: range,
		});

		fetchTimeSeriesData({
			platform: selectedPlatform,
			client: selectedClient,
			date: range,
		});
	}, [range, preset, selectedClient, selectedPlatform]);

	// Load platform data only when date range or client changes
	useEffect(() => {
		fetchPlatformData({ date: range, client: selectedClient });
	}, [range, selectedClient]);

	// Load alerts on component mount
	useEffect(() => {
		fetchAlerts();
	}, []);

	return (
		<div className="space-y-6">
			{/* Header with filters */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">
						Executive Overview
					</h1>
					<p className="text-gray-600">
						Comprehensive analytics and performance insights
					</p>
				</div>
				<div className="flex items-center space-x-4">
					<select
						value={selectedClient}
						onChange={(e) => setSelectedClient(e.target.value)}
						className="px-3 py-2 text-sm border rounded-sm focus:shadow-sm bg-white text-gray-900 focus:outline-none transition-all duration-200"
					>
						<option value="all">All Clients</option>
						{clients.map((client) => (
							<option key={client.id} value={client.id}>
								{client['Company Name']}
							</option>
						))}
					</select>
					{/* Platform Toggle */}
					<div className="flex bg-white/80 backdrop-blur-sm border border-primary-200 rounded-sm p-1">
						{['all', 'instantly', 'bison'].map((platform) => (
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
					<DateRangeFilter />
				</div>
			</div>

			{/* Main content grid */}
			<div className="grid grid-cols-1 gap-6">
				<KPICards kpiData={kpiData} loading={kpiLoading} />
				<PlatformPerformance data={platformData} loading={platformLoading} />
				<SendVolumeTrends data={timeSeriesData} loading={timeSeriesLoading} />
				<div className="grid grid-cols-2 gap-6">
					<TopPerformingClients />
					<QuickActions />
				</div>
			</div>
		</div>
	);
}
