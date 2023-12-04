import {useAsyncTrigger} from 'hooks/useAsyncTrigger';
import {YVESTING_FACTORY_ABI} from '@utils/abi/yVestingFactory.abi';
import {toBigInt} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {getClient} from '@yearn-finance/web-lib/utils/wagmi/utils';

import {FACTORY_VESTING_CONTRACT} from './constants';

export function useUserVesting(): number {
	useAsyncTrigger(async (): Promise<void> => {
		const publicClient = getClient(1337);
		const rangeLimit = toBigInt(100000);
		const deploymentBlockNumber = toBigInt(18693200);
		const currentBlockNumber = await publicClient.getBlockNumber();
		for (let i = deploymentBlockNumber; i < currentBlockNumber; i += rangeLimit) {
			console.log(i);
			const logs = await publicClient.getLogs({
				address: FACTORY_VESTING_CONTRACT,
				event: YVESTING_FACTORY_ABI[0],
				fromBlock: i,
				toBlock: i + rangeLimit,
				args: {
					recipient: '0x334CE923420ff1aA4f272e92BF68013D092aE7B4'
				}
			});
			console.log(logs);
			for (const log of logs) {
				console.log(log);
			}
		}
	}, []);

	return 0;
}
