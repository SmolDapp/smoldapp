import {ethers} from 'ethers';

import type {TAddress} from '@yearn-finance/web-lib/utils/address';

export async function	isApprovedERC721(
	provider: ethers.providers.JsonRpcProvider,
	collectionAddress: TAddress,
	operator: TAddress
): Promise<boolean> {
	const	signer = provider.getSigner();
	const	address = await signer.getAddress();

	try {
		const	contract = new ethers.Contract(
			collectionAddress,
			['function isApprovedForAll(address owner, address operator) external view returns (bool)'],
			provider
		);
		return await contract.isApprovedForAll(address, operator);
	} catch (error) {
		return false;
	}
}

export async function	setApprovalForAll(
	provider: ethers.providers.Web3Provider,
	token: TAddress,
	operator: TAddress,
	shouldAllow: boolean
): Promise<boolean> {
	const	signer = provider.getSigner();

	try {
		const	contract = new ethers.Contract(token, ['function setApprovalForAll(address operator, bool approved) external'], signer);
		const	transaction = await contract.setApprovalForAll(operator, shouldAllow);
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
