'use client';

import React from 'react';
import InboxHealth from '@/components/Dashboard/InboxHealth';

export default function InboxesPage() {
	return (
		<div className="space-y-6 lg:space-y-8 min-h-[calc(70vh)]">
			<div className="animate-fade-in flex flex-col gap-6">
				<InboxHealth />
			</div>
		</div>
	);
}
