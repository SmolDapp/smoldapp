

import {Contract} from 'ethcall';
import ERC20_ABI from '@yearn-finance/web-lib/utils/abi/erc20.abi';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {ETH_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {toNormalizedValue} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {getProvider, newEthCallProvider} from '@yearn-finance/web-lib/utils/web3/providers';

import type {TMinBalanceData, TUseBalancesTokens} from 'apps/common/hooks/useBalances';
import type {BigNumber, ethers} from 'ethers';
import type {NextApiRequest, NextApiResponse} from 'next';
import type {TDict} from '@yearn-finance/web-lib/types';

type TPerformCall = {
	chainID: number,
	address: string,
	tokens: TUseBalancesTokens[]
}
async function getBatchBalances({
	chainID,
	address,
	tokens
}: TPerformCall): Promise<TDict<TMinBalanceData>> {
	let	currentProvider: ethers.providers.JsonRpcProvider;
	if (chainID === 1337) {
		currentProvider = getProvider(1);
		// currentProvider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
	} else {
		currentProvider = getProvider(chainID);
	}
	const	ethcallProvider = await newEthCallProvider(currentProvider);
	const	data: TDict<TMinBalanceData> = {};
	const	chunks = [];
	for (let i = 0; i < tokens.length; i += 5_000) {
		chunks.push(tokens.slice(i, i + 5_000));
	}

	for (const chunkTokens of chunks) {
		const calls = [];
		for (const element of chunkTokens) {
			const	{token} = element;
			const	ownerAddress = address;
			const	isEth = toAddress(token) === ETH_TOKEN_ADDRESS;
			if (isEth) {
				calls.push(ethcallProvider.getEthBalance(ownerAddress));
			} else {
				const	tokenContract = new Contract(token, ERC20_ABI);
				calls.push(tokenContract.balanceOf(ownerAddress));
			}
		}

		try {
			const	results = await ethcallProvider.tryAll(calls);

			let		rIndex = 0;
			for (const element of chunkTokens) {
				const	{token, symbol, decimals} = element;
				const	balanceOf = results[rIndex++] as BigNumber;
				data[toAddress(token)] = {
					decimals: Number(decimals || 18),
					symbol: symbol,
					raw: balanceOf,
					normalized: toNormalizedValue(balanceOf, Number(decimals || 18)),
					force: element.force
				};
			}
		} catch (error) {
			continue;
		}
	}
	return data;
}

export type TGetBatchBalancesResp = {balances: TDict<TMinBalanceData>, chainID: number};
export default async function handler(req: NextApiRequest, res: NextApiResponse<TGetBatchBalancesResp>): Promise<void> {
	const	balances = await getBatchBalances({
		chainID: Number(req.body.chainID),
		address: req.body.address as string,
		tokens: req.body.tokens as unknown as TUseBalancesTokens[]
	});
	return res.status(200).json({balances, chainID: req.body.chainID});
}
