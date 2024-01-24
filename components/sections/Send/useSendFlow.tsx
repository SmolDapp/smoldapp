import React, {createContext, useContext, useMemo, useReducer} from 'react';
import {toNormalizedBN} from '@builtbymom/web3/utils';
import {optionalRenderProps} from '@utils/react/optionalRenderProps';
import {defaultInputAddressLike} from '@utils/tools.address';

import type {TSendInputElement} from 'components/designSystem/SmolTokenAmountInput';
import type {Dispatch, ReactElement} from 'react';
import type {TOptionalRenderProps} from '@utils/react/optionalRenderProps';
import type {TInputAddressLike} from '@utils/tools.address';
import type {TPartialExhaustive} from '@utils/types/types';

export type TSendConfiguration = {
	receiver: TInputAddressLike;
	inputs: TSendInputElement[];
};

export type TSendActions =
	| {type: 'SET_RECEIVER'; payload: TInputAddressLike}
	| {type: 'ADD_INPUT'; payload: undefined}
	| {type: 'REMOVE_INPUT'; payload: {UUID: string}}
	| {type: 'SET_VALUE'; payload: Partial<TSendInputElement>}
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

export function getNewInput(): TSendInputElement {
	return {
		amount: '',
		normalizedBigAmount: toNormalizedBN(0),
		isValid: 'undetermined',
		token: undefined,
		status: 'none',
		UUID: crypto.randomUUID()
	};
}

const defaultProps: TSend = {
	configuration: {
		receiver: defaultInputAddressLike,
		inputs: [getNewInput()]
	},

	dispatchConfiguration: (): void => undefined
};

const SendContext = createContext<TSend>(defaultProps);
export const SendContextApp = ({children}: {children: TOptionalRenderProps<TSend, ReactElement>}): ReactElement => {
	const configurationReducer = (state: TSendConfiguration, action: TSendActions): TSendConfiguration => {
		switch (action.type) {
			case 'SET_RECEIVER':
				return {...state, receiver: action.payload};
			case 'ADD_INPUT':
				return {
					...state,
					inputs: [...state.inputs, getNewInput()]
				};
			case 'REMOVE_INPUT':
				return {
					...state,
					inputs: state.inputs.filter(input => input.UUID !== action.payload.UUID)
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
