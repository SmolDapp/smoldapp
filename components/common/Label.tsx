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
					<IconInfo className={'text-neutral-500 h-3 w-3 opacity-50'} />
					<span className={'tooltipLight top-full mt-1'}>
						<div className={'font-number bg-neutral-100 w-72 border border-neutral-300 p-1 px-2'}>
							<p className={'text-center text-xs text-neutral-900'}>{tooltipMessage}</p>
						</div>
					</span>
				</span>
			) : null}
		</div>
	);
}
