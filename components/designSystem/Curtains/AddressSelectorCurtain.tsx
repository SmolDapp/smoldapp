'use client';

import React, {Fragment, useEffect, useMemo, useState} from 'react';
import {CloseCurtainButton} from 'components/designSystem/Curtains/InfoCurtain';
import {CurtainContent} from 'components/Primitives/Curtain';
import {TextInput} from 'components/Primitives/TextInput';
import {useAddressBook} from 'contexts/useAddressBook';
import {useIsMounted} from 'hooks/useIsMounted';
import * as Dialog from '@radix-ui/react-dialog';
import {toAddress} from '@utils/tools.address';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';

import {AddressBookEntry} from '../AddressBookEntry';

import type {TSelectCallback} from 'contexts/useAddressBook';
import type {ReactElement} from 'react';

export function AddressSelectorCurtain(props: {
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
	onSelect: TSelectCallback | undefined;
}): ReactElement {
	const isMounted = useIsMounted();
	const {listCachedEntries} = useAddressBook();
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
		return listCachedEntries().filter(
			entry =>
				entry.label.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase()) ||
				toAddress(entry.address).toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())
		);
	}, [listCachedEntries, searchValue]);

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

	if (!isMounted) {
		return <Fragment />;
	}

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
						<TextInput
							value={searchValue}
							onChange={set_searchValue}
						/>
						<div className={'scrollable mb-8 flex flex-col pb-2'}>
							{filteredEntries.length === 0 ? (
								<div>
									<p className={'text-center text-xs text-neutral-600'}>{'No contact found.'}</p>
								</div>
							) : (
								<>
									<small className={'mt-0'}>{'Favorite'}</small>
									{favorite.length > 0 ? (
										favorite.map(entry => (
											<AddressBookEntry
												key={entry.address}
												isChainRestricted
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
										<AddressBookEntry
											key={entry.address}
											isChainRestricted
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
										<AddressBookEntry
											key={entry.address}
											isChainRestricted
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
