import React from 'react';

import type {ReactElement} from 'react';

function Hero(props: React.SVGProps<SVGSVGElement>): ReactElement {
	return (
		<svg
			{...props}
			className={'text-primary w-2/5'}
			viewBox={'0 0 142 123'}
			fill={'none'}
			xmlns={'http://www.w3.org/2000/svg'}>
			<path
				d={'M141.4 61.7H71.1996L36.0996 1H106.3L141.4 61.7Z'}
				stroke={'#e0e0e0'}
				strokeMiterlimit={'10'}
				strokeLinejoin={'round'}
			/>
			<path
				d={'M141.4 61.7002H71.1996L36.0996 122.5H106.3L141.4 61.7002Z'}
				stroke={'#e0e0e0'}
				strokeMiterlimit={'10'}
				strokeLinejoin={'round'}
			/>
			<path
				d={'M50.3996 25.7998H91.8996L112.7 61.6998L91.8996 97.6998H50.3996L29.5996 61.6998L50.3996 25.7998Z'}
				fill={'currentColor'}
			/>
			<path
				d={'M50.3996 25.7998H91.8996L112.7 61.6998L91.8996 97.6998H50.3996L29.5996 61.6998L50.3996 25.7998Z'}
				fill={'currentColor'}
				fillOpacity={'0.2'}
			/>
			<path
				d={'M36.1 1H106.3L141.4 61.7L106.3 122.5H36.1L1 61.7L36.1 1Z'}
				stroke={'#e0e0e0'}
				strokeMiterlimit={'10'}
				strokeLinejoin={'round'}
			/>
			<path
				d={'M106.299 1L71.1992 61.7L106.299 122.5L141.399 61.7L106.299 1Z'}
				stroke={'#e0e0e0'}
				strokeMiterlimit={'10'}
				strokeLinejoin={'round'}
			/>
			<path
				d={'M71.2 61.7002H1L36.1 122.5H106.3L71.2 61.7002Z'}
				stroke={'#e0e0e0'}
				strokeMiterlimit={'10'}
				strokeLinecap={'round'}
				strokeLinejoin={'round'}
			/>
		</svg>
	);
}

export default Hero;
