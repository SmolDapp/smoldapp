import {ethers} from 'ethers';

import type {TAddress} from '@yearn-finance/web-lib/types';
import type {TTxResponse} from '@yearn-finance/web-lib/utils/web3/transaction';

export async function	transfer(
	provider: ethers.providers.Web3Provider,
	token: TAddress,
	to: TAddress,
	tokenID: string
): Promise<TTxResponse> {
	const	signer = provider.getSigner();

	try {
		const	contract = new ethers.Contract(token, ['function safeTransferFrom(address from, address to, uint256 tokenId) external'], signer);
		const	from = await signer.getAddress();
		const	transaction = await contract.safeTransferFrom(from, to, tokenID);
		const	transactionResult = await transaction.wait() as ethers.providers.TransactionReceipt;
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
