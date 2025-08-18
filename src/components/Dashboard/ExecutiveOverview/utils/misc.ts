import {
	UsersIcon,
	CheckCircleIcon,
	ExclamationTriangleIcon,
	FunnelIcon,
} from '@heroicons/react/24/outline';
import {
	EnvelopeIcon as EnvelopeSolidIcon,
	CheckCircleIcon as CheckCircleSolidIcon,
} from '@heroicons/react/24/solid';

export const parseKpiData = (data: any) => [
	{
		id: 'emails-sent',
		label: 'Emails Sent',
		value: data.totalEmailsSent ?? 0,
		icon: EnvelopeSolidIcon,
		format: 'number',
		trend: 'up',
	},
	{
		id: 'contacts-reached',
		label: 'Unique Leads',
		value: data.uniqueLeadsConnected ?? 0,
		icon: UsersIcon,
		format: 'number',
		trend: 'up',
	},
	{
		id: 'total-replies',
		label: 'Reply Count',
		value: data.totalReplies ?? 0,
		change: data.replyRate ?? 0,
		icon: CheckCircleSolidIcon,
		format: 'number',
		trend: 'up',
	},
	{
		id: 'positive-replies',
		label: 'Positive Reply Count',
		value: data.positiveReplies ?? 0,
		change: data.positiveRepliesRate ?? 0,
		icon: CheckCircleIcon,
		format: 'number',
		trend: 'up',
	},
	{
		id: 'bounce-count',
		label: 'Bounce Count',
		value: data.totalBounce ?? 0,
		change: data.bounceRate ?? 0,
		icon: ExclamationTriangleIcon,
		format: 'number',
		trend: 'down',
	},
	{
		id: 'send-to-positive-ratio',
		label: 'Send→Positive Ratio',
		value: data.sendPositiveRatio ?? '0:0',
		icon: FunnelIcon,
		format: 'ratio',
		trend: 'up',
	},
];
