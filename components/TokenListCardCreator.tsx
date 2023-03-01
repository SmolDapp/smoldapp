import React from 'react';
import Image from 'next/image';
import {extend} from 'dayjs';
import dayjsDuration from 'dayjs/plugin/duration.js';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import weekday from 'dayjs/plugin/weekday.js';

import type {ReactElement} from 'react';

extend(relativeTime);
extend(dayjsDuration);
extend(weekday);

function TokenListCardCreator({item}: {item: {
	name: string;
	logoURI: string;
	description: string;
}}): ReactElement {
	return (
		<div className={'relative flex w-full flex-col'}>
			<div className={'mb-2 flex w-full items-start justify-between px-4'}>
				{item.logoURI === '' ? (
					<div className={'h-9 w-9 rounded-full bg-neutral-200'} />
				) : (
					<Image
						unoptimized
						src={item.logoURI?.startsWith('ipfs://') ? `https://ipfs.io/ipfs/${item.logoURI.replace('ipfs://', '')}` : item.logoURI}
						width={36}
						height={36}
						alt={''} />
				)}
				<div className={'flex flex-col text-end text-xs text-neutral-500'}>
					<small>{'v0.0.0'}</small>
				</div>
			</div>
			<div className={'w-full px-4 text-left'}>
				<b className={`${item.name ? 'text-neutral-900' : 'text-neutral-400'}`}>
					{item.name || 'My Tokenlist'}
				</b>
				<p
					className={`text-sm line-clamp-3 ${item.description ? 'text-neutral-500' : 'italic text-neutral-400'}`}>
					{item.description || 'Aut aliquam perspiciatis sint. Perferendis sint dolorem quaerat. Hic accusamus quo laboriosam.'}
				</p>
			</div>
		</div>
	);
}
export default TokenListCardCreator;
