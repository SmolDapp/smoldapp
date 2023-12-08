import abiCoder from 'web3-eth-abi';
import {toAddress} from '@utils/tools.address';
import {ETH_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';

import type {AbiCoder} from 'web3-eth-abi';
import type {AbiItem} from 'web3-utils';
import type {TAddress} from '@yearn-finance/web-lib/types';
import type {BaseTransaction} from '@gnosis.pm/safe-apps-sdk';

const ERC20ABI_TRANSFER: AbiItem = {
	constant: false,
	payable: false,
	name: 'transfer',
	type: 'function',
	stateMutability: 'nonpayable',
	inputs: [
		{name: '_to', type: 'address'},
		{name: '_value', type: 'uint256'}
	],
	outputs: [{name: '', type: 'bool'}]
};
const ERC1155_TRANSFERBATCH: AbiItem = {
	constant: false,
	payable: false,
	name: 'safeBatchTransferFrom',
	type: 'function',
	stateMutability: 'nonpayable',
	inputs: [
		{internalType: 'address', name: 'from', type: 'address'},
		{internalType: 'address', name: 'to', type: 'address'},
		{internalType: 'uint256[]', name: 'ids', type: 'uint256[]'},
		{internalType: 'uint256[]', name: 'amounts', type: 'uint256[]'},
		{internalType: 'bytes', name: 'data', type: 'bytes'}
	],
	outputs: []
};
const ERC721_TRANSFER: AbiItem = {
	constant: false,
	payable: false,
	name: 'safeTransferFrom',
	type: 'function',
	stateMutability: 'nonpayable',
	inputs: [
		{internalType: 'address', name: 'from', type: 'address'},
		{internalType: 'address', name: 'to', type: 'address'},
		{internalType: 'uint256', name: 'tokenId', type: 'uint256'},
		{internalType: 'bytes', name: 'data', type: 'bytes'}
	],
	outputs: []
};

export function getTransferTransaction(amount: string, token: TAddress, recipient: string): BaseTransaction {
	if (token === toAddress(ETH_TOKEN_ADDRESS)) {
		return {to: recipient, value: amount, data: '0x'};
	}

	const coder = abiCoder as unknown as AbiCoder;
	return {
		// For other token types, generate a contract tx
		to: token,
		value: '0',
		data: coder.encodeFunctionCall(ERC20ABI_TRANSFER, [recipient, amount])
	};
}

export function getSafeBatchTransferFrom1155(
	collection: TAddress,
	from: TAddress,
	to: TAddress,
	tokenIDs: bigint[],
	amounts: bigint[]
): BaseTransaction {
	const coder = abiCoder as unknown as AbiCoder;
	return {
		to: collection,
		value: '0',
		data: coder.encodeFunctionCall(ERC1155_TRANSFERBATCH, [from, to, tokenIDs as never, amounts as never, '0x'])
	};
}

export function getSafeTransferFrom721(
	collection: TAddress,
	from: TAddress,
	to: TAddress,
	tokenID: bigint
): BaseTransaction {
	const coder = abiCoder as unknown as AbiCoder;
	return {
		to: collection,
		value: '0',
		data: coder.encodeFunctionCall(ERC721_TRANSFER, [from, to, tokenID.toString(), '0x'])
	};
}
