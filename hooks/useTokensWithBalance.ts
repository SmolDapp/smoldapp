import {useState} from 'react';
import useWallet from '@builtbymom/web3/contexts/useWallet';
import {useTokenList} from '@builtbymom/web3/contexts/WithTokenList';
import {useChainID} from '@builtbymom/web3/hooks/useChainID';
import {toAddress, toNormalizedBN} from '@builtbymom/web3/utils';
import {getNetwork} from '@builtbymom/web3/utils/wagmi';
import {useDeepCompareEffect, useDeepCompareMemo} from '@react-hookz/web';
import {ETH_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';

import type {TDict, TToken} from '@builtbymom/web3/types';

export function useTokensWithBalance(): {tokensWithBalance: TToken[]; isLoading: boolean} {
	const {safeChainID} = useChainID();
	const {getBalance, isLoading} = useWallet();
	const [allTokens, set_allTokens] = useState<TDict<TToken>>({});
	const {currentNetworkTokenList, isCustomToken} = useTokenList();

	useDeepCompareEffect((): void => {
		const possibleDestinationsTokens: TDict<TToken> = {};
		const {wrappedToken} = getNetwork(safeChainID).contracts;
		if (wrappedToken) {
			possibleDestinationsTokens[ETH_TOKEN_ADDRESS] = {
				address: ETH_TOKEN_ADDRESS,
				chainID: safeChainID,
				name: wrappedToken.coinName,
				symbol: wrappedToken.coinSymbol,
				decimals: wrappedToken.decimals,
				value: 0,
				price: toNormalizedBN(0),
				balance: toNormalizedBN(0),
				logoURI: `${process.env.SMOL_ASSETS_URL}/token/${safeChainID}/${ETH_TOKEN_ADDRESS}/logo-32.png`
			};
		}
		for (const eachToken of Object.values(currentNetworkTokenList)) {
			if (eachToken.address === toAddress('0x0000000000000000000000000000000000001010')) {
				continue; //ignore matic erc20
			}
			if (eachToken.chainID === safeChainID) {
				possibleDestinationsTokens[toAddress(eachToken.address)] = eachToken;
			}
		}
		set_allTokens(possibleDestinationsTokens);
	}, [currentNetworkTokenList, safeChainID]);

	const tokensWithBalance = useDeepCompareMemo((): TToken[] => {
		const withBalance = [];
		for (const dest of Object.values(allTokens)) {
			const balance = getBalance({address: dest.address, chainID: dest.chainID});
			// force displaying extra tokens along with other tokens with balance
			if (balance.raw > 0n || isCustomToken({address: dest.address, chainID: dest.chainID})) {
				withBalance.push({...dest, balance});
			}
		}
		return withBalance;
	}, [allTokens, getBalance]);

	return {tokensWithBalance, isLoading};
}
