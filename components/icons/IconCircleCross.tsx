import React from 'react';

import type {ReactElement} from 'react';

export function IconCircleCross(props: React.SVGProps<SVGSVGElement>): ReactElement {
	return (
		<svg
			{...props}
			viewBox={'0 0 16 16'}
			fill={'none'}
			xmlns={'http://www.w3.org/2000/svg'}>
			<circle
				cx={'8'}
				cy={'8'}
				r={'8'}
				fill={'currentColor'}
			/>
			<g clipPath={'url(#clip0_332_1678)'}>
				<path
					d={
						'M5.35355 4.64645C5.15829 4.45118 4.84171 4.45118 4.64645 4.64645C4.45118 4.84171 4.45118 5.15829 4.64645 5.35355L7.29289 8L4.64645 10.6464C4.45118 10.8417 4.45118 11.1583 4.64645 11.3536C4.84171 11.5488 5.15829 11.5488 5.35355 11.3536L8 8.70711L10.6464 11.3536C10.8417 11.5488 11.1583 11.5488 11.3536 11.3536C11.5488 11.1583 11.5488 10.8417 11.3536 10.6464L8.70711 8L11.3536 5.35355C11.5488 5.15829 11.5488 4.84171 11.3536 4.64645C11.1583 4.45118 10.8417 4.45118 10.6464 4.64645L8 7.29289L5.35355 4.64645Z'
					}
					fill={'white'}
				/>
			</g>
			<defs>
				<clipPath id={'clip0_332_1678'}>
					<rect
						width={'8'}
						height={'8'}
						fill={'white'}
						transform={'translate(4 4)'}
					/>
				</clipPath>
			</defs>
		</svg>
	);
}
