import { format } from 'date-fns';
import type { DateRange, DateRangePreset } from './types';

export const getPresetLabels = (
	preset: DateRangePreset,
	range?: DateRange
): string => {
	switch (preset) {
		case '30d':
			return 'Last 30 Days';
		case 'mtd':
			return 'This Month';
		case 'ytd':
			return 'This Year';
		case '1y':
			return 'Last 12 Months';
		case '3y':
			return 'Last 3 Years';
		case '5y':
			return 'Last 5 Years';
		case 'custom':
			return range
				? `${format(range.startDate as Date, 'MMM d, yyyy')} to ${format(
						range.endDate as Date,
						'MMM d, yyyy'
				  )}`
				: 'Custom Range';
		default:
			return 'Select Range';
	}
};

/**
 * Format date as YYYY-MM-DD without timezone issues
 * This function ensures dates are formatted in local timezone without UTC conversion
 */
export function formatDateOnly(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}
export function formatCurrency(amount: number): string {
	// If the amount is a whole number, don't show decimal places
	if (Number.isInteger(amount)) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount);
	}

	// For decimal amounts, show up to 2 decimal places
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(amount);
}

/**
 * Format currency amount in compact form (K, M, B)
 * Examples: $1.2K, $2.5M, $1.1B
 * Handles edge cases: zero, NaN, Infinity, very small numbers, precision issues
 * Fallback for extremely large numbers (> 999B)
 */
export function formatCompactCurrency(
	amount: number,
	preferredCurrency?: string,
	cadToUsdRate?: number | null
): string {
	// Handle edge cases
	if (!isFinite(amount)) {
		return amount === Infinity || amount === -Infinity ? '$∞' : '$NaN';
	}

	if (amount === 0) {
		return '$0';
	}

	const absAmount = Math.abs(amount);
	const sign = amount < 0 ? '-' : '';

	// Handle very small amounts (less than $1)
	if (absAmount < 1) {
		return preferredCurrency && cadToUsdRate
			? formatCurrencyWithConversion(amount, preferredCurrency, cadToUsdRate)
			: formatCurrency(amount);
	}

	// Fallback for extremely large numbers (> 999B) - return same amount
	if (absAmount >= 1e12) {
		return preferredCurrency && cadToUsdRate
			? formatCurrencyWithConversion(amount, preferredCurrency, cadToUsdRate)
			: formatCurrency(amount);
	}

	// Billions (≥ 1,000,000,000)
	if (absAmount >= 1e9) {
		const billions = absAmount / 1e9;
		// Show 1 decimal for values under 10B, no decimals for 10B+
		const formatted =
			billions >= 10 ? Math.round(billions) : Math.round(billions * 10) / 10;

		// Apply currency conversion if needed
		if (preferredCurrency === 'USD' && cadToUsdRate) {
			const usdAmount = convertCADToUSD(amount, cadToUsdRate);
			const usdBillions = Math.abs(usdAmount) / 1e9;
			const usdFormatted =
				usdBillions >= 10
					? Math.round(usdBillions)
					: Math.round(usdBillions * 10) / 10;
			return `${usdAmount < 0 ? '-' : ''}$${usdFormatted}B`;
		}

		return `${sign}$${formatted}B`;
	}

	// Millions (≥ 1,000,000)
	if (absAmount >= 1e6) {
		const millions = absAmount / 1e6;
		// Show 1 decimal for values under 10M, no decimals for 10M+
		const formatted =
			millions >= 10 ? Math.round(millions) : Math.round(millions * 10) / 10;

		// Apply currency conversion if needed
		if (preferredCurrency === 'USD' && cadToUsdRate) {
			const usdAmount = convertCADToUSD(amount, cadToUsdRate);
			const usdMillions = Math.abs(usdAmount) / 1e6;
			const usdFormatted =
				usdMillions >= 10
					? Math.round(usdMillions)
					: Math.round(usdMillions * 10) / 10;
			return `${usdAmount < 0 ? '-' : ''}$${usdFormatted}M`;
		}

		return `${sign}$${formatted}M`;
	}

	// Thousands (≥ 1,000)
	if (absAmount >= 1e3) {
		const thousands = absAmount / 1e3;
		// Show 1 decimal for values under 10K, no decimals for 10K+
		const formatted =
			thousands >= 10 ? Math.round(thousands) : Math.round(thousands * 10) / 10;

		// Apply currency conversion if needed
		if (preferredCurrency === 'USD' && cadToUsdRate) {
			const usdAmount = convertCADToUSD(amount, cadToUsdRate);
			const usdThousands = Math.abs(usdAmount) / 1e3;
			const usdFormatted =
				usdThousands >= 10
					? Math.round(usdThousands)
					: Math.round(usdThousands * 10) / 10;
			return `${usdAmount < 0 ? '-' : ''}$${usdFormatted}K`;
		}

		return `${sign}$${formatted}K`;
	}

	// Less than 1000, use regular formatting
	return preferredCurrency && cadToUsdRate
		? formatCurrencyWithConversion(amount, preferredCurrency, cadToUsdRate)
		: formatCurrency(amount);
}

export function formatPercentage(value: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'percent',
		minimumFractionDigits: 1,
		maximumFractionDigits: 1,
	}).format(value / 100);
}

export function formatNumber(value: number): string {
	return new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(value);
}

export function classNames(
	...classes: (string | undefined | null | boolean)[]
): string {
	return classes.filter(Boolean).join(' ');
}

export function calculateChange(
	current: number,
	previous: number
): {
	value: number;
	percentage: number;
	type: 'positive' | 'negative' | 'neutral';
} {
	const difference = current - previous;
	const percentage = previous !== 0 ? (difference / previous) * 100 : 0;

	return {
		value: difference,
		percentage: Math.abs(percentage),
		type: difference > 0 ? 'positive' : difference < 0 ? 'negative' : 'neutral',
	};
}

export function calculateDateRange(timeFilter: DateRange): {
	startDate: string;
	endDate: string;
} {
	const today = new Date();
	const endDate = today.toISOString().split('T')[0];

	// Calculate start date by subtracting the number of days from today
	const startDate = new Date(today);
	startDate.setDate(
		today.getDate() - (timeFilter.startDate?.getTime() ?? 0) + 1
	);

	const result = {
		startDate: startDate.toISOString().split('T')[0],
		endDate,
	};
	return result;
}

/**
 * Calculate previous period date range for comparison
 * This function calculates the previous period of the same length
 */
export function calculatePreviousDateRange(timeFilter: DateRange): {
	startDate: string;
	endDate: string;
} {
	const today = new Date();
	const endDate = new Date(today);
	endDate.setDate(today.getDate() - (timeFilter.startDate?.getTime() ?? 0));

	const startDate = new Date(today);
	startDate.setDate(
		today.getDate() - (timeFilter.startDate?.getTime() ?? 0) * 2 + 1
	);

	const result = {
		startDate: startDate.toISOString().split('T')[0],
		endDate: endDate.toISOString().split('T')[0],
	};

	return result;
}

/**
 * Convert CAD amount to USD using exchange rate
 * @param cadAmount - Amount in CAD
 * @param exchangeRate - Exchange rate (CAD to USD)
 * @returns Amount converted to USD
 */
export function convertCADToUSD(
	cadAmount: number,
	exchangeRate: number
): number {
	return cadAmount / exchangeRate;
}

/**
 * Format currency amount with currency conversion if needed
 * @param amount - The amount to format (assumed to be in CAD)
 * @param preferredCurrency - The preferred currency ('CAD' or 'USD')
 * @param exchangeRate - Exchange rate for CAD to USD conversion
 * @returns Formatted currency string
 */
export function formatCurrencyWithConversion(
	amount: number,
	preferredCurrency: string,
	exchangeRate: number | null
): string {
	// If preferred currency is CAD or no exchange rate, format as CAD
	if (preferredCurrency === 'CAD' || !exchangeRate) {
		return new Intl.NumberFormat('en-CA', {
			style: 'currency',
			currency: 'CAD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 2,
		}).format(amount);
	}

	// If preferred currency is USD, convert and format
	if (preferredCurrency === 'USD') {
		const usdAmount = convertCADToUSD(amount, exchangeRate);
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 2,
		}).format(usdAmount);
	}

	// Fallback to CAD formatting
	return new Intl.NumberFormat('en-CA', {
		style: 'currency',
		currency: 'CAD',
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(amount);
}
