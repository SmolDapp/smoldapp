import React, {createContext, useContext, useMemo, useReducer} from 'react';
import {COINGECKO_GAS_COIN_IDS} from 'utils/constants';
import {concat, hexToBigInt, keccak256, toHex} from 'viem';
import useSWR from 'swr';
import {baseFetcher} from '@yearn-finance/web-lib/utils/fetchers';

import type {TMultiSafeActions, TMultiSafeConfiguration, TOwners, TPriceFromGecko, TSafe} from './types';

export function newVoidOwner(): TOwners {
	return {
		address: undefined,
		label: '',
		UUID: crypto.randomUUID()
	};
}

export const defaulMultiSafetProps: TSafe = {
	dispatchConfiguration: (): void => undefined,
	configuration: {
		expectedAddress: undefined,
		prefix: '0x',
		suffix: '',
		factory: 'ssf',
		threshold: 1,
		seed: hexToBigInt(keccak256(concat([toHex('smol'), toHex(Math.random().toString())]))),
		owners: [newVoidOwner(), newVoidOwner()],
		originalTx: undefined,
		settings: {
			shouldUseExpertMode: false,
			shouldUseTestnets: false
		}
	},
	chainCoinPrices: {}
};

const configurationReducer = (state: TMultiSafeConfiguration, action: TMultiSafeActions): TMultiSafeConfiguration => {
	switch (action.type) {
		case 'SET_ADDRESS':
			return {...state, expectedAddress: action.payload};
		case 'SET_PREFIX':
			return {...state, prefix: action.payload};
		case 'SET_SUFFIX':
			return {...state, suffix: action.payload};
		case 'SET_FACTORY':
			return {...state, factory: action.payload};
		case 'SET_SEED':
			return {...state, seed: action.payload};
		case 'SET_THRESHOLD':
			return {...state, threshold: action.payload};
		case 'ADD_OWNERS':
			return {...state, owners: [...state.owners, ...action.payload]};
		case 'ADD_SIBLING_OWNER_FROM_UUID':
			return {
				...state,
				owners: state.owners.reduce((acc, owner): TOwners[] => {
					if (owner.UUID === action.payload) {
						return [...acc, owner, newVoidOwner()];
					}
					return [...acc, owner];
				}, [] as TOwners[])
			};
		case 'DEL_OWNER_BY_UUID':
			if (state.owners.length === 1) {
				return {...state, owners: [newVoidOwner()]};
			}
			return {
				...state,
				owners: state.owners.filter((owner): boolean => owner.UUID !== action.payload)
			};
		case 'UPD_OWNER':
			return {
				...state,
				owners: state.owners.map((owner): TOwners => {
					if (owner.UUID === action.payload.UUID) {
						return action.payload;
					}
					return owner;
				})
			};
		case 'SET_SETTINGS':
			return {...state, settings: action.payload};
		case 'SET_CONFIG':
			return {...state, ...action.payload};
		default:
			return state;
	}
};

const MultiSafeContext = createContext<TSafe>(defaulMultiSafetProps);
export const MultiSafeContextApp = ({children}: {children: React.ReactElement}): React.ReactElement => {
	const [configuration, dispatch] = useReducer(configurationReducer, defaulMultiSafetProps.configuration);
	const {data: chainCoinPrices} = useSWR<TPriceFromGecko>(
		`https://api.coingecko.com/api/v3/simple/price?ids=${Object.values(COINGECKO_GAS_COIN_IDS)}&vs_currencies=usd`,
		baseFetcher,
		{refreshInterval: 10_000}
	);

	const contextValue = useMemo(
		(): TSafe => ({
			configuration,
			dispatchConfiguration: dispatch,
			chainCoinPrices: chainCoinPrices || {}
		}),
		[chainCoinPrices, configuration]
	);

	return <MultiSafeContext.Provider value={contextValue}>{children}</MultiSafeContext.Provider>;
};

export const useMultiSafe = (): TSafe => useContext(MultiSafeContext);
