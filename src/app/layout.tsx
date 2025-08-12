import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { AppProvider } from '@/lib/appContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Kale - Analytics Dashboard',
	description:
		'Modern Analytics analytics platform for smart business decisions. Track expenses, revenue, and insights with professional-grade tools.',
	keywords: [
		'Analytics dashboard',
		'expense tracking',
		'revenue analytics',
		'business intelligence',
		'Analytics reporting',
		'cash flow',
		'budget management',
		'Analytics insights',
	],
	authors: [{ name: 'Kale Finance' }],
	creator: 'Kale Finance',
	publisher: 'Kale Finance',
	robots: 'index, follow',
	openGraph: {
		title: 'Kale - Analytics Dashboard',
		description:
			'Modern Analytics analytics platform for smart business decisions',
		type: 'website',
		locale: 'en_US',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Kale - Analytics Dashboard',
		description:
			'Modern Analytics analytics platform for smart business decisions',
	},
	icons: {
		icon: [
			{ url: '/favicon.ico', sizes: 'any' },
			{ url: '/favicon.ico', sizes: '16x16', type: 'image/x-icon' },
			{ url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
		],
		apple: '/favicon.ico',
		shortcut: '/favicon.ico',
	},
	manifest: '/site.webmanifest',
	viewport: {
		width: 'device-width',
		initialScale: 1,
		maximumScale: 1,
	},
	themeColor: '#3b82f6', // Primary blue color
	colorScheme: 'light',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<AuthProvider>
					<AppProvider>
						<div className="min-h-screen bg-white">{children}</div>
					</AppProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
