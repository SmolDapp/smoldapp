import {useAsyncTrigger} from 'hooks/useAsyncTrigger';
import {YVESTING_FACTORY_ABI} from '@utils/abi/yVestingFactory.abi';
import {toBigInt} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {getClient} from '@yearn-finance/web-lib/utils/wagmi/utils';

import type {TAddress} from '@yearn-finance/web-lib/types';

type TUseUserVestingProps = {
	stakingContract: TAddress;
	stakingToken: TAddress;
	rewardToken: TAddress;
};
export function useUserVesting(props: TUseUserVestingProps): number {
	useAsyncTrigger(async (): Promise<void> => {
		const publicClient = getClient(1);
		const rangeLimit = toBigInt(100000);
		const deploymentBlockNumber = toBigInt(18536744);
		const currentBlockNumber = await publicClient.getBlockNumber();
		for (let i = deploymentBlockNumber; i < currentBlockNumber; i += rangeLimit) {
			console.log(i);
			const logs = await publicClient.getLogs({
				address: '0xB93427b83573C8F27a08A909045c3e809610411a',
				event: YVESTING_FACTORY_ABI[0],
				fromBlock: i,
				toBlock: i + rangeLimit,
				args: {
					recipient: '0x0688547A2b5f07327a7A2644FB649CAA29C730eb'
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
