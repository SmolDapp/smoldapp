import {erc20ABI, useContractReads} from 'wagmi';
import {toNormalizedBN} from '@builtbymom/web3/utils';

import type {TAddress, TNormalizedBN} from '@builtbymom/web3/types';

/**
 * Used to fetch token balance from the contract by its address and account address. Wagmi's useBalance is depracated and this is recommended way:
 * https://wagmi.sh/react/guides/migrate-from-v1-to-v2#deprecated-usebalance-token-parameter
 * @param address
 * @param tokenAddress
 */
export function useFetchBalance({address, tokenAddress}: {address: TAddress; tokenAddress: TAddress}): TNormalizedBN {
	const {data: balanceDataRaw} = useContractReads({
		allowFailure: false,

		contracts: [
			{address: tokenAddress, abi: erc20ABI, functionName: 'balanceOf', args: [address]},
			{address: tokenAddress, abi: erc20ABI, functionName: 'decimals'}
		]
	});
	const [balance, decimals] = balanceDataRaw || [];
	const balanceNormalized = toNormalizedBN(balance ?? 0, decimals);
	return balanceNormalized;
}
