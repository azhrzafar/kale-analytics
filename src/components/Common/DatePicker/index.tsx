import React, { useState } from 'react';
import type { DateRangeWithPreset } from '@/lib/types';
import { DateFilterModal, DateFilterTrigger } from './DateFilterModal';
import { useDateFilter } from '@/lib/appContext';

interface TimeFilterProps {
	selected?: DateRangeWithPreset;
	onChange?: (range: DateRangeWithPreset) => void;
}

export default function DateRangeFilter({
	selected,
	onChange,
}: TimeFilterProps = {}) {
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const { dateFilter, setDateFilter } = useDateFilter();

	// Use context values if no props provided, otherwise use props (for backward compatibility)
	const currentValue = selected || dateFilter;
	const handleChange = onChange || setDateFilter;

	return (
		<div className="relative">
			<DateFilterTrigger
				value={currentValue.range}
				onClick={() => setIsFilterOpen(true)}
			/>
			<DateFilterModal
				value={currentValue}
				onChange={handleChange}
				isOpen={isFilterOpen}
				onClose={() => setIsFilterOpen(false)}
				position="right"
			/>
		</div>
	);
}
