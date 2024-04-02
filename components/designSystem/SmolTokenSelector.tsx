import {useCallback, useState} from 'react';
import {useBalancesCurtain} from 'contexts/useBalancesCurtain';
import {useChainID} from '@builtbymom/web3/hooks/useChainID';
import {usePrices} from '@builtbymom/web3/hooks/usePrices';
import {cl} from '@builtbymom/web3/utils';
import {useUpdateEffect} from '@react-hookz/web';

import {SmolTokenButton} from './SmolTokenButton';

import type {TToken} from '@builtbymom/web3/types';

export function SmolTokenSelector({
	onSelectToken,
	token
}: {
	onSelectToken: (token: TToken | undefined) => void;
	token: TToken | undefined;
}): JSX.Element {
	const {safeChainID} = useChainID();
	const [isFocused] = useState<boolean>(false);
	const {onOpenCurtain} = useBalancesCurtain();
	const {data: price} = usePrices({tokens: token ? [token] : [], chainId: safeChainID});

	const getBorderColor = useCallback((): string => {
		if (isFocused) {
			return 'border-neutral-600';
		}

		return 'border-neutral-400';
	}, [isFocused]);

	/* Remove selected token on network change */
	useUpdateEffect(() => {
		onSelectToken(undefined);
	}, [safeChainID]);

	return (
		<div className={'relative size-full'}>
			<div
				className={cl(
					'h-20 z-20 relative border transition-all',
					'flex flex-row items-center cursor-text',
					'focus:placeholder:text-neutral-300 placeholder:transition-colors',
					'p-2 group bg-neutral-0 rounded-[8px]',
					getBorderColor()
				)}>
				<SmolTokenButton
					onClick={() => onOpenCurtain(selected => onSelectToken(selected))}
					token={token}
					price={price && token?.address ? price[token?.address] : undefined}
					displayChevron
				/>
			</div>
		</div>
	);
}
