import {erc20ABI, useContractReads} from 'wagmi';
import {useChainID} from '@builtbymom/web3/hooks/useChainID';
import {toAddress, toNormalizedBN} from '@builtbymom/web3/utils';

import type {TAddress, TToken} from '@builtbymom/web3/types';

/**
 * Used to fetch token from the contract by its address. Wagmi's useToken is depracated and this is recommended way:
 * https://wagmi.sh/react/guides/migrate-from-v1-to-v2#deprecated-usetoken
 * @param tokenAddress
 */
export function useFetchToken({tokenAddress}: {tokenAddress: TAddress}): TToken {
	const {safeChainID} = useChainID();
	const {data: tokenRaw} = useContractReads({
		allowFailure: false,
		contracts: [
			{
				address: tokenAddress,
				abi: erc20ABI,
				functionName: 'decimals',
				chainId: safeChainID
			},
			{
				address: tokenAddress,
				abi: erc20ABI,
				functionName: 'name',
				chainId: safeChainID
			},
			{
				address: tokenAddress,
				abi: erc20ABI,
				functionName: 'symbol',
				chainId: safeChainID
			}
		]
	});

	const [decimals, name, synbol] = tokenRaw || [];

	const tokenFormatted: TToken = {
		decimals: decimals ?? 18,
		symbol: synbol ?? '',
		name: name ?? '',
		address: toAddress(tokenAddress),
		value: 0,
		price: toNormalizedBN(0),
		balance: toNormalizedBN(0),
		chainID: safeChainID
	};

	return tokenFormatted;
}
