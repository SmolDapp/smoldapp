/* eslint-disable @typescript-eslint/explicit-function-return-type */
const withPWA = require('next-pwa')({
	dest: 'public',
	disable: process.env.NODE_ENV !== 'production'
});
const withTM = require('next-transpile-modules')(['@yearn-finance/web-lib'], {resolveSymlinks: false});
const {PHASE_EXPORT} = require('next/constants');

module.exports = (phase) => withTM(withPWA({
	assetPrefix: process.env.IPFS_BUILD === 'true' || phase === PHASE_EXPORT ? './' : '/',
	images: {
		unoptimized: process.env.IPFS_BUILD === 'true' || phase === PHASE_EXPORT,
		domains: [
			'gib.to',
			'rawcdn.githack.com',
			'raw.githubusercontent.com',
			'ipfs.io',
			's3.amazonaws.com',
			'1inch.exchange',
			'hut34.io',
			'www.coingecko.com',
			'defiprime.com',
			'cdn.furucombo.app',
			'gemini.com',
			'messari.io',
			'ethereum-optimism.github.io',
			'tryroll.com',
			'logo.assets.tkn.eth.limo',
			'umaproject.org',
			'cloudflare-ipfs.com'
		]
	},
	redirects() {
		return [
			{
				source: '/github',
				destination: 'https://github.com/SmolDapp/smoldapp',
				permanent: true
			}
		];
	},
	rewrites: [
		{source: '/:path*', has: [{type: 'host', value: 'disperse.smold.app'}], destination: '/disperse/:path*'},
		{source: '/:path*', has: [{type: 'host', value: 'migrate.smold.app'}], destination: '/migratooor/:path*'}
	],
	env: {
		JSON_RPC_URL: {
			1: process.env.RPC_URL_MAINNET,
			10: process.env.RPC_URL_OPTIMISM,
			250: process.env.RPC_URL_FANTOM,
			42161: process.env.RPC_URL_ARBITRUM
		},
		RECEIVER_ADDRESS: '0x10001192576E8079f12d6695b0948C2F41320040',
		DISPERSE_ADDRESS: '0xD152f549545093347A162Dce210e7293f1452150',
		OPENSEA_API_KEY: process.env.OPENSEA_API_KEY
	}
}));

