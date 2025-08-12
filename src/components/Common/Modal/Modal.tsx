'use client';

import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

export interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	children: React.ReactNode;
	size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
	showCloseButton?: boolean;
	closeOnOverlayClick?: boolean;
	closeOnEscape?: boolean;
	className?: string;
	overlayClassName?: string;
	contentClassName?: string;
}

const sizeClasses = {
	sm: 'w-full max-w-sm mx-4',
	md: 'w-full max-w-md mx-4',
	lg: 'w-full max-w-lg mx-4',
	xl: 'w-full max-w-xl mx-4',
	'2xl': 'w-full max-w-2xl mx-4',
	full: 'w-full max-w-full mx-4',
};

export default function Modal({
	isOpen,
	onClose,
	title,
	children,
	size = 'md',
	showCloseButton = true,
	closeOnOverlayClick = true,
	closeOnEscape = true,
	className = '',
	overlayClassName = '',
	contentClassName = '',
}: ModalProps) {
	return (
		<Transition.Root show={isOpen} as={Fragment}>
			<Dialog
				as="div"
				className={clsx('relative z-50', className)}
				onClose={closeOnOverlayClick ? onClose : () => {}}
			>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div
						className={clsx(
							'fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity',
							overlayClassName
						)}
					/>
				</Transition.Child>

				<div className="fixed inset-0 z-10 overflow-y-auto">
					<div className="flex min-h-full items-center justify-center p-4 text-center">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
							enterTo="opacity-100 translate-y-0 sm:scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 translate-y-0 sm:scale-100"
							leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
						>
							<Dialog.Panel
								className={clsx(
									'relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full',
									sizeClasses[size],
									contentClassName
								)}
							>
								{/* Header */}
								{(title || showCloseButton) && (
									<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
										{title && (
											<Dialog.Title className="text-lg font-semibold text-gray-900">
												{title}
											</Dialog.Title>
										)}
										{showCloseButton && (
											<button
												type="button"
												className="text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:ring-0 focus:ring-white focus:ring-offset-2 rounded-sm"
												onClick={onClose}
											>
												<XMarkIcon className="h-6 w-6" />
											</button>
										)}
									</div>
								)}

								{/* Content */}
								<div className="px-6 py-4">{children}</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition.Root>
	);
}

// Modal Header Component
export function ModalHeader({
	title,
	onClose,
	showCloseButton = true,
	className = '',
}: {
	title?: string;
	onClose?: () => void;
	showCloseButton?: boolean;
	className?: string;
}) {
	return (
		<div
			className={clsx(
				'flex items-center justify-between px-6 py-4 border-b border-gray-200',
				className
			)}
		>
			{title && (
				<h3 className="text-lg font-semibold text-gray-900">{title}</h3>
			)}
			{showCloseButton && onClose && (
				<button
					type="button"
					className="text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-sm"
					onClick={onClose}
				>
					<XMarkIcon className="h-6 w-6" />
				</button>
			)}
		</div>
	);
}

// Modal Body Component
export function ModalBody({
	children,
	className = '',
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return <div className={clsx('px-6 py-4', className)}>{children}</div>;
}

// Modal Footer Component
export function ModalFooter({
	children,
	className = '',
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={clsx(
				'flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200',
				className
			)}
		>
			{children}
		</div>
	);
}
