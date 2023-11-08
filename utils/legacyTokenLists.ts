const LEGACY_TOKEN_LISTS = [
	{
		name: 'Aave',
		URI: 'https://tokenlist.aave.eth.link',
		logoURI: 'https://ipfs.io/ipfs/QmWzL3TSmkMhbqGBEwyeFyWVvLmEo3F44HBMFnmTUiTfp1',
		timestamp: '2020-12-11T17:08:18.941Z'
	},
	// {
	// 	name: 'BA ERC20 SEC Action"',
	// 	uri: 'https://raw.githubusercontent.com/The-Blockchain-Association/sec-notice-list/master/ba-sec-list.json',
	// 	logoURI: 'https://ipfs.io/ipfs/QmXsbxYZrdZrgqDMv37BaNmwsoG79uCk4ic8iYB9Nqaw4J',
	// timestamp: '2',
	// },
	{
		name: 'CMC DeFi',
		URI: 'https://defi.cmc.eth.link',
		logoURI: 'https://ipfs.io/ipfs/QmQAGtNJ2rSGpnP6dh6PPKNSmZL8RTZXmgFwgTdy5Nz5mx',
		timestamp: '2020-11-16T12:00:15+00:00'
	},
	{
		name: 'CMC Stablecoin',
		URI: 'https://stablecoin.cmc.eth.link',
		logoURI: 'https://ipfs.io/ipfs/QmQAGtNJ2rSGpnP6dh6PPKNSmZL8RTZXmgFwgTdy5Nz5mx',
		timestamp: '2020-08-25T12:00:15+00:00'
	},
	{
		name: 'CMC200 ERC20',
		URI: 'https://erc20.cmc.eth.link',
		logoURI: 'https://ipfs.io/ipfs/QmQAGtNJ2rSGpnP6dh6PPKNSmZL8RTZXmgFwgTdy5Nz5mx',
		timestamp: '2020-08-25T12:00:15+00:00'
	},
	{
		name: 'Compound',
		URI: 'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json',
		logoURI: 'https://raw.githubusercontent.com/compound-finance/token-list/master/assets/compound-interface.svg',
		timestamp: '2021-05-27T20:37:00.000+00:00'
	},
	// {
	// 	name: 'Defiprime',
	// 	uri: 'https://defiprime.com/defiprime.tokenlist.json',
	// 	logoURI: 'https://defiprime.com/images/defiprime-logo-hires2.png',
	// timestamp: '2',
	// },
	{
		name: 'Dharma Token List',
		URI: 'https://tokenlist.dharma.eth.link',
		logoURI: 'https://ipfs.io/ipfs/QmVSnomsK2wLaFpgDMrLQgvhJ66YR4jrcvW5HjDEc8VVwA',
		timestamp: '2020-07-24T12:00:00+00:00'
	},
	{
		name: 'Furucombo',
		URI: 'https://cdn.furucombo.app/furucombo.tokenlist.json',
		logoURI: 'https://cdn.furucombo.app/assets/img/logo/logo-rounded-square.svg',
		timestamp: '2021-10-22T06:22:04.000+00:00'
	},
	{
		name: 'Gemini Token List',
		URI: 'https://www.gemini.com/uniswap/manifest.json',
		logoURI: 'https://gemini.com/static/images/loader.png',
		timestamp: '2022-06-22T14:15:22+0000'
	},
	{
		name: 'Kleros T2CR',
		URI: 'https://t2crtokens.eth.link',
		logoURI: 'https://ipfs.io/ipfs/QmRYXpD8X4sQZwA1E4SJvEjVZpEK1WtSrTqzTWvGpZVDwa',
		timestamp: '2022-12-07T17:06:16.099Z'
	},
	{
		name: 'Messari Verified',
		URI: 'https://messari.io/tokenlist/messari-verified',
		logoURI: 'https://messari.io/images/logo_tcr-check.svg',
		timestamp: '2020-08-30T00:00:00+00:00'
	},
	{
		name: 'MyCrypto',
		URI: 'https://uniswap.mycryptoapi.com/',
		logoURI: 'https://raw.githubusercontent.com/MyCryptoHQ/MyCrypto/master/src/assets/images/favicon.png',
		timestamp: '2021-05-25T12:50:27-07:00'
	},
	{
		name: 'Roll Social Money',
		URI: 'https://app.tryroll.com/tokens.json',
		logoURI: 'https://tryroll.com/wp-content/uploads/2018/11/cropped-icon-270x270.png',
		timestamp: '2022-09-26T23:19:38.897566015Z'
	},
	{
		name: 'Set Protocol',
		URI: 'https://raw.githubusercontent.com/SetProtocol/uniswap-tokenlist/main/set.tokenlist.json',
		logoURI: 'https://raw.githubusercontent.com/SetProtocol/uniswap-tokenlist/main/assets/set-logo.svg',
		timestamp: '2020-10-19T12:32:17.000+00:00'
	},
	{
		name: 'Synthetix',
		URI: 'https://synths.snx.eth.link',
		logoURI: 'https://raw.githubusercontent.com/Synthetixio/synthetix-assets/v2.0.12/snx/SNX.svg',
		timestamp: '2021-12-16T23:01:51.032Z'
	},
	{
		name: 'TokenDao',
		URI: 'https://list.tkn.eth.link',
		logoURI: 'https://logo.assets.tkn.eth.limo/',
		timestamp: '2022-04-11T21:00:07.420Z'
	},
	{
		name: 'UMA',
		URI: 'https://umaproject.org/uma.tokenlist.json',
		logoURI:
			'https://www.gitbook.com/cdn-cgi/image/width=256,height=40,fit=contain,dpr=1,format=auto/https%3A%2F%2F1381247954-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FKdaoNjf9AzgWFNHyPo5b%252Flogo%252FmLXfeMg8Rtcxyzp20uhg%252FUMA_square_red_logo.png%3Falt%3Dmedia%26token%3Dc9574716-4c7a-4647-8bde-9b54866a0b46',
		timestamp: '2020-11-23T01:40:34.305Z'
	},
	{
		name: 'Wrapped Tokens',
		URI: 'https://wrapped.tokensoft.eth.link',
		logoURI: 'https://cloudflare-ipfs.com/ipfs/QmUJQF5rDNQn37ToqCynz6iecGqAmeKHDQCigJWpUwuVLN',
		timestamp: '2021-07-06T18:18:00+00:00'
	},
	{
		name: 'Zerion',
		URI: 'https://tokenlist.zerion.eth.link',
		logoURI: 'https://s3.amazonaws.com/cdn.zerion.io/images/zerion_logo.png',
		timestamp: '2021-04-05T14:41:25.499000+00:00'
	}
];

export default LEGACY_TOKEN_LISTS;
