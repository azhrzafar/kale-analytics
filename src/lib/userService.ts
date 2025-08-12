import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
	throw new Error('Missing Supabase service role key');
}

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
	},
});

export interface UserProfile {
	id: string;
	email: string;
	created_at: string;
	last_sign_in_at: string | null;
	enabled: boolean;
}

export interface CreateUserData {
	email: string;
	password: string;
}

export interface UpdateUserData {
	email?: string;
	password?: string;
	enabled?: boolean;
}

class UserService {
	async getAllUsers(): Promise<UserProfile[]> {
		try {
			const { data, error } = await supabaseAdmin.auth.admin.listUsers();

			if (error) {
				throw error;
			}

			return data.users.map((user: any) => ({
				id: user.id,
				email: user.email || '',
				created_at: user.created_at,
				last_sign_in_at: user.last_sign_in_at || null,
				enabled: user.user_metadata?.enabled !== false, // Default to true if not set
			}));
		} catch (error) {
			console.error('Error fetching users:', error);
			throw error;
		}
	}

	async createUser(userData: CreateUserData): Promise<UserProfile> {
		try {
			const { data, error } = await supabaseAdmin.auth.admin.createUser({
				email: userData.email,
				password: userData.password,
				email_confirm: true, // Auto-confirm email
				user_metadata: { enabled: true },
			});

			if (error) {
				throw error;
			}

			if (!data.user) {
				throw new Error('Failed to create user');
			}

			return {
				id: data.user.id,
				email: data.user.email || '',
				created_at: data.user.created_at,
				last_sign_in_at: data.user.last_sign_in_at || null,
				enabled: data.user.user_metadata?.enabled !== false,
			};
		} catch (error) {
			console.error('Error creating user:', error);
			throw error;
		}
	}

	async updateUser(
		userId: string,
		userData: UpdateUserData
	): Promise<UserProfile> {
		try {
			const updateData: any = {};
			if (userData.email) updateData.email = userData.email;
			if (userData.password) updateData.password = userData.password;
			if (userData.enabled !== undefined) {
				updateData.user_metadata = { enabled: userData.enabled };
			}

			const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
				userId,
				updateData
			);

			if (error) {
				throw error;
			}

			if (!data.user) {
				throw new Error('Failed to update user');
			}

			return {
				id: data.user.id,
				email: data.user.email || '',
				created_at: data.user.created_at,
				last_sign_in_at: data.user.last_sign_in_at || null,
				enabled: data.user.user_metadata?.enabled !== false,
			};
		} catch (error) {
			console.error('Error updating user:', error);
			throw error;
		}
	}

	async deleteUser(userId: string): Promise<void> {
		try {
			const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

			if (error) {
				throw error;
			}
		} catch (error) {
			console.error('Error deleting user:', error);
			throw error;
		}
	}

	async banUser(userId: string): Promise<UserProfile> {
		try {
			const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
				userId,
				{
					user_metadata: { enabled: false },
				}
			);

			if (error) {
				throw error;
			}

			if (!data.user) {
				throw new Error('Failed to ban user');
			}

			return {
				id: data.user.id,
				email: data.user.email || '',
				created_at: data.user.created_at,
				last_sign_in_at: data.user.last_sign_in_at || null,
				enabled: data.user.user_metadata?.enabled !== false,
			};
		} catch (error) {
			console.error('Error banning user:', error);
			throw error;
		}
	}

	async unbanUser(userId: string): Promise<UserProfile> {
		try {
			const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
				userId,
				{
					user_metadata: { enabled: true },
				}
			);

			if (error) {
				throw error;
			}

			if (!data.user) {
				throw new Error('Failed to unban user');
			}

			return {
				id: data.user.id,
				email: data.user.email || '',
				created_at: data.user.created_at,
				last_sign_in_at: data.user.last_sign_in_at || null,
				enabled: data.user.user_metadata?.enabled !== false,
			};
		} catch (error) {
			console.error('Error unbanning user:', error);
			throw error;
		}
	}
}

export const userService = new UserService();
