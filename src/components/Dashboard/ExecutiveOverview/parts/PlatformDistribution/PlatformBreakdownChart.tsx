'use client';

import React, { useMemo } from 'react';
import { formatNumber } from '@/lib/utils';

interface PlatformBreakdownProps {
	totalSends: number;
	data: Array<{
		platform: string;
		value: number;
		percentage: number;
		color: string;
	}>;
}

const PlatformBreakdownChart = ({
	totalSends,
	data,
}: PlatformBreakdownProps) => {
	// Handle empty data
	if (!data || data.length === 0) {
		return (
			<div className="flex items-center justify-center h-48 text-gray-500">
				<div className="text-center">
					<div className="text-lg font-medium mb-2">No Chart Data</div>
					<div className="text-sm">
						Chart data will appear here when available
					</div>
				</div>
			</div>
		);
	}

	const radius = 80;
	const circumference = 2 * Math.PI * radius;
	const strokeWidth = 16;

	const chartSegments = useMemo(() => {
		let currentOffset = 0;

		return data.map((item, index) => {
			const strokeDasharray = (item.percentage / 100) * circumference;
			const strokeDashoffset = currentOffset;

			currentOffset -= strokeDasharray;

			return (
				<circle
					key={`segment-${index}`}
					cx="100"
					cy="100"
					r={radius}
					fill="none"
					stroke={item.color}
					strokeWidth={strokeWidth}
					strokeDasharray={`${strokeDasharray} ${circumference}`}
					strokeDashoffset={strokeDashoffset}
					strokeLinecap="round"
					className="transition-all duration-200 ease-out"
				/>
			);
		});
	}, [data, circumference, strokeWidth]);

	return (
		<div className="flex items-center justify-center gap-8">
			<div className="relative w-40 h-40">
				<svg
					className="w-full h-full transform -rotate-90"
					viewBox="0 0 200 200"
				>
					<circle
						cx="100"
						cy="100"
						r={radius}
						fill="none"
						stroke="#F8FAFC"
						strokeWidth={strokeWidth}
					/>
					{chartSegments}
				</svg>

				<div className="absolute inset-0 flex items-center justify-center">
					<div className="text-center">
						<div className="text-2xl font-bold text-gray-900 mb-1">
							{formatNumber(totalSends)}
						</div>
						<div className="text-xs text-gray-500 font-medium">Total Sends</div>
					</div>
				</div>
			</div>

			<div className="flex flex-col gap-2 self-end">
				{data.map((item, index) => (
					<div key={`legend-${index}`} className={`flex items-center gap-2`}>
						<div
							className={`w-3 h-3 rounded-xs flex-shrink-0 transition-all duration-200 `}
							style={{ background: item.color }}
						/>
						<div className="flex flex-row gap-2 items-center">
							<span className="text-sm font-semibold text-gray-900 capitalize">
								{item.platform}
							</span>
							<span className="text-xs text-gray-500">
								{item.percentage.toFixed(1)}%
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default PlatformBreakdownChart;
