import React from 'react';
import Link from 'next/link';
import dayjs, {extend} from 'dayjs';
import dayjsDuration from 'dayjs/plugin/duration.js';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import weekday from 'dayjs/plugin/weekday.js';
import {useTimer} from 'hooks/useTimer';
import {Button} from '@yearn-finance/web-lib/components/Button';
import IconGithub from '@yearn-finance/web-lib/icons/IconSocialGithub';
import {copyToClipboard} from '@yearn-finance/web-lib/utils/helpers';

import type {TTokenListSummary} from 'pages/tokenlistooor';
import type {ReactElement} from 'react';

extend(relativeTime);
extend(dayjsDuration);
extend(weekday);

function relativeTimeFormat(value: number): string {
	let locale = 'fr-FR';
	if (typeof(navigator) !== 'undefined') {
		locale = navigator.language || 'fr-FR';
	}

	const now = Date.now().valueOf() / 1000;
	const timeDiffWithNow = (value - now);
	const hourDiffWithNow = timeDiffWithNow / 3600;
	const dayDiffWithNow = hourDiffWithNow / 24;

	//use day scale if diff is more than 24 hours
	if (Math.abs(hourDiffWithNow) >= 24) {
		return new Intl.RelativeTimeFormat([locale, 'en-US']).format(Math.floor(dayDiffWithNow), 'days');
	}
	return new Intl.RelativeTimeFormat([locale, 'en-US']).format(Math.floor(hourDiffWithNow), 'hours');
}

function TokenListHero({summary}: {summary: TTokenListSummary | undefined}): ReactElement {
	const nextSundayNoon = dayjs().weekday(7).hour(12).minute(0).second(0).millisecond(0);
	const time = useTimer({endTime: nextSundayNoon.valueOf() / 1000});

	return (
		<div className={'relative isolate overflow-hidden'}>
			<div className={'mx-auto grid max-w-5xl grid-cols-1 px-6 pb-0 pt-10 md:grid-cols-2 md:pb-10 md:pt-20'}>
				<div className={'w-full'}>
					<div>
						<span className={'rounded-md border border-neutral-200 bg-neutral-100 px-3 py-1 text-xs leading-6 text-neutral-500 md:text-sm'}>
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
						{'Up to date token lists that fulfill your needs! Tokenlistooor is a fork of Uniswap Tokenlists, with focus on adding more automation and extra features.'}
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
							<p className={'pl-2 pt-1'}>&#10549;</p>
						</Button>
					</div>
				</div>
				<div className={'hidden w-full items-center justify-center pl-0 md:flex md:pl-20'}>
					<div className={'flex flex-col items-center justify-center space-y-4'}>
						<button
							onClick={(): void => copyToClipboard('https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/tokenlistooor.json')}
							className={'box-0 group relative flex w-full cursor-pointer flex-col justify-center text-ellipsis !border-dashed !border-neutral-300 px-4 py-2 transition-colors hover:!bg-neutral-100'}>
							<p className={'font-number text-ellipsis text-base'}>
								{'tokenlistooor.json'}
							</p>
							<div className={'absolute right-4'}>
								<svg
									xmlns={'http://www.w3.org/2000/svg'}
									viewBox={'0 0 512 512'}
									className={'h-4 w-4 text-neutral-300 transition-colors group-hover:text-neutral-900'}><path d={'M224 0c-35.3 0-64 28.7-64 64V288c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H224zM64 160c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H288c35.3 0 64-28.7 64-64V384H304v64c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V224c0-8.8 7.2-16 16-16h64V160H64z'} fill={'currentColor'}/>
								</svg>
							</div>
						</button>
						<div className={'box-0 relative flex flex-col p-4'}>
							<div>
								<b suppressHydrationWarning className={'font-number text-xl'}>{time}</b>
								<p className={'pt-2 text-xs text-neutral-500'}>{'The next automatic update is just around the corner! Our lists are updated automatically with each new commit or every Sunday at midday, without any manual input.'}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default TokenListHero;
