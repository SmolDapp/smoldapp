import {ethers} from 'ethers';

import type {TAddress} from '@yearn-finance/web-lib/types';
import type {TTxResponse} from '@yearn-finance/web-lib/utils/web3/transaction';

export async function	removeTokenFromList(
	provider: ethers.providers.Web3Provider,
	tokenList: TAddress,
	address: TAddress
): Promise<TTxResponse> {
	const	signer = provider.getSigner();

	try {
		const	contract = new ethers.Contract(
			tokenList,
			['function unsetToken(address tokenAddress) public'],
			signer
		);

		const	transaction = await contract.unsetToken(
			address
		);
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
