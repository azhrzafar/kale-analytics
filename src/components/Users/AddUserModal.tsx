'use client';

import React, { useState } from 'react';
import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface AddUserModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (email: string, password: string) => Promise<void>;
	loading: boolean;
}

export default function AddUserModal({
	isOpen,
	onClose,
	onSubmit,
	loading,
}: AddUserModalProps) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState('');

	const validateForm = () => {
		if (!email.trim()) {
			setError('Email is required');
			return false;
		}
		if (!email.includes('@')) {
			setError('Please enter a valid email address');
			return false;
		}
		if (!password.trim()) {
			setError('Password is required');
			return false;
		}
		if (password.length < 6) {
			setError('Password must be at least 6 characters');
			return false;
		}
		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		if (!validateForm()) {
			return;
		}

		try {
			await onSubmit(email, password);
			// Reset form on success
			setEmail('');
			setPassword('');
			setShowPassword(false);
		} catch (err: any) {
			setError(err.message || 'Failed to create user');
		}
	};

	const handleClose = () => {
		if (!loading) {
			setEmail('');
			setPassword('');
			setShowPassword(false);
			setError('');
			onClose();
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 overflow-y-auto" style={{ zIndex: 99999 }}>
			<div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
				{/* Background overlay */}
				<div
					className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
					onClick={handleClose}
				></div>

				{/* Modal panel */}
				<div className="inline-block align-bottom bg-white rounded-md text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
					<div className="bg-white px-6 py-6">
						{/* Header */}
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-lg font-semibold text-gray-900">
								Add New User
							</h3>
							<button
								onClick={handleClose}
								disabled={loading}
								className="text-gray-400 hover:text-gray-600 transition-colors duration-200 disabled:opacity-50"
							>
								<XMarkIcon className="h-6 w-6" />
							</button>
						</div>

						{/* Form */}
						<form onSubmit={handleSubmit} className="space-y-4">
							{/* Email Field */}
							<div>
								<label
									htmlFor="modal-email"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Email Address
								</label>
								<input
									id="modal-email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="text-gray-800 w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
									placeholder="Enter email address"
									disabled={loading}
								/>
							</div>

							{/* Password Field */}
							<div>
								<label
									htmlFor="modal-password"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Password
								</label>
								<div className="relative">
									<input
										id="modal-password"
										type={showPassword ? 'text' : 'password'}
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="text-gray-800 w-full px-3 py-2 pr-10 border border-gray-300 rounded-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
										placeholder="Enter password"
										disabled={loading}
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
										disabled={loading}
									>
										{showPassword ? (
											<EyeSlashIcon className="h-4 w-4" />
										) : (
											<EyeIcon className="h-4 w-4" />
										)}
									</button>
								</div>
								<p className="text-xs text-gray-500 mt-1">
									Must be at least 6 characters
								</p>
							</div>

							{/* Error Message */}
							{error && (
								<div className="bg-danger-50 border border-danger-200 rounded-sm p-3">
									<p className="text-sm text-danger-600">{error}</p>
								</div>
							)}

							{/* Info Message */}
							<div className="bg-primary-50 border border-primary-200 rounded-sm p-3">
								<p className="text-sm text-primary-600">
									After creating the user, you'll need to manually share the
									credentials with them for login.
								</p>
							</div>

							{/* Action Buttons */}
							<div className="flex space-x-3 pt-4">
								<button
									type="button"
									onClick={handleClose}
									disabled={loading}
									className="btn btn-secondary flex-1"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={loading}
									className="btn btn-primary flex-1"
								>
									{loading ? (
										<div className="flex items-center justify-center">
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
											Creating...
										</div>
									) : (
										'Create User'
									)}
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}
