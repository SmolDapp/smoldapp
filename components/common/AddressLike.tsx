import {type ReactElement} from 'react';
import {useEnsName} from 'wagmi';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {copyToClipboard} from '@yearn-finance/web-lib/utils/helpers';

import type {TAddress} from '@yearn-finance/web-lib/types';

export function AddressLike({address}: {address: TAddress}): ReactElement {
	const {data: ensHandle, isSuccess} = useEnsName({address, chainId: 1});
	const shouldDisplayTooltip = isSuccess && !!ensHandle;

	return (
		<span
			suppressHydrationWarning
			className={cl(shouldDisplayTooltip ? 'tooltip underline decoration-neutral-600/30 decoration-dotted underline-offset-4 transition-opacity hover:decoration-neutral-600' : 'font-number')}>
			{shouldDisplayTooltip ? (
				<span
					suppressHydrationWarning
					onClick={(): void => copyToClipboard(address)}
					className={'tooltipLight top-full cursor-copy pt-1'}>
					<div
						className={'font-number w-fit border border-neutral-300 bg-neutral-0 p-1 px-2 text-center text-xs text-neutral-900'}>
						{address}
					</div>
				</span>
			) : <span />}
			{shouldDisplayTooltip ? ensHandle : address}
		</span>
	);
}
