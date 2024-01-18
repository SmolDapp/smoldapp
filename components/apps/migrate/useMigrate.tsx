import React, {createContext, useContext, useMemo, useReducer} from 'react';
import {isZeroAddress} from '@builtbymom/web3/utils';
import {useUpdateEffect} from '@react-hookz/web';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';

import type {TInputAddressLike} from 'components/designSystem/SmolAddressInput';
import type {Dispatch} from 'react';
import type {TAddress, TDict, TNormalizedBN, TToken} from '@builtbymom/web3/types';

export type TMigrateElement = TToken & {
	amount: TNormalizedBN | undefined;
	status: 'pending' | 'success' | 'error' | 'none';
	isSelected: boolean;
};

export type TMigrateConfiguration = {
	receiver: TInputAddressLike | undefined;
	tokens: TDict<TMigrateElement>;
};

export type TMigrateActions =
	| {type: 'SET_RECEIVER'; payload: TInputAddressLike | undefined}
	| {type: 'ADD_TOKEN'; payload: TToken & {amount: TNormalizedBN}}
	| {type: 'DEL_TOKEN'; payload: TToken}
	| {type: 'SET_STATUS'; payload: {tokenAddress: TAddress; status: 'pending' | 'success' | 'error' | 'none'}}
	| {type: 'RESET'; payload: undefined};

export type TMigrate = {
	configuration: TMigrateConfiguration;
	dispatchConfiguration: Dispatch<TMigrateActions>;
};

const defaultProps: TMigrate = {
	configuration: {
		receiver: undefined,
		tokens: {}
	},
	dispatchConfiguration: (): void => undefined
};

const MigrateContext = createContext<TMigrate>(defaultProps);
export const MigrateContextApp = ({children}: {children: React.ReactElement}): React.ReactElement => {
	const {address} = useWeb3();

	const configurationReducer = (state: TMigrateConfiguration, action: TMigrateActions): TMigrateConfiguration => {
		switch (action.type) {
			case 'SET_RECEIVER':
				return {...state, receiver: action.payload};
			case 'ADD_TOKEN':
				return {
					...state,
					tokens: {
						...state.tokens,
						[action.payload.address]: {...action.payload, isSelected: true, status: 'none'}
					}
				};
			case 'DEL_TOKEN':
				return {
					...state,
					tokens: {
						...state.tokens,
						[action.payload.address]: {
							...action.payload,
							amount: undefined,
							isSelected: false,
							status: 'none'
						}
					}
				};
			case 'SET_STATUS':
				return {
					...state,
					tokens: {
						...state.tokens,
						[action.payload.tokenAddress]: {
							...state.tokens[action.payload.tokenAddress],
							status: action.payload.status
						}
					}
				};
			case 'RESET':
				return {receiver: undefined, tokens: {}};
		}
	};

	const [configuration, dispatch] = useReducer(configurationReducer, defaultProps.configuration);

	useUpdateEffect((): void => {
		if (!address || isZeroAddress(address)) {
			dispatch({type: 'RESET', payload: undefined});
		} else if (!configuration.receiver || isZeroAddress(configuration.receiver.address)) {
			dispatch({
				type: 'SET_RECEIVER',
				payload: {
					address,
					label: address,
					isValid: true
				}
			});
		}
	}, [address]);

	const contextValue = useMemo(
		(): TMigrate => ({
			configuration,
			dispatchConfiguration: dispatch
		}),
		[configuration]
	);

	return <MigrateContext.Provider value={contextValue}>{children}</MigrateContext.Provider>;
};

export const useMigrate = (): TMigrate => useContext(MigrateContext);
