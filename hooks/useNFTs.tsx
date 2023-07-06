import {useCallback} from 'react';
import {ETHEREUM_ENS_ADDRESS, POLYGON_LENS_ADDRESS} from 'utils/constants';
import {decodeAsset} from 'utils/decodeAsset';
import {retrieveENSNameFromNode} from 'utils/tools.ens';
import {getClient} from 'utils/wagmiUtils';
import {getAbiItem, parseAbi} from 'viem';
import {erc721ABI} from 'wagmi';
import {multicall} from '@wagmi/core';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {toBigInt} from '@yearn-finance/web-lib/utils/format.bigNumber';

import type {TTokenInfo} from 'contexts/useTokenList';
import type {TNFT} from 'utils/types/nftMigratooor';
import type {ContractFunctionConfig, Hex} from 'viem';
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

type TNFTLogged = {
	id: string;
	tokenID: bigint,
	address: TAddress,
	type: 'ERC721' | 'ERC1155',
}

type TMulticallContract = Parameters<typeof multicall>[0]['contracts'][0];

function useNFTs(): (userAddress: TAddress, chainID: number) => Promise<TNFT[]> {
	const filterEvents = useCallback(async (
		userAddress: TAddress,
		chainID: number
	): Promise<TNFT[]> => {
		const publicClient = getClient(chainID);
		const rangeLimit = 10_000_000n;
		const initialBlockNumber = toBigInt(0);
		const currentBlockNumber = await publicClient.getBlockNumber();

		const detectedNFTs: TNFTLogged[] = [];
		for (let i = initialBlockNumber; i < currentBlockNumber; i += rangeLimit) {
			console.log(`Scanning block ${i} to ${i + rangeLimit}`);
			const abiItem = getAbiItem({abi: erc721ABI, name: 'Transfer'});
			const [erc721Sent, erc721Received] = await Promise.all([
				publicClient.getLogs({
					event: abiItem,
					args: {from: userAddress},
					fromBlock: i,
					toBlock: i + rangeLimit,
					strict: true
				}),
				publicClient.getLogs({
					event: abiItem,
					args: {to: userAddress},
					fromBlock: i,
					toBlock: i + rangeLimit,
					strict: true
				})
			]);
			for (const log of erc721Received) {
				if (log.topics.length === 4) {
					console.log(log);
				}
				const nft: TNFTLogged = {
					id: `${log.address}_${toBigInt(log.topics[3])}`,
					tokenID: toBigInt(log.topics[3]),
					type: 'ERC721',
					address: log.address
				};
				detectedNFTs.push(nft);
			}

			for (const log of erc721Sent) {
				const id = `${log.address}_${toBigInt(log.topics[3])}`;
				const existingLog = detectedNFTs.find((l): boolean => l.id === id);
				if (existingLog) {
					detectedNFTs.splice(detectedNFTs.indexOf(existingLog), 1);
				}
			}
		}

		const calls = detectedNFTs.map((detected): TMulticallContract[] => {
			const basicCalls: TMulticallContract[] = ([
				{
					abi: erc721ABI,
					functionName: 'tokenURI',
					args: [detected.tokenID],
					address: detected.address
				} satisfies ContractFunctionConfig<typeof erc721ABI>,
				{
					abi: erc721ABI,
					functionName: 'name',
					address: detected.address
				} satisfies ContractFunctionConfig<typeof erc721ABI>,
				{
					abi: erc721ABI,
					functionName: 'symbol',
					address: detected.address
				} satisfies ContractFunctionConfig<typeof erc721ABI>
			]);

			if (toAddress(detected.address) === POLYGON_LENS_ADDRESS) {
				const lensABI = parseAbi(['function getHandle(uint256 profileId) external view returns (string memory)']);
				basicCalls.push({
					abi: lensABI,
					functionName: 'getHandle',
					args: [detected.tokenID],
					address: detected.address
				} satisfies ContractFunctionConfig<typeof lensABI>);
			}
			return basicCalls;
		});
		const result = await multicall({contracts: calls.flat(), chainId: chainID});

		let resultIndex = 0;
		const allDetectedNFTs: TNFT[] = [];
		for (const nft of detectedNFTs) {
			let handle = '';
			let uri = (result[resultIndex++] as {result: string}).result;
			const name = result[resultIndex++] as {result: string};
			const symbol = result[resultIndex++] as {result: string};
			if (toAddress(nft.address) === POLYGON_LENS_ADDRESS) {
				handle = (result[resultIndex++] as {result: string}).result;
			}
			if (!uri && toAddress(nft.address) === ETHEREUM_ENS_ADDRESS) {
				const ensName = await retrieveENSNameFromNode(nft.tokenID);
				uri = `${ensName}.eth`;
			}
			const asset = await decodeAsset(uri);
			allDetectedNFTs.push({
				id: nft.id,
				tokenID: nft.tokenID,
				imageURL: asset.src,
				imageRaw: uri,
				imageType: asset.type,
				name: asset.name || handle,
				collection: {
					address: nft.address,
					name: name.result || '',
					symbol: symbol.result || '',
					type: nft.type
				}
			});
		}

		return (allDetectedNFTs);
	}, []);

	return filterEvents;
}

export default useNFTs;
