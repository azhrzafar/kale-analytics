import axios from 'axios';
import { Client } from '../hooks/useClients';

// API base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Create axios instance with default config
const apiClient = axios.create({
	baseURL: API_BASE_URL,
	timeout: 30000, // 30 seconds
	headers: {
		'Content-Type': 'application/json',
	},
});

// Request interceptor for logging and error handling
apiClient.interceptors.request.use(
	(config) => {
		console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
		return config;
	},
	(error) => {
		console.error('API Request Error:', error);
		return Promise.reject(error);
	}
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
	(response) => {
		console.log(`API Response: ${response.status} ${response.config.url}`);
		return response;
	},
	(error) => {
		console.error('API Response Error:', error);
		if (error.response) {
			// Server responded with error status
			console.error('Error Status:', error.response.status);
			console.error('Error Data:', error.response.data);
		} else if (error.request) {
			// Request was made but no response received
			console.error('No response received');
		} else {
			// Something else happened
			console.error('Request setup error:', error.message);
		}
		return Promise.reject(error);
	}
);

// Types for API responses
export interface KPIMetric {
	id: string;
	label: string;
	value: number;
	change?: number;
	changeType?: 'positive' | 'negative' | 'neutral';
	subtitle?: string;
	icon?: any;
	format?: 'percentage' | 'number' | 'ratio';
	trend?: 'up' | 'down' | 'stable';
}

export interface APIResponse<T> {
	success: boolean;
	data: T;
	timestamp: string;
	error?: string;
}

export interface AnalyticsFilters {
	startDate?: string;
	endDate?: string;
	clientId?: string;
	platform?: string;
	preset?: string;
}

// API Service class
export class APIService {
	// Get KPI metrics
	static async getKPIMetrics(
		filters: AnalyticsFilters = {}
	): Promise<KPIMetric[]> {
		try {
			const params = new URLSearchParams();

			if (filters.startDate) params.append('startDate', filters.startDate);
			if (filters.endDate) params.append('endDate', filters.endDate);
			if (filters.clientId) params.append('clientId', filters.clientId);
			if (filters.platform) params.append('platform', filters.platform);

			const response = await apiClient.get<APIResponse<KPIMetric[]>>(
				`/api/analytics/kpi?${params.toString()}`
			);

			if (response.data.success) {
				return response.data.data;
			} else {
				throw new Error(response.data.error || 'Failed to fetch KPI metrics');
			}
		} catch (error) {
			console.error('Error fetching KPI metrics:', error);
			throw error;
		}
	}

	// Get platform data
	static async getPlatformData(filters: AnalyticsFilters = {}): Promise<any[]> {
		try {
			const params = new URLSearchParams();

			if (filters.startDate) params.append('startDate', filters.startDate);
			if (filters.endDate) params.append('endDate', filters.endDate);
			if (filters.clientId) params.append('clientId', filters.clientId);
			if (filters.platform) params.append('platform', filters.platform);

			const response = await apiClient.get<APIResponse<any[]>>(
				`/api/analytics/platform-performance?${params.toString()}`
			);

			if (response.data.success) {
				return response.data.data;
			} else {
				throw new Error(response.data.error || 'Failed to fetch platform data');
			}
		} catch (error) {
			console.error('Error fetching platform data:', error);
			throw error;
		}
	}

	// Get time series data
	static async getTimeSeriesData(
		filters: AnalyticsFilters = {}
	): Promise<any[]> {
		try {
			const params = new URLSearchParams();

			if (filters.startDate) params.append('startDate', filters.startDate);
			if (filters.endDate) params.append('endDate', filters.endDate);
			if (filters.clientId) params.append('clientId', filters.clientId);
			if (filters.platform) params.append('platform', filters.platform);

			const response = await apiClient.get<APIResponse<any[]>>(
				`/api/analytics/timeseries?${params.toString()}`
			);

			if (response.data.success) {
				return response.data.data;
			} else {
				throw new Error(
					response.data.error || 'Failed to fetch time series data'
				);
			}
		} catch (error) {
			console.error('Error fetching time series data:', error);
			throw error;
		}
	}

	// Get top clients
	static async getTopClients(limit: number = 10): Promise<any[]> {
		try {
			const params = new URLSearchParams();
			params.append('limit', limit.toString());

			const response = await apiClient.get<APIResponse<any[]>>(
				`/api/analytics/clients?${params.toString()}`
			);

			if (response.data.success) {
				return response.data.data;
			} else {
				throw new Error(response.data.error || 'Failed to fetch top clients');
			}
		} catch (error) {
			console.error('Error fetching top clients:', error);
			throw error;
		}
	}

	// Get alerts
	static async getAlerts(filters: AnalyticsFilters = {}): Promise<any[]> {
		try {
			const params = new URLSearchParams();

			if (filters.startDate) params.append('startDate', filters.startDate);
			if (filters.endDate) params.append('endDate', filters.endDate);
			if (filters.clientId) params.append('clientId', filters.clientId);
			if (filters.platform) params.append('platform', filters.platform);

			const response = await apiClient.get<APIResponse<any[]>>(
				`/api/analytics/alerts?${params.toString()}`
			);

			if (response.data.success) {
				return response.data.data;
			} else {
				throw new Error(response.data.error || 'Failed to fetch alerts');
			}
		} catch (error) {
			console.error('Error fetching alerts:', error);
			throw error;
		}
	}

	// Get all analytics data in one call
	static async getAllAnalyticsData(filters: AnalyticsFilters = {}): Promise<{
		kpiMetrics: KPIMetric[];
		platformData: any[];
		timeSeriesData: any[];
		topClients: any[];
		alerts: any[];
	}> {
		try {
			const params = new URLSearchParams();

			if (filters.startDate) params.append('startDate', filters.startDate);
			if (filters.endDate) params.append('endDate', filters.endDate);
			if (filters.clientId) params.append('clientId', filters.clientId);
			if (filters.platform) params.append('platform', filters.platform);

			const response = await apiClient.get<
				APIResponse<{
					kpiMetrics: KPIMetric[];
					platformData: any[];
					timeSeriesData: any[];
					topClients: any[];
					alerts: any[];
				}>
			>(`/api/analytics/all?${params.toString()}`);

			if (response.data.success) {
				return response.data.data;
			} else {
				throw new Error(
					response.data.error || 'Failed to fetch analytics data'
				);
			}
		} catch (error) {
			console.error('Error fetching all analytics data:', error);
			throw error;
		}
	}

	// Get all clients from Supabase
	static async getAllClients(): Promise<Array<Client>> {
		try {
			const { supabase } = await import('@/lib/supabase');

			const { data, error } = await supabase
				.from('Clients')
				.select('*')
				.order('id');

			if (error) {
				console.error('Error fetching clients:', error);
				throw new Error(error.message);
			}

			return data || [];
		} catch (error) {
			console.error('Error fetching all clients:', error);
			throw error;
		}
	}

	// Health check endpoint
	static async healthCheck(): Promise<boolean> {
		try {
			const response = await apiClient.get('/api/health');
			return response.status === 200;
		} catch (error) {
			console.error('Health check failed:', error);
			return false;
		}
	}
}

// Export the apiClient for direct use if needed
export { apiClient };
