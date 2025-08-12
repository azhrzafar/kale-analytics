import { useUserProfile } from '@/lib/appContext';
import { EnvelopeIcon } from '@heroicons/react/16/solid';
import { format } from 'date-fns';
import {
	CalendarIcon,
	CheckCircleIcon,
	ClockIcon,
	UserIcon,
	XCircleIcon,
} from 'lucide-react';
import React from 'react';

const Profile = () => {
	const { userProfile, userLoading } = useUserProfile();

	return (
		<div>
			<></>
			{userLoading ? (
				<div className="flex items-center justify-center py-12">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
					<span className="ml-3 text-gray-600">Loading profile...</span>
				</div>
			) : userProfile ? (
				<div className="space-y-8 p-8">
					<div className="mb-8">
						<h2 className="text-xl font-semibold text-gray-900 mb-3">
							Profile
						</h2>
					</div>

					{/* Profile Details Grid */}
					<div className="grid grid-cols-1 gap-6">
						{/* Account Information Card */}
						<div className="bg-blue-50 border border-primary-200 rounded-sm p-6">
							<div className="flex items-center space-x-3 mb-4">
								<div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
									<UserIcon className="w-5 h-5 text-blue-600" />
								</div>
								<h4 className="text-lg font-semibold text-blue-900">
									Account Information
								</h4>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
								<div>
									<label className="block text-sm font-medium text-gray-500 mb-1">
										Email Address
									</label>
									<div className="flex items-center space-x-2">
										<EnvelopeIcon className="w-4 h-4 text-gray-400" />
										<span className="text-sm text-gray-900 font-medium">
											{userProfile.email}
										</span>
									</div>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-500  mb-1">
										Account Status
									</label>
									<div className="flex items-center space-x-2">
										{userProfile.enabled ? (
											<CheckCircleIcon className="w-4 h-4 text-green-500" />
										) : (
											<XCircleIcon className="w-4 h-4 text-red-500" />
										)}
										<span
											className={`text-sm font-medium ${
												userProfile.enabled ? 'text-green-700' : 'text-red-700'
											}`}
										>
											{userProfile.enabled ? 'Active' : 'Disabled'}
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Account Activity Card */}
						<div className="bg-gray-50 rounded-sm p-6">
							<div className="flex items-center space-x-3 mb-4">
								<div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
									<CalendarIcon className="w-5 h-5 text-green-600" />
								</div>
								<h4 className="text-lg font-semibold text-gray-900">
									Account Activity
								</h4>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
								<div>
									<label className="block text-sm font-medium text-gray-500 mb-1">
										Member Since
									</label>
									<div className="flex items-center space-x-2">
										<CalendarIcon className="w-4 h-4 text-gray-400" />
										<span className="text-sm text-gray-900 font-medium">
											{format(new Date(userProfile.created_at), 'MM/dd/yyyy')}
										</span>
									</div>
								</div>
								{userProfile.last_sign_in_at && (
									<div>
										<label className="block text-sm font-medium text-gray-500 mb-1">
											Last Sign In
										</label>
										<div className="flex items-center space-x-2">
											<ClockIcon className="w-4 h-4 text-gray-400" />
											<span className="text-sm text-gray-900 font-medium">
												{format(
													new Date(userProfile.last_sign_in_at),
													'MM/dd/yyyy hh:mm a'
												)}
											</span>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			) : (
				<div className="text-center py-12">
					<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<UserIcon className="w-8 h-8 text-gray-400" />
					</div>
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						No Profile Information
					</h3>
					<p className="text-gray-500 mb-6">
						Unable to load your profile information at this time.
					</p>
					<button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors">
						Try Again
					</button>
				</div>
			)}
		</div>
	);
};

export default Profile;
