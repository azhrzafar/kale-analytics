'use client';

import { ChartBarIcon, PlayIcon, UsersIcon } from '@heroicons/react/16/solid';

export default function QuickActions() {
	return (
		<div className="grid grid-cols-1 gap-6">
			{/* Quick Actions */}
			<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">
					Quick Actions
				</h3>
				<div className="space-y-3">
					<button className="w-full flex items-center justify-between p-3 text-left bg-warning-50 border border-warning-200 rounded-sm hover:bg-warning-100 transition-colors duration-200">
						<div>
							<div className="font-medium text-warning-800">
								Optimize Bison Performance
							</div>
							<div className="text-sm text-warning-600">
								Reply rates 15% below average
							</div>
						</div>
						<ChartBarIcon className="h-5 w-5 text-warning-600" />
					</button>
					<button className="w-full flex items-center justify-between p-3 text-left bg-primary-50 border border-primary-200 rounded-sm hover:bg-primary-100 transition-colors duration-200">
						<div>
							<div className="font-medium text-primary-800">
								Scale Instantly Campaigns
							</div>
							<div className="text-sm text-primary-600">
								420% above average performance
							</div>
						</div>
						<PlayIcon className="h-5 w-5 text-primary-600" />
					</button>
					<button className="w-full flex items-center justify-between p-3 text-left bg-success-50 border border-success-200 rounded-sm hover:bg-success-100 transition-colors duration-200">
						<div>
							<div className="font-medium text-success-800">
								Lead Quality Analysis
							</div>
							<div className="text-sm text-success-600">
								602K+ leads to analyze
							</div>
						</div>
						<UsersIcon className="h-5 w-5 text-success-600" />
					</button>
				</div>
			</div>
		</div>
	);
}
