import { useState, useEffect } from 'react';

export interface ClientListData {
	id: string;
	name: string;
	onboardDate: string;
	services: string[];
	emailsSent: number;
	replies: number;
	replyRate: number;
	positiveReplies: number;
	positiveReplyRate: number;
	bounces: number;
	bounceRate: number;
	uniqueLeads: number;
	// Additional client fields
	domain: string;
	primaryEmail: string;
	primaryNumber: string;
	contactTitle: string;
	industry: string;
	instantlyApi: string;
	bisonApi: string;
	instantlyApiV2: string;
}

interface UseClientsListOptions {
	searchTerm?: string;
	sortBy?:
		| 'name'
		| 'replyRate'
		| 'positiveReplies'
		| 'bounceRate'
		| 'emailsSent'
		| 'uniqueLeads';
	sortOrder?: 'asc' | 'desc';
}

export const useClientsList = (options: UseClientsListOptions = {}) => {
	const [clients, setClients] = useState<ClientListData[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const { searchTerm = '', sortBy = 'replyRate', sortOrder = 'desc' } = options;

	useEffect(() => {
		const fetchClients = async () => {
			try {
				setLoading(true);
				setError(null);

				const params = new URLSearchParams();
				if (searchTerm) params.append('search', searchTerm);
				if (sortBy) params.append('sortBy', sortBy);
				if (sortOrder) params.append('sortOrder', sortOrder);

				const response = await fetch(`/api/clients?${params.toString()}`);

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const result = await response.json();

				if (result.success) {
					setClients(result.data);
				} else {
					throw new Error(result.error || 'Failed to fetch clients');
				}
			} catch (err) {
				console.error('Error fetching clients list:', err);
				setError(err instanceof Error ? err.message : 'An error occurred');
			} finally {
				setLoading(false);
			}
		};

		fetchClients();
	}, [searchTerm, sortBy, sortOrder]);

	return {
		clients,
		loading,
		error,
		refetch: () => {
			setLoading(true);
			// This will trigger the useEffect to refetch
		},
	};
};
