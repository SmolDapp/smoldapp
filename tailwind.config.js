/* eslint-disable @typescript-eslint/explicit-function-return-type */
const {join} = require('path');
const plugin = require('tailwindcss/plugin');
const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors');

function withOpacityValue(variable) {
	return ({opacityValue}) => {
		if (opacityValue === undefined) {
			return `hsl(var(${variable}))`;
		}
		return `hsl(var(${variable}) / ${opacityValue})`;
	};
}

module.exports = {
	content: [
		'./components/**/*.{js,ts,jsx,tsx}',
		'./contexts/**/*.{js,ts,jsx,tsx}',
		'./hooks/**/*.{js,ts,jsx,tsx}',
		'./pages/**/*.{js,ts,jsx,tsx}',
		join(__dirname, 'node_modules', '@yearn-finance', 'web-lib', 'components', '**', '*.{js,ts,jsx,tsx}'),
		join(__dirname, 'node_modules', '@yearn-finance', 'web-lib', 'contexts', '**', '*.{js,ts,jsx,tsx}'),
		join(__dirname, 'node_modules', '@yearn-finance', 'web-lib', 'hooks', '**', '*.{js,ts,jsx,tsx}'),
		join(__dirname, 'node_modules', '@yearn-finance', 'web-lib', 'icons', '**', '*.{js,ts,jsx,tsx}'),
		join(__dirname, 'node_modules', '@yearn-finance', 'web-lib', 'utils', '**', '*.{js,ts,jsx,tsx}')
	],
	theme: {
		colors: {
			'black': 'hsl(0, 0%, 0%)',
			'white': 'rgb(255, 255, 255)',
			'transparent': 'transparent',
			'inherit': 'inherit',
			neutral: {
				0: withOpacityValue('--color-neutral-0'),
				50: withOpacityValue('--color-neutral-50'),
				100: withOpacityValue('--color-neutral-100'),
				200: withOpacityValue('--color-neutral-200'),
				300: withOpacityValue('--color-neutral-300'),
				400: withOpacityValue('--color-neutral-400'),
				500: withOpacityValue('--color-neutral-500'),
				600: withOpacityValue('--color-neutral-600'),
				700: withOpacityValue('--color-neutral-700'),
				800: withOpacityValue('--color-neutral-800'),
				900: withOpacityValue('--color-neutral-900')
			},
			pink: colors.pink
		},
		extend: {
			fontFamily: {
				sans: ['var(--inter-font)', 'Inter', 'Roboto', ...defaultTheme.fontFamily.sans],
				mono: ['Source Code Pro', ...defaultTheme.fontFamily.mono]
			},
			width: {
				'inherit': 'inherit'
			},
			fontSize: {
				'xxs': ['10px', '16px'],
				'xs': ['12px', '16px'],
				'sm': ['14px', '20px'],
				'base': ['16px', '24px'],
				'intermediate': ['18px', '24px'],
				'lg': ['20px', '32px'],
				'xl': ['24px', '32px'],
				'3xl': ['32px', '40px'],
				'4xl': ['40px', '56px'],
				'7xl': ['80px', '96px']
			},
			maxWidth: {
				'xl': '552px',
				'4xl': '904px',
				'6xl': '1200px'
			}
		}
	},
	plugins: [
		require('@tailwindcss/forms'),
		require('@tailwindcss/typography'),
		plugin(function ({addUtilities}) {
			addUtilities({
				'.scrollbar-none': {
					'-ms-overflow-style': 'none',
					'scrollbar-width': 'none',
					'&::-webkit-scrollbar': {
						display: 'none'
					}
				}
			});
		})
	]
};
