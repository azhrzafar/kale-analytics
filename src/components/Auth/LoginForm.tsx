'use client';

import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface LoginFormProps {
	onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const { signIn } = useAuth();
	const router = useRouter();

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

		setLoading(true);
		try {
			const { error } = await signIn(email, password);

			if (error) {
				setError(error.message);
			} else {
				// Redirect to dashboard on successful login
				router.push('/');
			}
		} catch (err) {
			setError('An unexpected error occurred. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="w-full max-w-md mx-auto">
			<div className="bg-white rounded-md shadow-xl border border-gray-100 p-8">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="flex justify-center mb-4">
						<img
							src="/logo.png"
							alt="Kale Logo"
							className="h-12 w-auto object-contain"
						/>
					</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						Welcome back
					</h2>
					<p className="text-gray-600">
						Sign in to your Kale Analytics Dashboard
					</p>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Email Field */}
					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Email address
						</label>
						<input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="text-gray-800 w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
							placeholder="Enter your email"
							disabled={loading}
						/>
					</div>

					{/* Password Field */}
					<div>
						<label
							htmlFor="password"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Password
						</label>
						<div className="relative">
							<input
								id="password"
								type={showPassword ? 'text' : 'password'}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="text-gray-800 w-full px-4 py-3 pr-12 border border-gray-300 rounded-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
								placeholder="Enter your password"
								disabled={loading}
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
								disabled={loading}
							>
								{showPassword ? (
									<EyeSlashIcon className="h-5 w-5" />
								) : (
									<EyeIcon className="h-5 w-5" />
								)}
							</button>
						</div>
					</div>

					{/* Error Message */}
					{error && (
						<div className="bg-danger-50 border border-danger-200 rounded-sm p-4">
							<p className="text-sm text-danger-600">{error}</p>
						</div>
					)}

					{/* Submit Button */}
					<button
						type="submit"
						disabled={loading}
						className="btn btn-primary w-full"
					>
						{loading ? (
							<div className="flex items-center justify-center">
								<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
								Signing in...
							</div>
						) : (
							'Sign in'
						)}
					</button>
				</form>
			</div>
		</div>
	);
}
