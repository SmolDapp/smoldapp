import {ethers} from 'ethers';

import type {TAddress} from '@yearn-finance/web-lib/types';
import type {TTxResponse} from '@yearn-finance/web-lib/utils/web3/transaction';


const NFT_MIGRATOOOR_ABI = [{'inputs':[{'internalType':'contract IERC721', 'name':'collection', 'type':'address'}, {'internalType':'address', 'name':'to', 'type':'address'}, {'internalType':'uint256[]', 'name':'tokenIDs', 'type':'uint256[]'}], 'name':'migrate', 'outputs':[], 'stateMutability':'nonpayable', 'type':'function'}];

export async function	multiTransfer(
	provider: ethers.providers.Web3Provider,
	nftMigratooor: TAddress,
	collection: TAddress,
	to: TAddress,
	tokenIDs: string[]
): Promise<TTxResponse> {
	const	signer = provider.getSigner();

	try {
		const	contract = new ethers.Contract(nftMigratooor, NFT_MIGRATOOOR_ABI, signer);
		const	transaction = await contract.migrate(collection, to, tokenIDs);
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
