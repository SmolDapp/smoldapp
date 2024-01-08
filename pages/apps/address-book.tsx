import {Fragment, useCallback, useMemo, useReducer, useState} from 'react';
import {AddressBookEntry} from 'components/designSystem/AddressBookEntry';
import {AddressBookCurtain} from 'components/designSystem/Curtains/AddressBookCurtain';
import {TextInput} from 'components/Primitives/TextInput';
import {useAddressBook} from 'contexts/useAddressBook';
import Papa from 'papaparse';
import {LayoutGroup, motion} from 'framer-motion';
import IconImport from '@icons/IconImport';
import {toAddress} from '@utils/tools.address';
import {cl} from '@yearn-finance/web-lib/utils/cl';

import type {TAddressBookEntry} from 'contexts/useAddressBook';
import type {ChangeEvent, ReactElement} from 'react';
import type {TAddress} from '@utils/tools.address';

export type TAddressBookEntryReducer =
	| {type: 'SET_SELECTED_ENTRY'; payload: TAddressBookEntry}
	| {type: 'SET_ADDRESS'; payload: TAddress | undefined}
	| {type: 'SET_LABEL'; payload: string}
	| {type: 'SET_CHAINS'; payload: number[]}
	| {type: 'SET_IS_FAVORITE'; payload: boolean};

function AddressBookPage(): ReactElement {
	const {listCachedEntries, updateEntry} = useAddressBook();
	const [curtainStatus, set_curtainStatus] = useState({isOpen: false, isEditing: false});
	const [searchValue, set_searchValue] = useState('');

	const entryReducer = (state: TAddressBookEntry, action: TAddressBookEntryReducer): TAddressBookEntry => {
		switch (action.type) {
			case 'SET_SELECTED_ENTRY':
				return action.payload;
			case 'SET_ADDRESS':
				return {...state, address: toAddress(action.payload)};
			case 'SET_LABEL':
				return {...state, label: action.payload};
			case 'SET_CHAINS':
				return {...state, chains: action.payload};
			case 'SET_IS_FAVORITE':
				updateEntry({...state, isFavorite: action.payload});
				return {...state, isFavorite: action.payload};
		}
	};

	const [selectedEntry, dispatch] = useReducer(entryReducer, {
		address: undefined,
		label: '',
		slugifiedLabel: '',
		chains: [],
		isFavorite: false
	});

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
	 * Memo function that sorts the entries in the address book, with the
	 * following priority:
	 * - favorite entries first
	 * - alphabetical order
	 *************************************************************************/
	const entries = useMemo(() => {
		return filteredEntries.sort((a, b) => {
			if (a.isFavorite && !b.isFavorite) {
				return -1;
			}
			if (!a.isFavorite && b.isFavorite) {
				return 1;
			}
			return a.label.localeCompare(b.label);
		});
	}, [filteredEntries]);

	return (
		<Fragment>
			<div className={'w-444'}>
				<TextInput
					placeholder={'Search ...'}
					value={searchValue}
					onChange={set_searchValue}
				/>
				<div className={'mt-2'}>
					<button
						onClick={() => set_curtainStatus({isOpen: true, isEditing: true})}
						className={cl(
							'rounded-lg px-3 py-1 text-xs',
							'bg-neutral-200 text-neutral-700 transition-colors hover:bg-neutral-300'
						)}>
						{'+Add contact'}
					</button>
				</div>
				<LayoutGroup>
					<motion.div
						layout
						className={'mt-2'}>
						{entries.map(entry => (
							<motion.div
								layout
								initial={'initial'}
								key={`${entry.address}${entry.id}`}>
								<AddressBookEntry
									entry={entry}
									onSelect={selected => {
										dispatch({type: 'SET_SELECTED_ENTRY', payload: selected});
										set_curtainStatus({isOpen: true, isEditing: false});
									}}
								/>
							</motion.div>
						))}
					</motion.div>
				</LayoutGroup>
			</div>
			<AddressBookCurtain
				selectedEntry={selectedEntry}
				dispatch={dispatch}
				isOpen={curtainStatus.isOpen}
				isEditing={curtainStatus.isEditing}
				onOpenChange={status => {
					set_curtainStatus(status);
					if (!status.isOpen) {
						dispatch({
							type: 'SET_SELECTED_ENTRY',
							payload: {address: undefined, label: '', slugifiedLabel: '', chains: [], isFavorite: false}
						});
					}
				}}
			/>
		</Fragment>
	);
}

function AddressBookActions(): ReactElement {
	const {addEntry, listEntries} = useAddressBook();

	const handleFileUpload = (e: ChangeEvent<HTMLInputElement>): void => {
		if (!e.target.files) {
			return;
		}
		const [file] = e.target.files as unknown as Blob[];
		const reader = new FileReader();
		reader.onload = event => {
			if (!event?.target?.result) {
				return;
			}
			const {result} = event.target;
			const parsedCSV = Papa.parse(result, {header: true});

			// If we are working with a safe file, we should get 3 columns.
			const isProbablySafeFile = parsedCSV.meta.fields.length === 3;
			if (isProbablySafeFile) {
				const [addressLike, name, chainID] = parsedCSV.meta.fields;
				const records = parsedCSV.data.map((item: unknown[]) => {
					return {
						address: item[addressLike] as TAddress,
						label: item[name] as string,
						chains: [item[chainID]] as number[]
					};
				});

				// On theses records, we might have the same address multiple times.
				// If that's the case, we want to merge the chains and only keep one entry.
				const mergedRecords = records.reduce((acc: TAddressBookEntry[], cur: TAddressBookEntry) => {
					const existingRecord = acc.find(item => item.address === cur.address);
					if (existingRecord) {
						existingRecord.chains = [...existingRecord.chains, ...cur.chains];
						return acc;
					}
					return [...acc, cur];
				}, []);

				// The name should always be unique. We need to check if we have duplicates.
				// If that's the case, we need to add a slice of the address to the name, but
				// we still keep both entries.
				const uniqueRecords = mergedRecords.reduce((acc: TAddressBookEntry[], cur: TAddressBookEntry) => {
					const existingRecord = acc.find(item => item.label === cur.label);
					if (existingRecord) {
						const existingSlice = toAddress(existingRecord.address).slice(0, 6);
						existingRecord.label = `${existingRecord.label} (${existingSlice})`;

						const curSlice = toAddress(cur.address).slice(0, 6);
						cur.label = `${cur.label} (${curSlice})`;
						return [...acc, cur];
					}
					return [...acc, cur];
				}, []);
				console.log(uniqueRecords);

				for (const record of uniqueRecords) {
					addEntry(record);
				}
			}

			const isProbablySmolFile = parsedCSV.meta.fields.length === 4;
			if (isProbablySmolFile) {
				const [addressLike, name, chains, isFavorite] = parsedCSV.meta.fields;
				const records = parsedCSV.data.map((item: unknown[]) => {
					const chainIDs = ((item[chains] as string) || '').split(',').map(chain => Number(chain));
					const uniqueChainIDs = [...new Set(chainIDs)];
					return {
						address: item[addressLike] as TAddress,
						label: item[name] as string,
						chains: uniqueChainIDs,
						isFavorite: Boolean(item[isFavorite] as boolean)
					};
				});

				// On theses records, we might have the same address multiple times.
				// If that's the case, we want to merge the chains and only keep one entry.
				const mergedRecords = records.reduce((acc: TAddressBookEntry[], cur: TAddressBookEntry) => {
					const existingRecord = acc.find(item => item.address === cur.address);
					if (existingRecord) {
						existingRecord.chains = [...existingRecord.chains, ...cur.chains];
						return acc;
					}
					return [...acc, cur];
				}, []);

				// The name should always be unique. We need to check if we have duplicates.
				// If that's the case, we need to add a slice of the address to the name, but
				// we still keep both entries.
				const uniqueRecords = mergedRecords.reduce((acc: TAddressBookEntry[], cur: TAddressBookEntry) => {
					const existingRecord = acc.find(item => item.label === cur.label);
					if (existingRecord) {
						const existingSlice = toAddress(existingRecord.address).slice(0, 6);
						existingRecord.label = `${existingRecord.label} (${existingSlice})`;

						const curSlice = toAddress(cur.address).slice(0, 6);
						cur.label = `${cur.label} (${curSlice})`;
						return [...acc, cur];
					}
					return [...acc, cur];
				}, []);
				console.log(uniqueRecords);

				for (const record of uniqueRecords) {
					addEntry(record);
				}
			}
		};
		reader.readAsBinaryString(file);
	};

	const downloadEntries = useCallback(async () => {
		const entries = await listEntries();
		const clonedEntries = structuredClone(entries);
		//Remove id and ens from the entries
		const entriesWithoutId = clonedEntries.map(entry => {
			const {id, ens, slugifiedLabel, ...rest} = entry;
			id;
			ens;
			slugifiedLabel;
			return rest;
		});
		const csv = Papa.unparse(entriesWithoutId, {header: true});
		const blob = new Blob([csv], {type: 'text/csv;charset=utf-8'});
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		const name = `smol-address-book-${new Date().toISOString().split('T')[0]}.csv`;
		a.setAttribute('hidden', '');
		a.setAttribute('href', url);
		a.setAttribute('download', name);
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}, [listEntries]);

	return (
		<div className={'flex flex-row items-center space-x-2'}>
			<button
				onClick={() => document.querySelector<HTMLInputElement>('#file-upload')?.click()}
				className={'withRing group relative -m-1.5 rounded p-1'}>
				<IconImport className={'rotate-0 text-neutral-600 group-hover:text-neutral-900'} />
				<input
					id={'file-upload'}
					tabIndex={-1}
					className={'absolute inset-0 !cursor-pointer opacity-0'}
					type={'file'}
					accept={'.csv'}
					onClick={event => event.stopPropagation()}
					onChange={handleFileUpload}
				/>
			</button>
			<button
				onClick={downloadEntries}
				className={'withRing group relative -m-1.5 !cursor-pointer rounded p-1'}>
				<IconImport className={'rotate-180 text-neutral-600 group-hover:text-neutral-900'} />
			</button>
		</div>
	);
}

AddressBookPage.AppName = 'Address Book';
AddressBookPage.AppDescription = 'Keep your friends close and your enemies closer';
AddressBookPage.getAction = function getAction(): ReactElement {
	return <AddressBookActions />;
};
AddressBookPage.getLayout = function getLayout(page: ReactElement): ReactElement {
	return <Fragment>{page}</Fragment>;
};

export default AddressBookPage;
