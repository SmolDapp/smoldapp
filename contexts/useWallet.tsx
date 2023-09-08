import React, {createContext, memo, useCallback, useContext, useMemo, useState} from 'react';
import {useTokenList} from 'contexts/useTokenList';
import defaultTokenList from 'utils/tokenLists.json';
import {useLocalStorageValue, useMountEffect, useUpdateEffect} from '@react-hookz/web';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useBalances} from '@yearn-finance/web-lib/hooks/useBalances';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {ETH_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {toNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {performBatchedUpdates} from '@yearn-finance/web-lib/utils/performBatchedUpdates';
import {getNetwork} from '@yearn-finance/web-lib/utils/wagmi/utils';

import type {Dispatch, ReactElement, SetStateAction} from 'react';
import type {TToken} from 'utils/types';
import type {TUseBalancesTokens} from '@yearn-finance/web-lib/hooks/useBalances';
import type {TAddress, TDict} from '@yearn-finance/web-lib/types';
import type {TBalanceData} from '@yearn-finance/web-lib/types/hooks';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';

export type TWalletContext = {
	balances: TDict<TBalanceData>,
	getBalance: (tokenAddress: TAddress) => TNormalizedBN,
	balancesNonce: number,
	isLoading: boolean,
	walletProvider: string,
	refresh: (tokenList?: TUseBalancesTokens[], shouldSaveInStorage?: boolean) => Promise<TDict<TBalanceData>>,
	refreshWithList: (tokenList: TDict<TToken>) => Promise<TDict<TBalanceData>>,
	set_walletProvider: Dispatch<SetStateAction<string>>,
}

const defaultProps = {
	balances: {},
	balancesNonce: 0,
	getBalance: (): TNormalizedBN => toNormalizedBN(0),
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
	const {isActive} = useWeb3();
	const {safeChainID} = useChainID();
	const [walletProvider, set_walletProvider] = useState('NONE');
	const {value: extraTokens, set: saveExtraTokens} = useLocalStorageValue<TUseBalancesTokens[]>('dumpservices/tokens', {defaultValue: []});

	const availableTokens = useMemo((): TUseBalancesTokens[] => {
		const withDefaultTokens = [...Object.values(tokenList), ...defaultTokenList.tokens];
		const tokens: TUseBalancesTokens[] = [];
		withDefaultTokens
			.filter((token): boolean => token.chainId === safeChainID)
			.forEach((token): void => {
				tokens.push({
					token: toAddress(token.address),
					decimals: Number(token.decimals),
					name: token.name,
					symbol: token.symbol
				});
			});
		const {wrappedToken} = getNetwork(safeChainID).contracts;
		if (wrappedToken) {
			tokens.push({
				token: toAddress(ETH_TOKEN_ADDRESS),
				decimals: wrappedToken.decimals,
				name: wrappedToken.coinName,
				symbol: wrappedToken.coinSymbol
			});
		}
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

	const onRefreshWithList = useCallback(async (newTokenList: TDict<TToken>): Promise<TDict<TBalanceData>> => {
		const withDefaultTokens = [...Object.values(newTokenList)];
		const tokens: TUseBalancesTokens[] = [];
		withDefaultTokens
			.filter((token): boolean => token.chainId === safeChainID)
			.forEach((token): void => {
				tokens.push({
					token: toAddress(token.address),
					decimals: Number(token.decimals),
					name: token.name,
					symbol: token.symbol
				});
			});
		const tokensToFetch = tokens.filter((token): boolean => {
			return !availableTokens.find((availableToken): boolean => availableToken.token === token.token);
		});
		if (tokensToFetch.length > 0) {
			return await onRefresh(tokensToFetch);
		}
		return balances;
	}, [balances, onRefresh, safeChainID, availableTokens]);

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
		balances: balances,
		balancesNonce: nonce,
		getBalance: (tokenAddress: TAddress): TNormalizedBN => (
			toNormalizedBN(
				balances?.[toAddress(tokenAddress)]?.raw || 0,
				balances?.[toAddress(tokenAddress)]?.decimals || 18
			)
		),
		isLoading: isLoading || false,
		refresh: onRefresh,
		refreshWithList: onRefreshWithList,
		walletProvider,
		set_walletProvider
	}), [balances, isLoading, onRefresh, nonce, onRefreshWithList, walletProvider]);

	return (
		<WalletContext.Provider value={contextValue}>
			{children}
		</WalletContext.Provider>
	);
});


export const useWallet = (): TWalletContext => useContext(WalletContext);
export default useWallet;
