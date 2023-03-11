import {ethers} from 'ethers';

import type {BigNumber} from 'ethers';
import type {TAddress} from '@yearn-finance/web-lib/types';
import type {TTxResponse} from '@yearn-finance/web-lib/utils/web3/transaction';

export async function	safeBatchTransferFrom1155(
	provider: ethers.providers.Web3Provider,
	token: TAddress,
	to: TAddress,
	tokenIDs: string[]
): Promise<TTxResponse> {
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
			return {isSuccessful: false};
		}
		const	transaction = await contract.safeBatchTransferFrom(from, to, filteredTokenIDs, filteredAmounts, '0x');
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

export async function	listPossibleTransferFrom1155(
	provider: ethers.providers.JsonRpcProvider,
	token: TAddress,
	tokenIDs: string[]
): Promise<[any[], any[]]> {
	const	signer = provider.getSigner();

	try {
		const	contract = new ethers.Contract(token, ['function balanceOfBatch(address[] memory accounts, uint256[] memory ids) external view returns (uint256[] memory)'], signer);
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
			return [[], []];
		}
		return [filteredTokenIDs, filteredAmounts];
	} catch(error) {
		return [[], []];
	}
}
