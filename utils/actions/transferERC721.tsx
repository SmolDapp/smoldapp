import {ethers} from 'ethers';

import type {TAddress} from '@yearn-finance/web-lib/utils/address';

export async function	transfer(
	provider: ethers.providers.Web3Provider,
	token: TAddress,
	to: TAddress,
	tokenID: string
): Promise<boolean> {
	const	signer = provider.getSigner();

	try {
		const	contract = new ethers.Contract(token, ['function safeTransferFrom(address from, address to, uint256 tokenId) external'], signer);
		const	from = await signer.getAddress();
		const	transaction = await contract.safeTransferFrom(from, to, tokenID);
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
