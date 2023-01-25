import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import axios from 'axios';
import {useMountEffect} from '@react-hookz/web';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';

import type {Dispatch, SetStateAction} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/utils/address';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import type {TDict} from '@yearn-finance/web-lib/utils/types';

export type TTokenInfo = {
	chainId: number,
	address: TAddress,
	name: string,
	symbol: string,
	decimals: number,
	tags: []
};
export type TTokenList = {
	name: string;
	tokens: TTokenInfo[];
}

export type TSelected = {
	selected: TAddress[],
	amounts: TDict<TNormalizedBN>,
	destinationAddress: TAddress,
	walletProvider: string,
	tokenList: TDict<TTokenInfo>,
	set_selected: Dispatch<SetStateAction<TAddress[]>>,
	set_amounts: Dispatch<SetStateAction<TDict<TNormalizedBN>>>,
	set_destinationAddress: Dispatch<SetStateAction<TAddress>>,
	set_walletProvider: Dispatch<SetStateAction<string>>,
	set_tokenList: Dispatch<SetStateAction<TDict<TTokenInfo>>>,
}
const	defaultProps: TSelected = {
	selected: [],
	amounts: {},
	destinationAddress: toAddress(),
	walletProvider: 'NONE',
	tokenList: {},
	set_selected: (): void => undefined,
	set_amounts: (): void => undefined,
	set_destinationAddress: (): void => undefined,
	set_walletProvider: (): void => undefined,
	set_tokenList: (): void => undefined
};

const	SelectedContext = createContext<TSelected>(defaultProps);
export const SelectedContextApp = ({children}: {children: React.ReactElement}): React.ReactElement => {
	const	{isActive} = useWeb3();
	const	[walletProvider, set_walletProvider] = useState('NONE');
	const	[destinationAddress, set_destinationAddress] = useState<TAddress>(toAddress());
	const	[selected, set_selected] = useState<TAddress[]>([]);
	const	[amounts, set_amounts] = useState<TDict<TNormalizedBN>>({});
	const	[tokenList, set_tokenList] = useState<TDict<TTokenInfo>>({});

	useMountEffect((): void => {
		axios.get('https://tokenlist.zerion.eth.link').then((response): void => {
			const	tokenListResponse = response.data as TTokenList;
			const	tokenListTokens: TDict<TTokenInfo> = {};
			for (const eachToken of tokenListResponse.tokens) {
				tokenListTokens[toAddress(eachToken.address)] = eachToken;
			}
		});
	});

	useEffect((): void => {
		if (!isActive) {
			performBatchedUpdates((): void => {
				set_selected([]);
				set_amounts({});
				set_destinationAddress(toAddress());
				set_walletProvider('NONE');
			});
		}
	}, [isActive]);

	const	contextValue = useMemo((): TSelected => ({
		selected,
		set_selected,
		amounts,
		set_amounts,
		destinationAddress,
		set_destinationAddress,
		walletProvider,
		set_walletProvider,
		tokenList,
		set_tokenList
	}), [selected, set_selected, amounts, set_amounts, destinationAddress, set_destinationAddress, walletProvider, set_walletProvider, tokenList, set_tokenList]);

	return (
		<SelectedContext.Provider value={contextValue}>
			{children}
		</SelectedContext.Provider>
	);
};


export const useSelected = (): TSelected => useContext(SelectedContext);
