'use client';

import React from 'react';

export function SparklineChart({
	data,
	color = 'bg-primary-500',
}: {
	data: number[];
	color?: string;
}) {
	const maxValue = Math.max(...data);
	const minValue = Math.min(...data);
	const range = maxValue - minValue;

	return (
		<div className="w-16 h-8 flex items-end space-x-px">
			{data.map((value, index) => (
				<div
					key={index}
					className={`flex-1 ${color} rounded-sm transition-all duration-200 hover:opacity-80`}
					style={{
						height:
							range > 0 ? `${((value - minValue) / range) * 100}%` : '50%',
						minHeight: '2px',
					}}
				></div>
			))}
		</div>
	);
}
