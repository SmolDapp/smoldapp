import {arbitrum, fantom, gnosis, optimism, polygon} from 'viem/chains';
import {configureChains, createConfig, mainnet} from 'wagmi';
import {CoinbaseWalletConnector} from 'wagmi/connectors/coinbaseWallet';
import {InjectedConnector} from 'wagmi/connectors/injected';
import {LedgerConnector} from 'wagmi/connectors/ledger';
import {MetaMaskConnector} from 'wagmi/connectors/metaMask';
import {SafeConnector} from 'wagmi/connectors/safe';
import {WalletConnectLegacyConnector} from 'wagmi/connectors/walletConnectLegacy';
import {alchemyProvider} from 'wagmi/providers/alchemy';
import {infuraProvider} from 'wagmi/providers/infura';
import {publicProvider} from 'wagmi/providers/public';
import {IFrameEthereumConnector} from '@yearn-finance/web-lib/utils/web3/ledgerConnector';
import {getRPC} from '@yearn-finance/web-lib/utils/web3/providers';

import type {Chain} from 'wagmi';

const localhost = {
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

const polygonOverride = {
	...polygon,
	rpcUrls: {
		default: {
			http: [
				...polygon.rpcUrls.default.http,
				'https://polygon.llamarpc.com',
				process.env.RPC_URL_POLYGON_TENDERLY || 'https://1rpc.io/matic'
			]
		},
		public: {
			http: [
				...polygon.rpcUrls.default.http,
				'https://polygon.llamarpc.com',
				process.env.RPC_URL_POLYGON_TENDERLY || 'https://1rpc.io/matic'
			]
		}
	}

};

const optimismOverride = {
	...optimism,
	rpcUrls: {
		default: {
			http: [
				...optimism.rpcUrls.default.http,
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
				...optimism.rpcUrls.default.http,
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

};

const {chains, publicClient, webSocketPublicClient} = configureChains(
	[mainnet, optimismOverride, polygonOverride, gnosis, fantom, arbitrum, localhost],
	[
		publicProvider(),
		alchemyProvider({apiKey: process.env.ALCHEMY_KEY || ''}),
		infuraProvider({apiKey: process.env.INFURA_PROJECT_ID || ''})
	]
);
const config = createConfig({
	autoConnect: true,
	publicClient,
	webSocketPublicClient,
	connectors: [
		new SafeConnector({chains, options: {allowedDomains: [/gnosis-safe.io/, /app.safe.global/]}}),
		new IFrameEthereumConnector({chains, options: {}}),
		new InjectedConnector({chains}),
		new MetaMaskConnector(),
		new LedgerConnector({chains}),
		new WalletConnectLegacyConnector({options: {qrcode: true}}),
		new CoinbaseWalletConnector({
			options: {
				jsonRpcUrl: getRPC(1),
				appName: process.env.WEBSITE_TITLE as string
			}
		})
	]
});

export default config;
