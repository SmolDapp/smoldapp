import React, {useMemo, useState} from 'react';
import {DefaultSeo} from 'next-seo';
import LEGACY_TOKEN_LISTS from 'utils/legacyTokenLists';
import {motion} from 'framer-motion';
import TokenListCard, {LegacyTokenListCard} from '@tokenlistooor/TokenListCard';
import TokenListHero from '@tokenlistooor/TokenListHero';

import type {Variants} from 'framer-motion';
import type {ReactElement} from 'react';
import type {TAddress} from '@utils/tools.address';

export type TTokenListItem = {
	name: string;
	description: string;
	timestamp: string;
	logoURI: string;
	URI: string;
	keywords: string[];
	tokenCount: number;
	tokens: {
		address: TAddress;
		name: string;
		symbol: string;
		logoURI: string;
		chainId: number;
		decimals: number;
	}[];
	version: {
		major: number;
		minor: number;
		patch: number;
	};
};
export type TTokenListSummary = {
	name: string;
	timestamp: number;
	logoURI: string;
	lists: TTokenListItem[];
};

const variants = {
	enter: (i: number): unknown => ({
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

function Home({summary}: {summary: TTokenListSummary}): ReactElement {
	const allLists = summary.lists;
	const [typeOfList, set_typeOfList] = useState<'tokens' | 'pools' | 'legacy'>('tokens');

	const {tokens, pools} = useMemo((): {tokens: TTokenListItem[]; pools: TTokenListItem[]} => {
		const tokens: TTokenListItem[] = [];
		const pools: TTokenListItem[] = [];
		allLists.forEach((list: TTokenListItem): void => {
			if (list.name.toLowerCase().includes('token pool')) {
				pools.push(list);
			} else {
				tokens.push(list);
			}
		});
		return {tokens, pools};
	}, [allLists]);

	const listToRender = typeOfList === 'tokens' ? tokens : typeOfList === 'pools' ? pools : undefined;
	return (
		<>
			<TokenListHero summary={summary} />
			<div className={'mx-auto mt-10 grid w-full max-w-5xl'}>
				<menu className={'mb-4 flex flex-row justify-end text-xs'}>
					<button
						onClick={(): void => set_typeOfList('tokens')}
						className={`transition-colors ${
							typeOfList === 'tokens'
								? 'text-neutral-700'
								: 'text-neutral-500/80 cursor-pointer hover:text-neutral-700'
						}`}>
						{'Tokens'}
					</button>
					&nbsp;<p className={'text-neutral-500/80'}>{'/'}</p>&nbsp;
					<button
						onClick={(): void => set_typeOfList('pools')}
						className={`transition-colors ${
							typeOfList === 'pools'
								? 'text-neutral-700'
								: 'text-neutral-500/80 cursor-pointer hover:text-neutral-700'
						}`}>
						{'Pools'}
					</button>
					&nbsp;<p className={'text-neutral-500/80'}>{'/'}</p>&nbsp;
					<button
						onClick={(): void => set_typeOfList('legacy')}
						className={`transition-colors ${
							typeOfList === 'legacy'
								? 'text-neutral-700'
								: 'text-neutral-500/80 cursor-pointer hover:text-neutral-700'
						}`}>
						{'Legacy'}
					</button>
				</menu>
			</div>
			<div className={'mx-auto grid w-full max-w-5xl'}>
				<div
					id={'tokenlistooor'}
					className={'grid grid-cols-1 gap-6 pb-32 md:grid-cols-3'}>
					{typeOfList === 'legacy'
						? (LEGACY_TOKEN_LISTS || []).map(
								(tokenListItem, i): ReactElement => (
									<motion.div
										key={tokenListItem.name}
										custom={i}
										initial={'initial'}
										whileInView={'enter'}
										variants={variants as Variants}
										className={'box-0 relative flex w-full pt-4 md:pt-6'}>
										<LegacyTokenListCard item={tokenListItem} />
									</motion.div>
								)
						  )
						: (listToRender || []).map(
								(tokenListItem: TTokenListItem, i: number): ReactElement => (
									<motion.div
										key={tokenListItem.name}
										custom={i}
										initial={'initial'}
										whileInView={'enter'}
										variants={variants as Variants}
										className={'box-0 relative flex w-full pt-4 md:pt-6'}>
										<TokenListCard item={tokenListItem} />
									</motion.div>
								)
						  )}
				</div>
			</div>
		</>
	);
}

export default function Wrapper({summary}: {summary: TTokenListSummary}): ReactElement {
	return (
		<>
			<DefaultSeo
				title={'Tokenlistooor - SmolDapp'}
				defaultTitle={'Tokenlistooor - SmolDapp'}
				description={
					'Up to date token lists that fulfill your needs! Tokenlistooor is a fork of Uniswap Tokenlists, with focus on adding more automation and extra features.'
				}
				openGraph={{
					type: 'website',
					locale: 'en-US',
					url: 'https://smold.app/tokenlistooor',
					site_name: 'Tokenlistooor - SmolDapp',
					title: 'Tokenlistooor - SmolDapp',
					description:
						'Up to date token lists that fulfill your needs! Tokenlistooor is a fork of Uniswap Tokenlists, with focus on adding more automation and extra features.',
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
				}}
			/>
			<Home summary={summary} />
		</>
	);
}

Wrapper.getInitialProps = async (): Promise<unknown> => {
	try {
		const shaRes = await fetch('https://api.github.com/repos/smoldapp/tokenlists/commits?sha=main&per_page=1');
		const shaJson = await shaRes.json();
		const gihubCallResponse = shaJson as [{sha: string}];
		const [{sha}] = gihubCallResponse;
		const listRes = await fetch(`https://raw.githubusercontent.com/smoldapp/tokenLists/${sha}/lists/summary.json`);
		const tokenListResponse = await listRes.json();

		return {summary: tokenListResponse};
	} catch (error) {
		const listRes = await fetch('https://raw.githubusercontent.com/smoldapp/tokenLists/main/lists/summary.json');
		const tokenListResponse = await listRes.json();

		return {summary: tokenListResponse};
	}
};
