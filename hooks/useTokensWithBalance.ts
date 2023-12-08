import {useState} from 'react';
import {useTokenList} from 'contexts/useTokenList';
import useWallet from 'contexts/useWallet';
import {useDeepCompareEffect, useDeepCompareMemo} from '@react-hookz/web';
import {toAddress} from '@utils/tools.address';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {ETH_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {getNetwork} from '@yearn-finance/web-lib/utils/wagmi/utils';

import type {TDict} from '@yearn-finance/web-lib/types';
import type {TToken} from '@utils/types/types';

export function useTokensWithBalance(): TToken[] {
	const {safeChainID} = useChainID();
	const {getBalance} = useWallet();
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

	const filteredBalances = useDeepCompareMemo((): TToken[] => {
		const withBalance = [];
		for (const dest of Object.values(allTokens)) {
			if (getBalance(dest.address).raw > 0n) {
				withBalance.push(dest);
			}
		}
		return withBalance;
	}, [allTokens, getBalance]);

	return filteredBalances;
}
