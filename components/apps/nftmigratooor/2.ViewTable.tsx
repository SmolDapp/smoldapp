import React, {memo, useCallback, useMemo} from 'react';
import {isLensNFT} from 'utils/tools.lens';
import NFTCollection from '@nftmigratooor/NFTCollection';
import {useNFTMigratooor} from '@nftmigratooor/useNFTMigratooor';
import {Button} from '@yearn-finance/web-lib/components/Button';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';

import type {ReactElement} from 'react';
import type {TNFT} from 'utils/types/nftMigratooor';
import type {TDict} from '@yearn-finance/web-lib/types';

const ViewTableOpenSea = memo(function ViewTableOpenSea({onProceed}: {onProceed: VoidFunction}): ReactElement {
	const	{nfts, selected, set_selected} = useNFTMigratooor();

	/**********************************************************************************************
	** Once we have our array of NFT, we need to group them by collection. This is done by
	** creating a dictionary with the collection address as the key and an array of NFTs as the
	** value.
	**********************************************************************************************/
	const	groupedByCollection = useMemo((): TDict<TNFT[]> => (
		(nfts || []).reduce((acc: TDict<TNFT[]>, obj: TNFT): TDict<TNFT[]> => {
			let key = obj.collection.address as string;
			if (isLensNFT(obj.collection.name)) {
				key = 'lens-follower';
			}
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
	const	selectedPerCollection = useMemo((): TDict<TNFT[]> => (
		(nfts || []).reduce((acc: TDict<TNFT[]>, obj: TNFT): TDict<TNFT[]> => {
			let key = obj.collection.address as string;
			if (isLensNFT(obj.collection.name)) {
				key = 'lens-follower';
			}
			if (!acc[key]) {
				acc[key] = [];
			}
			if (selected.find((asset: TNFT): boolean => asset.id === obj.id)) {
				acc[key].push(obj);
			}
			return acc;
		}, {})
	), [nfts, selected]);

	/**********************************************************************************************
	** Callback method for selecting all NFTs in a collection. This will select all if none or
	** some are selected, and deselect all if all are selected.
	**********************************************************************************************/
	const	onSelectAll = useCallback((areAllChecked: boolean, value: TNFT[]): void => {
		if (areAllChecked) {
			set_selected((prev): TNFT[] => {
				const newSelected = [...prev];
				value.forEach((nft: TNFT): void => {
					if (!newSelected.find((asset: TNFT): boolean => asset.id === nft.id)) {
						newSelected.push(nft);
					}
				});
				return newSelected;
			});
		} else {
			set_selected((prev): TNFT[] => {
				const newSelected = [...prev];
				value.forEach((nft: TNFT): void => {
					const index = newSelected.findIndex((asset: TNFT): boolean => asset.id === nft.id);
					if (index !== -1) {
						newSelected.splice(index, 1);
					}
				});
				return newSelected;
			});
		}
	}, [set_selected]);

	/**********************************************************************************************
	** Callback method for selecting one specific NFT. This will select it if it's not selected,
	** and deselect it if it's selected.
	**********************************************************************************************/
	const	onSelectOne = useCallback((nft: TNFT): void => {
		set_selected((prev): TNFT[] => {
			const newSelected = [...prev];
			const index = newSelected.findIndex((asset: TNFT): boolean => asset.id === nft.id);
			if (index !== -1) {
				newSelected.splice(index, 1);
			} else {
				newSelected.push(nft);
			}
			return newSelected;
		});
	}, [set_selected]);

	/**********************************************************************************************
	** Callback method to determine if a specific NFT is selected.
	**********************************************************************************************/
	const isItemSelected = useCallback((nft: TNFT): boolean => (
		selected.find((asset: TNFT): boolean => asset.id === nft.id) !== undefined
	), [selected]);

	/**********************************************************************************************
	** Callback method to determine all the NFTs in a collection are selected.
	**********************************************************************************************/
	const isCollectionSelected = useCallback((key: string, value: TNFT[]): boolean => (
		selectedPerCollection?.[key]?.length === value?.length
	), [selectedPerCollection]);

	return (
		<section>
			<div className={'box-0 relative mb-10 w-full md:mb-0'}>
				<div className={'flex flex-row items-center justify-between p-4 text-neutral-900 md:p-6 md:pb-4'}>
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

				<div className={'grid gap-0 pt-4'}>
					{
						Object.entries(groupedByCollection).map(([key, value]: [string, TNFT[]]): ReactElement => (
							<NFTCollection
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

				<div className={'rounded-0 md:rounded-b-default fixed inset-x-0 bottom-0 z-20 flex w-full max-w-4xl flex-row items-center justify-between border-t border-neutral-200 bg-black p-4 text-neutral-0 md:sticky md:px-6 md:py-4'}>
					<div />
					<div>
						<Button
							variant={'reverted-alt'}
							isDisabled={selected.length === 0}
							onClick={onProceed}>
							{`Migrate ${selected.length} NFT${selected.length <= 1 ? '' : 's'}`}
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
});

export default ViewTableOpenSea;
