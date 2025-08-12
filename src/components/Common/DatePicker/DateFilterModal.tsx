'use client';

import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { format, subDays, subYears } from 'date-fns';
import { CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type {
	DateRange,
	DateFilterPreset,
	DateFilterProps,
	DateRangePreset,
} from '@/lib/types';
import 'react-datepicker/dist/react-datepicker.css';

// Preset time ranges
const getPresets = (): DateFilterPreset[] => {
	const now = new Date();
	return [
		{
			label: 'Last 30 days',
			value: '30d',
			days: 30,
			getDateRange: () => ({
				startDate: subDays(now, 29),
				endDate: now,
			}),
		},
		{
			label: 'MTD',
			value: 'mtd',
			getDateRange: () => {
				const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
				firstDayOfMonth.setHours(0, 0, 0, 0);
				return {
					startDate: firstDayOfMonth,
					endDate: now,
				};
			},
		},
		{
			label: 'YTD',
			value: 'ytd',
			getDateRange: () => {
				const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
				firstDayOfYear.setHours(0, 0, 0, 0);
				return {
					startDate: firstDayOfYear,
					endDate: now,
				};
			},
		},
		{
			label: '1 year',
			value: '1y',
			days: 365,
			getDateRange: () => ({
				startDate: subYears(now, 1),
				endDate: now,
			}),
		},
		{
			label: '3 years',
			value: '3y',
			days: 1095,
			getDateRange: () => ({
				startDate: subYears(now, 3),
				endDate: now,
			}),
		},
		{
			label: '5 years',
			value: '5y',
			days: 1825,
			getDateRange: () => ({
				startDate: subYears(now, 5),
				endDate: now,
			}),
		},
		{
			label: 'Custom',
			value: 'custom',
			getDateRange: () => ({
				startDate: null,
				endDate: null,
			}),
		},
	];
};

interface DateFilterModalProps extends DateFilterProps {
	triggerRef?: React.RefObject<HTMLElement>;
}

export function DateFilterModal({
	value,
	onChange,
	isOpen,
	onClose,
	position = 'right',
	triggerRef,
}: DateFilterModalProps) {
	const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>(
		value.preset
	);
	const [customRange, setCustomRange] = useState<DateRange>(value.range);
	const [tempRange, setTempRange] = useState<DateRange>(value.range);
	const presets = getPresets();

	useEffect(() => {
		setTempRange(value.range);
	}, [value]);

	// Function to check if a date range matches any predefined preset
	const checkPresetMatch = (range: DateRange): DateRangePreset => {
		if (!range.startDate || !range.endDate) {
			return 'custom';
		}

		// Normalize dates to start of day for comparison
		const normalizeDate = (date: Date) => {
			const normalized = new Date(date);
			normalized.setHours(0, 0, 0, 0);
			return normalized;
		};

		const normalizedStart = normalizeDate(range.startDate);
		const normalizedEnd = normalizeDate(range.endDate);
		const now = new Date();
		const normalizedNow = normalizeDate(now);

		// Check 30 days
		const thirtyDaysAgo = normalizeDate(subDays(now, 29));
		if (
			normalizedStart.getTime() === thirtyDaysAgo.getTime() &&
			normalizedEnd.getTime() === normalizedNow.getTime()
		) {
			return '30d';
		}

		// Check MTD
		const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		firstDayOfMonth.setHours(0, 0, 0, 0);
		if (
			normalizedStart.getTime() === firstDayOfMonth.getTime() &&
			normalizedEnd.getTime() === normalizedNow.getTime()
		) {
			return 'mtd';
		}

		// Check YTD
		const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
		firstDayOfYear.setHours(0, 0, 0, 0);
		if (
			normalizedStart.getTime() === firstDayOfYear.getTime() &&
			normalizedEnd.getTime() === normalizedNow.getTime()
		) {
			return 'ytd';
		}

		// Check 1 year
		const oneYearAgo = normalizeDate(subYears(now, 1));
		if (
			normalizedStart.getTime() === oneYearAgo.getTime() &&
			normalizedEnd.getTime() === normalizedNow.getTime()
		) {
			return '1y';
		}

		// Check 3 years
		const threeYearsAgo = normalizeDate(subYears(now, 3));
		if (
			normalizedStart.getTime() === threeYearsAgo.getTime() &&
			normalizedEnd.getTime() === normalizedNow.getTime()
		) {
			return '3y';
		}

		// Check 5 years
		const fiveYearsAgo = normalizeDate(subYears(now, 5));
		if (
			normalizedStart.getTime() === fiveYearsAgo.getTime() &&
			normalizedEnd.getTime() === normalizedNow.getTime()
		) {
			return '5y';
		}

		// If no match found, return custom
		return 'custom';
	};

	const handlePresetClick = (preset: DateFilterPreset) => {
		setSelectedPreset(preset.value as DateRangePreset);
		if (preset.value === 'custom') {
			setTempRange(customRange);
		} else {
			const range = preset.getDateRange();
			setTempRange(range);
		}
	};

	const handleApply = () => {
		onChange({ preset: selectedPreset, range: tempRange });
		if (selectedPreset === 'custom') {
			setCustomRange(tempRange);
		}
		onClose();
	};

	const handleCancel = () => {
		setTempRange(value.range);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<>
			{/* Desktop Overlay */}
			<div
				className="fixed inset-0 overflow-y-auto"
				style={{ zIndex: 40 }}
				// className="hidden sm:block bg-black/50 fixed inset-0 z-40"
				onClick={onClose}
			/>

			{/* Mobile Bottom Sheet */}
			<div className="sm:hidden fixed inset-0 z-[9999] overflow-hidden">
				<div className="absolute inset-0" onClick={onClose} />
				<div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-100 overflow-hidden animate-slide-up">
					{/* Drag Handle */}
					<div className="flex justify-center pt-3 pb-2">
						<div className="w-12 h-1 bg-gray-300"></div>
					</div>

					{/* Mobile Content */}
					<div className="flex flex-col h-full">
						{/* Header */}
						<div className="flex items-center justify-between p-4 border-b border-gray-100 bg-primary-50/80">
							<div className="flex items-center space-x-3">
								<div className="p-2 bg-primary-100 rounded-sm">
									<CalendarIcon className="w-5 h-5 text-primary-600" />
								</div>
								<div>
									<h3 className="text-lg font-semibold text-gray-900">
										Date Range
									</h3>
								</div>
							</div>
							<button
								onClick={onClose}
								className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-sm transition-colors"
							>
								<XMarkIcon className="w-5 h-5" />
							</button>
						</div>

						{/* Mobile Presets */}
						<div className="p-4 border-b border-gray-100">
							<div className="grid grid-cols-2 gap-2">
								{presets.map((preset) => (
									<button
										key={preset.value}
										onClick={() => handlePresetClick(preset)}
										className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
											preset.value === 'custom' ? 'col-span-2 ' : ''
										}${
											selectedPreset === preset.value
												? 'bg-primary-600 text-white shadow-md'
												: 'text-neutral-700 bg-neutral-50 hover:bg-primary-50 hover:text-primary-700'
										}`}
									>
										{preset.label}
									</button>
								))}
							</div>
						</div>

						{/* Mobile Content Area */}
						<div className="flex-1 overflow-y-auto">
							{selectedPreset === 'custom' ? (
								<div className="p-4">
									<div className="bg-primary-50/80 rounded-md p-4">
										<div className="flex justify-center">
											<DatePicker
												selected={tempRange.startDate || undefined}
												onChange={(dates) => {
													const [start, end] = dates as [
														Date | null,
														Date | null
													];
													const newRange = { startDate: start, endDate: end };
													setTempRange(newRange);

													// Check if the new range matches any preset
													if (start && end) {
														const matchingPreset = checkPresetMatch(newRange);
														setSelectedPreset(matchingPreset);
													}
												}}
												startDate={tempRange.startDate || undefined}
												endDate={tempRange.endDate || undefined}
												selectsRange
												inline
												monthsShown={1}
												calendarClassName="custom-calendar"
												maxDate={new Date()}
											/>
										</div>
									</div>
								</div>
							) : (
								<div className="p-4 text-center">
									<div className="p-6 bg-primary-50 rounded-md inline-block mb-4">
										<CalendarIcon className="w-12 h-12 text-primary-400 mx-auto" />
									</div>
									<h3 className="text-lg font-semibold text-gray-900 mb-3">
										{presets.find((p) => p.value === selectedPreset)?.label}
									</h3>
									<div className="bg-white rounded-md p-4 border border-gray-200 shadow-soft">
										<p className="text-gray-600 mb-2 text-sm">
											Selected Range:
										</p>
										<p className="text-base font-medium text-primary-700">
											{tempRange.startDate && tempRange.endDate ? (
												<>
													{format(tempRange.startDate, 'MMM dd, yyyy')} -{' '}
													{format(tempRange.endDate, 'MMM dd, yyyy')}
												</>
											) : (
												'Select a date range'
											)}
										</p>
									</div>
								</div>
							)}
						</div>

						{/* Mobile Footer */}
						<div className="p-4 border-t border-gray-100 bg-gray-50">
							<div className="flex space-x-3">
								<button
									onClick={handleCancel}
									className="btn btn-secondary flex-1"
								>
									Cancel
								</button>
								<button
									onClick={handleApply}
									disabled={!tempRange.startDate || !tempRange.endDate}
									className="btn btn-primary flex-1"
								>
									Apply
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Desktop Dropdown - Simple absolute positioning */}
			<div className="hidden sm:block absolute top-full mt-2 right-0 bg-white shadow-lg border border-gray-200 rounded-sm overflow-hidden animate-slide-up z-50">
				<div className="flex flex-col md:flex-row h-auto">
					{/* Sidebar with presets */}
					<div className="w-full md:w-[100px] border-b md:border-b-0 border md:border-r border-gray-100 flex-shrink-0">
						<div className="pt-2 pr-[2px]">
							<div className="grid grid-cols-2 md:grid-cols-1 gap-1">
								{presets.map((preset) => (
									<button
										key={preset.value}
										onClick={() => handlePresetClick(preset)}
										className={`w-full rounded-sm text-left p-2 text-[13px] font-normal transition-all duration-200 ${
											selectedPreset === preset.value
												? 'bg-primary-600 text-white shadow-primary'
												: 'text-gray-700 hover:bg-primary-50 hover:text-primary-700 hover:shadow-soft'
										}`}
									>
										{preset.label}
									</button>
								))}
							</div>
						</div>
					</div>
					<div className="w-full">
						{/* Main content */}
						<div className="min-w-[550px] flex-1 p-4 pl-2 overflow-y-auto">
							<DatePicker
								selected={tempRange.startDate || undefined}
								onChange={(dates) => {
									const [start, end] = dates as [Date | null, Date | null];
									const newRange = { startDate: start, endDate: end };
									setTempRange(newRange);

									// Check if the new range matches any preset
									if (start && end) {
										const matchingPreset = checkPresetMatch(newRange);
										setSelectedPreset(matchingPreset);
									}
								}}
								startDate={tempRange.startDate || undefined}
								endDate={tempRange.endDate || undefined}
								selectsRange
								inline
								monthsShown={window.innerWidth >= 668 ? 2 : 1}
								calendarClassName="custom-calendar"
								maxDate={new Date()}
								renderCustomHeader={({
									monthDate,
									decreaseMonth,
									increaseMonth,
									decreaseYear,
									increaseYear,
									customHeaderCount,
								}) => (
									<div className=" flex justify-between items-center px-2 py-1">
										{customHeaderCount === 0 ? (
											<>
												<div className="space-x-2">
													<button
														className="text-gray-500"
														onClick={decreaseYear}
													>
														{'<<'}
													</button>
													<button
														className="text-gray-500"
														onClick={decreaseMonth}
													>
														{'<'}
													</button>
												</div>
												<span className="font-semibold">
													{format(monthDate, 'MMMM yyyy')}
												</span>
												<div />
											</>
										) : (
											<>
												<div />

												<span className="font-semibold">
													{format(monthDate, 'MMMM yyyy')}
												</span>
												<div className="space-x-2">
													<button
														className="text-gray-500"
														onClick={increaseMonth}
													>
														{'>'}
													</button>
													<button
														className="text-gray-500"
														onClick={increaseYear}
													>
														{'>>'}
													</button>
												</div>
											</>
										)}
									</div>
								)}
							/>
						</div>

						{/* Footer */}
						<div className="flex flex-col gap-4 sm:flex-row items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4 px-4 py-4 border-t border-gray-100">
							<div className="flex flex-row gap-2 items-center border rounded-md text-gray-700 p-2 text-xs">
								{tempRange.startDate
									? format(tempRange.startDate, 'yyyy-MM-dd')
									: ''}
								{tempRange.endDate && (
									<span className="text-primary-600 text-xs font-medium">
										→
									</span>
								)}
								{tempRange.endDate
									? format(tempRange.endDate, 'yyyy-MM-dd')
									: ''}
								<CalendarIcon className="w-4 h-4 mx-auto" />
							</div>

							<div className="flex flex-row gap-2">
								<button
									onClick={handleCancel}
									className="btn btn-secondary w-full sm:w-auto"
								>
									Cancel
								</button>
								<button
									onClick={handleApply}
									disabled={!tempRange.startDate || !tempRange.endDate}
									className="btn btn-primary w-full sm:w-auto"
								>
									Apply Filter
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

// Simple trigger component
interface DateFilterTriggerProps {
	value: DateRange;
	onClick: () => void;
	className?: string;
}

export const DateFilterTrigger = React.forwardRef<
	HTMLButtonElement,
	DateFilterTriggerProps
>(({ value, onClick, className = '' }, ref) => {
	const formatRange = () => {
		if (!value.startDate || !value.endDate) {
			return 'Select date range';
		}
		return `${format(value.startDate, 'MMM dd, yyyy')} - ${format(
			value.endDate,
			'MMM dd, yyyy'
		)}`;
	};

	return (
		<button
			ref={ref}
			onClick={onClick}
			className={`relative inline-flex items-center px-3 py-2 border border-gray-200 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-primary-300 hover:text-primary-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 shadow-soft ${className}`}
		>
			<CalendarIcon className="w-4 h-4 mr-2 text-primary-500" />
			<span className="hidden sm:inline">{formatRange()}</span>
			<span className="sm:hidden">Filter</span>
		</button>
	);
});

DateFilterTrigger.displayName = 'DateFilterTrigger';

// Main export component
export default function DateFilter(props: DateFilterProps) {
	return <DateFilterModal {...props} />;
}
