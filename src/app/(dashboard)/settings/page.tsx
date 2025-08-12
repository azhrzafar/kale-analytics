'use client';

import React, { useState, useEffect } from 'react';
import { useAppSettings, useUserProfile } from '@/lib/appContext';
import {
	CheckIcon,
	ExclamationTriangleIcon,
	UserIcon,
	LockClosedIcon,
} from '@heroicons/react/24/outline';
import Profile from '@/components/Settings/Profile';
import ChangePassword from '@/components/Settings/ChangePassword';

export default function SettingsPage() {
	const { settingsLoading } = useAppSettings();
	const { userLoading } = useUserProfile();

	const [message, setMessage] = useState<{
		type: 'success' | 'error';
		text: string;
	} | null>(null);

	// Tab state
	const [activeTab, setActiveTab] = useState<'profile' | 'changePassword'>(
		'changePassword'
	);

	// Check for tab parameter in URL on mount
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const urlParams = new URLSearchParams(window.location.search);
			const tabParam = urlParams.get('tab');
			if (tabParam && ['profile', 'changePassword'].includes(tabParam)) {
				setActiveTab(tabParam as any);
			}
		}
	}, []);

	if (settingsLoading || userLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
			</div>
		);
	}

	return (
		<div className="mx-auto">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
				<p className="text-gray-600">
					Manage your account preferences and analytics settings.
				</p>
			</div>

			{/* Message Display */}
			{message && (
				<div
					className={`mb-6 p-4 rounded-sm flex items-center space-x-2 ${
						message.type === 'success'
							? 'bg-green-50 border border-green-200 text-green-800'
							: 'bg-red-50 border border-red-200 text-red-800'
					}`}
				>
					{message.type === 'success' ? (
						<CheckIcon className="h-5 w-5 text-green-600" />
					) : (
						<ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
					)}
					<span>{message.text}</span>
				</div>
			)}

			{/* Tab Navigation and Content */}
			<div className="flex gap-8">
				{/* Vertical Tab Navigation */}
				<div className="w-72 flex-shrink-0">
					<nav className="space-y-2">
						<button
							onClick={() => setActiveTab('changePassword')}
							className={`w-full text-left px-4 py-3.5 rounded-md font-medium text-sm flex items-center space-x-3 transition-all duration-200 ${
								activeTab === 'changePassword'
									? 'bg-primary-50 border border-primary-200 text-primary-700 shadow-sm'
									: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm'
							}`}
						>
							<LockClosedIcon className="h-5 w-5" />
							<span>Change Password</span>
						</button>{' '}
						<button
							onClick={() => setActiveTab('profile')}
							className={`w-full text-left px-4 py-3.5 rounded-md font-medium text-sm flex items-center space-x-3 transition-all duration-200 ${
								activeTab === 'profile'
									? 'bg-primary-50 border border-primary-200 text-primary-700 shadow-sm'
									: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm'
							}`}
						>
							<UserIcon className="h-5 w-5" />
							<span>Profile</span>
						</button>
					</nav>
				</div>

				{/* Tab Content */}
				<div className="flex-1 bg-white rounded-md shadow-sm border border-gray-200">
					{activeTab === 'changePassword' && <ChangePassword />}
					{activeTab === 'profile' && <Profile />}
				</div>
			</div>
		</div>
	);
}
