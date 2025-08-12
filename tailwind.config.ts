import type { Config } from 'tailwindcss';

const config: Config = {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			colors: {
				// Primary light blues
				primary: {
					50: '#f0f9ff',
					100: '#e0f2fe',
					200: '#bae6fd',
					300: '#7dd3fc',
					400: '#38bdf8',
					500: '#0ea5e9',
					600: '#0284c7',
					700: '#0369a1',
					800: '#075985',
					900: '#0c4a6e',
					950: '#082f49',
				},
				// Secondary professional greens
				secondary: {
					50: '#f0fdf4',
					100: '#dcfce7',
					200: '#bbf7d0',
					300: '#86efac',
					400: '#4ade80',
					500: '#22c55e',
					600: '#16a34a',
					700: '#15803d',
					800: '#166534',
					900: '#14532d',
					950: '#052e16',
				},
				// Neutral grays for backgrounds and cards
				neutral: {
					50: '#fafafa',
					100: '#f5f5f5',
					200: '#e5e5e5',
					300: '#d4d4d4',
					400: '#a3a3a3',
					500: '#737373',
					600: '#525252',
					700: '#404040',
					800: '#262626',
					900: '#171717',
					950: '#0a0a0a',
				},
				// Semantic colors
				success: {
					50: '#f0fdf4',
					100: '#dcfce7',
					200: '#bbf7d0',
					300: '#86efac',
					400: '#4ade80',
					500: '#22c55e',
					600: '#16a34a',
					700: '#15803d',
					800: '#166534',
					900: '#14532d',
				},
				warning: {
					50: '#fffbeb',
					100: '#fef3c7',
					200: '#fde68a',
					300: '#fcd34d',
					400: '#fbbf24',
					500: '#f59e0b',
					600: '#d97706',
					700: '#b45309',
					800: '#92400e',
					900: '#78350f',
				},
				danger: {
					50: '#fef2f2',
					100: '#fee2e2',
					200: '#fecaca',
					300: '#fca5a5',
					400: '#f87171',
					500: '#ef4444',
					600: '#dc2626',
					700: '#b91c1c',
					800: '#991b1b',
					900: '#7f1d1d',
				},
				// Chart colors for data visualization
				chart: {
					1: '#3b82f6', // primary-500
					2: '#22c55e', // success-500
					3: '#f59e0b', // warning-500
					4: '#ef4444', // danger-500
					5: '#8b5cf6', // purple-500
					6: '#06b6d4', // cyan-500
					7: '#f97316', // orange-500
					8: '#ec4899', // pink-500
				},
				// Surface colors for cards and components
				surface: {
					primary: '#ffffff',
					secondary: '#fafafa',
					tertiary: '#f5f5f5',
					card: '#ffffff',
					sidebar: '#f8fafc',
					navbar: '#ffffff',
				},
				// Text colors
				text: {
					primary: '#171717', // neutral-900
					secondary: '#525252', // neutral-600
					tertiary: '#737373', // neutral-500
					inverse: '#ffffff',
					muted: '#a3a3a3', // neutral-400
				},
			},
			fontFamily: {
				sans: [
					'Inter',
					'system-ui',
					'-apple-system',
					'BlinkMacSystemFont',
					'Segoe UI',
					'Roboto',
					'sans-serif',
				],
				mono: [
					'JetBrains Mono',
					'Fira Code',
					'Consolas',
					'Monaco',
					'monospace',
				],
			},
			fontSize: {
				xs: ['0.75rem', { lineHeight: '1rem' }],
				sm: ['0.875rem', { lineHeight: '1.25rem' }],
				base: ['1rem', { lineHeight: '1.5rem' }],
				lg: ['1.125rem', { lineHeight: '1.75rem' }],
				xl: ['1.25rem', { lineHeight: '1.75rem' }],
				'2xl': ['1.5rem', { lineHeight: '2rem' }],
				'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
				'4xl': ['2.25rem', { lineHeight: '2.5rem' }],
				'5xl': ['3rem', { lineHeight: '1' }],
				'6xl': ['3.75rem', { lineHeight: '1' }],
			},
			fontWeight: {
				light: '300',
				normal: '400',
				medium: '500',
				semibold: '600',
				bold: '700',
			},
			spacing: {
				'18': '4.5rem',
				'88': '22rem',
				'128': '32rem',
			},
			borderRadius: {
				xs: '0.125rem',
				sm: '0.25rem',
				base: '0.375rem',
				md: '0.5rem',
				lg: '0.75rem',
				xl: '1rem',
				'2xl': '1.5rem',
				'3xl': '2rem',
			},
			boxShadow: {
				xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
				sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
				base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
				md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
				lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
				xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
				'2xl': '0 50px 100px -20px rgba(0, 0, 0, 0.25)',
				inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
				card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
				'card-hover':
					'0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
				focus: '0 0 0 3px rgba(59, 130, 246, 0.5)',
				'focus-success': '0 0 0 3px rgba(34, 197, 94, 0.5)',
				'focus-warning': '0 0 0 3px rgba(245, 158, 11, 0.5)',
				'focus-danger': '0 0 0 3px rgba(239, 68, 68, 0.5)',
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic':
					'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
				'gradient-primary': 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
				'gradient-secondary':
					'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
				'gradient-success': 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
				'gradient-warning': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
				'gradient-danger': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
			},
			animation: {
				'fade-in': 'fadeIn 0.5s ease-in-out',
				'fade-out': 'fadeOut 0.5s ease-in-out',
				'slide-up': 'slideUp 0.3s ease-out',
				'slide-down': 'slideDown 0.3s ease-out',
				'slide-left': 'slideLeft 0.3s ease-out',
				'slide-right': 'slideRight 0.3s ease-out',
				'scale-in': 'scaleIn 0.2s ease-out',
				'scale-out': 'scaleOut 0.2s ease-out',
				'bounce-gentle': 'bounceGentle 2s infinite',
				'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'spin-slow': 'spin 3s linear infinite',
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				fadeOut: {
					'0%': { opacity: '1' },
					'100%': { opacity: '0' },
				},
				slideUp: {
					'0%': { transform: 'translateY(10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				slideDown: {
					'0%': { transform: 'translateY(-10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				slideLeft: {
					'0%': { transform: 'translateX(10px)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' },
				},
				slideRight: {
					'0%': { transform: 'translateX(-10px)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' },
				},
				scaleIn: {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' },
				},
				scaleOut: {
					'0%': { transform: 'scale(1)', opacity: '1' },
					'100%': { transform: 'scale(0.95)', opacity: '0' },
				},
				bounceGentle: {
					'0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
					'40%': { transform: 'translateY(-3px)' },
					'60%': { transform: 'translateY(-2px)' },
				},
			},
			transitionProperty: {
				height: 'height',
				spacing: 'margin, padding',
			},
			zIndex: {
				'60': '60',
				'70': '70',
				'80': '80',
				'90': '90',
				'100': '100',
			},
		},
	},
	plugins: [],
};
export default config;
