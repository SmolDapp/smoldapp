const TOKEN_LISTS = [
	{
		name: 'CoinGecko',
		uri: 'https://tokens.coingecko.com/uniswap/all.json',
		imageSrc:
			'https://www.coingecko.com/assets/thumbnail-007177f3eca19695592f0b8b0eabbdae282b54154e1be912285c9034ea6cbaf2.png'
	},
	{
		name: 'Yearn',
		uri: 'https://ydaemon.yearn.fi/tokenlist',
		imageSrc:
			'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/multichain-tokens/1/0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e/logo.svg'
	},
	{
		name: 'Zerion',
		uri: 'https://tokenlist.zerion.eth.link',
		imageSrc: 'https://s3.amazonaws.com/cdn.zerion.io/images/zerion_logo.png'
	},
	{
		name: '1inch',
		uri: 'https://tokens.1inch.eth.link',
		imageSrc: 'https://1inch.exchange/assets/images/logo.png'
	},
	{
		name: 'Aave',
		uri: 'https://tokenlist.aave.eth.link',
		imageSrc: 'https://ipfs.io/ipfs/QmWzL3TSmkMhbqGBEwyeFyWVvLmEo3F44HBMFnmTUiTfp1'
	},
	{
		name: 'Agora dataFi Tokens',
		uri: 'https://datafi.theagora.eth.link',
		imageSrc: 'https://hut34.io/dataFiLogos/theAgoraLogoGradient300.png'
	},
	{
		name: 'CMC DeFi',
		uri: 'https://defi.cmc.eth.link',
		imageSrc: 'https://ipfs.io/ipfs/QmQAGtNJ2rSGpnP6dh6PPKNSmZL8RTZXmgFwgTdy5Nz5mx'
	},
	{
		name: 'CMC Stablecoin',
		uri: 'https://stablecoin.cmc.eth.link',
		imageSrc: 'https://ipfs.io/ipfs/QmQAGtNJ2rSGpnP6dh6PPKNSmZL8RTZXmgFwgTdy5Nz5mx'
	},
	{
		name: 'CMC200 ERC20',
		uri: 'https://erc20.cmc.eth.link',
		imageSrc: 'https://ipfs.io/ipfs/QmQAGtNJ2rSGpnP6dh6PPKNSmZL8RTZXmgFwgTdy5Nz5mx'
	},
	{
		name: 'CompliFi Originals',
		uri: 'https://compli.fi/complifi.tokenlist.json',
		imageSrc: 'https://ipfs.io/ipfs/QmRfLtruB4vrPbuCiKPU3J6Xq62FxLmNjaNmsHeH3AMfPX'
	},
	{
		name: 'Compound',
		uri: 'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json',
		imageSrc: 'https://raw.githubusercontent.com/compound-finance/token-list/master/assets/compound-interface.svg'
	},
	{
		name: 'Defiprime',
		uri: 'https://defiprime.com/defiprime.tokenlist.json',
		imageSrc: 'https://defiprime.com/images/defiprime-logo-hires2.png'
	},
	{
		name: 'Dharma Token List',
		uri: 'https://tokenlist.dharma.eth.link',
		imageSrc: 'https://ipfs.io/ipfs/QmVSnomsK2wLaFpgDMrLQgvhJ66YR4jrcvW5HjDEc8VVwA'
	},
	{
		name: 'Furucombo',
		uri: 'https://cdn.furucombo.app/furucombo.tokenlist.json',
		imageSrc: 'https://cdn.furucombo.app/assets/img/logo/logo-rounded-square.svg'
	},
	{
		name: 'Gemini Token List',
		uri: 'https://www.gemini.com/uniswap/manifest.json',
		imageSrc: 'https://gemini.com/static/images/loader.png'
	},
	{
		name: 'Kleros T2CR',
		uri: 'https://t2crtokens.eth.link',
		imageSrc: 'https://ipfs.io/ipfs/QmRYXpD8X4sQZwA1E4SJvEjVZpEK1WtSrTqzTWvGpZVDwa'
	},
	{
		name: 'Messari Verified',
		uri: 'https://messari.io/tokenlist/messari-verified',
		imageSrc: 'https://messari.io/images/logo_tcr-check.svg'
	},
	{
		name: 'MyCrypto',
		uri: 'https://uniswap.mycryptoapi.com/',
		imageSrc: 'https://raw.githubusercontent.com/MyCryptoHQ/MyCrypto/master/src/assets/images/favicon.png'
	},
	{
		name: 'Optimism',
		uri: 'https://static.optimism.io/optimism.tokenlist.json',
		imageSrc: 'https://ethereum-optimism.github.io/optimism.svg'
	},
	{
		name: 'Roll Social Money',
		uri: 'https://app.tryroll.com/tokens.json',
		imageSrc: 'https://tryroll.com/wp-content/uploads/2018/11/cropped-icon-270x270.png'
	},
	{
		name: 'Set Protocol',
		uri: 'https://raw.githubusercontent.com/SetProtocol/uniswap-tokenlist/main/set.tokenlist.json',
		imageSrc: 'https://raw.githubusercontent.com/SetProtocol/uniswap-tokenlist/main/assets/set-logo.svg'
	},
	{
		name: 'Synthetix',
		uri: 'https://synths.snx.eth.link',
		imageSrc: 'https://raw.githubusercontent.com/Synthetixio/synthetix-assets/v2.0.12/snx/SNX.svg'
	},
	{
		name: 'Testnet Tokens',
		uri: 'https://testnet.tokenlist.eth.link',
		imageSrc: 'https://ipfs.io/ipfs/QmaypvtnoXGQo4gSGHjgXaMUY98hf2FotQRfXgdLL4jo4i'
	},
	{
		name: 'TokenDao',
		uri: 'https://list.tkn.eth.link',
		imageSrc: 'https://logo.assets.tkn.eth.limo/'
	},
	{
		name: 'Uniswap Default List',
		uri: 'https://gateway.ipfs.io/ipns/tokens.uniswap.org',
		imageSrc: 'https://ipfs.io/ipfs/QmNa8mQkrNKp1WEEeGjFezDmDeodkWRevGFN8JCV7b4Xir'
	},
	{
		name: 'Uniswap Token Pairs',
		uri: 'https://raw.githubusercontent.com/jab416171/uniswap-pairtokens/master/uniswap_pair_tokens.json',
		imageSrc: 'https://ipfs.io/ipfs/QmNa8mQkrNKp1WEEeGjFezDmDeodkWRevGFN8JCV7b4Xir'
	},
	{
		name: 'UMA',
		uri: 'https://umaproject.org/uma.tokenlist.json',
		imageSrc: 'https://umaproject.org/assets/images/UMA_square_red_logo_circle.png'
	},
	{
		name: 'Wrapped Tokens',
		uri: 'https://wrapped.tokensoft.eth.link',
		imageSrc: 'https://cloudflare-ipfs.com/ipfs/QmUJQF5rDNQn37ToqCynz6iecGqAmeKHDQCigJWpUwuVLN'
	}
];

export default TOKEN_LISTS;
