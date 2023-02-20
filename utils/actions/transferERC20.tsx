import {ethers} from 'ethers';
import ERC20_ABI from '@yearn-finance/web-lib/utils/abi/erc20.abi';

import type {BigNumber} from 'ethers';
import type {TAddress} from '@yearn-finance/web-lib/utils/address';

export async function	transfer(
	provider: ethers.providers.Web3Provider,
	token: TAddress,
	receiver: TAddress,
	amount: BigNumber
): Promise<boolean> {
	const	signer = provider.getSigner();

	try {
		const	contract = new ethers.Contract(token, ERC20_ABI, signer);

		const	transaction = await contract.transfer(receiver, amount);
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
