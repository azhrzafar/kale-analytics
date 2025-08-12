'use client';

import React from 'react';
import CampaignDetail from '@/components/Dashboard/CampaignDetail';

interface CampaignDetailPageProps {
	params: {
		id: string;
	};
}

export default function CampaignDetailPage({
	params,
}: CampaignDetailPageProps) {
	return (
		<div className="space-y-6 lg:space-y-8 min-h-[calc(70vh)]">
			<div className="animate-fade-in flex flex-col gap-6">
				<CampaignDetail campaignId={params.id} />
			</div>
		</div>
	);
}
