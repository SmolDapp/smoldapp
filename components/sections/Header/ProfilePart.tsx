'use client';

import React from 'react';
import {useTokenList} from 'contexts/useTokenList';
import {useEnsAvatar} from 'wagmi';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress, truncateHex} from '@yearn-finance/web-lib/utils/address';

import {Avatar} from './Avatar';
import {LinksPart} from './LinksPart';

import type {ReactElement} from 'react';

export function ProfilePart(): ReactElement {
	const {address, ens} = useWeb3();
	const {data: ensAvatar} = useEnsAvatar({name: ens, chainId: 1});
	const {openTokenListModal} = useTokenList();

	return (
		<div className={'relative col-span-8 flex flex-col'}>
			<div className={'ml-0 mt-2 flex flex-row items-center space-x-2 md:-ml-2 md:mt-0 md:space-x-4'}>
				<Avatar
					address={toAddress(address)}
					src={ensAvatar}
				/>
				<span>
					<h1
						suppressHydrationWarning
						className={'flex flex-row items-center text-xl tracking-tight text-neutral-900 md:text-3xl'}>
						{ens || truncateHex(address, 6)}
					</h1>
					<p className={'font-number text-xxs font-normal tracking-normal text-neutral-400 md:text-xs'}>
						<span
							suppressHydrationWarning
							className={'hidden md:inline'}>
							{address}
						</span>
						<span
							suppressHydrationWarning
							className={'inline pl-1 md:hidden'}>
							{truncateHex(address, 8)}
						</span>
					</p>
				</span>
			</div>
			<p className={'mt-2 min-h-[30px] text-sm text-neutral-500 md:mt-4 md:min-h-[60px] md:text-base'}>
				{'Simple, smart and elegant dapps, designed to make your crypto journey a little bit easier.'}
			</p>
			<div className={'mt-auto items-center justify-between pt-6 md:flex'}>
				<div className={'hidden w-full flex-row justify-between gap-4 md:flex'}>
					<LinksPart />
					<div>
						<Button
							onClick={openTokenListModal}
							data-size={'tight'}
							variant={'outlined'}>
							{'Manage token lists'}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
