'use client';

import React, { useState, useEffect } from 'react';
import {
	CurrencyDollarIcon,
	ArrowTrendingUpIcon,
	ArrowTrendingDownIcon,
	MinusIcon,
	BanknotesIcon,
	ChartBarIcon,
	ClockIcon,
} from '@heroicons/react/24/outline';
import type { DateRange, DateRangePreset } from '@/lib/types';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { useRouter } from 'next/navigation';

// Helper function to format percentage with proper decimal places
const formatPercentageChange = (value: number): string => {
	// Handle edge cases: Infinity, -Infinity, NaN
	if (!isFinite(value)) {
		if (value === Infinity || value === -Infinity) {
			return 'N/A';
		}
		return 'N/A';
	}

	// If the value is a whole number, don't show decimal places
	if (Number.isInteger(value)) {
		return value.toString();
	}
	// Otherwise show up to 1 decimal place
	return value.toFixed(1);
};

interface KPICardsProps {
	timeFilter: DateRange;
	preset?: DateRangePreset;
}

export default function KPICards({ timeFilter, preset }: KPICardsProps) {
	const [kpiData, setKpiData] = useState([]);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	// Consolidated data loading function
	const loadAllData = async () => {
		setLoading(true);
		try {
			// Ensure we have valid dates
			if (!timeFilter.startDate || !timeFilter.endDate) {
				console.warn('Invalid date range provided to KPICards');
				return;
			}

			setKpiData([]);
		} catch (error) {
			console.error('Error loading KPI data:', error);
			setKpiData([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadAllData();
	}, [timeFilter, preset]);

	const handleCardClick = async (link?: string) => {
		if (!link) return;

		// Format dates in YYYY-MM-DD format without timezone conversion
		const formatDate = (date: Date | null) => {
			if (!date) return '';
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			return `${year}-${month}-${day}`;
		};

		const startDate = formatDate(timeFilter.startDate);
		const endDate = formatDate(timeFilter.endDate);

		if (link === 'revenue') {
			router.push(`/transactions?type=REVENUE`);
		} else if (link === 'expense') {
			router.push(`/transactions?type=EXPENSE`);
		} else if (link === 'cash-in-hand') {
			// Navigate to settings page to update cash in hand
			router.push('/settings?tab=cashInHand');
		}
	};

	if (loading) {
		return (
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				{[...Array(4)].map((_, index) => (
					<div
						key={index}
						className="bg-white rounded-md shadow-sm border border-gray-100 p-6 animate-pulse overflow-hidden"
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center min-w-0 flex-1">
								<div className="w-10 h-10 bg-gray-200 rounded-sm mr-3 flex-shrink-0"></div>
								<div className="min-w-0 flex-1">
									<div className="h-4 bg-gray-200 rounded w-20 mb-2 max-w-full"></div>
									<div className="h-6 bg-gray-200 rounded w-24 max-w-full"></div>
								</div>
							</div>
							<div className="flex items-center flex-shrink-0 ml-2">
								<div className="w-4 h-4 bg-gray-200 rounded mr-1"></div>
								<div className="h-4 bg-gray-200 rounded w-12"></div>
							</div>
						</div>
						<div className="h-3 bg-gray-200 rounded w-32 mt-2 max-w-full"></div>
					</div>
				))}
			</div>
		);
	}

	const getIcon = (label: string) => {
		if (label.includes('Cash')) return BanknotesIcon;
		if (label.includes('Revenue')) return ArrowTrendingUpIcon;
		if (label.includes('Expenses')) return ArrowTrendingDownIcon;
		if (label.includes('Net Profit')) return ChartBarIcon;
		if (label.includes('Runway')) return ClockIcon;
		return CurrencyDollarIcon;
	};

	const formatValue = (metric: any) => {
		switch (metric.format) {
			case 'currency':
				return formatCurrency(metric.value);
			case 'percentage':
				return formatPercentage(metric.value);
			case 'number':
				return metric.label.includes('Runway')
					? `${metric.value.toFixed(1)} months`
					: metric.value.toLocaleString();
			default:
				return metric.value.toString();
		}
	};

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

	const getChangeColor = (changeType: string, label: string) => {
		// For expenses, negative change is good (green), positive change is bad (red)
		if (label.includes('Expenses')) {
			switch (changeType) {
				case 'positive':
					return 'text-danger-600';
				case 'negative':
					return 'text-success-600';
				default:
					return 'text-neutral-500';
			}
		}

		// For other metrics, positive change is good (green), negative change is bad (red)
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
		if (label.includes('Cash')) return 'bg-primary-50';
		if (label.includes('Revenue')) return 'bg-success-50';
		if (label.includes('Expenses')) return 'bg-danger-50';
		if (label.includes('Net Profit')) return 'bg-secondary-50';
		if (label.includes('Runway')) return 'bg-warning-50';
		return 'bg-neutral-100';
	};

	const getIconColor = (label: string) => {
		if (label.includes('Cash')) return 'text-primary-600';
		if (label.includes('Revenue')) return 'text-success-600';
		if (label.includes('Expenses')) return 'text-danger-600';
		if (label.includes('Net Profit')) return 'text-secondary-600';
		if (label.includes('Runway')) return 'text-warning-600';
		return 'text-neutral-600';
	};

	return (
		<>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{kpiData.map((metric, index) => {
					// const Icon = getIcon(metric.label);
					// const ChangeIcon = getChangeIcon(metric.changeType);
					// const changeColor = getChangeColor(metric.changeType, metric.label);
					// const iconBg = getIconBackground(metric.label);
					// const iconColor = getIconColor(metric.label);

					return (
						// <div
						// 	key={index}
						// 	className={`relative hover:border-primary-200 group bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all duration-200 ${
						// 		metric.link && 'cursor-pointer'
						// 	}`}
						// 	style={{ animationDelay: `${index * 50}ms` }}
						// 	onClick={() => handleCardClick(metric.link)}
						// >
						// 	<div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
						// 	<div className="flex items-start justify-between mb-3">
						// 		<div className={`p-2 rounded-lg ${iconBg}`}>
						// 			<Icon className={`h-5 w-5 ${iconColor}`} />
						// 		</div>
						// 		{metric.change !== 0 && (
						// 			<div className="flex items-center space-x-1">
						// 				<ChangeIcon className={`h-3 w-3 ${changeColor}`} />
						// 				<span className={`text-xs font-medium ${changeColor}`}>
						// 					{formatPercentageChange(Math.abs(metric.change))}%
						// 				</span>
						// 			</div>
						// 		)}
						// 	</div>

						// 	<div className="space-y-1">
						// 		<h3 className="text-sm font-medium text-gray-600 truncate">
						// 			{metric.label}
						// 		</h3>
						// 		<p className="text-2xl font-bold text-gray-900">
						// 			{formatValue(metric)}
						// 		</p>
						// 		<p className="text-xs text-gray-500 leading-tight">
						// 			{metric.subtitle}
						// 		</p>
						// 	</div>
						// </div>
						<></>
					);
				})}
			</div>
		</>
	);
}
