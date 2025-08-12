import {
	ChartBarIcon,
	UsersIcon,
	Cog6ToothIcon,
	BuildingOfficeIcon,
	EnvelopeIcon,
	ShieldCheckIcon,
} from '@heroicons/react/16/solid';

export const tabs = [
	{
		id: 'dashboard',
		name: 'Overview',
		icon: ChartBarIcon,
		href: '/dashboard',
	},
	{
		id: 'clients',
		name: 'Clients',
		icon: BuildingOfficeIcon,
		href: '/clients',
	},
	{
		id: 'campaigns',
		name: 'Campaigns',
		icon: EnvelopeIcon,
		href: '/campaigns',
	},
	{
		id: 'inboxes',
		name: 'Inbox Health',
		icon: EnvelopeIcon,
		href: '/inboxes',
	},
	{
		id: 'deliverability',
		name: 'Deliverability',
		icon: ShieldCheckIcon,
		href: '/deliverability',
	},
	{ id: 'users', name: 'Users', icon: UsersIcon, href: '/users' },
	{ id: 'settings', name: 'Settings', icon: Cog6ToothIcon, href: '/settings' },
];

export const getTabDescription = (tabId: string) => {
	switch (tabId) {
		case 'dashboard':
			return 'Key metrics and Analytics insights.';
		case 'clients':
			return 'Client management and performance.';
		case 'campaigns':
			return 'Campaign management and analytics.';
		case 'inboxes':
			return 'Inbox health and capacity management.';
		case 'deliverability':
			return 'Deliverability monitoring and bounce investigation.';
		case 'users':
			return 'User management.';
		case 'settings':
			return 'Manage your preferences and configuration.';
		default:
			return '';
	}
};
