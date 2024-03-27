import assert from 'assert';
import {SINGLETON_L2} from 'components/apps/safe/utils';
import DISPERSE_ABI from 'utils/abi/disperse.abi';
import {erc20Abi, erc721Abi, isAddressEqual} from 'viem';
import {assertAddress, toAddress, toBigInt} from '@builtbymom/web3/utils';
import {defaultTxStatus, handleTx, retrieveConfig, toWagmiProvider} from '@builtbymom/web3/utils/wagmi';
import {readContract, sendTransaction, waitForTransactionReceipt} from '@wagmi/core';
import {MAX_UINT_256} from '@yearn-finance/web-lib/utils/constants';

import ERC1155_ABI from './abi/ERC1155.abi';
import GNOSIS_SAFE_PROXY_FACTORY from './abi/gnosisSafeProxyFactory.abi';
import {MULTICALL_ABI} from './abi/multicall3.abi';
import NFT_MIGRATOOOR_ABI from './abi/NFTMigratooor.abi';
import {usdtAbi, usdtAddress} from './abi/usdtAbi';
import {YVESTING_FACTORY_ABI} from './abi/yVestingFactory.abi';
import {YVESTING_SIMPLE_ABI} from './abi/yVestingSimple.abi';

import type {Abi, BaseError, Hex} from 'viem';
import type {Connector} from 'wagmi';
import type {TAddress} from '@builtbymom/web3/types';
import type {TTxResponse, TWriteTransaction} from '@builtbymom/web3/utils/wagmi';

//Because USDT do not return a boolean on approve, we need to use this ABI
const ALTERNATE_ERC20_APPROVE_ABI = [
	{
		constant: false,
		inputs: [
			{name: '_spender', type: 'address'},
			{name: '_value', type: 'uint256'}
		],
		name: 'approve',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function'
	}
] as const;

/* 🔵 - Smold App **************************************************************
 ** isApprovedERC20 is a _VIEW_ function that checks if a token is approved for
 ** a spender.
 ******************************************************************************/
type TIsApprovedERC20 = {
	connector: Connector | undefined;
	contractAddress: TAddress;
	spenderAddress: TAddress;
	amount?: bigint;
};
export async function isApprovedERC20(props: TIsApprovedERC20): Promise<boolean> {
	const wagmiProvider = await toWagmiProvider(props.connector);
	const result = await readContract(retrieveConfig(), {
		...wagmiProvider,
		abi: erc20Abi,
		address: toAddress(props.contractAddress),
		functionName: 'allowance',
		args: [wagmiProvider.address, props.spenderAddress]
	});
	return (result || 0n) >= toBigInt(props.amount || MAX_UINT_256);
}

/* 🔵 - Smold App **************************************************************
 ** approveERC20 is a _WRITE_ function that approves a token for a spender.
 **
 ** @param spenderAddress - The address of the spender.
 ** @param amount - The amount of collateral to deposit.
 ******************************************************************************/
type TApproveERC20 = TWriteTransaction & {
	spenderAddress: TAddress | undefined;
	amount: bigint;
};
export async function approveERC20(props: TApproveERC20): Promise<TTxResponse> {
	assertAddress(props.spenderAddress, 'spenderAddress');
	assertAddress(props.contractAddress);

	props.onTrySomethingElse = async (): Promise<TTxResponse> => {
		assertAddress(props.spenderAddress, 'spenderAddress');
		return await handleTx(props, {
			address: toAddress(props.contractAddress),
			abi: ALTERNATE_ERC20_APPROVE_ABI,
			functionName: 'approve',
			args: [props.spenderAddress, props.amount]
		});
	};

	return await handleTx(props, {
		address: toAddress(props.contractAddress),
		abi: erc20Abi,
		functionName: 'approve',
		args: [props.spenderAddress, props.amount]
	});
}

/* 🔵 - Smold App **************************************************************
 ** approveAllERC721 is a _WRITE_ function that approves a spender to spend all
 ** of a user's NFTs.
 **
 ** @param spenderAddress - The address of the spender.
 ** @param shouldAllow - Whether or not the spender should be allowed to spend
 ******************************************************************************/
type TApproveAllERC721 = TWriteTransaction & {
	spenderAddress: TAddress | undefined;
	shouldAllow: boolean;
};
export async function approveAllERC721(props: TApproveAllERC721): Promise<TTxResponse> {
	assertAddress(props.spenderAddress, 'spenderAddress');
	assertAddress(props.contractAddress);

	return await handleTx(props, {
		address: toAddress(props.contractAddress),
		abi: erc721Abi,
		functionName: 'setApprovalForAll',
		args: [props.spenderAddress, props.shouldAllow]
	});
}

/* 🔵 - Smold App **************************************************************
 ** transferERC721 is a _WRITE_ function that transfers an ERC721 token to a
 ** recipient.
 **
 ** @param receiverAddress - The address of the receiver.
 ** @param tokenID - The ID of the token to transfer.
 ******************************************************************************/
type TTransferERC721 = TWriteTransaction & {
	receiverAddress: TAddress | undefined;
	tokenID: bigint;
};
export async function transferERC721(props: TTransferERC721): Promise<TTxResponse> {
	assertAddress(props.receiverAddress, 'Receiver address');
	assertAddress(props.contractAddress, 'Contract address');
	const wagmiProvider = await toWagmiProvider(props.connector);
	assertAddress(wagmiProvider.address, 'User address');

	return await handleTx(props, {
		address: toAddress(props.contractAddress),
		abi: erc721Abi,
		functionName: 'safeTransferFrom',
		args: [wagmiProvider.address, props.receiverAddress, props.tokenID]
	});
}

/* 🔵 - Smold App **************************************************************
 ** batchTransferERC721 is a _WRITE_ function that transfers a group of ERC721
 ** tokens to a recipient.
 **
 ** @param collectionAddress - The address of the collection.
 ** @param receiverAddress - The address of the receiver.
 ** @param tokenIDs - The IDs of the tokens to transfer.
 ******************************************************************************/
type TBatchTransferERC721 = TWriteTransaction & {
	collectionAddress: TAddress | undefined;
	receiverAddress: TAddress | undefined;
	tokenIDs: bigint[];
};
export async function batchTransferERC721(props: TBatchTransferERC721): Promise<TTxResponse> {
	assertAddress(props.collectionAddress, 'Collection address');
	assertAddress(props.receiverAddress, 'Receiver address');
	assertAddress(props.contractAddress, 'Contract address');

	return await handleTx(props, {
		address: toAddress(props.contractAddress),
		abi: NFT_MIGRATOOOR_ABI,
		functionName: 'migrate',
		args: [props.collectionAddress, props.receiverAddress, props.tokenIDs]
	});
}

/* 🔵 - Smold App **************************************************************
 ** transferERC721 is a _WRITE_ function that transfers an ERC721 token to a
 ** recipient.
 **
 ** @param receiverAddress - The address of the receiver.
 ** @param tokenIDs - The IDs of the tokens to transfer.
 ******************************************************************************/
type TTransferERC1155 = TWriteTransaction & {
	receiverAddress: TAddress | undefined;
	tokenIDs: bigint[];
};
export async function transferERC1155(props: TTransferERC1155): Promise<TTxResponse> {
	assertAddress(props.receiverAddress, 'Receiver address');
	assertAddress(props.contractAddress, 'Contract address');
	const wagmiProvider = await toWagmiProvider(props.connector);
	assertAddress(wagmiProvider.address, 'User address');

	const balanceOfBatch = await readContract(retrieveConfig(), {
		...wagmiProvider,
		abi: ERC1155_ABI,
		address: toAddress(props.contractAddress),
		functionName: 'balanceOfBatch',
		args: [Array(props.tokenIDs.length).fill(wagmiProvider.address), props.tokenIDs]
	});
	const filteredTokenIDs = [];
	const filteredAmounts = [];
	for (let i = 0; i < props.tokenIDs.length; i++) {
		if (balanceOfBatch[i] > 0n) {
			filteredTokenIDs.push(props.tokenIDs[i]);
			filteredAmounts.push(balanceOfBatch[i]);
		}
	}
	assert(filteredTokenIDs.length > 0, 'No tokens to transfer');

	return await handleTx(props, {
		address: toAddress(props.contractAddress),
		abi: ERC1155_ABI,
		functionName: 'safeBatchTransferFrom',
		args: [wagmiProvider.address, props.receiverAddress, filteredTokenIDs, filteredAmounts, '0x']
	});
}

type TListERC1155 = TWriteTransaction & {
	tokenIDs: bigint[];
};
export async function listERC1155(props: TListERC1155): Promise<[bigint[], bigint[]]> {
	assertAddress(props.contractAddress, 'Contract address');
	const wagmiProvider = await toWagmiProvider(props.connector);
	assertAddress(wagmiProvider.address, 'User address');

	const balanceOfBatch = await readContract(retrieveConfig(), {
		...wagmiProvider,
		abi: ERC1155_ABI,
		address: toAddress(props.contractAddress),
		functionName: 'balanceOfBatch',
		args: [Array(props.tokenIDs.length).fill(wagmiProvider.address), props.tokenIDs]
	});
	const filteredTokenIDs: bigint[] = [];
	const filteredAmounts: bigint[] = [];
	for (let i = 0; i < props.tokenIDs.length; i++) {
		if (balanceOfBatch[i] > 0n) {
			filteredTokenIDs.push(props.tokenIDs[i]);
			filteredAmounts.push(balanceOfBatch[i]);
		}
	}
	return [filteredTokenIDs, filteredAmounts];
}

/* 🔵 - Smold App **************************************************************
 ** transferERC20 is a _WRITE_ function that transfers a token to a recipient.
 **
 ** @param spenderAddress - The address of the spender.
 ** @param amount - The amount of collateral to deposit.
 ******************************************************************************/
type TTransferERC20 = TWriteTransaction & {
	receiverAddress: TAddress | undefined;
	amount: bigint;
};
export async function transferERC20(props: TTransferERC20): Promise<TTxResponse> {
	assertAddress(props.receiverAddress, 'receiverAddress');
	assertAddress(props.contractAddress);

	return await handleTx(props, {
		address: toAddress(props.contractAddress),
		abi: isAddressEqual(props.contractAddress, usdtAddress) ? (usdtAbi as Abi) : erc20Abi,
		functionName: 'transfer',
		args: [props.receiverAddress, props.amount]
	});
}

/* 🔵 - Smold App **************************************************************
 ** transferEther is a _WRITE_ function that transfers ETH to a recipient.
 ** Here, ETH represents the chain's native coin.
 **
 ** @param spenderAddress - The address of the spender.
 ** @param amount - The amount of collateral to deposit.
 ******************************************************************************/
type TTransferEther = Omit<TWriteTransaction, 'contractAddress'> & {
	receiverAddress: TAddress | undefined;
	amount: bigint;
	shouldAdjustForGas?: boolean;
};
export async function transferEther(props: TTransferEther): Promise<TTxResponse> {
	assertAddress(props.receiverAddress, 'receiverAddress');

	props.statusHandler?.({...defaultTxStatus, pending: true});
	const wagmiProvider = await toWagmiProvider(props.connector);

	assertAddress(wagmiProvider.address, 'userAddress');
	try {
		const hash = await sendTransaction(retrieveConfig(), {
			...wagmiProvider,
			to: props.receiverAddress,
			value: props.amount
		});
		const receipt = await waitForTransactionReceipt(retrieveConfig(), {chainId: wagmiProvider.chainId, hash});
		if (receipt.status === 'success') {
			props.statusHandler?.({...defaultTxStatus, success: true});
		} else if (receipt.status === 'reverted') {
			props.statusHandler?.({...defaultTxStatus, error: true});
		}
		return {isSuccessful: receipt.status === 'success', receipt};
	} catch (error) {
		console.error(error);
		const errorAsBaseError = error as BaseError;
		props.statusHandler?.({...defaultTxStatus, error: true});
		return {isSuccessful: false, error: errorAsBaseError || ''};
	} finally {
		setTimeout((): void => {
			props.statusHandler?.({...defaultTxStatus});
		}, 3000);
	}
}

/* 🔵 - Smold App **************************************************************
 ** disperseETH is a _WRITE_ function that disperses ETH to a list of addresses.
 **
 ** @param receivers - The addresses of the receivers.
 ** @param amounts - The amounts of ETH to send to each receiver.
 ******************************************************************************/
type TDisperseETH = TWriteTransaction & {
	receivers: TAddress[];
	amounts: bigint[];
};
export async function disperseETH(props: TDisperseETH): Promise<TTxResponse> {
	assertAddress(props.contractAddress);
	for (const receiver of props.receivers) {
		assertAddress(receiver, receiver);
	}
	for (const amount of props.amounts) {
		assert(amount > 0n, 'amount must be greater than 0');
	}
	assert(props.receivers.length === props.amounts.length, 'receivers and amounts must be the same length');

	return await handleTx(props, {
		address: toAddress(props.contractAddress),
		abi: DISPERSE_ABI,
		functionName: 'disperseEther',
		args: [props.receivers, props.amounts],
		value: props.amounts.reduce((a, b): bigint => a + b, 0n)
	});
}

/* 🔵 - Smold App **************************************************************
 ** disperseERC20 is a _WRITE_ function that disperses ERC20 to a list of
 ** addresses.
 **
 ** @param receivers - The addresses of the receivers.
 ** @param amounts - The amounts of ETH to send to each receiver.
 ******************************************************************************/
type TDisperseERC20 = TWriteTransaction & {
	tokenToDisperse: TAddress | undefined;
	receivers: TAddress[];
	amounts: bigint[];
};
export async function disperseERC20(props: TDisperseERC20): Promise<TTxResponse> {
	assertAddress(props.tokenToDisperse, 'The tokenToDisperse');
	assertAddress(props.contractAddress);
	for (const receiver of props.receivers) {
		assertAddress(receiver, receiver);
	}
	for (const amount of props.amounts) {
		assert(amount > 0n, 'amount must be greater than 0');
	}
	assert(props.receivers.length === props.amounts.length, 'receivers and amounts must be the same length');

	return await handleTx(props, {
		address: toAddress(props.contractAddress),
		abi: DISPERSE_ABI,
		functionName: 'disperseToken',
		args: [props.tokenToDisperse, props.receivers, props.amounts]
	});
}

/* 🔵 - Smold App **************************************************************
 ** cloneSafe is a _WRITE_ function that clone an existing safe using the
 ** createProxyWithNonce method.
 **
 ** @param receivers - The addresses of the receivers.
 ** @param amounts - The amounts of ETH to send to each receiver.
 ******************************************************************************/
type TCloneSafe = TWriteTransaction & {
	initializers: Hex;
	salt: bigint;
};
export async function cloneSafe(props: TCloneSafe): Promise<TTxResponse> {
	assertAddress(props.contractAddress);

	return await handleTx(props, {
		address: toAddress(props.contractAddress),
		abi: GNOSIS_SAFE_PROXY_FACTORY,
		functionName: 'createProxyWithNonce',
		args: [SINGLETON_L2, props.initializers, props.salt]
	});
}

/* 🔵 - Yearn Finance **********************************************************
 ** multicall is a _WRITE_ function that can be used to cast a multicall
 **
 ** @app - common
 ** @param protocols - an array of protocols to vote for.
 ** @param amounts - an array of amounts to vote for each protocol.
 ******************************************************************************/
type TMulticall = TWriteTransaction & {
	multicallData: {
		target: TAddress;
		callData: Hex;
		value: bigint;
		allowFailure: boolean;
	}[];
};
export async function multicall(props: TMulticall): Promise<TTxResponse> {
	assert(props.connector, 'No connector');
	assert(props.multicallData.length > 0, 'Nothing to do');
	assertAddress(props.contractAddress, 'ContractAddress');

	const value = props.multicallData.reduce((a, b): bigint => a + b.value, 0n);
	return await handleTx(props, {
		address: toAddress(props.contractAddress),
		abi: MULTICALL_ABI,
		functionName: 'aggregate3Value',
		args: [props.multicallData],
		value: value
	});
}

/* 🔵 - Smold App **************************************************************
 ** deployVestingContract is a _WRITE_ function that will deploy a new vesting
 ** contract.
 **
 ** @param token ERC20 token being distributed
 ** @param recipient Address to vest tokens for
 ** @param amount Amount of tokens being vested for `recipient`
 ** @param vesting_duration Time period (in seconds) over which tokens are released
 ** @param vesting_start Epoch time when tokens begin to vest
 ** @param cliff_length Time period (in seconds) before tokens begin to vest
 ** @param owner Vesting contract owner
 ******************************************************************************/
type TNewVestingContract = TWriteTransaction & {
	token: TAddress;
	recipient: TAddress;
	amount: bigint;
	vesting_duration: bigint;
	vesting_start: bigint;
	cliff_length: bigint;
	owner: TAddress;
};
export async function deployVestingContract(props: TNewVestingContract): Promise<TTxResponse> {
	assertAddress(props.contractAddress);
	return await handleTx(props, {
		address: toAddress(props.contractAddress),
		abi: YVESTING_FACTORY_ABI,
		functionName: 'deploy_vesting_contract',
		args: [
			props.token,
			props.recipient,
			props.amount,
			props.vesting_duration,
			props.vesting_start,
			props.cliff_length,
			true,
			0n,
			props.owner
		]
	});
}

/* 🔵 - Smold App **************************************************************
 ** claimFromVesting is a _WRITE_ function that will claim the available tokens
 ** from a vesting contract.
 ******************************************************************************/
type TClaimFromVesting = TWriteTransaction & {
	streamOwner: TAddress;
};
export async function claimFromVesting(props: TClaimFromVesting): Promise<TTxResponse> {
	assertAddress(props.contractAddress);
	return await handleTx(props, {
		address: toAddress(props.contractAddress),
		abi: YVESTING_SIMPLE_ABI,
		functionName: 'claim',
		args: [props.streamOwner]
	});
}
