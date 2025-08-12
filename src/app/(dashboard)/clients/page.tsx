'use client';

import React from 'react';
import ClientsList from '@/components/Dashboard/ClientsList';

export default function ClientsPage() {
	return (
		<div className="space-y-6 lg:space-y-8 min-h-[calc(70vh)]">
			<div className="animate-fade-in flex flex-col gap-6">
				<ClientsList />
			</div>
		</div>
	);
}
