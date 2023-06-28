import {createPublicClient, http} from 'viem';
import {arbitrum, fantom, localhost, polygonZkEvm} from 'viem/chains';

import type {PublicClient} from 'wagmi';

export function getClient(chainID: number): PublicClient {
	if (chainID === 1337) {
		return createPublicClient({
			chain: localhost,
			transport: http('http://localhost:8545')
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
	return createPublicClient({
		chain: arbitrum,
		transport: http(`https://arbitrum-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`)
	});
}
