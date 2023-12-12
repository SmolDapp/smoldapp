import React from 'react';

import type {ReactElement} from 'react';

export function IconCircleCheck(props: React.SVGProps<SVGSVGElement>): ReactElement {
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
				fill={'currentcolor'}
			/>
			<path
				fillRule={'evenodd'}
				clipRule={'evenodd'}
				d={
					'M11.8401 5.09934C12.0286 5.25087 12.0541 5.52111 11.897 5.70294L7.45256 10.8458C7.30716 11.014 7.05359 11.0495 6.8646 10.928L4.19796 9.21373C3.99372 9.08243 3.93854 8.81635 4.07469 8.61941C4.21085 8.42247 4.48679 8.36925 4.69102 8.50054L7.02537 10.0012L11.2141 5.15422C11.3713 4.97238 11.6515 4.94782 11.8401 5.09934Z'
				}
				fill={'white'}
			/>
		</svg>
	);
}
