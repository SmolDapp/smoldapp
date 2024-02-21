import {useBalancesCurtain} from 'contexts/useBalancesCurtain';
import {cl} from '@builtbymom/web3/utils';
import {IconChevron} from '@icons/IconChevron';
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
		<>
			<button
				className={cl(
					'flex items-center justify-between gap-4 rounded-lg p-4 w-full',
					'bg-neutral-200 hover:bg-neutral-300 transition-colors'
				)}
				onClick={() =>
					onOpenCurtain(token => {
						onSelectToken(token);
					})
				}>
				<div className={'flex w-full max-w-[116px] items-center gap-2'}>
					<ImageWithFallback
						alt={token?.symbol || ''}
						unoptimized
						src={
							token?.logoURI ||
							`${process.env.SMOL_ASSETS_URL}/token/${token?.chainID}/${token?.address}/logo-32.png`
						}
						altSrc={`${process.env.SMOL_ASSETS_URL}/token/${token?.chainID}/${token?.address}/logo-32.png`}
						quality={90}
						width={32}
						height={32}
					/>
					<p className={cl('truncate font-bold ', token?.symbol ? '' : 'text-neutral-600')}>
						{token?.symbol || 'Select'}
					</p>
				</div>

				<IconChevron className={'h-4 w-4 text-neutral-600'} />
			</button>
		</>
	);
}
