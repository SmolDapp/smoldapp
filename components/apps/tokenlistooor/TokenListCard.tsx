import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dayjs, {extend} from 'dayjs';
import dayjsDuration from 'dayjs/plugin/duration.js';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import weekday from 'dayjs/plugin/weekday.js';
import {formatAmount} from '@builtbymom/web3/utils';

import {ImageWithFallback} from '../../common/ImageWithFallback';

import type {TTokenListItem} from 'pages/tokenlistooor';
import type {ReactElement} from 'react';

extend(relativeTime);
extend(dayjsDuration);
extend(weekday);

function TokenListCard({item}: {item: TTokenListItem}): ReactElement {
	const fileName = item.URI.replace('https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/', '');

	return (
		<div className={'relative flex w-full flex-col overflow-hidden rounded-md transition-shadow hover:shadow-md'}>
			<Link href={`/tokenlistooor/${fileName.replace('.json', '')}`}>
				<div className={'mb-2 flex w-full items-start justify-between px-4 md:px-6'}>
					<ImageWithFallback
						unoptimized
						src={
							item.logoURI?.startsWith('ipfs://')
								? `https://ipfs.io/ipfs/${item.logoURI.replace('ipfs://', '')}`
								: item.logoURI
						}
						width={36}
						height={36}
						alt={''}
					/>
					<div className={'text-neutral-500 flex flex-col text-end text-xs'}>
						<small>{`v${item.version.major}.${item.version.minor}.${item.version.patch}`}</small>
					</div>
				</div>
				<div className={'w-full px-4 text-left md:px-6'}>
					<b>{item.name}</b>
					<p className={'text-neutral-500 text-sm'}>
						{item.description || `A list of token for ${item.name}`}
					</p>
				</div>
			</Link>

			<Link
				href={`/tokenlistooor/${fileName.replace('.json', '')}`}
				className={'font-number mt-auto grid w-full pt-6 text-left text-sm'}>
				<div className={'border-y border-dashed border-neutral-200'}>
					<div className={'flex flex-row items-center justify-between px-4 py-2 transition-colors md:px-6'}>
						<small>{'Tokens '}</small>
						<b suppressHydrationWarning>{`${formatAmount(item.tokenCount, 0, 0)}`}</b>
					</div>
				</div>
			</Link>

			<a
				suppressHydrationWarning
				href={item.URI}
				target={'_blank'}
				rel={'noreferrer'}>
				<div className={'font-number group grid w-full text-left text-sm'}>
					<div className={'border-t border-dashed border-neutral-200'}>
						<span
							className={
								'group-hover:bg-neutral-100 flex cursor-pointer flex-row items-center justify-between px-4 py-2 transition-colors md:px-6'
							}>
							<small>{'Link '}</small>
							<b
								suppressHydrationWarning
								className={'group-hover:underline'}>
								{fileName}
							</b>
						</span>
					</div>
				</div>
			</a>
		</div>
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
					src={
						item?.logoURI?.startsWith('ipfs://')
							? `https://ipfs.io/ipfs/${item.logoURI.replace('ipfs://', '')}`
							: item?.logoURI || ''
					}
					width={36}
					height={36}
					alt={''}
				/>
				<div className={'flex flex-col text-end text-xs text-red'}>
					<small>{'Deprecated'}</small>
				</div>
			</div>
			<div className={'w-full px-4 text-left md:px-6'}>
				<b>{item.name}</b>
				<p className={'text-neutral-500 text-sm'}>{`A list of token for ${item.name}`}</p>
			</div>
			<div
				className={
					'font-number mt-auto grid w-full divide-y divide-dashed divide-neutral-200 pt-6 text-left text-sm'
				}>
				<div className={'border-y border-dashed border-neutral-200'}>
					<div className={'flex flex-row items-center justify-between px-4 py-2 transition-colors md:px-6'}>
						<small>{'Last Update '}</small>
						<b>{item?.timestamp ? dayjs().to(new Date(item.timestamp).valueOf()) : '-'}</b>
					</div>
				</div>
				<div className={'border-y border-dashed border-neutral-200'}>
					<span
						className={
							'group-hover:bg-neutral-100 flex cursor-pointer flex-row items-center justify-between px-4 py-2 transition-colors md:px-6'
						}>
						<small>{'Link '}</small>
						<b className={'group-hover:underline'}>{'list.json'}</b>
					</span>
				</div>
			</div>
		</a>
	);
}

export {LegacyTokenListCard};
export default TokenListCard;
