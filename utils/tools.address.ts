import axios from 'axios';
import {getClient, getNetwork} from '@builtbymom/web3/utils/wagmi';

import {supportedNetworks} from './tools.chains';
import {assertFulfilled} from './types/assertType';

import type {GetBytecodeReturnType} from 'viem';
import type {TAddress} from '@builtbymom/web3/types';
import type {TAppExtendedChain} from './tools.chains';

export type TInputAddressLike = {
	address: TAddress | undefined;
	label: string;
	isValid: boolean | 'undetermined';
	source?: 'typed' | 'addressBook' | 'defaultValue';
	error?: string;
};
export const defaultInputAddressLike: TInputAddressLike = {
	address: undefined,
	label: '',
	isValid: 'undetermined',
	source: 'typed'
};
export async function getBytecodeAsync(networkId: number, address: TAddress): Promise<GetBytecodeReturnType> {
	const publicClient = getClient(networkId);
	return publicClient.getBytecode({address});
}

async function getIsGnosisAddress(chainId: number, address: TAddress): Promise<boolean> {
	const safeAPI = (getNetwork(chainId) as TAppExtendedChain).safeApiUri;

	if (safeAPI) {
		try {
			const {data} = await axios.get(`${safeAPI}/api/v1/safes/${address}/creation/`);
			if (data.creator) {
				return !!data.creator;
			}
			return false;
		} catch (error) {
			return false;
		}
	}
	return false;
}

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
		if (checkAllNetworks) {
			const promisesArray = supportedNetworks.map(network => ({
				network,
				promise: getBytecodeAsync(network.id, address)
			}));
			const promisesSettled = await Promise.allSettled(
				promisesArray.map(async ({promise, network}) => {
					return {bytecode: await promise, network: network.id};
				})
			);
			const bytecodeWithNetwork = promisesSettled.filter(assertFulfilled).find(item => item.value)?.value;
			const {bytecode, network} = bytecodeWithNetwork || {};
			const isGnosisAddress = bytecode && network ? await getIsGnosisAddress(network, address) : false;
			return isGnosisAddress ? false : Boolean(bytecode);
		}

		const bytecode = await getBytecodeAsync(chainId, address);
		const isGnosisAddress = bytecode ? await getIsGnosisAddress(chainId, address) : false;

		return isGnosisAddress ? false : Boolean(bytecode);
	} catch (error) {
		return false;
	}
}
