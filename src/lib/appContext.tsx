'use client';

import React, {
	createContext,
	useContext,
	useReducer,
	useEffect,
	ReactNode,
} from 'react';
import {
	AppContextValue,
	AppContextState,
	AppUserProfile,
	AppSettings,
	AppDateFilter,
	ExchangeRateData,
	DateRangePreset,
	DateRange,
} from './types';
import { supabase } from './supabase';
import { startOfMonth } from 'date-fns';

// Default date filter (last 30 days)
const getDefaultDateFilter = (): AppDateFilter => {
	// Try to load from localStorage first
	if (typeof window !== 'undefined') {
		const savedFilter = localStorage.getItem('kale-date-filter');
		if (savedFilter) {
			try {
				const parsed = JSON.parse(savedFilter);
				// Convert string dates back to Date objects
				return {
					preset: parsed.preset,
					range: {
						startDate: parsed.range.startDate
							? new Date(parsed.range.startDate)
							: null,
						endDate: parsed.range.endDate
							? new Date(parsed.range.endDate)
							: null,
					},
				};
			} catch (error) {
				console.warn('Failed to parse saved date filter:', error);
			}
		}
	}

	// Fallback to default (mtd)
	const endDate = new Date();
	const startDate = startOfMonth(new Date());

	return {
		preset: 'mtd',
		range: {
			startDate,
			endDate,
		},
	};
};

// Initial state
const initialState: AppContextState = {
	userProfile: null,
	userLoading: false,
	userError: null,
	settings: null,
	settingsLoading: false,
	settingsError: null,
	exchangeRate: null,
	exchangeRateLoading: false,
	exchangeRateError: null,
	dateFilter: getDefaultDateFilter(),
	isLoading: false,
};

// Action types
type AppAction =
	| { type: 'SET_USER_LOADING'; payload: boolean }
	| { type: 'SET_USER_PROFILE'; payload: AppUserProfile | null }
	| { type: 'SET_USER_ERROR'; payload: string | null }
	| { type: 'SET_SETTINGS_LOADING'; payload: boolean }
	| { type: 'SET_SETTINGS'; payload: AppSettings | null }
	| { type: 'SET_SETTINGS_ERROR'; payload: string | null }
	| { type: 'SET_EXCHANGE_RATE_LOADING'; payload: boolean }
	| { type: 'SET_EXCHANGE_RATE'; payload: ExchangeRateData | null }
	| { type: 'SET_EXCHANGE_RATE_ERROR'; payload: string | null }
	| { type: 'SET_DATE_FILTER'; payload: AppDateFilter }
	| { type: 'SET_LOADING'; payload: boolean };

// Reducer
function appReducer(
	state: AppContextState,
	action: AppAction
): AppContextState {
	switch (action.type) {
		case 'SET_USER_LOADING':
			return { ...state, userLoading: action.payload };
		case 'SET_USER_PROFILE':
			return { ...state, userProfile: action.payload };
		case 'SET_USER_ERROR':
			return { ...state, userError: action.payload };
		case 'SET_SETTINGS_LOADING':
			return { ...state, settingsLoading: action.payload };
		case 'SET_SETTINGS':
			return { ...state, settings: action.payload };
		case 'SET_SETTINGS_ERROR':
			return { ...state, settingsError: action.payload };
		case 'SET_EXCHANGE_RATE_LOADING':
			return { ...state, exchangeRateLoading: action.payload };
		case 'SET_EXCHANGE_RATE':
			return { ...state, exchangeRate: action.payload };
		case 'SET_EXCHANGE_RATE_ERROR':
			return { ...state, exchangeRateError: action.payload };
		case 'SET_DATE_FILTER':
			return { ...state, dateFilter: action.payload };
		case 'SET_LOADING':
			return { ...state, isLoading: action.payload };
		default:
			return state;
	}
}

// Create context
const AppContext = createContext<AppContextValue | undefined>(undefined);

// Provider component
interface AppProviderProps {
	children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
	const [state, dispatch] = useReducer(appReducer, initialState);

	// Helper function to convert undefined to null for optional string properties
	const convertUndefinedToNull = (value: string | undefined): string | null => {
		return value ?? null;
	};

	// Load user profile
	const loadUserProfile = async () => {
		try {
			dispatch({ type: 'SET_USER_LOADING', payload: true });
			dispatch({ type: 'SET_USER_ERROR', payload: null });

			// Get current user from Supabase auth
			const {
				data: { user },
				error,
			} = await supabase.auth.getUser();

			if (error) {
				throw error;
			}

			if (user) {
				const profile: AppUserProfile = {
					id: user.id,
					email: user.email || '',
					firstName: convertUndefinedToNull(user.user_metadata?.firstName),
					lastName: convertUndefinedToNull(user.user_metadata?.lastName),
					avatar: convertUndefinedToNull(user.user_metadata?.avatar),
					created_at: user.created_at,
					last_sign_in_at: user.last_sign_in_at ?? null,
					enabled: user.user_metadata?.enabled !== false,
				};
				dispatch({ type: 'SET_USER_PROFILE', payload: profile });
			} else {
				dispatch({ type: 'SET_USER_PROFILE', payload: null });
			}
		} catch (error) {
			console.error('Error loading user profile:', error);
			dispatch({
				type: 'SET_USER_ERROR',
				payload: 'Failed to load user profile',
			});
		} finally {
			dispatch({ type: 'SET_USER_LOADING', payload: false });
		}
	};

	// Update user profile
	const updateUserProfile = async (profile: Partial<AppUserProfile>) => {
		try {
			dispatch({ type: 'SET_USER_LOADING', payload: true });
			dispatch({ type: 'SET_USER_ERROR', payload: null });

			// Update user metadata in Supabase
			const {
				data: { user },
				error,
			} = await supabase.auth.updateUser({
				data: {
					firstName: profile.firstName,
					lastName: profile.lastName,
					avatar: profile.avatar,
				},
			});

			if (error) {
				throw error;
			}

			if (user) {
				const updatedProfile: AppUserProfile = {
					id: user.id,
					email: user.email || '',
					firstName: convertUndefinedToNull(user.user_metadata?.firstName),
					lastName: convertUndefinedToNull(user.user_metadata?.lastName),
					avatar: convertUndefinedToNull(user.user_metadata?.avatar),
					created_at: user.created_at,
					last_sign_in_at: user.last_sign_in_at ?? null,
					enabled: user.user_metadata?.enabled !== false,
				};
				dispatch({ type: 'SET_USER_PROFILE', payload: updatedProfile });
			}
		} catch (error) {
			console.error('Error updating user profile:', error);
			dispatch({
				type: 'SET_USER_ERROR',
				payload: 'Failed to update user profile',
			});
		} finally {
			dispatch({ type: 'SET_USER_LOADING', payload: false });
		}
	};

	// Load settings
	const loadSettings = async () => {
		try {
			dispatch({ type: 'SET_SETTINGS_LOADING', payload: true });
			dispatch({ type: 'SET_SETTINGS_ERROR', payload: null });

			const response = await fetch('/api/settings');
			const data = await response.json();

			if (response.ok && data.settings) {
				const settings: AppSettings = {
					preferredCurrency: data.settings.preferred_currency || 'CAD',
					expectedRevenue: data.settings.expected_revenue || 0,
					expectedRevenueCurrency:
						data.settings.expected_revenue_currency || 'CAD',
					cashInHand: data.settings.cash_in_hand || 0,
				};
				dispatch({ type: 'SET_SETTINGS', payload: settings });
			} else {
				// Use defaults if no settings exist
				const defaultSettings: AppSettings = {
					preferredCurrency: 'CAD',
					expectedRevenue: 0,
					expectedRevenueCurrency: 'CAD',
					cashInHand: 0,
				};
				dispatch({ type: 'SET_SETTINGS', payload: defaultSettings });
			}
		} catch (error) {
			console.error('Error loading settings:', error);
			dispatch({
				type: 'SET_SETTINGS_ERROR',
				payload: 'Failed to load settings',
			});

			// Use defaults on error
			const defaultSettings: AppSettings = {
				preferredCurrency: 'CAD',
				expectedRevenue: 0,
				expectedRevenueCurrency: 'CAD',
				cashInHand: 0,
			};
			dispatch({ type: 'SET_SETTINGS', payload: defaultSettings });
		} finally {
			dispatch({ type: 'SET_SETTINGS_LOADING', payload: false });
		}
	};

	// Update settings
	const updateSettings = async (newSettings: Partial<AppSettings>) => {
		try {
			dispatch({ type: 'SET_SETTINGS_LOADING', payload: true });
			dispatch({ type: 'SET_SETTINGS_ERROR', payload: null });

			// Convert camelCase to snake_case for API
			const apiSettings: any = {};
			if (newSettings.preferredCurrency !== undefined) {
				apiSettings.preferred_currency = newSettings.preferredCurrency;
			}
			if (newSettings.expectedRevenue !== undefined) {
				apiSettings.expected_revenue = newSettings.expectedRevenue;
			}
			if (newSettings.expectedRevenueCurrency !== undefined) {
				apiSettings.expected_revenue_currency =
					newSettings.expectedRevenueCurrency;
			}
			if (newSettings.cashInHand !== undefined) {
				apiSettings.cash_in_hand = newSettings.cashInHand;
			}

			console.log('Sending settings update to API:', apiSettings);

			const response = await fetch('/api/settings', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(apiSettings),
			});

			const data = await response.json();

			if (response.ok) {
				// Reload settings to get the updated data
				await loadSettings();
			} else {
				throw new Error(data.error || 'Failed to update settings');
			}
		} catch (error) {
			console.error('Error updating settings:', error);
			dispatch({
				type: 'SET_SETTINGS_ERROR',
				payload: 'Failed to update settings',
			});
		} finally {
			dispatch({ type: 'SET_SETTINGS_LOADING', payload: false });
		}
	};

	// Date filter actions
	const setDateFilter = (filter: AppDateFilter) => {
		dispatch({ type: 'SET_DATE_FILTER', payload: filter });

		// Save to localStorage for persistence
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem('kale-date-filter', JSON.stringify(filter));
			} catch (error) {
				console.warn('Failed to save date filter to localStorage:', error);
			}
		}
	};

	const setDatePreset = (preset: DateRangePreset) => {
		const currentFilter = state.dateFilter;
		const newFilter = { ...currentFilter, preset };
		dispatch({
			type: 'SET_DATE_FILTER',
			payload: newFilter,
		});

		// Save to localStorage for persistence
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem('kale-date-filter', JSON.stringify(newFilter));
			} catch (error) {
				console.warn('Failed to save date filter to localStorage:', error);
			}
		}
	};

	const setDateRange = (range: DateRange) => {
		const currentFilter = state.dateFilter;
		const newFilter = { ...currentFilter, range };
		dispatch({
			type: 'SET_DATE_FILTER',
			payload: newFilter,
		});

		// Save to localStorage for persistence
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem('kale-date-filter', JSON.stringify(newFilter));
			} catch (error) {
				console.warn('Failed to save date filter to localStorage:', error);
			}
		}
	};

	// Refresh all data
	const refreshAll = async () => {
		dispatch({ type: 'SET_LOADING', payload: true });
		try {
			await Promise.all([loadUserProfile(), loadSettings()]);
		} catch (error) {
			console.error('Error refreshing data:', error);
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	};

	// Load initial data on mount
	useEffect(() => {
		refreshAll();
	}, []);

	// Context value
	const contextValue: AppContextValue = {
		...state,
		loadUserProfile,
		updateUserProfile,
		loadSettings,
		updateSettings,
		setDateFilter,
		setDatePreset,
		setDateRange,
		refreshAll,
	};

	return (
		<AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
	);
}

// Hook to use the app context
export function useAppContext() {
	const context = useContext(AppContext);
	if (context === undefined) {
		throw new Error('useAppContext must be used within an AppProvider');
	}
	return context;
}

// Hook for date filter specifically
export function useDateFilter() {
	const context = useAppContext();
	return {
		dateFilter: context.dateFilter,
		setDateFilter: context.setDateFilter,
		setDatePreset: context.setDatePreset,
		setDateRange: context.setDateRange,
	};
}

// Hook for user profile specifically
export function useUserProfile() {
	const context = useAppContext();
	return {
		userProfile: context.userProfile,
		userLoading: context.userLoading,
		userError: context.userError,
		loadUserProfile: context.loadUserProfile,
		updateUserProfile: context.updateUserProfile,
	};
}

// Hook for settings specifically
export function useAppSettings() {
	const context = useAppContext();
	return {
		settings: context.settings,
		settingsLoading: context.settingsLoading,
		settingsError: context.settingsError,
		loadSettings: context.loadSettings,
		updateSettings: context.updateSettings,
	};
}

// Hook for exchange rate specifically
export function useExchangeRate() {
	const context = useAppContext();
	return {
		exchangeRate: context.exchangeRate,
		exchangeRateLoading: context.exchangeRateLoading,
		exchangeRateError: context.exchangeRateError,
	};
}
