import {useBalancesCurtain} from 'contexts/useBalancesCurtain';
import {cl, isAddress} from '@builtbymom/web3/utils';
import {IconChevron} from '@icons/IconChevron';
import {IconWallet} from '@icons/IconWallet';
import {ImageWithFallback} from '@common/ImageWithFallback';

import type {TToken} from '@builtbymom/web3/types';

export function SmolTokenSelectorButton({
	onSelectToken,
	token
}: {
	onSelectToken: (token: TToken) => void;
	token: TToken | undefined;
}): JSX.Element {
	const {onOpenCurtain} = useBalancesCurtain();

	return (
		<button
			className={cl(
				'flex items-center justify-between gap-4 rounded-[4px] p-4 w-full',
				'bg-neutral-200 hover:bg-neutral-300 transition-colors'
			)}
			onClick={() =>
				onOpenCurtain(token => {
					onSelectToken(token);
				})
			}>
			<div className={'flex w-full max-w-44 items-center gap-2'}>
				<div className={'flex size-8 min-w-8 items-center justify-center rounded-full bg-neutral-0'}>
					{token && isAddress(token.address) ? (
						<ImageWithFallback
							alt={token.symbol}
							unoptimized
							src={
								token?.logoURI ||
								`${process.env.SMOL_ASSETS_URL}/token/${token.chainID}/${token.address}/logo-32.png`
							}
							altSrc={`${process.env.SMOL_ASSETS_URL}/token/${token.chainID}/${token.address}/logo-32.png`}
							quality={90}
							width={32}
							height={32}
						/>
					) : (
						<IconWallet className={'size-4 text-neutral-600'} />
					)}
				</div>
				<p
					className={cl(
						'truncate',
						isAddress(token?.address) ? 'font-bold' : 'text-neutral-600 text-sm font-normal'
					)}>
					{token?.symbol || 'Select token'}
				</p>
			</div>

			<IconChevron className={'size-4 min-w-4 text-neutral-600'} />
		</button>
	);
}
