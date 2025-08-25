'use client';

import React from 'react';
import {
	ArrowTrendingUpIcon,
	ArrowTrendingDownIcon,
	MinusIcon,
} from '@heroicons/react/24/outline';
import { formatNumber } from '@/lib/utils';

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

interface KPICardsProps {
	kpiData: KPIMetric[];
	loading: boolean;
}

export default function KPICards({ kpiData, loading }: KPICardsProps) {
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
		switch (label) {
			case 'Emails Sent':
				return 'bg-blue-50';
			case 'Unique Leads':
				return 'bg-green-50';
			case 'Reply Count':
				return 'bg-purple-50';
			case 'Positive Reply Count':
				return 'bg-emerald-50';
			case 'Bounce Count':
				return 'bg-red-50';
			case 'Send→Positive Ratio':
				return 'bg-orange-50';
			default:
				return 'bg-gray-50';
		}
	};

	const getIconColor = (label: string) => {
		switch (label) {
			case 'Emails Sent':
				return 'text-blue-600';
			case 'Unique Leads':
				return 'text-green-600';
			case 'Reply Count':
				return 'text-purple-600';
			case 'Positive Reply Count':
				return 'text-emerald-600';
			case 'Bounce Count':
				return 'text-red-600';
			case 'Send→Positive Ratio':
				return 'text-orange-600';
			default:
				return 'text-gray-600';
		}
	};

	if (loading) {
		return (
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
				{Array.from({ length: 6 }).map((_, index) => (
					<div
						key={index}
						className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6 animate-pulse"
					>
						<div className="flex items-center justify-between">
							<div className="w-10 h-10 bg-gray-200 rounded-sm"></div>
							<div className="w-16 h-4 bg-gray-200 rounded"></div>
						</div>
						<div className="mt-4">
							<div className="w-20 h-8 bg-gray-200 rounded mb-2"></div>
							<div className="w-24 h-4 bg-gray-200 rounded"></div>
						</div>
					</div>
				))}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
			{kpiData.map((metric) => {
				const Icon = metric.icon;
				const ChangeIcon = getChangeIcon(metric.changeType ?? 'neutral');
				const iconBg = getIconBackground(metric.label);
				const iconColor = getIconColor(metric.label);
				return (
					<div
						key={metric.id}
						className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6 hover:shadow-lg transition-all duration-200"
					>
						<div className="flex items-center justify-between">
							<div className={`p-2 rounded-sm ${iconBg}`}>
								<Icon className={`h-5 w-5 ${iconColor}`} />
							</div>
							<div
								className={`flex items-center space-x-1 ${getChangeColor(
									metric.label === 'Bounce Count' ? 'negative' : 'positive'
								)}`}
							>
								{metric.changeType && <ChangeIcon className="h-3 w-3" />}
								<span className="text-xs font-medium">
									{metric.change && `${metric.change.toFixed(1)}%`}
								</span>
							</div>
						</div>
						<div className="mt-4">
							<div className="text-2xl font-bold text-gray-900">
								{metric.format === 'percentage'
									? `${metric.value.toFixed(1)}%`
									: metric.format === 'ratio'
									? metric.value
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
	);
}
