import { Suspense } from 'react';
import { DashboardLayout } from '@/components/Layout';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

export default function DashboardLayoutWrapper({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ProtectedRoute>
			<Suspense
				fallback={
					<div className="flex items-center justify-center h-screen">
						Loading...
					</div>
				}
			>
				<DashboardLayout>{children}</DashboardLayout>
			</Suspense>
		</ProtectedRoute>
	);
}
