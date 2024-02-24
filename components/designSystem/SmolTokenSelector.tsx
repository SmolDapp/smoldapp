import {useCallback, useState} from 'react';
import {cl} from '@builtbymom/web3/utils';

import {SmolTokenSelectorButton} from './SmolTokenSelectorButton';

import type {TToken} from '@builtbymom/web3/types';

export function SmolTokenSelector({
	onSelectToken,
	token
}: {
	onSelectToken: (token: TToken) => void;
	token: TToken | undefined;
}): JSX.Element {
	const [isFocused] = useState<boolean>(false);

	const getBorderColor = useCallback((): string => {
		if (isFocused) {
			return 'border-neutral-600';
		}

		return 'border-neutral-400';
	}, [isFocused]);

	return (
		<div className={'relative h-full w-full rounded-lg'}>
			<div
				className={cl(
					'h-20 z-20 relative border transition-all',
					'flex flex-row items-center cursor-text',
					'focus:placeholder:text-neutral-300 placeholder:transition-colors',
					'p-2 group bg-neutral-0 rounded-2xl',
					getBorderColor()
				)}>
				<SmolTokenSelectorButton
					onSelectToken={onSelectToken}
					token={token}
				/>
			</div>
		</div>
	);
}
