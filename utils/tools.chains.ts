import {
	arbitrum,
	base,
	baseGoerli,
	bsc,
	fantom,
	gnosis,
	goerli,
	mainnet,
	optimism,
	polygon,
	polygonZkEvm,
	zkSync
} from 'wagmi/chains';
import {indexedWagmiChains} from '@yearn-finance/web-lib/utils/wagmi/utils';

import {COINGECKO_GAS_COIN_IDS, NFTMIGRATOOOR_CONTRACT_PER_CHAIN, SAFE_API_URI} from './constants';

import type {TChainContract, TExtendedChain} from '@yearn-finance/web-lib/utils/wagmi/utils';

export const supportedNetworks = [
	mainnet,
	{...optimism, name: 'Optimism'},
	bsc,
	gnosis,
	polygon,
	polygonZkEvm,
	fantom,
	zkSync,
	base,
	arbitrum
];
export const supportedTestNetworks = [goerli, baseGoerli];

export type TAppExtendedChain = TExtendedChain & {
	safeApiUri?: string;
	coingeckoGasCoinID: string;
	contracts: {
		nftMigratooorContract?: TChainContract;
	};
};
for (const chain of Object.values(indexedWagmiChains)) {
	if (!chain || typeof chain !== 'object' || !chain.id) {
		continue;
	}
	const extendedChain = chain as TAppExtendedChain;
	extendedChain.contracts = {
		...chain.contracts,
		nftMigratooorContract: {
			address: NFTMIGRATOOOR_CONTRACT_PER_CHAIN[chain.id],
			blockCreated: 0 //not important
		}
	};
	extendedChain.safeApiUri = SAFE_API_URI?.[chain.id] || '';
	extendedChain.coingeckoGasCoinID = COINGECKO_GAS_COIN_IDS?.[chain.id] || 'ethereum';
}