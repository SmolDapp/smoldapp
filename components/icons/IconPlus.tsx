import React from 'react';

import type {ReactElement} from 'react';

export function IconPlus(props: React.SVGProps<SVGSVGElement>): ReactElement {
	return (
		<svg
			{...props}
			viewBox={'0 0 12 12'}
			fill={'none'}
			xmlns={'http://www.w3.org/2000/svg'}>
			<path
				d={
					'M6.75 1.88586C6.75 1.47164 6.41421 1.13586 6 1.13586C5.58579 1.13586 5.25 1.47164 5.25 1.88586L5.25 5.24982L1.88604 5.24982C1.47182 5.24982 1.13604 5.5856 1.13604 5.99982C1.13604 6.41403 1.47182 6.74982 1.88604 6.74982L5.25 6.74982L5.25 10.1138C5.25 10.528 5.58579 10.8638 6 10.8638C6.41421 10.8638 6.75 10.528 6.75 10.1138V6.74982L10.114 6.74982C10.5282 6.74982 10.864 6.41403 10.864 5.99982C10.864 5.5856 10.5282 5.24982 10.114 5.24982L6.75 5.24982L6.75 1.88586Z'
				}
				fill={'currentColor'}
			/>
		</svg>
	);
}
