'use client';

import React, {useEffect} from 'react';
import {TooltipContent} from 'components/Primitives/Tooltip';
import {useAddressBook} from 'contexts/useAddressBook';
import {useIsMounted} from 'hooks/useIsMounted';
import {useEnsAvatar, useEnsName} from 'wagmi';
import {useChainID} from '@builtbymom/web3/hooks/useChainID';
import {cl, toAddress, toSafeAddress} from '@builtbymom/web3/utils';
import {IconHeart, IconHeartFilled} from '@icons/IconHeart';
import * as Tooltip from '@radix-ui/react-tooltip';
import {copyToClipboard} from '@yearn-finance/web-lib/utils/helpers';

import {Avatar} from './Avatar';

import type {TAddressBookEntry} from 'contexts/useAddressBook';
import type {MouseEventHandler, ReactElement} from 'react';
import type {TAddress} from '@builtbymom/web3/types';

function EntryBookEntryFavorite(props: {
	isFavorite: boolean;
	onClick: MouseEventHandler<HTMLButtonElement>;
}): ReactElement {
	return (
		<button
			role={'switch'}
			onClick={props.onClick}
			className={'withRing -mr-1 -mt-1 rounded p-1'}>
			<div className={'group relative flex size-4 items-center justify-center'}>
				<IconHeart
					className={cl(
						'absolute h-4 w-4 transition-colors',
						props.isFavorite
							? 'text-transparent group-hover:text-neutral-400 hover:!text-neutral-600'
							: 'text-transparent group-hover:text-neutral-600'
					)}
				/>
				<IconHeartFilled
					className={cl(
						'absolute h-4 w-4 transition-colors',
						props.isFavorite ? 'text-neutral-600' : 'text-transparent hover:!text-neutral-400'
					)}
				/>
			</div>
		</button>
	);
}

export function AddressBookEntryAddress(props: {
	address: TAddress | undefined;
	ens: string | undefined;
	isConnecting?: boolean;
	shouldTruncateAddress?: boolean;
}): ReactElement {
	const isMounted = useIsMounted();

	if (!isMounted || props.isConnecting) {
		return (
			<div className={'grid w-full max-w-[288px] gap-2'}>
				<div className={'skeleton-lg h-4 w-full'} />
				<div className={'skeleton-lg h-4 w-2/3'} />
			</div>
		);
	}

	return (
		<div className={'grid w-full'}>
			<b className={'text-left text-base'}>
				{toSafeAddress({address: props.address, ens: props.ens, addrOverride: props.address?.substring(0, 6)})}
			</b>
			<Tooltip.Provider delayDuration={250}>
				<Tooltip.Root>
					<Tooltip.Trigger className={'flex w-fit items-center'}>
						<small className={'cursor-pointer hover:underline'}>
							{props.shouldTruncateAddress ? toSafeAddress({address: props.address}) : props.address}
						</small>
					</Tooltip.Trigger>
					<TooltipContent
						side={'left'}
						className={'TooltipContent bg-primary !p-0'}>
						<button
							onClick={e => {
								e.stopPropagation();
								copyToClipboard(toAddress(props.address));
							}}
							className={'flex cursor-copy px-2 py-1.5'}>
							<small className={'font-number text-xxs text-neutral-900/70'}>
								{toAddress(props.address)}
							</small>
						</button>
						<Tooltip.Arrow
							className={'fill-primary'}
							width={11}
							height={5}
						/>
					</TooltipContent>
				</Tooltip.Root>
			</Tooltip.Provider>
		</div>
	);
}
export function AddressBookEntry(props: {
	entry: TAddressBookEntry;
	onSelect: (entry: TAddressBookEntry) => void;
	isChainRestricted?: boolean;
}): ReactElement {
	const {chainID} = useChainID();
	const {updateEntry} = useAddressBook();
	const {data: ensName} = useEnsName({
		chainId: 1,
		address: toAddress(props.entry.address)
	});
	const {data: avatar, isLoading: isLoadingAvatar} = useEnsAvatar({
		chainId: 1,
		name: ensName || props.entry.ens,
		query: {
			enabled: Boolean(ensName || props.entry.ens)
		}
	});

	useEffect((): void => {
		if ((ensName && !props.entry.ens) || (ensName && props.entry.ens !== ensName)) {
			updateEntry({...props.entry, ens: ensName});
		}
	}, [ensName, props.entry, updateEntry]);

	return (
		<div
			role={'button'}
			onClick={() => {
				props.onSelect({...props.entry, ens: ensName || undefined});
			}}
			className={cl(
				'mb-2 flex flex-row items-center justify-between rounded-lg p-4 w-full group',
				'bg-neutral-200 hover:bg-neutral-300 transition-colors',
				props.isChainRestricted && !props.entry.chains.includes(chainID)
					? 'opacity-40 hover:opacity-100 transition-opacity'
					: ''
			)}>
			<div className={'relative flex w-full items-center gap-2'}>
				<Avatar
					isLoading={isLoadingAvatar}
					address={toAddress(props.entry.address)}
					label={props.entry.label}
					src={avatar}
				/>
				<AddressBookEntryAddress
					address={toAddress(props.entry.address)}
					ens={ensName ? `${props.entry.label} (${ensName})` : props.entry.label}
				/>
				<div className={'absolute inset-y-0 right-0 flex items-center'}>
					<EntryBookEntryFavorite
						isFavorite={Boolean(props.entry.isFavorite)}
						onClick={event => {
							event.stopPropagation();
							updateEntry({...props.entry, isFavorite: !props.entry.isFavorite});
						}}
					/>
				</div>
			</div>
		</div>
	);
}
