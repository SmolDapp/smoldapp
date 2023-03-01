import {ethers} from 'ethers';
import {toAddress} from '@yearn-finance/web-lib/utils/address';

import type {TTxResponse} from '@yearn-finance/web-lib/utils/web3/transaction';

export async function	deployTokenList(
	provider: ethers.providers.Web3Provider,
	name: string,
	description: string,
	logoURI: string,
	baseURI: string
): Promise<TTxResponse> {
	const	signer = provider.getSigner();

	try {
		const	contract = new ethers.Contract(
			toAddress(process.env.TOKENLISTOOOR_REGISTRY_ADDRESS),
			['function createTokenList(string memory name, string memory description, string memory logoURI, string memory baseURI) public payable'],
			signer
		);

		const	transaction = await contract.createTokenList(
			name,
			description,
			logoURI,
			baseURI,
			{value: ethers.utils.parseEther('0.001')}
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
