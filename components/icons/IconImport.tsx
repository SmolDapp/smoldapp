import React from 'react';

import type {ReactElement} from 'react';

function IconImport(props: React.SVGProps<SVGSVGElement>): ReactElement {
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
					'M13.3333 2.00033C13.3333 2.36852 13.0348 2.66699 12.6666 2.66699L3.33325 2.66699C2.96506 2.66699 2.66659 2.36852 2.66659 2.00033C2.66659 1.63214 2.96506 1.33366 3.33325 1.33366L12.6666 1.33366C13.0348 1.33366 13.3333 1.63214 13.3333 2.00033Z'
				}
				fill={'currentColor'}
			/>
			<path
				fillRule={'evenodd'}
				clipRule={'evenodd'}
				d={
					'M11.138 9.1384C10.8776 9.39875 10.4555 9.39875 10.1952 9.1384L7.99992 6.94313L5.80466 9.1384C5.54431 9.39875 5.1222 9.39875 4.86185 9.1384C4.6015 8.87805 4.6015 8.45594 4.86185 8.19559L7.52851 5.52892C7.78886 5.26857 8.21097 5.26857 8.47132 5.52892L11.138 8.19559C11.3983 8.45594 11.3983 8.87805 11.138 9.1384Z'
				}
				fill={'currentColor'}
			/>
			<path
				fillRule={'evenodd'}
				clipRule={'evenodd'}
				d={
					'M7.99992 14.667C7.63173 14.667 7.33325 14.3685 7.33325 14.0003L7.33325 6.00033C7.33325 5.63214 7.63173 5.33366 7.99992 5.33366C8.36811 5.33366 8.66659 5.63214 8.66659 6.00033L8.66659 14.0003C8.66658 14.3685 8.36811 14.667 7.99992 14.667Z'
				}
				fill={'currentColor'}
			/>
		</svg>
	);
}

export default IconImport;
