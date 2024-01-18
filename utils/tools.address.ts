import {getClient} from '@builtbymom/web3/utils/wagmi';

import {supportedNetworks} from './tools.chains';

import type {GetBytecodeReturnType} from 'viem';
import type {TAddress} from '@builtbymom/web3/types';

export async function getIsSmartContract({
	address,
	chainId,
	checkAllNetworks = false
}: {
	address: TAddress;
	chainId: number;
	checkAllNetworks?: boolean;
}): Promise<boolean> {
	try {
		const getBytecodeAsync = async (networkId: number): Promise<GetBytecodeReturnType> => {
			const publicClient = getClient(networkId);
			return publicClient.getBytecode({address});
		};

		if (checkAllNetworks) {
			const promisesArray = supportedNetworks.map(async network => getBytecodeAsync(network.id));
			return Boolean(await Promise.any(promisesArray));
		}
		return Boolean(await getBytecodeAsync(chainId));
	} catch (error) {
		return false;
	}
}
