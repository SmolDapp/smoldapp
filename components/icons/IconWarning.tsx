import React from 'react';

import type {ReactElement} from 'react';

function IconWarning(props: React.SVGProps<SVGSVGElement>): ReactElement {
	return (
		<svg
			{...props}
			viewBox={'0 0 512 512'}
			fill={'none'}
			xmlns={'http://www.w3.org/2000/svg'}>
			<path
				d={
					'M256 512c141.4 0 256-114.6 256-256S397.4 0 256 0S0 114.6 0 256S114.6 512 256 512zm24-384v24V264v24H232V264 152 128h48zM232 368V320h48v48H232z'
				}
				fill={'currentcolor'}
			/>
		</svg>
	);
}

export default IconWarning;
