'use client';

import React, {useEffect, useMemo, useState} from 'react';
import Image from 'next/image';
import {TooltipContent} from 'components/Primitives/Tooltip';
import {useAddressBook} from 'contexts/useAddressBook';
import {useIsMounted} from 'hooks/useIsMounted';
import {useEnsAvatar, useEnsName} from 'wagmi';
import {IconHeartFilled} from '@icons/IconHeart';
import * as Tooltip from '@radix-ui/react-tooltip';
import {useUpdateEffect} from '@react-hookz/web';
import {getColorFromAdddress, isAddress, safeAddress, toAddress} from '@utils/tools.address';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {copyToClipboard} from '@yearn-finance/web-lib/utils/helpers';

import type {TAddressBookEntry} from 'contexts/useAddressBook';
import type {ReactElement} from 'react';
import type {TAddress} from '@utils/tools.address';

export function AddressBookEntryAvatar(props: {
	src: string | null | undefined;
	address: TAddress | undefined;
	isLoading: boolean;
	sizeClassname?: string;
}): ReactElement {
	const [imageSrc, set_imageSrc] = useState(props.src);
	const hasAvatar = useMemo(() => imageSrc !== undefined, [imageSrc]);
	const addressColor = useMemo(() => getColorFromAdddress({address: toAddress(props.address)}), [props.address]);
	const sizeClassname = props.sizeClassname || 'h-8 w-8 min-w-[32px]';

	useUpdateEffect((): void => {
		set_imageSrc(props.src);
	}, [props.src]);

	if (props.isLoading) {
		return <div className={cl('skeleton-full', sizeClassname)} />;
	}
	if (!hasAvatar && !isAddress(props.address)) {
		return <div className={cl('rounded-full bg-neutral-200', sizeClassname)} />;
	}
	if (!hasAvatar || !imageSrc) {
		return (
			<div
				style={{background: addressColor}}
				className={cl('rounded-full', sizeClassname)}
			/>
		);
	}
	return (
		<div className={cl('rounded-full bg-neutral-200/40', sizeClassname)}>
			<Image
				className={'rounded-full'}
				unoptimized
				src={imageSrc || ''}
				width={128}
				height={128}
				alt={''}
				onError={() => set_imageSrc(undefined)}
			/>
		</div>
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
			<div className={'grid w-full min-w-[288px] gap-2'}>
				<div className={'skeleton-lg h-4 w-full'} />
				<div className={'skeleton-lg h-4 w-2/3'} />
			</div>
		);
	}

	return (
		<div className={'grid w-full'}>
			<b className={'text-left text-base'}>
				{safeAddress({address: props.address, ens: props.ens, addrOverride: props.address?.substring(0, 6)})}
			</b>
			<Tooltip.Provider delayDuration={250}>
				<Tooltip.Root>
					<Tooltip.Trigger className={'flex w-fit items-center'}>
						<small className={'cursor-pointer hover:underline'}>
							{props.shouldTruncateAddress ? safeAddress({address: props.address}) : props.address}
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
		enabled: Boolean(ensName || props.entry.ens)
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
				'mb-2 flex flex-row items-center justify-between rounded-lg p-4 w-full',
				'bg-neutral-200 hover:bg-neutral-300 transition-colors',
				props.isChainRestricted && !props.entry.chains.includes(chainID)
					? 'opacity-40 hover:opacity-100 transition-opacity'
					: ''
			)}>
			<div className={'relative flex w-full gap-2'}>
				<AddressBookEntryAvatar
					isLoading={isLoadingAvatar}
					address={toAddress(props.entry.address)}
					src={avatar}
					sizeClassname={'h-10 w-10 min-w-[40px]'}
				/>
				<AddressBookEntryAddress
					address={toAddress(props.entry.address)}
					ens={ensName ? `${props.entry.label} (${ensName})` : props.entry.label}
				/>
				<div className={'pointer-events-none absolute inset-y-0 right-0 flex items-center'}>
					<IconHeartFilled
						className={cl(
							'h-4 w-4 transition-colors',
							props.entry.isFavorite ? 'text-neutral-600' : 'text-transparent'
						)}
					/>
				</div>
			</div>
		</div>
	);
}
