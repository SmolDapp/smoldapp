import {optimism as wOptimism, polygon as wPolygon} from 'viem/chains';

import type {Chain} from 'wagmi';

export const localhost = {
	id: 1_337,
	name: 'Localhost',
	network: 'localhost',
	nativeCurrency: {
		decimals: 18,
		name: 'Ether',
		symbol: 'ETH'
	},
	rpcUrls: {
		default: {http: ['http://0.0.0.0:8545', 'http://127.0.0.1:8545', 'http://localhost:8545']},
		public: {http: ['http://0.0.0.0:8545', 'http://127.0.0.1:8545', 'http://localhost:8545']}
	},
	contracts: {
		ensRegistry: {
			address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
		},
		ensUniversalResolver: {
			address: '0xE4Acdd618deED4e6d2f03b9bf62dc6118FC9A4da',
			blockCreated: 16773775
		},
		multicall3: {
			address: '0xca11bde05977b3631167028862be2a173976ca11',
			blockCreated: 14353601
		}
	}
} as const satisfies Chain;

export const polygon = {
	...wPolygon,
	rpcUrls: {
		default: {
			http: [
				...wPolygon.rpcUrls.default.http,
				'https://polygon.llamarpc.com',
				`https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
				process.env.RPC_URL_POLYGON_TENDERLY || 'https://1rpc.io/matic'
			]
		},
		public: {
			http: [
				...wPolygon.rpcUrls.default.http,
				'https://polygon.llamarpc.com',
				`https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
				process.env.RPC_URL_POLYGON_TENDERLY || 'https://1rpc.io/matic'
			]
		}
	}

} as const satisfies Chain;

export const optimism = {
	...wOptimism,
	rpcUrls: {
		default: {
			http: [
				...wOptimism.rpcUrls.default.http,
				'https://opt-mainnet.g.alchemy.com/v2/demo',
				'https://endpoints.omniatech.io/v1/op/mainnet/public',
				'https://optimism-mainnet.public.blastapi.io',
				'https://optimism.blockpi.network/v1/rpc/public',
				'https://rpc.ankr.com/optimism',
				'https://1rpc.io/op',
				'https://optimism.api.onfinality.io/public',
				'https://rpc.optimism.gateway.fm'

			]
		},
		public: {
			http: [
				...wOptimism.rpcUrls.default.http,
				'https://opt-mainnet.g.alchemy.com/v2/demo',
				'https://endpoints.omniatech.io/v1/op/mainnet/public',
				'https://optimism-mainnet.public.blastapi.io',
				'https://optimism.blockpi.network/v1/rpc/public',
				'https://rpc.ankr.com/optimism',
				'https://1rpc.io/op',
				'https://optimism.api.onfinality.io/public',
				'https://rpc.optimism.gateway.fm'
			]
		}
	}

} as const satisfies Chain;

export const polygonZkEvm = {
	id: 1101,
	name: 'Polygon zkEVM',
	network: 'polygon-zkevm',
	nativeCurrency: {name: 'Ether', symbol: 'ETH', decimals: 18},
	rpcUrls: {
		default: {
			http: ['https://zkevm-rpc.com']
		},
		public: {
			http: ['https://zkevm-rpc.com']
		}
	},
	blockExplorers: {
		default: {
			name: 'PolygonScan',
			url: 'https://zkevm.polygonscan.com'
		}
	},
	contracts: {
		multicall3: {
			address: '0xca11bde05977b3631167028862be2a173976ca11',
			blockCreated: 57746
		}
	}
} as const satisfies Chain;
