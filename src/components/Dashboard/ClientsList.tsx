'use client';

import React, { useState, useEffect } from 'react';
import {
	BuildingOfficeIcon,
	MagnifyingGlassIcon,
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
import { useClients } from '@/lib/hooks/useClients';

interface ClientData {
	id: string;
	name: string;
	onboardDate: string;
	services: string[];
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

export default function ClientsList() {
	const [clientData, setClientData] = useState<ClientData[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [sortBy, setSortBy] = useState<
		'name' | 'replyRate' | 'positiveReplies' | 'bounceRate' | 'emailsSent'
	>('replyRate');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const router = useRouter();

	// Fetch clients using custom hook
	const { clients } = useClients();

	// Transform clients data for display
	useEffect(() => {
		setLoading(true);

		// Transform the fetched clients into the format needed for display
		const transformedClients = clients.map(
			(client): ClientData => ({
				id: client?.id.toString(),
				name: client['Company Name'] ?? '',
				onboardDate: client['Onboarding Date'] ?? '',
				services: client.Services ? client.Services.split(',') : [],
				replyRate: 14.2,
				replyRateChange: 2.1,
				positiveReplies: 0,
				positiveRepliesChange: 0,
				bounceRate: 0,
				bounceRateChange: -0.5,
				emailsSent: 5967,
				emailsSentChange: 12.3,
				uniqueLeads: 5234,
				uniqueLeadsChange: 8.7,
			})
		);

		setClientData(transformedClients);
		setLoading(false);
	}, [clients]);

	// Filter and sort clients
	const filteredClients = clientData
		.filter((client) => {
			const matchesSearch = client.name
				.toLowerCase()
				.includes(searchTerm.toLowerCase());
			return matchesSearch;
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
		router.push(`/clients/${clientId}`);
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
														{!!client.services.length &&
															`${client.services.join(', ')} • `}
														{new Date(client.onboardDate).toLocaleDateString()}
													</div>
												</div>
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

										<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
											<div className="flex justify-center space-x-2">
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
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
