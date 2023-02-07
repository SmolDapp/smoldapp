import {useEffect, useRef, useState} from 'react';
import SmallButton from 'components/common/SmallButton';
import IconCheck from 'components/icons/IconCheck';
import {ImageWithFallback} from 'components/ImageWithFallback';
import {useWallet} from 'contexts/useWallet';
import TOKEN_LISTS from 'utils/tokenLists';
import axios from 'axios';
import {useThrottledCallback} from '@react-hookz/web';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';

import type {ReactElement} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/utils/address';
import type {TDict} from '@yearn-finance/web-lib/utils/types';

type TTokenList = {
	name: string;
	tokens: TTokenInfo[];
}

type TTokenInfo = {
	chainId: number,
	address: TAddress,
	name: string,
	symbol: string,
	decimals: number,
	logoURI: string,
};

function TokenListsSelector(): ReactElement {
	const {refreshWithList} = useWallet();
	const [isRefreshing, set_isRefreshing] = useState<TDict<boolean>>({});
	const tokenListRef = useRef<TDict<TTokenList>>({});
	const tokenListFetchedRef = useRef<TDict<boolean>>({});
	const tokenListTokensRef = useRef<TDict<TTokenInfo>>({});
	const [selected, set_selected] = useState([TOKEN_LISTS[0], TOKEN_LISTS[1]]);

	const	fetchTokenListData = useThrottledCallback(async (): Promise<void> =>{
		const	calls = [];
		//Fetch only the one missings
		for (const eachList of selected) {
			if (!tokenListFetchedRef.current[eachList.name]) {
				calls.push(axios(eachList.uri));
			}
		}
		const	results = await axios.all(calls);
		let		resultIndex = 0;

		for (const iterator of results) {
			console.log(iterator.data.logoURI);
		}

		//Save them in a ref so we can use them later, excluding the ones we already have
		for (const eachList of selected) {
			if (!tokenListFetchedRef.current[eachList.name]) {
				tokenListFetchedRef.current[eachList.name] = true;
				tokenListRef.current[eachList.name] = results[resultIndex].data;
				resultIndex++;
			}
		}

		//Update tokenListTokensRef with the tokens in the selected list only
		tokenListTokensRef.current = {};
		for (const eachList of selected) {
			for (const eachToken of tokenListRef.current[eachList.name].tokens) {
				tokenListTokensRef.current[toAddress(eachToken.address)] = eachToken;
			}

		}
	}, [selected], 100, false);

	useEffect((): void => {
		fetchTokenListData();
	}, [fetchTokenListData]);


	return (
		<div className={'grid gap-4'}>
			{TOKEN_LISTS.map((list, listIdx): ReactElement => (
				<div key={listIdx}>
					<div className={'yearn--table-token-section-item w-full'}>
						<div className={'yearn--table-token-section-item-image'}>
							<ImageWithFallback
								alt={''}
								width={40}
								height={40}
								quality={90}
								src={list.imageSrc}
								loading={'eager'} />
						</div>
						<div className={'grow'}>
							<div className={'flex w-full flex-row items-center justify-between'}>
								<b>{list.name}</b>
								{selected.find((selectedList): boolean => selectedList.name === list.name) ? (
									<div className={'flex h-6 items-center justify-end p-2 text-xs'}>
										<IconCheck className={'h-4 w-4 text-[#16a34a]'} />
									</div>
								) : (
									<SmallButton
										onClick={async (): Promise<void> => {
											set_isRefreshing((s): TDict<boolean> => ({...s, [list.name]: true}));
											await refreshWithList(tokenListTokensRef.current);
											performBatchedUpdates((): void => {
												set_selected((s): any => [...s, list]);
												set_isRefreshing((s): TDict<boolean> => ({...s, [list.name]: false}));
											});
										}}
										isBusy={isRefreshing[list.name]}
										className={'h-6 p-2 text-xs'}>
										{'Load'}
									</SmallButton>
								)}
							</div>
							<div className={'w-full max-w-[240px] truncate md:max-w-xs'}>
								<a
									href={list.uri}
									target={'_blank'}
									rel={'noopener noreferrer'}
									className={'cursor-pointer font-mono text-xs text-neutral-500 transition-colors hover:text-neutral-900'}>
									{list.uri}
								</a>
							</div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

export default TokenListsSelector;
