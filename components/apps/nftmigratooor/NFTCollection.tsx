import React, {memo, useMemo} from 'react';
import IconChevronBoth from 'components/icons/IconChevronBoth';
import lensProtocol from 'utils/lens.tools';
import OpenSeaAsset from '@nftmigratooor/NFTAssetRow';

import type {ReactElement} from 'react';
import type {TNFT} from 'utils/types/nftMigratooor';

type TNFTCollectionProps = {
	onSelectAll: (areAllChecked: boolean, value: TNFT[]) => void;
	onSelectOne: (item: TNFT) => void;
	collectionName: string;
	collectionItems: TNFT[];
	isCollectionSelected: boolean;
	isItemSelected: (item: TNFT) => boolean;
}
const NFTCollection = memo(function NFTCollection(props: TNFTCollectionProps): ReactElement {
	const {onSelectAll, collectionName, collectionItems, isCollectionSelected, isItemSelected, onSelectOne} = props;
	const items = useMemo((): ReactElement[] => (
		collectionItems.map((item: TNFT): ReactElement => {
			const isTokenSelected = isItemSelected(item);
			return (
				<OpenSeaAsset
					key={item.id}
					nft={item}
					onSelect={onSelectOne}
					isSelected={isTokenSelected} />
			);
		})
	), [collectionItems, isItemSelected, onSelectOne]);

	return (
		<details
			open
			className={'detailsMigrate group'}>
			<summary className={`flex flex-col items-start border-y border-l-2 border-b-neutral-200 bg-neutral-100 py-4 transition-colors ${isCollectionSelected ? 'border-l-neutral-900 border-t-transparent' : 'border-transparent'}`}>
				<div className={'flex w-full flex-row items-start justify-between md:items-center'}>
					<div className={'flex w-3/4 flex-row items-center space-x-0 md:w-auto md:space-x-6'}>
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
								{lensProtocol.isLensNFT(collectionName) ? 'Lens' : collectionName}
							</b>
						</div>
					</div>

					<div className={'groupHoverText relative flex flex-row items-center space-x-2 text-xs tabular-nums text-neutral-500'}>
						<small className={'text-xxs tabular-nums text-neutral-500'}>
							{collectionItems.length > 1 ? `${collectionItems.length} tokens` : `${collectionItems.length} token`}
						</small>
						<IconChevronBoth className={'h-6 w-6 text-neutral-400 transition-colors group-hover:text-neutral-900'} />
					</div>
				</div>
			</summary>
			{items}
		</details>
	);
});

export default NFTCollection;
