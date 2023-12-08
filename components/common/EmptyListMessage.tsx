import type {ReactElement, ReactNode} from 'react';

export function EmptyListMessage({children}: {children: ReactNode}): ReactElement {
	return (
		<div className={'col-span-12 flex min-h-[200px] flex-col items-center justify-center'}>
			<svg
				className={'h-4 w-4 text-neutral-400'}
				xmlns={'http://www.w3.org/2000/svg'}
				viewBox={'0 0 512 512'}>
				<path
					d={
						'M505 41c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0L396.5 81.5C358.1 50.6 309.2 32 256 32C132.3 32 32 132.3 32 256c0 53.2 18.6 102.1 49.5 140.5L7 471c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l74.5-74.5c38.4 31 87.3 49.5 140.5 49.5c123.7 0 224-100.3 224-224c0-53.2-18.6-102.1-49.5-140.5L505 41zM362.3 115.7L115.7 362.3C93.3 332.8 80 295.9 80 256c0-97.2 78.8-176 176-176c39.9 0 76.8 13.3 106.3 35.7zM149.7 396.3L396.3 149.7C418.7 179.2 432 216.1 432 256c0 97.2-78.8 176-176 176c-39.9 0-76.8-13.3-106.3-35.7z'
					}
					fill={'currentcolor'}
				/>
			</svg>
			<p className={'mt-6 text-center text-sm text-neutral-500'}>{children}</p>
		</div>
	);
}
