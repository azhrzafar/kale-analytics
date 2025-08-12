'use client';

import React, { useState, useEffect } from 'react';
import {
	EnvelopeIcon,
	CheckCircleIcon,
	ExclamationTriangleIcon,
	ArrowTrendingUpIcon,
	ArrowTrendingDownIcon,
	MinusIcon,
	CalendarIcon,
	UsersIcon,
	PlayIcon,
	PauseIcon,
	EyeIcon,
	ArrowPathIcon,
	DocumentTextIcon,
	ChartBarIcon,
	FunnelIcon,
	MagnifyingGlassIcon,
	DocumentDuplicateIcon,
	ClipboardDocumentListIcon,
	ExclamationCircleIcon,
	CheckIcon,
	XMarkIcon,
	InformationCircleIcon,
} from '@heroicons/react/24/outline';
import {
	EnvelopeIcon as EnvelopeSolidIcon,
	CheckCircleIcon as CheckCircleSolidIcon,
} from '@heroicons/react/24/solid';
import { formatPercentage, formatNumber } from '@/lib/utils';
import { SparklineChart } from './ChartComponents';

interface CampaignDetailProps {
	campaignId: string;
}

interface CampaignMetadata {
	id: number;
	campaign_id: string;
	campaign_name: string;
	platform: string;
	client_id: number;
	sent: number;
	contacted: number;
	opens: number;
	replies: number;
	bounced: number;
	interested: number;
	status: string;
	client_name: string;
}

interface CumulativeData {
	date: string;
	sends: number;
	replies: number;
	positiveReplies: number;
}

interface FunnelData {
	stage: string;
	count: number;
	conversionRate: number;
	previousStage: string;
}

interface StepVariantData {
	step: string;
	variant: string;
	sent: number;
	replies: number;
	positiveReplies: number;
	positiveRate: number;
	bounceRate: number;
	statisticalSignificance: {
		delta: number;
		pValue: number;
		isSignificant: boolean;
	};
}

interface MessageTemplate {
	step: string;
	variant: string;
	subject: string;
	content: string;
	variables: string[];
}

interface DeliverabilityData {
	domain: string;
	sendVolume: number;
	bounceRate: number;
	bounceCount: number;
	status: 'good' | 'warning' | 'critical';
}

interface BouncedAddress {
	email: string;
	domain: string;
	reason: string;
	bounceType: 'hard' | 'soft';
	timestamp: string;
	rawMessageId: string;
}

export default function CampaignDetail({ campaignId }: CampaignDetailProps) {
	const [campaign, setCampaign] = useState<CampaignMetadata | null>(null);
	const [cumulativeData, setCumulativeData] = useState<CumulativeData[]>([]);
	const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
	const [stepVariants, setStepVariants] = useState<StepVariantData[]>([]);
	const [messageTemplates, setMessageTemplates] = useState<MessageTemplate[]>(
		[]
	);
	const [deliverabilityData, setDeliverabilityData] = useState<
		DeliverabilityData[]
	>([]);
	const [bouncedAddresses, setBouncedAddresses] = useState<BouncedAddress[]>(
		[]
	);
	const [selectedStep, setSelectedStep] = useState<string>('Introduction');
	const [loading, setLoading] = useState(true);

	// Mock data for demonstration
	useEffect(() => {
		setLoading(true);

		// Simulate API call
		setTimeout(() => {
			setCampaign({
				id: 1,
				campaign_id: 'camp_001',
				campaign_name: 'Q1 Tech Outreach Campaign',
				status: 'active',
				platform: 'Instantly',
				client_id: 1,
				sent: 1000,
				contacted: 800,
				opens: 600,
				replies: 400,
				bounced: 200,
				interested: 150,
				client_name: 'TechCorp Solutions',
			});

			setCumulativeData([
				{ date: '2024-01-14', sends: 150, replies: 18, positiveReplies: 12 },
				{ date: '2024-01-15', sends: 320, replies: 42, positiveReplies: 28 },
				{ date: '2024-01-16', sends: 480, replies: 67, positiveReplies: 45 },
				{ date: '2024-01-17', sends: 620, replies: 89, positiveReplies: 62 },
				{ date: '2024-01-18', sends: 750, replies: 112, positiveReplies: 78 },
				{ date: '2024-01-19', sends: 890, replies: 134, positiveReplies: 95 },
				{ date: '2024-01-20', sends: 1020, replies: 156, positiveReplies: 112 },
			]);

			setFunnelData([
				{
					stage: 'Unique Leads',
					count: 1250,
					conversionRate: 100,
					previousStage: '',
				},
				{
					stage: 'Contacted',
					count: 1020,
					conversionRate: 81.6,
					previousStage: 'Unique Leads',
				},
				{
					stage: 'Replies',
					count: 156,
					conversionRate: 15.3,
					previousStage: 'Contacted',
				},
				{
					stage: 'Positive Replies',
					count: 112,
					conversionRate: 71.8,
					previousStage: 'Replies',
				},
			]);

			setStepVariants([
				{
					step: 'Introduction',
					variant: 'A',
					sent: 450,
					replies: 67,
					positiveReplies: 48,
					positiveRate: 71.6,
					bounceRate: 1.8,
					statisticalSignificance: {
						delta: 8.4,
						pValue: 0.023,
						isSignificant: true,
					},
				},
				{
					step: 'Introduction',
					variant: 'B',
					sent: 420,
					replies: 58,
					positiveReplies: 39,
					positiveRate: 67.2,
					bounceRate: 2.1,
					statisticalSignificance: {
						delta: -8.4,
						pValue: 0.023,
						isSignificant: true,
					},
				},
				{
					step: 'Follow-up',
					variant: 'A',
					sent: 380,
					replies: 62,
					positiveReplies: 47,
					positiveRate: 75.8,
					bounceRate: 1.5,
					statisticalSignificance: {
						delta: 5.2,
						pValue: 0.089,
						isSignificant: false,
					},
				},
				{
					step: 'Follow-up',
					variant: 'B',
					sent: 360,
					replies: 55,
					positiveReplies: 40,
					positiveRate: 72.7,
					bounceRate: 1.8,
					statisticalSignificance: {
						delta: -5.2,
						pValue: 0.089,
						isSignificant: false,
					},
				},
			]);

			setMessageTemplates([
				{
					step: 'Introduction',
					variant: 'A',
					subject: 'Quick question about your tech stack',
					content: `Hi {{firstName}},

I noticed {{companyName}} is growing rapidly and I wanted to reach out about your current tech infrastructure.

We've helped companies like yours scale their development teams by 3x while reducing costs by 40%. 

Would you be open to a 15-minute call to discuss how we could help {{companyName}}?

Best regards,
{{senderName}}`,
					variables: ['firstName', 'companyName', 'senderName'],
				},
				{
					step: 'Introduction',
					variant: 'B',
					subject: '{{companyName}} - Tech partnership opportunity',
					content: `Hi {{firstName}},

I came across {{companyName}} and was impressed by your growth in the tech space.

We specialize in helping companies like yours optimize their development processes and scale efficiently.

Would you be interested in learning how we've helped similar companies achieve 3x faster development cycles?

Best regards,
{{senderName}}`,
					variables: ['firstName', 'companyName', 'senderName'],
				},
			]);

			setDeliverabilityData([
				{
					domain: 'gmail.com',
					sendVolume: 450,
					bounceRate: 0.8,
					bounceCount: 4,
					status: 'good',
				},
				{
					domain: 'outlook.com',
					sendVolume: 320,
					bounceRate: 1.2,
					bounceCount: 4,
					status: 'good',
				},
				{
					domain: 'yahoo.com',
					sendVolume: 180,
					bounceRate: 2.8,
					bounceCount: 5,
					status: 'warning',
				},
				{
					domain: 'company.com',
					sendVolume: 70,
					bounceRate: 5.7,
					bounceCount: 4,
					status: 'critical',
				},
			]);

			setBouncedAddresses([
				{
					email: 'john.doe@company.com',
					domain: 'company.com',
					reason: 'User unknown',
					bounceType: 'hard',
					timestamp: '2024-01-20 14:32',
					rawMessageId: 'msg_123456789',
				},
				{
					email: 'invalid@yahoo.com',
					domain: 'yahoo.com',
					reason: 'Mailbox full',
					bounceType: 'soft',
					timestamp: '2024-01-20 13:15',
					rawMessageId: 'msg_123456790',
				},
				{
					email: 'test@company.com',
					domain: 'company.com',
					reason: 'User unknown',
					bounceType: 'hard',
					timestamp: '2024-01-20 12:45',
					rawMessageId: 'msg_123456791',
				},
			]);

			setLoading(false);
		}, 1000);
	}, [campaignId]);

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'active':
				return 'text-success-600 bg-success-50 border-success-200';
			case 'paused':
				return 'text-warning-600 bg-warning-50 border-warning-200';
			case 'completed':
				return 'text-neutral-600 bg-neutral-50 border-neutral-200';
			case 'draft':
				return 'text-primary-600 bg-primary-50 border-primary-200';
			default:
				return 'text-neutral-600 bg-neutral-50 border-neutral-200';
		}
	};

	const getDeliverabilityStatusColor = (status: string) => {
		switch (status) {
			case 'good':
				return 'text-success-600 bg-success-50 border-success-200';
			case 'warning':
				return 'text-warning-600 bg-warning-50 border-warning-200';
			case 'critical':
				return 'text-danger-600 bg-danger-50 border-danger-200';
			default:
				return 'text-neutral-600 bg-neutral-50 border-neutral-200';
		}
	};

	const getBounceTypeColor = (type: string) => {
		return type === 'hard'
			? 'text-danger-600 bg-danger-50 border-danger-200'
			: 'text-warning-600 bg-warning-50 border-warning-200';
	};

	const getSignificanceColor = (isSignificant: boolean) => {
		return isSignificant ? 'text-success-600' : 'text-neutral-500';
	};

	const getSignificanceIcon = (isSignificant: boolean) => {
		return isSignificant ? CheckIcon : InformationCircleIcon;
	};

	if (loading) {
		return (
			<div className="space-y-6 animate-pulse">
				{/* Header Skeleton */}
				<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
					<div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
					<div className="h-4 bg-gray-200 rounded w-48"></div>
				</div>

				{/* Charts Skeleton */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<div className="bg-white/80 backdrop-blur-sm p-6 rounded-sm border border-primary-100 shadow-primary">
						<div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
						<div className="h-64 bg-gray-200 rounded"></div>
					</div>
					<div className="bg-white/80 backdrop-blur-sm p-6 rounded-sm border border-primary-100 shadow-primary">
						<div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
						<div className="h-64 bg-gray-200 rounded"></div>
					</div>
				</div>
			</div>
		);
	}

	if (!campaign) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500">Campaign not found</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Campaign Header */}
			<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 overflow-hidden">
				<div className="px-6 py-4 border-b border-primary-100 bg-primary-50/80">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h2 className="text-lg font-semibold text-gray-900 flex items-center">
								{campaign.campaign_name}
							</h2>
							<div className="flex items-center space-x-4 mt-1">
								<div className="flex items-center text-sm text-gray-600">
									<UsersIcon className="h-4 w-4 mr-1" />
									{campaign.client_name}
								</div>
								<div className="flex items-center text-sm text-gray-600">
									<CalendarIcon className="h-4 w-4 mr-1" />
									Platform: {campaign.platform}
								</div>
								<div className="flex items-center text-sm text-gray-600">
									<EnvelopeIcon className="h-4 w-4 mr-1" />
									Status: {campaign.status}
								</div>
								<span
									className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
										'active'
									)}`}
								>
									Active
								</span>
							</div>
						</div>
						<div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
							<button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200">
								<PlayIcon className="h-4 w-4 mr-1" />
								Resume
							</button>
							<button className="inline-flex items-center px-3 py-2 border border-primary-300 text-sm leading-4 font-medium rounded-sm text-primary-700 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200">
								<PauseIcon className="h-4 w-4 mr-1" />
								Pause
							</button>
							<button className="inline-flex items-center px-3 py-2 border border-primary-300 text-sm leading-4 font-medium rounded-sm text-primary-700 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200">
								<DocumentDuplicateIcon className="h-4 w-4 mr-1" />
								Export
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Key Charts */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Cumulative Chart */}
				<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
						<ChartBarIcon className="h-5 w-5 mr-2 text-primary-600" />
						Cumulative Performance
					</h3>
					<div className="h-64 bg-gray-50 rounded-sm flex items-center justify-center">
						<ChartBarIcon className="h-12 w-12 text-gray-400" />
						<span className="ml-2 text-gray-500">
							Cumulative chart will be rendered here
						</span>
					</div>
					<div className="mt-4 grid grid-cols-3 gap-4 text-center">
						<div>
							<div className="text-2xl font-bold text-gray-900">
								{formatNumber(
									cumulativeData[cumulativeData.length - 1]?.sends || 0
								)}
							</div>
							<div className="text-sm text-gray-500">Total Sends</div>
						</div>
						<div>
							<div className="text-2xl font-bold text-primary-600">
								{formatNumber(
									cumulativeData[cumulativeData.length - 1]?.replies || 0
								)}
							</div>
							<div className="text-sm text-gray-500">Total Replies</div>
						</div>
						<div>
							<div className="text-2xl font-bold text-success-600">
								{formatNumber(
									cumulativeData[cumulativeData.length - 1]?.positiveReplies ||
										0
								)}
							</div>
							<div className="text-sm text-gray-500">Positive Replies</div>
						</div>
					</div>
				</div>

				{/* Funnel Chart */}
				<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
						<FunnelIcon className="h-5 w-5 mr-2 text-primary-600" />
						Conversion Funnel
					</h3>
					<div className="space-y-4">
						{funnelData.map((stage, index) => (
							<div key={stage.stage} className="flex items-center space-x-4">
								<div className="flex-1">
									<div className="flex justify-between text-sm mb-1">
										<span className="font-medium text-gray-900">
											{stage.stage}
										</span>
										<span className="text-gray-600">
											{formatNumber(stage.count)}
										</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-2">
										<div
											className="bg-primary-600 h-2 rounded-full transition-all duration-300"
											style={{ width: `${stage.conversionRate}%` }}
										></div>
									</div>
									<div className="text-xs text-gray-500 mt-1">
										{stage.previousStage &&
											`${stage.conversionRate.toFixed(1)}% from ${
												stage.previousStage
											}`}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Step & Variant Comparison */}
			<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold text-gray-900 flex items-center">
						<DocumentTextIcon className="h-5 w-5 mr-2 text-primary-600" />
						Step & Variant Comparison
					</h3>
					<select
						value={selectedStep}
						onChange={(e) => setSelectedStep(e.target.value)}
						className="px-3 py-2 text-sm border rounded-sm focus:shadow-sm bg-white text-gray-900 focus:outline-none transition-all duration-200"
					>
						<option value="Introduction">Introduction</option>
						<option value="Follow-up">Follow-up</option>
					</select>
				</div>
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-primary-100">
						<thead className="bg-primary-50/50">
							<tr>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Variant
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Sent
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Replies
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Positive %
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Bounce %
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Significance
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white/50 divide-y divide-primary-100">
							{stepVariants
								.filter((variant) => variant.step === selectedStep)
								.map((variant, index) => {
									const SignificanceIcon = getSignificanceIcon(
										variant.statisticalSignificance.isSignificant
									);
									return (
										<tr
											key={`${variant.step}-${variant.variant}`}
											className="hover:bg-primary-50/50 transition-colors duration-200"
										>
											<td className="px-4 py-3 whitespace-nowrap">
												<div className="flex items-center">
													<span className="text-sm font-medium text-gray-900">
														Variant {variant.variant}
													</span>
													{variant.statisticalSignificance.isSignificant && (
														<span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
															Winner
														</span>
													)}
												</div>
											</td>
											<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
												{formatNumber(variant.sent)}
											</td>
											<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
												{formatNumber(variant.replies)}
											</td>
											<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
												{variant.positiveRate.toFixed(1)}%
											</td>
											<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
												{variant.bounceRate.toFixed(1)}%
											</td>
											<td className="px-4 py-3 whitespace-nowrap">
												<div className="flex items-center space-x-2">
													<SignificanceIcon
														className={`h-4 w-4 ${getSignificanceColor(
															variant.statisticalSignificance.isSignificant
														)}`}
													/>
													<span
														className={`text-xs ${getSignificanceColor(
															variant.statisticalSignificance.isSignificant
														)}`}
													>
														{variant.statisticalSignificance.delta > 0
															? '+'
															: ''}
														{variant.statisticalSignificance.delta.toFixed(1)}%
														{variant.statisticalSignificance.isSignificant &&
															` (p=${variant.statisticalSignificance.pValue.toFixed(
																3
															)})`}
													</span>
												</div>
											</td>
											<td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
												<div className="flex space-x-2">
													<button
														className="text-primary-600 hover:text-primary-900 transition-colors duration-200"
														title="View template"
													>
														<EyeIcon className="h-4 w-4" />
													</button>
													<button
														className="text-warning-600 hover:text-warning-900 transition-colors duration-200"
														title="Pause variant"
													>
														<PauseIcon className="h-4 w-4" />
													</button>
												</div>
											</td>
										</tr>
									);
								})}
						</tbody>
					</table>
				</div>
			</div>

			{/* Message Preview & A/B Content Inspector */}
			<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
					<MagnifyingGlassIcon className="h-5 w-5 mr-2 text-primary-600" />
					Message Preview & A/B Content Inspector
				</h3>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{messageTemplates
						.filter((template) => template.step === selectedStep)
						.map((template, index) => (
							<div
								key={`${template.step}-${template.variant}`}
								className="border border-primary-200 rounded-sm p-4"
							>
								<div className="flex items-center justify-between mb-3">
									<h4 className="text-sm font-medium text-gray-900">
										Variant {template.variant}
									</h4>
									{index === 0 && (
										<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
											Winner
										</span>
									)}
								</div>
								<div className="space-y-3">
									<div>
										<label className="block text-xs font-medium text-gray-700 mb-1">
											Subject
										</label>
										<div className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
											{template.subject}
										</div>
									</div>
									<div>
										<label className="block text-xs font-medium text-gray-700 mb-1">
											Content
										</label>
										<div className="text-sm text-gray-900 bg-gray-50 p-3 rounded border whitespace-pre-wrap">
											{template.content}
										</div>
									</div>
									<div>
										<label className="block text-xs font-medium text-gray-700 mb-1">
											Variables
										</label>
										<div className="flex flex-wrap gap-1">
											{template.variables.map((variable) => (
												<span
													key={variable}
													className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary-100 text-primary-800"
												>
													{variable}
												</span>
											))}
										</div>
									</div>
								</div>
							</div>
						))}
				</div>
			</div>

			{/* Deliverability Diagnostics */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Domain Heatmap */}
				<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
						<ChartBarIcon className="h-5 w-5 mr-2 text-primary-600" />
						Domain Deliverability Heatmap
					</h3>
					<div className="space-y-3">
						{deliverabilityData.map((domain) => (
							<div
								key={domain.domain}
								className="flex items-center justify-between p-3 border border-primary-200 rounded-sm"
							>
								<div className="flex-1">
									<div className="flex items-center justify-between mb-1">
										<span className="text-sm font-medium text-gray-900">
											{domain.domain}
										</span>
										<span
											className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getDeliverabilityStatusColor(
												domain.status
											)}`}
										>
											{domain.status.charAt(0).toUpperCase() +
												domain.status.slice(1)}
										</span>
									</div>
									<div className="flex items-center space-x-4 text-xs text-gray-600">
										<span>{formatNumber(domain.sendVolume)} sends</span>
										<span>{domain.bounceRate.toFixed(1)}% bounce rate</span>
										<span>{formatNumber(domain.bounceCount)} bounces</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Bounced Addresses */}
				<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
						<ExclamationCircleIcon className="h-5 w-5 mr-2 text-primary-600" />
						Top Bounced Addresses
					</h3>
					<div className="space-y-3">
						{bouncedAddresses.map((bounce, index) => (
							<div
								key={bounce.rawMessageId}
								className="border border-primary-200 rounded-sm p-3"
							>
								<div className="flex items-start justify-between mb-2">
									<div className="flex-1">
										<div className="text-sm font-medium text-gray-900">
											{bounce.email}
										</div>
										<div className="text-xs text-gray-500">{bounce.domain}</div>
									</div>
									<span
										className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getBounceTypeColor(
											bounce.bounceType
										)}`}
									>
										{bounce.bounceType.charAt(0).toUpperCase() +
											bounce.bounceType.slice(1)}
									</span>
								</div>
								<div className="text-xs text-gray-600 mb-2">
									Reason: {bounce.reason}
								</div>
								<div className="flex items-center justify-between text-xs text-gray-500">
									<span>{new Date(bounce.timestamp).toLocaleString()}</span>
									<span>ID: {bounce.rawMessageId}</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="bg-white/80 backdrop-blur-sm shadow-primary rounded-md border border-primary-100 p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">
					Campaign Actions
				</h3>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					<button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200">
						<PlayIcon className="h-4 w-4 mr-2" />
						Resume Campaign
					</button>
					<button className="inline-flex items-center justify-center px-4 py-2 border border-primary-300 text-sm font-medium rounded-sm text-primary-700 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200">
						<PauseIcon className="h-4 w-4 mr-2" />
						Pause Campaign
					</button>
					<button className="inline-flex items-center justify-center px-4 py-2 border border-primary-300 text-sm font-medium rounded-sm text-primary-700 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200">
						<ClipboardDocumentListIcon className="h-4 w-4 mr-2" />
						Export Lead List
					</button>
					<button className="inline-flex items-center justify-center px-4 py-2 border border-primary-300 text-sm font-medium rounded-sm text-primary-700 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200">
						<ExclamationCircleIcon className="h-4 w-4 mr-2" />
						Create Task
					</button>
				</div>
			</div>
		</div>
	);
}
