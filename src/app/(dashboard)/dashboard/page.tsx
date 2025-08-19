'use client';

import React from 'react';
import ExecutiveOverview from '@/components/Dashboard/ExecutiveOverview';
import { useDateFilter } from '@/lib/appContext';

export default function DashboardPage() {
	const { dateFilter } = useDateFilter();

	return (
		<div className="space-y-6 lg:space-y-8 min-h-[calc(70vh)]">
			<div className="animate-fade-in flex flex-col gap-6">
				<ExecutiveOverview
					timeFilter={dateFilter.range}
					preset={dateFilter.preset}
				/>
			</div>
		</div>
	);
}
