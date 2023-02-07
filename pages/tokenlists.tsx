import React, {useState} from 'react';
import Image from 'next/image';
import {MigratooorContextApp} from 'contexts/useMigratooor';
import axios from 'axios';
import {motion} from 'framer-motion';
import {useMountEffect} from '@react-hookz/web';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';

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


export type TCardWithLogo = {
	item: TTokenListItem,
}
function CardWithLogo({item}: TCardWithLogo): ReactElement {
	return (
		<div
			className={'box-0 relative flex w-full pt-4 md:pt-6'}>
			<div className={'relative flex w-full flex-col'}>
				<div className={'mb-2 flex w-full items-start justify-between px-4 md:px-6'}>
					<Image
						unoptimized
						src={item.logoURI?.startsWith('ipfs://') ? `https://ipfs.io/ipfs/${item.logoURI.replace('ipfs://', '')}` : item.logoURI}
						width={36}
						height={36}
						alt={item.name} />
					<div className={'flex flex-col text-end text-xs text-neutral-400'}>
						<small>{`v${item.version.major}.${item.version.minor}.${item.version.patch}`}</small>
					</div>
				</div>
				<div className={'w-full px-4 text-left md:px-6'}>
					<b>{item.name}</b>
					<p className={'text-sm text-neutral-500'}>
						{item.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'}
					</p>
				</div>
				<div className={'font-number mt-6 grid w-full divide-y divide-dashed divide-neutral-200 text-left text-sm'}>

					<div className={'border-y border-dashed border-neutral-200'}>
						<div className={'flex flex-row items-center justify-between py-2 px-4 transition-colors hover:bg-neutral-100 md:px-6'}>
							<small className={'text-neutral-500'}>{'Tokens '}</small>
							<b>{`${formatAmount(item.tokenCount, 0, 0)}`}</b>
						</div>
					</div>

					<div className={'border-y border-dashed border-neutral-200'}>
						<a
							href={item.URI}
							target={'_blank'}
							rel={'noreferrer'}
							className={'group flex cursor-pointer flex-row items-center justify-between py-2 px-4 transition-colors hover:bg-neutral-100 md:px-6'}>
							<small className={'text-neutral-500'}>{'Link '}</small>
							<b className={'group-hover:underline'}>
								{`${item.URI.replace('https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/', '')}`}
							</b>
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}

function	relativeTimeFormat(value: number): string {
	let		locale = 'fr-FR';
	if (typeof(navigator) !== 'undefined') {
		locale = navigator.language || 'fr-FR';
	}

	const	now = Date.now().valueOf() / 1000;
	const	timeDiffWithNow = (value - now);
	const	hourDiffWithNow = timeDiffWithNow / 3600;
	const	dayDiffWithNow = hourDiffWithNow / 24;

	//use day scale if diff is more than 24 hours
	if (Math.abs(hourDiffWithNow) >= 24) {
		return new Intl.RelativeTimeFormat([locale, 'en-US']).format(Math.floor(dayDiffWithNow), 'days');
	}
	return new Intl.RelativeTimeFormat([locale, 'en-US']).format(Math.floor(hourDiffWithNow), 'hours');
}



function	Home(): ReactElement {
	const	[allLists, set_allLists] = useState<TTokenListItem[]>([]);
	const	[summary, set_summary] = useState<TTokenListSummary>({} as TTokenListSummary);

	useMountEffect((): void => {
		axios.get('https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/summary.json').then((response): void => {
			const	tokenListResponse = response.data as TTokenListSummary;
			set_allLists(tokenListResponse.lists);
			set_summary(tokenListResponse);
		});
	});

	return (
		<div
			key={'tokenlistooor'}
			className={'mx-auto w-full pb-40'}>
			<div className={'w-full pt-10'}>
				<h1 className={'mb-2 text-3xl'}>{'Tokenlistooor'}</h1>
				<p suppressHydrationWarning>{`Last update ${relativeTimeFormat(summary?.timestamp || 0)}`}</p>
				<p className={'pl-1 text-base text-neutral-500'}>
					{'Tokenlistooor is a fork of the Uniswap project, with a focus on automation and some extra features. It\'s a one-stop shop for all your list-generation needs'}
				</p>
			</div>
			<div className={'grid grid-cols-3 gap-6 pt-10'}>
				{(allLists || []).map((tokenListItem: TTokenListItem, i: number): ReactElement => (
					<motion.div
						key={tokenListItem.name}
						custom={i}
						initial={'initial'}
						whileInView={'enter'}
						variants={variants}>
						<CardWithLogo item={tokenListItem} />
					</motion.div>
				))}
			</div>
		</div>
	);
}

export default function Wrapper(): ReactElement {
	return (
		<MigratooorContextApp>
			<Home />
		</MigratooorContextApp>
	);
}

