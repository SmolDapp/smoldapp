'use client';

import React, {useState} from 'react';
import {DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuSeparator} from 'components/Primitives/DropdownMenu';
import {cl} from '@builtbymom/web3/utils';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {supportedNetworks} from '@utils/tools.chains';
import {IconChevronBottom} from '@yearn-finance/web-lib/icons/IconChevronBottom';

import type {InputHTMLAttributes, ReactElement} from 'react';
import type {TNDict} from '@builtbymom/web3/types';

function NetworkDropdownTrigger(
	props: {
		selectedNetworks: TNDict<boolean>;
		value: number[];
		onChange: (value: number[]) => void;
	} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>
): ReactElement {
	/**************************************************************************
	 * In the fake input box, we want to display the name of the selected
	 * networks. To do so, we filter the selected networks and map them to
	 * their name.
	 *************************************************************************/
	const selectedNetworksName = Object.entries(props.selectedNetworks)
		.filter(([, isSelected]) => isSelected)
		.map(([networkId]) => supportedNetworks.find(network => network.id === Number(networkId))?.name)
		.join(', ');

	return (
		<div
			aria-disabled={props.disabled}
			className={cl(
				'w-full rounded-lg py-3 pl-4 pr-8 relative text-xs group',
				selectedNetworksName ? 'text-neutral-900' : 'text-neutral-600',
				'placeholder:text-neutral-600 caret-neutral-700',
				'group-focus-within:placeholder:text-neutral-300 placeholder:transition-colors',
				'border border-neutral-400 aria-disabled:border-transparent',
				'cursor-pointer text-left',
				props.disabled ? 'bg-neutral-300 cursor-default' : 'bg-neutral-0 group-focus-within:border-neutral-600'
			)}>
			<p>{selectedNetworksName || 'Select chains'}</p>
			<span className={'absolute inset-y-0 right-2 flex h-full items-center justify-center'}>
				<IconChevronBottom
					className={cl(
						'h-4 w-4 text-neutral-600 transition-colors',
						props.disabled ? '' : 'group-hover:text-neutral-900'
					)}
				/>
			</span>
		</div>
	);
}

export function NetworkDropdownSelector(
	props: {
		value: number[];
		onChange: (value: number[]) => void;
	} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>
): ReactElement {
	/**************************************************************************
	 * If some networks are passed as props, we want to use them. As we are
	 * using a TNDict to store the selected networks, we need to convert the
	 * array of networks into a TNDict.
	 *************************************************************************/
	const [selectedNetworks, set_selectedNetworks] = useState<TNDict<boolean>>(
		props.value.reduce((acc: TNDict<boolean>, networkId) => {
			acc[networkId] = true;
			return acc;
		}, {})
	);

	/**************************************************************************
	 * All the networks are selected if all the values in the object are set to
	 * true and the length of the object is equal to the length of the
	 * supported networks.
	 *************************************************************************/
	const areAllSelected =
		Object.values(selectedNetworks).every(Boolean) &&
		Object.keys(selectedNetworks).length === supportedNetworks.length;

	const onOpenChange = (isOpen: boolean): void => {
		if (!isOpen) {
			props.onChange(
				Object.keys(selectedNetworks)
					.filter(chainId => {
						return selectedNetworks[+chainId];
					})
					.map(Number)
			);
		}
	};

	return (
		<DropdownMenu.Root onOpenChange={onOpenChange}>
			<DropdownMenu.Trigger
				disabled={props.disabled}
				className={'withRing w-lg group -m-1 rounded p-1'}>
				{props.children || (
					<NetworkDropdownTrigger
						selectedNetworks={selectedNetworks}
						{...props}
					/>
				)}
			</DropdownMenu.Trigger>
			<DropdownMenuContent>
				<div className={'p-2 pt-0'}>
					<b className={'text-xs'}>{'Select Chains'}</b>
					<p className={'text-xs text-neutral-600'}>
						{'This is an expert setting, be sure you know how it works'}
					</p>
				</div>
				<DropdownMenuCheckboxItem
					checked={areAllSelected}
					onCheckedChange={() => {
						set_selectedNetworks(
							supportedNetworks.reduce((acc: TNDict<boolean>, network) => {
								acc[network.id] = areAllSelected ? false : true;
								return acc;
							}, {})
						);
					}}>
					{'Select all'}
				</DropdownMenuCheckboxItem>
				<DropdownMenuSeparator />
				{supportedNetworks.map(network => (
					<DropdownMenuCheckboxItem
						key={network.id}
						checked={selectedNetworks[network.id]}
						onCheckedChange={checked => set_selectedNetworks(prev => ({...prev, [network.id]: checked}))}>
						{network.name}
					</DropdownMenuCheckboxItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu.Root>
	);
}
