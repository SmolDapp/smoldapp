import {arbitrum, base, mainnet, optimism, polygon, polygonZkEvm} from 'viem/chains';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {indexedWagmiChains} from '@yearn-finance/web-lib/utils/wagmi/utils';

import {gnosis} from './chains';

import type {TAddress, TNDict} from '@yearn-finance/web-lib/types';
import type {TChainContract, TExtendedChain} from '@yearn-finance/web-lib/utils/wagmi/utils';

export const MATIC_TOKEN_ADDRESS = toAddress('0x0000000000000000000000000000000000001010');
export const POLYGON_LENS_ADDRESS = toAddress('0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d');
export const ETHEREUM_ENS_ADDRESS = toAddress('0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85');

export const HEADER_HEIGHT = 64;

export const SUPPORTED_CHAINS = [
	mainnet,
	optimism,
	gnosis,
	polygon,
	// fantom,
	polygonZkEvm,
	base,
	arbitrum
	// localhost
];

export const SUPPORTED_CHAIN_IDS: TNDict<string> = {
	1: 'Ethereum',
	10: 'Optimism',
	56: 'Binance Smart Chain',
	100: 'Gnosis',
	137: 'Polygon',
	250: 'Fantom',
	1101: 'Polygon ZKEVM',
	8453: 'Base',
	42161: 'Arbitrum',
	43114: 'Avalanche'
};

export const NFTMIGRATOOOR_CONTRACT_PER_CHAIN: TNDict<TAddress> = {
	1: toAddress('0x100CCFF9117E168158a6BE35081694fBbe394fBB'),
	10: toAddress('0x6dfd3a052bb73e609d9c2381dc48de5e2662575e'),
	100: toAddress('0xC813978A4c104250B1d2bC198cC7bE74b68Cd81b'),
	137: toAddress('0x0e5b46E4b2a05fd53F5a4cD974eb98a9a613bcb7'),
	250: toAddress('0x291F9794fFB8Cd1F71CE5478E40b5E29a029dbE9'),
	1101: toAddress('0xA3a3C48F1d5191968D3dEF7A5aE4c860589Bf380'),
	8453: toAddress('0x101CBC599d01e90D21fc925c8222248863e3b6eA'),
	42161: toAddress('0x7E08735690028cdF3D81e7165493F1C34065AbA2')
};

const SAFE_API_URI: {[chainId: number]: string} = {
	1: 'https://safe-transaction-mainnet.safe.global',
	10:	'https://safe-transaction-optimism.safe.global',
	100: 'https://safe-transaction-gnosis-chain.safe.global',
	137: 'https://safe-transaction-polygon.safe.global',
	8453: 'https://safe-transaction-base.safe.global',
	42161: 'https://safe-transaction-arbitrum.safe.global'
};

export const coingeckoGasCoinIDs: TNDict<string> = {
	1: 'ethereum',
	10: 'ethereum',
	100: 'xdai',
	137: 'matic-network',
	250: 'fantom',
	8453: 'ethereum',
	42161: 'ethereum'
};

export type TAppExtendedChain = TExtendedChain & {
	safeApiUri?: string
	coingeckoGasCoinID: string
	contracts: {
		nftMigratooorContract?: TChainContract
	}
}
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
	extendedChain.coingeckoGasCoinID = coingeckoGasCoinIDs?.[chain.id] || 'ethereum';
}

