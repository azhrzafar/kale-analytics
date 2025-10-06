'use client';

import React, { useState, useEffect } from 'react';
import {
	EnvelopeIcon,
	MagnifyingGlassIcon,
	ArrowUpIcon,
	ArrowDownIcon,
	EyeIcon,
	CheckCircleIcon,
	PauseIcon,
	BuildingOfficeIcon,
	ArrowPathIcon,
	ExclamationCircleIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { formatNumber } from '@/lib/utils';
import { useCampaigns } from '@/lib/hooks/useCampaigns';
import { useClients } from '@/lib/hooks/useClients';

interface CampaignsListProps {
	onCampaignSelect?: (campaignId: string) => void;
}

export default function CampaignsList({
	onCampaignSelect,
}: CampaignsListProps) {
	const router = useRouter();
	const {
		campaigns,
		loading,
		error,
		refreshCampaigns,
		updateCampaignStatus,
		pagination,
		updateFilters,
	} = useCampaigns();
	const { clients, loading: clientsLoading } = useClients();
	console.log({ clients });
	// Local state for UI controls only
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [platformFilter, setPlatformFilter] = useState('all');
	const [selectedClient, setSelectedClient] = useState('all');
	const [sortBy, setSortBy] = useState('created_at');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const [itemsPerPage, setItemsPerPage] = useState(pagination.limit);

	useEffect(() => {
		setItemsPerPage(pagination.limit);
	}, [pagination.limit]);

	// Use backend pagination data directly
	const totalItems = pagination.total;
	const totalPages = pagination.totalPages;
	const currentPage = pagination.page;

	// Handle search
	const handleSearch = (value: string) => {
		setSearchTerm(value);
		updateFilters({
			search: value || undefined,
			status: statusFilter !== 'all' ? statusFilter : undefined,
			platform: platformFilter !== 'all' ? platformFilter : undefined,
			clientId: selectedClient !== 'all' ? selectedClient : undefined,
			sortBy: sortBy as any,
			sortOrder,
			page: 1,
			limit: itemsPerPage,
		});
	};

	// Handle status filter
	const handleStatusFilter = (value: string) => {
		setStatusFilter(value);
		updateFilters({
			search: searchTerm || undefined,
			status: value !== 'all' ? value : undefined,
			platform: platformFilter !== 'all' ? platformFilter : undefined,
			clientId: selectedClient !== 'all' ? selectedClient : undefined,
			sortBy: sortBy as any,
			sortOrder,
			page: 1,
			limit: itemsPerPage,
		});
	};

	// Handle sorting
	const handleSort = (newSortBy: string) => {
		const newSortOrder =
			sortBy === newSortBy && sortOrder === 'desc' ? 'asc' : 'desc';
		setSortBy(newSortBy);
		setSortOrder(newSortOrder);
		updateFilters({
			search: searchTerm || undefined,
			status: statusFilter !== 'all' ? statusFilter : undefined,
			platform: platformFilter !== 'all' ? platformFilter : undefined,
			clientId: selectedClient !== 'all' ? selectedClient : undefined,
			sortBy: newSortBy as any,
			sortOrder: newSortOrder,
			page: 1,
			limit: itemsPerPage,
		});
	};

	// Handle campaign click
	const handleCampaignClick = (campaignId: string) => {
		if (onCampaignSelect) {
			onCampaignSelect(campaignId);
		} else {
			router.push(`/campaigns/${campaignId}`);
		}
	};

	// Pagination handlers
	const handlePageChange = (page: number) => {
		updateFilters({
			search: searchTerm || undefined,
			status: statusFilter !== 'all' ? statusFilter : undefined,
			platform: platformFilter !== 'all' ? platformFilter : undefined,
			clientId: selectedClient !== 'all' ? selectedClient : undefined,
			sortBy: sortBy as any,
			sortOrder,
			page,
			limit: itemsPerPage,
		});
	};

	const handleItemsPerPageChange = (newItemsPerPage: number) => {
		setItemsPerPage(newItemsPerPage);
		updateFilters({
			search: searchTerm || undefined,
			status: statusFilter !== 'all' ? statusFilter : undefined,
			platform: platformFilter !== 'all' ? platformFilter : undefined,
			clientId: selectedClient !== 'all' ? selectedClient : undefined,
			sortBy: sortBy as any,
			sortOrder,
			page: currentPage, // Keep current page instead of resetting to 1
			limit: newItemsPerPage,
		});
	};

	// Generate page numbers for pagination
	const getPageNumbers = () => {
		const pages = [];
		const maxVisiblePages = 5;

		if (totalPages <= maxVisiblePages) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			const startPage = Math.max(1, currentPage - 2);
			const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

			for (let i = startPage; i <= endPage; i++) {
				pages.push(i);
			}
		}

		return pages;
	};

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

	if (error) {
		return (
			<div className="space-y-6">
				<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
					<div className="text-center">
						<ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-500" />
						<h3 className="mt-2 text-sm font-medium text-gray-900">
							Error loading campaigns
						</h3>
						<p className="mt-1 text-sm text-gray-500">{error}</p>
						<button
							onClick={refreshCampaigns}
							className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
						>
							<ArrowPathIcon className="h-4 w-4 mr-2" />
							Retry
						</button>
					</div>
				</div>
			</div>
		);
	}

	// Don't show full skeleton, show table with loading rows instead

	const truncateText = (str: string, length = 20) => {
		return str.length > length ? str.slice(0, length) + '...' : str;
	};

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
								{totalItems > 0
									? `Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
											currentPage * itemsPerPage,
											totalItems
									  )} of ${totalItems} campaigns`
									: `${totalItems} campaigns`}
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
									onChange={(e) => handleSearch(e.target.value)}
									className="pl-8 pr-4 py-2 text-sm border rounded-sm focus:shadow-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-200"
									aria-label="Search campaigns"
								/>
							</div>

							<select
								value={selectedClient}
								onChange={(e) => {
									setSelectedClient(e.target.value);
									updateFilters({
										search: searchTerm || undefined,
										status: statusFilter !== 'all' ? statusFilter : undefined,
										platform:
											platformFilter !== 'all' ? platformFilter : undefined,
										clientId:
											e.target.value !== 'all' ? e.target.value : undefined,
										sortBy: sortBy as any,
										sortOrder,
										page: 1,
										limit: itemsPerPage,
									});
								}}
								className="px-3 py-2 text-sm border rounded-sm focus:shadow-sm bg-white text-gray-900 focus:outline-none transition-all duration-200"
							>
								<option value="all">All Clients</option>
								{clients.map((client) => (
									<option key={client.id} value={client.id}>
										{client.company_name}
									</option>
								))}
								{clientsLoading && <div>Loading...</div>}
							</select>
							{/* Status Filter */}
							<select
								value={statusFilter}
								onChange={(e) => handleStatusFilter(e.target.value)}
								className="px-3 py-2 text-sm border rounded-sm focus:shadow-sm bg-white text-gray-900 focus:outline-none transition-all duration-200"
							>
								<option value="all">All Status</option>
								<option value="active">Active</option>
								<option value="paused">Paused</option>
								<option value="completed">Completed</option>
								<option value="draft">Draft</option>
							</select>

							{/* Platform Filter */}

							<div className="flex bg-white/80 backdrop-blur-sm border border-primary-200 rounded-sm p-1">
								{['all', 'Instantly', 'Bison'].map((platform) => (
									<button
										key={platform}
										onClick={() => {
											setPlatformFilter(platform);
											updateFilters({
												search: searchTerm || undefined,
												status:
													statusFilter !== 'all' ? statusFilter : undefined,
												platform:
													platform !== 'all'
														? platform === 'Instantly'
															? 'instantly'
															: 'bison'
														: undefined,
												clientId:
													selectedClient !== 'all' ? selectedClient : undefined,
												sortBy: sortBy as any,
												sortOrder,
												page: 1,
												limit: itemsPerPage,
											});
										}}
										className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors duration-200 ${
											platformFilter === platform
												? 'bg-primary-100 text-primary-700 shadow-sm'
												: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
										}`}
									>
										{platform === 'all' ? 'All' : platform}
									</button>
								))}
							</div>

							{/* Refresh Button */}
							<button
								onClick={refreshCampaigns}
								className="px-3 py-2 text-sm border rounded-sm focus:shadow-sm bg-white text-gray-900 hover:bg-gray-50 focus:outline-none transition-all duration-200"
								title="Refresh campaigns"
							>
								<ArrowPathIcon className="h-4 w-4" />
							</button>
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
									onClick={() => handleSort('sent')}
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
								<th
									onClick={() => handleSort('contacted')}
									className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-primary-100 transition-colors duration-200"
								>
									<div className="flex items-center">
										Leads
										{sortBy === 'contacted' &&
											(sortOrder === 'asc' ? (
												<ArrowUpIcon className="h-4 w-4 ml-1 text-primary-500" />
											) : (
												<ArrowDownIcon className="h-4 w-4 ml-1 text-primary-500" />
											))}
									</div>
								</th>
								<th
									onClick={() => handleSort('opens')}
									className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-primary-100 transition-colors duration-200"
								>
									<div className="flex items-center">
										Opens
										{sortBy === 'opens' &&
											(sortOrder === 'asc' ? (
												<ArrowUpIcon className="h-4 w-4 ml-1 text-primary-500" />
											) : (
												<ArrowDownIcon className="h-4 w-4 ml-1 text-primary-500" />
											))}
									</div>
								</th>
								<th
									onClick={() => handleSort('replies')}
									className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-primary-100 transition-colors duration-200"
								>
									<div className="flex items-center">
										Replies
										{sortBy === 'replies' &&
											(sortOrder === 'asc' ? (
												<ArrowUpIcon className="h-4 w-4 ml-1 text-primary-500" />
											) : (
												<ArrowDownIcon className="h-4 w-4 ml-1 text-primary-500" />
											))}
									</div>
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Reply Rate
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Positive
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Positive Rate
								</th>
								<th
									onClick={() => handleSort('bounced')}
									className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-primary-100 transition-colors duration-200"
								>
									<div className="flex items-center">
										Bounced
										{sortBy === 'bounced' &&
											(sortOrder === 'asc' ? (
												<ArrowUpIcon className="h-4 w-4 ml-1 text-primary-500" />
											) : (
												<ArrowDownIcon className="h-4 w-4 ml-1 text-primary-500" />
											))}
									</div>
								</th>

								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Bounce Rate
								</th>

								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Status
								</th>

								<th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white/50 divide-y divide-primary-100">
							{loading
								? // Show skeleton rows when loading
								  [...Array(itemsPerPage)].map((_, index) => (
										<tr key={`skeleton-${index}`} className="animate-pulse">
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center">
													<div className="flex-shrink-0 h-10 w-10">
														<div className="h-10 w-10 rounded-full bg-gray-200"></div>
													</div>
													<div className="ml-4">
														<div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
														<div className="h-3 bg-gray-200 rounded w-32"></div>
													</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="h-4 bg-gray-200 rounded w-32"></div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="h-4 bg-gray-200 rounded w-20"></div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="h-4 bg-gray-200 rounded w-16"></div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="h-4 bg-gray-200 rounded w-16"></div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="h-4 bg-gray-200 rounded w-16"></div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="h-4 bg-gray-200 rounded w-16"></div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="h-4 bg-gray-200 rounded w-20"></div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="h-4 bg-gray-200 rounded w-16"></div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="h-4 bg-gray-200 rounded w-20"></div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="h-4 bg-gray-200 rounded w-16"></div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="h-4 bg-gray-200 rounded w-20"></div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="h-4 bg-gray-200 rounded w-16"></div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="h-4 bg-gray-200 rounded w-20"></div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="h-4 bg-gray-200 rounded w-16"></div>
											</td>
										</tr>
								  ))
								: // Show actual data when not loading
								  campaigns.map((campaign, index) => (
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

													<div className="ml-4 relative group">
														<div className="text-sm font-medium text-gray-900">
															{truncateText(campaign.name)}
														</div>
														<div className="text-sm text-gray-500">
															ID: {truncateText(campaign.id, 10)}
														</div>

														<div className="absolute left-0 bottom-full mb-2 hidden w-max max-w-xs rounded-md bg-gray-800 px-2 py-1 text-xs text-white shadow-md opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:block">
															{campaign.name}
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
												<div className="text-sm text-gray-900">
													{formatNumber(campaign.sent)}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm font-medium text-gray-900">
													{campaign.leads}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm font-medium text-gray-900">
													{formatNumber(campaign.opens)}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm font-medium text-gray-900">
													{formatNumber(campaign.replies)}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm font-medium text-gray-900">
													{(campaign.replyRate ?? 0).toFixed(1)}%
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm font-medium text-gray-900">
													{campaign.positiveReplies}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm font-medium text-gray-900">
													{(campaign.positiveRate ?? 0).toFixed(1)}%
												</div>
											</td>

											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm font-medium text-gray-900">
													{(campaign.bounceRate ?? 0).toFixed(1)}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm text-gray-900">
													{(campaign.bounceRate ?? 0).toFixed(1)}%
												</div>
											</td>

											<td className="px-6 py-4 whitespace-nowrap">
												<span
													className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
														campaign.status
													)}`}
												>
													{getStatusIcon(campaign.status)}
													{campaign.status.charAt(0).toUpperCase() +
														campaign.status.slice(1)}
												</span>
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
												</div>
											</td>
										</tr>
								  ))}
						</tbody>
					</table>
				</div>

				{/* Empty State */}
				{!loading && totalItems === 0 && (
					<div className="text-center py-12 bg-primary-50/30">
						<EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400" />
						<h3 className="mt-2 text-sm font-medium text-gray-900">
							No campaigns found
						</h3>
						<p className="mt-1 text-sm text-gray-500">
							{searchTerm ||
							statusFilter !== 'all' ||
							platformFilter !== 'all' ||
							selectedClient !== 'all'
								? 'Try adjusting your search or filter criteria.'
								: 'Get started by creating a new campaign.'}
						</p>
					</div>
				)}
			</div>

			{/* Pagination Controls */}
			{totalPages > 1 && (
				<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 px-6 py-4">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
						{/* Pagination Info */}
						<div className="text-sm text-gray-600 mb-4 sm:mb-0">
							Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
							{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{' '}
							campaigns
						</div>

						{/* TODO: i want to add a dropdown to select the number of items per page */}
						<div className="flex items-center space-x-2">
							<select
								value={itemsPerPage}
								onChange={(e) =>
									handleItemsPerPageChange(Number(e.target.value))
								}
								className="px-3 py-2 text-sm border rounded-sm focus:shadow-sm bg-white text-gray-900 focus:outline-none transition-all duration-200"
							>
								<option value={5}>5 per page</option>
								<option value={10}>10 per page</option>
								<option value={25}>25 per page</option>
								<option value={50}>50 per page</option>
								<option value={100}>100 per page</option>
							</select>
						</div>

						{/* Pagination Navigation */}
						<div className="flex items-center space-x-2">
							{/* Previous Button */}
							<button
								onClick={() => handlePageChange(currentPage - 1)}
								disabled={currentPage === 1}
								className={`p-2 rounded-md border transition-colors duration-200 ${
									currentPage === 1
										? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
										: 'bg-white border-primary-200 text-primary-600 hover:bg-primary-50'
								}`}
								title="Previous page"
							>
								<ChevronLeftIcon className="h-4 w-4" />
							</button>

							{/* Page Numbers */}
							<div className="flex items-center space-x-1">
								{getPageNumbers().map((pageNumber: number) => (
									<button
										key={pageNumber}
										onClick={() => handlePageChange(pageNumber)}
										className={`px-3 py-2 text-sm rounded-md border transition-colors duration-200 ${
											currentPage === pageNumber
												? 'bg-primary-100 border-primary-200 text-primary-700 font-medium'
												: 'bg-white border-primary-200 text-primary-600 hover:bg-primary-50'
										}`}
									>
										{pageNumber}
									</button>
								))}
							</div>

							{/* Next Button */}
							<button
								onClick={() => handlePageChange(currentPage + 1)}
								disabled={currentPage === totalPages}
								className={`p-2 rounded-md border transition-colors duration-200 ${
									currentPage === totalPages
										? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
										: 'bg-white border-primary-200 text-primary-600 hover:bg-primary-50'
								}`}
								title="Next page"
							>
								<ChevronRightIcon className="h-4 w-4" />
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
