'use client';

import React, {useMemo} from 'react';
import Image from 'next/image';

import type {ReactElement} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/types';

export function Avatar({src, address}: {src: string | null | undefined; address: TAddress}): ReactElement {
	const randomColor = useMemo((): string => {
		const addressAsNumber = parseInt(address.slice(2), 16) % 0xffffff;
		return `#${Math.floor(addressAsNumber).toString(16)}`;
	}, [address]);

	return (
		<div className={'h-14 max-h-[56px] min-h-[56px] w-12 min-w-[56px] max-w-[56px] rounded-2xl bg-neutral-200'}>
			{!src ? (
				<div
					suppressHydrationWarning
					className={'!h-14 !w-14 rounded-2xl object-cover'}
					style={{backgroundColor: randomColor}}>
					<div />
				</div>
			) : (
				<Image
					src={src}
					alt={''}
					className={'!h-14 !w-14 rounded-2xl object-cover outline outline-neutral-100'}
					width={400}
					height={400}
					unoptimized
				/>
			)}
		</div>
	);
}
