import {cl, formatAmount, isAddress, truncateHex} from '@builtbymom/web3/utils';
import {IconChevron} from '@icons/IconChevron';
import {IconWallet} from '@icons/IconWallet';
import {ImageWithFallback} from '@common/ImageWithFallback';

import type {ReactElement} from 'react';
import type {TToken} from '@builtbymom/web3/types';

export function SmolTokenButton({
	token,
	isDisabled = false,
	displayChevron = false,
	onClick
}: {
	token: TToken | undefined;
	isDisabled?: boolean;
	displayChevron?: boolean;
	onClick: () => void;
}): ReactElement {
	return (
		<button
			onClick={onClick}
			className={cl(
				'flex flex-row gap-2 items-center justify-between rounded-[4px] p-4 w-full h-full',
				'bg-neutral-200 hover:bg-neutral-300 transition-colors',
				'disabled:cursor-not-allowed disabled:hover:bg-neutral-200 disabled:opacity-20'
			)}
			disabled={isDisabled}>
			<div className={'flex justify-between items-center w-full'}>
				<div className={'flex items-center gap-2'}>
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
						<div className={'flex size-8 items-center justify-center rounded-full bg-neutral-0'}>
							<IconWallet className={'size-4 text-neutral-600'} />
						</div>
					)}

					<div className={'text-left'}>
						<p
							className={cl(
								'truncate',
								isAddress(token?.address) ? 'font-bold' : 'text-neutral-600 text-sm font-normal'
							)}>
							{token?.symbol || 'Select token'}
						</p>
						{!!token?.address && (
							<p className={'text-xs text-neutral-600'}>{truncateHex(token.address, 5)}</p>
						)}
					</div>
				</div>
				{token && (
					<div className={'text-right'}>
						<b className={'text-left text-base'}>{formatAmount(token.balance.normalized, 0, 6)}</b>
						<p className={'text-xs text-neutral-600'}>{'$420.69'}</p>
					</div>
				)}
			</div>
			{displayChevron && <IconChevron className={'size-4 min-w-4 text-neutral-600'} />}
		</button>
	);
}
