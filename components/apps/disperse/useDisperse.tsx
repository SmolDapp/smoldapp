import React, {createContext, useContext, useMemo, useReducer, useState} from 'react';

import type {Dispatch} from 'react';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import type {TAddress} from '@utils/tools.address';
import type {TToken} from '@utils/types/types';

export type TDisperseReceiver = {
	address: TAddress | undefined;
	amount: TNormalizedBN | undefined;
	label: string;
	UUID: string;
};

export type TDisperseConfiguration = {
	tokenToSend: TToken | undefined;
	receivers: TDisperseReceiver[];
};

export type TDisperseActions =
	| {type: 'SET_TOKEN_TO_SEND'; payload: TToken | undefined}
	| {type: 'SET_RECEIVERS'; payload: TDisperseReceiver[]}
	| {type: 'ADD_RECEIVERS'; payload: TDisperseReceiver[]}
	| {type: 'ADD_SIBLING_RECEIVER_FROM_UUID'; payload: string}
	| {type: 'DEL_RECEIVER_BY_UUID'; payload: string}
	| {type: 'UPD_RECEIVER_BY_UUID'; payload: TDisperseReceiver}
	| {type: 'RESET'; payload: undefined};

export type TDisperse = {
	configuration: TDisperseConfiguration;
	dispatchConfiguration: Dispatch<TDisperseActions>;
	isDispersed: boolean;
	onResetDisperse: () => void;
};

export function newVoidRow(): TDisperseReceiver {
	return {
		address: undefined,
		label: '',
		amount: undefined,
		UUID: crypto.randomUUID()
	};
}

const defaultProps: TDisperse = {
	isDispersed: false,
	dispatchConfiguration: (): void => undefined,
	onResetDisperse: (): void => undefined,
	configuration: {
		tokenToSend: undefined,
		receivers: [newVoidRow(), newVoidRow()]
	}
};

const configurationReducer = (state: TDisperseConfiguration, action: TDisperseActions): TDisperseConfiguration => {
	switch (action.type) {
		case 'SET_TOKEN_TO_SEND':
			return {...state, tokenToSend: action.payload};
		case 'SET_RECEIVERS':
			return {...state, receivers: action.payload};
		case 'ADD_RECEIVERS':
			return {...state, receivers: [...state.receivers, ...action.payload]};
		case 'ADD_SIBLING_RECEIVER_FROM_UUID':
			return {
				...state,
				receivers: state.receivers.reduce((acc, row): TDisperseReceiver[] => {
					if (row.UUID === action.payload) {
						return [...acc, row, newVoidRow()];
					}
					return [...acc, row];
				}, [] as TDisperseReceiver[])
			};
		case 'DEL_RECEIVER_BY_UUID':
			if (state.receivers.length === 1) {
				return {...state, receivers: [newVoidRow()]};
			}
			return {
				...state,
				receivers: state.receivers.filter((receiver): boolean => receiver.UUID !== action.payload)
			};
		case 'UPD_RECEIVER_BY_UUID':
			return {
				...state,
				receivers: state.receivers.map((receiver): TDisperseReceiver => {
					if (action.payload.UUID === receiver.UUID) {
						return action.payload;
					}
					return receiver;
				})
			};
		case 'RESET':
			return {tokenToSend: undefined, receivers: [newVoidRow()]};
	}
};

const DisperseContext = createContext<TDisperse>(defaultProps);
export const DisperseContextApp = ({children}: {children: React.ReactElement}): React.ReactElement => {
	const [isDispersed, set_isDispersed] = useState<boolean>(false);
	const [configuration, dispatch] = useReducer(configurationReducer, defaultProps.configuration);

	const onResetDisperse = (): void => {
		set_isDispersed(true);
		setTimeout((): void => {
			dispatch({type: 'RESET', payload: undefined});
			set_isDispersed(false);
		}, 5000);
	};

	const contextValue = useMemo(
		(): TDisperse => ({
			configuration,
			dispatchConfiguration: dispatch,
			isDispersed,
			onResetDisperse
		}),
		[configuration, isDispersed]
	);

	return <DisperseContext.Provider value={contextValue}>{children}</DisperseContext.Provider>;
};

export const useDisperse = (): TDisperse => {
	const ctx = useContext(DisperseContext);
	if (!ctx) {
		throw new Error('DisperseContext not found');
	}
	return ctx;
};
