import React, {Fragment, useCallback, useEffect, useMemo, useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import IconCheck from 'components/icons/IconCheck';
import IconChevronBoth from 'components/icons/IconChevronBoth';
import IconMigrate from 'components/icons/IconMigrate';
import LogoEtherscan from 'components/icons/LogoEtherscan';
import LogoLooksRare from 'components/icons/LogoLooksRare';
import LogoOpensea from 'components/icons/LogoOpensea';
import LogoRarible from 'components/icons/LogoRarible';
import axios from 'axios';
import {Menu, Transition} from '@headlessui/react';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChain} from '@yearn-finance/web-lib/hooks/useChain';
import IconLinkOut from '@yearn-finance/web-lib/icons/IconLinkOut';
import {toAddress, truncateHex} from '@yearn-finance/web-lib/utils/address';

import type {ReactElement} from 'react';
import type {TDict} from '@yearn-finance/web-lib/utils/types';

type TAsset = {
	id: number;
	image_url: string,
	image_preview_url: string,
	name: string,
	description: string,
	token_id: string,
	permalink: string,
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
		schema_name: string,
	};
}
type TOpenseaResponse = {
	assets: TAsset[];
}
async function baseFetcher(url: string): Promise<TOpenseaResponse> {
	return axios.get(url).then((res): TOpenseaResponse => res.data);
}

export type TTokenCol = {
	nft: TAsset;
	onSelect: () => void;
	isSelected: boolean;
}
function	TokenCol({nft, onSelect, isSelected}: TTokenCol): ReactElement {
	const chain = useChain();

	console.log('RERENDER');

	return (
		<div
			onClick={onSelect}
			className={`group relative grid w-full grid-cols-1 border-y-0 border-l-2 border-r-0 border-solid border-neutral-200 py-2 px-4 text-left transition-colors hover:bg-neutral-50/50 md:grid-cols-9 md:px-6 md:pl-16 ${isSelected ? 'border-neutral-900 bg-neutral-50/50' : 'border-transparent'}`}>
			<div className={'col-span-5 mb-2 flex h-14 flex-row items-center justify-between py-4 md:mb-0 md:py-0'}>
				<div className={'flex flex-row items-center space-x-4 md:space-x-6'}>
					<input
						checked={isSelected}
						onChange={onSelect}
						type={'checkbox'}
						value={''}
						className={'h-4 w-4 rounded-sm border-neutral-400 text-pink-400 indeterminate:ring-2 focus:ring-2 focus:ring-pink-400 focus:ring-offset-neutral-100'}
					/>
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
								{/* {toAddress(nft.asset_contract.address) === toAddress('0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85') ? nft?.name : nft?.token_id} */}
							</p>
							<IconLinkOut className={'h-3 w-3'} />
						</Link>
					</div>
				</div>
			</div>


			<div className={'col-span-4 mb-2 flex h-14 flex-row items-center justify-end py-4 md:mb-0'}>
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
					className={'flex items-center space-x-4'}>
					<div>
						<Link
							href={`${chain.getCurrent()?.block_explorer}/nft/${nft.asset_contract.address}/${nft.token_id}`}
							className={'group flex w-full items-center justify-between text-xs text-neutral-600 hover:text-neutral-900'}>
							<legend className={'sr-only'}>{'See on Etherscan'}</legend>
							<LogoEtherscan className={'h-6 w-6 rounded-full border border-neutral-200'} />
						</Link>
					</div>
					<div>
						<Link
							href={nft.permalink}
							className={'group flex w-full items-center justify-between text-xs text-neutral-600 hover:text-neutral-900'}>
							<legend className={'sr-only'}>{'See on Opensea'}</legend>
							<LogoOpensea className={'h-6 w-6 rounded-full border border-neutral-200'} />
						</Link>
					</div>
					<div>
						<Link
							href={`https://rarible.com/token/${nft.asset_contract.address}:${nft.token_id}?tab=details`}
							className={'group flex w-full items-center justify-between text-xs text-neutral-600 hover:text-neutral-900'}>
							<legend className={'sr-only'}>{'See on Rarible'}</legend>
							<LogoRarible className={'h-6 w-6 rounded-full border border-neutral-200'} />
						</Link>
					</div>
					<div>
						<Link
							href={`https://looksrare.org/collections/${nft.asset_contract.address}/${nft.token_id}`}
							className={'group flex w-full items-center justify-between text-xs text-neutral-600 hover:text-neutral-900'}>
							<legend className={'sr-only'}>{'See on LooksRare'}</legend>
							<LogoLooksRare className={'h-6 w-6 rounded-full border border-neutral-200'} />
						</Link>
					</div>
					<Menu
						as={'div'}
						className={'relative inline-block text-left'}
						onClick={(e: React.MouseEvent<HTMLDivElement>): void => e.stopPropagation()}>
						<div>
							<Menu.Button className={'flex items-center rounded-full border border-neutral-200 bg-neutral-100/50 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none'}>
								<svg
									xmlns={'http://www.w3.org/2000/svg'}
									viewBox={'0 0 20 20'}
									fill={'currentColor'}
									aria-hidden={'true'}
									className={'h-6 w-6 p-1'}>
									<path d={'M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z'} />
								</svg>
							</Menu.Button>
						</div>
						<Transition
							as={Fragment}
							enter={'transition ease-out duration-100'}
							enterFrom={'transform opacity-0 scale-95'}
							enterTo={'transform opacity-100 scale-100'}
							leave={'transition ease-in duration-75'}
							leaveFrom={'transform opacity-100 scale-100'}
							leaveTo={'transform opacity-0 scale-95'}>
							<Menu.Items className={'rounded-default absolute right-0 z-50 mt-2 w-56 origin-top-right divide-y divide-neutral-200 border border-neutral-200 bg-neutral-0 shadow-lg focus:outline-none'}>
								<Menu.Item>
									{({active: isActive}): ReactElement => (
										<button
											className={`${isActive ? 'text-neutral-900' : 'text-neutral-600'} group flex w-full items-center justify-between px-4 py-3 text-xs`}>
											{'Migrate this NFT'}
											<IconMigrate className={'ml-2 h-4 w-4 text-neutral-900'} />
										</button>
									)}
								</Menu.Item>
								<div className={'hidden'}>
									<Menu.Item>
										{({active: isActive}): ReactElement => (
											<Link
												href={`${chain.getCurrent()?.block_explorer}/nft/${nft.asset_contract.address}/${nft.token_id}`}
												className={`${isActive ? 'text-neutral-900' : 'text-neutral-600'} group flex w-full items-center justify-between px-4 py-2 text-xs`}>
												{'See on Etherscan'}
												<LogoEtherscan className={'ml-2 h-4 w-4'} />
											</Link>
										)}
									</Menu.Item>
									<Menu.Item>
										{({active: isActive}): ReactElement => (
											<Link
												href={nft.permalink}
												className={`${isActive ? 'text-neutral-900' : 'text-neutral-600'} group flex w-full items-center justify-between px-4 py-2 text-xs`}>
												{'See on Opensea'}
												<LogoOpensea className={'ml-2 h-4 w-4'} />
											</Link>
										)}
									</Menu.Item>
									<Menu.Item>
										{({active: isActive}): ReactElement => (
											<Link
												href={`https://rarible.com/token/${nft.asset_contract.address}:${nft.token_id}?tab=details`}
												className={`${isActive ? 'text-neutral-900' : 'text-neutral-600'} group flex w-full items-center justify-between px-4 py-2 text-xs`}>
												{'See on Rarible'}
												<LogoRarible className={'ml-2 h-4 w-4'} />
											</Link>
										)}
									</Menu.Item>
									<Menu.Item>
										{({active: isActive}): ReactElement => (
											<Link
												href={`https://looksrare.org/collections/${nft.asset_contract.address}/${nft.token_id}`}
												className={`${isActive ? 'text-neutral-900' : 'text-neutral-600'} group flex w-full items-center justify-between px-4 py-2 text-xs`}>
												{'See on LooksRare'}
												<LogoLooksRare className={'ml-2 h-4 w-4'} />
											</Link>
										)}
									</Menu.Item>
								</div>
							</Menu.Items>
						</Transition>
					</Menu>
				</div>
			</div>
		</div>
	);

	return (
		<a href={'/1499398384/2601039123/edit'} className={'w-full min-w-0 text-ellipsis pr-2'}>
			<div className={'h-full w-full min-w-0'}>
				<div className={'flex overflow-hidden'}>
					<div className={'bg-gray-200 h-20 w-20 flex-none overflow-hidden rounded-l-md sm:h-24 sm:w-24'}>
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
							<h1 className={'sm:text-md overflow-hidden text-xs font-bold line-clamp-1 lg:text-lg'}>
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
						<div className={'flex flex-row items-center space-x-4 bg-neutral-900 px-4 py-2 text-neutral-0'}>
							<IconCheck
								className={`h-4 w-4 text-neutral-0 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
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

type TTokenKey = string;
function getTokenKey(token: TAsset): TTokenKey {
	return `${toAddress(token.asset_contract.address)}-${token.token_id}`;
}

function	SectionCollection({
	onSelectAll,
	onSelectOne,
	collectionName,
	collectionItems,
	isCollectionSelected,
	isSelected
}): ReactElement {
	const	items = useMemo((): ReactElement[] => (
		collectionItems.map((item: TAsset): ReactElement => {
			const	isTokenSelected = isSelected(item);
			return (
				<TokenCol
					key={item.id}
					nft={item}
					onSelect={(): void => onSelectOne(item)}
					isSelected={isTokenSelected} />
			);
		})
	), [collectionItems, isSelected, onSelectOne]);


	return (
		<details
			open
			className={'detailsMigrate group'}>
			<summary className={`flex flex-col items-start border-y border-l-2 border-b-neutral-200 bg-neutral-100 py-4 transition-colors ${isCollectionSelected ? 'border-l-neutral-900 border-t-transparent' : 'border-transparent'}`}>
				<div className={'flex w-full flex-row items-center justify-between'}>
					<div className={'flex flex-row items-center space-x-4 md:space-x-6'}>
						<div className={'mr-4 flex items-center'}>
							<input
								checked={isCollectionSelected}
								type={'checkbox'}
								onChange={(): void => onSelectAll(!isCollectionSelected, collectionItems)}
								value={''}
								className={'h-4 w-4 rounded-sm border-neutral-400 text-pink-400 indeterminate:ring-2 focus:ring-2 focus:ring-pink-400 focus:ring-offset-neutral-100'}
							/>
						</div>
						<div className={'text-left text-sm'}>
							<b className={'capitalize'}>
								{collectionName}
							</b>
						</div>
					</div>

					<div className={'groupHoverText relative flex flex-row items-center space-x-2 text-xs tabular-nums text-neutral-500'}>
						<IconChevronBoth className={'h-6 w-6 text-neutral-400 transition-colors group-hover:text-neutral-900'} />
					</div>
				</div>
			</summary>
			{items}
		</details>
	);
}

function	ViewTableOpenSea(): ReactElement {
	const	{address} = useWeb3();
	const	[selected, set_selected] = useState<TTokenKey[]>([]);
	const	[data, set_data] = useState(undefined);

	const	fetchAll = useCallback(async (url: string, next?: string): Promise<TAsset[]> => {
		const	res = await axios.get(`${url}${next ? `&cursor=${next}` : ''}`);
		const	{assets} = res.data;
		if (res.data.next) {
			return assets.concat(await fetchAll(url, res.data.next));
		}
		return assets;
	}, []);

	useEffect((): void => {
		if (address) {
			fetchAll(`https://api.opensea.io/api/v1/assets?format=json&owner=${address}&limit=200`)
				.then((res) => {
					set_data(res);
				});
		}
	}, [address]);


	console.log(data);

	// const	{data} = useSWR(address ? `https://api.opensea.io/api/v1/assets?format=json&owner=${address}&limit=200${nextCursor ? `&cursor=${nextCursor}` : ''}` : null, baseFetcher);



	const	groupedByCollection = useMemo((): TDict<TAsset[]> => (
		(data || []).reduce((acc: TDict<TAsset[]>, obj: TAsset): TDict<TAsset[]> => {
			const key = toAddress(obj.asset_contract.address);
			if (!acc[key]) {
				acc[key] = [];
			}
			acc[key].push(obj);
			return acc;
		}, {})
	), [data]);

	const	selectedPerCollection = useMemo((): TDict<TAsset[]> => (
		(data || []).reduce((acc: TDict<TAsset[]>, obj: TAsset): TDict<TAsset[]> => {
			const key = toAddress(obj.asset_contract.address);
			if (!acc[key]) {
				acc[key] = [];
			}
			if (selected.includes(getTokenKey(obj))) {
				acc[key].push(obj);
			}
			return acc;
		}, {})
	), [data, selected]);

	function onSelectAll(areAllChecked: boolean, value: TAsset[]): void {
		if (areAllChecked) {
			set_selected((prev): TTokenKey[] => {
				const newSelected = [...prev];
				value.forEach((nft: TAsset): void => {
					const tokenKey = getTokenKey(nft);
					if (!newSelected.includes(tokenKey)) {
						newSelected.push(tokenKey);
					}
				});
				return newSelected;
			});
		} else {
			set_selected((prev): TTokenKey[] => {
				const newSelected = [...prev];
				value.forEach((nft: TAsset): void => {
					const tokenKey = getTokenKey(nft);
					if (newSelected.includes(tokenKey)) {
						newSelected.splice(newSelected.indexOf(tokenKey), 1);
					}
				});
				return newSelected;
			});
		}
	}
	function onSelectOne(nft: TAsset): void {
		const key = getTokenKey(nft);
		if (selected.includes(key)) {
			set_selected(selected.filter((item: TTokenKey): boolean => item !== key));
		} else {
			set_selected([...selected, key]);
		}
	}
	const isOneSelected = (nft: TAsset): boolean => selected.includes(getTokenKey(nft));

	const	collections = useMemo((): ReactElement[] => (
		Object.entries(groupedByCollection).map(([key, value]: [string, TAsset[]]): ReactElement => (
			<SectionCollection
				key={key}
				isCollectionSelected={selectedPerCollection?.[key]?.length === value?.length}
				collectionName={value[0].collection.name}
				collectionItems={value}
				onSelectAll={onSelectAll}
				onSelectOne={onSelectOne}
				isSelected={(nft: TAsset): boolean => isOneSelected(nft)} />
		))
	), [groupedByCollection, selectedPerCollection]);

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
				{collections}
			</div>
		</div>
	);
}

export default ViewTableOpenSea;
