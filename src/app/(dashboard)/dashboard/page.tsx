'use client';

import React from 'react';
import KPICards from '@/components/Dashboard/KPICards';
import DateRangeFilter from '@/components/Common/DatePicker';
import { useDateFilter } from '@/lib/appContext';

export default function DashboardPage() {
	const { dateFilter } = useDateFilter();

	return (
		<div className="space-y-6 lg:space-y-8 min-h-[calc(70vh)]">
			<div className="flex justify-end gap-4 items-center mb-6 lg:mb-8">
				<DateRangeFilter />
			</div>

			<div className="animate-fade-in flex flex-col gap-6">
				<KPICards timeFilter={dateFilter.range} preset={dateFilter.preset} />
			</div>
		</div>
	);
}
