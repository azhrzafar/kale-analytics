'use client';

import React from 'react';
import ExecutiveOverview from '@/components/Dashboard/ExecutiveOverview';

export default function DashboardPage() {
	return (
		<div className="space-y-6 lg:space-y-8 min-h-[calc(70vh)]">
			<div className="animate-fade-in flex flex-col gap-6">
				<ExecutiveOverview />
			</div>
		</div>
	);
}
