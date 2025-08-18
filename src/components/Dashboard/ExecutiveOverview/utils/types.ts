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

export interface PlatformData {
	platform: string;
	sends: number;
	replies: number;
	replyRate: number;
	positiveRate: number;
	bounceRate: number;
	leads: number;
}

export interface ClientData {
	id: number;
	Domain: string;
	Company_Name: string;
	Primary_Email: string;
	Primary_Number: string;
	Contact_Title: string;
	Industry: string;
	Services: string;
	Onboarding_Date: string;
	instantly_api: string;
	bison_api: string;
	instantly_api_v2: string;
}

export interface AlertData {
	id: string;
	type: 'warning' | 'error' | 'info';
	message: string;
	client?: string;
	metric?: string;
}

export interface PlatformData {
	platform: string;
	sends: number;
	replies: number;
	replyRate: number;
	positiveRate: number;
	bounceRate: number;
	leads: number;
}

export interface TimeSeriesData {
	date: string;
	emails: number;
	replies: number;
	positive: number;
	bounces: number;
}
