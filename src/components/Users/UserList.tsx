'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
	UserIcon,
	CalendarIcon,
	ClockIcon,
	ExclamationTriangleIcon,
	CheckCircleIcon,
	PlusIcon,
	NoSymbolIcon,
	MagnifyingGlassIcon,
	FunnelIcon,
	ArrowUpIcon,
	ArrowDownIcon,
	UsersIcon,
	ShieldCheckIcon,
	ShieldExclamationIcon,
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { userService, UserProfile } from '@/lib/userService';
import { format } from 'date-fns';
import { useAuth } from '@/lib/auth';
import { classNames } from '@/lib/utils';

interface UserListProps {
	showAddModal: boolean;
	setShowAddModal: (show: boolean) => void;
	actionLoading: string | null;
}

export default function UserList({
	showAddModal,
	setShowAddModal,
	actionLoading,
}: UserListProps) {
	const [users, setUsers] = useState<UserProfile[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [localActionLoading, setLocalActionLoading] = useState<string | null>(
		null
	);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [sortBy, setSortBy] = useState<
		'email' | 'created' | 'lastSignIn' | 'status'
	>('created');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const { user: currentUser } = useAuth();

	useEffect(() => {
		loadUsers();
	}, []);

	const loadUsers = async () => {
		try {
			setLoading(true);
			const usersData = await userService.getAllUsers();
			setUsers(usersData);
			setError('');
		} catch (err) {
			setError('Failed to load users');
			console.error('Error loading users:', err);
		} finally {
			setLoading(false);
		}
	};

	const handleBanUser = async (userId: string) => {
		// Prevent users from disabling themselves
		if (currentUser && userId === currentUser.id) {
			setError('You cannot disable your own account');
			return;
		}

		try {
			setLocalActionLoading(userId);
			await userService.banUser(userId);
			await loadUsers();
		} catch (err: any) {
			setError(err.message || 'Failed to disable user');
		} finally {
			setLocalActionLoading(null);
		}
	};

	const handleUnbanUser = async (userId: string) => {
		try {
			setLocalActionLoading(userId);
			await userService.unbanUser(userId);
			await loadUsers();
		} catch (err: any) {
			setError(err.message || 'Failed to enable user');
		} finally {
			setLocalActionLoading(null);
		}
	};

	// Calculate summary statistics
	const summaryStats = useMemo(() => {
		const totalUsers = users.length;
		const activeUsers = users.filter((user) => user.enabled).length;
		const disabledUsers = users.filter((user) => !user.enabled).length;
		const recentUsers = users.filter((user) => {
			const createdDate = new Date(user.created_at);
			const thirtyDaysAgo = new Date();
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
			return createdDate > thirtyDaysAgo;
		}).length;

		return { totalUsers, activeUsers, disabledUsers, recentUsers };
	}, [users]);

	// Filter and sort users
	const filteredUsers = useMemo(() => {
		let filtered = users.filter((user) => {
			const matchesSearch = user.email
				.toLowerCase()
				.includes(searchTerm.toLowerCase());
			const matchesStatus =
				statusFilter === 'all' ||
				(statusFilter === 'active' && user.enabled) ||
				(statusFilter === 'disabled' && !user.enabled);
			return matchesSearch && matchesStatus;
		});

		// Sort users
		filtered.sort((a, b) => {
			let comparison = 0;

			switch (sortBy) {
				case 'email':
					comparison = a.email.localeCompare(b.email);
					break;
				case 'created':
					comparison =
						new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
					break;
				case 'lastSignIn':
					const aLastSignIn = a.last_sign_in_at
						? new Date(a.last_sign_in_at).getTime()
						: 0;
					const bLastSignIn = b.last_sign_in_at
						? new Date(b.last_sign_in_at).getTime()
						: 0;
					comparison = aLastSignIn - bLastSignIn;
					break;
				case 'status':
					comparison = (a.enabled ? 1 : 0) - (b.enabled ? 1 : 0);
					break;
			}

			return sortOrder === 'asc' ? comparison : -comparison;
		});

		return filtered;
	}, [users, searchTerm, statusFilter, sortBy, sortOrder]);

	const getStatusBadge = (user: UserProfile) => {
		if (!user.enabled) {
			return (
				<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800 border border-warning-200">
					<NoSymbolIcon className="h-3 w-3 mr-1" />
					Disabled
				</span>
			);
		}

		return (
			<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800 border border-success-200">
				<CheckCircleIcon className="h-3 w-3 mr-1" />
				Active
			</span>
		);
	};

	if (loading) {
		return (
			<div className="space-y-6">
				{/* Loading skeleton for summary stats */}
				<div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
					{[...Array(4)].map((_, index) => (
						<div
							key={index}
							className="bg-white/80 backdrop-blur-sm p-4 rounded-sm border border-primary-100 shadow-primary animate-pulse"
						>
							<div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
							<div className="h-8 bg-gray-200 rounded w-16"></div>
						</div>
					))}
				</div>

				{/* Loading skeleton for table */}
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
			{/* Summary Stats */}
			<div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
				<div className="bg-white/80 backdrop-blur-sm p-4 rounded-sm border border-primary-100 shadow-primary">
					<div className="flex items-center">
						<div className="flex-shrink-0 p-2.5 rounded-sm bg-primary-50 shadow-sm">
							<UsersIcon className="h-4 w-4 text-primary-600" />
						</div>
						<div className="ml-4">
							<div className="text-sm font-medium text-gray-500">
								Total Users
							</div>
							<div className="text-2xl font-bold text-gray-900">
								{summaryStats.totalUsers}
							</div>
						</div>
					</div>
				</div>
				<div className="bg-white/80 backdrop-blur-sm p-4 rounded-sm border border-primary-100 shadow-primary">
					<div className="flex items-center">
						<div className="flex-shrink-0 p-2.5 rounded-sm bg-success-50 shadow-sm">
							<ShieldCheckIcon className="h-4 w-4 text-success-600" />
						</div>
						<div className="ml-4">
							<div className="text-sm font-medium text-gray-500">
								Active Users
							</div>
							<div className="text-2xl font-bold text-gray-900">
								{summaryStats.activeUsers}
							</div>
						</div>
					</div>
				</div>
				<div className="bg-white/80 backdrop-blur-sm p-4 rounded-sm border border-primary-100 shadow-primary">
					<div className="flex items-center">
						<div className="flex-shrink-0 p-2.5 rounded-sm bg-warning-50 shadow-sm">
							<ShieldExclamationIcon className="h-4 w-4 text-warning-600" />
						</div>
						<div className="ml-4">
							<div className="text-sm font-medium text-gray-500">
								Disabled Users
							</div>
							<div className="text-2xl font-bold text-gray-900">
								{summaryStats.disabledUsers}
							</div>
						</div>
					</div>
				</div>
				<div className="bg-white/80 backdrop-blur-sm p-4 rounded-sm border border-primary-100 shadow-primary">
					<div className="flex items-center">
						<div className="flex-shrink-0 p-2.5 rounded-sm bg-primary-50 shadow-sm">
							<CalendarIcon className="h-4 w-4 text-primary-600" />
						</div>
						<div className="ml-4">
							<div className="text-sm font-medium text-gray-500">
								New (last 30 days)
							</div>
							<div className="text-2xl font-bold text-gray-900">
								{summaryStats.recentUsers}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* User Management Table */}
			<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 overflow-hidden">
				{/* Header */}
				<div className="px-6 py-4 border-b border-primary-100 bg-primary-50/80">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h2 className="text-lg font-semibold text-gray-900 flex items-center">
								User Management
							</h2>
							<p className="text-sm text-gray-600 mt-1">
								{filteredUsers.length} of {users.length} users
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
									placeholder="Search users"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-8 pr-4 py-2 text-sm border rounded-sm focus:shadow-sm bg-white text-gray-900 placeholder-gray-400 
               focus:outline-none transition-all duration-200"
									aria-label="Search users"
								/>
							</div>

							{/* Status Filter */}
							<Menu as="div" className="relative">
								<Menu.Button className="focus:ring-2 focus:ring-primary-500 active:ring-primary-500 inline-flex items-center px-3 py-2 border border-primary-200 rounded-sm text-sm font-medium text-gray-700 bg-white/80 backdrop-blur-sm hover:bg-primary-50 transition-colors duration-200">
									<FunnelIcon className="h-4 w-4 mr-2 text-primary-500" />
									{statusFilter === 'all'
										? 'All Users'
										: statusFilter === 'active'
										? 'Active'
										: 'Disabled'}
								</Menu.Button>
								<Transition as={Fragment}>
									<Menu.Items className="absolute right-0 mt-2 w-48 rounded-sm shadow-primary-lg bg-white/90 backdrop-blur-md ring-1 ring-primary-200 focus:outline-none z-10 border border-primary-100">
										<div className="py-1">
											{['all', 'active', 'disabled'].map((status) => (
												<Menu.Item key={status}>
													{({ active }) => (
														<button
															onClick={() => setStatusFilter(status)}
															className={classNames(
																active ? 'bg-primary-50' : '',
																statusFilter === status
																	? 'bg-primary-100 text-primary-700 font-medium'
																	: 'text-gray-900',
																'group flex items-center px-4 py-2 text-sm w-full text-left transition-colors duration-150'
															)}
														>
															{status === 'all'
																? 'All Users'
																: status === 'active'
																? 'Active'
																: 'Disabled'}
															{statusFilter === status && (
																<span className="ml-auto">
																	<div className="w-2 h-2 bg-primary-500 rounded-full"></div>
																</span>
															)}
														</button>
													)}
												</Menu.Item>
											))}
										</div>
									</Menu.Items>
								</Transition>
							</Menu>

							{/* Add User Button */}
							<button
								onClick={() => setShowAddModal(true)}
								className="btn btn-primary inline-flex items-center"
							>
								<PlusIcon className="h-4 w-4 mr-2" />
								Add User
							</button>
						</div>
					</div>
				</div>

				{/* Error Message */}
				{error && (
					<div className="mx-6 mt-4 bg-danger-50 border border-danger-200 rounded-sm p-4">
						<div className="flex">
							<ExclamationTriangleIcon className="h-5 w-5 text-danger-400 mr-2" />
							<p className="text-sm text-danger-600">{error}</p>
						</div>
					</div>
				)}

				{/* Table */}
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-primary-100">
						<thead className="bg-primary-50/50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									User
								</th>
								<th
									onClick={() => {
										if (sortBy === 'status') {
											setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
										} else {
											setSortBy('status');
											setSortOrder('desc');
										}
									}}
									className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-primary-100 transition-colors duration-200"
								>
									<div className="flex items-center">
										Status
										{sortBy === 'status' &&
											(sortOrder === 'asc' ? (
												<ArrowUpIcon className="h-4 w-4 ml-1 text-primary-500" />
											) : (
												<ArrowDownIcon className="h-4 w-4 ml-1 text-primary-500" />
											))}
									</div>
								</th>
								<th
									onClick={() => {
										if (sortBy === 'created') {
											setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
										} else {
											setSortBy('created');
											setSortOrder('desc');
										}
									}}
									className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-primary-100 transition-colors duration-200"
								>
									<div className="flex items-center">
										Created
										{sortBy === 'created' &&
											(sortOrder === 'asc' ? (
												<ArrowUpIcon className="h-4 w-4 ml-1 text-primary-500" />
											) : (
												<ArrowDownIcon className="h-4 w-4 ml-1 text-primary-500" />
											))}
									</div>
								</th>
								<th
									onClick={() => {
										if (sortBy === 'lastSignIn') {
											setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
										} else {
											setSortBy('lastSignIn');
											setSortOrder('desc');
										}
									}}
									className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-primary-100 transition-colors duration-200"
								>
									<div className="flex items-center">
										Last Sign In
										{sortBy === 'lastSignIn' &&
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
							{filteredUsers.map((user, index) => {
								const isCurrentUser = currentUser && user.id === currentUser.id;
								return (
									<tr
										key={user.id}
										className={`hover:bg-primary-50/50 transition-colors duration-200 ${
											isCurrentUser ? 'bg-primary-50/50' : ''
										}`}
										style={{ animationDelay: `${index * 50}ms` }}
									>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center">
												<div className="flex-shrink-0 h-10 w-10">
													<div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
														<UserIcon className="h-5 w-5 text-primary-600" />
													</div>
												</div>
												<div className="ml-4">
													<div className="text-sm font-medium text-gray-900">
														{user.email}
														{isCurrentUser && (
															<span className="ml-2 text-xs text-primary-600 font-medium">
																(You)
															</span>
														)}
													</div>
													<div className="text-sm text-gray-500">
														ID: {user.id.slice(0, 8)}...
													</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{getStatusBadge(user)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											<div className="flex items-center">
												<CalendarIcon className="h-4 w-4 mr-1" />
												{format(new Date(user.created_at), 'MMM d, yyyy')}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{user.last_sign_in_at ? (
												<div className="flex items-center">
													<ClockIcon className="h-4 w-4 mr-1" />
													{format(
														new Date(user.last_sign_in_at),
														'MMM d, yyyy HH:mm'
													)}
												</div>
											) : (
												<span className="text-gray-400">Never</span>
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
											<div className="flex justify-end space-x-2">
												{!user.enabled ? (
													<button
														onClick={() => handleUnbanUser(user.id)}
														disabled={localActionLoading === user.id}
														className="text-success-600 hover:text-success-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
														title="Enable user"
													>
														Grant access
													</button>
												) : (
													<button
														onClick={() => handleBanUser(user.id)}
														disabled={
															localActionLoading === user.id || !!isCurrentUser
														}
														className={`${
															isCurrentUser
																? 'text-gray-400 cursor-not-allowed'
																: 'text-warning-600 hover:text-warning-900'
														} disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
														title={
															isCurrentUser
																? 'You cannot disable your own account'
																: 'Disable user'
														}
													>
														Revoke access
													</button>
												)}
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>

				{/* Empty State */}
				{filteredUsers.length === 0 && (
					<div className="text-center py-12 bg-primary-50/30">
						<UserIcon className="mx-auto h-12 w-12 text-gray-400" />
						<h3 className="mt-2 text-sm font-medium text-gray-900">
							No users found
						</h3>
						<p className="mt-1 text-sm text-gray-500">
							{searchTerm || statusFilter !== 'all'
								? 'Try adjusting your search or filter criteria.'
								: 'Get started by adding a new user.'}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
