import {useState} from 'react';
import useWallet from '@builtbymom/web3/contexts/useWallet';
import {useTokenList} from '@builtbymom/web3/contexts/WithTokenList';
import {toAddress, toNormalizedBN} from '@builtbymom/web3/utils';
import {useDeepCompareEffect, useDeepCompareMemo} from '@react-hookz/web';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {ETH_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {getNetwork} from '@yearn-finance/web-lib/utils/wagmi/utils';

import type {TDict, TToken} from '@builtbymom/web3/types';

export function useTokensWithBalance(): {tokensWithBalance: TToken[]; isLoading: boolean} {
	const {safeChainID} = useChainID();
	const {getBalance, isLoading} = useWallet();
	const [allTokens, set_allTokens] = useState<TDict<TToken>>({});
	const {tokenList} = useTokenList();

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
		for (const eachToken of Object.values(tokenList)) {
			if (eachToken.address === toAddress('0x0000000000000000000000000000000000001010')) {
				continue; //ignore matic erc20
			}
			if (eachToken.chainID === safeChainID) {
				possibleDestinationsTokens[toAddress(eachToken.address)] = eachToken;
			}
		}
		set_allTokens(possibleDestinationsTokens);
	}, [tokenList, safeChainID]);

	const tokensWithBalance = useDeepCompareMemo((): TToken[] => {
		const withBalance = [];
		for (const dest of Object.values(allTokens)) {
			if (getBalance({address: dest.address, chainID: dest.chainID}).raw > 0n) {
				withBalance.push(dest);
			}
		}
		return withBalance;
	}, [allTokens, getBalance]);

	return {tokensWithBalance, isLoading};
}
