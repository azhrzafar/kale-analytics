'use client';

import React from 'react';
import CampaignsList from '@/components/Dashboard/CampaignsList';

export default function CampaignsPage() {
	return (
		<div className="space-y-6 lg:space-y-8 min-h-[calc(70vh)]">
			<div className="animate-fade-in flex flex-col gap-6">
				<CampaignsList />
			</div>
		</div>
	);
}
