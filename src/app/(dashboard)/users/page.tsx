'use client';

import React, { useState } from 'react';
import UserList from '@/components/Users/UserList';
import AddUserModal from '@/components/Users/AddUserModal';
import { userService } from '@/lib/userService';

export default function UsersPage() {
	const [showAddModal, setShowAddModal] = useState(false);
	const [actionLoading, setActionLoading] = useState<string | null>(null);

	const handleAddUser = async (email: string, password: string) => {
		try {
			setActionLoading('add');
			await userService.createUser({ email, password });
			setShowAddModal(false);
			// Trigger a page refresh or update the user list
			window.location.reload();
		} catch (err: any) {
			throw err;
		} finally {
			setActionLoading(null);
		}
	};

	return (
		<>
			<div className="animate-fade-in min-h-[calc(70vh)]">
				<UserList
					showAddModal={showAddModal}
					setShowAddModal={setShowAddModal}
					actionLoading={actionLoading}
				/>
			</div>

			{/* Render modal outside main content area */}
			<AddUserModal
				isOpen={showAddModal}
				onClose={() => setShowAddModal(false)}
				onSubmit={handleAddUser}
				loading={actionLoading === 'add'}
			/>
		</>
	);
}
