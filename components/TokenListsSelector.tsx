import {useEffect, useRef, useState} from 'react';
import SmallButton from 'components/common/SmallButton';
import IconCheck from 'components/icons/IconCheck';
import {ImageWithFallback} from 'components/ImageWithFallback';
import {useWallet} from 'contexts/useWallet';
import axios from 'axios';
import {useThrottledCallback} from '@react-hookz/web';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';

import type {ReactElement} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/utils/address';
import type {TDict} from '@yearn-finance/web-lib/utils/types';

const	tokenLists = [
	{
		name: 'Zerion',
		uri: 'https://tokenlist.zerion.eth.link',
		imageSrc: 'https://s3.amazonaws.com/cdn.zerion.io/images/zerion_logo.png'
	},
	{
		name: 'Yearn',
		uri: 'https://ydaemon.yearn.finance/tokenlist',
		imageSrc: 'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/multichain-tokens/1/0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e/logo.svg'
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
		name: 'CoinGecko',
		uri: 'https://tokens.coingecko.com/uniswap/all.json',
		imageSrc: 'https://www.coingecko.com/assets/thumbnail-007177f3eca19695592f0b8b0eabbdae282b54154e1be912285c9034ea6cbaf2.png'
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


type TTokenList = {
	name: string;
	tokens: TTokenInfo[];
}

type TTokenInfo = {
	'chainId': number,
	'address': TAddress,
	'name': string,
	'symbol': string,
	'decimals': number,
	'tags': []
};

function TokenListsSelector(): ReactElement {
	const {refreshWithList} = useWallet();
	const [isRefreshing, set_isRefreshing] = useState<TDict<boolean>>({});
	const tokenListRef = useRef<TDict<TTokenList>>({});
	const tokenListFetchedRef = useRef<TDict<boolean>>({});
	const tokenListTokensRef = useRef<TDict<TTokenInfo>>({});
	const [selected, set_selected] = useState([tokenLists[0], tokenLists[1]]);

	const	fetchTokenListData = useThrottledCallback(async (): Promise<void> =>{
		const	calls = [];
		//Fetch only the one missings
		for (const eachList of selected) {
			if (!tokenListFetchedRef.current[eachList.name]) {
				calls.push(axios(eachList.uri));
			}
		}
		const	results = await axios.all(calls);
		let		resultIndex = 0;

		for (const iterator of results) {
			console.log(iterator.data.logoURI);
		}

		//Save them in a ref so we can use them later, excluding the ones we already have
		for (const eachList of selected) {
			if (!tokenListFetchedRef.current[eachList.name]) {
				tokenListFetchedRef.current[eachList.name] = true;
				tokenListRef.current[eachList.name] = results[resultIndex].data;
				resultIndex++;
			}
		}

		//Update tokenListTokensRef with the tokens in the selected list only
		tokenListTokensRef.current = {};
		for (const eachList of selected) {
			for (const eachToken of tokenListRef.current[eachList.name].tokens) {
				tokenListTokensRef.current[toAddress(eachToken.address)] = eachToken;
			}

		}
	}, [selected], 100, false);

	useEffect((): void => {
		fetchTokenListData();
	}, [fetchTokenListData]);


	return (
		<div className={'grid gap-4'}>
			{tokenLists.map((list, listIdx): ReactElement => (
				<div key={listIdx}>
					<div className={'yearn--table-token-section-item w-full'}>
						<div className={'yearn--table-token-section-item-image'}>
							<ImageWithFallback
								alt={''}
								width={40}
								height={40}
								quality={90}
								src={list.imageSrc}
								loading={'eager'} />
						</div>
						<div className={'grow'}>
							<div className={'flex w-full flex-row items-center justify-between'}>
								<b>{list.name}</b>
								{selected.find((selectedList): boolean => selectedList.name === list.name) ? (
									<div className={'flex h-6 items-center justify-end p-2 text-xs'}>
										<IconCheck
											className={'h-4 w-4 text-[#16a34a]'} />
									</div>
								) : (
									<SmallButton
										onClick={async (): Promise<void> => {
											set_isRefreshing((s): TDict<boolean> => ({...s, [list.name]: true}));
											await refreshWithList(tokenListTokensRef.current);
											performBatchedUpdates((): void => {
												set_selected((s): any => [...s, list]);
												set_isRefreshing((s): TDict<boolean> => ({...s, [list.name]: false}));
											});
										}}
										isBusy={isRefreshing[list.name]}
										className={'h-6 p-2 text-xs'}>
										{'Load'}
									</SmallButton>
								)}
							</div>
							<div className={'w-full max-w-[240px] truncate md:max-w-xs'}>
								<a
									href={list.uri}
									target={'_blank'}
									rel={'noopener noreferrer'}
									className={'cursor-pointer font-mono text-xs text-neutral-500 transition-colors hover:text-neutral-900'}>
									{list.uri}
								</a>
							</div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

export default TokenListsSelector;
