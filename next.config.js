/* eslint-disable @typescript-eslint/explicit-function-return-type */
const withPWA = require('next-pwa')({
	dest: 'public',
	disable: process.env.NODE_ENV !== 'production'
});
const {PHASE_EXPORT} = require('next/constants');

module.exports = (phase) => withPWA({
	assetPrefix: process.env.IPFS_BUILD === 'true' || phase === PHASE_EXPORT ? './' : '/',
	images: {
		unoptimized: process.env.IPFS_BUILD === 'true' || phase === PHASE_EXPORT, //Exporting image does not support optimization
		domains: [
			'rawcdn.githack.com',
			'raw.githubusercontent.com'
		]
	},
	redirects() {
		return [
			{
				source: '/discord',
				destination: 'https://discord.gg/Cp4evJnk92',
				permanent: true
			},
			{
				source: '/github',
				destination: 'https://github.com/DocuDroid',
				permanent: true
			},
			{
				source: '/telegram',
				destination: 'https://t.me/docudroid',
				permanent: true
			},
			{
				source: '/twitter',
				destination: 'https://twitter.com/DocuDroid',
				permanent: true
			}
		];
	},
	env: {
		JSON_RPC_URL: {
			1: process.env.RPC_URL_MAINNET,
			10: process.env.RPC_URL_OPTIMISM,
			250: 'https://rpc3.fantom.network' || process.env.RPC_URL_FANTOM,
			42161: process.env.RPC_URL_ARBITRUM
		},
		OPEN_AI_MASTER_KEY: process.env.OPEN_AI_MASTER_KEY,
		CLAIM_CONTRACT: '0xcD2E436871a3F4984fb8B963AAbb118Ab2646878',
		FTM_USDC_ADDRESS: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75',
		BASE_ENDPOINT: 'https://api.ycorpo.com/',
		// BASE_ENDPOINT: 'http://localhost:8080/',
		PROMPT_ENDPOINT: 'https://api.ycorpo.com/prompt'
		// PROMPT_ENDPOINT: 'http://localhost:8080/prompt'
	}
});
