import {Fragment, useCallback, useMemo, useReducer, useState} from 'react';
import {AddressBookEntry} from 'components/designSystem/AddressBookEntry';
import {AddressBookCurtain} from 'components/designSystem/Curtains/AddressBookCurtain';
import {TextInput} from 'components/Primitives/TextInput';
import {useAddressBook} from 'contexts/useAddressBook';
import Papa from 'papaparse';
import {LayoutGroup, motion} from 'framer-motion';
import {cl, toAddress} from '@builtbymom/web3/utils';
import {IconEmptyAddressBook} from '@icons/IconEmptyAddressBook';
import IconImport from '@icons/IconImport';
import {IconPlus} from '@icons/IconPlus';

import type {TAddressBookEntry} from 'contexts/useAddressBook';
import type {ChangeEvent, ReactElement} from 'react';
import type {TAddress} from '@builtbymom/web3/types';

export type TAddressBookEntryReducer =
	| {type: 'SET_SELECTED_ENTRY'; payload: TAddressBookEntry}
	| {type: 'SET_ADDRESS'; payload: TAddress | undefined}
	| {type: 'SET_LABEL'; payload: string}
	| {type: 'SET_CHAINS'; payload: number[]}
	| {type: 'SET_IS_FAVORITE'; payload: boolean};

function AddContactButton(props: {onOpenCurtain: VoidFunction; label?: string}): ReactElement {
	return (
		<button
			onClick={props.onOpenCurtain}
			className={cl(
				'rounded-lg p-2 text-xs flex flex-row items-center',
				'bg-primary text-neutral-900 transition-colors hover:bg-primaryHover'
			)}>
			<IconPlus className={'mr-2 size-3 text-neutral-900'} />
			{props.label || 'Add contact'}
		</button>
	);
}

function ImportContactsButton(props: {className?: string}): ReactElement {
	const {addEntry} = useAddressBook();

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
			let records: TAddressBookEntry[] = [];

			// If we are working with a safe file, we should get 3 columns.
			const isProbablySafeFile = parsedCSV.meta.fields.length === 3;
			if (isProbablySafeFile) {
				const [addressLike, name, chainID] = parsedCSV.meta.fields;
				records = parsedCSV.data.map((item: unknown[]) => {
					return {
						address: item[addressLike] as TAddress,
						label: item[name] as string,
						chains: [item[chainID]] as number[]
					};
				});
			}

			// If we are working with a smol file, we should get 4 columns.
			const isProbablySmolFile = parsedCSV.meta.fields.length === 4;
			if (isProbablySmolFile) {
				const [addressLike, name, chains, isFavorite] = parsedCSV.meta.fields;
				records = parsedCSV.data.map((item: unknown[]) => {
					const chainIDs = ((item[chains] as string) || '').split(',').map(chain => Number(chain));
					const uniqueChainIDs = [...new Set(chainIDs)];
					const entryLabel = ((item[name] as string) || '').replaceAll('.', '-');

					return {
						address: item[addressLike] as TAddress,
						label: entryLabel,
						chains: uniqueChainIDs,
						isFavorite: Boolean(item[isFavorite] === 'true' || item[isFavorite] === true)
					};
				});
			}

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

			for (const record of uniqueRecords) {
				addEntry(record);
			}
		};
		reader.readAsBinaryString(file);
	};

	return (
		<button
			onClick={() => document.querySelector<HTMLInputElement>('#file-upload')?.click()}
			className={cl(
				props.className,
				'rounded-lg p-2 text-xs flex flex-row items-center relative overflow-hidden',
				'bg-neutral-300 text-neutral-900 transition-colors hover:bg-neutral-400'
			)}>
			<input
				id={'file-upload'}
				tabIndex={-1}
				className={'absolute inset-0 !cursor-pointer opacity-0'}
				type={'file'}
				accept={'.csv'}
				onClick={event => event.stopPropagation()}
				onChange={handleFileUpload}
			/>
			<IconImport className={'mr-2 size-3 text-neutral-900'} />
			{'Import Contacts'}
		</button>
	);
}

function ExportContactsButton(): ReactElement {
	const {listEntries} = useAddressBook();

	const downloadEntries = useCallback(async () => {
		const entries = await listEntries();
		const clonedEntries = structuredClone(entries);
		//Remove id and ens from the entries
		const entriesWithoutId = clonedEntries.map(entry => {
			const {id, ens, slugifiedLabel, numberOfInteractions, tags, ...rest} = entry;
			id;
			ens;
			slugifiedLabel;
			numberOfInteractions;
			tags;
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
		<button
			onClick={downloadEntries}
			className={cl(
				'rounded-lg p-2 text-xs flex flex-row items-center',
				'bg-neutral-300 text-neutral-900 transition-colors hover:bg-neutral-400'
			)}>
			<IconImport className={'mr-2 size-3 rotate-180 text-neutral-900'} />
			{'Download Contacts'}
		</button>
	);
}

function AddressBookActions(props: {onOpenCurtain: VoidFunction}): ReactElement {
	return (
		<div className={'flex flex-row space-x-2'}>
			<AddContactButton onOpenCurtain={props.onOpenCurtain} />
			<ImportContactsButton />
			<ExportContactsButton />
		</div>
	);
}

function EmptyAddressBook(props: {onOpenCurtain: VoidFunction}): ReactElement {
	return (
		<div className={'flex size-full flex-col items-center  rounded-lg bg-neutral-200 px-11 py-[72px]'}>
			<div className={'mb-6 flex size-40 items-center justify-center rounded-full bg-neutral-0'}>
				<IconEmptyAddressBook />
			</div>
			<div className={'flex flex-col items-center justify-center'}>
				<p className={'text-center text-base text-neutral-600'}>
					{'Your Address Book is empty. Add a contact manually or import your saved contacts'}
				</p>
				<div className={'flex flex-row gap-x-2 pt-6'}>
					<AddContactButton onOpenCurtain={props.onOpenCurtain} />
					<ImportContactsButton className={'!bg-neutral-0'} />
				</div>
			</div>
		</div>
	);
}

function AddressBookPage(): ReactElement {
	const {listCachedEntries, updateEntry} = useAddressBook();
	const [curtainStatus, set_curtainStatus] = useState<{isOpen: boolean; isEditing: boolean; label?: string}>({
		isOpen: false,
		isEditing: false
	});
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

	const hasNoEntries = listCachedEntries().length === 0;
	const hasNoFilteredEntry = entries.length === 0;
	return (
		<div className={'w-108'}>
			{hasNoEntries ? (
				<div className={'w-444 md:h-content md:min-h-content'}>
					<EmptyAddressBook onOpenCurtain={() => set_curtainStatus({isOpen: true, isEditing: true})} />
				</div>
			) : (
				<div className={'w-444'}>
					<div className={'my-4 grid gap-4'}>
						<AddressBookActions onOpenCurtain={() => set_curtainStatus({isOpen: true, isEditing: true})} />
						<TextInput
							placeholder={'Search ...'}
							value={searchValue}
							onChange={set_searchValue}
						/>
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
							{hasNoFilteredEntry && (
								<div
									className={
										'flex flex-col items-center justify-center rounded-lg bg-neutral-200 px-11 py-[72px]'
									}>
									<div
										className={
											'mb-6 flex size-40 items-center justify-center rounded-full bg-neutral-0'
										}>
										<IconEmptyAddressBook />
									</div>
									<div className={'flex flex-col items-center justify-center'}>
										<p className={'text-center text-base text-neutral-600'}>
											{`We couldn't find any contact matching "${searchValue}".`}
										</p>
										<div className={'flex flex-row gap-x-2 pt-6'}>
											<AddContactButton
												label={`Add ${searchValue}`}
												onOpenCurtain={() =>
													set_curtainStatus({
														isOpen: true,
														isEditing: true,
														label: searchValue
													})
												}
											/>
										</div>
									</div>
								</div>
							)}
						</motion.div>
					</LayoutGroup>
				</div>
			)}
			<AddressBookCurtain
				selectedEntry={selectedEntry}
				dispatch={dispatch}
				isOpen={curtainStatus.isOpen}
				isEditing={curtainStatus.isEditing}
				initialLabel={curtainStatus.label}
				onOpenChange={status => {
					set_curtainStatus(status);
					if (!status.isOpen) {
						dispatch({
							type: 'SET_SELECTED_ENTRY',
							payload: {
								address: undefined,
								label: '',
								slugifiedLabel: '',
								chains: [],
								isFavorite: false
							}
						});
					}
				}}
			/>
		</div>
	);
}

AddressBookPage.AppName = 'Address Book';
AddressBookPage.AppDescription = 'Keep your friends close and your enemies closer';
AddressBookPage.getLayout = function getLayout(page: ReactElement): ReactElement {
	return <Fragment>{page}</Fragment>;
};

export default AddressBookPage;
