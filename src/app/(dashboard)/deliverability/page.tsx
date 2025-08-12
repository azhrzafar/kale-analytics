'use client';

import React from 'react';
import DeliverabilityInvestigation from '@/components/Dashboard/DeliverabilityInvestigation';

export default function DeliverabilityPage() {
	return (
		<div className="space-y-6 lg:space-y-8 min-h-[calc(70vh)]">
			<div className="animate-fade-in flex flex-col gap-6">
				<DeliverabilityInvestigation />
			</div>
		</div>
	);
}
