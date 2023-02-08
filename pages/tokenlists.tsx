import React, {useState} from 'react';
import {DefaultSeo} from 'next-seo';
import IconChevronBoth from 'components/icons/IconChevronBoth';
import TokenListCard, {LegacyTokenListCard} from 'components/TokenListCard';
import TokenListHero from 'components/TokenListHero';
import {MigratooorContextApp} from 'contexts/useMigratooor';
import LEGACY_TOKEN_LISTS from 'utils/legacyTokenLists';
import axios from 'axios';
import {motion} from 'framer-motion';
import {useMountEffect} from '@react-hookz/web';

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

function	Home(): ReactElement {
	const	[allLists, set_allLists] = useState<TTokenListItem[]>([]);
	const	[summary, set_summary] = useState<TTokenListSummary>();

	useMountEffect((): void => {
		axios.get('https://api.github.com/repos/migratooor/tokenlists/commits?sha=main&per_page=1')
			.then((response): void => {
				const	gihubCallResponse = (response.data as [{sha: string}]);
				const	[{sha}] = gihubCallResponse;
				axios.get(`https://raw.githubusercontent.com/Migratooor/tokenLists/${sha}/lists/summary.json`)
					.then((response): void => {
						const	tokenListResponse = response.data as TTokenListSummary;
						set_allLists(tokenListResponse.lists);
						set_summary(tokenListResponse);
					});
			});
	});

	return (
		<>
			<TokenListHero summary={summary} />
			<div className={'mx-auto grid w-full max-w-4xl'}>
				<div id={'tokenlistooor'} className={'mt-10 grid grid-cols-1 gap-6 pb-32 md:grid-cols-3'}>
					{(allLists || []).map((tokenListItem: TTokenListItem, i: number): ReactElement => (
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
				<div className={'mb-32'}>
					<details className={'rounded-default detailsTokenList mb-0 flex w-full flex-col justify-center'}>
						<summary className={'box-0 flex flex-col items-start py-2 transition-colors hover:bg-neutral-100'}>
							<div className={'flex w-full flex-row items-center justify-between'}>
								<b className={'text-left text-sm'}>
									{'Legacy lists'}
								</b>
								<div>
									<IconChevronBoth className={'h-4 w-4 text-neutral-500 transition-colors group-hover:text-neutral-900'} />
								</div>
							</div>
						</summary>


						<div className={'grid grid-cols-1 gap-6 pt-6 md:grid-cols-3'}>
							{(LEGACY_TOKEN_LISTS || []).map((tokenListItem): ReactElement => (
								<div key={tokenListItem.name} className={'box-0 relative flex w-full pt-4 md:pt-6'}>
									<LegacyTokenListCard item={tokenListItem} />
								</div>
							))}
						</div>
					</details>
				</div>
			</div>
		</>
	);
}

export default function Wrapper(): ReactElement {
	return (
		<MigratooorContextApp>
			<>
				<DefaultSeo
					title={'Tokenlistooor'}
					defaultTitle={'Tokenlistooor'}
					description={'Up to date token lists that fulfill your needs! Tokenlistooor is a fork of Uniswap Tokenlists, with focus on adding more automation and extra features.'}
					openGraph={{
						type: 'website',
						locale: 'en-US',
						url: 'https://migratooor.com/tokenlists/',
						site_name: 'Tokenlistooor',
						title: 'Tokenlistooor',
						description: 'Up to date token lists that fulfill your needs! Tokenlistooor is a fork of Uniswap Tokenlists, with focus on adding more automation and extra features.',
						images: [
							{
								url: 'https://migratooor.com/og_tokenlistooor.png',
								width: 800,
								height: 400,
								alt: 'tokenListooor'
							}
						]
					}}
					twitter={{
						handle: '@migratooor',
						site: '@migratooor',
						cardType: 'summary_large_image'
					}} />
				<Home />
			</>
		</MigratooorContextApp>
	);
}

