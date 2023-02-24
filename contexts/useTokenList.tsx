import React, {createContext, useContext, useMemo, useState} from 'react';
import axios from 'axios';
import {useMountEffect} from '@react-hookz/web';
import {toAddress} from '@yearn-finance/web-lib/utils/address';

import type {Dispatch, SetStateAction} from 'react';
import type {TAddress, TDict} from '@yearn-finance/web-lib/types';

export type TTokenInfo = {
	chainId: number,
	address: TAddress,
	name: string,
	symbol: string,
	decimals: number,
	logoURI: string,
};
export type TTokenList = {
	name: string;
	tokens: TTokenInfo[];
}

export type TTokenListProps = {
	tokenList: TDict<TTokenInfo>,
	set_tokenList: Dispatch<SetStateAction<TDict<TTokenInfo>>>,
}
const	defaultProps: TTokenListProps = {
	tokenList: {},
	set_tokenList: (): void => undefined
};

const	TokenList = createContext<TTokenListProps>(defaultProps);
export const TokenListContextApp = ({children}: {children: React.ReactElement}): React.ReactElement => {
	const	[tokenList, set_tokenList] = useState<TDict<TTokenInfo>>({});

	useMountEffect((): void => {
		axios.get('https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/tokenlistooor.json').then((response): void => {
			const	tokenListResponse = response.data as TTokenList;
			const	tokenListTokens: TDict<TTokenInfo> = {};
			for (const eachToken of tokenListResponse.tokens) {
				tokenListTokens[toAddress(eachToken.address)] = eachToken;
			}
			set_tokenList(tokenListTokens);
		});
	});

	const	contextValue = useMemo((): TTokenListProps => ({
		tokenList,
		set_tokenList
	}), [tokenList]);

	return (
		<TokenList.Provider value={contextValue}>
			{children}
		</TokenList.Provider>
	);
};


export const useTokenList = (): TTokenListProps => useContext(TokenList);
