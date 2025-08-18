'use client';

import React from 'react';
import { BuildingOfficeIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useClients } from '@/lib/hooks/useClients';
import { useRouter } from 'next/navigation';

export default function TopPerformingClients() {
	const router = useRouter();
	const { clients, loading } = useClients();

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
					{Array.from({ length: 5 }).map((_, index) => (
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

	return (
		<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
			<div className="flex items-center justify-between mb-6">
				<h3 className="text-lg font-semibold text-gray-900">
					Top Performing Clients
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

			<div className="space-y-4">
				{clients.slice(0, 3).map((client) => (
					<div
						key={client.id}
						className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
					>
						<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
							<BuildingOfficeIcon className="w-5 h-5 text-white" />
						</div>
						<div className="flex-1 min-w-0">
							<div className="font-medium text-gray-900 truncate">
								{client['Company Name']}
							</div>
							<div className="text-sm text-gray-500 truncate">
								{client.Domain}
							</div>
						</div>
						<button
							onClick={() => {
								router.push(`/clients/${client.id}`);
							}}
							className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
						>
							<EyeIcon className="w-4 h-4" />
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
