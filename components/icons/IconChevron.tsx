import React from 'react';

import type {ReactElement} from 'react';

export function IconChevron(props: React.SVGProps<SVGSVGElement>): ReactElement {
	return (
		<svg
			{...props}
			width={'16'}
			height={'16'}
			viewBox={'0 0 16 16'}
			fill={'none'}
			xmlns={'http://www.w3.org/2000/svg'}>
			<path
				fillRule={'evenodd'}
				clipRule={'evenodd'}
				d={
					'M4.83146 2.89466C5.07392 2.61757 5.49509 2.5895 5.77218 2.83195L11.1055 7.49862C11.2502 7.62521 11.3332 7.80809 11.3332 8.00033C11.3332 8.19258 11.2502 8.37546 11.1055 8.50205L5.77218 13.1687C5.49509 13.4112 5.07392 13.3831 4.83146 13.106C4.58901 12.8289 4.61709 12.4077 4.89418 12.1653L9.65412 8.00033L4.89418 3.83539C4.61709 3.59293 4.58901 3.17176 4.83146 2.89466Z'
				}
				fill={'currentcolor'}
			/>
		</svg>
	);
}
