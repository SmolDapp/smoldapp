import {Fragment, useEffect, useRef, useState} from 'react';
import {useSelected} from 'contexts/useSelected';
import {useWallet} from 'contexts/useWallet';
import axios from 'axios';
import {Listbox, Transition} from '@headlessui/react';
import {useThrottledCallback} from '@react-hookz/web';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {toAddress} from '@yearn-finance/web-lib/utils/address';

import IconCheck from './icons/IconCheck';
import IconChevronPlain from './icons/IconChevronPlain';

import type {ReactElement} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/utils/address';
import type {TDict} from '@yearn-finance/web-lib/utils/types';

const	tokenLists = [
	{
		name: 'Zerion',
		uri: 'https://tokenlist.zerion.eth.link'
	},
	{
		name: '1inch',
		uri: 'https://tokens.1inch.eth.link'
	},
	{
		name: 'Aave',
		uri: 'https://tokenlist.aave.eth.link'
	},
	{
		name: 'Agora dataFi Tokens',
		uri: 'https://datafi.theagora.eth.link'
	},
	{
		name: 'CMC DeFi',
		uri: 'https://defi.cmc.eth.link'
	},
	{
		name: 'CMC Stablecoin',
		uri: 'https://stablecoin.cmc.eth.link'
	},
	{
		name: 'CMC200 ERC20',
		uri: 'https://erc20.cmc.eth.link'
	},
	{
		name: 'CompliFi Originals',
		uri: 'https://compli.fi/complifi.tokenlist.json'
	},
	{
		name: 'CoinGecko',
		uri: 'https://tokens.coingecko.com/uniswap/all.json'
	},
	{
		name: 'Compound',
		uri: 'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json'
	},
	{
		name: 'Defiprime',
		uri: 'https://defiprime.com/defiprime.tokenlist.json'
	},
	{
		name: 'Dharma Token List',
		uri: 'https://tokenlist.dharma.eth.link'
	},
	{
		name: 'Furucombo',
		uri: 'https://cdn.furucombo.app/furucombo.tokenlist.json'
	},
	{
		name: 'Gemini Token List',
		uri: 'https://www.gemini.com/uniswap/manifest.json'
	},
	{
		name: 'Kleros T2CR',
		uri: 'https://t2crtokens.eth.link'
	},
	{
		name: 'Messari Verified',
		uri: 'https://messari.io/tokenlist/messari-verified'
	},
	{
		name: 'MyCrypto',
		uri: 'https://uniswap.mycryptoapi.com/'
	},
	{
		name: 'Optimism',
		uri: 'https://static.optimism.io/optimism.tokenlist.json'
	},
	{
		name: 'Roll Social Money',
		uri: 'https://app.tryroll.com/tokens.json'
	},
	{
		name: 'Set Protocol',
		uri: 'https://raw.githubusercontent.com/SetProtocol/uniswap-tokenlist/main/set.tokenlist.json'
	},
	{
		name: 'Synthetix',
		uri: 'https://synths.snx.eth.link'
	},
	{
		name: 'Testnet Tokens',
		uri: 'https://testnet.tokenlist.eth.link'
	},
	{
		name: 'TokenDao',
		uri: 'https://list.tkn.eth.link'
	},
	{
		name: 'Uniswap Default List',
		uri: 'https://gateway.ipfs.io/ipns/tokens.uniswap.org'
	},
	{
		name: 'Uniswap Token Pairs',
		uri: 'https://raw.githubusercontent.com/jab416171/uniswap-pairtokens/master/uniswap_pair_tokens.json'
	},
	{
		name: 'UMA',
		uri: 'https://umaproject.org/uma.tokenlist.json'
	},
	{
		name: 'Wrapped Tokens',
		uri: 'https://wrapped.tokensoft.eth.link'
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

function TokenListsBox(): ReactElement {
	const {set_tokenList} = useSelected();
	const {isLoading} = useWallet();
	const tokenListRef = useRef<TDict<TTokenList>>({});
	const tokenListFetchedRef = useRef<TDict<boolean>>({});
	const tokenListTokensRef = useRef<TDict<TTokenInfo>>({});
	const [selected, set_selected] = useState([tokenLists[0]]);

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
	}, [selected], 1000, false);

	useEffect((): void => {
		fetchTokenListData();
	}, [fetchTokenListData]);


	return (
		<Listbox
			multiple
			value={selected}
			onChange={(value): void => set_selected(value)}>
			<div className={'relative'}>
				<div className={'grid w-full grid-cols-12 flex-row items-center justify-between gap-4 md:w-3/4 md:gap-6'}>
					<div className={'col-span-12 md:col-span-9'}>
						<Listbox.Button className={'box-100 relative w-full cursor-pointer rounded-sm py-2 pl-2 pr-10 text-left text-sm'}>
							<span className={'block truncate'}>
								{selected.map((each): string => each.name).join(', ')}&nbsp;
							</span>
							<span className={'pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'}>
								<IconChevronPlain
									className={'h-4 w-4 text-neutral-400'}
									aria-hidden={'true'}
								/>
							</span>
						</Listbox.Button>
					</div>
					<div className={'col-span-12 md:col-span-3'}>
						<Button
							onClick={(): void => set_tokenList(tokenListTokensRef.current)}
							className={'yearn--button !w-[160px] rounded-md !text-sm'}
							isBusy={isLoading}>
							{'Confirm'}
						</Button>
					</div>
				</div>
				<Transition
					as={Fragment}
					leave={'transition ease-in duration-100'}
					leaveFrom={'opacity-100'}
					leaveTo={'opacity-0'}>
					<div className={'absolute z-50 -mt-12 grid w-full grid-cols-12 gap-4 md:mt-1 md:w-3/4 md:gap-6'}>
						<Listbox.Options className={'box-0 col-span-12 max-h-60 w-full overflow-auto rounded-sm md:col-span-9'}>
							{tokenLists.map((list, listIdx): ReactElement => (
								<Listbox.Option
									key={listIdx}
									className={({active: isActive, selected: isSelected}): string =>`relative cursor-default select-none py-2 pl-8 pr-4 ${isActive || isSelected ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-900'}`}
									value={list}>
									<>
										<span className={`block truncate text-sm ${selected ? 'font-medium' : 'font-normal'}`}>
											{list.name}
										</span>
										{selected.find((selectedList): boolean => selectedList.name === list.name) ? (
											<span className={'absolute inset-y-0 left-0 flex items-center pl-2 text-neutral-900'}>
												<IconCheck className={'h-3 w-3'} aria-hidden={'true'} />
											</span>
										) : null}
									</>
								</Listbox.Option>
							))}
						</Listbox.Options>
					</div>
				</Transition>
			</div>
		</Listbox>
	);
}

export default TokenListsBox;
