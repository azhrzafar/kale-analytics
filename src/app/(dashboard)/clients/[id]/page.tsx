'use client';

import React from 'react';
import ClientDetail from '@/components/Dashboard/ClientDetail';

interface ClientDetailPageProps {
	params: {
		id: string;
	};
}

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
	return (
		<div className="space-y-6 lg:space-y-8 min-h-[calc(70vh)]">
			<div className="animate-fade-in flex flex-col gap-6">
				<ClientDetail clientId={params.id} />
			</div>
		</div>
	);
}
