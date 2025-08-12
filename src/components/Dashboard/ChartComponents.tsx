'use client';

import React from 'react';
import { ChartBarIcon, ChartPieIcon } from '@heroicons/react/24/outline';

interface TimeSeriesData {
	date: string;
	emails: number;
	replies: number;
	positive: number;
	bounces: number;
}

interface PlatformData {
	platform: string;
	percentage: number;
	color: string;
	value: number;
}

interface TimeSeriesChartProps {
	data: TimeSeriesData[];
	selectedMetrics: string[];
	onMetricToggle: (metric: string) => void;
}

interface PlatformBreakdownProps {
	data: PlatformData[];
}

export function TimeSeriesChart({
	data,
	selectedMetrics,
	onMetricToggle,
}: TimeSeriesChartProps) {
	const metrics = [
		{ key: 'emails', label: 'Emails', color: 'bg-primary-500' },
		{ key: 'replies', label: 'Replies', color: 'bg-success-500' },
		{ key: 'positive', label: 'Positive', color: 'bg-secondary-500' },
		{ key: 'bounces', label: 'Bounces', color: 'bg-warning-500' },
	];

	// Mock data for demonstration
	const mockData = [
		{
			date: '2024-01-01',
			emails: 1200,
			replies: 144,
			positive: 98,
			bounces: 38,
		},
		{
			date: '2024-01-02',
			emails: 1350,
			replies: 162,
			positive: 110,
			bounces: 41,
		},
		{
			date: '2024-01-03',
			emails: 1100,
			replies: 132,
			positive: 89,
			bounces: 33,
		},
		{
			date: '2024-01-04',
			emails: 1400,
			replies: 168,
			positive: 114,
			bounces: 42,
		},
		{
			date: '2024-01-05',
			emails: 1250,
			replies: 150,
			positive: 102,
			bounces: 38,
		},
		{
			date: '2024-01-06',
			emails: 1300,
			replies: 156,
			positive: 106,
			bounces: 39,
		},
		{
			date: '2024-01-07',
			emails: 1450,
			replies: 174,
			positive: 118,
			bounces: 44,
		},
	];

	const maxValue = Math.max(
		...mockData.flatMap((d) => [d.emails, d.replies, d.positive, d.bounces])
	);

	return (
		<div className="space-y-4">
			{/* Chart Controls */}
			<div className="flex flex-wrap gap-2">
				{metrics.map((metric) => (
					<button
						key={metric.key}
						onClick={() => onMetricToggle(metric.key)}
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

			{/* Chart Area */}
			<div className="relative h-64 bg-gray-50 rounded-sm p-4">
				{/* Y-axis labels */}
				<div className="absolute left-4 top-4 bottom-4 flex flex-col justify-between text-xs text-gray-500">
					{Array.from({ length: 5 }, (_, i) => (
						<span key={i}>
							{Math.round((maxValue * (5 - i)) / 5).toLocaleString()}
						</span>
					))}
				</div>

				{/* Chart bars */}
				<div className="ml-12 h-full flex items-end justify-between space-x-2">
					{mockData.map((day, index) => (
						<div key={index} className="flex-1 flex items-end space-x-1">
							{selectedMetrics.includes('emails') && (
								<div
									className="bg-primary-500 rounded-t-sm transition-all duration-200 hover:bg-primary-600"
									style={{
										height: `${(day.emails / maxValue) * 100}%`,
										minHeight: '4px',
									}}
									title={`Emails: ${day.emails.toLocaleString()}`}
								></div>
							)}
							{selectedMetrics.includes('replies') && (
								<div
									className="bg-success-500 rounded-t-sm transition-all duration-200 hover:bg-success-600"
									style={{
										height: `${(day.replies / maxValue) * 100}%`,
										minHeight: '4px',
									}}
									title={`Replies: ${day.replies.toLocaleString()}`}
								></div>
							)}
							{selectedMetrics.includes('positive') && (
								<div
									className="bg-secondary-500 rounded-t-sm transition-all duration-200 hover:bg-secondary-600"
									style={{
										height: `${(day.positive / maxValue) * 100}%`,
										minHeight: '4px',
									}}
									title={`Positive: ${day.positive.toLocaleString()}`}
								></div>
							)}
							{selectedMetrics.includes('bounces') && (
								<div
									className="bg-warning-500 rounded-t-sm transition-all duration-200 hover:bg-warning-600"
									style={{
										height: `${(day.bounces / maxValue) * 100}%`,
										minHeight: '4px',
									}}
									title={`Bounces: ${day.bounces.toLocaleString()}`}
								></div>
							)}
						</div>
					))}
				</div>

				{/* X-axis labels */}
				<div className="ml-12 mt-2 flex justify-between text-xs text-gray-500">
					{mockData.map((day, index) => (
						<span key={index} className="transform -rotate-45 origin-left">
							{new Date(day.date).toLocaleDateString('en-US', {
								month: 'short',
								day: 'numeric',
							})}
						</span>
					))}
				</div>
			</div>

			{/* Legend */}
			<div className="flex flex-wrap gap-4 text-xs">
				{metrics.map((metric) => (
					<div key={metric.key} className="flex items-center space-x-2">
						<div className={`w-3 h-3 rounded-sm ${metric.color}`}></div>
						<span className="text-gray-600 font-medium">{metric.label}</span>
					</div>
				))}
			</div>
		</div>
	);
}

export function PlatformBreakdown({ data }: PlatformBreakdownProps) {
	const total = data.reduce((sum, item) => sum + item.value, 0);
	const circumference = 2 * Math.PI * 40;

	return (
		<div className="space-y-4">
			{/* Donut Chart */}
			<div className="relative w-32 h-32 mx-auto">
				<svg
					className="w-full h-full transform -rotate-90"
					viewBox="0 0 100 100"
				>
					{/* Background circle */}
					<circle
						cx="50"
						cy="50"
						r="40"
						fill="none"
						stroke="#e5e7eb"
						strokeWidth="8"
					/>

					{/* Data segments */}
					{
						data.reduce(
							(acc, item, index) => {
								const percentage = (item.value / total) * 100;
								const strokeDasharray = (percentage / 100) * circumference;
								const strokeDashoffset = acc.offset;

								acc.elements.push(
									<circle
										key={index}
										cx="50"
										cy="50"
										r="40"
										fill="none"
										stroke={item.color}
										strokeWidth="8"
										strokeDasharray={strokeDasharray}
										strokeDashoffset={strokeDashoffset}
										strokeLinecap="round"
									/>
								);

								acc.offset -= strokeDasharray;
								return acc;
							},
							{ elements: [] as JSX.Element[], offset: circumference }
						).elements
					}
				</svg>

				{/* Center text */}
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="text-center">
						<div className="text-lg font-bold text-gray-900">
							{total.toLocaleString()}
						</div>
						<div className="text-xs text-gray-500">Total</div>
					</div>
				</div>
			</div>

			{/* Legend */}
			<div className="space-y-3">
				{data.map((item, index) => (
					<div key={index} className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<div className={`w-3 h-3 rounded-sm ${item.color}`}></div>
							<span className="text-sm font-medium text-gray-700">
								{item.platform}
							</span>
						</div>
						<div className="flex items-center space-x-2">
							<div className="w-16 bg-gray-200 rounded-full h-2">
								<div
									className={`h-2 rounded-full ${item.color}`}
									style={{ width: `${item.percentage}%` }}
								></div>
							</div>
							<span className="text-sm text-gray-600 w-12 text-right">
								{item.percentage}%
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export function SparklineChart({
	data,
	color = 'bg-primary-500',
}: {
	data: number[];
	color?: string;
}) {
	const maxValue = Math.max(...data);
	const minValue = Math.min(...data);
	const range = maxValue - minValue;

	return (
		<div className="w-16 h-8 flex items-end space-x-px">
			{data.map((value, index) => (
				<div
					key={index}
					className={`flex-1 ${color} rounded-sm transition-all duration-200 hover:opacity-80`}
					style={{
						height:
							range > 0 ? `${((value - minValue) / range) * 100}%` : '50%',
						minHeight: '2px',
					}}
				></div>
			))}
		</div>
	);
}
