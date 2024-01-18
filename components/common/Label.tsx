import IconInfo from '@icons/IconInfo';

import type {ReactElement} from 'react';

type TLabelProps = {
	title: string;
	tooltipMessage?: string;
};
export function Label({title, tooltipMessage}: TLabelProps): ReactElement {
	return (
		<div className={'flex items-center gap-1 pb-1'}>
			<small>{title}</small>
			{tooltipMessage ? (
				<span className={'tooltip'}>
					<IconInfo className={'h-3 w-3 text-neutral-500 opacity-50'} />
					<span className={'tooltipLight top-full mt-1'}>
						<div className={'font-number w-72 border border-neutral-300 bg-neutral-100 p-1 px-2'}>
							<p className={'text-center text-xs text-neutral-900'}>{tooltipMessage}</p>
						</div>
					</span>
				</span>
			) : null}
		</div>
	);
}
