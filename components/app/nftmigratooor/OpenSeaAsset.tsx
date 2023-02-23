import React, {memo} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import LogoEtherscan from 'components/icons/LogoEtherscan';
import LogoLooksRare from 'components/icons/LogoLooksRare';
import LogoOpensea from 'components/icons/LogoOpensea';
import LogoRarible from 'components/icons/LogoRarible';
import {useChain} from '@yearn-finance/web-lib/hooks/useChain';
import IconLinkOut from '@yearn-finance/web-lib/icons/IconLinkOut';
import {toAddress, truncateHex} from '@yearn-finance/web-lib/utils/address';

import type {ReactElement} from 'react';
import type {TOpenSeaAsset} from 'utils/types/opensea';

type TOpenSeaAssetProps = {
	nft: TOpenSeaAsset;
	onSelect: (nft: TOpenSeaAsset) => void;
	isSelected: boolean;
}
const OpenSeaAsset = memo(function OpenSeaAsset(props: TOpenSeaAssetProps): ReactElement {
	const chain = useChain();
	const {nft, onSelect, isSelected} = props;

	return (
		<div
			role={'button'}
			onClick={(): void => onSelect(nft)}
			className={`group relative grid w-full grid-cols-1 border-y-0 border-l-2 border-r-0 border-solid border-neutral-200 py-2 px-4 text-left transition-colors hover:bg-neutral-50/50 md:grid-cols-9 md:px-6 md:pl-16 ${isSelected ? 'border-neutral-900 bg-neutral-50/50' : 'border-transparent'}`}>
			<div className={'col-span-5 mb-2 flex h-14 flex-row items-center justify-between py-4 md:mb-0 md:py-0'}>
				<div className={'flex flex-row items-center space-x-4 md:space-x-6'}>
					<input
						checked={isSelected}
						onChange={(): void => undefined} //Nothing, the whole button is taking care of the click
						type={'checkbox'}
						value={''}
						className={'h-4 w-4 rounded-sm border-neutral-400 text-pink-400 indeterminate:ring-2 focus:ring-2 focus:ring-pink-400 focus:ring-offset-neutral-100'} />
					<div className={'flex h-8 min-h-[48px] w-8 min-w-[48px] md:h-10 md:w-10'}>
						{(nft?.image_preview_url || nft?.image_url || nft?.creator?.profile_img_url || '').endsWith('.mov') ? (
							<video
								className={'h-full w-full object-cover object-center'}
								src={nft?.image_preview_url || nft?.image_url || nft?.creator?.profile_img_url || ''}
								width={500}
								height={500}
								controls />
						) : (nft?.image_preview_url || nft?.image_url || nft?.creator?.profile_img_url || '') !== '' ? (
							<Image
								src={nft?.image_preview_url || nft?.image_url || nft?.creator?.profile_img_url || ''}
								className={'h-full w-full object-cover'}
								width={500}
								height={500}
								unoptimized
								alt={''} />
						) : null}
					</div>
					<div>
						<div className={'flex flex-row items-center space-x-2'}>
							<b className={'capitalize'}>
								{nft?.name || nft?.collection?.name || nft?.asset_contract?.name}
							</b>
						</div>
						<Link
							href={`${chain.getCurrent()?.block_explorer}/nft/${nft.asset_contract.address}/${nft.token_id}`}
							onClick={(e): void => e.stopPropagation()}
							className={'flex cursor-pointer flex-row items-center space-x-2 text-neutral-500 transition-colors hover:text-neutral-900 hover:underline'}>
							<p className={'font-mono text-xs'}>
								{truncateHex(nft.asset_contract.address, 6)}
							</p>
							<IconLinkOut className={'h-3 w-3'} />
						</Link>
					</div>
				</div>
			</div>


			<div className={'col-span-4 mb-2 flex h-auto flex-row items-center justify-end py-0 md:mb-0 md:h-14 md:py-4'}>
				<div className={'sm:text-md hidden w-full min-w-0 flex-col items-start justify-center text-sm'}>
					<div className={'flex w-full items-center'}>
						<b className={'text-xs font-bold sm:text-sm'}>
							{'Token ID'}
						</b>
					</div>
					<p className={'font-mono text-xs'}>
						{toAddress(nft.asset_contract.address) === toAddress('0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85') ? nft?.name : `#${nft?.token_id}`}
					</p>
				</div>

				<div
					onClick={(e): void => e.stopPropagation()}
					className={'hidden items-center space-x-4 md:flex'}>
					<div>
						<Link
							href={`${chain.getCurrent()?.block_explorer}/nft/${nft.asset_contract.address}/${nft.token_id}`}
							className={'group flex w-full cursor-alias items-center justify-between text-xs text-neutral-600 hover:text-neutral-900'}>
							<legend className={'sr-only'}>{'See on Etherscan'}</legend>
							<LogoEtherscan className={'h-6 w-6 rounded-full border border-neutral-200'} />
						</Link>
					</div>
					<div>
						<Link
							href={nft.permalink}
							className={'group flex w-full cursor-alias items-center justify-between text-xs text-neutral-600 hover:text-neutral-900'}>
							<legend className={'sr-only'}>{'See on Opensea'}</legend>
							<LogoOpensea className={'h-6 w-6 rounded-full border border-neutral-200'} />
						</Link>
					</div>
					<div>
						<Link
							href={`https://rarible.com/token/${nft.asset_contract.address}:${nft.token_id}?tab=details`}
							className={'group flex w-full cursor-alias items-center justify-between text-xs text-neutral-600 hover:text-neutral-900'}>
							<legend className={'sr-only'}>{'See on Rarible'}</legend>
							<LogoRarible className={'h-6 w-6 rounded-full border border-neutral-200'} />
						</Link>
					</div>
					<div>
						<Link
							href={`https://looksrare.org/collections/${nft.asset_contract.address}/${nft.token_id}`}
							className={'group flex w-full cursor-alias items-center justify-between text-xs text-neutral-600 hover:text-neutral-900'}>
							<legend className={'sr-only'}>{'See on LooksRare'}</legend>
							<LogoLooksRare className={'h-6 w-6 rounded-full border border-neutral-200'} />
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
});

export default OpenSeaAsset;
