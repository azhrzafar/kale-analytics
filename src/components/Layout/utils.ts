import {
	ChartBarIcon,
	UsersIcon,
	Cog6ToothIcon,
} from '@heroicons/react/16/solid';

export const tabs = [
	{
		id: 'dashboard',
		name: 'Overview',
		icon: ChartBarIcon,
		href: '/dashboard',
	},
	{ id: 'users', name: 'Users', icon: UsersIcon, href: '/users' },
	{ id: 'settings', name: 'Settings', icon: Cog6ToothIcon, href: '/settings' },
];

export const getTabDescription = (tabId: string) => {
	switch (tabId) {
		case 'dashboard':
			return 'Key metrics and Analytics insights.';
		case 'users':
			return 'User management.';
		case 'settings':
			return 'Manage your preferences and configuration.';
		default:
			return '';
	}
};
