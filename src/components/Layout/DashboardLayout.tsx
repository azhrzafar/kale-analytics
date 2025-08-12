'use client';

import React, { useState } from 'react';
import {
	Bars3Icon,
	XMarkIcon,
	ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getTabDescription, tabs } from './utils';

interface DashboardLayoutProps {
	children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const { user, signOut } = useAuth();
	const pathname = usePathname();

	// Prevent body scroll when mobile menu is open
	React.useEffect(() => {
		if (mobileMenuOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}

		// Cleanup on unmount
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [mobileMenuOpen]);

	const handleTabClick = () => {
		setMobileMenuOpen(false); // Close sidebar when tab is clicked
	};

	const isActiveTab = (href: string) => {
		if (href === '/dashboard') {
			return pathname === '/dashboard' || pathname === '/';
		}
		return pathname === href;
	};

	return (
		<div className="min-h-screen 0">
			{/* Enhanced Header */}
			<header className="bg-white/85 backdrop-blur-xl shadow-lg border-b border-primary-100/50 sticky top-0 z-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					{/* Top Header Section */}
					<div className="flex justify-between items-center py-3 lg:py-4">
						{/* Logo and Branding */}
						<div className="flex items-center">
							<div className="flex items-end mr-4 lg:mr-8">
								<div className="relative">
									<img
										src="/logo.png"
										alt="Kale Logo"
										className="h-6 lg:h-8 w-auto object-contain mr-2 lg:mr-3 drop-shadow-sm"
									/>
								</div>
								<div className="hidden sm:block">
									<p className="text-xs text-gray-500 font-medium tracking-wide uppercase">
										Analytics Dashboard
									</p>
								</div>
							</div>
						</div>

						{/* Desktop Status Indicators */}
						<div className="hidden md:flex items-center space-x-6 self-end">
							{/* User Menu - Enhanced */}
							<div className="relative group">
								<button
									onClick={signOut}
									className="w-full flex items-center px-3 py-2 text-sm text-danger-600 hover:bg-danger-50 rounded-sm transition-colors duration-200"
								>
									<ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
									Sign Out
								</button>
							</div>
						</div>

						{/* Mobile Menu Button */}
						<div className="md:hidden flex items-center space-x-2">
							<button
								onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
								className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
							>
								{mobileMenuOpen ? (
									<XMarkIcon className="h-6 w-6" />
								) : (
									<Bars3Icon className="h-6 w-6" />
								)}
							</button>
						</div>
					</div>

					{/* Enhanced Navigation Tabs */}
					<div className="border-b border-primary-100/50 overflow-x-auto scrollbar-hide">
						{/* Desktop Navigation */}
						<nav className="hidden md:flex space-x-6 md:space-x-8">
							{tabs.map((tab) => {
								const Icon = tab.icon;
								const isActive = isActiveTab(tab.href);
								return (
									<Link
										key={tab.id}
										href={tab.href}
										className={`group relative inline-flex items-center py-2 px-2 font-medium text-sm transition-all duration-300 ${
											isActive
												? 'text-primary-700'
												: 'text-gray-500 hover:text-primary-600'
										}`}
									>
										{/* Active indicator */}
										<div
											className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-300 ${
												isActive ? 'opacity-100' : 'opacity-0'
											}`}
										></div>

										{/* Tab content */}
										<Icon
											className={`h-4 w-4 mr-1.5 transition-all duration-300 ${
												isActive
													? 'text-primary-500'
													: 'text-gray-400 group-hover:text-primary-500'
											}`}
										/>
										<span className="font-medium">{tab.name}</span>

										{/* Hover effect */}
										<div className="absolute inset-0 bg-primary-50 rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
									</Link>
								);
							})}
						</nav>

						{/* Mobile Navigation */}
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8 overflow-y-auto h-full">
				{children}
			</main>

			{/* Mobile Sidebar Overlay */}
			{mobileMenuOpen && (
				<div className="md:hidden fixed inset-0 z-50">
					{/* Backdrop */}
					<div
						className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
						onClick={() => setMobileMenuOpen(false)}
					></div>

					{/* Sidebar */}
					<div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
						{/* Sidebar Header */}
						<div className="flex items-center justify-between p-6 border-b border-gray-200">
							<div className="flex items-center">
								<img
									src="/logo.png"
									alt="Kale Logo"
									className="h-8 w-auto object-contain mr-3"
								/>
								<div>
									<p className="text-sm font-semibold text-gray-900">Menu</p>
									<p className="text-xs text-gray-500">Analytics Dashboard</p>
								</div>
							</div>
							<button
								onClick={() => setMobileMenuOpen(false)}
								className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
							>
								<XMarkIcon className="h-6 w-6" />
							</button>
						</div>

						{/* Sidebar Content */}
						<div className="flex flex-col h-full">
							{/* Scrollable Navigation Tabs - Now at Top */}
							<div className="border-b border-gray-200 bg-white">
								<div className="p-4 max-h-84 overflow-y-auto">
									<div className="space-y-2">
										{tabs.map((tab) => {
											const Icon = tab.icon;
											const isActive = isActiveTab(tab.href);
											return (
												<Link
													key={tab.id}
													href={tab.href}
													onClick={handleTabClick}
													className={`w-full flex items-center px-4 py-3 text-left rounded-sm transition-all duration-200 ${
														isActive
															? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500'
															: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
													}`}
												>
													<Icon
														className={`h-5 w-5 mr-3 ${
															isActive ? 'text-primary-500' : 'text-gray-400'
														}`}
													/>
													<div className="flex-1">
														<div className="font-medium">{tab.name}</div>
														<div className="text-xs text-gray-500 mt-1">
															{getTabDescription(tab.id)}
														</div>
													</div>
												</Link>
											);
										})}
									</div>
								</div>
							</div>

							{/* Content Area - Now at Bottom */}
							<div className="h-fit flex flex-col flex-0">
								{/* User Actions */}
								<div className="space-y-2 mb-6 p-4">
									<button
										onClick={() => {
											signOut();
											setMobileMenuOpen(false);
										}}
										className="w-full flex items-center px-4 py-3 text-left rounded-sm transition-all duration-200 text-danger-600 hover:bg-danger-50 hover:text-danger-800"
									>
										<ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 text-danger-400" />

										<div className="flex-1">
											<div className="font-medium">Sign Out</div>
										</div>
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
