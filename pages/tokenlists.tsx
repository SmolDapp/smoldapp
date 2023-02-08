import React, {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {MigratooorContextApp} from 'contexts/useMigratooor';
import dayjs, {extend} from 'dayjs';
import dayjsDuration from 'dayjs/plugin/duration.js';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import weekday from 'dayjs/plugin/weekday.js';
import {useTimer} from 'hooks/useTimer';
import axios from 'axios';
import {motion} from 'framer-motion';
import {useMountEffect} from '@react-hookz/web';
import {Button} from '@yearn-finance/web-lib/components/Button';
import IconGithub from '@yearn-finance/web-lib/icons/IconSocialGithub';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';

import type {ReactElement} from 'react';

extend(relativeTime);
extend(dayjsDuration);
extend(weekday);

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
		<a
			href={item.URI}
			target={'_blank'}
			rel={'noreferrer'}
			className={'group relative flex w-full flex-col'}>
			<div className={'mb-2 flex w-full items-start justify-between px-4 md:px-6'}>
				<Image
					unoptimized
					src={item.logoURI?.startsWith('ipfs://') ? `https://ipfs.io/ipfs/${item.logoURI.replace('ipfs://', '')}` : item.logoURI}
					width={36}
					height={36}
					alt={''} />
				<div className={'flex flex-col text-end text-xs text-neutral-400'}>
					<small>{`v${item.version.major}.${item.version.minor}.${item.version.patch}`}</small>
				</div>
			</div>
			<div className={'w-full px-4 text-left md:px-6'}>
				<b>{item.name}</b>
				<p className={'text-sm text-neutral-500'}>
					{item.description || `A list of token for ${item.name}`}
				</p>
			</div>
			<div className={'font-number mt-auto grid w-full divide-y divide-dashed divide-neutral-200 pt-6 text-left text-sm'}>
				<div className={'border-y border-dashed border-neutral-200'}>
					<div className={'flex flex-row items-center justify-between py-2 px-4 transition-colors hover:bg-neutral-100 md:px-6'}>
						<small className={'text-neutral-500'}>{'Tokens '}</small>
						<b>{`${formatAmount(item.tokenCount, 0, 0)}`}</b>
					</div>
				</div>
				<div className={'border-y border-dashed border-neutral-200'}>
					<span className={'flex cursor-pointer flex-row items-center justify-between py-2 px-4 transition-colors group-hover:bg-neutral-100 md:px-6'}>
						<small className={'text-neutral-500'}>{'Link '}</small>
						<b className={'group-hover:underline'}>
							{`${item.URI.replace('https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/', '')}`}
						</b>
					</span>
				</div>
			</div>
		</a>
	);
}

function relativeTimeFormat(value: number): string {
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

function Hero({summary}: {summary: TTokenListSummary | undefined}): ReactElement {
	const nextSundayNoon = dayjs().weekday(7).hour(12).minute(0).second(0).millisecond(0);
	const time = useTimer({endTime: nextSundayNoon.valueOf() / 1000});

	return (
		<div className={'bg-neutral-0 relative isolate overflow-hidden'}>
			<svg
				className={'absolute inset-0 -z-10 h-full w-full stroke-neutral-900/10 [mask-image:radial-gradient(100%_100%_at_top_right,black,transparent)]'}
				aria-hidden={'true'}>
				<defs>
					<pattern
						id={'983e3e4c-de6d-4c3f-8d64-b9761d1534cc'}
						width={200}
						height={200}
						x={'50%'}
						y={-1}
						patternUnits={'userSpaceOnUse'}>
						<path d={'M.5 200V.5H200'} fill={'none'} />
					</pattern>
				</defs>
				<svg
					x={'50%'}
					y={-1}
					className={'overflow-visible fill-neutral-200/20'}>
					<path
						d={'M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z'}
						strokeWidth={0} />
				</svg>
				<rect
					width={'100%'}
					height={'100%'}
					strokeWidth={0}
					fill={'url(#983e3e4c-de6d-4c3f-8d64-b9761d1534cc)'} />
			</svg>
			<div className={'mx-auto grid max-w-4xl grid-cols-1 px-6 pt-10 pb-0 md:grid-cols-2 md:pb-10 md:pt-20'}>
				<div className={'w-full'}>
					<div>
						<span className={'rounded-default border border-neutral-200 bg-neutral-100 px-3 py-1 text-xs leading-6 text-neutral-500 md:text-sm'}>
							{'Last update: '}
							<span className={'inline-flex items-center pl-2 font-bold text-neutral-900'}>
								<span suppressHydrationWarning>{relativeTimeFormat(summary?.timestamp || 0)}</span>
							</span>
						</span>
					</div>
					<h1 className={'mt-4 text-3xl font-bold tracking-tight text-neutral-900 md:mt-6 md:text-4xl'}>
						{'Tokenlistooor'}
					</h1>
					<p className={'mt-4 text-base leading-normal text-neutral-500 md:mt-6 md:text-lg md:leading-8'}>
						{'Generate token lists that fulfill your needs! Tokenlistooor is a fork of Uniswap Tokenlists, with focus on adding more automation and extra features.'}
					</p>
					<div className={'mt-6 flex items-center gap-x-6 md:mt-10'}>
						<Link href={'https://github.com/migratooor/tokenlists/'} target={'_blank'}>
							<Button>
								<IconGithub className={'mr-4 h-6 w-6'} />
								{'Github'}
							</Button>
						</Link>
						<Button
							onClick={(): void => document.getElementById('tokenlistooor')?.scrollIntoView({behavior: 'smooth', block: 'start'})}>
							{'Browse lists'}
							<p className={'pt-1 pl-2'}>&#10549;</p>
						</Button>
					</div>
				</div>
				<div className={'hidden w-full items-center justify-center pl-0 md:flex md:pl-20'}>
					<div className={'flex items-center justify-center'}>
						<div className={'box-0 relative flex flex-col p-6'}>
							<div>
								<b suppressHydrationWarning className={'font-number text-xl'}>{time}</b>
								<p className={'pt-2 text-xs text-neutral-400'}>{'The next automatic update is just around the corner! Our lists are updated automatically with each new commit or every Sunday at midday, without any manual input.'}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}



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
			<Hero summary={summary} />
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
							<CardWithLogo item={tokenListItem} />
						</motion.div>
					))}
				</div>
			</div>
		</>
	);
}

export default function Wrapper(): ReactElement {
	return (
		<MigratooorContextApp>
			<Home />
		</MigratooorContextApp>
	);
}

