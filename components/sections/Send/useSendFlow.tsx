import React, {createContext, useContext, useMemo, useReducer} from 'react';
import {useSearchParams} from 'next/navigation';
import {defaultInputAddressLike} from 'components/designSystem/SmolAddressInput';
import {useAsyncTrigger} from 'hooks/useAsyncTrigger';
import {optionalRenderProps} from '@utils/react/optionalRenderProps';
import {isZeroAddress} from '@utils/tools.address';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {toNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';

import type {TInputAddressLike} from 'components/designSystem/SmolAddressInput';
import type {TSendInputElement} from 'components/designSystem/SmolTokenAmountInput';
import type {Dispatch, ReactElement} from 'react';
import type {TOptionalRenderProps} from '@utils/react/optionalRenderProps';

export type TSendConfiguration = {
	receiver: TInputAddressLike;
	inputs: TSendInputElement[];
};

export type TSendActions =
	| {type: 'SET_FROM_URL'; payload: TSendConfiguration}
	| {type: 'SET_RECEIVER'; payload: TInputAddressLike}
	| {type: 'ADD_INPUT'; payload: undefined}
	| {type: 'REMOVE_INPUT'; payload: {UUID: string}}
	| {type: 'SET_VALUE'; payload: Partial<TSendInputElement>}
	| {type: 'RESET'; payload: undefined};

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
	const searchParams = useSearchParams();
	const configurationReducer = (state: TSendConfiguration, action: TSendActions): TSendConfiguration => {
		switch (action.type) {
			case 'SET_FROM_URL':
				return state;
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

	/**
	 * Update the url query on every change in the UI
	 */
	useAsyncTrigger(async (): Promise<void> => {
		const to = searchParams.get('to');
		const tokens = searchParams.get('tokens')?.split(',') || [];
		const values = searchParams.get('values')?.split(',') || [];
		const isAddressValid = searchParams.has('to') && !isZeroAddress(toAddress(to));

		if (!isAddressValid) {
			return;
		}
		console.warn({to, tokens, values});
		// dispatch({
		// 	type: 'SET_FROM_URL',
		// 	payload: {
		// 		receiver: {
		// 			address: toAddress(searchParams.get('to')),
		// 			isValid: true,
		// 			label: ''
		// 		},
		// 		inputs: tokens.map(
		// 			(token, index): TSendInputElement => ({
		// 				amount: values[index] ?? '',
		// 				normalizedBigAmount: toNormalizedBN(values[index] ?? 0),
		// 				isValid: true,
		// 				token: {
		// 					address: toAddress(token)
		// 				},
		// 				status: 'none',
		// 				UUID: crypto.randomUUID()
		// 			})
		// 		)
		// 	}
		// });
	}, [searchParams]);

	// useSyncUrlParams({
	// 	to: configuration.receiver.address,
	// 	tokens: configuration.inputs.map(input => input.token?.address).filter(isString),
	// 	values: configuration.inputs
	// 		.map(input => (input.amount === '' ? undefined : input.normalizedBigAmount?.raw.toString()))
	// 		.filter(isString)
	// });

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
