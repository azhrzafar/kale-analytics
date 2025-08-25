'use client';

import React, { useEffect } from 'react';
import {
	EnvelopeIcon,
	CheckCircleIcon,
	PauseIcon,
	ArrowPathIcon,
	ExclamationCircleIcon,
	ArrowLeftIcon,
	BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import {
	EnvelopeIcon as EnvelopeSolidIcon,
	CheckCircleIcon as CheckCircleSolidIcon,
} from '@heroicons/react/24/solid';
import { formatNumber } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useCampaigns } from '@/lib/hooks/useCampaigns';

interface CampaignDetailProps {
	campaignId: string;
}

export default function CampaignDetail({ campaignId }: CampaignDetailProps) {
	const router = useRouter();
	const {
		campaignDetail,
		detailLoading,
		detailError,
		fetchCampaignDetail,
		updateCampaignStatus,
	} = useCampaigns();

	// Fetch campaign detail on mount
	useEffect(() => {
		fetchCampaignDetail(campaignId);
	}, [campaignId, fetchCampaignDetail]);

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'active':
				return 'text-success-600 bg-success-50 border-success-200';
			case 'paused':
				return 'text-warning-600 bg-warning-50 border-warning-200';
			case 'completed':
				return 'text-neutral-600 bg-neutral-50 border-neutral-200';
			case 'draft':
				return 'text-primary-600 bg-primary-50 border-primary-200';
			default:
				return 'text-neutral-600 bg-neutral-50 border-neutral-200';
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'active':
				return <CheckCircleIcon className="h-3 w-3 mr-1" />;
			case 'paused':
				return <PauseIcon className="h-3 w-3 mr-1" />;
			case 'completed':
				return <CheckCircleIcon className="h-3 w-3 mr-1" />;
			case 'draft':
				return <EnvelopeIcon className="h-3 w-3 mr-1" />;
			default:
				return <EnvelopeIcon className="h-3 w-3 mr-1" />;
		}
	};

	const getIconComponent = (iconName: string) => {
		const iconMap: { [key: string]: React.ComponentType<any> } = {
			EnvelopeIcon,
			CheckCircleIcon,
			EnvelopeSolidIcon,
			CheckCircleSolidIcon,
		};
		return iconMap[iconName] || EnvelopeIcon;
	};

	const handleStatusToggle = async () => {
		if (!campaignDetail) return;

		let newStatus: 'active' | 'paused' | 'completed';
		if (campaignDetail.status === 'active') {
			newStatus = 'paused';
		} else if (campaignDetail.status === 'paused') {
			newStatus = 'active';
		} else {
			return; // Don't allow status changes for completed campaigns
		}

		await updateCampaignStatus(campaignDetail.id, newStatus);
	};

	if (detailError) {
		return (
			<div className="space-y-6">
				<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
					<div className="text-center">
						<ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-500" />
						<h3 className="mt-2 text-sm font-medium text-gray-900">
							Error loading campaign
						</h3>
						<p className="mt-1 text-sm text-gray-500">{detailError}</p>
						<div className="mt-4 flex justify-center space-x-3">
							<button
								onClick={() => router.back()}
								className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
							>
								<ArrowLeftIcon className="h-4 w-4 mr-2" />
								Go Back
							</button>
							<button
								onClick={() => fetchCampaignDetail(campaignId)}
								className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
							>
								<ArrowPathIcon className="h-4 w-4 mr-2" />
								Retry
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (detailLoading || !campaignDetail) {
		return (
			<div className="space-y-6 animate-pulse min-h-[40vh]">
				<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
					<div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
					<div className="h-4 bg-gray-200 rounded w-48"></div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{[...Array(6)].map((_, index) => (
						<div
							key={index}
							className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6"
						>
							<div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
							<div className="h-8 bg-gray-200 rounded w-24"></div>
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Campaign Header */}
			<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 overflow-hidden">
				<div className="px-6 py-4 border-b border-primary-100 bg-primary-50/80">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
						<div>
							<div className="flex items-center mb-2">
								<button
									onClick={() => router.back()}
									className="mr-3 p-1 rounded-md hover:bg-gray-100 transition-colors duration-200"
								>
									<ArrowLeftIcon className="h-5 w-5 text-gray-600" />
								</button>
								<h2 className="text-lg font-semibold text-gray-900">
									{campaignDetail.name}
								</h2>
							</div>
							<div className="flex items-center space-x-4 text-sm text-gray-600">
								<div className="flex items-center">
									<BuildingOfficeIcon className="h-4 w-4 mr-1" />
									{campaignDetail.workspace}
								</div>
								<div className="flex items-center">
									<EnvelopeIcon className="h-4 w-4 mr-1" />
									{campaignDetail.platform}
								</div>
								<span
									className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
										campaignDetail.status
									)}`}
								>
									{getStatusIcon(campaignDetail.status)}
									{campaignDetail.status.charAt(0).toUpperCase() +
										campaignDetail.status.slice(1)}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* KPI Metrics (from Campaigns) */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{campaignDetail.kpiData.map((kpi) => {
					const IconComponent = getIconComponent(kpi.icon);
					return (
						<div
							key={kpi.id}
							className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6"
						>
							<div className="flex items-center">
								<div className="flex-shrink-0">
									<IconComponent
										className={`h-8 w-8 text-${kpi.color}-600`}
										aria-hidden="true"
									/>
								</div>
								<div className="ml-4 w-0 flex-1">
									<p className="text-sm font-medium text-gray-900 truncate">
										{kpi.label}
									</p>
									<p className="text-2xl font-semibold text-gray-900">
										{kpi.format === 'percentage'
											? `${kpi.value.toFixed(1)}%`
											: formatNumber(kpi.value)}
									</p>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
