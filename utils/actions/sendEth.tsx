import {ethers} from 'ethers';

import type {BigNumber} from 'ethers';
import type {TAddress} from '@yearn-finance/web-lib/types';
import type {TTxResponse} from '@yearn-finance/web-lib/utils/web3/transaction';

export async function	sendEther(
	provider: ethers.providers.Web3Provider,
	to: TAddress,
	amount: BigNumber,
	balance: BigNumber
): Promise<TTxResponse> {
	const	signer = provider.getSigner();

	try {
		const	gasPrice = await provider.getGasPrice();
		const	requiredBalance = ethers.BigNumber.from(balance).sub(gasPrice.mul(21000));
		let		value = amount;
		if (amount.gt(requiredBalance)) {
			value = requiredBalance;
		}
		const	transaction = await signer.sendTransaction({to, value, gasPrice});
		const	transactionResult = await transaction.wait();
		if (transactionResult.status === 0) {
			console.error('Fail to perform transaction');
			return {isSuccessful: false};
		}
		return {isSuccessful: true, receipt: transactionResult};
	} catch (error) {
		console.error(error);
		return {isSuccessful: false};
	}
}
