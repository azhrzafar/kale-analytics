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
	const colors = { bison: '#039B6C', instantly: '#3E37B6' };

	// Handle empty data
	if (!platformData || platformData.length === 0) {
		return (
			<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
				<div className="flex items-center justify-between mb-6">
					<h3 className="text-lg font-semibold text-gray-900">Distribution</h3>
					<div className="text-sm text-gray-500">By send volume</div>
				</div>
				<div className="flex items-center justify-center h-48 text-gray-500">
					<div className="text-center">
						<div className="text-lg font-medium mb-2">No Data Available</div>
						<div className="text-sm">
							Platform distribution data will appear here when available
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Aggregate data by platform to combine multiple entries
	const aggregatedData = platformData.reduce((acc, item) => {
		const platform = item.platform.toLowerCase();
		if (acc[platform]) {
			acc[platform].sends += item.sends;
		} else {
			acc[platform] = { platform: item.platform, sends: item.sends };
		}
		return acc;
	}, {} as Record<string, { platform: string; sends: number }>);

	const totalSends = Object.values(aggregatedData).reduce(
		(sum, item) => sum + item.sends,
		0
	);

	const chartData = Object.values(aggregatedData).map((platform) => {
		return {
			platform: platform.platform,
			value: platform.sends,
			percentage: totalSends > 0 ? (platform.sends / totalSends) * 100 : 0,
			color: colors[platform.platform.toLowerCase() as keyof typeof colors],
		};
	});

	if (loading) {
		return (
			<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
				<div className="flex items-center justify-between mb-6">
					<h3 className="text-lg font-semibold text-gray-900">Distribution</h3>
					<div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
				</div>
				<div className="flex items-center justify-center h-64">
					<div className="w-40 h-40 bg-gray-200 rounded-full animate-pulse"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
			<div className="flex items-center justify-between mb-6">
				<h3 className="text-lg font-semibold text-gray-900">Distribution</h3>
				<div className="text-sm text-gray-500">By send volume</div>
			</div>

			{chartData.length > 0 ? (
				<div className="flex justify-center">
					<PlatformBreakdownChart totalSends={totalSends} data={chartData} />
				</div>
			) : (
				<div className="flex items-center justify-center h-48 text-gray-500">
					<div className="text-center">
						<div className="text-lg font-medium mb-2">No Data Available</div>
						<div className="text-sm">Platform data will appear here</div>
					</div>
				</div>
			)}
		</div>
	);
}
