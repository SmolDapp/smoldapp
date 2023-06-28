import {useCallback, useEffect} from 'react';
import assert from 'assert';
import {getClient} from 'utils/wagmiUtils';
import {getAbiItem} from 'viem';
import {erc721ABI, readContracts} from 'wagmi';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {isZeroAddress, toAddress} from '@yearn-finance/web-lib/utils/address';
import {toBigInt} from '@yearn-finance/web-lib/utils/format.bigNumber';

import type {TTokenInfo} from 'contexts/useTokenList';
import type {Hex, Log} from 'viem';
import type {TAddress, TDict} from '@yearn-finance/web-lib/types';

export type TIncentives = {
	protocol: TAddress,
	protocolName: string,
	incentive: TAddress,
	depositor: TAddress,
	amount: bigint,
	value: number,
	estimatedAPR: number,
	blockNumber: bigint,
	txHash: Hex,
	incentiveToken?: TTokenInfo
}
export type TGroupedIncentives = {
	protocol: TAddress,
	protocolName: string,
	normalizedSum: number,
	estimatedAPR: number,
	usdPerStETH: number,
	incentives: TIncentives[]
}

export type TIncentivesFor = {
	protocols: TDict<TGroupedIncentives>,
	user: TDict<TGroupedIncentives>
}

export type TNFT = {
	id: string;
	tokenID: bigint,
	type: 'ERC721' | 'ERC1155',
	image_url: string,
	image_preview_url: string,
	image_type?: string
	name: string,
	permalink: string,
	collection: {
		name: string,
	},
	assetContract: {
		address: string,
		name: string,
		schema_name: string,
	};
	image_raw?: string,
}

function useNFTs(): any {
	const {address} = useWeb3();

	const filterEvents = useCallback(async (): Promise<void> => {
		assert(!isZeroAddress(toAddress(address)), 'No address');

		const publicClient = getClient(1101);
		const rangeLimit = 1_000_000n;
		const initialBlockNumber = toBigInt(0);
		const currentBlockNumber = await publicClient.getBlockNumber();

		type TLog = Log & {id: string}
		const tokenList: TLog[] = [];
		for (let i = initialBlockNumber; i < currentBlockNumber; i += rangeLimit) {
			const abiItem = getAbiItem({abi: erc721ABI, name: 'Transfer'});
			const [erc721Sent, erc721Received] = await Promise.all([
				publicClient.getLogs({
					event: abiItem,
					args: {from: toAddress(address)},
					fromBlock: i,
					toBlock: i + rangeLimit,
					strict: true
				}),
				publicClient.getLogs({
					event: abiItem,
					args: {to: toAddress(address)},
					fromBlock: i,
					toBlock: i + rangeLimit,
					strict: true
				})
			]);
			for (const log of erc721Received) {
				if (log.topics.length === 4) {
					console.log(log);
				}
				const tLog = {...log, id: `${log.address}_${toBigInt(log.topics[3])}`};
				// const nft = {
				// 	id: tLog.id,
				// 	tokenID: toBigInt(tLog.topics[3]),
				// 	type: 'ERC721',
				// 	image_url: '',
				// 	name: '',
				// 	permalink: '',
				// 	collection: {
				// 		name: ''
				// 	},
				// 	assetContract: {
				// 		address: ''',
				// 		name: '',
				// 		schema_name: '',
				// 	}
				// 	image_raw: ''
				// }
				tokenList.push(tLog);
			}

			for (const log of erc721Sent) {
				const tLog = {...log, id: `${log.address}_${toBigInt(log.topics[3])}`};
				const existingLog = tokenList.find((l): boolean => l.id === tLog.id);
				if (existingLog) {
					tokenList.splice(tokenList.indexOf(existingLog), 1);
				}
			}
		}

		const result = await readContracts({
			contracts: tokenList.map((log): any => ({
				abi: erc721ABI,
				functionName: 'tokenURI',
				args: [log.topics[3]],
				address: log.address
			}))
		});

		console.log(result);
	}, [address]);
	useEffect((): void => {
		filterEvents();
	}, [filterEvents]);

	return null;
}

export default useNFTs;
