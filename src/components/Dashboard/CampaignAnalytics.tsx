'use client';

import React, { useState, useEffect } from 'react';
import {
	ArrowTrendingUpIcon,
	ArrowTrendingDownIcon,
	BuildingOfficeIcon,
	EyeIcon,
	PauseIcon,
} from '@heroicons/react/24/outline';
import { formatNumber } from '@/lib/utils';

interface CampaignAnalyticsProps {
	timeFilter: any;
	preset?: string;
}

interface CampaignData {
	id: number;
	campaign_id: string;
	campaign_name: string;
	client_name: string;
	platform: 'Instantly' | 'Bison';
	status: 'active' | 'paused' | 'completed';
	sent: number;
	contacted: number;
	replies: number;
	interested: number;
	bounced: number;
	send_to_positive_ratio: number;
	expected_ratio: number;
	last_sent_date: string;
	steps: CampaignStep[];
}

interface CampaignStep {
	step_number: number;
	step_name: string;
	emails_sent: number;
	replies: number;
	positive_replies: number;
	reply_rate: number;
	positive_rate: number;
	variants: StepVariant[];
}

interface StepVariant {
	variant: string;
	emails_sent: number;
	replies: number;
	positive_replies: number;
	reply_rate: number;
	positive_rate: number;
	statistical_significance: 'high' | 'medium' | 'low' | 'insufficient';
}

interface ClientHealthData {
	client_name: string;
	total_campaigns: number;
	active_campaigns: number;
	avg_send_ratio: number;
	expected_ratio: number;
	health_score: number;
	status: 'healthy' | 'warning' | 'critical';
	last_week_ratio: number;
	current_week_ratio: number;
}

export default function CampaignAnalytics({
	timeFilter,
	preset,
}: CampaignAnalyticsProps) {
	const [selectedClient, setSelectedClient] = useState('all');
	const [selectedPlatform, setSelectedPlatform] = useState('all');
	const [selectedTimeframe, setSelectedTimeframe] = useState('7');
	const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
	const [clientHealth, setClientHealth] = useState<ClientHealthData[]>([]);
	const [loading, setLoading] = useState(true);

	// Mock data based on client conversation requirements
	useEffect(() => {
		setLoading(true);

		// Simulate API call
		setTimeout(() => {
			// Campaign data with step-level analysis
			setCampaigns([
				{
					id: 1,
					campaign_id: 'inst_001',
					campaign_name: 'TechCorp Outreach Q1',
					client_name: 'TechCorp Solutions',
					platform: 'Instantly',
					status: 'active',
					sent: 6300,
					contacted: 2100,
					replies: 945,
					interested: 756,
					bounced: 63,
					send_to_positive_ratio: 6300 / 756,
					expected_ratio: 100,
					last_sent_date: '2024-01-20',
					steps: [
						{
							step_number: 1,
							step_name: 'Initial Outreach',
							emails_sent: 2100,
							replies: 315,
							positive_replies: 252,
							reply_rate: 15.0,
							positive_rate: 80.0,
							variants: [
								{
									variant: 'Hey',
									emails_sent: 700,
									replies: 105,
									positive_replies: 84,
									reply_rate: 15.0,
									positive_rate: 80.0,
									statistical_significance: 'high',
								},
								{
									variant: 'Hello',
									emails_sent: 700,
									replies: 112,
									positive_replies: 90,
									reply_rate: 16.0,
									positive_rate: 80.4,
									statistical_significance: 'high',
								},
								{
									variant: 'Hi',
									emails_sent: 700,
									replies: 98,
									positive_replies: 78,
									reply_rate: 14.0,
									positive_rate: 79.6,
									statistical_significance: 'high',
								},
							],
						},
						{
							step_number: 2,
							step_name: 'Follow-up',
							emails_sent: 1785,
							replies: 630,
							positive_replies: 504,
							reply_rate: 35.3,
							positive_rate: 80.0,
							variants: [
								{
									variant: 'A',
									emails_sent: 357,
									replies: 126,
									positive_replies: 101,
									reply_rate: 35.3,
									positive_rate: 80.2,
									statistical_significance: 'high',
								},
								{
									variant: 'B',
									emails_sent: 357,
									replies: 133,
									positive_replies: 107,
									reply_rate: 37.3,
									positive_rate: 80.5,
									statistical_significance: 'high',
								},
								{
									variant: 'C',
									emails_sent: 357,
									replies: 125,
									positive_replies: 100,
									reply_rate: 35.0,
									positive_rate: 80.0,
									statistical_significance: 'high',
								},
								{
									variant: 'D',
									emails_sent: 357,
									replies: 123,
									positive_replies: 98,
									reply_rate: 34.5,
									positive_rate: 79.7,
									statistical_significance: 'high',
								},
								{
									variant: 'E',
									emails_sent: 357,
									replies: 123,
									positive_replies: 98,
									reply_rate: 34.5,
									positive_rate: 79.7,
									statistical_significance: 'high',
								},
							],
						},
					],
				},
				{
					id: 2,
					campaign_id: 'bison_001',
					campaign_name: 'StartupXYZ Growth',
					client_name: 'StartupXYZ',
					platform: 'Bison',
					status: 'active',
					sent: 4500,
					contacted: 1500,
					replies: 225,
					interested: 135,
					bounced: 45,
					send_to_positive_ratio: 4500 / 135,
					expected_ratio: 350,
					last_sent_date: '2024-01-19',
					steps: [
						{
							step_number: 1,
							step_name: 'Cold Outreach',
							emails_sent: 1500,
							replies: 75,
							positive_replies: 45,
							reply_rate: 5.0,
							positive_rate: 60.0,
							variants: [
								{
									variant: 'Professional',
									emails_sent: 750,
									replies: 38,
									positive_replies: 23,
									reply_rate: 5.1,
									positive_rate: 60.5,
									statistical_significance: 'medium',
								},
								{
									variant: 'Casual',
									emails_sent: 750,
									replies: 37,
									positive_replies: 22,
									reply_rate: 4.9,
									positive_rate: 59.5,
									statistical_significance: 'medium',
								},
							],
						},
					],
				},
			]);

			// Client health data based on send-to-positive ratios
			setClientHealth([
				{
					client_name: 'TechCorp Solutions',
					total_campaigns: 5,
					active_campaigns: 3,
					avg_send_ratio: 8.3,
					expected_ratio: 100,
					health_score: 92,
					status: 'healthy',
					last_week_ratio: 8.1,
					current_week_ratio: 8.3,
				},
				{
					client_name: 'StartupXYZ',
					total_campaigns: 3,
					active_campaigns: 2,
					avg_send_ratio: 33.3,
					expected_ratio: 350,
					health_score: 78,
					status: 'warning',
					last_week_ratio: 30.0,
					current_week_ratio: 33.3,
				},
				{
					client_name: 'Innovate Labs',
					total_campaigns: 4,
					active_campaigns: 2,
					avg_send_ratio: 250.0,
					expected_ratio: 100,
					health_score: 45,
					status: 'critical',
					last_week_ratio: 100.0,
					current_week_ratio: 250.0,
				},
			]);

			setLoading(false);
		}, 1000);
	}, [timeFilter, preset]);

	const getHealthStatusColor = (status: string) => {
		switch (status) {
			case 'healthy':
				return 'text-success-600 bg-success-50 border-success-200';
			case 'warning':
				return 'text-warning-600 bg-warning-50 border-warning-200';
			case 'critical':
				return 'text-danger-600 bg-danger-50 border-danger-200';
			default:
				return 'text-neutral-600 bg-neutral-50 border-neutral-200';
		}
	};

	const getSignificanceColor = (significance: string) => {
		switch (significance) {
			case 'high':
				return 'text-success-600';
			case 'medium':
				return 'text-warning-600';
			case 'low':
				return 'text-danger-600';
			default:
				return 'text-neutral-600';
		}
	};

	const getPlatformColor = (platform: string) => {
		switch (platform) {
			case 'Instantly':
				return 'text-primary-600 bg-primary-50 border-primary-200';
			case 'Bison':
				return 'text-success-600 bg-success-50 border-success-200';
			default:
				return 'text-neutral-600 bg-neutral-50 border-neutral-200';
		}
	};

	if (loading) {
		return (
			<div className="space-y-6 animate-pulse">
				<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
					<div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
					<div className="h-4 bg-gray-200 rounded w-48"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 overflow-hidden">
				<div className="px-6 py-4 border-b border-primary-100 bg-primary-50/80">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">
								Campaign Analytics
							</h1>
							<p className="text-sm text-gray-600 mt-1">
								Per-campaign analysis with step-level insights and A/B testing
								results
							</p>
						</div>
						<div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
							<select
								value={selectedClient}
								onChange={(e) => setSelectedClient(e.target.value)}
								className="px-3 py-2 text-sm border rounded-sm focus:shadow-sm bg-white text-gray-900 focus:outline-none transition-all duration-200"
							>
								<option value="all">All Clients</option>
								<option value="techcorp">TechCorp Solutions</option>
								<option value="startup">StartupXYZ</option>
								<option value="innovate">Innovate Labs</option>
							</select>
							<select
								value={selectedPlatform}
								onChange={(e) => setSelectedPlatform(e.target.value)}
								className="px-3 py-2 text-sm border rounded-sm focus:shadow-sm bg-white text-gray-900 focus:outline-none transition-all duration-200"
							>
								<option value="all">All Platforms</option>
								<option value="instantly">Instantly</option>
								<option value="bison">Bison</option>
							</select>
							<select
								value={selectedTimeframe}
								onChange={(e) => setSelectedTimeframe(e.target.value)}
								className="px-3 py-2 text-sm border rounded-sm focus:shadow-sm bg-white text-gray-900 focus:outline-none transition-all duration-200"
							>
								<option value="7">Last 7 days</option>
								<option value="30">Last 30 days</option>
								<option value="90">Last 90 days</option>
							</select>
						</div>
					</div>
				</div>
			</div>

			{/* Client Health Overview */}
			<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 overflow-hidden">
				<div className="px-6 py-4 border-b border-primary-100 bg-primary-50/80">
					<h3 className="text-lg font-semibold text-gray-900 flex items-center">
						<BuildingOfficeIcon className="h-5 w-5 mr-2 text-primary-600" />
						Client Health Overview
					</h3>
				</div>
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-primary-100">
						<thead className="bg-primary-50/50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Client
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Campaigns
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Send→Positive Ratio
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Expected Ratio
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Health Score
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Status
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Trend
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white/50 divide-y divide-primary-100">
							{clientHealth.map((client, index) => (
								<tr
									key={client.client_name}
									className="hover:bg-primary-50/50 transition-colors duration-200"
									style={{ animationDelay: `${index * 50}ms` }}
								>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm font-medium text-gray-900">
											{client.client_name}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-gray-900">
											{client.active_campaigns}/{client.total_campaigns} active
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm font-medium text-gray-900">
											1:{client.avg_send_ratio.toFixed(1)}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-gray-600">
											1:{client.expected_ratio}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm font-medium text-gray-900">
											{client.health_score}%
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthStatusColor(
												client.status
											)}`}
										>
											{client.status.charAt(0).toUpperCase() +
												client.status.slice(1)}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex items-center">
											{client.current_week_ratio > client.last_week_ratio ? (
												<ArrowTrendingUpIcon className="h-4 w-4 text-danger-600" />
											) : (
												<ArrowTrendingDownIcon className="h-4 w-4 text-success-600" />
											)}
											<span className="text-sm text-gray-600 ml-1">
												{client.current_week_ratio > client.last_week_ratio
													? 'Worsening'
													: 'Improving'}
											</span>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
										<div className="flex justify-end space-x-2">
											<button
												className="text-primary-600 hover:text-primary-900 transition-colors duration-200"
												title="View campaigns"
											>
												<EyeIcon className="h-4 w-4" />
											</button>
											{client.status === 'critical' && (
												<button
													className="text-warning-600 hover:text-warning-900 transition-colors duration-200"
													title="Pause campaigns"
												>
													<PauseIcon className="h-4 w-4" />
												</button>
											)}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Campaign Details */}
			<div className="space-y-6">
				{campaigns.map((campaign) => (
					<div
						key={campaign.id}
						className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 overflow-hidden"
					>
						<div className="px-6 py-4 border-b border-primary-100 bg-primary-50/80">
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
								<div>
									<h3 className="text-lg font-semibold text-gray-900">
										{campaign.campaign_name}
									</h3>
									<div className="flex items-center space-x-4 mt-1">
										<span className="text-sm text-gray-600">
											{campaign.client_name}
										</span>
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlatformColor(
												campaign.platform
											)}`}
										>
											{campaign.platform}
										</span>
										<span className="text-sm text-gray-600">
											ID: {campaign.campaign_id}
										</span>
									</div>
								</div>
								<div className="mt-4 sm:mt-0 flex items-center space-x-4">
									<div className="text-right">
										<div className="text-sm font-medium text-gray-900">
											Send→Positive Ratio
										</div>
										<div className="text-lg font-bold text-gray-900">
											1:
											{(
												campaign.sent / Math.max(campaign.interested, 1)
											).toFixed(1)}
										</div>
										<div className="text-xs text-gray-500">
											Expected: 1:{campaign.expected_ratio}
										</div>
									</div>
									<div className="flex space-x-2">
										<button
											className="text-primary-600 hover:text-primary-900 transition-colors duration-200"
											title="View details"
										>
											<EyeIcon className="h-4 w-4" />
										</button>
										<button
											className="text-warning-600 hover:text-warning-900 transition-colors duration-200"
											title="Pause campaign"
										>
											<PauseIcon className="h-4 w-4" />
										</button>
									</div>
								</div>
							</div>
						</div>

						{/* Campaign Summary */}
						<div className="px-6 py-4 border-b border-primary-100">
							<div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
								<div>
									<span className="text-gray-600">Emails Sent:</span>
									<div className="font-medium">
										{formatNumber(campaign.sent)}
									</div>
								</div>
								<div>
									<span className="text-gray-600">Contacts Reached:</span>
									<div className="font-medium">
										{formatNumber(campaign.contacted)}
									</div>
								</div>
								<div>
									<span className="text-gray-600">Replies:</span>
									<div className="font-medium text-success-600">
										{formatNumber(campaign.replies)}
									</div>
								</div>
								<div>
									<span className="text-gray-600">Positive Replies:</span>
									<div className="font-medium text-primary-600">
										{formatNumber(campaign.interested)}
									</div>
								</div>
								<div>
									<span className="text-gray-600">Bounces:</span>
									<div className="font-medium text-warning-600">
										{formatNumber(campaign.bounced)}
									</div>
								</div>
								<div>
									<span className="text-gray-600">Last Sent:</span>
									<div className="font-medium">
										{new Date(campaign.last_sent_date).toLocaleDateString()}
									</div>
								</div>
							</div>
						</div>

						{/* Step Analysis */}
						<div className="px-6 py-4">
							<h4 className="text-md font-semibold text-gray-900 mb-4">
								Step Analysis
							</h4>
							<div className="space-y-4">
								{campaign.steps.map((step) => (
									<div
										key={step.step_number}
										className="border border-primary-200 rounded-sm p-4"
									>
										<div className="flex items-center justify-between mb-3">
											<h5 className="text-lg font-semibold text-gray-900">
												Step {step.step_number}: {step.step_name}
											</h5>
											<div className="flex items-center space-x-4 text-sm">
												<span className="text-gray-600">
													Reply Rate: {step.reply_rate.toFixed(1)}%
												</span>
												<span className="text-gray-600">
													Positive Rate: {step.positive_rate.toFixed(1)}%
												</span>
											</div>
										</div>

										{/* Step Summary */}
										<div className="grid grid-cols-4 gap-4 mb-4 text-sm">
											<div>
												<span className="text-gray-600">Emails Sent:</span>
												<div className="font-medium">
													{formatNumber(step.emails_sent)}
												</div>
											</div>
											<div>
												<span className="text-gray-600">Replies:</span>
												<div className="font-medium text-success-600">
													{formatNumber(step.replies)}
												</div>
											</div>
											<div>
												<span className="text-gray-600">Positive:</span>
												<div className="font-medium text-primary-600">
													{formatNumber(step.positive_replies)}
												</div>
											</div>
											<div>
												<span className="text-gray-600">Variants:</span>
												<div className="font-medium">
													{step.variants.length}
												</div>
											</div>
										</div>

										{/* A/B Testing Results */}
										{step.variants.length > 1 && (
											<div>
												<h6 className="text-sm font-semibold text-gray-900 mb-2">
													A/B Testing Results
												</h6>
												<div className="overflow-x-auto">
													<table className="min-w-full text-sm">
														<thead className="bg-primary-50/50">
															<tr>
																<th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
																	Variant
																</th>
																<th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
																	Sent
																</th>
																<th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
																	Replies
																</th>
																<th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
																	Reply Rate
																</th>
																<th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
																	Positive
																</th>
																<th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
																	Positive Rate
																</th>
																<th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
																	Significance
																</th>
															</tr>
														</thead>
														<tbody className="divide-y divide-primary-100">
															{step.variants.map((variant) => (
																<tr
																	key={variant.variant}
																	className="hover:bg-primary-50/30"
																>
																	<td className="px-3 py-2 font-medium">
																		{variant.variant}
																	</td>
																	<td className="px-3 py-2">
																		{formatNumber(variant.emails_sent)}
																	</td>
																	<td className="px-3 py-2 text-success-600">
																		{formatNumber(variant.replies)}
																	</td>
																	<td className="px-3 py-2">
																		{variant.reply_rate.toFixed(1)}%
																	</td>
																	<td className="px-3 py-2 text-primary-600">
																		{formatNumber(variant.positive_replies)}
																	</td>
																	<td className="px-3 py-2">
																		{variant.positive_rate.toFixed(1)}%
																	</td>
																	<td className="px-3 py-2">
																		<span
																			className={`text-xs font-medium ${getSignificanceColor(
																				variant.statistical_significance
																			)}`}
																		>
																			{variant.statistical_significance
																				.charAt(0)
																				.toUpperCase() +
																				variant.statistical_significance.slice(
																					1
																				)}
																		</span>
																	</td>
																</tr>
															))}
														</tbody>
													</table>
												</div>
											</div>
										)}
									</div>
								))}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
