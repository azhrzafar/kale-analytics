'use client';

import React, { useState, useEffect } from 'react';
import {
	EnvelopeIcon,
	CalendarIcon,
	UsersIcon,
	MagnifyingGlassIcon,
	ArrowUpIcon,
	ArrowDownIcon,
	EyeIcon,
	ChartBarIcon,
	CheckCircleIcon,
	ExclamationTriangleIcon,
	PauseIcon,
	PlayIcon,
	BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { formatNumber } from '@/lib/utils';
import { SparklineChart } from './ChartComponents';

interface CampaignsListProps {
	onCampaignSelect?: (campaignId: string) => void;
}

interface CampaignData {
	id: string;
	name: string;
	workspace: string;
	owner: string;
	platform: 'Instantly' | 'Bison' | 'Missive';
	status: 'active' | 'paused' | 'completed' | 'draft';
	createdDate: string;
	lastModified: string;
	sent: number;
	replies: number;
	positiveReplies: number;
	replyRate: number;
	positiveRate: number;
	bounceRate: number;
	sparklineData: number[];
}

export default function CampaignsList({
	onCampaignSelect,
}: CampaignsListProps) {
	const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [platformFilter, setPlatformFilter] = useState<string>('all');
	const [sortBy, setSortBy] = useState<
		| 'name'
		| 'replyRate'
		| 'positiveRate'
		| 'bounceRate'
		| 'sent'
		| 'createdDate'
	>('replyRate');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const router = useRouter();

	// Mock data for demonstration
	useEffect(() => {
		setLoading(true);

		// Simulate API call
		setTimeout(() => {
			setCampaigns([
				{
					id: '1',
					name: 'Q1 Tech Outreach',
					workspace: 'TechCorp Solutions',
					owner: 'John Smith',
					platform: 'Instantly',
					status: 'active',
					createdDate: '2024-01-10',
					lastModified: '2024-01-20',
					sent: 1250,
					replies: 187,
					positiveReplies: 134,
					replyRate: 15.0,
					positiveRate: 71.7,
					bounceRate: 2.1,
					sparklineData: [120, 135, 142, 128, 156, 143, 150],
				},
				{
					id: '2',
					name: 'Developer Recruitment',
					workspace: 'TechCorp Solutions',
					owner: 'Sarah Johnson',
					platform: 'Bison',
					status: 'active',
					createdDate: '2024-01-12',
					lastModified: '2024-01-18',
					sent: 890,
					replies: 98,
					positiveReplies: 67,
					replyRate: 11.0,
					positiveRate: 68.4,
					bounceRate: 3.2,
					sparklineData: [85, 92, 78, 95, 88, 102, 89],
				},
				{
					id: '3',
					name: 'Startup Partnership',
					workspace: 'TechCorp Solutions',
					owner: 'Mike Wilson',
					platform: 'Instantly',
					status: 'paused',
					createdDate: '2024-01-15',
					lastModified: '2024-01-15',
					sent: 567,
					replies: 45,
					positiveReplies: 28,
					replyRate: 7.9,
					positiveRate: 62.2,
					bounceRate: 4.1,
					sparklineData: [52, 48, 61, 55, 49, 58, 53],
				},
				{
					id: '4',
					name: 'Enterprise Sales',
					workspace: 'Global Innovations',
					owner: 'Lisa Chen',
					platform: 'Bison',
					status: 'active',
					createdDate: '2024-01-08',
					lastModified: '2024-01-19',
					sent: 2100,
					replies: 315,
					positiveReplies: 245,
					replyRate: 15.0,
					positiveRate: 77.8,
					bounceRate: 1.8,
					sparklineData: [180, 195, 210, 185, 220, 205, 215],
				},
				{
					id: '5',
					name: 'Product Launch',
					workspace: 'StartupXYZ',
					owner: 'Alex Rodriguez',
					platform: 'Missive',
					status: 'completed',
					createdDate: '2024-01-05',
					lastModified: '2024-01-16',
					sent: 750,
					replies: 89,
					positiveReplies: 62,
					replyRate: 11.9,
					positiveRate: 69.7,
					bounceRate: 2.5,
					sparklineData: [65, 72, 68, 75, 70, 78, 73],
				},
			]);
			setLoading(false);
		}, 1000);
	}, []);

	// Filter and sort campaigns
	const filteredCampaigns = campaigns
		.filter((campaign) => {
			const matchesSearch =
				campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				campaign.workspace.toLowerCase().includes(searchTerm.toLowerCase()) ||
				campaign.owner.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesStatus =
				statusFilter === 'all' || campaign.status === statusFilter;
			const matchesPlatform =
				platformFilter === 'all' || campaign.platform === platformFilter;
			return matchesSearch && matchesStatus && matchesPlatform;
		})
		.sort((a, b) => {
			let comparison = 0;
			switch (sortBy) {
				case 'name':
					comparison = a.name.localeCompare(b.name);
					break;
				case 'replyRate':
					comparison = a.replyRate - b.replyRate;
					break;
				case 'positiveRate':
					comparison = a.positiveRate - b.positiveRate;
					break;
				case 'bounceRate':
					comparison = a.bounceRate - b.bounceRate;
					break;
				case 'sent':
					comparison = a.sent - b.sent;
					break;
				case 'createdDate':
					comparison =
						new Date(a.createdDate).getTime() -
						new Date(b.createdDate).getTime();
					break;
			}
			return sortOrder === 'asc' ? comparison : -comparison;
		});

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

	const handleCampaignClick = (campaignId: string) => {
		if (onCampaignSelect) {
			onCampaignSelect(campaignId);
		} else {
			router.push(`/campaigns/${campaignId}`);
		}
	};

	if (loading) {
		return (
			<div className="space-y-6 animate-pulse">
				{/* Header Skeleton */}
				<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
					<div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
					<div className="h-4 bg-gray-200 rounded w-48"></div>
				</div>

				{/* Table Skeleton */}
				<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 overflow-hidden">
					<div className="px-6 py-4 border-b border-primary-100 bg-primary-50/80">
						<div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
						<div className="h-4 bg-gray-200 rounded w-48"></div>
					</div>
					<div className="p-6">
						<div className="space-y-4">
							{[...Array(5)].map((_, index) => (
								<div key={index} className="flex items-center space-x-4">
									<div className="h-10 w-10 bg-gray-200 rounded-full"></div>
									<div className="flex-1 space-y-2">
										<div className="h-4 bg-gray-200 rounded w-48"></div>
										<div className="h-3 bg-gray-200 rounded w-32"></div>
									</div>
									<div className="h-6 bg-gray-200 rounded w-16"></div>
									<div className="h-4 bg-gray-200 rounded w-24"></div>
									<div className="h-4 bg-gray-200 rounded w-20"></div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 overflow-hidden">
				<div className="px-6 py-4 border-b border-primary-100 bg-primary-50/80">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h2 className="text-lg font-semibold text-gray-900 flex items-center">
								<EnvelopeIcon className="h-5 w-5 mr-2 text-primary-600" />
								Campaigns
							</h2>
							<p className="text-sm text-gray-600 mt-1">
								{filteredCampaigns.length} of {campaigns.length} campaigns
							</p>
						</div>

						<div className="mt-4 sm:mt-0 flex flex-row flex-wrap gap-3 justify-end">
							{/* Search */}
							<div className="relative flex items-center">
								<MagnifyingGlassIcon
									className="h-4 w-4 absolute left-3 text-primary-500"
									aria-hidden="true"
								/>
								<input
									type="text"
									placeholder="Search campaigns"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-8 pr-4 py-2 text-sm border rounded-sm focus:shadow-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-200"
									aria-label="Search campaigns"
								/>
							</div>

							{/* Status Filter */}
							<select
								value={statusFilter}
								onChange={(e) => setStatusFilter(e.target.value)}
								className="px-3 py-2 text-sm border rounded-sm focus:shadow-sm bg-white text-gray-900 focus:outline-none transition-all duration-200"
							>
								<option value="all">All Status</option>
								<option value="active">Active</option>
								<option value="paused">Paused</option>
								<option value="completed">Completed</option>
								<option value="draft">Draft</option>
							</select>

							{/* Platform Filter */}
							<select
								value={platformFilter}
								onChange={(e) => setPlatformFilter(e.target.value)}
								className="px-3 py-2 text-sm border rounded-sm focus:shadow-sm bg-white text-gray-900 focus:outline-none transition-all duration-200"
							>
								<option value="all">All Platforms</option>
								<option value="Instantly">Instantly</option>
								<option value="Bison">Bison</option>
								<option value="Missive">Missive</option>
							</select>
						</div>
					</div>
				</div>
			</div>

			{/* Campaigns Table */}
			<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-primary-100">
						<thead className="bg-primary-50/50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Campaign
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Workspace
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Platform
								</th>
								<th
									onClick={() => {
										if (sortBy === 'replyRate') {
											setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
										} else {
											setSortBy('replyRate');
											setSortOrder('desc');
										}
									}}
									className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-primary-100 transition-colors duration-200"
								>
									<div className="flex items-center">
										Reply Rate
										{sortBy === 'replyRate' &&
											(sortOrder === 'asc' ? (
												<ArrowUpIcon className="h-4 w-4 ml-1 text-primary-500" />
											) : (
												<ArrowDownIcon className="h-4 w-4 ml-1 text-primary-500" />
											))}
									</div>
								</th>
								<th
									onClick={() => {
										if (sortBy === 'positiveRate') {
											setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
										} else {
											setSortBy('positiveRate');
											setSortOrder('desc');
										}
									}}
									className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-primary-100 transition-colors duration-200"
								>
									<div className="flex items-center">
										Positive Rate
										{sortBy === 'positiveRate' &&
											(sortOrder === 'asc' ? (
												<ArrowUpIcon className="h-4 w-4 ml-1 text-primary-500" />
											) : (
												<ArrowDownIcon className="h-4 w-4 ml-1 text-primary-500" />
											))}
									</div>
								</th>
								<th
									onClick={() => {
										if (sortBy === 'bounceRate') {
											setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
										} else {
											setSortBy('bounceRate');
											setSortOrder('asc');
										}
									}}
									className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-primary-100 transition-colors duration-200"
								>
									<div className="flex items-center">
										Bounce Rate
										{sortBy === 'bounceRate' &&
											(sortOrder === 'asc' ? (
												<ArrowUpIcon className="h-4 w-4 ml-1 text-primary-500" />
											) : (
												<ArrowDownIcon className="h-4 w-4 ml-1 text-primary-500" />
											))}
									</div>
								</th>
								<th
									onClick={() => {
										if (sortBy === 'sent') {
											setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
										} else {
											setSortBy('sent');
											setSortOrder('desc');
										}
									}}
									className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-primary-100 transition-colors duration-200"
								>
									<div className="flex items-center">
										Sent
										{sortBy === 'sent' &&
											(sortOrder === 'asc' ? (
												<ArrowUpIcon className="h-4 w-4 ml-1 text-primary-500" />
											) : (
												<ArrowDownIcon className="h-4 w-4 ml-1 text-primary-500" />
											))}
									</div>
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Status
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Trend
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white/50 divide-y divide-primary-100">
							{filteredCampaigns.map((campaign, index) => (
								<tr
									key={campaign.id}
									className="hover:bg-primary-50/50 transition-colors duration-200 cursor-pointer"
									onClick={() => handleCampaignClick(campaign.id)}
									style={{ animationDelay: `${index * 50}ms` }}
								>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex items-center">
											<div className="flex-shrink-0 h-10 w-10">
												<div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
													<EnvelopeIcon className="h-5 w-5 text-primary-600" />
												</div>
											</div>
											<div className="ml-4">
												<div className="text-sm font-medium text-gray-900">
													{campaign.name}
												</div>
												<div className="text-sm text-gray-500">
													{campaign.owner} •{' '}
													{new Date(campaign.createdDate).toLocaleDateString()}
												</div>
											</div>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex items-center text-sm text-gray-600">
											<BuildingOfficeIcon className="h-4 w-4 mr-1" />
											{campaign.workspace}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span className="text-sm text-gray-600">
											{campaign.platform}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm font-medium text-gray-900">
											{campaign.replyRate.toFixed(1)}%
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm font-medium text-gray-900">
											{campaign.positiveRate.toFixed(1)}%
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-gray-900">
											{campaign.bounceRate.toFixed(1)}%
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-gray-900">
											{formatNumber(campaign.sent)}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
												campaign.status
											)}`}
										>
											{campaign.status === 'active' && (
												<CheckCircleIcon className="h-3 w-3 mr-1" />
											)}
											{campaign.status === 'paused' && (
												<PauseIcon className="h-3 w-3 mr-1" />
											)}
											{campaign.status === 'completed' && (
												<CheckCircleIcon className="h-3 w-3 mr-1" />
											)}
											{campaign.status === 'draft' && (
												<EnvelopeIcon className="h-3 w-3 mr-1" />
											)}
											{campaign.status.charAt(0).toUpperCase() +
												campaign.status.slice(1)}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<SparklineChart
											data={campaign.sparklineData}
											color="bg-primary-500"
										/>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
										<div className="flex justify-end space-x-2">
											<button
												className="text-primary-600 hover:text-primary-900 transition-colors duration-200"
												title="View details"
												onClick={(e) => {
													e.stopPropagation();
													handleCampaignClick(campaign.id);
												}}
											>
												<EyeIcon className="h-4 w-4" />
											</button>
											<button
												className="text-neutral-600 hover:text-neutral-900 transition-colors duration-200"
												title="View analytics"
												onClick={(e) => {
													e.stopPropagation();
													router.push(`/campaigns/${campaign.id}/analytics`);
												}}
											>
												<ChartBarIcon className="h-4 w-4" />
											</button>
											{campaign.status === 'active' ? (
												<button
													className="text-warning-600 hover:text-warning-900 transition-colors duration-200"
													title="Pause campaign"
													onClick={(e) => {
														e.stopPropagation();
														// Handle pause action
													}}
												>
													<PauseIcon className="h-4 w-4" />
												</button>
											) : (
												<button
													className="text-success-600 hover:text-success-900 transition-colors duration-200"
													title="Resume campaign"
													onClick={(e) => {
														e.stopPropagation();
														// Handle resume action
													}}
												>
													<PlayIcon className="h-4 w-4" />
												</button>
											)}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Empty State */}
				{filteredCampaigns.length === 0 && (
					<div className="text-center py-12 bg-primary-50/30">
						<EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400" />
						<h3 className="mt-2 text-sm font-medium text-gray-900">
							No campaigns found
						</h3>
						<p className="mt-1 text-sm text-gray-500">
							{searchTerm || statusFilter !== 'all' || platformFilter !== 'all'
								? 'Try adjusting your search or filter criteria.'
								: 'Get started by creating a new campaign.'}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
