import React, {createContext, memo, useCallback, useContext, useMemo} from 'react';
import {useBalances} from 'hooks/useBalances';
import tokenLists from 'utils/tokenLists.debug.json';
import {useUI} from '@yearn-finance/web-lib/contexts/useUI';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {useClientEffect} from '@yearn-finance/web-lib/hooks/useClientEffect';
import {ETH_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {getProvider} from '@yearn-finance/web-lib/utils/web3/providers';

import type {TMinBalanceData, TUseBalancesTokens} from 'hooks/useBalances';
import type {ReactElement} from 'react';
import type {TDict} from '@yearn-finance/web-lib/utils/types';

export type	TWalletContext = {
	balances: TDict<TMinBalanceData>,
	balancesNonce: number,
	isLoading: boolean,
	refresh: (tokenList?: TUseBalancesTokens[]) => Promise<TDict<TMinBalanceData>>,
}

const	defaultProps = {
	balances: {},
	balancesNonce: 0,
	isLoading: true,
	refresh: async (): Promise<TDict<TMinBalanceData>> => ({})
};


/* 🔵 - Yearn Finance **********************************************************
** This context controls most of the user's wallet data we may need to
** interact with our app, aka mostly the balances and the token prices.
******************************************************************************/
const	WalletContext = createContext<TWalletContext>(defaultProps);
export const WalletContextApp = memo(function WalletContextApp({children}: {children: ReactElement}): ReactElement {
	const	{chainID, provider} = useWeb3();
	const	{onLoadStart, onLoadDone} = useUI();
	const	{safeChainID} = useChainID();

	const	availableTokens = useMemo((): TUseBalancesTokens[] => {
		const	tokens: TUseBalancesTokens[] = [];
		tokenLists.tokens
			.filter((token): boolean => token.chainId === safeChainID)
			.forEach((token): void => {
				tokens.push({token: token.address, decimals: Number(token.decimals), symbol: token.symbol});
			});
		tokens.push({token: ETH_TOKEN_ADDRESS, decimals: 18, symbol: 'ETH'});
		return tokens;
	}, [safeChainID]);

	const	{data: balances, update, updateSome, nonce, isLoading} = useBalances({
		key: chainID,
		provider: getProvider(1),
		tokens: availableTokens
	});
	console.log((availableTokens || []).length, balances);

	const	onRefresh = useCallback(async (tokenToUpdate?: TUseBalancesTokens[]): Promise<TDict<TMinBalanceData>> => {
		if (tokenToUpdate) {
			const updatedBalances = await updateSome(tokenToUpdate);
			return updatedBalances;
		}
		const updatedBalances = await update();
		return updatedBalances;

	}, [update, updateSome]);

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
		balances: balances,
		balancesNonce: nonce,
		isLoading: isLoading || false,
		refresh: onRefresh
	}), [balances, isLoading, onRefresh, nonce]);

	return (
		<WalletContext.Provider value={contextValue}>
			{children}
		</WalletContext.Provider>
	);
});


export const useWallet = (): TWalletContext => useContext(WalletContext);
export default useWallet;
