'use client';

import React, { useState, useEffect } from 'react';
import {
	EyeIcon,
	EyeSlashIcon,
	CheckIcon,
	ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth';

interface ChangePasswordProps {
	onSuccess?: () => void;
	onCancel?: () => void;
}

export default function ChangePassword({
	onSuccess,
	onCancel,
}: ChangePasswordProps) {
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	// Track original values for change detection
	const [originalCurrentPassword, setOriginalCurrentPassword] = useState('');
	const [originalNewPassword, setOriginalNewPassword] = useState('');
	const [originalConfirmPassword, setOriginalConfirmPassword] = useState('');

	const { changePassword } = useAuth();

	// Helper function to check for changes
	const hasChanges = () => {
		return (
			currentPassword !== originalCurrentPassword ||
			newPassword !== originalNewPassword ||
			confirmPassword !== originalConfirmPassword
		);
	};

	// Reset form to original state
	const handleCancel = () => {
		setCurrentPassword(originalCurrentPassword);
		setNewPassword(originalNewPassword);
		setConfirmPassword(originalConfirmPassword);
		setError('');
		setSuccess('');
		onCancel?.();
	};

	const validateForm = () => {
		if (!currentPassword.trim()) {
			setError('Current password is required');
			return false;
		}
		if (!newPassword.trim()) {
			setError('New password is required');
			return false;
		}
		if (newPassword.length < 6) {
			setError('New password must be at least 6 characters');
			return false;
		}
		if (newPassword !== confirmPassword) {
			setError('New passwords do not match');
			return false;
		}
		if (currentPassword === newPassword) {
			setError('New password must be different from current password');
			return false;
		}
		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setSuccess('');

		if (!validateForm()) {
			return;
		}

		setLoading(true);
		try {
			const { error } = await changePassword(newPassword);

			if (error) {
				setError(error.message);
			} else {
				setSuccess('Password changed successfully!');
				// Clear form after successful change
				setCurrentPassword('');
				setNewPassword('');
				setConfirmPassword('');
				setOriginalCurrentPassword('');
				setOriginalNewPassword('');
				setOriginalConfirmPassword('');
				onSuccess?.();
			}
		} catch (err) {
			setError('An unexpected error occurred. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="p-8">
			{/* Header */}
			<div className="mb-8">
				<h2 className="text-xl font-semibold text-gray-900 mb-3">
					Change Password
				</h2>
				<p className="text-sm text-gray-600">
					Update your account password to keep your account secure.
				</p>
			</div>

			{/* Message Display */}
			{error && (
				<div className="mb-6 p-4 rounded-sm flex items-center space-x-2 bg-red-50 border border-red-200 text-red-800">
					<ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
					<span>{error}</span>
				</div>
			)}

			{success && (
				<div className="mb-6 p-4 rounded-sm flex items-center space-x-2 bg-green-50 border border-green-200 text-green-800">
					<CheckIcon className="h-5 w-5 text-green-600" />
					<span>{success}</span>
				</div>
			)}

			{/* Form */}
			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Current Password Field */}
				<div>
					<label
						htmlFor="currentPassword"
						className="block text-sm font-medium text-gray-700 mb-3"
					>
						Current Password
					</label>
					<div className="relative">
						<input
							id="currentPassword"
							type={showCurrentPassword ? 'text' : 'password'}
							value={currentPassword}
							onChange={(e) => setCurrentPassword(e.target.value)}
							className="block w-full px-3 py-3.5 pr-10 border border-gray-300 rounded-sm shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
							placeholder="Enter your current password"
							disabled={loading}
						/>
						<button
							type="button"
							onClick={() => setShowCurrentPassword(!showCurrentPassword)}
							className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
							disabled={loading}
						>
							{showCurrentPassword ? (
								<EyeSlashIcon className="h-5 w-5" />
							) : (
								<EyeIcon className="h-5 w-5" />
							)}
						</button>
					</div>
				</div>

				{/* New Password Field */}
				<div>
					<label
						htmlFor="newPassword"
						className="block text-sm font-medium text-gray-700 mb-3"
					>
						New Password
					</label>
					<div className="relative">
						<input
							id="newPassword"
							type={showNewPassword ? 'text' : 'password'}
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							className="block w-full px-3 py-3.5 pr-10 border border-gray-300 rounded-sm shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
							placeholder="Enter your new password"
							disabled={loading}
						/>
						<button
							type="button"
							onClick={() => setShowNewPassword(!showNewPassword)}
							className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
							disabled={loading}
						>
							{showNewPassword ? (
								<EyeSlashIcon className="h-5 w-5" />
							) : (
								<EyeIcon className="h-5 w-5" />
							)}
						</button>
					</div>
				</div>

				{/* Confirm New Password Field */}
				<div>
					<label
						htmlFor="confirmPassword"
						className="block text-sm font-medium text-gray-700 mb-3"
					>
						Confirm New Password
					</label>
					<div className="relative">
						<input
							id="confirmPassword"
							type={showConfirmPassword ? 'text' : 'password'}
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							className="block w-full px-3 py-3.5 pr-10 border border-gray-300 rounded-sm shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
							placeholder="Confirm your new password"
							disabled={loading}
						/>
						<button
							type="button"
							onClick={() => setShowConfirmPassword(!showConfirmPassword)}
							className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
							disabled={loading}
						>
							{showConfirmPassword ? (
								<EyeSlashIcon className="h-5 w-5" />
							) : (
								<EyeIcon className="h-5 w-5" />
							)}
						</button>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="mt-8 flex gap-4">
					<button
						type="button"
						onClick={handleCancel}
						disabled={loading || !hasChanges()}
						className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={loading || !hasChanges()}
						className="flex-1 px-6 py-3 bg-primary-600 text-white text-sm font-medium rounded-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
					>
						{loading ? (
							<div className="flex items-center justify-center">
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
								Updating...
							</div>
						) : (
							'Update Password'
						)}
					</button>
				</div>
			</form>
		</div>
	);
}
