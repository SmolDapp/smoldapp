import abiCoder from 'web3-eth-abi';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {ETH_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';

import type {AbiCoder} from 'web3-eth-abi';
import type {AbiItem} from 'web3-utils';
import type {TAddress} from '@yearn-finance/web-lib/types';
import type {BaseTransaction} from '@gnosis.pm/safe-apps-sdk';

const TRANSFER_ABI: AbiItem = {
	constant: false,
	inputs: [
		{
			name: '_to',
			type: 'address'
		},
		{
			name: '_value',
			type: 'uint256'
		}
	],
	name: 'transfer',
	outputs: [
		{
			name: '',
			type: 'bool'
		}
	],
	payable: false,
	stateMutability: 'nonpayable',
	type: 'function'
};

function encodeTxData(method: AbiItem, recipient: string, amount: string): string {
	const coder = abiCoder as unknown as AbiCoder;
	return coder.encodeFunctionCall(method, [recipient, amount]);
}

function getTransferTransaction(
	amount: string,
	token: TAddress,
	recipient: string
): BaseTransaction {
	if (token === toAddress(ETH_TOKEN_ADDRESS)) {
		return {
			// Send ETH directly to the recipient address
			to: recipient,
			value: amount,
			data: '0x'
		};
	}

	return {
		// For other token types, generate a contract tx
		to: token,
		value: '0',
		data: encodeTxData(TRANSFER_ABI, recipient, amount)
	};
}

export {getTransferTransaction};
