import {createContext, type ReactElement, useContext, useReducer, useState} from 'react';
import {AddressBookCurtain} from 'components/designSystem/Curtains/AddressBookCurtain';
import {toAddress} from '@builtbymom/web3/utils';

import {useAddressBook} from './useAddressBook';

import type {TAddress} from '@builtbymom/web3/types';
import type {TAddressBookEntry} from './useAddressBook';

export type TAddressBookEntryReducer =
	| {type: 'SET_SELECTED_ENTRY'; payload: TAddressBookEntry}
	| {type: 'SET_ADDRESS'; payload: TAddress | undefined}
	| {type: 'SET_LABEL'; payload: string}
	| {type: 'SET_CHAINS'; payload: number[]}
	| {type: 'SET_IS_FAVORITE'; payload: boolean};

type TCurtainStatus = {isOpen: boolean; isEditing: boolean; label?: string};

type TAddressBookCurtainProps = {
	selectedEntry: TAddressBookEntry | undefined;
	dispatchConfiguration: React.Dispatch<TAddressBookEntryReducer>;
	curtainStatus: TCurtainStatus;
	set_curtainStatus: React.Dispatch<React.SetStateAction<TCurtainStatus>>;
};

const deafultCurtainStatus = {
	isOpen: false,
	isEditing: false
};

const defaultProps: TAddressBookCurtainProps = {
	selectedEntry: undefined,
	dispatchConfiguration: (): void => undefined,
	curtainStatus: deafultCurtainStatus,
	set_curtainStatus: (): void => undefined
};
const AddressBookCurtainContext = createContext<TAddressBookCurtainProps>(defaultProps);

export const WithAddressBookCurtain = ({children}: {children: ReactElement}): ReactElement => {
	const {updateEntry} = useAddressBook();
	const [curtainStatus, set_curtainStatus] = useState<TCurtainStatus>(deafultCurtainStatus);

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

	const contextValue = {
		selectedEntry,
		dispatchConfiguration: dispatch,
		curtainStatus,
		set_curtainStatus
	};

	return (
		<AddressBookCurtainContext.Provider value={contextValue}>
			{children}

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
		</AddressBookCurtainContext.Provider>
	);
};

export const useAddressBookCurtain = (): TAddressBookCurtainProps => {
	const ctx = useContext(AddressBookCurtainContext);
	if (!ctx) {
		throw new Error('AddressBookCurtainContext not found');
	}
	return ctx;
};
