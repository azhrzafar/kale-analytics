'use client';

import React, { useState } from 'react';
import { formatNumber } from '@/lib/utils';
import { PlatformData } from '../../utils/types';

interface PlatformBreakdownProps {
	data: Array<{
		platform: string;
		value: number;
		percentage: number;
		color: string;
	}>;
}

const PlatformBreakdownChart = ({ data }: PlatformBreakdownProps) => {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const total = data.reduce((sum, item) => sum + item.value, 0);
	const radius = 90;
	const circumference = 2 * Math.PI * radius;
	const strokeWidth = 20;

	// Enhanced beautiful gradients with more vibrant colors
	const gradients = [
		'url(#gradient1)',
		'url(#gradient2)',
		'url(#gradient3)',
		'url(#gradient4)',
		'url(#gradient5)',
	];

	// Glow effects for hovered segments
	const glowFilters = [
		'url(#glow1)',
		'url(#glow2)',
		'url(#glow3)',
		'url(#glow4)',
		'url(#glow5)',
	];

	return (
		<div className="flex">
			{/* Enhanced Beautiful Donut Chart */}
			<div className="relative w-48 h-48 mx-auto">
				<svg
					className="w-full h-full transform -rotate-90 drop-shadow-2xl"
					viewBox="0 0 220 220"
				>
					{/* Define enhanced gradients */}
					<defs>
						<linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" stopColor="#6366F1" />
							<stop offset="50%" stopColor="#4F46E5" />
							<stop offset="100%" stopColor="#3730A3" />
						</linearGradient>
						<linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" stopColor="#10B981" />
							<stop offset="50%" stopColor="#059669" />
							<stop offset="100%" stopColor="#047857" />
						</linearGradient>
						<linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" stopColor="#F59E0B" />
							<stop offset="50%" stopColor="#D97706" />
							<stop offset="100%" stopColor="#B45309" />
						</linearGradient>
						<linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" stopColor="#EC4899" />
							<stop offset="50%" stopColor="#DB2777" />
							<stop offset="100%" stopColor="#BE185D" />
						</linearGradient>
						<linearGradient id="gradient5" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" stopColor="#EF4444" />
							<stop offset="50%" stopColor="#DC2626" />
							<stop offset="100%" stopColor="#B91C1C" />
						</linearGradient>

						{/* Glow filters for hover effects */}
						<filter id="glow1" x="-50%" y="-50%" width="200%" height="200%">
							<feGaussianBlur stdDeviation="3" result="coloredBlur" />
							<feMerge>
								<feMergeNode in="coloredBlur" />
								<feMergeNode in="SourceGraphic" />
							</feMerge>
						</filter>
						<filter id="glow2" x="-50%" y="-50%" width="200%" height="200%">
							<feGaussianBlur stdDeviation="3" result="coloredBlur" />
							<feMerge>
								<feMergeNode in="coloredBlur" />
								<feMergeNode in="SourceGraphic" />
							</feMerge>
						</filter>
						<filter id="glow3" x="-50%" y="-50%" width="200%" height="200%">
							<feGaussianBlur stdDeviation="3" result="coloredBlur" />
							<feMerge>
								<feMergeNode in="coloredBlur" />
								<feMergeNode in="SourceGraphic" />
							</feMerge>
						</filter>
						<filter id="glow4" x="-50%" y="-50%" width="200%" height="200%">
							<feGaussianBlur stdDeviation="3" result="coloredBlur" />
							<feMerge>
								<feMergeNode in="coloredBlur" />
								<feMergeNode in="SourceGraphic" />
							</feMerge>
						</filter>
						<filter id="glow5" x="-50%" y="-50%" width="200%" height="200%">
							<feGaussianBlur stdDeviation="3" result="coloredBlur" />
							<feMerge>
								<feMergeNode in="coloredBlur" />
								<feMergeNode in="SourceGraphic" />
							</feMerge>
						</filter>
					</defs>

					{/* Background circle with enhanced shadow */}
					<circle
						cx="110"
						cy="110"
						r={radius}
						fill="none"
						stroke="#F8FAFC"
						strokeWidth={strokeWidth}
						className="drop-shadow-lg"
					/>

					{/* Data segments with animations */}
					{
						data.reduce(
							(acc, item, index) => {
								const percentage = (item.value / total) * 100;
								const strokeDasharray = (percentage / 100) * circumference;
								const strokeDashoffset = acc.offset;

								acc.elements.push(
									<circle
										key={index}
										cx="110"
										cy="110"
										r={radius}
										fill="none"
										stroke={gradients[index % gradients.length]}
										strokeWidth={strokeWidth}
										strokeDasharray={strokeDasharray}
										strokeDashoffset={strokeDashoffset}
										strokeLinecap="round"
										filter={
											hoveredIndex === index
												? glowFilters[index % glowFilters.length]
												: undefined
										}
										className={`transition-all duration-500 ease-out transform ${
											hoveredIndex === index
												? 'scale-105 drop-shadow-2xl'
												: 'hover:scale-102'
										}`}
										onMouseEnter={() => setHoveredIndex(index)}
										onMouseLeave={() => setHoveredIndex(null)}
										style={{
											strokeWidth:
												hoveredIndex === index ? strokeWidth + 4 : strokeWidth,
											transform:
												hoveredIndex === index ? 'scale(1.05)' : 'scale(1)',
										}}
									/>
								);

								acc.offset -= strokeDasharray;
								return acc;
							},
							{ elements: [] as JSX.Element[], offset: circumference }
						).elements
					}
				</svg>

				{/* Enhanced center text with beautiful typography */}
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="text-center">
						<div className="text-xl font-bold text-gray-900 mb-2 drop-shadow-sm">
							{formatNumber(total)}
						</div>
						<div className="text-xs text-gray-600 font-semibold mb-1">
							Total Sends
						</div>
						{hoveredIndex !== null && (
							<div className="mt-3 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm">
								<div className="text-xs font-medium text-gray-700">
									{data[hoveredIndex].platform}:{' '}
									{data[hoveredIndex].percentage.toFixed(1)}%
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
			<div className="flex flex-col gap-2  items-end justify-end">
				{data.map((item, index) => (
					<div key={index} className={`flex items-center justify-between`}>
						<span className="text-xs text-gray-900">
							{item.platform}: {item.percentage.toFixed(1)}%
						</span>
					</div>
				))}
			</div>
		</div>
	);
};

export default PlatformBreakdownChart;
