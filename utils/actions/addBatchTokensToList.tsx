import {ethers} from 'ethers';

import type {TAddress} from '@yearn-finance/web-lib/types';
import type {TTxResponse} from '@yearn-finance/web-lib/utils/web3/transaction';

export async function	addBatchTokensToList(
	provider: ethers.providers.Web3Provider,
	tokenList: TAddress,
	tokens: TAddress[]
): Promise<TTxResponse> {
	const	signer = provider.getSigner();

	try {
		const	contract = new ethers.Contract(
			tokenList,
			['function batchSetToken(address[] calldata tokenAddresses) public'],
			signer
		);

		const	transaction = await contract.batchSetToken(tokens);
		const	transactionResult = await transaction.wait();
		if (transactionResult.status === 0) {
			console.error('Transaction failed');
			return {isSuccessful: false};
		}
		return {isSuccessful: true, receipt: transactionResult};
	} catch(error) {
		console.error(error);
		return {isSuccessful: false};
	}
}
