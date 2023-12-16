'use client';

import React, {createContext, useCallback, useContext, useMemo, useState} from 'react';
import assert from 'assert';
import {AddressSelectorCurtain} from 'components/designSystem/Curtains/AddressSelectorCurtain';
import {useAsyncTrigger} from 'hooks/useAsyncTrigger';
import setupIndexedDB, {useIndexedDBStore} from 'use-indexeddb';
import {useMountEffect} from '@react-hookz/web';
import {slugify} from '@utils/helpers';
import {isAddress, toAddress} from '@utils/tools.address';

import type {IndexedDBConfig} from 'use-indexeddb/dist/interfaces';
import type {TAddress} from '@utils/tools.address';

export type TAddressBookEntry = {
	id?: number;
	address: TAddress | undefined;
	label: string;
	chains: number[];
	slugifiedLabel: string;
	ens?: string;
	isFavorite?: boolean;
};
export type TSelectCallback = (item: TAddressBookEntry) => void;
export type TAddressBookCurtainProps = {
	shouldOpenCurtain: boolean;
	listEntries: () => Promise<TAddressBookEntry[]>;
	listCachedEntries: () => TAddressBookEntry[];
	getEntry: (props: {address?: TAddress; label?: string}) => Promise<TAddressBookEntry | undefined>;
	getCachedEntry: (props: {address?: TAddress; label?: string}) => TAddressBookEntry | undefined;
	updateEntry: (entry: TAddressBookEntry) => Promise<void>;
	deleteEntry: (address: TAddress) => Promise<void>;
	onOpenCurtain: (callbackFn: TSelectCallback) => void;
	onCloseCurtain: () => void;
};
const defaultProps: TAddressBookCurtainProps = {
	shouldOpenCurtain: false,
	listEntries: async (): Promise<TAddressBookEntry[]> => [],
	listCachedEntries: (): TAddressBookEntry[] => [],
	getEntry: async (): Promise<TAddressBookEntry | undefined> => undefined,
	getCachedEntry: (): TAddressBookEntry | undefined => undefined,
	updateEntry: async (): Promise<void> => undefined,
	deleteEntry: async (): Promise<void> => undefined,
	onOpenCurtain: (): void => undefined,
	onCloseCurtain: (): void => undefined
};

/******************************************************************************
 * Open the link with the IndexDB Storage. Might be moved to a separate file on
 * a higher level to handle multiple stores.
 *****************************************************************************/
const addressBookIDBConfig: IndexedDBConfig = {
	databaseName: 'smol',
	version: 1,
	stores: [
		{
			name: 'address-book',
			id: {keyPath: 'id', autoIncrement: true},
			indices: [
				{name: 'address', keyPath: 'address', options: {unique: true}},
				{name: 'label', keyPath: 'label'},
				{name: 'slugifiedLabel', keyPath: 'slugifiedLabel'},
				{name: 'chains', keyPath: 'chains'},
				{name: 'isFavorite', keyPath: 'isFavorite'}
			]
		}
	]
};

const AddressBookContext = createContext<TAddressBookCurtainProps>(defaultProps);
export const WithAddressBook = ({children}: {children: React.ReactElement}): React.ReactElement => {
	const [shouldOpenCurtain, set_shouldOpenCurtain] = useState(false);
	const [cachedEntries, set_cachedEntries] = useState<TAddressBookEntry[]>([]);
	const [entryNonce, set_entryNonce] = useState<number>(0);
	const [currentCallbackFunction, set_currentCallbackFunction] = useState<TSelectCallback | undefined>(undefined);
	const {add, getAll, getOneByKey, deleteByID, update} = useIndexedDBStore<TAddressBookEntry>('address-book');

	useMountEffect(async () => setupIndexedDB(addressBookIDBConfig));

	useAsyncTrigger(async (): Promise<void> => {
		entryNonce;
		const entriesFromDB = await getAll();
		set_cachedEntries(entriesFromDB);
	}, [getAll, entryNonce]);

	/**************************************************************************
	 * Callback function that can be used to retrieve an entry from the
	 * address book.
	 * It can be used to retrieve an entry by its address or by its label.
	 *************************************************************************/
	const listEntries = useCallback(async (): Promise<TAddressBookEntry[]> => {
		entryNonce;
		return await getAll();
	}, [getAll, entryNonce]);

	const listCachedEntries = useCallback((): TAddressBookEntry[] => {
		entryNonce;
		return cachedEntries;
	}, [cachedEntries, entryNonce]);

	/**************************************************************************
	 * Callback function that can be used to retrieve an entry from the
	 * address book.
	 * It can be used to retrieve an entry by its address or by its label.
	 *************************************************************************/
	const getEntry = useCallback(
		async (props: {address?: TAddress; label?: string}): Promise<TAddressBookEntry | undefined> => {
			entryNonce;
			if (!isAddress(props.address) && !props.label) {
				return undefined;
			}

			try {
				const foundByAddress = await getOneByKey('address', toAddress(props.address));
				if (foundByAddress) {
					return foundByAddress;
				}
				if (props.label) {
					const foundByLabel = await getOneByKey('slugifiedLabel', slugify(props.label || ''));
					return foundByLabel || undefined;
				}
				return undefined;
			} catch (error) {
				return undefined;
			}
		},
		[getOneByKey, entryNonce]
	);
	const getCachedEntry = useCallback(
		(props: {address?: TAddress; label?: string}): TAddressBookEntry | undefined => {
			entryNonce;
			if (!isAddress(props.address) && !props.label) {
				return undefined;
			}

			const foundByAddress = cachedEntries.find(entry => entry.address === props.address);
			if (foundByAddress) {
				return foundByAddress;
			}
			const foundByLabel = cachedEntries.find(entry => entry.slugifiedLabel === slugify(props.label || ''));
			return foundByLabel || undefined;
		},
		[cachedEntries, entryNonce]
	);

	/**************************************************************************
	 * Callback function that can be used to update an entry in the address
	 * book. If the entry does not exist, it will be created.
	 *************************************************************************/
	const updateEntry = useCallback(
		async (entry: TAddressBookEntry): Promise<void> => {
			try {
				const existingEntry = await getEntry({address: entry.address});
				if (existingEntry) {
					update({...existingEntry, ...entry});
					set_entryNonce(nonce => nonce + 1);
				} else {
					assert(isAddress(entry.address));
					add({
						...entry,
						slugifiedLabel: slugify(entry.label),
						isFavorite: entry.isFavorite || false
					});
					set_entryNonce(nonce => nonce + 1);
				}
			} catch {
				// Do nothing
			}
		},
		[add, getEntry, update]
	);

	/**************************************************************************
	 * Callback function that can be used to delete an entry from the address
	 * book.
	 *************************************************************************/
	const deleteEntry = useCallback(
		async (address: TAddress): Promise<void> => {
			try {
				const existingEntry = await getEntry({address: address});
				if (existingEntry) {
					deleteByID(existingEntry.id);
					set_entryNonce(nonce => nonce + 1);
				}
			} catch {
				// Do nothing
			}
		},
		[deleteByID, getEntry]
	);

	/**************************************************************************
	 * Context value that is passed to all children of this component.
	 *************************************************************************/
	const contextValue = useMemo(
		(): TAddressBookCurtainProps => ({
			shouldOpenCurtain,
			listEntries,
			listCachedEntries,
			getEntry,
			getCachedEntry,
			updateEntry,
			deleteEntry,
			onOpenCurtain: (callbackFn): void => {
				set_currentCallbackFunction(() => callbackFn);
				set_shouldOpenCurtain(true);
			},
			onCloseCurtain: (): void => set_shouldOpenCurtain(false)
		}),
		[shouldOpenCurtain, listEntries, listCachedEntries, getEntry, getCachedEntry, updateEntry, deleteEntry]
	);

	return (
		<AddressBookContext.Provider value={contextValue}>
			{children}
			<AddressSelectorCurtain
				isOpen={shouldOpenCurtain}
				onOpenChange={set_shouldOpenCurtain}
				onSelect={currentCallbackFunction}
			/>
		</AddressBookContext.Provider>
	);
};

export const useAddressBook = (): TAddressBookCurtainProps => useContext(AddressBookContext);
