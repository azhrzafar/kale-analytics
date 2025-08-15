import { useState, useEffect, useCallback, useRef } from 'react';
import {
	APIService,
	KPIMetric,
	AnalyticsFilters,
} from '../services/apiService';

interface UseAnalyticsAPIState {
	kpiMetrics: KPIMetric[];
	platformData: any[];
	timeSeriesData: any[];
	topClients: any[];
	alerts: any[];
	loading: boolean;
	error: string | null;
	lastUpdated: Date | null;
}

interface UseAnalyticsAPIReturn extends UseAnalyticsAPIState {
	refreshData: () => Promise<void>;
	refreshKPIMetrics: () => Promise<void>;
	refreshPlatformData: () => Promise<void>;
	refreshTimeSeriesData: () => Promise<void>;
	refreshTopClients: () => Promise<void>;
	refreshAlerts: () => Promise<void>;
}

export function useAnalyticsAPI(
	filters: AnalyticsFilters = {}
): UseAnalyticsAPIReturn {
	const [state, setState] = useState<UseAnalyticsAPIState>({
		kpiMetrics: [],
		platformData: [],
		timeSeriesData: [],
		topClients: [],
		alerts: [],
		loading: true,
		error: null,
		lastUpdated: null,
	});

	const abortControllerRef = useRef<AbortController | null>(null);
	const filtersRef = useRef<AnalyticsFilters>(filters);

	// Update filters ref when filters change
	useEffect(() => {
		filtersRef.current = filters;
	}, [filters]);

	// Fetch all analytics data
	const fetchAllData = useCallback(async (signal?: AbortSignal) => {
		try {
			setState((prev) => ({ ...prev, loading: true, error: null }));

			const result = await APIService.getAllAnalyticsData(filtersRef.current);

			// Check if the request was aborted
			if (signal?.aborted) {
				return;
			}

			setState((prev) => ({
				...prev,
				kpiMetrics: result.kpiMetrics || [],
				platformData: result.platformData || [],
				timeSeriesData: result.timeSeriesData || [],
				topClients: result.topClients || [],
				alerts: result.alerts || [],
				loading: false,
				error: null,
				lastUpdated: new Date(),
			}));
		} catch (error) {
			if (signal?.aborted) {
				return;
			}

			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to fetch analytics data';
			setState((prev) => ({
				...prev,
				loading: false,
				error: errorMessage,
			}));
		}
	}, []);

	// Individual refresh functions
	const refreshKPIMetrics = useCallback(async () => {
		try {
			const result = await APIService.getKPIMetrics(filtersRef.current);
			setState((prev) => ({
				...prev,
				kpiMetrics: result || [],
				error: null,
				lastUpdated: new Date(),
			}));
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to refresh KPI metrics';
			setState((prev) => ({ ...prev, error: errorMessage }));
		}
	}, []);

	const refreshPlatformData = useCallback(async () => {
		try {
			const result = await APIService.getPlatformData(filtersRef.current);
			setState((prev) => ({
				...prev,
				platformData: result || [],
				error: null,
				lastUpdated: new Date(),
			}));
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to refresh platform data';
			setState((prev) => ({ ...prev, error: errorMessage }));
		}
	}, []);

	const refreshTimeSeriesData = useCallback(async () => {
		try {
			const result = await APIService.getTimeSeriesData(filtersRef.current);
			setState((prev) => ({
				...prev,
				timeSeriesData: result || [],
				error: null,
				lastUpdated: new Date(),
			}));
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to refresh time series data';
			setState((prev) => ({ ...prev, error: errorMessage }));
		}
	}, []);

	const refreshTopClients = useCallback(async () => {
		try {
			const result = await APIService.getTopClients(10);
			setState((prev) => ({
				...prev,
				topClients: result || [],
				error: null,
				lastUpdated: new Date(),
			}));
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to refresh top clients';
			setState((prev) => ({ ...prev, error: errorMessage }));
		}
	}, []);

	const refreshAlerts = useCallback(async () => {
		try {
			const result = await APIService.getAlerts(filtersRef.current);
			setState((prev) => ({
				...prev,
				alerts: result || [],
				error: null,
				lastUpdated: new Date(),
			}));
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to refresh alerts';
			setState((prev) => ({ ...prev, error: errorMessage }));
		}
	}, []);

	// Refresh all data
	const refreshData = useCallback(async () => {
		// Cancel any ongoing request
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}

		// Create new abort controller
		abortControllerRef.current = new AbortController();
		await fetchAllData(abortControllerRef.current.signal);
	}, [fetchAllData]);

	// Initial data fetch
	useEffect(() => {
		refreshData();

		// Cleanup function to abort ongoing requests
		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, [refreshData]);

	// Auto-refresh every 5 minutes
	useEffect(() => {
		const interval = setInterval(() => {
			refreshData();
		}, 5 * 60 * 1000); // 5 minutes

		return () => clearInterval(interval);
	}, [refreshData]);

	return {
		...state,
		refreshData,
		refreshKPIMetrics,
		refreshPlatformData,
		refreshTimeSeriesData,
		refreshTopClients,
		refreshAlerts,
	};
}

// Hook for individual data types
export function useKPIMetricsAPI(filters: AnalyticsFilters = {}) {
	const [data, setData] = useState<KPIMetric[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchData = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const result = await APIService.getKPIMetrics(filters);
			setData(result || []);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'Failed to fetch KPI metrics'
			);
		} finally {
			setLoading(false);
		}
	}, [filters]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return { data, loading, error, refresh: fetchData };
}

export function usePlatformDataAPI(filters: AnalyticsFilters = {}) {
	const [data, setData] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchData = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const result = await APIService.getPlatformData(filters);
			setData(result || []);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'Failed to fetch platform data'
			);
		} finally {
			setLoading(false);
		}
	}, [filters]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return { data, loading, error, refresh: fetchData };
}

export function useTimeSeriesDataAPI(filters: AnalyticsFilters = {}) {
	const [data, setData] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchData = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const result = await APIService.getTimeSeriesData(filters);
			setData(result || []);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'Failed to fetch time series data'
			);
		} finally {
			setLoading(false);
		}
	}, [filters]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return { data, loading, error, refresh: fetchData };
}

export function useTopClientsAPI(limit: number = 10) {
	const [data, setData] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchData = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const result = await APIService.getTopClients(limit);
			setData(result || []);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'Failed to fetch top clients'
			);
		} finally {
			setLoading(false);
		}
	}, [limit]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return { data, loading, error, refresh: fetchData };
}

export function useAlertsAPI(filters: AnalyticsFilters = {}) {
	const [data, setData] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchData = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const result = await APIService.getAlerts(filters);
			setData(result || []);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
		} finally {
			setLoading(false);
		}
	}, [filters]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return { data, loading, error, refresh: fetchData };
}
