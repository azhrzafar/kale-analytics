'use client';

import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Tooltip,
	Legend,
	Filler,
} from 'chart.js';
import { getPresetLabels } from '@/lib/utils';
import { DateRangePreset } from '@/lib/types';
import { useDateFilter } from '@/lib/appContext';

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Tooltip,
	Legend,
	Filler
);

interface SendVolumeTrendsProps {
	data: any[];
	loading: boolean;
}

export default function SendVolumeTrends({
	data,
	loading,
}: SendVolumeTrendsProps) {
	const {
		dateFilter: { preset, range },
	} = useDateFilter();
	const [trendData, setTrendData] = useState<any[]>([]);
	const [selectedMetrics, setSelectedMetrics] = useState([
		'replies',
		'positive',
		'bounces',
	]);

	useEffect(() => {
		if (data) {
			setTrendData(data);
		}
	}, [data]);

	if (loading) {
		return (
			<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
				<div className="flex items-center justify-between mb-6">
					<h3 className="text-lg font-semibold text-gray-900">
						Send Volume Trends
					</h3>
					<div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
				</div>
				<div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
			</div>
		);
	}

	const metrics = [
		{
			key: 'emails',
			label: 'Emails',
			color: 'bg-primary-500',
			gradient: 'from-primary-500 to-primary-400',
		},
		{
			key: 'replies',
			label: 'Replies',
			color: 'bg-success-500',
			gradient: 'from-success-500 to-success-400',
		},
		{
			key: 'positive',
			label: 'Positive',
			color: 'bg-purple-500',
			gradient: 'from-purple-500 to-purple-400',
		},
		{
			key: 'bounces',
			label: 'Bounces',
			color: 'bg-warning-500',
			gradient: 'from-warning-500 to-warning-400',
		},
	];

	// Build Chart.js datasets
	interface TrendPoint {
		date: string;
		emails: number;
		replies: number;
		positive: number;
		bounces: number;
	}

	const labels = trendData.map((d) =>
		new Date(d.date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
		})
	);

	const colorMap: Record<string, { border: string; bg: string }> = {
		emails: { border: '#0ea5e9', bg: 'rgba(14,165,233,0.12)' }, // primary-500
		replies: { border: '#22c55e', bg: 'rgba(34,197,94,0.12)' }, // success-500
		positive: { border: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' }, // purple-500
		bounces: { border: '#f59e0b', bg: 'rgba(245,158,11,0.12)' }, // warning-500
	};

	const metricToKey: Record<string, keyof TrendPoint> = {
		emails: 'emails',
		replies: 'replies',
		positive: 'positive',
		bounces: 'bounces',
	};

	const datasets = ['emails', 'replies', 'positive', 'bounces']
		.filter((m) => selectedMetrics.includes(m))
		.map((m) => ({
			label: m.charAt(0).toUpperCase() + m.slice(1),
			data: trendData.map((d) => Number(d[metricToKey[m]]) || 0),
			borderColor: colorMap[m].border,
			backgroundColor: colorMap[m].bg,
			fill: false,
			tension: 0.25,
			pointRadius: 1.5,
			pointHoverRadius: 3,
			borderWidth: 1.5,
		}));

	const chartData = { labels, datasets } as const;

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		interaction: { mode: 'index' as const, intersect: false },
		plugins: {
			legend: { display: false },
			tooltip: {
				callbacks: {
					label: (ctx: any) =>
						`${ctx.dataset.label}: ${Number(ctx.parsed.y).toLocaleString()}`,
				},
			},
		},
		scales: {
			x: {
				grid: { display: false },
				ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 12 },
			},
			y: {
				beginAtZero: true,
				grid: { color: 'rgba(0,0,0,0.06)' },
				ticks: { callback: (value: any) => Number(value).toLocaleString() },
			},
		},
	} as const;

	const toggleMetric = (metric: string) => {
		setSelectedMetrics((prev) => {
			if (prev.includes(metric)) {
				if (prev.length === 1) return prev;
				return prev.filter((m) => m !== metric);
			}
			return [...prev, metric];
		});
	};

	const hasLabels = Array.isArray(labels) && labels.length > 0;
	const hasSelection = selectedMetrics.length > 0;
	return (
		<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
			<div className="flex items-center justify-between mb-6">
				<h3 className="text-lg font-semibold text-gray-900">
					Send Volume Trends
				</h3>
				<div className="text-sm text-gray-500">
					{getPresetLabels(preset, range)}
				</div>
			</div>

			<div className="min-h-96 h-auto">
				<div className="space-y-4 h-auto">
					{/* Chart Controls */}
					<div className="flex flex-wrap gap-2">
						{metrics.map((metric) => (
							<button
								key={metric.key}
								onClick={() => toggleMetric(metric.key)}
								className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors duration-200 ${
									selectedMetrics.includes(metric.key)
										? 'bg-primary-100 text-primary-700 border border-primary-200 shadow-sm'
										: 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
								}`}
							>
								{metric.label}
							</button>
						))}
					</div>

					<div className="relative bg-gray-50 rounded-sm p-4">
						<div className="h-72">
							{hasLabels && hasSelection ? (
								<Line data={chartData} options={options} />
							) : hasLabels && !hasSelection ? (
								<div className="flex items-center justify-center h-full text-gray-500 text-sm">
									Select at least one metric
								</div>
							) : (
								<div className="flex items-center justify-center h-full text-gray-500 text-sm">
									No data available
								</div>
							)}
						</div>
					</div>

					{/* Legend */}
					<div className="flex flex-wrap gap-4 text-xs">
						{metrics.map((metric) => (
							<div key={metric.key} className="flex items-center space-x-2">
								<div className={`w-3 h-3 rounded-sm ${metric.color}`}></div>
								<span className="text-gray-600 font-medium">
									{metric.label}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
