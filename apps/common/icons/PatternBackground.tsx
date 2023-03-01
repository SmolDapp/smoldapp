import React from 'react';

import type {ReactElement} from 'react';

function	PatternBackground(props: React.SVGProps<SVGSVGElement>): ReactElement {
	return (
		<svg
			{...props}
			className={'patternSVG'}
			aria-hidden={'true'}>
			<defs>
				<pattern
					id={'983e3e4c-de6d-4c3f-8d64-b9761d1534cc'}
					width={200}
					height={200}
					x={'50%'}
					y={-1}
					patternUnits={'userSpaceOnUse'}>
					<path d={'M.5 200V.5H200'} fill={'none'} />
				</pattern>
			</defs>
			<svg
				x={'50%'}
				y={-1}
				className={'patternSVGSquares'}>
				<path
					d={'M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z'}
					strokeWidth={0} />
			</svg>
			<rect
				width={'100%'}
				height={'100%'}
				strokeWidth={0}
				fill={'url(#983e3e4c-de6d-4c3f-8d64-b9761d1534cc)'} />
		</svg>
	);
}

export default PatternBackground;
