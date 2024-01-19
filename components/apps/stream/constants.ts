import {toAddress} from '@builtbymom/web3/utils';

import type {TAddress, TDict} from '@builtbymom/web3/types';
import type {TChainContract} from '@builtbymom/web3/utils/wagmi';

export const FACTORY_VESTING_CONTRACTS: TDict<TChainContract[]> = {
	1: [
		{address: toAddress('0xb2bf69c30753a1a3accf75872bda1b7cffd98efb'), blockCreated: 18719915}, //Smol
		{address: toAddress('0x200C92Dd85730872Ab6A1e7d5E40A067066257cF'), blockCreated: 18291969} //Yearn OG
	],
	10: [{address: toAddress('0xb2bf69c30753a1a3accf75872bda1b7cffd98efb'), blockCreated: 113087926}],
	56: [],
	100: [{address: toAddress('0xb2bf69c30753a1a3accf75872bda1b7cffd98efb'), blockCreated: 31288273}],
	137: [{address: toAddress('0xb2bf69c30753a1a3accf75872bda1b7cffd98efb'), blockCreated: 50768528}],
	250: [],
	324: [{address: toAddress('0xBF23c8AF532072Ed2EE2d14caa6e67c5525872E9'), blockCreated: 20725875}],
	1101: [{address: toAddress('0xb2bf69c30753a1a3accf75872bda1b7cffd98efb'), blockCreated: 8416717}],
	8453: [{address: toAddress('0xb2bf69c30753a1a3accf75872bda1b7cffd98efb'), blockCreated: 7492732}],
	42161: [{address: toAddress('0xb2bf69c30753a1a3accf75872bda1b7cffd98efb'), blockCreated: 157091016}],

	// Testnet
	1337: [
		{address: toAddress('0xb2bf69c30753a1a3accf75872bda1b7cffd98efb'), blockCreated: 18719915}, //Smol
		{address: toAddress('0x200C92Dd85730872Ab6A1e7d5E40A067066257cF'), blockCreated: 18291969} //Yearn OG
	]
};

export function getVestingContracts(chainId: number): TChainContract[] | undefined {
	const contracts = FACTORY_VESTING_CONTRACTS[chainId];
	if (!contracts || contracts.length === 0) {
		return undefined;
	}
	return contracts;
}

export function getDefaultVestingContract(chainId: number): TAddress | undefined {
	const contracts = getVestingContracts(chainId);
	if (!contracts) {
		return undefined;
	}
	return contracts?.[0]?.address;
}
