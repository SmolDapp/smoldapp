import React from 'react';

import type {ReactElement} from 'react';

export function IconCheckboxChecked(props: React.SVGProps<SVGSVGElement>): ReactElement {
	return (
		<svg
			{...props}
			width={'16'}
			height={'16'}
			viewBox={'0 0 16 16'}
			fill={'none'}
			xmlns={'http://www.w3.org/2000/svg'}>
			<rect
				x={'0.5'}
				y={'0.5'}
				width={'15'}
				height={'15'}
				rx={'3.5'}
				stroke={'currentColor'}
			/>
			<path
				fillRule={'evenodd'}
				clipRule={'evenodd'}
				d={
					'M11.8401 4.99267C12.0287 5.14981 12.0542 5.43006 11.897 5.61863L7.45259 10.952C7.30718 11.1265 7.05361 11.1632 6.86462 11.0372L4.19796 9.25946C3.99372 9.1233 3.93853 8.84736 4.07469 8.64313C4.21085 8.43889 4.48679 8.3837 4.69103 8.51986L7.0254 10.0761L11.2142 5.04958C11.3713 4.86101 11.6516 4.83553 11.8401 4.99267Z'
				}
				fill={'currentColor'}
			/>
		</svg>
	);
}
