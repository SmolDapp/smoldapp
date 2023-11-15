import type {Dispatch, SetStateAction} from 'react';
import type {TAddress, TDict, TNDict} from '@yearn-finance/web-lib/types';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';

export type TTokenList = {
	name: string;
	description: string;
	timestamp: string;
	logoURI: string;
	uri: string;
	keywords: string[];
	version: {
		major: number;
		minor: number;
		patch: number;
	};
	tokens: {
		address: TAddress;
		name: string;
		symbol: string;
		decimals: number;
		chainId: number;
		logoURI?: string;
	}[];
};

export type TToken = {
	address: TAddress;
	name: string;
	symbol: string;
	decimals: number;
	chainID: number;
	logoURI?: string;
	//Optional fields
	value?: number;
	price?: TNormalizedBN;
	balance?: TNormalizedBN;
};
export type TChainTokens = TNDict<TDict<TToken>>;

export type TComboboxAddressInput = {
	value: TToken | null;
	possibleValues: TDict<TToken>;
	onChangeValue: (value: TToken) => void;
	onAddValue: Dispatch<SetStateAction<TDict<TToken>>>;
	shouldSort?: boolean;
};

export type TTokenWithAmount = TToken & {
	amount: TNormalizedBN;
	amountWithSlippage?: string;
};
