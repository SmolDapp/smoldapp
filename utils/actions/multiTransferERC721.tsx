import {ethers} from 'ethers';

import type {TAddress} from '@yearn-finance/web-lib/utils/address';


const NFT_MIGRATOOOR_ABI = [{'inputs': [{'internalType': 'address', 'name': '_to', 'type': 'address'}, {'internalType': 'address', 'name': '_collection', 'type': 'address'}, {'internalType': 'uint256[]', 'name': 'tokenIDs', 'type': 'uint256[]'}], 'name': 'migrate', 'outputs': [], 'stateMutability': 'nonpayable', 'type': 'function'}, {'inputs': [{'internalType': 'address', 'name': '_to', 'type': 'address'}, {'internalType': 'address', 'name': '_collection', 'type': 'address'}, {'internalType': 'uint256', 'name': 'tokenID', 'type': 'uint256'}], 'name': 'migrateOne', 'outputs': [], 'stateMutability': 'nonpayable', 'type': 'function'}];

export async function	multiTransfer(
	provider: ethers.providers.Web3Provider,
	collection: TAddress,
	to: TAddress,
	tokenIDs: string[]
): Promise<boolean> {
	const	signer = provider.getSigner();

	try {
		const	NFTMigratooor = '0x2e3a0E24302A30e237891b91462Ea534552719b1';
		const	contract = new ethers.Contract(NFTMigratooor, NFT_MIGRATOOOR_ABI, signer);
		const	transaction = await contract.migrate(to, collection, tokenIDs);
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
