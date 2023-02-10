import React from 'react';
import Image from 'next/image';
import dayjs, {extend} from 'dayjs';
import dayjsDuration from 'dayjs/plugin/duration.js';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import weekday from 'dayjs/plugin/weekday.js';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';

import type {TTokenListItem} from 'pages/tokenlistooor';
import type {ReactElement} from 'react';

extend(relativeTime);
extend(dayjsDuration);
extend(weekday);

function TokenListCard({item}: {item: TTokenListItem}): ReactElement {
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
				<div className={'flex flex-col text-end text-xs text-neutral-500'}>
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
					<div className={'flex flex-row items-center justify-between py-2 px-4 transition-colors md:px-6'}>
						<small className={'text-neutral-500'}>{'Tokens '}</small>
						<b suppressHydrationWarning>{`${formatAmount(item.tokenCount, 0, 0)}`}</b>
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

function LegacyTokenListCard({item}: {item: Partial<TTokenListItem>}): ReactElement {
	return (
		<a
			href={item.URI}
			target={'_blank'}
			rel={'noreferrer'}
			className={'group relative flex w-full flex-col'}>
			<div className={'mb-2 flex w-full items-start justify-between px-4 md:px-6'}>
				<Image
					unoptimized
					src={item?.logoURI?.startsWith('ipfs://') ? `https://ipfs.io/ipfs/${item.logoURI.replace('ipfs://', '')}` : item?.logoURI || ''}
					width={36}
					height={36}
					alt={''} />
				<div className={'flex flex-col text-end text-xs text-[#e11d48]'}>
					<small>{'Deprecated'}</small>
				</div>
			</div>
			<div className={'w-full px-4 text-left md:px-6'}>
				<b>{item.name}</b>
				<p className={'text-sm text-neutral-500'}>
					{`A list of token for ${item.name}`}
				</p>
			</div>
			<div className={'font-number mt-auto grid w-full divide-y divide-dashed divide-neutral-200 pt-6 text-left text-sm'}>
				<div className={'border-y border-dashed border-neutral-200'}>
					<div className={'flex flex-row items-center justify-between py-2 px-4 transition-colors md:px-6'}>
						<small className={'text-neutral-500'}>{'Last Update '}</small>
						<b>{item?.timestamp ? dayjs().to(new Date(item.timestamp).valueOf()) : '-'}</b>
					</div>
				</div>
				<div className={'border-y border-dashed border-neutral-200'}>
					<span className={'flex cursor-pointer flex-row items-center justify-between py-2 px-4 transition-colors group-hover:bg-neutral-100 md:px-6'}>
						<small className={'text-neutral-500'}>{'Link '}</small>
						<b className={'group-hover:underline'}>
							{'list.json'}
						</b>
					</span>
				</div>
			</div>
		</a>
	);
}

export {LegacyTokenListCard};
export default TokenListCard;
