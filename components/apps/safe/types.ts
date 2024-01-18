import type {Dispatch} from 'react';
import type {TAddress, TDict} from '@builtbymom/web3/types';
import type {FetchTransactionResult} from '@wagmi/core';

export type TPriceFromGecko = TDict<{usd: number}>;

export type TOwners = {
	address: TAddress | undefined;
	label: string;
	UUID: string;
};
export type TMultiSafeConfiguration = {
	expectedAddress: TAddress | undefined;
	prefix: string;
	suffix: string;
	factory: 'ssf' | 'ddp';
	seed: bigint;
	threshold: number;
	owners: TOwners[];
	originalTx: FetchTransactionResult | undefined;
	settings: {
		shouldUseExpertMode: boolean;
		shouldUseTestnets: boolean;
	};
};
export type TMultiSafeActions =
	| {type: 'SET_ADDRESS'; payload: TAddress | undefined}
	| {type: 'SET_PREFIX'; payload: string}
	| {type: 'SET_SUFFIX'; payload: string}
	| {type: 'SET_FACTORY'; payload: 'ssf' | 'ddp'}
	| {type: 'SET_SEED'; payload: bigint}
	| {type: 'SET_THRESHOLD'; payload: number}
	| {type: 'ADD_OWNERS'; payload: TOwners[]}
	| {type: 'UPD_OWNER'; payload: TOwners}
	| {type: 'DEL_OWNER_BY_UUID'; payload: string}
	| {type: 'ADD_SIBLING_OWNER_FROM_UUID'; payload: string}
	| {type: 'SET_SETTINGS'; payload: TMultiSafeConfiguration['settings']}
	| {type: 'SET_CONFIG'; payload: Partial<TMultiSafeConfiguration>};

export type TSafe = {
	configuration: TMultiSafeConfiguration;
	dispatchConfiguration: Dispatch<TMultiSafeActions>;
	chainCoinPrices: TPriceFromGecko;
};
