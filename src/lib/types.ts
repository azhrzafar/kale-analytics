// Database Settings interface
export interface DatabaseSettings {
	id: string;
	expected_revenue: number;
	cash_in_hand: number;
	expected_revenue_currency: string;
	preferred_currency: string;
	created_at: string;
	updated_at: string;
}

export interface DateRange {
	startDate: Date | null;
	endDate: Date | null;
}
export type DateRangePreset =
	| '30d'
	| 'mtd'
	| 'ytd'
	| '1y'
	| '3y'
	| '5y'
	| 'custom';

export interface DateRangeWithPreset {
	preset: DateRangePreset;
	range: DateRange;
}

export interface DateFilterPreset {
	label: string;
	value: string;
	days?: number;
	getDateRange: () => DateRange;
}

export interface DateFilterProps {
	value: DateRangeWithPreset;
	onChange: (range: DateRangeWithPreset) => void;
	isOpen: boolean;
	onClose: () => void;
	position?: 'left' | 'right';
}

export interface ExpenseCategory {
	name: string;
	amount: number;
	percentage: number;
	color: string;
}

export interface CashFlowData {
	month: string;
	income: number;
	expenses: number;
	netFlow: number;
}

// Invoice Analytics Types
export interface InvoiceMetrics {
	totalInvoices: number;
	totalAmount: number;
	paidAmount: number;
	outstandingAmount: number;
	overdueAmount: number;
	paymentRate: number;
	averageDaysToPay: number;
	topCustomers: Array<{
		name: string;
		amount: number;
		invoiceCount: number;
	}>;
	statusBreakdown: Array<{
		status: string;
		count: number;
		amount: number;
		percentage: number;
	}>;
	monthlyTrends: Array<{
		month: string;
		invoiced: number;
		paid: number;
		outstanding: number;
	}>;
	productPerformance: Array<{
		name: string;
		quantity: number;
		revenue: number;
		averagePrice: number;
	}>;
}

export interface InvoiceStatus {
	DRAFT: number;
	SENT: number;
	VIEWED: number;
	PAID: number;
	OVERDUE: number;
	CANCELLED: number;
}

export interface CustomerInvoiceData {
	customerId: string;
	customerName: string;
	totalInvoiced: number;
	totalPaid: number;
	outstandingAmount: number;
	invoiceCount: number;
	averageDaysToPay: number;
	lastInvoiceDate: string;
}

export interface ProductInvoiceData {
	productId: string;
	productName: string;
	totalQuantity: number;
	totalRevenue: number;
	averagePrice: number;
	invoiceCount: number;
}

// Transaction Analytics Types
export interface TransactionAnalytics {
	// Volume Analysis
	totalTransactions: number;
	averageTransactionSize: number;
	transactionVolumeByPeriod: Array<{
		period: string;
		count: number;
		totalAmount: number;
		averageAmount: number;
	}>;

	// Account Analysis
	accountPerformance: Array<{
		accountName: string;
		transactionCount: number;
		totalVolume: number;
		averageAmount: number;
		lastTransactionDate: string;
		accountType: 'bank' | 'credit_card';
	}>;

	// Category Analysis
	categoryBreakdown: Array<{
		category: string;
		transactionCount: number;
		totalAmount: number;
		percentage: number;
		averageAmount: number;
		trend: 'increasing' | 'decreasing' | 'stable';
	}>;

	// Vendor Analysis
	topVendors: Array<{
		vendorName: string;
		transactionCount: number;
		totalAmount: number;
		averageAmount: number;
		lastTransactionDate: string;
		frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'one_time';
	}>;

	// Cash Flow Velocity
	cashFlowVelocity: {
		averageDaysToClear: number;
		accountTurnover: Array<{
			accountName: string;
			turnoverRate: number; // transactions per month
			lastActivity: string;
		}>;
		paymentPatterns: Array<{
			dayOfWeek: string;
			transactionCount: number;
			totalAmount: number;
		}>;
	};

	// Anomaly Detection
	anomalies: Array<{
		id: string;
		type:
			| 'unusual_amount'
			| 'unusual_frequency'
			| 'unusual_vendor'
			| 'unusual_category';
		severity: 'low' | 'medium' | 'high';
		description: string;
		transactionId: string;
		transactionDate: string;
		amount: number;
		suggestedAction: string;
	}>;
}

export interface TransactionFilters {
	searchTerm: string;
	selectedCategory: string;
	selectedType: 'all' | 'income' | 'expense';
	selectedAccount: string;
	amountRange: {
		min: number;
		max: number;
	};
	dateRange: {
		start: string;
		end: string;
	};
	verificationStatus: 'all' | 'verified' | 'not_verified' | 'pending';
	recurringOnly: boolean;
	anomaliesOnly: boolean;
}

export interface CashFlowVelocityMetrics {
	// Transaction velocity
	transactionsPerDay: number;
	transactionsPerWeek: number;
	transactionsPerMonth: number;

	// Amount velocity
	averageDailyVolume: number;
	averageWeeklyVolume: number;
	averageMonthlyVolume: number;

	// Account activity
	mostActiveAccount: string;
	leastActiveAccount: string;
	accountActivityScore: number; // 0-100

	// Payment patterns
	peakTransactionDay: string;
	peakTransactionHour: number;
	weekendActivity: number; // percentage of weekend transactions

	// Clearance times
	averageClearanceTime: number; // in days
	fastestClearingAccount: string;
	slowestClearingAccount: string;
}

export interface AnomalyDetectionConfig {
	// Amount thresholds
	unusualAmountThreshold: number; // percentage above average
	largeTransactionThreshold: number; // absolute amount

	// Frequency thresholds
	unusualFrequencyThreshold: number; // transactions per day
	recurringPatternThreshold: number; // days between similar transactions

	// Vendor thresholds
	newVendorThreshold: number; // days since last new vendor
	highVolumeVendorThreshold: number; // transactions per vendor

	// Category thresholds
	unusualCategoryThreshold: number; // percentage of total spending
	categorySpikeThreshold: number; // percentage increase from previous period
}

// Monthly Performance Data interface
export interface MonthlyPerformanceData {
	month: string;
	total_revenue: number;
	total_expenses: number;
}

// App Context Types
export interface AppUserProfile {
	id: string;
	email: string;
	firstName?: string | null;
	lastName?: string | null;
	avatar?: string | null;
	created_at: string;
	last_sign_in_at: string | null;
	enabled: boolean;
}

export interface AppSettings {
	preferredCurrency: string;
	expectedRevenue: number;
	expectedRevenueCurrency: string;
	cashInHand: number;
}

export interface ExchangeRateData {
	cadRate: number;
	lastUpdated: string;
	isLoading: boolean;
	error: string | null;
}

export interface AppDateFilter {
	preset: DateRangePreset;
	range: DateRange;
}

export interface AppContextState {
	// User profile
	userProfile: AppUserProfile | null;
	userLoading: boolean;
	userError: string | null;

	// App settings
	settings: AppSettings | null;
	settingsLoading: boolean;
	settingsError: string | null;

	// Exchange rate data
	exchangeRate: ExchangeRateData | null;
	exchangeRateLoading: boolean;
	exchangeRateError: string | null;

	// Date filter (global across app)
	dateFilter: AppDateFilter;

	// Loading states
	isLoading: boolean;
}

export interface AppContextActions {
	// User actions
	loadUserProfile: () => Promise<void>;
	updateUserProfile: (profile: Partial<AppUserProfile>) => Promise<void>;

	// Settings actions
	loadSettings: () => Promise<void>;
	updateSettings: (settings: Partial<AppSettings>) => Promise<void>;

	// Date filter actions
	setDateFilter: (filter: AppDateFilter) => void;
	setDatePreset: (preset: DateRangePreset) => void;
	setDateRange: (range: DateRange) => void;

	// Utility actions
	refreshAll: () => Promise<void>;
}

export interface AppContextValue extends AppContextState, AppContextActions {}
