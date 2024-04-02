import React, {createContext, useContext, useMemo, useReducer} from 'react';
import {zeroNormalizedBN} from '@builtbymom/web3/utils';
import {optionalRenderProps} from '@utils/react/optionalRenderProps';
import {defaultInputAddressLike} from '@utils/tools.address';

import type {TTokenAmountInputElement} from 'components/designSystem/SmolTokenAmountInput';
import type {Dispatch, ReactElement} from 'react';
import type {TOptionalRenderProps} from '@utils/react/optionalRenderProps';
import type {TInputAddressLike} from '@utils/tools.address';
import type {TPartialExhaustive} from '@utils/types/types';

export type TSendConfiguration = {
	receiver: TInputAddressLike;
	inputs: TTokenAmountInputElement[];
};

export type TSendActions =
	| {type: 'SET_RECEIVER'; payload: Partial<TInputAddressLike>}
	| {type: 'ADD_INPUT'; payload: TTokenAmountInputElement | undefined}
	| {type: 'REMOVE_INPUT'; payload: {UUID: string}}
	| {type: 'REMOVE_SUCCESFUL_INPUTS'; payload: undefined}
	| {type: 'SET_VALUE'; payload: Partial<TTokenAmountInputElement>}
	| {type: 'RESET'; payload: undefined};

export type TSendQuery = TPartialExhaustive<{
	to: string;
	tokens: string[];
	values: string[];
}>;

export type TSend = {
	configuration: TSendConfiguration;

	dispatchConfiguration: Dispatch<TSendActions>;
};

export function getNewInput(): TTokenAmountInputElement {
	return {
		amount: '',
		normalizedBigAmount: zeroNormalizedBN,
		isValid: 'undetermined',
		token: undefined,
		status: 'none',
		UUID: crypto.randomUUID()
	};
}

const defaultProps: TSend = {
	configuration: {
		receiver: defaultInputAddressLike,
		inputs: []
	},

	dispatchConfiguration: (): void => undefined
};

const SendContext = createContext<TSend>(defaultProps);
export const SendContextApp = ({children}: {children: TOptionalRenderProps<TSend, ReactElement>}): ReactElement => {
	const configurationReducer = (state: TSendConfiguration, action: TSendActions): TSendConfiguration => {
		switch (action.type) {
			case 'SET_RECEIVER':
				return {...state, receiver: {...state.receiver, ...action.payload}};
			case 'ADD_INPUT':
				return {
					...state,
					inputs: [...state.inputs, action.payload ? action.payload : getNewInput()]
				};
			case 'REMOVE_INPUT':
				return {
					...state,
					inputs: state.inputs.filter(input => input.UUID !== action.payload.UUID)
				};
			case 'REMOVE_SUCCESFUL_INPUTS':
				return {
					...state,
					inputs: state.inputs
						.filter(input => input.status !== 'success')
						.map(input => ({...input, status: 'none'}))
				};

			case 'SET_VALUE': {
				return {
					...state,
					inputs: state.inputs.map(input =>
						input.UUID === action.payload.UUID
							? {
									...input,
									...action.payload
								}
							: input
					)
				};
			}
			case 'RESET':
				return {receiver: defaultInputAddressLike, inputs: [getNewInput()]};
		}
	};

	const [configuration, dispatch] = useReducer(configurationReducer, defaultProps.configuration);

	const contextValue = useMemo(
		(): TSend => ({
			configuration,
			dispatchConfiguration: dispatch
		}),
		[configuration]
	);

	return (
		<SendContext.Provider value={contextValue}>{optionalRenderProps(children, contextValue)}</SendContext.Provider>
	);
};

export const useSendFlow = (): TSend => {
	const ctx = useContext(SendContext);
	if (!ctx) {
		throw new Error('SendContext not found');
	}
	return ctx;
};
