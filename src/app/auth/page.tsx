'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/Auth/LoginForm';

export default function AuthPage() {
	const { user, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!loading && user && user.user_metadata?.enabled !== false) {
			// Redirect to dashboard if user is already authenticated and enabled
			router.push('/');
		}
	}, [user, loading, router]);

	// Show loading while checking authentication
	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-primary-50/20 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	// Don't show login form if user is already authenticated and enabled
	if (user && user.user_metadata?.enabled !== false) {
		return null; // Will redirect to dashboard
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-primary-50/20 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="w-full max-w-md">
				<LoginForm />
			</div>
		</div>
	);
}
