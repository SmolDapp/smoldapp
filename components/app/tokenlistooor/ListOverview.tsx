import React from 'react';
import {ImageWithFallback} from 'components/ImageWithFallback';

import type {ReactElement} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/types';

type TListDefaultProps = {
	listAddress: TAddress,
	mainListooor: TAddress,
	name: string,
	description: string,
	logoURI: string,
	baseURI: string,
	endorsed: boolean,
	count: number,
}
function	ListOverview({list}: {list: TListDefaultProps}): ReactElement {
	return (
		<div className={'box-0 grid grid-cols-12 overflow-hidden'}>
			<div className={'col-span-4 flex h-full w-full items-center justify-center bg-neutral-900 p-6'}>
				<ImageWithFallback
					className={'mx-auto w-3/4 object-cover text-neutral-0'}
					unoptimized
					alt={list.name}
					width={400}
					height={400}
					quality={90}
					src={list.logoURI}
				/>
			</div>
			<div className={'col-span-8 w-full p-6'}>
				<b>{list.name}</b>
				<p className={'mt-2 text-sm text-neutral-500'}>
					{list.description || `A list of token for ${list.name}`}
				</p>
				<div className={'mt-auto flex w-full flex-row items-center justify-between space-x-10 pt-6 text-left text-sm'}>
					<small className={'font-medium text-neutral-600'}>{'List Address'}</small>
					<p className={'font-number'}>{list.listAddress}</p>
				</div>
				<div className={'mt-auto flex w-full flex-row items-center justify-between space-x-10 pt-2 text-left text-sm'}>
					<small className={'font-medium text-neutral-600'}>{'Owner'}</small>
					<p className={'font-number'}>{list.mainListooor}</p>
				</div>
				<div className={'mt-auto flex w-full flex-row items-center justify-between space-x-10 pt-2 text-left text-sm'}>
					<small className={'font-medium text-neutral-600'}>{'BaseURI'}</small>
					<p className={'font-number truncate text-right'}>{list.baseURI}</p>
				</div>
				<div className={'mt-auto flex w-full flex-row items-center justify-between space-x-10 pt-2 text-left text-sm'}>
					<small className={'font-medium text-neutral-600'}>{'Tokens'}</small>
					<p className={'font-number'}>{list.count}</p>
				</div>
			</div>
		</div>
	);
}


export default ListOverview;
