import {Fragment, useMemo, useReducer, useState} from 'react';
import {AddressBookEntry} from 'components/designSystem/AddressBookEntry';
import {AddressBookCurtain} from 'components/designSystem/Curtains/AddressBookCurtain';
import {TextInput} from 'components/Primitives/TextInput';
import {useAddressBook} from 'contexts/useAddressBook';
import {LayoutGroup, motion} from 'framer-motion';
import {toAddress} from '@utils/tools.address';
import {cl} from '@yearn-finance/web-lib/utils/cl';

import type {TAddressBookEntry} from 'contexts/useAddressBook';
import type {ReactElement} from 'react';
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
			<div className={'w-full md:w-111'}>
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

AddressBookPage.AppName = 'Address Book';
AddressBookPage.AppDescription = 'Keep your friends close and your enemies closer';
AddressBookPage.getLayout = function getLayout(page: ReactElement): ReactElement {
	return <Fragment>{page}</Fragment>;
};

export default AddressBookPage;
