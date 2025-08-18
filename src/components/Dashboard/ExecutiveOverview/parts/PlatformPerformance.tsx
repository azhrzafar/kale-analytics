'use client';

import React from 'react';
import { formatNumber } from '@/lib/utils';
import { PlatformData } from '../utils/types';
import PlatformDistribution from './PlatformDistribution';

interface PlatformPerformanceProps {
	data: PlatformData[];
	loading: boolean;
}

export default function PlatformPerformance({
	data,
	loading,
}: PlatformPerformanceProps) {
	if (loading) {
		return (
			<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
				<div className="flex items-center justify-between mb-6">
					<h3 className="text-lg font-semibold text-gray-900">
						Platform Performance Comparison
					</h3>
					<div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
				</div>
				<div className="space-y-4">
					{Array.from({ length: 2 }).map((_, index) => (
						<div key={index} className="animate-pulse">
							<div className="flex items-center justify-between mb-2">
								<div className="w-20 h-4 bg-gray-200 rounded"></div>
								<div className="w-16 h-4 bg-gray-200 rounded"></div>
							</div>
							<div className="w-full h-2 bg-gray-200 rounded"></div>
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
			<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
				Platform Performance Comparison
			</h3>
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{data.map((platform) => (
					<div
						key={platform.platform}
						className="border border-primary-200 rounded-sm p-4"
					>
						<div className="flex items-center justify-between mb-3">
							<h4 className="text-lg font-semibold text-gray-900">
								{platform.platform}
							</h4>
							<span className="text-sm text-gray-500">
								{formatNumber(platform.leads)} leads
							</span>
						</div>
						<div className="space-y-3">
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">Sends:</span>
								<span className="text-sm font-medium">
									{formatNumber(platform.sends)}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">Replies:</span>
								<span className="text-sm font-medium">
									{formatNumber(platform.replies)}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">Reply Rate:</span>
								<span className="text-sm font-medium text-success-600">
									{platform.replyRate.toFixed(2)}%
								</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">Positive Reply Rate:</span>
								<span className="font-medium text-green-600">
									{platform?.positiveRate?.toFixed(2)}%
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">Bounce Rate:</span>
								<span className="text-sm font-medium text-warning-600">
									{platform.bounceRate.toFixed(2)}%
								</span>
							</div>
						</div>
					</div>
				))}

				{/* Platform Distribution */}
				<PlatformDistribution platformData={data} loading={loading} />
			</div>
		</div>
	);
}
