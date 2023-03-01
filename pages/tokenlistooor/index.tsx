import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {DefaultSeo} from 'next-seo';
import TokenListCard, {LegacyTokenListCard, OnChainTokenListCard} from 'components/app/tokenlistooor/TokenListCard';
import TokenListHero from 'components/TokenListHero';
import {MigratooorContextApp} from 'contexts/useMigratooor';
import {Contract} from 'ethcall';
import {ethers} from 'ethers';
import TOKENLIST_ABI from 'utils/abi/TokenList.abi';
import TOKENLIST_REGISTRY_ABI from 'utils/abi/TokenListRegistry.abi';
import LEGACY_TOKEN_LISTS from 'utils/legacyTokenLists';
import {motion} from 'framer-motion';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {getProvider, newEthCallProvider} from '@yearn-finance/web-lib/utils/web3/providers';

import type {TOnChainList} from 'components/app/tokenlistooor/TokenListCard';
import type {BigNumber} from 'ethers';
import type {ReactElement} from 'react';

export type TTokenListItem = {
	name: string;
	description: string;
	timestamp: string;
	logoURI: string;
	URI: string;
	keywords: string[];
	tokenCount: number;
	version: {
		major: number;
		minor: number;
		patch: number;
	};
}
export type TTokenListSummary = {
	name: string;
	timestamp: number;
	logoURI: string;
	lists: TTokenListItem[];
}

const variants = {
	enter: (i: number): any => ({
		y: 0,
		opacity: 1,
		transition: {
			delay: i * 0.04,
			duration: 0.5,
			ease: 'linear'
		}
	}),
	initial: {y: 60, opacity: 0}
};

function	Home({summary}: {summary: TTokenListSummary}): ReactElement {
	const	{provider, chainID} = useWeb3();
	const	allLists = summary.lists;
	const	[typeOfList, set_typeOfList] = useState<'onChain' | 'tokens' | 'pools' | 'legacy'>('tokens');
	const	[lists, set_lists] = useState<TOnChainList[]>([]);

	const	getOnChainLists = useCallback(async (): Promise<void> =>{
		const	currentProvider = provider || getProvider(chainID);
		const	registryAddress = toAddress(process.env.TOKENLISTOOOR_REGISTRY_ADDRESS);
		const	registry = new ethers.Contract(registryAddress, TOKENLIST_REGISTRY_ABI, currentProvider);
		const	count = await registry.countLists();

		const	ethcallProvider = await newEthCallProvider(currentProvider);
		const	ethcallRegistry = new Contract(registryAddress, TOKENLIST_REGISTRY_ABI);
		const	calls = [];
		const	tokenCountCalls = [];
		for (let i = 0; i < count; i++) {
			calls.push(ethcallRegistry.getListByIndex(i));
		}
		const result = await ethcallProvider?.tryAll(calls) as TOnChainList[];
		for (const list of result) {
			const	ethcallList = new Contract(toAddress(list.listAddress), TOKENLIST_ABI);
			tokenCountCalls.push(ethcallList.countToken());
		}
		const tokenCountResult = await ethcallProvider?.tryAll(tokenCountCalls) as BigNumber[];
		set_lists(result.map((list: TOnChainList, index: number): TOnChainList => ({
			listAddress: list.listAddress,
			name: list.name,
			description: list.description,
			baseURI: list.baseURI,
			logoURI: list.logoURI,
			endorsed: list.endorsed,
			chainID: chainID,
			tokenCount: tokenCountResult[index].toNumber() || 0
		})));
	}, [provider, chainID]);

	useEffect((): void => {
		getOnChainLists();
	}, [provider, chainID, getOnChainLists]);


	const	{tokens, pools} = useMemo((): {tokens: TTokenListItem[], pools: TTokenListItem[]} => {
		const	tokens: TTokenListItem[] = [];
		const	pools: TTokenListItem[] = [];
		allLists.forEach((list: TTokenListItem): void => {
			if (list.name.toLowerCase().includes('token pool')) {
				pools.push(list);
			} else {
				tokens.push(list);
			}
		});
		return ({tokens, pools});
	}, [allLists]);


	const	listToRender = typeOfList === 'tokens' ? tokens : typeOfList === 'pools' ? pools : undefined;
	return (
		<>
			<TokenListHero summary={summary} />
			<div className={'mx-auto mt-10 grid w-full max-w-4xl'}>
				<menu className={'mb-4 flex flex-row justify-end text-xs'}>
					<button
						onClick={(): void => set_typeOfList('onChain')}
						className={`transition-colors ${typeOfList === 'onChain' ? 'text-neutral-700' : 'cursor-pointer text-neutral-500/80 hover:text-neutral-700'}`}>
						{'OnChain'}
					</button>
					&nbsp;<p className={'text-neutral-500/80'}>{'/'}</p>&nbsp;
					<button
						onClick={(): void => set_typeOfList('tokens')}
						className={`transition-colors ${typeOfList === 'tokens' ? 'text-neutral-700' : 'cursor-pointer text-neutral-500/80 hover:text-neutral-700'}`}>
						{'Tokens'}
					</button>
					&nbsp;<p className={'text-neutral-500/80'}>{'/'}</p>&nbsp;
					<button
						onClick={(): void => set_typeOfList('pools')}
						className={`transition-colors ${typeOfList === 'pools' ? 'text-neutral-700' : 'cursor-pointer text-neutral-500/80 hover:text-neutral-700'}`}>
						{'Pools'}
					</button>
					&nbsp;<p className={'text-neutral-500/80'}>{'/'}</p>&nbsp;
					<button
						onClick={(): void => set_typeOfList('legacy')}
						className={`transition-colors ${typeOfList === 'legacy' ? 'text-neutral-700' : 'cursor-pointer text-neutral-500/80 hover:text-neutral-700'}`}>
						{'Legacy'}
					</button>
				</menu>
			</div>
			<div className={'mx-auto grid w-full max-w-4xl'}>
				<div id={'tokenlistooor'} className={'grid grid-cols-1 gap-6 pb-32 md:grid-cols-3'}>
					{typeOfList === 'legacy' ? (
						(LEGACY_TOKEN_LISTS || []).map((tokenListItem, i): ReactElement => (
							<motion.div
								key={tokenListItem.name}
								custom={i}
								initial={'initial'}
								whileInView={'enter'}
								variants={variants}
								className={'box-0 relative flex w-full pt-4 md:pt-6'}>
								<LegacyTokenListCard item={tokenListItem} />
							</motion.div>
						))
					) : typeOfList === 'onChain' ? (
						(lists || []).map((tokenListItem, i): ReactElement => (
							<motion.div
								key={tokenListItem.name}
								custom={i}
								initial={'initial'}
								whileInView={'enter'}
								variants={variants}
								className={'box-0 relative flex w-full pt-4 md:pt-6'}>
								<OnChainTokenListCard item={tokenListItem} />
							</motion.div>
						))
					)
						: (listToRender || []).map((tokenListItem: TTokenListItem, i: number): ReactElement => (
							<motion.div
								key={tokenListItem.name}
								custom={i}
								initial={'initial'}
								whileInView={'enter'}
								variants={variants}
								className={'box-0 relative flex w-full pt-4 md:pt-6'}>
								<TokenListCard item={tokenListItem} />
							</motion.div>
						))}
				</div>
			</div>
		</>
	);
}

export default function Wrapper({summary}: {summary: TTokenListSummary}): ReactElement {
	return (
		<MigratooorContextApp>
			<>
				<DefaultSeo
					title={'Tokenlistooor - SmolDapp'}
					defaultTitle={'Tokenlistooor - SmolDapp'}
					description={'Up to date token lists that fulfill your needs! Tokenlistooor is a fork of Uniswap Tokenlists, with focus on adding more automation and extra features.'}
					openGraph={{
						type: 'website',
						locale: 'en-US',
						url: 'https://smold.app/tokenlistooor',
						site_name: 'Tokenlistooor - SmolDapp',
						title: 'Tokenlistooor - SmolDapp',
						description: 'Up to date token lists that fulfill your needs! Tokenlistooor is a fork of Uniswap Tokenlists, with focus on adding more automation and extra features.',
						images: [
							{
								url: 'https://smold.app/og_tokenlistooor.png',
								width: 800,
								height: 400,
								alt: 'tokenListooor'
							}
						]
					}}
					twitter={{
						handle: '@smoldapp',
						site: '@smoldapp',
						cardType: 'summary_large_image'
					}} />
				<Home summary={summary} />
			</>
		</MigratooorContextApp>
	);
}

Wrapper.getInitialProps = async (): Promise<unknown> => {
	const	shaRes = await fetch('https://api.github.com/repos/migratooor/tokenlists/commits?sha=main&per_page=1');
	const	shaJson = await shaRes.json();
	const	gihubCallResponse = (shaJson as [{sha: string}]);
	const	[{sha}] = gihubCallResponse;
	const	listRes = await fetch(`https://raw.githubusercontent.com/Migratooor/tokenLists/${sha}/lists/summary.json`);
	const	tokenListResponse = await listRes.json();

	return {summary: tokenListResponse};
};
