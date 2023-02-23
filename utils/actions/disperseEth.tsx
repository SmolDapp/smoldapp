import {ethers} from 'ethers';
import {toAddress} from '@yearn-finance/web-lib/utils/address';

import type {BigNumber} from 'ethers';
import type {TAddress} from '@yearn-finance/web-lib/types';

export async function	disperseEther(
	provider: ethers.providers.Web3Provider,
	migrateDestination: TAddress,
	migrateAmount: BigNumber,
	donateAmount: BigNumber
): Promise<boolean> {
	const	signer = provider.getSigner();

	try {
		const	contract = new ethers.Contract(
			toAddress(process.env.DISPERSE_ADDRESS),
			['function disperseEther(address[] recipients, uint256[] values) external payable'],
			signer
		);

		const	transaction = await contract.disperseEther(
			[migrateDestination, process.env.RECEIVER_ADDRESS],
			[migrateAmount, donateAmount],
			{value: migrateAmount.add(donateAmount)}
		);
		const	transactionResult = await transaction.wait();
		if (transactionResult.status === 0) {
			console.error('Transaction failed');
			return false;
		}

		return true;
	} catch(error) {
		console.error(error);
		return false;
	}
}
