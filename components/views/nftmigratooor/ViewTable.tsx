import React, {memo, useCallback, useMemo} from 'react';
import Collection from 'components/app/nftmigratooor/OpenSeaCollection';
import {useNFTMigratooor} from 'contexts/useNFTMigratooor';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';

import type {ReactElement} from 'react';
import type {TOpenSeaAsset} from 'utils/types/opensea';
import type {TDict} from '@yearn-finance/web-lib/utils/types';

const ViewTableOpenSea = memo(function ViewTableOpenSea({onProceed}: {onProceed: VoidFunction}): ReactElement {
	const	{nfts, selected, set_selected} = useNFTMigratooor();

	/**********************************************************************************************
	** Once we have our array of NFT, we need to group them by collection. This is done by
	** creating a dictionary with the collection address as the key and an array of NFTs as the
	** value.
	**********************************************************************************************/
	const	groupedByCollection = useMemo((): TDict<TOpenSeaAsset[]> => (
		(nfts || []).reduce((acc: TDict<TOpenSeaAsset[]>, obj: TOpenSeaAsset): TDict<TOpenSeaAsset[]> => {
			const key = toAddress(obj.asset_contract.address);
			if (!acc[key]) {
				acc[key] = [];
			}
			acc[key].push(obj);
			return acc;
		}, {})
	), [nfts]);

	/**********************************************************************************************
	** Once we have our dictionary of NFTs grouped by collection, we need to create a dictionary
	** with the collection address as the key and an array of NFTs that are selected as the value.
	** This is used to determine which NFTs in a collection are selected.
	**********************************************************************************************/
	const	selectedPerCollection = useMemo((): TDict<TOpenSeaAsset[]> => (
		(nfts || []).reduce((acc: TDict<TOpenSeaAsset[]>, obj: TOpenSeaAsset): TDict<TOpenSeaAsset[]> => {
			const key = toAddress(obj.asset_contract.address);
			if (!acc[key]) {
				acc[key] = [];
			}
			if (selected.find((asset: TOpenSeaAsset): boolean => asset.id === obj.id)) {
				acc[key].push(obj);
			}
			return acc;
		}, {})
	), [nfts, selected]);

	/**********************************************************************************************
	** Callback method for selecting all NFTs in a collection. This will select all if none or
	** some are selected, and deselect all if all are selected.
	**********************************************************************************************/
	const	onSelectAll = useCallback((areAllChecked: boolean, value: TOpenSeaAsset[]): void => {
		if (areAllChecked) {
			set_selected((prev): TOpenSeaAsset[] => {
				const newSelected = [...prev];
				value.forEach((nft: TOpenSeaAsset): void => {
					if (!newSelected.find((asset: TOpenSeaAsset): boolean => asset.id === nft.id)) {
						newSelected.push(nft);
					}
				});
				return newSelected;
			});
		} else {
			set_selected((prev): TOpenSeaAsset[] => {
				const newSelected = [...prev];
				value.forEach((nft: TOpenSeaAsset): void => {
					const index = newSelected.findIndex((asset: TOpenSeaAsset): boolean => asset.id === nft.id);
					if (index !== -1) {
						newSelected.splice(index, 1);
					}
				});
				return newSelected;
			});
		}
	}, []);

	/**********************************************************************************************
	** Callback method for selecting one specific NFT. This will select it if it's not selected,
	** and deselect it if it's selected.
	**********************************************************************************************/
	const	onSelectOne = useCallback((nft: TOpenSeaAsset): void => {
		set_selected((prev): TOpenSeaAsset[] => {
			const newSelected = [...prev];
			const index = newSelected.findIndex((asset: TOpenSeaAsset): boolean => asset.id === nft.id);
			if (index !== -1) {
				newSelected.splice(index, 1);
			} else {
				newSelected.push(nft);
			}
			return newSelected;
		});
	}, []);

	/**********************************************************************************************
	** Callback method to determine if a specific NFT is selected.
	**********************************************************************************************/
	const isItemSelected = useCallback((nft: TOpenSeaAsset): boolean => (
		selected.find((asset: TOpenSeaAsset): boolean => asset.id === nft.id) !== undefined
	), [selected]);

	/**********************************************************************************************
	** Callback method to determine all the NFTs in a collection are selected.
	**********************************************************************************************/
	const isCollectionSelected = useCallback((key: string, value: TOpenSeaAsset[]): boolean => (
		selectedPerCollection?.[key]?.length === value?.length
	), [selectedPerCollection]);

	return (
		<section className={'pt-10'}>
			<div id={'selector'} className={'box-0 relative grid w-full grid-cols-12 overflow-hidden'}>
				<div className={'col-span-12 flex flex-row items-center justify-between p-4 text-neutral-900 md:p-6 md:pb-4'}>
					<div className={'w-full md:w-3/4'}>
						<b>{'Select the NFTs to migrate'}</b>
						<p className={'text-sm text-neutral-500'}>
							{'Select the NFTs you want to migrate to another wallet. Once you are ready, you will be asked to approve some collections and to directly transfer some NFTs.'}
						</p>
					</div>
					<div>
						<Button
							onClick={(): void => {
								performBatchedUpdates((): void => {
									set_selected(nfts);
									onProceed();
								});
							}}
							className={'yearn--button-smaller !w-full'}>
							{'Select all'}
						</Button>
					</div>
				</div>

				<div className={'col-span-12 grid gap-0 pt-4'}>
					{
						Object.entries(groupedByCollection).map(([key, value]: [string, TOpenSeaAsset[]]): ReactElement => (
							<Collection
								key={key}
								isCollectionSelected={isCollectionSelected(key, value)}
								isItemSelected={isItemSelected}
								collectionName={value[0].collection.name}
								collectionItems={value}
								onSelectAll={onSelectAll}
								onSelectOne={onSelectOne} />
						))
					}
				</div>
				<div className={'fixed inset-x-0 bottom-0 z-20 col-span-12 flex w-full max-w-4xl flex-row items-center justify-between bg-neutral-900 p-4 text-neutral-0 dark:bg-neutral-100 md:relative md:px-6 md:py-4'}>
					<div className={'flex flex-col'} />
					<div>
						<Button
							className={'yearn--button-smaller !w-fit !text-sm'}
							isDisabled={selected.length === 0}
							onClick={onProceed}>
							{'Migrate selected'}
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
});

export default ViewTableOpenSea;
