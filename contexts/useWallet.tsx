import React, {createContext, memo, useCallback, useContext, useMemo} from 'react';
import {useBalances} from 'hooks/useBalances';
import defaultTokenList from 'utils/tokenLists.debug.json';
import {useUI} from '@yearn-finance/web-lib/contexts/useUI';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {useClientEffect} from '@yearn-finance/web-lib/hooks/useClientEffect';
import {ETH_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {getProvider} from '@yearn-finance/web-lib/utils/web3/providers';

import {useSelected} from './useSelected';

import type {TMinBalanceData, TUseBalancesTokens} from 'hooks/useBalances';
import type {ReactElement} from 'react';
import type {TDict} from '@yearn-finance/web-lib/utils/types';
import type {TTokenInfo} from './useSelected';

export type	TWalletContext = {
	balances: TDict<TMinBalanceData>,
	balancesNonce: number,
	isLoading: boolean,
	refresh: (tokenList?: TUseBalancesTokens[]) => Promise<TDict<TMinBalanceData>>,
	refreshWithList: (tokenList: TDict<TTokenInfo>) => Promise<TDict<TMinBalanceData>>,
}

const	defaultProps = {
	balances: {},
	balancesNonce: 0,
	isLoading: true,
	refresh: async (): Promise<TDict<TMinBalanceData>> => ({}),
	refreshWithList: async (): Promise<TDict<TMinBalanceData>> => ({})
};


/* 🔵 - Yearn Finance **********************************************************
** This context controls most of the user's wallet data we may need to
** interact with our app, aka mostly the balances and the token prices.
******************************************************************************/
const	WalletContext = createContext<TWalletContext>(defaultProps);
export const WalletContextApp = memo(function WalletContextApp({children}: {children: ReactElement}): ReactElement {
	const	{tokenList} = useSelected();
	const	{provider, chainID} = useWeb3();
	const	{onLoadStart, onLoadDone} = useUI();
	const	{safeChainID} = useChainID();

	const	availableTokens = useMemo((): TUseBalancesTokens[] => {
		const	withDefaultTokens = [...Object.values(tokenList), ...defaultTokenList.tokens];
		const	tokens: TUseBalancesTokens[] = [];
		withDefaultTokens
			.filter((token): boolean => token.chainId === safeChainID)
			.forEach((token): void => {
				tokens.push({token: token.address, decimals: Number(token.decimals), symbol: token.symbol});
			});
		if (safeChainID === 1) {
			tokens.push({token: ETH_TOKEN_ADDRESS, decimals: 18, symbol: 'ETH'});
		} else if (safeChainID === 250) {
			tokens.push({token: ETH_TOKEN_ADDRESS, decimals: 18, symbol: 'FTM'});
		}
		return tokens;
	}, [safeChainID, tokenList]);

	const	{data: balances, update, updateSome, nonce, isLoading} = useBalances({
		provider: provider || getProvider(1),
		tokens: availableTokens
	});

	const	onRefresh = useCallback(async (tokenToUpdate?: TUseBalancesTokens[]): Promise<TDict<TMinBalanceData>> => {
		if (tokenToUpdate) {
			console.warn(tokenToUpdate);
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

	useClientEffect((): void => {
		if (isLoading) {
			onLoadStart();
		} else {
			onLoadDone();
		}
	}, [isLoading]);

	/* 🔵 - Yearn Finance ******************************************************
	**	Setup and render the Context provider to use in the app.
	***************************************************************************/
	const	contextValue = useMemo((): TWalletContext => ({
		balances: balances[chainID],
		balancesNonce: nonce,
		isLoading: isLoading || false,
		refresh: onRefresh,
		refreshWithList: onRefreshWithList
	}), [balances, isLoading, onRefresh, nonce, chainID, onRefreshWithList]);

	return (
		<WalletContext.Provider value={contextValue}>
			{children}
		</WalletContext.Provider>
	);
});


export const useWallet = (): TWalletContext => useContext(WalletContext);
export default useWallet;
