import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
	throw new Error('Missing Supabase environment variables');
}

// Optimized Supabase client configuration for better RPC performance
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
	db: {
		schema: 'public',
	},
	auth: {
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
	},
	global: {
		headers: {
			'X-Client-Info': 'kale-analytics-dashboard',
		},
	},
	realtime: {
		params: {
			eventsPerSecond: 10,
		},
	},
});

// Connection pooling configuration for server-side usage
export const createOptimizedSupabaseClient = () => {
	return createClient(supabaseUrl, supabaseServiceKey, {
		db: {
			schema: 'public',
		},
		auth: {
			autoRefreshToken: false,
			persistSession: false,
			detectSessionInUrl: false,
		},
		global: {
			headers: {
				'X-Client-Info': 'kale-analytics-dashboard-server',
				Connection: 'keep-alive',
			},
		},
	});
};
