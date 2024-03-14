import {useCallback, useState} from 'react';
import {useBalancesCurtain} from 'contexts/useBalancesCurtain';
import {cl} from '@builtbymom/web3/utils';

import {SmolTokenButton} from './SmolTokenButton';

import type {TToken} from '@builtbymom/web3/types';

export function SmolTokenSelector({
	onSelectToken,
	token
}: {
	onSelectToken: (token: TToken) => void;
	token: TToken | undefined;
}): JSX.Element {
	const [isFocused] = useState<boolean>(false);
	const {onOpenCurtain} = useBalancesCurtain();

	const getBorderColor = useCallback((): string => {
		if (isFocused) {
			return 'border-neutral-600';
		}

		return 'border-neutral-400';
	}, [isFocused]);

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
					displayChevron
				/>
			</div>
		</div>
	);
}
