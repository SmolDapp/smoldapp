import {useState} from 'react';
import {useAsyncTrigger} from 'hooks/useAsyncTrigger';
import {YVESTING_FACTORY_ABI} from '@utils/abi/yVestingFactory.abi';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {toBigInt} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {getClient} from '@yearn-finance/web-lib/utils/wagmi/utils';

import {getVestingContract} from './constants';

import type {TAddress} from '@yearn-finance/web-lib/types';

export type TStreamArgs = {
	funder: TAddress;
	token: TAddress;
	recipient: TAddress;
	escrow: TAddress;
	amount: bigint;
	vesting_start: bigint;
	vesting_duration: bigint;
	cliff_length: bigint;
	open_claim: boolean;
	chainID: number;
};
export function useUserStreams(): {data: TStreamArgs[]; isFetching: boolean} {
	const {address} = useWeb3();
	const {chainID} = useChainID();
	const [isFetching, set_isFetching] = useState<boolean>(false);
	const [vestings, set_vestings] = useState<TStreamArgs[]>([]);

	useAsyncTrigger(async (): Promise<void> => {
		const vestings: TStreamArgs[] = [];
		if (!address) {
			set_vestings([]);
			return;
		}

		const vestingContracts = getVestingContract(chainID);
		if (!vestingContracts) {
			console.warn(`No vesting contract on chain ${chainID}`);
			set_vestings([]);
			return;
		}
		set_isFetching(true);
		const publicClient = getClient(chainID);
		const deploymentBlockNumber = toBigInt(
			vestingContracts.reduce((prev, current) => {
				return toBigInt(prev.blockCreated) < toBigInt(current.blockCreated) ? prev : current;
			}).blockCreated
		);
		const rangeLimit = toBigInt(100_000);
		const currentBlockNumber = await publicClient.getBlockNumber();

		const addresses = vestingContracts.map(contract => contract.address);
		for (let i = deploymentBlockNumber; i < currentBlockNumber; i += rangeLimit) {
			const logs = await publicClient.getLogs({
				address: addresses,
				event: YVESTING_FACTORY_ABI[0],
				fromBlock: i,
				toBlock: i + rangeLimit,
				args: {
					recipient: address
				}
			});
			for (const log of logs) {
				vestings.push({
					...(log.args as TStreamArgs),
					chainID: chainID
				});
			}
		}
		set_vestings(vestings);
		set_isFetching(false);
	}, [address, chainID]);

	return {data: vestings, isFetching};
}
