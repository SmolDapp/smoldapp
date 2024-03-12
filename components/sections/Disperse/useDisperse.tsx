import React, {createContext, useContext, useMemo, useReducer, useState} from 'react';
import {zeroNormalizedBN} from '@builtbymom/web3/utils';
import {optionalRenderProps} from '@utils/react/optionalRenderProps';
import {defaultInputAddressLike} from '@utils/tools.address';

import type {TAmountInputElement} from 'components/designSystem/SmolAmountInput';
import type {Dispatch, ReactElement} from 'react';
import type {TToken} from '@builtbymom/web3/types';
import type {TOptionalRenderProps} from '@utils/react/optionalRenderProps';
import type {TInputAddressLike} from '@utils/tools.address';
import type {TPartialExhaustive} from '@utils/types/types';

export type TDisperseInput = {receiver: TInputAddressLike; value: TAmountInputElement; UUID: string};

export type TDisperseConfiguration = {
	tokenToSend: TToken | undefined;
	inputs: TDisperseInput[];
};

export type TDisperseActions =
	| {type: 'SET_TOKEN_TO_SEND'; payload: TToken | undefined}
	| {type: 'SET_RECEIVERS'; payload: TDisperseInput[]}
	| {type: 'ADD_RECEIVERS'; payload: TDisperseInput[]}
	| {type: 'DEL_RECEIVER_BY_UUID'; payload: string}
	| {type: 'SET_RECEIVER'; payload: Partial<TInputAddressLike> & {UUID: string}}
	| {type: 'SET_VALUE'; payload: Partial<TAmountInputElement> & {UUID: string}}
	| {type: 'CLEAR_RECEIVERS'; payload: undefined}
	| {type: 'RESET'; payload: undefined};

export type TDisperseQuery = TPartialExhaustive<{
	token: string;
	addresses: string[];
	values: string[];
}>;

export type TDisperse = {
	configuration: TDisperseConfiguration;
	dispatchConfiguration: Dispatch<TDisperseActions>;
	isDispersed: boolean;
	onResetDisperse: () => void;
};

export function newVoidRow(): TDisperseInput {
	return {
		receiver: defaultInputAddressLike,
		value: {
			amount: '',
			normalizedBigAmount: zeroNormalizedBN,
			isValid: 'undetermined',
			status: 'none'
		},
		UUID: crypto.randomUUID()
	};
}

const defaultProps: TDisperse = {
	isDispersed: false,
	dispatchConfiguration: (): void => undefined,
	onResetDisperse: (): void => undefined,
	configuration: {
		tokenToSend: undefined,
		inputs: []
	}
};

const configurationReducer = (state: TDisperseConfiguration, action: TDisperseActions): TDisperseConfiguration => {
	switch (action.type) {
		case 'SET_TOKEN_TO_SEND':
			return {...state, tokenToSend: action.payload};
		case 'SET_RECEIVERS':
			return {...state, inputs: action.payload};
		case 'ADD_RECEIVERS':
			return {
				...state,
				inputs: [...state.inputs, ...action.payload]
			};
		case 'CLEAR_RECEIVERS':
			return {...state, inputs: []};

		case 'DEL_RECEIVER_BY_UUID':
			if (state.inputs.length === 1) {
				return {...state, inputs: [newVoidRow()]};
			}
			return {
				...state,
				inputs: state.inputs.filter((input): boolean => input.UUID !== action.payload)
			};

		case 'SET_RECEIVER': {
			return {
				...state,
				inputs: state.inputs.map(input =>
					input.UUID === action.payload.UUID
						? {
								...input,
								receiver: {
									...input.receiver,
									...action.payload
								}
							}
						: input
				)
			};
		}
		case 'SET_VALUE': {
			return {
				...state,
				inputs: state.inputs.map(input =>
					input.UUID === action.payload.UUID
						? {
								...input,
								value: {
									...input.value,
									...action.payload
								}
							}
						: input
				)
			};
		}
		case 'RESET':
			return {tokenToSend: undefined, inputs: [newVoidRow()]};
	}
};

const DisperseContext = createContext<TDisperse>(defaultProps);
export const DisperseContextApp = ({
	children
}: {
	children: TOptionalRenderProps<TDisperse, ReactElement>;
}): React.ReactElement => {
	const [isDispersed, set_isDispersed] = useState<boolean>(false);
	const [configuration, dispatch] = useReducer(configurationReducer, defaultProps.configuration);

	const onResetDisperse = (): void => {
		set_isDispersed(true);
		setTimeout((): void => {
			dispatch({type: 'RESET', payload: undefined});
			set_isDispersed(false);
		}, 500);
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

	return (
		<DisperseContext.Provider value={contextValue}>
			{optionalRenderProps(children, contextValue)}
		</DisperseContext.Provider>
	);
};

export const useDisperse = (): TDisperse => {
	const ctx = useContext(DisperseContext);
	if (!ctx) {
		throw new Error('DisperseContext not found');
	}
	return ctx;
};
