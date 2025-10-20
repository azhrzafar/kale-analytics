import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
	try {
		const { data: clients, error } = await supabase.from('clients').select('*');

		if (error) {
			console.error('Error fetching clients:', error);
			return NextResponse.json(
				{ error: 'Failed to fetch clients' },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			data: clients,
		});
	} catch (error) {
		console.error('Error in clients API:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
