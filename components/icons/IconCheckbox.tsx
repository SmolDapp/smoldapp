import React from 'react';

import type {ReactElement} from 'react';

export function IconCheckbox(props: React.SVGProps<SVGSVGElement>): ReactElement {
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
		</svg>
	);
}
