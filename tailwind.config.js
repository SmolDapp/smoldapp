/* eslint-disable @typescript-eslint/explicit-function-return-type */
const {join} = require('path');
const plugin = require('tailwindcss/plugin');
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
	content: [
		'./components/**/*.{js,ts,jsx,tsx}',
		'./components/**/**/*.{js,ts,jsx,tsx}',
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
			black: 'hsl(0, 0%, 0%)',
			white: 'rgb(255, 255, 255)',
			transparent: 'transparent',
			inherit: 'inherit',
			primary: '#FFD915',
			primaryHover: '#FFE043',
			neutral: {
				0: '#FFFFFF',
				// 50: '', unavailable
				// 100: '', unavailable
				200: '#F7F7F7',
				300: '#F3F3F3',
				400: '#DCDDDD',
				// 500: '', unavailable
				600: '#ADB1BD',
				700: '#474F59',
				800: '#272B30',
				900: '#060B11'
			},
			red: '#D42600',
			green: '#0C9000'
		},
		extend: {
			fontFamily: {
				sans: ['var(--rubik-font)', 'Rubik', 'Roboto', ...defaultTheme.fontFamily.sans],
				mono: ['Source Code Pro', ...defaultTheme.fontFamily.mono]
			},
			height: {
				content: '656px',
				app: 'calc(100dvh - 80px)'
			},
			minHeight: {
				content: '656px',
				app: 'calc(100dvh - 80px)'
			},
			width: {
				inherit: 'inherit',
				sidebar: '280px',
				main: '1000px',
				22: '88px',
				108: '432px'
			},
			maxWidth: {
				'4xl': '888px',
				'5xl': '992px',
				'6xl': '1200px',
				22: '88px',
				108: '432px'
			},
			fontSize: {
				xxs: ['10px', '16px'],
				xs: ['12px', '16px'],
				sm: ['14px', '20px'],
				base: ['16px', '24px'],
				intermediate: ['18px', '24px'],
				lg: ['20px', '32px'],
				xl: ['24px', '32px'],
				'3xl': ['32px', '40px']
			},
			gridTemplateColumns: {
				root: 'repeat(30, minmax(0, 1fr))'
			},
			gridColumn: {
				sidebar: 'span 7 / span 7',
				main: 'span 23 / span 23'
			}
		}
	},
	plugins: [
		require('@tailwindcss/forms'),
		require('@tailwindcss/typography'),
		require('tailwindcss-animate'),
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
