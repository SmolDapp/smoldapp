'use client';

import React, {createContext, useCallback, useContext, useMemo, useState} from 'react';
import assert from 'assert';
import {AddressSelectorCurtain} from 'components/designSystem/Curtains/AddressSelectorCurtain';
import setupIndexedDB, {useIndexedDBStore} from 'use-indexeddb';
import {useAsyncTrigger} from '@builtbymom/web3/hooks/useAsyncTrigger';
import {useChainID} from '@builtbymom/web3/hooks/useChainID';
import {isAddress, toAddress} from '@builtbymom/web3/utils';
import {useMountEffect} from '@react-hookz/web';
import {slugify} from '@utils/helpers';

import type {IndexedDBConfig} from 'use-indexeddb/dist/interfaces';
import type {TAddress} from '@builtbymom/web3/types';

export type TAddressBookEntry = {
	id?: number; // Unique ID of the entry
	address: TAddress | undefined; // Address of the entry. Can be undefined if the entry is not yet saved.
	label: string; // Name the user gave to the address. Default to a truncated version of the address.
	chains: number[]; // List of chains on which the address is valid. Dynamically updated when the user interacts.
	slugifiedLabel: string; // Slugified version of the label. Used for searching.
	ens?: string; // ENS name of the address. Not saved in the database.
	isFavorite?: boolean; // Indicates if the address is a favorite.
	isHidden?: boolean; // Indicates if the address is hidden from the address book.
	numberOfInteractions?: number; // Number of times the address has been used for a action via Smol.
	tags?: string[]; // List of tags associated with the address.
};
export type TSelectCallback = (item: TAddressBookEntry) => void;
export type TAddressBookProps = {
	shouldOpenCurtain: boolean;
	listEntries: () => Promise<TAddressBookEntry[]>;
	listCachedEntries: () => TAddressBookEntry[];
	getEntry: (props: {address?: TAddress; label?: string}) => Promise<TAddressBookEntry | undefined>;
	getCachedEntry: (props: {address?: TAddress; label?: string}) => TAddressBookEntry | undefined;
	addEntry: (entry: TAddressBookEntry) => Promise<void>;
	updateEntry: (entry: TAddressBookEntry) => Promise<void>;
	bumpEntryInteractions: (entry: TAddressBookEntry) => Promise<void>;
	deleteEntry: (address: TAddress) => Promise<void>;
	onOpenCurtain: (callbackFn: TSelectCallback) => void;
	onCloseCurtain: () => void;
};
const defaultProps: TAddressBookProps = {
	shouldOpenCurtain: false,
	listEntries: async (): Promise<TAddressBookEntry[]> => [],
	listCachedEntries: (): TAddressBookEntry[] => [],
	getEntry: async (): Promise<TAddressBookEntry | undefined> => undefined,
	getCachedEntry: (): TAddressBookEntry | undefined => undefined,
	addEntry: async (): Promise<void> => undefined,
	updateEntry: async (): Promise<void> => undefined,
	bumpEntryInteractions: async (): Promise<void> => undefined,
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
	version: 2,
	stores: [
		{
			name: 'address-book',
			id: {keyPath: 'id', autoIncrement: true},
			indices: [
				{name: 'address', keyPath: 'address', options: {unique: true}},
				{name: 'label', keyPath: 'label'},
				{name: 'slugifiedLabel', keyPath: 'slugifiedLabel'},
				{name: 'chains', keyPath: 'chains'},
				{name: 'isFavorite', keyPath: 'isFavorite'},
				{name: 'isHidden', keyPath: 'isHidden'},
				{name: 'tags', keyPath: 'tags'},
				{name: 'numberOfInteractions', keyPath: 'numberOfInteractions'}
			]
		}
	]
};

const AddressBookContext = createContext<TAddressBookProps>(defaultProps);
export const WithAddressBook = ({children}: {children: React.ReactElement}): React.ReactElement => {
	const [shouldOpenCurtain, set_shouldOpenCurtain] = useState(false);
	const [cachedEntries, set_cachedEntries] = useState<TAddressBookEntry[]>([]);
	const [entryNonce, set_entryNonce] = useState<number>(0);
	const [currentCallbackFunction, set_currentCallbackFunction] = useState<TSelectCallback | undefined>(undefined);
	const {add, getAll, getOneByKey, update} = useIndexedDBStore<TAddressBookEntry>('address-book');
	const {safeChainID} = useChainID();

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
					const mergedChains = [...(existingEntry.chains || []), ...(entry.chains || [])];
					if (mergedChains.length === 0) {
						mergedChains.push(safeChainID);
					}
					const mergedTags = [...(existingEntry.tags || []), ...(entry.tags || [])];
					const mergedFields = {...existingEntry, ...entry, chains: mergedChains, tags: mergedTags};
					mergedFields.chains = [...new Set(mergedFields.chains)].filter(chain => chain !== 0);
					update({...mergedFields, slugifiedLabel: slugify(mergedFields.label)});
					set_entryNonce(nonce => nonce + 1);
				} else {
					assert(isAddress(entry.address));
					const chains = entry.chains || [];
					if (chains.length === 0) {
						chains.push(safeChainID);
					}
					add({
						...entry,
						chains,
						slugifiedLabel: slugify(entry.label),
						isFavorite: entry.isFavorite || false,
						numberOfInteractions: entry.numberOfInteractions || 0,
						isHidden: false
					});
					set_entryNonce(nonce => nonce + 1);
				}
			} catch {
				// Do nothing
			}
		},
		[add, getEntry, update, safeChainID]
	);

	/**************************************************************************
	 * Callback function that can be used to add an entry in the address
	 * book. This is very similar to updateEntry, but will give update priority
	 * to the smol database instead of the new entry.
	 *************************************************************************/
	const addEntry = useCallback(
		async (entry: TAddressBookEntry): Promise<void> => {
			try {
				const existingEntry = await getEntry({address: entry.address});
				if (existingEntry) {
					const mergedChains = [...(entry.chains || []), ...(existingEntry.chains || [])];
					if (mergedChains.length === 0) {
						mergedChains.push(safeChainID);
					}
					const mergedTags = [...(entry.tags || []), ...(existingEntry.tags || [])];
					const mergedFields = {...entry, ...existingEntry, chains: mergedChains, tags: mergedTags};
					mergedFields.chains = [...new Set(mergedFields.chains)].filter(chain => chain !== 0);
					update({...mergedFields, slugifiedLabel: slugify(mergedFields.label)});
					set_entryNonce(nonce => nonce + 1);
				} else {
					assert(isAddress(entry.address));
					const chains = entry.chains || [];
					if (chains.length === 0) {
						chains.push(safeChainID);
					}
					add({
						...entry,
						slugifiedLabel: slugify(entry.label),
						isFavorite: entry.isFavorite || false,
						numberOfInteractions: entry.numberOfInteractions || 0,
						isHidden: false
					});
					set_entryNonce(nonce => nonce + 1);
				}
			} catch {
				// Do nothing
			}
		},
		[add, getEntry, safeChainID, update]
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
					update({...existingEntry, isHidden: true});
					set_entryNonce(nonce => nonce + 1);
				}
			} catch {
				// Do nothing
			}
		},
		[getEntry, update]
	);

	/**************************************************************************
	 * Callback function that can be used to increment an entry
	 * `numberOfInteractions` field. This is used to keep track of how many
	 * times an address has been used for a transaction.
	 *************************************************************************/
	const bumpEntryInteractions = useCallback(
		async (entry: TAddressBookEntry): Promise<void> => {
			try {
				const existingEntry = await getEntry({address: entry.address});
				if (existingEntry) {
					existingEntry.numberOfInteractions = (existingEntry.numberOfInteractions || 0) + 1;
					update(existingEntry);
					set_entryNonce(nonce => nonce + 1);
				} else {
					assert(isAddress(entry.address));
					const chains = entry.chains || [];
					if (chains.length === 0) {
						chains.push(safeChainID);
					}
					add({
						...entry,
						chains,
						slugifiedLabel: slugify(entry.label),
						isHidden: true,
						numberOfInteractions: 1
					});
					set_entryNonce(nonce => nonce + 1);
				}
			} catch {
				// Do nothing
			}
		},
		[add, getEntry, update, safeChainID]
	);

	/**************************************************************************
	 * Context value that is passed to all children of this component.
	 *************************************************************************/
	const contextValue = useMemo(
		(): TAddressBookProps => ({
			shouldOpenCurtain,
			listEntries,
			listCachedEntries,
			getEntry,
			getCachedEntry,
			addEntry,
			updateEntry,
			deleteEntry,
			bumpEntryInteractions,
			onOpenCurtain: (callbackFn): void => {
				set_currentCallbackFunction(() => callbackFn);
				set_shouldOpenCurtain(true);
			},
			onCloseCurtain: (): void => set_shouldOpenCurtain(false)
		}),
		[
			shouldOpenCurtain,
			listEntries,
			addEntry,
			listCachedEntries,
			bumpEntryInteractions,
			getEntry,
			getCachedEntry,
			updateEntry,
			deleteEntry
		]
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

export const useAddressBook = (): TAddressBookProps => useContext(AddressBookContext);
