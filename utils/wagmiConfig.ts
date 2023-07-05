import {arbitrum, fantom, gnosis} from 'viem/chains';
import {configureChains, createConfig, mainnet} from 'wagmi';
import {CoinbaseWalletConnector} from 'wagmi/connectors/coinbaseWallet';
import {InjectedConnector} from 'wagmi/connectors/injected';
import {LedgerConnector} from 'wagmi/connectors/ledger';
import {MetaMaskConnector} from 'wagmi/connectors/metaMask';
import {SafeConnector} from 'wagmi/connectors/safe';
import {WalletConnectConnector} from 'wagmi/connectors/walletConnect';
import {alchemyProvider} from 'wagmi/providers/alchemy';
import {infuraProvider} from 'wagmi/providers/infura';
import {publicProvider} from 'wagmi/providers/public';
import {IFrameEthereumConnector} from '@yearn-finance/web-lib/utils/web3/ledgerConnector';
import {getRPC} from '@yearn-finance/web-lib/utils/web3/providers';

import {localhost, optimism, polygon, polygonZkEvm} from './wagmiChains';


const {chains, publicClient, webSocketPublicClient} = configureChains(
	[mainnet, optimism, polygon, polygonZkEvm, gnosis, fantom, arbitrum, localhost],
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
		new MetaMaskConnector({chains}),
		new LedgerConnector({chains, options: {}}),
		new WalletConnectConnector({
			chains,
			options: {
				projectId: process.env.WALLETCONNECT_PROJECT_ID || ''
			}
		}),
		new CoinbaseWalletConnector({
			chains,
			options: {
				jsonRpcUrl: getRPC(1),
				appName: process.env.WEBSITE_TITLE as string
			}
		})
	]
});

export default config;
