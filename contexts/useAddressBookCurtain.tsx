'use client';

import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import Image from 'next/image';
import {CloseCurtainButton} from 'components/designSystem/Curtain';
import {useEnsAvatar, useEnsName} from 'wagmi';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tooltip from '@radix-ui/react-tooltip';
import {useUpdateEffect} from '@react-hookz/web';
import {isAddress, safeAddress, toAddress} from '@utils/tools.address';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {copyToClipboard} from '@yearn-finance/web-lib/utils/helpers';
import {CurtainContent} from '@common/Primitives/Curtain';
import {TooltipContent} from '@common/Primitives/Tooltip';

import type {ReactElement} from 'react';
import type {TAddress} from '@utils/tools.address';

export type TAddressBookEntry = {
	address: TAddress;
	label: string;
	chains: number[];
	ens?: string;
	isFavorite?: boolean;
};
export type TSelectCallback = (item: TAddressBookEntry) => void;
export type TAddressBookCurtainProps = {
	shouldOpenCurtain: boolean;
	getAddressBookEntry: (props: {address?: TAddress; label?: string}) => TAddressBookEntry | undefined;
	updateEntry: (entry: TAddressBookEntry) => void;
	onOpenCurtain: (callbackFn: TSelectCallback) => void;
	onCloseCurtain: () => void;
};
const defaultProps: TAddressBookCurtainProps = {
	shouldOpenCurtain: false,
	getAddressBookEntry: (): TAddressBookEntry | undefined => undefined,
	updateEntry: (): void => undefined,
	onOpenCurtain: (): void => undefined,
	onCloseCurtain: (): void => undefined
};

const entriesInAddressBook: TAddressBookEntry[] = [
	{
		address: '0x9E63B020ae098E73cF201EE1357EDc72DFEaA518',
		label: 'A grumpy Major',
		chains: [1, 10, 56, 100, 137, 250, 1101, 324, 8453, 42161]
	},
	{
		address: '0x334CE923420ff1aA4f272e92BF68013D092aE7B4',
		label: 'Mr. CEO',
		chains: [1, 10, 56, 100, 137, 250, 1101, 324, 8453, 42161]
	},
	{
		address: '0x2c77DCdec3D375681B65D9e2dF12e87255486223',
		label: 'Dad',
		chains: [1, 10, 8453]
	},
	// {
	// 	address: '0xbC62b72821be835aaC35853E5296B4B05856b51A',
	// 	label: 'Electricity Provider',
	// 	chains: [1]
	// },
	{
		address: '0x45BF1Cc5F3FfE58Fec6DDcF042ECc187A1d025CF',
		label: 'Cold Storage',
		chains: [1, 10, 56, 100, 137, 250, 1101, 324, 8453, 42161]
	},
	// {
	// 	address: '0x7f76E7a3fe9d8090169757c3d992F52af7a22067',
	// 	label: '',
	// 	chains: [1, 10, 56, 100, 137, 250, 1101, 324, 8453, 42161]
	// },
	// {
	// 	address: '0x0A098Eda01Ce92ff4A4CCb7A4fFFb5A43EBC70DC',
	// 	label: '',
	// 	chains: [1, 10, 56, 100, 137, 250, 1101, 324, 8453, 42161]
	// },
	{
		address: '0x4F909396A75FE9d59F584156A851B3770f3F438a',
		label: 'Mom',
		chains: [1, 10, 56, 100, 137, 250, 1101, 324, 8453, 42161],
		isFavorite: true
	},
	{
		address: '0xE481a5144f76A3EAC704c1f7dE0d5270618EAe4d',
		label: '',
		chains: [137]
	},
	{
		address: '0x3c8cB169E5cBfFfBf3bD338aA5f9c5aB6A1AeFf7',
		label: '',
		chains: [250]
	},
	// {
	// 	address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
	// 	label: '',
	// 	chains: [1, 8453, 42161]
	// },
	// {
	// 	address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
	// 	label: '',
	// 	chains: [1, 10, 324, 8453, 42161]
	// },
	{
		address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
		label: '',
		chains: [10]
	},
	{
		address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
		label: '',
		chains: [324]
	}
];

export function EntryAvatar(props: {
	src: string | null | undefined;
	address: TAddress | undefined;
	isLoading: boolean;
}): ReactElement {
	const [imageSrc, set_imageSrc] = useState(props.src);
	const hasAvatar = useMemo(() => imageSrc !== undefined, [imageSrc]);
	const addressColor = useMemo((): string => {
		if (!props.address) {
			return '#000000';
		}
		let hash = 0;
		for (let i = 0; i < props.address.length; i++) {
			hash = props.address.charCodeAt(i) + ((hash << 5) - hash);
		}
		let color = '#';
		for (let i = 0; i < 3; i++) {
			const value = (hash >> (i * 8)) & 0xff;
			color += value.toString(16).padStart(2, '0');
		}
		return color;
	}, [props.address]);

	useUpdateEffect((): void => {
		set_imageSrc(props.src);
	}, [props.src]);

	if (props.isLoading) {
		return <div className={'skeleton-full h-8 w-8 min-w-[32px]'} />;
	}
	if (!hasAvatar && !isAddress(props.address)) {
		return <div className={'h-8 w-8 min-w-[32px] rounded-full bg-neutral-200'} />;
	}
	if (!hasAvatar) {
		return (
			<div
				style={{background: addressColor}}
				className={'h-8 w-8 min-w-[32px] rounded-full'}
			/>
		);
	}
	return (
		<div className={'h-8 w-8 min-w-[32px] rounded-full bg-neutral-200/40'}>
			<Image
				className={'rounded-full'}
				unoptimized
				src={imageSrc || ''}
				width={32}
				height={32}
				alt={''}
				onError={() => set_imageSrc(undefined)}
			/>
		</div>
	);
}
export function EntryAddress(props: {address: TAddress | undefined; ens: string | undefined}): ReactElement {
	return (
		<div className={'grid w-full'}>
			<b className={'text-left text-base'}>
				{safeAddress({address: props.address, ens: props.ens, addrOverride: props.address?.substring(0, 6)})}
			</b>
			<Tooltip.Provider delayDuration={250}>
				<Tooltip.Root>
					<Tooltip.Trigger className={'flex w-fit items-center'}>
						<p className={'text-xs text-neutral-600 underline'}>{safeAddress({address: props.address})}</p>
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
function Entry(props: {entry: TAddressBookEntry; onSelect: (entry: TAddressBookEntry) => void}): ReactElement {
	const {chainID} = useChainID();
	const {updateEntry} = useAddressBookCurtain();
	const {data: ensName} = useEnsName({
		chainId: 1,
		address: toAddress(props.entry.address),
		enabled: !!props.entry.ens
	});
	const {data: avatar, isLoading: isLoadingAvatar} = useEnsAvatar({
		chainId: 1,
		name: ensName || props.entry.ens,
		enabled: Boolean(ensName || props.entry.ens)
	});

	useEffect((): void => {
		if (ensName) {
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
				props.entry.chains.includes(chainID) ? '' : 'opacity-40 hover:opacity-100 transition-opacity'
			)}>
			<div className={'flex gap-2'}>
				<EntryAvatar
					isLoading={isLoadingAvatar}
					address={toAddress(props.entry.address)}
					src={avatar}
				/>
				<EntryAddress
					address={toAddress(props.entry.address)}
					ens={ensName ? `${props.entry.label} (${ensName})` : props.entry.label}
				/>
			</div>
		</div>
	);
}

function AddressBookCurtain(props: {
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
	onSelect: TSelectCallback | undefined;
}): ReactElement {
	const {chainID} = useChainID();
	const [searchValue, set_searchValue] = useState('');

	/**************************************************************************
	 * When the curtain is opened, we want to reset the search value.
	 * This is to avoid preserving the state accross multiple openings.
	 *************************************************************************/
	useEffect((): void => {
		if (props.isOpen) {
			set_searchValue('');
		}
	}, [props.isOpen]);

	/**************************************************************************
	 * Memo function that filters the entries in the address book based on
	 * the search value.
	 * Only entries the label or the address of which includes the search value
	 * will be returned.
	 *************************************************************************/
	const filteredEntries = useMemo(() => {
		return entriesInAddressBook.filter(
			e =>
				e.label.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase()) ||
				toAddress(e.address).toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())
		);
	}, [searchValue]);

	/**************************************************************************
	 * Memo function that splits the entries in the address book into three
	 * arrays: favorite, available and unavailable.
	 * An entry is considered available if it is available on the current
	 * chain.
	 *************************************************************************/
	const [favorite, availableEntries, unavailableEntries] = useMemo(() => {
		const favorite = [];
		const available = [];
		const unavailable = [];
		for (const entry of filteredEntries) {
			if (entry.chains.includes(chainID)) {
				if (entry.isFavorite) {
					favorite.push(entry);
				} else {
					available.push(entry);
				}
			} else {
				unavailable.push(entry);
			}
		}
		return [favorite, available, unavailable];
	}, [chainID, filteredEntries]);

	return (
		<Dialog.Root
			open={props.isOpen}
			onOpenChange={props.onOpenChange}>
			<CurtainContent>
				<aside
					style={{boxShadow: '-8px 0px 20px 0px rgba(36, 40, 51, 0.08)'}}
					className={'flex h-full flex-col overflow-y-hidden bg-neutral-0 p-6'}>
					<div className={'mb-4 flex flex-row items-center justify-between'}>
						<h3 className={'font-bold'}>{'Address Book'}</h3>
						<CloseCurtainButton />
					</div>
					<div className={'flex h-full flex-col gap-4'}>
						<input
							className={cl(
								'w-full border-neutral-400 rounded-lg bg-transparent py-3 px-4 text-base',
								'text-neutral-900 placeholder:text-neutral-600 caret-neutral-700',
								'focus:placeholder:text-neutral-300 placeholder:transition-colors',
								'focus:border-neutral-400'
							)}
							type={'text'}
							placeholder={'0x...'}
							autoComplete={'off'}
							autoCorrect={'off'}
							spellCheck={'false'}
							value={searchValue}
							onChange={e => set_searchValue(e.target.value)}
						/>
						<div className={'mb-4 flex flex-col overflow-y-scroll pb-2'}>
							{filteredEntries.length === 0 ? (
								<div>
									<p className={'text-center text-xs text-neutral-600'}>{'No contact found.'}</p>
								</div>
							) : (
								<>
									<small className={'mt-0'}>{'Favorite'}</small>
									{favorite.length > 0 ? (
										favorite.map(entry => (
											<Entry
												key={entry.address}
												entry={entry}
												onSelect={selected => {
													props.onSelect?.(selected);
													props.onOpenChange(false);
												}}
											/>
										))
									) : searchValue !== '' ? (
										<div
											className={
												'flex h-[72px] min-h-[72px] w-full items-center justify-center rounded-lg border border-dashed border-neutral-400'
											}>
											<p className={'text-center text-xs text-neutral-600'}>
												{'No favorite yet.'}
											</p>
										</div>
									) : null}
									<small className={'mt-4'}>{'Available on this chain'}</small>
									{availableEntries.map(entry => (
										<Entry
											key={entry.address}
											entry={entry}
											onSelect={selected => {
												props.onSelect?.(selected);
												props.onOpenChange(false);
											}}
										/>
									))}
									{unavailableEntries.length > 0 ? (
										<small className={'mt-4'}>{'Available on other chains'}</small>
									) : null}
									{unavailableEntries.map(entry => (
										<Entry
											key={entry.address}
											entry={entry}
											onSelect={selected => {
												props.onSelect?.(selected);
												props.onOpenChange(false);
											}}
										/>
									))}
								</>
							)}
						</div>
					</div>
				</aside>
			</CurtainContent>
		</Dialog.Root>
	);
}

const AddressBookCurtainContext = createContext<TAddressBookCurtainProps>(defaultProps);
export const AddressBookCurtainContextApp = ({children}: {children: React.ReactElement}): React.ReactElement => {
	const [shouldOpenCurtain, set_shouldOpenCurtain] = useState(false);
	const [currentCallbackFunction, set_currentCallbackFunction] = useState<TSelectCallback | undefined>(undefined);

	/**************************************************************************
	 * Callback function that can be used to retrieve an entry from the
	 * address book.
	 * It can be used to retrieve an entry by its address or by its label.
	 *************************************************************************/
	const getAddressBookEntry = useCallback(
		(props: {address?: TAddress; label?: string}): TAddressBookEntry | undefined => {
			if (!isAddress(props.address) && !props.label) {
				return undefined;
			}
			const foundByAddress = entriesInAddressBook.find(e => toAddress(e.address) === toAddress(props.address));
			if (foundByAddress) {
				return foundByAddress;
			}
			return entriesInAddressBook.find(
				e => e.label.toLocaleLowerCase() === (props.label || '').toLocaleLowerCase()
			);
		},
		[entriesInAddressBook]
	);

	/**************************************************************************
	 * Callback function that can be used to update an entry in the address
	 * book. If the entry does not exist, it will be created.
	 *************************************************************************/
	const updateEntry = useCallback(
		(entry: TAddressBookEntry): void => {
			const index = entriesInAddressBook.findIndex(e => toAddress(e.address) === toAddress(entry.address));
			if (index !== -1) {
				entriesInAddressBook[index] = entry;
			} else {
				entriesInAddressBook.push(entry);
			}
		},
		[entriesInAddressBook]
	);

	/**************************************************************************
	 * Context value that is passed to all children of this component.
	 *************************************************************************/
	const contextValue = useMemo(
		(): TAddressBookCurtainProps => ({
			shouldOpenCurtain,
			getAddressBookEntry,
			updateEntry,
			onOpenCurtain: (callbackFn): void => {
				set_currentCallbackFunction(() => callbackFn);
				set_shouldOpenCurtain(true);
			},
			onCloseCurtain: (): void => set_shouldOpenCurtain(false)
		}),
		[getAddressBookEntry, shouldOpenCurtain, updateEntry]
	);

	return (
		<AddressBookCurtainContext.Provider value={contextValue}>
			{children}
			<AddressBookCurtain
				isOpen={shouldOpenCurtain}
				onOpenChange={set_shouldOpenCurtain}
				onSelect={currentCallbackFunction}
			/>
		</AddressBookCurtainContext.Provider>
	);
};

export const useAddressBookCurtain = (): TAddressBookCurtainProps => useContext(AddressBookCurtainContext);
