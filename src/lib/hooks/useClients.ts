import { useState, useEffect } from 'react';
import { APIService } from '@/lib/services/apiService';

export interface Client {
	id: number;
	domain: string;
	company_name: string;
	primary_email: string;
	primary_number: string;
	contact_title: string;
	industry: string;
	services: string;
	onboarding_date: string;
	instantly_api: string;
	bison_api: string;
	instantly_api_v2: string;
}

export const useClients = () => {
	const [clients, setClients] = useState<Client[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchClients = async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await fetch(`/api/clients/list`);

			if (!response.ok) {
				if (response.status === 404) {
					throw new Error('Campaign not found');
				}
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();

			if (result.success) {
				setClients(result.data);
			} else {
				throw new Error('Failed to fetch campaign details');
			}
		} catch (err) {
			console.error('Error fetching clients:', err);
			setError(err instanceof Error ? err.message : 'Failed to fetch clients');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchClients();
	}, []);

	return {
		clients,
		loading,
		error,
		refetch: fetchClients,
	};
};
