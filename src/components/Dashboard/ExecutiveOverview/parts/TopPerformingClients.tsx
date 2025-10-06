'use client';

import React, { useEffect, useState } from 'react';
import { BuildingOfficeIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface ClientData {
	id: string;
	name: string;
	onboardDate: string;
	services: string[];
	emailsSent: number;
	replies: number;
	replyRate: number;
	positiveReplies: number;
	positiveReplyRate: number;
	bounces: number;
	bounceRate: number;
	uniqueLeads: number;

	// Additional client fields
	domain: string;
	primaryEmail: string;
	primaryNumber: string;
	contactTitle: string;
	industry: string;
	instantlyApi: string;
	bisonApi: string;
	instantlyApiV2: string;
}

export default function TopPerformingClients() {
	const router = useRouter();

	const [clients, setClients] = useState<ClientData[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchClients = async () => {
		try {
			setLoading(true);
			setError(null);
			const params = new URLSearchParams();
			params.append('sortBy', 'emailsSent');
			params.append('sortOrder', 'desc');

			const response = await fetch(`/api/clients?${params.toString()}`);

			if (!response.ok) {
				if (response.status === 404) {
					throw new Error('Campaign not found');
				}
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();

			if (result.success) {
				setClients(result.data);
			} else {
				throw new Error('Failed to fetch campaign details');
			}
		} catch (err) {
			console.error('Error fetching clients:', err);
			setError(err instanceof Error ? err.message : 'Failed to fetch clients');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchClients();
	}, []);

	if (loading) {
		return (
			<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
				<div className="flex items-center justify-between mb-6">
					<h3 className="text-lg font-semibold text-gray-900">
						Top Performing Clients
					</h3>
					<div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
				</div>
				<div className="space-y-4">
					{Array.from({ length: 3 }).map((_, index) => (
						<div
							key={index}
							className="flex items-center space-x-4 animate-pulse"
						>
							<div className="w-10 h-10 bg-gray-200 rounded-full"></div>
							<div className="flex-1">
								<div className="w-32 h-4 bg-gray-200 rounded mb-2"></div>
								<div className="w-24 h-3 bg-gray-200 rounded"></div>
							</div>
							<div className="w-16 h-4 bg-gray-200 rounded"></div>
						</div>
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
				<div className="flex items-center justify-between mb-6">
					<h3 className="text-lg font-semibold text-gray-900">
						Top Performing Clients
					</h3>
				</div>
				<div className="text-center py-8">
					<p className="text-gray-500 mb-4">{error}</p>
					<button
						onClick={fetchClients}
						className="text-sm text-blue-600 hover:text-blue-700 font-medium"
					>
						Try Again
					</button>
				</div>
			</div>
		);
	}
	return (
		<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
			<div className="flex items-center justify-between mb-6">
				<h3 className="text-lg font-semibold text-gray-900">
					Top Performing Clients
					<br />
					<span className="text-sm text-gray-400">
						(Top 3: Ranked by emails sent)
					</span>
				</h3>
				<button
					onClick={() => {
						router.push('/clients');
					}}
					className="text-sm text-blue-600 hover:text-blue-700 font-medium"
				>
					View All
				</button>
			</div>

			<div className="space-y-3">
				{clients.slice(0, 3).map((client, index) => (
					<div
						key={client.id}
						className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
						onClick={() => router.push(`/clients/${client.id}`)}
					>
						<div className="relative">
							<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
								<BuildingOfficeIcon className="w-5 h-5 text-white" />
							</div>
							{/* {index < 3 && (
								<div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-white">
									{index + 1}
								</div>
							)} */}
						</div>
						<div className="flex-1 min-w-0">
							<div className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
								{client.name}
							</div>
							<div className="text-sm text-gray-500 truncate">
								{client.domain}
							</div>
							<div className="text-xs text-gray-400 mt-1">
								{client.emailsSent.toLocaleString()} emails sent
							</div>
						</div>
						<button
							onClick={(e) => {
								e.stopPropagation();
								router.push(`/clients/${client.id}`);
							}}
							className="p-2 text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
						>
							<EyeIcon className="w-4 h-4" />
						</button>
					</div>
				))}
				{clients.length === 0 && (
					<div className="text-center py-8 text-gray-500">
						<p>No clients found</p>
					</div>
				)}
			</div>
		</div>
	);
}
