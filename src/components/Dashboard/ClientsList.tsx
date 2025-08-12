'use client';

import React, { useState, useEffect } from 'react';
import {
	BuildingOfficeIcon,
	CalendarIcon,
	UsersIcon,
	MagnifyingGlassIcon,
	FunnelIcon,
	ArrowUpIcon,
	ArrowDownIcon,
	EyeIcon,
	ChartBarIcon,
	CheckCircleIcon,
	ExclamationTriangleIcon,
	PauseIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { formatNumber } from '@/lib/utils';

interface ClientsListProps {
	onClientSelect?: (clientId: string) => void;
}

interface ClientData {
	id: string;
	name: string;
	onboardDate: string;
	platforms: string[];
	status: 'active' | 'paused' | 'warning';
	replyRate: number;
	replyRateChange: number;
	positiveReplies: number;
	positiveRepliesChange: number;
	bounceRate: number;
	bounceRateChange: number;
	emailsSent: number;
	emailsSentChange: number;
	uniqueLeads: number;
	uniqueLeadsChange: number;
}

export default function ClientsList({ onClientSelect }: ClientsListProps) {
	const [clients, setClients] = useState<ClientData[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [sortBy, setSortBy] = useState<
		'name' | 'replyRate' | 'positiveReplies' | 'bounceRate' | 'emailsSent'
	>('replyRate');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const router = useRouter();

	// Mock data for demonstration
	useEffect(() => {
		setLoading(true);

		// Simulate API call
		setTimeout(() => {
			setClients([
				{
					id: '1',
					name: 'N2',
					onboardDate: '2024-01-15',
					platforms: ['Instantly', 'Bison'],
					status: 'active',
					replyRate: 14.2,
					replyRateChange: 2.1,
					positiveReplies: 847,
					positiveRepliesChange: -5.2,
					bounceRate: 2.8,
					bounceRateChange: -0.5,
					emailsSent: 5967,
					emailsSentChange: 12.3,
					uniqueLeads: 5234,
					uniqueLeadsChange: 8.7,
				},
				{
					id: '2',
					name: 'Terraboost',
					onboardDate: '2024-01-10',
					platforms: ['Bison'],
					status: 'active',
					replyRate: 12.8,
					replyRateChange: 5.3,
					positiveReplies: 642,
					positiveRepliesChange: 8.1,
					bounceRate: 3.1,
					bounceRateChange: -0.2,
					emailsSent: 4234,
					emailsSentChange: 15.7,
					uniqueLeads: 3890,
					uniqueLeadsChange: 12.4,
				},
				{
					id: '3',
					name: 'Ship with mina',
					onboardDate: '2024-01-20',
					platforms: ['Instantly', 'Bison', 'Missive'],
					status: 'warning',
					replyRate: 8.7,
					replyRateChange: -8.7,
					positiveReplies: 234,
					positiveRepliesChange: -12.3,
					bounceRate: 5.2,
					bounceRateChange: 1.8,
					emailsSent: 2890,
					emailsSentChange: -3.4,
					uniqueLeads: 2456,
					uniqueLeadsChange: -2.1,
				},
				{
					id: '4',
					name: 'Maximiz',
					onboardDate: '2024-01-05',
					platforms: ['Instantly'],
					status: 'active',
					replyRate: 16.4,
					replyRateChange: 1.2,
					positiveReplies: 1234,
					positiveRepliesChange: 3.8,
					bounceRate: 1.9,
					bounceRateChange: -0.3,
					emailsSent: 7567,
					emailsSentChange: 8.9,
					uniqueLeads: 6234,
					uniqueLeadsChange: 6.2,
				},
				{
					id: '5',
					name: 'Kale',
					onboardDate: '2024-01-12',
					platforms: ['Bison'],
					status: 'paused',
					replyRate: 11.2,
					replyRateChange: -3.4,
					positiveReplies: 456,
					positiveRepliesChange: -7.8,
					bounceRate: 4.1,
					bounceRateChange: 0.9,
					emailsSent: 3456,
					emailsSentChange: -5.2,
					uniqueLeads: 2987,
					uniqueLeadsChange: -4.3,
				},
				{
					id: '6',
					name: 'N2 Recruiting',
					onboardDate: '2024-01-12',
					platforms: ['Instantly'],
					status: 'paused',
					replyRate: 11.2,
					replyRateChange: -3.4,
					positiveReplies: 456,
					positiveRepliesChange: -7.8,
					bounceRate: 4.1,
					bounceRateChange: 0.9,
					emailsSent: 3456,
					emailsSentChange: -5.2,
					uniqueLeads: 2987,
					uniqueLeadsChange: -4.3,
				},
			]);
			setLoading(false);
		}, 1000);
	}, []);

	// Filter and sort clients
	const filteredClients = clients
		.filter((client) => {
			const matchesSearch = client.name
				.toLowerCase()
				.includes(searchTerm.toLowerCase());
			const matchesStatus =
				statusFilter === 'all' || client.status === statusFilter;
			return matchesSearch && matchesStatus;
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
				case 'positiveReplies':
					comparison = a.positiveReplies - b.positiveReplies;
					break;
				case 'bounceRate':
					comparison = a.bounceRate - b.bounceRate;
					break;
				case 'emailsSent':
					comparison = a.emailsSent - b.emailsSent;
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
			case 'warning':
				return 'text-danger-600 bg-danger-50 border-danger-200';
			default:
				return 'text-neutral-600 bg-neutral-50 border-neutral-200';
		}
	};

	const getChangeColor = (change: number) => {
		return change > 0
			? 'text-success-600'
			: change < 0
			? 'text-danger-600'
			: 'text-neutral-500';
	};

	const getChangeIcon = (change: number) => {
		return change > 0 ? ArrowUpIcon : change < 0 ? ArrowDownIcon : null;
	};

	const handleClientClick = (clientId: string) => {
		if (onClientSelect) {
			onClientSelect(clientId);
		} else {
			router.push(`/clients/${clientId}`);
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
								<BuildingOfficeIcon className="h-5 w-5 mr-2 text-primary-600" />
								Clients
							</h2>
							<p className="text-sm text-gray-600 mt-1">
								{filteredClients.length} of {clients.length} clients
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
									placeholder="Search clients"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-8 pr-4 py-2 text-sm border rounded-sm focus:shadow-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-200"
									aria-label="Search clients"
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
								<option value="warning">Warning</option>
							</select>
						</div>
					</div>
				</div>
			</div>

			{/* Clients Table */}
			<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-primary-100">
						<thead className="bg-primary-50/50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Client
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
										if (sortBy === 'positiveReplies') {
											setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
										} else {
											setSortBy('positiveReplies');
											setSortOrder('desc');
										}
									}}
									className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-primary-100 transition-colors duration-200"
								>
									<div className="flex items-center">
										Positive Replies
										{sortBy === 'positiveReplies' &&
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
										if (sortBy === 'emailsSent') {
											setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
										} else {
											setSortBy('emailsSent');
											setSortOrder('desc');
										}
									}}
									className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-primary-100 transition-colors duration-200"
								>
									<div className="flex items-center">
										Emails Sent
										{sortBy === 'emailsSent' &&
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
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white/50 divide-y divide-primary-100">
							{filteredClients.map((client, index) => {
								const ChangeIcon = getChangeIcon(client.replyRateChange);
								return (
									<tr
										key={client.id}
										className="hover:bg-primary-50/50 transition-colors duration-200 cursor-pointer"
										onClick={() => handleClientClick(client.id)}
										style={{ animationDelay: `${index * 50}ms` }}
									>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center">
												<div className="flex-shrink-0 h-10 w-10">
													<div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
														<BuildingOfficeIcon className="h-5 w-5 text-primary-600" />
													</div>
												</div>
												<div className="ml-4">
													<div className="text-sm font-medium text-gray-900">
														{client.name}
													</div>
													<div className="text-sm text-gray-500">
														{client.platforms.join(', ')} •{' '}
														{new Date(client.onboardDate).toLocaleDateString()}
													</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center space-x-2">
												<span className="text-sm font-medium text-gray-900">
													{client.replyRate.toFixed(1)}%
												</span>
												{ChangeIcon && (
													<ChangeIcon
														className={`h-3 w-3 ${getChangeColor(
															client.replyRateChange
														)}`}
													/>
												)}
												<span
													className={`text-xs ${getChangeColor(
														client.replyRateChange
													)}`}
												>
													{Math.abs(client.replyRateChange).toFixed(1)}%
												</span>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center space-x-2">
												<span className="text-sm font-medium text-gray-900">
													{formatNumber(client.positiveReplies)}
												</span>
												{(() => {
													const Icon = getChangeIcon(
														client.positiveRepliesChange
													);
													return (
														Icon && (
															<Icon
																className={`h-3 w-3 ${getChangeColor(
																	client.positiveRepliesChange
																)}`}
															/>
														)
													);
												})()}
												<span
													className={`text-xs ${getChangeColor(
														client.positiveRepliesChange
													)}`}
												>
													{Math.abs(client.positiveRepliesChange).toFixed(1)}%
												</span>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center space-x-2">
												<span className="text-sm text-gray-900">
													{client.bounceRate.toFixed(1)}%
												</span>
												{(() => {
													const Icon = getChangeIcon(client.bounceRateChange);
													return (
														Icon && (
															<Icon
																className={`h-3 w-3 ${getChangeColor(
																	client.bounceRateChange
																)}`}
															/>
														)
													);
												})()}
												<span
													className={`text-xs ${getChangeColor(
														client.bounceRateChange
													)}`}
												>
													{Math.abs(client.bounceRateChange).toFixed(1)}%
												</span>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center space-x-2">
												<span className="text-sm text-gray-900">
													{formatNumber(client.emailsSent)}
												</span>
												{(() => {
													const Icon = getChangeIcon(client.emailsSentChange);
													return (
														Icon && (
															<Icon
																className={`h-3 w-3 ${getChangeColor(
																	client.emailsSentChange
																)}`}
															/>
														)
													);
												})()}
												<span
													className={`text-xs ${getChangeColor(
														client.emailsSentChange
													)}`}
												>
													{Math.abs(client.emailsSentChange).toFixed(1)}%
												</span>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
													client.status
												)}`}
											>
												{client.status === 'active' && (
													<CheckCircleIcon className="h-3 w-3 mr-1" />
												)}
												{client.status === 'paused' && (
													<PauseIcon className="h-3 w-3 mr-1" />
												)}
												{client.status === 'warning' && (
													<ExclamationTriangleIcon className="h-3 w-3 mr-1" />
												)}
												{client.status.charAt(0).toUpperCase() +
													client.status.slice(1)}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
											<div className="flex justify-end space-x-2">
												<button
													className="text-primary-600 hover:text-primary-900 transition-colors duration-200"
													title="View details"
													onClick={(e) => {
														e.stopPropagation();
														handleClientClick(client.id);
													}}
												>
													<EyeIcon className="h-4 w-4" />
												</button>
												<button
													className="text-neutral-600 hover:text-neutral-900 transition-colors duration-200"
													title="View analytics"
													onClick={(e) => {
														e.stopPropagation();
														router.push(`/clients/${client.id}/analytics`);
													}}
												>
													<ChartBarIcon className="h-4 w-4" />
												</button>
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>

				{/* Empty State */}
				{filteredClients.length === 0 && (
					<div className="text-center py-12 bg-primary-50/30">
						<BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
						<h3 className="mt-2 text-sm font-medium text-gray-900">
							No clients found
						</h3>
						<p className="mt-1 text-sm text-gray-500">
							{searchTerm || statusFilter !== 'all'
								? 'Try adjusting your search or filter criteria.'
								: 'Get started by adding a new client.'}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
