

import {Contract} from 'ethcall';
import ERC20_ABI from '@yearn-finance/web-lib/utils/abi/erc20.abi';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {ETH_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {toNormalizedValue} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {getProvider, newEthCallProvider} from '@yearn-finance/web-lib/utils/web3/providers';

import type {BigNumber} from 'ethers';
import type {TMinBalanceData, TUseBalancesTokens} from 'hooks/useBalances';
import type {TDict} from '@yearn-finance/web-lib/types';

type TPerformCall = {
	chainID: number,
	address: string,
	tokens: TUseBalancesTokens[]
}
async function performCall({
	chainID,
	address,
	tokens
}: TPerformCall): Promise<[TDict<TMinBalanceData>, Error | undefined]> {
	const	currentProvider = getProvider(chainID);
	const	ethcallProvider = await newEthCallProvider(currentProvider);

	const	calls = [];
	for (const element of tokens) {
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

	const	_data: TDict<TMinBalanceData> = {};
	try {
		const	results = await ethcallProvider.tryAll(calls);

		let		rIndex = 0;
		for (const element of tokens) {
			const	{token, symbol, decimals} = element;
			const	balanceOf = results[rIndex++] as BigNumber;
			_data[toAddress(token)] = {
				decimals: Number(decimals || 18),
				symbol: symbol,
				raw: balanceOf,
				normalized: toNormalizedValue(balanceOf, Number(decimals || 18)),
				force: element.force
			};
		}
		return [_data, undefined];
	} catch (error) {
		return [_data, error as Error];
	}
}

addEventListener('message', (event: MessageEvent<TPerformCall>): void => {
	performCall(event.data).then((res): void => postMessage(res));
});
