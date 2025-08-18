import { useState, useEffect } from 'react';
import { APIService } from '@/lib/services/apiService';

export interface Client {
	id: number;
	Domain: string;
	'Company Name': string;
	'Primary Email': string;
	'Primary Number': string;
	'Contact Title': string;
	Industry: string;
	Services: string;
	'Onboarding Date': string;
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
			const clientsData = await APIService.getAllClients();
			setClients(clientsData);
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
