import config from 'utils/wagmiConfig';
import {getNativeToken} from 'utils/wagmiProvider';
import {serialize} from 'wagmi';
import {erc20ABI} from '@wagmi/core';
import AGGREGATE3_ABI from '@yearn-finance/web-lib/utils/abi/aggregate.abi';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {ARB_WETH_TOKEN_ADDRESS, ETH_TOKEN_ADDRESS, MULTICALL3_ADDRESS, OPT_WETH_TOKEN_ADDRESS, WETH_TOKEN_ADDRESS, WFTM_TOKEN_ADDRESS, ZERO_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {decodeAsBigInt, decodeAsNumber, decodeAsString} from '@yearn-finance/web-lib/utils/decoder';
import {toNormalizedValue} from '@yearn-finance/web-lib/utils/format.bigNumber';

import type {TUseBalancesTokens} from 'hooks/useBalances';
import type {NextApiRequest, NextApiResponse} from 'next';
import type {TAddress, TDict} from '@yearn-finance/web-lib/types';
import type {TBalanceData} from '@yearn-finance/web-lib/types/hooks';

export function getNativeTokenWrapperContract(chainID: number): TAddress {
	switch (chainID) {
		case 1:
			return WETH_TOKEN_ADDRESS;
		case 10:
			return OPT_WETH_TOKEN_ADDRESS;
		case 250:
			return WFTM_TOKEN_ADDRESS;
		case 42161:
			return ARB_WETH_TOKEN_ADDRESS;
		//testnets
		case 1337:
			return WETH_TOKEN_ADDRESS;
		default:
			return ZERO_ADDRESS;
	}
}

type TPerformCall = {
	chainID: number,
	address: string,
	tokens: TUseBalancesTokens[]
}
async function getBatchBalances({
	chainID,
	address,
	tokens
}: TPerformCall): Promise<TDict<TBalanceData>> {
	const data: TDict<TBalanceData> = {};
	const chunks = [];
	for (let i = 0; i < tokens.length; i += 5_000) {
		chunks.push(tokens.slice(i, i + 5_000));
	}
	const nativeToken = getNativeToken(chainID);
	const nativeTokenWrapper = getNativeTokenWrapperContract(chainID);
	for (const chunkTokens of chunks) {
		const calls = [];
		for (const element of chunkTokens) {
			const {token} = element;
			const ownerAddress = toAddress(address);
			const isEth = toAddress(token) === toAddress(ETH_TOKEN_ADDRESS);
			if (isEth) {
				const multicall3Contract = {address: MULTICALL3_ADDRESS, abi: AGGREGATE3_ABI};
				const baseContract = {address: nativeTokenWrapper, abi: erc20ABI};
				calls.push({...multicall3Contract, functionName: 'getEthBalance', args: [ownerAddress]});
				calls.push({...baseContract, functionName: 'decimals'});
				calls.push({...baseContract, functionName: 'symbol'});
				calls.push({...baseContract, functionName: 'name'});
			} else {
				const baseContract = {address: toAddress(token), abi: erc20ABI};
				calls.push({...baseContract, functionName: 'balanceOf', args: [ownerAddress]});
				calls.push({...baseContract, functionName: 'decimals'});
				calls.push({...baseContract, functionName: 'symbol'});
				calls.push({...baseContract, functionName: 'name'});
			}
		}

		try {
			const multicallInstance = config.getPublicClient({chainId: chainID}).multicall;
			const results = await multicallInstance({contracts: calls as never[]});

			let rIndex = 0;
			for (const element of tokens) {
				const {token} = element;
				const balanceOf = decodeAsBigInt(results[rIndex++]);
				const decimalsIndex = results[rIndex++];
				const decimals = decodeAsNumber(decimalsIndex) || Number(decodeAsBigInt(decimalsIndex));
				const symbol = decodeAsString(results[rIndex++]);
				const name = decodeAsString(results[rIndex++]);
				data[toAddress(token)] = {
					decimals: decimals || 18,
					symbol: toAddress(token) === ETH_TOKEN_ADDRESS ? nativeToken.symbol : symbol,
					name: toAddress(token) === ETH_TOKEN_ADDRESS ? nativeToken.name : name,
					raw: balanceOf,
					rawPrice: 0n,
					normalized: toNormalizedValue(balanceOf, decimals || 18),
					normalizedPrice: 0,
					normalizedValue: 0
				};
			}
		} catch (error) {
			console.log(error);
			continue;
		}
	}

	return data;
}

export function isArrayOfUseBalancesTokens(value: unknown): value is TUseBalancesTokens[] {
	return Array.isArray(value) && value.every(({token}): boolean => !!token && typeof token === 'string');
}

export type TGetBatchBalancesResp = {balances: string, chainID: number};
export default async function handler(req: NextApiRequest, res: NextApiResponse<TGetBatchBalancesResp>): Promise<void> {
	const chainID = Number(req.body.chainID);
	const address = String(req.body.address);
	const tokens = isArrayOfUseBalancesTokens(req.body.tokens) ? req.body.tokens : [];

	try {
		const balances = await getBatchBalances({chainID, address, tokens});
		return res.status(200).json({balances: serialize(balances), chainID: req.body.chainID});
	} catch (error) {
		console.error(error);
	}
}
