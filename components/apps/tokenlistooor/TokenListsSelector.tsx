import {useEffect, useRef, useState} from 'react';
import {ImageWithFallback} from 'components/common/ImageWithFallback';
import SmallButton from 'components/common/SmallButton';
import {IconCircleCheck} from 'components/icons/IconCircleCheck';
import {useWallet} from 'contexts/useWallet';
import axios from 'axios';
import {useMountEffect, useThrottledCallback} from '@react-hookz/web';
import {toAddress} from '@utils/tools.address';

import type {TTokenListItem, TTokenListSummary} from 'pages/tokenlistooor';
import type {ReactElement} from 'react';
import type {TDict} from '@yearn-finance/web-lib/types';
import type {TToken} from '@utils/types/types';

type TTokenList = {
	name: string;
	tokens: TToken[];
};

async function fetchTokenListSummary(): Promise<TTokenListSummary> {
	const shaRes = await fetch('https://api.github.com/repos/migratooor/tokenlists/commits?sha=main&per_page=1');
	const shaJson = await shaRes.json();
	const gihubCallResponse = shaJson as [{sha: string}];
	const [{sha}] = gihubCallResponse;
	const listRes = await fetch(`https://raw.githubusercontent.com/Migratooor/tokenLists/${sha}/lists/summary.json`);
	const tokenListResponse = await listRes.json();
	return tokenListResponse as TTokenListSummary;
}

function TokenListsSelector(): ReactElement {
	const {refreshWithList} = useWallet();
	const tokenListRef = useRef<TDict<TTokenList>>({});
	const tokenListFetchedRef = useRef<TDict<boolean>>({});
	const tokenListTokensRef = useRef<TDict<TToken>>({});
	const [selected, set_selected] = useState<TTokenListItem[]>([]);
	const [isRefreshing, set_isRefreshing] = useState<TDict<boolean>>({});
	const [tokenlists, set_tokenlists] = useState<TTokenListSummary | undefined>(undefined);

	useMountEffect((): void => {
		fetchTokenListSummary().then((tokenListSummary): void => {
			set_tokenlists(tokenListSummary);
			set_selected(tokenListSummary.lists.filter((list): boolean => list.name === 'Tokenlistooor Token List'));
		});
	});

	const fetchTokenListData = useThrottledCallback(
		async (): Promise<void> => {
			const calls = [];
			//Fetch only the one missings
			for (const eachList of selected) {
				if (!tokenListFetchedRef.current[eachList.name]) {
					calls.push(axios(eachList.URI));
				}
			}
			const results = await axios.all(calls);
			let resultIndex = 0;

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
		},
		[selected],
		100,
		false
	);

	useEffect((): void => {
		fetchTokenListData();
	}, [fetchTokenListData]);

	return (
		<div className={'grid gap-4'}>
			{(tokenlists?.lists || []).map(
				(list, listIdx): ReactElement => (
					<div key={listIdx}>
						<div className={'yearn--table-token-section-item w-full'}>
							<div className={'yearn--table-token-section-item-image'}>
								<ImageWithFallback
									alt={''}
									width={40}
									height={40}
									quality={90}
									unoptimized
									src={
										list.logoURI?.startsWith('ipfs://')
											? `https://ipfs.io/ipfs/${list.logoURI.replace('ipfs://', '')}`
											: list.logoURI
									}
									loading={'eager'}
								/>
							</div>
							<div className={'grow'}>
								<div className={'flex w-full flex-row items-center justify-between'}>
									<b>{list.name}</b>
									{selected.find((selectedList): boolean => selectedList.name === list.name) ? (
										<div className={'flex h-6 items-center justify-end p-2 text-xs'}>
											<IconCircleCheck className={'h-4 w-4 text-[#16a34a]'} />
										</div>
									) : (
										<SmallButton
											onClick={async (): Promise<void> => {
												set_isRefreshing((s): TDict<boolean> => ({...s, [list.name]: true}));
												await refreshWithList(tokenListTokensRef.current);
												set_selected((s): TTokenListItem[] => [...s, list]);
												set_isRefreshing((s): TDict<boolean> => ({...s, [list.name]: false}));
											}}
											isBusy={isRefreshing[list.name]}
											className={'h-6 p-2 text-xs'}>
											{'Load'}
										</SmallButton>
									)}
								</div>
								<div className={'w-full max-w-[240px] truncate md:max-w-xs'}>
									<a
										href={list.URI}
										target={'_blank'}
										rel={'noopener noreferrer'}
										className={
											'text-neutral-500 cursor-pointer font-mono text-xs transition-colors hover:text-neutral-900'
										}>
										{`${list.URI.replace(
											'https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/',
											''
										)}`}
									</a>
								</div>
							</div>
						</div>
					</div>
				)
			)}
		</div>
	);
}

export default TokenListsSelector;
