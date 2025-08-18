'use client';

import React from 'react';
import PlatformBreakdownChart from './PlatformBreakdownChart';
import { PlatformData } from '../../utils/types';

interface PlatformDistributionProps {
	platformData: PlatformData[];
	loading: boolean;
}

export default function PlatformDistribution({
	platformData,
	loading,
}: PlatformDistributionProps) {
	// Transform PlatformData to chart format - showing send emails distribution
	const chartData = platformData.map((platform, index) => {
		return {
			platform: platform.platform,
			value: platform.sends, // Using sends (emails sent) for the chart
			percentage: 0, // Will be calculated below
			color: '', // Will be set by the chart component
		};
	});

	// Calculate percentages based on total sends
	const totalSends = chartData.reduce((sum, item) => sum + item.value, 0);
	chartData.forEach((item) => {
		item.percentage = totalSends > 0 ? (item.value / totalSends) * 100 : 0;
	});

	if (loading) {
		return (
			<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-4">
				<div className="flex items-center justify-between mb-6">
					<h3 className="text-lg font-semibold text-gray-900">Distribution</h3>
					<div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
				</div>
				<div className="flex items-center justify-center h-64">
					<div className="w-48 h-48 bg-gray-200 rounded-full animate-pulse"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-4">
			<div className="flex items-center justify-between ">
				<h3 className="text-lg font-semibold text-gray-900">Distribution</h3>
				<div className="text-sm text-gray-500">By send volume</div>
			</div>

			{chartData.length > 0 ? (
				<PlatformBreakdownChart data={chartData} />
			) : (
				<div className="flex items-center justify-center h-auto text-gray-500">
					<div className="text-center">
						<div className="text-lg font-medium mb-2">No Data Available</div>
						<div className="text-sm">Platform data will appear here</div>
					</div>
				</div>
			)}
		</div>
	);
}
