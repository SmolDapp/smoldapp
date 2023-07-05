import {createPublicClient, http} from 'viem';
import {arbitrum, fantom, gnosis, localhost, polygon, polygonZkEvm} from 'viem/chains';
import {mainnet, type PublicClient} from 'wagmi';

import {optimism} from './wagmiChains';

import type {Chain} from 'viem/chains';

export function getClient(chainID: number): PublicClient {
	if (chainID === 1337) {
		return createPublicClient({
			chain: localhost,
			transport: http('http://localhost:8545')
		});
	}
	if (chainID === 10) {
		return createPublicClient({
			chain: optimism as Chain,
			transport: http('https://mainnet.optimism.io')
		});
	}
	if (chainID === 100) {
		return createPublicClient({
			chain: gnosis,
			transport: http('https://rpc.xdaichain.com')
		});
	}
	if (chainID === 137) {
		return createPublicClient({
			chain: polygon,
			transport: http(`https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`)
		});
	}
	if (chainID === 250) {
		return createPublicClient({
			chain: fantom,
			transport: http('https://rpc3.fantom.network')
		});
	}
	if (chainID === 1101) {
		return createPublicClient({
			chain: polygonZkEvm,
			transport: http('https://zkevm-rpc.com')
		});
	}
	if (chainID === 42161) {
		return createPublicClient({
			chain: arbitrum,
			transport: http(`https://arbitrum-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`)
		});
	}
	return createPublicClient({
		chain: mainnet,
		transport: http(`https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`)
	});
}
