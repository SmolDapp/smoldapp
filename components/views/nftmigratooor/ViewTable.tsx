import React, {useMemo, useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import IconCheck from 'components/icons/IconCheck';
import IconChevronBoth from 'components/icons/IconChevronBoth';
import ListHead from 'components/ListHead';
import axios from 'axios';
import useSWR from 'swr';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChain} from '@yearn-finance/web-lib/hooks/useChain';
import IconLinkOut from '@yearn-finance/web-lib/icons/IconLinkOut';
import {toAddress, truncateHex} from '@yearn-finance/web-lib/utils/address';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';

import type {ReactElement} from 'react';
import type {TDict} from '@yearn-finance/web-lib/utils/types';

type TAsset = {
	id: number;
	image_url: string,
	image_preview_url: string,
	name: string,
	description: string,
	token_id: string,
	collection: {
		name: string,
		description: string,
	},
	creator: {
		profile_img_url: string,
	},
	asset_contract: {
		address: string,
		name: string,
		description: string,
	};
}
type TOpenseaResponse = {
	assets: TAsset[];
}
async function baseFetcher(url: string): Promise<TOpenseaResponse> {
	return axios.get(url).then((res): TOpenseaResponse => res.data);
}

function	TokenCol({nft}: {nft: TAsset}): ReactElement {
	const [isSelected, set_isSelected] = useState(false);
	const chain = useChain();

	return (
		<div
			onClick={(): void => set_isSelected(!isSelected)}
			className={`group relative grid w-full grid-cols-1 border-x-2 border-y-0 border-t border-solid border-neutral-200 py-2 px-4 text-left transition-colors hover:bg-neutral-200 md:grid-cols-9 md:border-none md:px-6 ${isSelected ? 'border-transparent bg-neutral-200' : 'border-transparent'}`}>
			<div className={'absolute left-3 top-7 z-10 flex h-full justify-center md:left-6 md:top-0 md:items-center'}>
				<input
					type={'checkbox'}
					checked={isSelected}
					onChange={(): void => set_isSelected(!isSelected)}
					className={'checkbox cursor-pointer'} />
			</div>
			<div className={'col-span-5 mb-2 flex h-14 flex-row items-center justify-between py-4 pl-10 md:mb-0 md:py-0'}>
				<div className={'flex flex-row items-center space-x-4 md:space-x-6'}>
					<div className={'h-8 min-h-[32px] w-8 min-w-[32px] md:flex md:h-10 md:w-10'}>
						{(nft?.image_preview_url || nft?.image_url || nft?.creator?.profile_img_url || '').endsWith('.mov') ? (
							<video
								className={'h-full w-full object-cover object-center'}
								src={nft?.image_preview_url || nft?.image_url || nft?.creator?.profile_img_url || ''}
								width={500}
								height={500}
								controls />
						) : (
							<Image
								src={nft?.image_preview_url || nft?.image_url || nft?.creator?.profile_img_url || ''}
								className={'h-full w-full object-cover'}
								width={500}
								height={500}
								unoptimized
								alt={''} />
						)}
					</div>
					<div>
						<div className={'flex flex-row items-center space-x-2'}>
							<b>{nft?.name || nft?.collection?.name || nft?.asset_contract?.name}</b>
						</div>
						<Link
							href={`${chain.getCurrent()?.block_explorer}/address/${nft.asset_contract.address}`}
							onClick={(e): void => e.stopPropagation()}
							className={'flex cursor-pointer flex-row items-center space-x-2 text-neutral-500 transition-colors hover:text-neutral-900 hover:underline'}>
							<p className={'font-mono text-xs'}>{truncateHex(nft.asset_contract.address, 8)}</p>
							<IconLinkOut className={'h-3 w-3'} />
						</Link>
					</div>
				</div>
			</div>


			<div className={'col-span-4 mb-2 flex h-14 flex-row items-center justify-between py-4 md:mb-0'}>
				<div className={'sm:text-md w-full min-w-0 flex-col items-start justify-center text-sm'}>
					<div className={'flex w-full items-center'}>
						<h1 className={'text-xs font-black sm:text-sm'}>{' Token ID'}</h1>
					</div>
					<span className={'line-clamp-1 max-w-xs overflow-hidden truncate'}>
						{toAddress(nft.asset_contract.address) === toAddress('0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85') ? nft?.name : nft?.token_id}
					</span>
				</div>
				<div
					className={'col-span-1 hidden h-8 w-full flex-col justify-center md:col-span-2 md:flex md:h-14'}
					onClick={(e): void => e.stopPropagation()}>
					<Button
						className={'yearn--button-smaller !w-full'}>
						{'Migrate'}
					</Button>
				</div>
			</div>
		</div>
	);

	return (
		<a href={'/1499398384/2601039123/edit'} className={'w-full min-w-0 text-ellipsis pr-2'}>
			<div className={'h-full w-full min-w-0'}>
				<div className={'flex overflow-hidden'}>
					<div className={'h-20 w-20 flex-none overflow-hidden rounded-l-md bg-gray-200 sm:h-24 sm:w-24'}>
						{(nft?.image_preview_url || nft?.image_url || nft?.creator?.profile_img_url || '').endsWith('.mov') ? (
							<video
								className={'h-full w-full object-cover object-center'}
								src={nft?.image_preview_url || nft?.image_url || nft?.creator?.profile_img_url || ''}
								width={500}
								height={500}
								controls />
						) : (
							<Image
								src={nft?.image_preview_url || nft?.image_url || nft?.creator?.profile_img_url || ''}
								className={'h-full w-full object-cover'}
								width={500}
								height={500}
								unoptimized
								alt={''} />
						)}
					</div>
					<div className={'flex w-1/3 min-w-0 flex-col items-start p-4'}>
						<div className={'flex w-full'}>
							<h1 className={'sm:text-md line-clamp-1 overflow-hidden text-xs font-bold lg:text-lg'}>
								{nft?.name || nft?.collection?.name || nft?.asset_contract?.name}
							</h1>
						</div>
						<Link
							href={`${chain.getCurrent()?.block_explorer}/address/${nft.asset_contract.address}`}
							className={'sm:text-md text-xs hover:underline'}>
							{truncateHex(nft.asset_contract.address, 6)}
						</Link>
					</div>
					<div className={'sm:text-md w-1/3 min-w-0 flex-col items-start justify-center p-4 text-sm sm:flex sm:p-6'}>
						<div className={'flex w-full items-center'}>
							<h1 className={'text-xs font-black sm:text-sm'}>{' Token ID(s) '}</h1>
						</div>
						<span>{' #1'}</span>
					</div>
					<div className={'sm:text-md w-1/3 min-w-0 flex-col items-start justify-center p-4 text-sm sm:flex sm:p-6'}>
						<span className={'font-black'}>{'Single Token'}</span>
					</div>
				</div>
			</div>
		</a>
	);

	return (
		<button
			onClick={(): void => set_isSelected(!isSelected)}
			className={'group relative flex h-full w-full justify-center overflow-hidden transition-colors hover:bg-neutral-100'}>
			<div className={'relative flex h-full w-full flex-row items-center justify-center'}>
				<div className={'mb-0 flex aspect-square h-full w-48 grow items-center justify-center'}>
					<div className={'flex h-full w-full items-center justify-center overflow-hidden'}>
						{(nft?.image_preview_url || nft?.image_url || nft?.creator?.profile_img_url || '').endsWith('.mov') ? (
							<video
								src={nft?.image_preview_url || nft?.image_url || nft?.creator?.profile_img_url || ''}
								width={500}
								height={500}
								controls />
						) : (
							<Image
								src={nft?.image_preview_url || nft?.image_url || nft?.creator?.profile_img_url || ''}
								className={'h-full w-full object-cover'}
								width={500}
								height={500}
								unoptimized
								alt={''} />
						)}

					</div>
				</div>

				<div className={'flex h-full w-full flex-col p-4 md:p-6'}>
					<div className={'mb-4 w-full text-left'}>
						<b className={'text-left text-neutral-900'}>{nft?.name || nft?.collection?.name || nft?.asset_contract?.name}</b>
						{/* <p
							className={'line-clamp-2 text-sm text-neutral-500'}
							dangerouslySetInnerHTML={{'__html': parseMarkdown(nft?.description || nft?.collection?.description || '')}}>
						</p> */}
					</div>

					<div className={'font-number mt-auto grid w-full text-start text-sm'}>
						<div className={`mt-auto border-t border-dashed ${isSelected ? 'border-neutral-300' : 'border-neutral-200'}`}>
							<span className={'flex cursor-pointer flex-row items-center justify-between py-2 px-4 transition-colors md:px-4'}>
								<small className={'text-neutral-500'}>{'ID '}</small>
								<b className={'max-w-sm overflow-hidden truncate text-right'}>
									{nft.token_id}
								</b>
							</span>
						</div>
						<div className={`border-t border-dashed ${isSelected ? 'border-neutral-300' : 'border-neutral-200'}`}>
							<span className={'flex cursor-pointer flex-row items-center justify-between py-2 px-4 transition-colors md:px-4'}>
								<small className={'text-neutral-500'}>{'contract '}</small>
								<b>
									{truncateHex(nft.asset_contract.address, 4)}
								</b>
							</span>
						</div>
						<div className={'text-neutral-0 flex flex-row items-center space-x-4 bg-neutral-900 px-4 py-2'}>
							<IconCheck
								className={`text-neutral-0 h-4 w-4 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
							<b>
								{'Select for Migration'}
							</b>

						</div>
					</div>
				</div>
			</div>
		</button>
	);
}

function	ViewTableOpenSea(): ReactElement {
	const	{address} = useWeb3();
	const	{data} = useSWR(address ? `https://api.opensea.io/api/v1/assets?format=json&owner=${address}&limit=200` : null, baseFetcher);
	const	[sortBy, set_sortBy] = useState<string>('apy');
	const	[sortDirection, set_sortDirection] = useState<'asc' | 'desc'>('desc');
	const	groupedByCollection = useMemo((): TDict<TAsset[]> => (
		(data?.assets || []).reduce((acc: TDict<TAsset[]>, obj: TAsset): TDict<TAsset[]> => {
			const key = toAddress(obj.asset_contract.address);
			if (!acc[key]) {
				acc[key] = [];
			}
			acc[key].push(obj);
			return acc;
		}, {})
	), [data]);

	console.log(groupedByCollection);

	return (
		<div className={'box-0 relative grid w-full grid-cols-12 overflow-hidden'}>
			<div className={'col-span-12 flex flex-col p-4 text-neutral-900 md:p-6 md:pb-4'}>
				<div className={'w-full md:w-3/4'}>
					<b>{'Select the tokens to migrate'}</b>
					<p className={'text-sm text-neutral-500'}>
						{'Select the tokens you want to migrate to another wallet. You can migrate all your tokens at once or select individual tokens.'}
					</p>
				</div>
			</div>

			<div className={'col-span-12 grid gap-0 pt-4'}>
				<ListHead
					sortBy={sortBy}
					sortDirection={sortDirection}
					onSort={(newSortBy, newSortDirection): void => {
						performBatchedUpdates((): void => {
							set_sortBy(newSortBy);
							set_sortDirection(newSortDirection as 'asc' | 'desc');
						});
					}}
					items={[
						{label: 'Token', value: 'name', sortable: true},
						{label: 'Amount', value: 'balance', sortable: false, className: 'col-span-10 md:pl-5', datatype: 'text'},
						{label: '', value: '', sortable: false, className: 'col-span-2'}
					]} />
				{
					Object.entries(groupedByCollection).map(([key, value]: [string, TAsset[]]): ReactElement => (
						<details key={key} className={'detailsMigrate group flex w-full flex-col justify-center border-t border-b-0 border-neutral-200 transition-colors'}>
							<summary className={'flex flex-col items-start py-4'}>
								<div className={'flex w-full flex-row items-center justify-between'}>
									<div className={'text-left text-sm'}>
										<b>{value[0].collection.name}</b>
									</div>
									<div className={'flex flex-row items-center space-x-2'}>
										<small className={'text-xs tabular-nums text-neutral-500'}>
											{value.length > 1 ? `${value.length} tokens` : `${value.length} token`}
										</small>
										<IconChevronBoth className={'h-4 w-4 text-neutral-500 transition-colors group-hover:text-neutral-900'} />
									</div>
								</div>
							</summary>
							{value.map((nft: TAsset): ReactElement => (
								<TokenCol key={nft.id} nft={nft} />
							))}
						</details>
					))
				}
				{/* {data?.assets?.map((nft: TAsset): ReactElement => (
					<div key={nft.id} className={'bg-neutral-0 group mt-0 flex items-center justify-between rounded-md'}>
						<TokenCol nft={nft} />
					</div>
				))} */}
			</div>
		</div>
	);
}

export default ViewTableOpenSea;
