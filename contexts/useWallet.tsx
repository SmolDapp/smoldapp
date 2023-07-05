import React, {createContext, memo, useCallback, useContext, useMemo, useState} from 'react';
import {useTokenList} from 'contexts/useTokenList';
import {useBalances} from 'hooks/useBalances';
import {MATIC_TOKEN_ADDRESS} from 'utils/constants';
import defaultTokenList from 'utils/tokenLists.json';
import {getNativeToken} from 'utils/wagmiProvider';
import {useLocalStorageValue, useMountEffect, useUpdateEffect} from '@react-hookz/web';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {ETH_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';

import type {TUseBalancesTokens} from 'hooks/useBalances';
import type {Dispatch, ReactElement, SetStateAction} from 'react';
import type {TDict} from '@yearn-finance/web-lib/types';
import type {TBalanceData} from '@yearn-finance/web-lib/types/hooks';
import type {TTokenInfo} from './useTokenList';

export type TWalletContext = {
	balances: TDict<TBalanceData>,
	balancesNonce: number,
	isLoading: boolean,
	walletProvider: string,
	refresh: (tokenList?: TUseBalancesTokens[], shouldSaveInStorage?: boolean) => Promise<TDict<TBalanceData>>,
	refreshWithList: (tokenList: TDict<TTokenInfo>) => Promise<TDict<TBalanceData>>,
	set_walletProvider: Dispatch<SetStateAction<string>>,
}

const defaultProps = {
	balances: {},
	balancesNonce: 0,
	isLoading: true,
	walletProvider: 'NONE',
	refresh: async (): Promise<TDict<TBalanceData>> => ({}),
	refreshWithList: async (): Promise<TDict<TBalanceData>> => ({}),
	set_walletProvider: (): void => undefined
};

/* 🔵 - Yearn Finance **********************************************************
** This context controls most of the user's wallet data we may need to
** interact with our app, aka mostly the balances and the token prices.
******************************************************************************/
const WalletContext = createContext<TWalletContext>(defaultProps);
export const WalletContextApp = memo(function WalletContextApp({children}: {children: ReactElement}): ReactElement {
	const {tokenList} = useTokenList();
	const {chainID, isActive} = useWeb3();
	const {safeChainID} = useChainID();
	const [walletProvider, set_walletProvider] = useState('NONE');
	const {value: extraTokens, set: saveExtraTokens} = useLocalStorageValue<TUseBalancesTokens[]>('smoldapp/tokens', {defaultValue: []});

	const availableTokens = useMemo((): TUseBalancesTokens[] => {
		const withDefaultTokens = [...Object.values(tokenList), ...defaultTokenList.tokens];
		const tokens: TUseBalancesTokens[] = [];
		withDefaultTokens
			.filter((token): boolean => token.chainId === safeChainID)
			.forEach((token): void => {
				if (safeChainID === 137 && toAddress(token.address) === MATIC_TOKEN_ADDRESS) {
					return;
				}
				tokens.push({token: toAddress(token.address), decimals: Number(token.decimals), name: token.name, symbol: token.symbol});
			});
		const nativeToken = getNativeToken();
		tokens.push({
			token: toAddress(ETH_TOKEN_ADDRESS),
			decimals: nativeToken.decimals,
			name: nativeToken.name,
			symbol: nativeToken.symbol
		});
		return tokens;
	}, [safeChainID, tokenList]);

	const {data: balances, update, updateSome, nonce, isLoading} = useBalances({tokens: availableTokens});

	const onRefresh = useCallback(async (tokenToUpdate?: TUseBalancesTokens[], shouldSaveInStorage?: boolean): Promise<TDict<TBalanceData>> => {
		if (tokenToUpdate) {
			const updatedBalances = await updateSome(tokenToUpdate);
			if (shouldSaveInStorage) {
				saveExtraTokens([...(extraTokens || []), ...tokenToUpdate]);
			}
			return updatedBalances;
		}
		const updatedBalances = await update();
		return updatedBalances;
	}, [update, updateSome, saveExtraTokens, extraTokens]);

	const onRefreshWithList = useCallback(async (newTokenList: TDict<TTokenInfo>): Promise<TDict<TBalanceData>> => {
		const withDefaultTokens = [...Object.values(newTokenList)];
		const tokens: TUseBalancesTokens[] = [];
		withDefaultTokens
			.filter((token): boolean => token.chainId === safeChainID)
			.forEach((token): void => {
				tokens.push({token: token.address, decimals: Number(token.decimals), name: token.name, symbol: token.symbol});
			});
		const tokensToFetch = tokens.filter((token): boolean => {
			return !availableTokens.find((availableToken): boolean => availableToken.token === token.token);
		});
		if (tokensToFetch.length > 0) {
			return await onRefresh(tokensToFetch);
		}
		return balances[chainID];
	}, [balances, chainID, onRefresh, safeChainID, availableTokens]);

	const onLoadExtraTokens = useCallback(async (): Promise<void> => {
		if (extraTokens) {
			await updateSome(extraTokens);
		}
	}, [extraTokens, updateSome]);


	useMountEffect((): void => {
		if (!isActive) {
			performBatchedUpdates((): void => {
				set_walletProvider('NONE');
			});
		}
	});

	useUpdateEffect((): void => {
		if (isActive) {
			onLoadExtraTokens();
		}
	}, [isActive, onLoadExtraTokens]);

	/* 🔵 - Yearn Finance ******************************************************
	**	Setup and render the Context provider to use in the app.
	***************************************************************************/
	const contextValue = useMemo((): TWalletContext => ({
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
