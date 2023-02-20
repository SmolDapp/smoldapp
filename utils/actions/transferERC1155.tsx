import {ethers} from 'ethers';

import type {BigNumber} from 'ethers';
import type {TAddress} from '@yearn-finance/web-lib/utils/address';

export async function	safeBatchTransferFrom1155(
	provider: ethers.providers.Web3Provider,
	token: TAddress,
	to: TAddress,
	tokenIDs: string[]
): Promise<boolean> {
	const	signer = provider.getSigner();

	try {
		const	contract = new ethers.Contract(token, [
			'function safeBatchTransferFrom(address from, address to, uint256[] calldata ids, uint256[] calldata amounts, bytes calldata data) external',
			'function balanceOfBatch(address[] memory accounts, uint256[] memory ids) external view returns (uint256[] memory)'
		], signer);
		const	from = await signer.getAddress();

		//account and id arrays must be the same length
		const	amounts = await contract.balanceOfBatch(tokenIDs.map((): string => from), tokenIDs) as BigNumber[];
		const	filteredTokenIDs = [];
		const	filteredAmounts = [];
		for (let i = 0; i < tokenIDs.length; i++) {
			if (!amounts[i].isZero()) {
				filteredTokenIDs.push(tokenIDs[i]);
				filteredAmounts.push(amounts[i]);
			}
		}
		if (filteredTokenIDs.length === 0) {
			console.error('No tokens to transfer');
			return false;
		}

		const	transaction = await contract.safeBatchTransferFrom(from, to, filteredTokenIDs, filteredAmounts, '0x');
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
