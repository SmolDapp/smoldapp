import React from 'react';

import type {ReactElement} from 'react';

export function IconDownload(props: React.SVGProps<SVGSVGElement>): ReactElement {
	return (
		<svg
			{...props}
			width={'8'}
			height={'10'}
			viewBox={'0 0 8 10'}
			fill={'none'}
			xmlns={'http://www.w3.org/2000/svg'}>
			<path
				fillRule={'evenodd'}
				clipRule={'evenodd'}
				d={
					'M0 9.5C0 9.22386 0.223858 9 0.5 9H7.5C7.77614 9 8 9.22386 8 9.5C8 9.77614 7.77614 10 7.5 10H0.5C0.223858 10 0 9.77614 0 9.5Z'
				}
				fill={'currentcolor'}
			/>
			<path
				fillRule={'evenodd'}
				clipRule={'evenodd'}
				d={
					'M1.64645 4.14645C1.84171 3.95118 2.15829 3.95118 2.35355 4.14645L4 5.79289L5.64645 4.14645C5.84171 3.95118 6.15829 3.95118 6.35355 4.14645C6.54882 4.34171 6.54882 4.65829 6.35355 4.85355L4.35355 6.85355C4.15829 7.04882 3.84171 7.04882 3.64645 6.85355L1.64645 4.85355C1.45118 4.65829 1.45118 4.34171 1.64645 4.14645Z'
				}
				fill={'currentcolor'}
			/>
			<path
				fillRule={'evenodd'}
				clipRule={'evenodd'}
				d={
					'M4 0C4.27614 0 4.5 0.223858 4.5 0.5V6.5C4.5 6.77614 4.27614 7 4 7C3.72386 7 3.5 6.77614 3.5 6.5V0.5C3.5 0.223858 3.72386 0 4 0Z'
				}
				fill={'currentcolor'}
			/>
		</svg>
	);
}
