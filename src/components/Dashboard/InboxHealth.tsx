'use client';

import React, { useState, useEffect } from 'react';
import {
	EnvelopeIcon,
	MagnifyingGlassIcon,
	ArrowUpIcon,
	ArrowDownIcon,
	PauseIcon,
	PlayIcon,
	ArrowPathIcon,
	ExclamationTriangleIcon,
	CheckCircleIcon,
	XCircleIcon,
	ClockIcon,
	ChartBarIcon,
	LightBulbIcon,
	BellIcon,
	EyeIcon,
	WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { formatNumber, formatPercentage } from '@/lib/utils';

interface InboxHealthProps {
	onInboxSelect?: (inboxId: string) => void;
}

interface InboxData {
	id: string;
	domain_id: string;
	email: string;
	daily_send_limit: string;
	send_count: string;
	created_at: string;
	updated_at: string;
}

interface WarmupSuggestion {
	id: string;
	type: 'warning' | 'suggestion' | 'action';
	title: string;
	description: string;
	priority: 'high' | 'medium' | 'low';
	action?: string;
	affectedInboxes: string[];
}

interface AlertData {
	id: string;
	type: 'high_usage' | 'blocked' | 'error_spike';
	title: string;
	description: string;
	timestamp: string;
	severity: 'critical' | 'warning' | 'info';
	action?: string;
	affectedInboxes: string[];
}

export default function InboxHealth({ onInboxSelect }: InboxHealthProps) {
	const [inboxes, setInboxes] = useState<InboxData[]>([]);
	const [warmupSuggestions, setWarmupSuggestions] = useState<
		WarmupSuggestion[]
	>([]);
	const [alerts, setAlerts] = useState<AlertData[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [domainFilter, setDomainFilter] = useState<string>('all');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [sortBy, setSortBy] = useState<
		'email' | 'domain' | 'usagePercentage' | 'sendingErrors' | 'lastSentAt'
	>('usagePercentage');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const [selectedInboxes, setSelectedInboxes] = useState<string[]>([]);
	const router = useRouter();

	// Mock data for demonstration
	useEffect(() => {
		setLoading(true);

		// Simulate API call
		setTimeout(() => {
			setInboxes([
				{
					id: '1',
					email: 'john@techcorp.com',
					domain: 'techcorp.com',
					dailySendLimit: 500,
					todaySendCount: 450,
					usagePercentage: 90,
					lastSentAt: '2024-01-20 15:30',
					status: 'active',
					sendingErrors: 5,
					errorRate: 1.1,
				},
				{
					id: '2',
					email: 'sarah@techcorp.com',
					domain: 'techcorp.com',
					dailySendLimit: 500,
					todaySendCount: 320,
					usagePercentage: 64,
					lastSentAt: '2024-01-20 14:15',
					status: 'active',
					sendingErrors: 2,
					errorRate: 0.6,
				},
				{
					id: '3',
					email: 'mike@startupxyz.com',
					domain: 'startupxyz.com',
					dailySendLimit: 300,
					todaySendCount: 285,
					usagePercentage: 95,
					lastSentAt: '2024-01-20 16:45',
					status: 'warmup',
					sendingErrors: 12,
					errorRate: 4.2,
				},
				{
					id: '4',
					email: 'lisa@globalinnovations.com',
					domain: 'globalinnovations.com',
					dailySendLimit: 800,
					todaySendCount: 720,
					usagePercentage: 90,
					lastSentAt: '2024-01-20 13:20',
					status: 'active',
					sendingErrors: 8,
					errorRate: 1.1,
				},
				{
					id: '5',
					email: 'alex@startupxyz.com',
					domain: 'startupxyz.com',
					dailySendLimit: 300,
					todaySendCount: 150,
					usagePercentage: 50,
					lastSentAt: '2024-01-20 12:30',
					status: 'paused',
					sendingErrors: 0,
					errorRate: 0,
				},
				{
					id: '6',
					email: 'test@company.com',
					domain: 'company.com',
					dailySendLimit: 200,
					todaySendCount: 0,
					usagePercentage: 0,
					lastSentAt: '2024-01-19 18:00',
					status: 'blocked',
					sendingErrors: 45,
					errorRate: 22.5,
				},
			]);

			setWarmupSuggestions([
				{
					id: '1',
					type: 'warning',
					title: 'High Usage Detected',
					description:
						'Inbox mike@startupxyz.com is at 95% capacity. Consider reducing daily send limit or rotating to alternative inboxes.',
					priority: 'high',
					action: 'Reduce daily send limit by 20%',
					affectedInboxes: ['mike@startupxyz.com'],
				},
				{
					id: '2',
					type: 'suggestion',
					title: 'Warmup Opportunity',
					description:
						'Inbox alex@startupxyz.com is paused but has good deliverability. Consider resuming warmup process.',
					priority: 'medium',
					action: 'Resume warmup process',
					affectedInboxes: ['alex@startupxyz.com'],
				},
				{
					id: '3',
					type: 'action',
					title: 'Error Rate Spike',
					description:
						'Inbox test@company.com has 22.5% error rate. Immediate investigation required.',
					priority: 'high',
					action: 'Investigate and reassign sends',
					affectedInboxes: ['test@company.com'],
				},
			]);

			setAlerts([
				{
					id: '1',
					type: 'high_usage',
					title: 'Critical: Inbox at 95% Capacity',
					description:
						'mike@startupxyz.com has reached 95% of daily send limit. Immediate action required.',
					timestamp: '2024-01-20 16:45',
					severity: 'critical',
					action: 'Reassign 15 pending sends',
					affectedInboxes: ['mike@startupxyz.com'],
				},
				{
					id: '2',
					type: 'blocked',
					title: 'Inbox Blocked',
					description:
						'test@company.com has been blocked due to high bounce rate. All sends suspended.',
					timestamp: '2024-01-20 14:30',
					severity: 'critical',
					action: 'Investigate and reassign 25 pending sends',
					affectedInboxes: ['test@company.com'],
				},
				{
					id: '3',
					type: 'error_spike',
					title: 'Error Rate Increase',
					description:
						'john@techcorp.com showing increased error rate. Monitor closely.',
					timestamp: '2024-01-20 15:30',
					severity: 'warning',
					action: 'Monitor and adjust if needed',
					affectedInboxes: ['john@techcorp.com'],
				},
			]);

			setLoading(false);
		}, 1000);
	}, []);

	// Filter and sort inboxes
	const filteredInboxes = inboxes
		.filter((inbox) => {
			const matchesSearch =
				inbox.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
				inbox.domain.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesDomain =
				domainFilter === 'all' || inbox.domain === domainFilter;
			const matchesStatus =
				statusFilter === 'all' || inbox.status === statusFilter;
			return matchesSearch && matchesDomain && matchesStatus;
		})
		.sort((a, b) => {
			let comparison = 0;
			switch (sortBy) {
				case 'email':
					comparison = a.email.localeCompare(b.email);
					break;
				case 'domain':
					comparison = a.domain.localeCompare(b.domain);
					break;
				case 'usagePercentage':
					comparison = a.usagePercentage - b.usagePercentage;
					break;
				case 'sendingErrors':
					comparison = a.sendingErrors - b.sendingErrors;
					break;
				case 'lastSentAt':
					comparison =
						new Date(a.lastSentAt).getTime() - new Date(b.lastSentAt).getTime();
					break;
			}
			return sortOrder === 'asc' ? comparison : -comparison;
		});

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'active':
				return 'text-success-600 bg-success-50 border-success-200';
			case 'warmup':
				return 'text-warning-600 bg-warning-50 border-warning-200';
			case 'paused':
				return 'text-neutral-600 bg-neutral-50 border-neutral-200';
			case 'blocked':
				return 'text-danger-600 bg-danger-50 border-danger-200';
			default:
				return 'text-neutral-600 bg-neutral-50 border-neutral-200';
		}
	};

	const getUsageColor = (percentage: number) => {
		if (percentage >= 90) return 'text-danger-600';
		if (percentage >= 70) return 'text-warning-600';
		return 'text-success-600';
	};

	const getUsageBgColor = (percentage: number) => {
		if (percentage >= 90) return 'bg-danger-100';
		if (percentage >= 70) return 'bg-warning-100';
		return 'bg-success-100';
	};

	const getAlertColor = (severity: string) => {
		switch (severity) {
			case 'critical':
				return 'text-danger-600 bg-danger-50 border-danger-200';
			case 'warning':
				return 'text-warning-600 bg-warning-50 border-warning-200';
			case 'info':
				return 'text-primary-600 bg-primary-50 border-primary-200';
			default:
				return 'text-neutral-600 bg-neutral-50 border-neutral-200';
		}
	};

	const getSuggestionColor = (type: string) => {
		switch (type) {
			case 'warning':
				return 'text-warning-600 bg-warning-50 border-warning-200';
			case 'suggestion':
				return 'text-primary-600 bg-primary-50 border-primary-200';
			case 'action':
				return 'text-success-600 bg-success-50 border-success-200';
			default:
				return 'text-neutral-600 bg-neutral-50 border-neutral-200';
		}
	};

	const handleInboxSelect = (inboxId: string) => {
		if (onInboxSelect) {
			onInboxSelect(inboxId);
		} else {
			router.push(`/inboxes/${inboxId}`);
		}
	};

	const handleBulkAction = (action: string) => {
		if (selectedInboxes.length === 0) return;

		switch (action) {
			case 'pause':
				console.log('Pausing inboxes:', selectedInboxes);
				break;
			case 'reassign':
				console.log('Reassigning sends from inboxes:', selectedInboxes);
				break;
			case 'warmup':
				console.log('Starting warmup for inboxes:', selectedInboxes);
				break;
		}
		setSelectedInboxes([]);
	};

	const handleSelectAll = () => {
		if (selectedInboxes.length === filteredInboxes.length) {
			setSelectedInboxes([]);
		} else {
			setSelectedInboxes(filteredInboxes.map((inbox) => inbox.id));
		}
	};

	const handleSelectInbox = (inboxId: string) => {
		setSelectedInboxes((prev) =>
			prev.includes(inboxId)
				? prev.filter((id) => id !== inboxId)
				: [...prev, inboxId]
		);
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
								Inbox Health & Capacity
							</h2>
							<p className="text-sm text-gray-600 mt-1">
								{filteredInboxes.length} of {inboxes.length} inboxes
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
									placeholder="Search inboxes"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-8 pr-4 py-2 text-sm border rounded-sm focus:shadow-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-200"
									aria-label="Search inboxes"
								/>
							</div>

							{/* Domain Filter */}
							<select
								value={domainFilter}
								onChange={(e) => setDomainFilter(e.target.value)}
								className="px-3 py-2 text-sm border rounded-sm focus:shadow-sm bg-white text-gray-900 focus:outline-none transition-all duration-200"
							>
								<option value="all">All Domains</option>
								<option value="techcorp.com">techcorp.com</option>
								<option value="startupxyz.com">startupxyz.com</option>
								<option value="globalinnovations.com">
									globalinnovations.com
								</option>
								<option value="company.com">company.com</option>
							</select>

							{/* Status Filter */}
							<select
								value={statusFilter}
								onChange={(e) => setStatusFilter(e.target.value)}
								className="px-3 py-2 text-sm border rounded-sm focus:shadow-sm bg-white text-gray-900 focus:outline-none transition-all duration-200"
							>
								<option value="all">All Status</option>
								<option value="active">Active</option>
								<option value="warmup">Warmup</option>
								<option value="paused">Paused</option>
								<option value="blocked">Blocked</option>
							</select>
						</div>
					</div>
				</div>
			</div>

			{/* Alerts */}
			{alerts.length > 0 && (
				<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
						<BellIcon className="h-5 w-5 mr-2 text-primary-600" />
						Active Alerts
					</h3>
					<div className="space-y-3">
						{alerts.map((alert) => (
							<div
								key={alert.id}
								className={`p-3 rounded-sm border ${getAlertColor(
									alert.severity
								)}`}
							>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<h4 className="text-sm font-medium mb-1">{alert.title}</h4>
										<p className="text-xs mb-2">{alert.description}</p>
										<div className="flex items-center space-x-4 text-xs text-gray-500">
											<span>{new Date(alert.timestamp).toLocaleString()}</span>
											<span>{alert.affectedInboxes.join(', ')}</span>
										</div>
									</div>
									{alert.action && (
										<button className="text-xs font-medium hover:underline transition-colors duration-200">
											{alert.action}
										</button>
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Inboxes Table */}
			<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 overflow-hidden">
				<div className="px-6 py-4 border-b border-primary-100 bg-primary-50/80">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
						<div className="flex items-center space-x-4">
							<input
								type="checkbox"
								checked={
									selectedInboxes.length === filteredInboxes.length &&
									filteredInboxes.length > 0
								}
								onChange={handleSelectAll}
								className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
							/>
							<span className="text-sm text-gray-600">
								{selectedInboxes.length} selected
							</span>
						</div>
						{selectedInboxes.length > 0 && (
							<div className="mt-4 sm:mt-0 flex space-x-2">
								<button
									onClick={() => handleBulkAction('pause')}
									className="inline-flex items-center px-3 py-2 border border-primary-300 text-sm leading-4 font-medium rounded-sm text-primary-700 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
								>
									<PauseIcon className="h-4 w-4 mr-1" />
									Pause
								</button>
								<button
									onClick={() => handleBulkAction('reassign')}
									className="inline-flex items-center px-3 py-2 border border-primary-300 text-sm leading-4 font-medium rounded-sm text-primary-700 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
								>
									<ArrowPathIcon className="h-4 w-4 mr-1" />
									Reassign
								</button>
								<button
									onClick={() => handleBulkAction('warmup')}
									className="inline-flex items-center px-3 py-2 border border-primary-300 text-sm leading-4 font-medium rounded-sm text-primary-700 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
								>
									<WrenchScrewdriverIcon className="h-4 w-4 mr-1" />
									Warmup
								</button>
							</div>
						)}
					</div>
				</div>

				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-primary-100">
						<thead className="bg-primary-50/50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									<input
										type="checkbox"
										checked={
											selectedInboxes.length === filteredInboxes.length &&
											filteredInboxes.length > 0
										}
										onChange={handleSelectAll}
										className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
									/>
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Inbox
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Domain
								</th>
								<th
									onClick={() => {
										if (sortBy === 'usagePercentage') {
											setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
										} else {
											setSortBy('usagePercentage');
											setSortOrder('desc');
										}
									}}
									className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-primary-100 transition-colors duration-200"
								>
									<div className="flex items-center">
										Capacity
										{sortBy === 'usagePercentage' &&
											(sortOrder === 'asc' ? (
												<ArrowUpIcon className="h-4 w-4 ml-1 text-primary-500" />
											) : (
												<ArrowDownIcon className="h-4 w-4 ml-1 text-primary-500" />
											))}
									</div>
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Daily Limit
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Today Sent
								</th>
								<th
									onClick={() => {
										if (sortBy === 'sendingErrors') {
											setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
										} else {
											setSortBy('sendingErrors');
											setSortOrder('desc');
										}
									}}
									className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-primary-100 transition-colors duration-200"
								>
									<div className="flex items-center">
										Errors
										{sortBy === 'sendingErrors' &&
											(sortOrder === 'asc' ? (
												<ArrowUpIcon className="h-4 w-4 ml-1 text-primary-500" />
											) : (
												<ArrowDownIcon className="h-4 w-4 ml-1 text-primary-500" />
											))}
									</div>
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Last Sent
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
							{filteredInboxes.map((inbox, index) => (
								<tr
									key={inbox.id}
									className="hover:bg-primary-50/50 transition-colors duration-200"
									style={{ animationDelay: `${index * 50}ms` }}
								>
									<td className="px-6 py-4 whitespace-nowrap">
										<input
											type="checkbox"
											checked={selectedInboxes.includes(inbox.id)}
											onChange={() => handleSelectInbox(inbox.id)}
											className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
										/>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex items-center">
											<div className="flex-shrink-0 h-10 w-10">
												<div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
													<EnvelopeIcon className="h-5 w-5 text-primary-600" />
												</div>
											</div>
											<div className="ml-4">
												<div className="text-sm font-medium text-gray-900">
													{inbox.email}
												</div>
											</div>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span className="text-sm text-gray-600">
											{inbox.domain}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex items-center space-x-3">
											<div className="flex-1">
												<div className="w-full bg-gray-200 rounded-full h-2">
													<div
														className={`h-2 rounded-full transition-all duration-300 ${getUsageBgColor(
															inbox.usagePercentage
														)}`}
														style={{ width: `${inbox.usagePercentage}%` }}
													></div>
												</div>
											</div>
											<span
												className={`text-sm font-medium ${getUsageColor(
													inbox.usagePercentage
												)}`}
											>
												{inbox.usagePercentage}%
											</span>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-gray-900">
											{formatNumber(inbox.dailySendLimit)}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-gray-900">
											{formatNumber(inbox.todaySendCount)}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-gray-900">
											{formatNumber(inbox.sendingErrors)} (
											{inbox.errorRate.toFixed(1)}%)
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-gray-600">
											{new Date(inbox.lastSentAt).toLocaleTimeString()}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
												inbox.status
											)}`}
										>
											{inbox.status === 'active' && (
												<CheckCircleIcon className="h-3 w-3 mr-1" />
											)}
											{inbox.status === 'warmup' && (
												<ClockIcon className="h-3 w-3 mr-1" />
											)}
											{inbox.status === 'paused' && (
												<PauseIcon className="h-3 w-3 mr-1" />
											)}
											{inbox.status === 'blocked' && (
												<XCircleIcon className="h-3 w-3 mr-1" />
											)}
											{inbox.status.charAt(0).toUpperCase() +
												inbox.status.slice(1)}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
										<div className="flex justify-end space-x-2">
											<button
												className="text-primary-600 hover:text-primary-900 transition-colors duration-200"
												title="View details"
												onClick={() => handleInboxSelect(inbox.id)}
											>
												<EyeIcon className="h-4 w-4" />
											</button>
											{inbox.status === 'active' ? (
												<button
													className="text-warning-600 hover:text-warning-900 transition-colors duration-200"
													title="Pause inbox"
												>
													<PauseIcon className="h-4 w-4" />
												</button>
											) : (
												<button
													className="text-success-600 hover:text-success-900 transition-colors duration-200"
													title="Resume inbox"
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
				{filteredInboxes.length === 0 && (
					<div className="text-center py-12 bg-primary-50/30">
						<EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400" />
						<h3 className="mt-2 text-sm font-medium text-gray-900">
							No inboxes found
						</h3>
						<p className="mt-1 text-sm text-gray-500">
							{searchTerm || domainFilter !== 'all' || statusFilter !== 'all'
								? 'Try adjusting your search or filter criteria.'
								: 'Get started by adding a new inbox.'}
						</p>
					</div>
				)}
			</div>

			{/* Warmup & Throttling Suggestions */}
			{warmupSuggestions.length > 0 && (
				<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
						<LightBulbIcon className="h-5 w-5 mr-2 text-primary-600" />
						Warmup & Throttling Suggestions
					</h3>
					<div className="space-y-3">
						{warmupSuggestions.map((suggestion) => (
							<div
								key={suggestion.id}
								className={`p-3 rounded-sm border ${getSuggestionColor(
									suggestion.type
								)}`}
							>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<h4 className="text-sm font-medium mb-1">
											{suggestion.title}
										</h4>
										<p className="text-xs mb-2">{suggestion.description}</p>
										<div className="text-xs text-gray-500">
											Affected: {suggestion.affectedInboxes.join(', ')}
										</div>
									</div>
									{suggestion.action && (
										<button className="text-xs font-medium hover:underline transition-colors duration-200">
											{suggestion.action}
										</button>
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
