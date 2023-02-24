import React, {createContext, memo, useCallback, useContext, useMemo, useState} from 'react';
import {useTokenList} from 'contexts/useTokenList';
import {useBalances} from 'hooks/useBalances';
import {MATIC_TOKEN_ADDRESS} from 'utils/constants';
import defaultTokenList from 'utils/tokenLists.debug.json';
import {useMountEffect} from '@react-hookz/web';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {ETH_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';

import type {TMinBalanceData, TUseBalancesTokens} from 'hooks/useBalances';
import type {Dispatch, ReactElement, SetStateAction} from 'react';
import type {TDict} from '@yearn-finance/web-lib/types';
import type {TTokenInfo} from './useTokenList';

export type	TWalletContext = {
	balances: TDict<TMinBalanceData>,
	balancesNonce: number,
	isLoading: boolean,
	walletProvider: string,
	refresh: (tokenList?: TUseBalancesTokens[]) => Promise<TDict<TMinBalanceData>>,
	refreshWithList: (tokenList: TDict<TTokenInfo>) => Promise<TDict<TMinBalanceData>>,
	set_walletProvider: Dispatch<SetStateAction<string>>,
}

const	defaultProps = {
	balances: {},
	balancesNonce: 0,
	isLoading: true,
	walletProvider: 'NONE',
	refresh: async (): Promise<TDict<TMinBalanceData>> => ({}),
	refreshWithList: async (): Promise<TDict<TMinBalanceData>> => ({}),
	set_walletProvider: (): void => undefined
};

/* 🔵 - Yearn Finance **********************************************************
** This context controls most of the user's wallet data we may need to
** interact with our app, aka mostly the balances and the token prices.
******************************************************************************/
const	WalletContext = createContext<TWalletContext>(defaultProps);
export const WalletContextApp = memo(function WalletContextApp({children}: {children: ReactElement}): ReactElement {
	const	{tokenList} = useTokenList();
	const	{chainID, isActive} = useWeb3();
	const	{safeChainID} = useChainID();
	const	[walletProvider, set_walletProvider] = useState('NONE');

	const	availableTokens = useMemo((): TUseBalancesTokens[] => {
		const	withDefaultTokens = [...Object.values(tokenList), ...defaultTokenList.tokens];
		const	tokens: TUseBalancesTokens[] = [];
		withDefaultTokens
			.filter((token): boolean => token.chainId === safeChainID)
			.forEach((token): void => {
				if (safeChainID === 137 && toAddress(token.address) === MATIC_TOKEN_ADDRESS) {
					return;
				}
				tokens.push({token: token.address, decimals: Number(token.decimals), symbol: token.symbol});
			});
		if (safeChainID === 1) {
			tokens.push({token: ETH_TOKEN_ADDRESS, decimals: 18, symbol: 'ETH'});
		} else if (safeChainID === 250) {
			tokens.push({token: ETH_TOKEN_ADDRESS, decimals: 18, symbol: 'FTM'});
		} else if (safeChainID === 137) {
			tokens.push({token: ETH_TOKEN_ADDRESS, decimals: 18, symbol: 'MATIC'});
		}
		return tokens;
	}, [safeChainID, tokenList]);

	const	{data: balances, update, updateSome, nonce, isLoading} = useBalances({tokens: availableTokens});

	const	onRefresh = useCallback(async (tokenToUpdate?: TUseBalancesTokens[]): Promise<TDict<TMinBalanceData>> => {
		if (tokenToUpdate) {
			const updatedBalances = await updateSome(tokenToUpdate);
			return updatedBalances;
		}
		const updatedBalances = await update();
		return updatedBalances;

	}, [update, updateSome]);

	const	onRefreshWithList = useCallback(async (newTokenList: TDict<TTokenInfo>): Promise<TDict<TMinBalanceData>> => {
		const	withDefaultTokens = [...Object.values(newTokenList)];
		const	tokens: TUseBalancesTokens[] = [];
		withDefaultTokens
			.filter((token): boolean => token.chainId === safeChainID)
			.forEach((token): void => {
				tokens.push({token: token.address, decimals: Number(token.decimals), symbol: token.symbol});
			});
		const	tokensToFetch = tokens.filter((token): boolean => {
			return !availableTokens.find((availableToken): boolean => availableToken.token === token.token);
		});
		if (tokensToFetch.length > 0) {
			return await onRefresh(tokensToFetch);
		}
		return balances[chainID];
	}, [balances, chainID, onRefresh, safeChainID, availableTokens]);

	useMountEffect((): void => {
		if (!isActive) {
			performBatchedUpdates((): void => {
				set_walletProvider('NONE');
			});
		}
	});


	/* 🔵 - Yearn Finance ******************************************************
	**	Setup and render the Context provider to use in the app.
	***************************************************************************/
	const	contextValue = useMemo((): TWalletContext => ({
		balances: balances[chainID],
		balancesNonce: nonce,
		isLoading: isLoading || false,
		refresh: onRefresh,
		refreshWithList: onRefreshWithList,
		walletProvider,
		set_walletProvider
	}), [balances, isLoading, onRefresh, nonce, chainID, onRefreshWithList, walletProvider]);

	return (
		<WalletContext.Provider value={contextValue}>
			{children}
		</WalletContext.Provider>
	);
});


export const useWallet = (): TWalletContext => useContext(WalletContext);
export default useWallet;
