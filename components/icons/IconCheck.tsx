import type {ReactElement} from 'react';

// TODO: dedupe with IconCircleCheck
export function IconCheck(props: React.SVGProps<SVGSVGElement>): ReactElement {
	return (
		<svg
			{...props}
			width={'24'}
			height={'24'}
			viewBox={'0 0 24 24'}
			fill={'none'}
			xmlns={'http://www.w3.org/2000/svg'}>
			<path
				fillRule={'evenodd'}
				clipRule={'evenodd'}
				d={
					'M20.6403 5.2318C21.0646 5.58537 21.1219 6.21593 20.7683 6.64021L10.7683 18.6402C10.4412 19.0328 9.87062 19.1156 9.44541 18.8321L3.44541 14.8321C2.98588 14.5257 2.8617 13.9049 3.16806 13.4453C3.47441 12.9858 4.09528 12.8616 4.55481 13.168L9.80714 16.6695L19.2319 5.35984C19.5854 4.93556 20.216 4.87824 20.6403 5.2318Z'
				}
				fill={'currentColor'}
			/>
		</svg>
	);
}
