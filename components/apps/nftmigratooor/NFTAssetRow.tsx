import React, {memo} from 'react';
import Link from 'next/link';
import LogoEtherscan from 'components/icons/LogoEtherscan';
import LogoLooksRare from 'components/icons/LogoLooksRare';
import LogoOpensea from 'components/icons/LogoOpensea';
import LogoRarible from 'components/icons/LogoRarible';
import {ETHEREUM_ENS_ADDRESS} from 'utils/constants';
import {useNetwork} from 'wagmi';
import {IconLinkOut} from '@yearn-finance/web-lib/icons/IconLinkOut';
import {toAddress, truncateHex} from '@yearn-finance/web-lib/utils/address';
import {NFTWithFallback} from '@common/NFTWithFallback';

import type {ReactElement} from 'react';
import type {TNFT} from 'utils/types/nftMigratooor';

type TNFTAssetProps = {
	nft: TNFT;
	onSelect: (nft: TNFT) => void;
	isSelected: boolean;
};
function AssetImage(props: {nft: TNFT}): ReactElement {
	const {nft} = props;

	if ((nft.imageURL || '').endsWith('.mov') || ['mov', 'mp4'].includes(nft?.imageType || '')) {
		return (
			<video
				className={'h-full w-full object-cover object-center'}
				src={nft.imageURL || ''}
				width={500}
				height={500}
				controls
			/>
		);
	}
	if (['svg'].includes(nft?.imageType || '') && nft.imageRaw) {
		return (
			<div
				className={'svg-fit flex aspect-square h-full w-full object-cover object-center'}
				dangerouslySetInnerHTML={{__html: nft.imageURL as string}}
			/>
		);
	}

	return (
		<NFTWithFallback
			src={nft.imageURL || ''}
			className={'h-full w-full object-cover'}
			width={500}
			height={500}
			unoptimized
			alt={''}
		/>
	);
}
const NFTAsset = memo(function NFTAsset(props: TNFTAssetProps): ReactElement {
	const {chain} = useNetwork();
	const {nft, onSelect, isSelected} = props;

	return (
		<div
			role={'button'}
			onClick={(): void => onSelect(nft)}
			className={`hover:bg-neutral-50/50 group relative grid w-full grid-cols-1 border-y-0 border-l-2 border-r-0 border-solid border-neutral-200 px-4 py-2 text-left transition-colors md:grid-cols-9 md:px-6 md:pl-16 ${
				isSelected ? 'bg-neutral-50/50 border-primary' : 'border-transparent'
			}`}>
			<div className={'col-span-5 mb-2 flex h-14 flex-row items-center justify-between py-4 md:mb-0 md:py-0'}>
				<div className={'flex flex-row items-center space-x-4 md:space-x-6'}>
					<input
						checked={isSelected}
						onChange={(): void => undefined} //Nothing, the whole button is taking care of the click
						type={'checkbox'}
						value={''}
						className={'checkbox cursor-pointer'}
					/>
					<div className={'flex h-8 min-h-[48px] w-8 min-w-[48px] md:h-10 md:w-10'}>
						<AssetImage {...props} />
						{/* {(nft.imageURL || '').endsWith('.mov') || ['mov', 'mp4'].includes(nft?.imageType || '') ? (
							<video
								className={'h-full w-full object-cover object-center'}
								src={nft.imageURL || ''}
								width={500}
								height={500}
								controls />
						) : (nft.imageURL || '') !== '' ? (
							<Image
								src={nft.imageURL || ''}
								className={'h-full w-full object-cover'}
								width={500}
								height={500}
								unoptimized
								alt={''} />
						) : (nft?.imageRaw) ? (
							<div className={'h-full w-full object-cover'} dangerouslySetInnerHTML={{__html: nft?.imageRaw}} />
						) : <div className={'h-full w-full bg-neutral-300/60 object-cover object-center'} />} */}
					</div>
					<div>
						<div className={'flex flex-row items-center space-x-2'}>
							<b className={'capitalize'}>{nft?.name || nft?.collection?.name}</b>
						</div>
						<Link
							href={`${chain?.blockExplorers?.default?.url || 'https://etherscan.io'}/nft/${
								nft.collection.address
							}/${nft.tokenID}`}
							onClick={(e): void => e.stopPropagation()}
							className={
								'text-neutral-500 flex cursor-pointer flex-row items-center space-x-2 transition-colors hover:text-neutral-900 hover:underline'
							}>
							<p className={'font-mono text-xs'}>{truncateHex(nft.collection.address, 6)}</p>
							<IconLinkOut className={'h-3 w-3'} />
						</Link>
					</div>
				</div>
			</div>

			<div
				className={
					'col-span-4 mb-2 flex h-auto flex-row items-center justify-end py-0 md:mb-0 md:h-14 md:py-4'
				}>
				<div className={'sm:text-md hidden w-full min-w-0 flex-col items-start justify-center text-sm'}>
					<div className={'flex w-full items-center'}>
						<b className={'text-xs font-bold sm:text-sm'}>{'Token ID'}</b>
					</div>
					<p className={'font-mono text-xs'}>
						{toAddress(nft.collection.address) === ETHEREUM_ENS_ADDRESS ? nft?.name : `#${nft?.tokenID}`}
					</p>
				</div>

				<div
					onClick={(e): void => e.stopPropagation()}
					className={'hidden items-center space-x-4 md:flex'}>
					<div>
						<Link
							href={`${chain?.blockExplorers?.default?.url || 'https://etherscan.io'}/nft/${
								nft.collection.address
							}/${nft.tokenID}`}
							className={
								'group flex w-full cursor-alias items-center justify-between text-xs text-neutral-600 hover:text-neutral-900'
							}>
							<legend className={'sr-only'}>{'See on Etherscan'}</legend>
							<LogoEtherscan className={'h-6 w-6 rounded-full border border-neutral-200'} />
						</Link>
					</div>
					{nft.permalink ? (
						<div>
							<Link
								href={nft.permalink || ''}
								className={
									'group flex w-full cursor-alias items-center justify-between text-xs text-neutral-600 hover:text-neutral-900'
								}>
								<legend className={'sr-only'}>{'See on Opensea'}</legend>
								<LogoOpensea className={'h-6 w-6 rounded-full border border-neutral-200'} />
							</Link>
						</div>
					) : null}
					<div>
						<Link
							href={`https://rarible.com/token/${nft.collection.address}:${nft.tokenID}?tab=details`}
							className={
								'group flex w-full cursor-alias items-center justify-between text-xs text-neutral-600 hover:text-neutral-900'
							}>
							<legend className={'sr-only'}>{'See on Rarible'}</legend>
							<LogoRarible className={'h-6 w-6 rounded-full border border-neutral-200'} />
						</Link>
					</div>
					<div>
						<Link
							href={`https://looksrare.org/collections/${nft.collection.address}/${nft.tokenID}`}
							className={
								'group flex w-full cursor-alias items-center justify-between text-xs text-neutral-600 hover:text-neutral-900'
							}>
							<legend className={'sr-only'}>{'See on LooksRare'}</legend>
							<LogoLooksRare className={'h-6 w-6 rounded-full border border-neutral-200'} />
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
});

export default NFTAsset;
