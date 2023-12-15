import {fromHex, type Hex, pad, toHex} from 'viem';
import axios from 'axios';
import {toAddress} from '@utils/tools.address';
import {supportedNetworks, type TAppExtendedChain} from '@utils/tools.chains';
import {ZERO_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {getClient, getNetwork} from '@yearn-finance/web-lib/utils/wagmi/utils';

import type {TAddress} from '@utils/tools.address';
import type {TOwners} from './types';

export const ZERO = '0';
export const CALL_INIT_SIGNATURE = '1688f0b9'; // 1.3.0
export const SAFE_CREATION_SIGNATURE = 'b63e800d'; // 1.3.0
export const SAFE_CREATION_TOPIC = '0x141df868a6331af528e38c83b7aa03edc19be66e37ae67f9285bf4f8e3c6a1a8'; // 1.3.0

// Expected addresses with [Safe Singleton Factory](https://github.com/gnosis/safe-singleton-factory)
export const PROXY_FACTORY_L2 = toAddress('0xC22834581EbC8527d974F8a1c97E1bEA4EF910BC'); // 1.3.0+Libs0
export const SINGLETON_L2 = toAddress('0xfb1bffC9d739B8D520DaF37dF666da4C687191EA'); // 1.3.0+Libs0

// Expected addresses with [Deterministic Deployment Proxy](https://github.com/Arachnid/deterministic-deployment-proxy)
export const PROXY_FACTORY_L2_DDP = toAddress('0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2'); // 1.3.0
export const SINGLETON_L2_DDP = toAddress('0x3E5c63644E683549055b9Be8653de26E0B4CD36E'); // 1.3.0

export const PROXY_FACTORY_L1 = toAddress('0xa6b71e26c5e0845f74c812102ca7114b6a896ab2'); // 1.3.0
export const SINGLETON_L1 = toAddress('0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552'); // 1.3.0

export const FALLBACK_HANDLER = toAddress('0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4'); // 1.3.0
export const GNOSIS_SAFE_PROXY_CREATION_CODE =
	'0x608060405234801561001057600080fd5b506040516101e63803806101e68339818101604052602081101561003357600080fd5b8101908080519060200190929190505050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614156100ca576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260228152602001806101c46022913960400191505060405180910390fd5b806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505060ab806101196000396000f3fe608060405273ffffffffffffffffffffffffffffffffffffffff600054167fa619486e0000000000000000000000000000000000000000000000000000000060003514156050578060005260206000f35b3660008037600080366000845af43d6000803e60008114156070573d6000fd5b3d6000f3fea2646970667358221220d1429297349653a4918076d650332de1a1068c5f3e07c5c82360c277770b955264736f6c63430007060033496e76616c69642073696e676c65746f6e20616464726573732070726f7669646564'; // 1.3.0

export const DEFAULT_FEES_USD = 4.2;
export const SMOL_MS = toAddress('0x55537a67607d1985698d41CE2E53a6eB6b8BD555');

export async function retrieveSafeTxHash(address: TAddress): Promise<{hash: Hex; chainID: number} | undefined> {
	for (const chain of supportedNetworks) {
		try {
			const publicClient = getClient(chain.id);
			const byteCode = await publicClient.getBytecode({address});
			if (byteCode) {
				let txHash: Hex | null = '0x0';

				const safeAPI = (getNetwork(chain.id) as TAppExtendedChain).safeApiUri;
				if (safeAPI) {
					try {
						const {data: creationData} = await axios.get(
							`${safeAPI}/api/v1/safes/${toAddress(address)}/creation/`
						);
						if (creationData?.transactionHash) {
							txHash = creationData.transactionHash;
						}
						if (txHash) {
							return {hash: txHash, chainID: chain.id};
						}
					} catch (error) {
						// nothing
					}
				}
				if (!safeAPI) {
					const rangeLimit = 10_000_000n;
					const currentBlockNumber = await publicClient.getBlockNumber();
					const deploymentBlockNumber = 0n;
					for (let i = deploymentBlockNumber; i < currentBlockNumber; i += rangeLimit) {
						const logs = await publicClient.getLogs({
							address,
							fromBlock: i,
							toBlock: i + rangeLimit
						});
						if (logs.length > 0 && logs[0].topics?.[0] === SAFE_CREATION_TOPIC) {
							txHash = logs[0].transactionHash;
						}
					}
				}
				if (txHash) {
					return {hash: txHash, chainID: chain.id};
				}
			}
		} catch (error) {
			// nothing
		}
	}
	return undefined;
}

type TArgInitializers = {
	owners: TAddress[];
	threshold: number;
	salt: bigint;
	singleton: TAddress;
};

export function decodeArgInitializers(argsHex: Hex): TArgInitializers {
	const allParts = argsHex.substring(10).match(/.{1,64}/g);
	if (!allParts) {
		throw new Error('Invalid args');
	}
	const salt = `0x${allParts[2]}` as Hex;
	const args = argsHex.substring(argsHex.indexOf(SAFE_CREATION_SIGNATURE) + SAFE_CREATION_SIGNATURE.length);
	const parts = args.match(/.{1,64}/g);
	if (!parts) {
		throw new Error('Invalid args');
	}
	const threshold = Number(parts[1]);
	const ownersLength = Number(parts[8]);
	const owners = parts.slice(9, 9 + ownersLength).map((owner): TAddress => toAddress(`0x${owner.substring(24)}`));

	let singleton = SINGLETON_L2;
	if (argsHex.toLowerCase().includes('3e5c63644e683549055b9be8653de26e0b4cd36e')) {
		singleton = SINGLETON_L2_DDP;
	} else if (argsHex.toLowerCase().includes('d9db270c1b5e3bd161e8c8503c55ceabee709552')) {
		singleton = SINGLETON_L1;
	}
	return {owners, threshold, salt: fromHex(salt, 'bigint'), singleton};
}

export function generateArgInitializers(owners: TOwners[], threshold: number): string {
	return (
		'b63e800d' + //Function signature
		'100'.padStart(64, '0') + // Version
		threshold.toString().padStart(64, '0') + // Threshold
		ZERO_ADDRESS.substring(2).padStart(64, '0') + // Address zero, TO
		pad(toHex(0x120 + 0x20 * owners.length))
			.substring(2)
			.padStart(64, '0') + // Data length
		FALLBACK_HANDLER.substring(2).padStart(64, '0') +
		ZERO_ADDRESS.substring(2).padStart(64, '0') + // paymentToken
		ZERO.padStart(64, '0') + // payment
		ZERO_ADDRESS.substring(2).padStart(64, '0') + // paymentReceiver
		owners.length.toString().padStart(64, '0') + // owners.length
		owners.map((owner): string => toAddress(owner.address).substring(2).padStart(64, '0')).join('') + // owners
		ZERO.padStart(64, '0') // data.length
	);
}
