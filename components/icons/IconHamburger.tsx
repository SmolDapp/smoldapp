import React from 'react';

import type {ReactElement} from 'react';

export function IconHamburger(props: React.SVGProps<SVGSVGElement>): ReactElement {
	return (
		<svg
			{...props}
			viewBox={'0 0 14 10'}
			fill={'none'}
			xmlns={'http://www.w3.org/2000/svg'}>
			<path
				d={
					'M0.636364 0C0.28491 0 0 0.319797 0 0.714286C0 1.10877 0.28491 1.42857 0.636364 1.42857H13.3636C13.7151 1.42857 14 1.10877 14 0.714286C14 0.319797 13.7151 0 13.3636 0H0.636364Z'
				}
				fill={'#ADB1BD'}
			/>
			<path
				d={
					'M0.636364 4.28571C0.28491 4.28571 0 4.60551 0 5C0 5.39449 0.28491 5.71429 0.636364 5.71429H13.3636C13.7151 5.71429 14 5.39449 14 5C14 4.60551 13.7151 4.28571 13.3636 4.28571H0.636364Z'
				}
				fill={'#ADB1BD'}
			/>
			<path
				d={
					'M0 9.28571C0 8.89122 0.28491 8.57143 0.636364 8.57143H13.3636C13.7151 8.57143 14 8.89122 14 9.28571C14 9.6802 13.7151 10 13.3636 10H0.636364C0.28491 10 0 9.6802 0 9.28571Z'
				}
				fill={'#ADB1BD'}
			/>
		</svg>
	);
}
