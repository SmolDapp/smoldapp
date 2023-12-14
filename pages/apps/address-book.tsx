import {Fragment, useReducer, useState} from 'react';
import {AddressBookEntry} from 'components/designSystem/AddressBookEntry';
import {AddressBookCurtain} from 'components/designSystem/Curtains/AddressBookCurtain';
import {TextInput} from 'components/Primitives/TextInput';
import {useAddressBook} from 'contexts/useAddressBook';
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
	const [shouldOpenCurtain, set_shouldOpenCurtain] = useState(false);
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

	return (
		<Fragment>
			<div className={'w-[444px]'}>
				<TextInput
					value={searchValue}
					onChange={set_searchValue}
				/>
				<div className={'mt-2'}>
					<button
						onClick={() => set_shouldOpenCurtain(true)}
						className={cl(
							'rounded-lg px-3 py-1 text-xs',
							'bg-neutral-200 text-neutral-700 transition-colors hover:bg-neutral-300'
						)}>
						{'+Add contact'}
					</button>
				</div>
				<div className={'mt-2'}>
					{listCachedEntries().map(entry => (
						<AddressBookEntry
							key={entry.address}
							entry={entry}
							onSelect={selected => {
								dispatch({type: 'SET_SELECTED_ENTRY', payload: selected});
								set_shouldOpenCurtain(true);
							}}
						/>
					))}
				</div>
			</div>
			<AddressBookCurtain
				selectedEntry={selectedEntry}
				dispatch={dispatch}
				isOpen={shouldOpenCurtain}
				onOpenChange={isOpen => {
					set_shouldOpenCurtain(isOpen);
					if (!isOpen) {
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

AddressBookPage.AppDescription = 'Keep your friends close and your enemies closer';
AddressBookPage.getLayout = function getLayout(page: ReactElement): ReactElement {
	return <Fragment>{page}</Fragment>;
};

export default AddressBookPage;
