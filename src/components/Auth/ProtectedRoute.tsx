'use client';

import React from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
	children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { user, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!loading) {
			if (!user) {
				router.push('/auth');
			} else if (user.user_metadata?.enabled === false) {
				// If user is disabled, sign them out and redirect to auth
				router.push('/auth');
			}
		}
	}, [user, loading, router]);

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-primary-50/20 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	if (!user || user.user_metadata?.enabled === false) {
		return null; // Will redirect to auth page
	}

	return <>{children}</>;
}
