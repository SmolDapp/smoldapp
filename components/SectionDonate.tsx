import {useCallback, useState} from 'react';
import Link from 'next/link';
import {useTokenList} from 'contexts/useTokenList';
import {useWallet} from 'contexts/useWallet';
import {useAsyncTrigger} from 'hooks/useAsyncTrigger';
import axios from 'axios';
import LogoDisperse from '@disperse/Logo';
import {useDeepCompareEffect, useDeepCompareMemo, useUpdateEffect} from '@react-hookz/web';
import handleInputChangeEventValue from '@utils/handleInputChangeEventValue';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {isZeroAddress, toAddress} from '@yearn-finance/web-lib/utils/address';
import {ETH_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {type TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';
import {getNetwork} from '@yearn-finance/web-lib/utils/wagmi/utils';
import {defaultTxStatus} from '@yearn-finance/web-lib/utils/web3/transaction';
import AddressInput, {defaultInputAddressLike} from '@common/AddressInput';
import {RowCardWithIcon} from '@common/CardWithIcon';
import {MultipleTokenSelector} from '@common/TokenInput/TokenSelector';

import type {ChangeEvent, Dispatch, ReactElement, SetStateAction} from 'react';
import type {TAddress, TDict, TNDict} from '@yearn-finance/web-lib/types';
import type {TInputAddressLike} from '@common/AddressInput';
import type {TToken} from '@utils/types/types';

const GECKO_CHAIN_NAMES: TNDict<string> = {
	1: 'ethereum',
	10: 'optimistic-ethereum',
	56: 'binance-smart-chain',
	100: 'xdai',
	137: 'polygon-pos',
	250: 'fantom',
	42161: 'arbitrum-one'
};

const NATIVE_WRAPPER_COINS: TNDict<TAddress> = {
	1: toAddress('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'),
	10: toAddress('0x4200000000000000000000000000000000000006'),
	56: toAddress('0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'),
	100: toAddress('0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d'),
	137: toAddress('0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'),
	250: toAddress('0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83'),
	42161: toAddress('0x82aF49447D8a07e3bd95BD0d56f35241523fBab1')
};

function TokenToSend({
	tokenToSend,
	onChange
}: {
	tokenToSend: TToken | undefined;
	onChange: Dispatch<SetStateAction<TToken | undefined>>;
}): ReactElement {
	const {safeChainID} = useChainID();
	const [, set_isValidDestination] = useState<boolean | 'undetermined'>('undetermined');
	const {tokenList} = useTokenList();
	const [possibleTokens, set_possibleTokens] = useState<TDict<TToken>>({});
	const {getBalance} = useWallet();

	/* 🔵 - Yearn Finance **************************************************************************
	 ** On mount, fetch the token list from the tokenlistooor repo for the cowswap token list, which
	 ** will be used to populate the tokenToDisperse token combobox.
	 ** Only the tokens in that list will be displayed as possible destinations.
	 **********************************************************************************************/
	useDeepCompareEffect((): void => {
		const possibleDestinationsTokens: TDict<TToken> = {};
		const {wrappedToken} = getNetwork(safeChainID).contracts;
		if (wrappedToken) {
			possibleDestinationsTokens[ETH_TOKEN_ADDRESS] = {
				address: ETH_TOKEN_ADDRESS,
				chainID: safeChainID,
				name: wrappedToken.coinName,
				symbol: wrappedToken.coinSymbol,
				decimals: wrappedToken.decimals,
				logoURI: `${process.env.SMOL_ASSETS_URL}/token/${safeChainID}/${ETH_TOKEN_ADDRESS}/logo-32.png`
			};
		}
		for (const eachToken of Object.values(tokenList)) {
			if (eachToken.address === ETH_TOKEN_ADDRESS) {
				continue;
			}
			if (eachToken.chainID === safeChainID) {
				possibleDestinationsTokens[toAddress(eachToken.address)] = eachToken;
			}
		}
		set_possibleTokens(possibleDestinationsTokens);
	}, [tokenList, safeChainID]);

	const filteredBalances = useDeepCompareMemo((): TToken[] => {
		const withBalance = [];
		for (const dest of Object.values(possibleTokens)) {
			if (getBalance(dest.address).raw > 0n) {
				withBalance.push(dest);
			}
		}
		return withBalance;
	}, [possibleTokens, getBalance]);

	/* 🔵 - Yearn Finance **************************************************************************
	 ** When the destination token changes, check if it is a valid destination token. The check is
	 ** trivial as we only check if the address is valid.
	 **********************************************************************************************/
	useUpdateEffect((): void => {
		set_isValidDestination('undetermined');
		if (!isZeroAddress(toAddress(tokenToSend?.address))) {
			set_isValidDestination(true);
		}
	}, [tokenToSend]);

	return (
		<div className={'flex w-full'}>
			<MultipleTokenSelector
				token={tokenToSend}
				tokens={filteredBalances}
				onChangeToken={(newToken): void => onChange(newToken)}
			/>
		</div>
	);
}

function AmountToSend({
	token,
	amountToSend,
	onChange
}: {
	token: TToken | undefined;
	amountToSend: TNormalizedBN | undefined;
	onChange: Dispatch<SetStateAction<TNormalizedBN | undefined>>;
}): ReactElement {
	/**********************************************************************************************
	 ** onInputChange is triggered when the user is typing in the input field. It updates the
	 ** amount in the state and triggers the debounced retrieval of the quote from the Cowswap API.
	 ** It is set as callback to avoid unnecessary re-renders.
	 **********************************************************************************************/
	const onInputChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>): void => {
			onChange(handleInputChangeEventValue(e, token?.decimals || 18));
		},
		[onChange, token?.decimals]
	);

	return (
		<input
			key={token?.address}
			id={'amountToSend'}
			className={
				'h-auto w-full overflow-x-scroll border-none bg-transparent p-0 text-center text-5xl font-bold tabular-nums outline-none scrollbar-none'
			}
			type={'number'}
			min={0}
			step={1 / 10 ** (token?.decimals || 18)}
			inputMode={'numeric'}
			placeholder={'0'}
			pattern={'^((?:0|[1-9]+)(?:.(?:d+?[1-9]|[1-9]))?)$'}
			value={amountToSend?.normalized ?? '0'}
			onChange={onInputChange}
		/>
	);
}

function DonateBox(): ReactElement {
	const {address, isActive} = useWeb3();
	const {safeChainID} = useChainID();
	const {balances} = useWallet();
	const [txStatus] = useState(defaultTxStatus);
	const [price, set_price] = useState<TNDict<TDict<number>>>({});
	const [amountToSend, set_amountToSend] = useState<TNormalizedBN | undefined>();
	const [receiver, set_receiver] = useState<TInputAddressLike>(defaultInputAddressLike);
	const [tokenToSend, set_tokenToSend] = useState<TToken | undefined>();

	useUpdateEffect((): void => {
		if (safeChainID) {
			const network = getNetwork(safeChainID);
			set_tokenToSend({
				address: toAddress(ETH_TOKEN_ADDRESS),
				chainID: safeChainID,
				name: network.nativeCurrency.name || 'Ether',
				symbol: network.nativeCurrency.symbol || 'ETH',
				decimals: 18,
				logoURI: `https://assets.smold.app/api/token/1/${ETH_TOKEN_ADDRESS}/logo-128.png`
			});
		}
	}, [safeChainID]);

	const onDonate = useCallback(async (): Promise<void> => {}, []);

	const onComputeValueFromAmount = useCallback((amount: TNormalizedBN): void => {
		set_amountToSend(amount);
	}, []);

	useAsyncTrigger(async (): Promise<void> => {
		let tokenAddress = toAddress(tokenToSend?.address);
		if (isZeroAddress(tokenAddress)) {
			return;
		}

		if (tokenAddress === toAddress(ETH_TOKEN_ADDRESS)) {
			tokenAddress = NATIVE_WRAPPER_COINS[safeChainID];
		}

		const response = await axios.get(
			`https://api.coingecko.com/api/v3/simple/token_price/${
				GECKO_CHAIN_NAMES[safeChainID] || 'ethereum'
			}?contract_addresses=${tokenAddress}&vs_currencies=usd&precision=6`
		);
		set_price((prev): TNDict<TDict<number>> => {
			const newPrice = {...prev};
			if (!newPrice[safeChainID]) {
				newPrice[safeChainID] = {};
			}
			newPrice[safeChainID][tokenAddress] = Number(response?.data?.[tokenAddress.toLowerCase()]?.usd || 0);
			return newPrice;
		});
	}, [tokenToSend?.address, safeChainID]);

	return (
		<div className={'grid grid-cols-1 gap-6 md:grid-cols-3'}>
			<div className={'box-0 col-span-1 flex h-full flex-col p-4 pb-2 md:col-span-2'}>
				<div className={'font-number grid w-full gap-4 text-xs md:text-sm'}>
					<span className={'flex flex-col justify-between'}>
						<b className={'pb-2'}>{'Token:'}</b>
						<TokenToSend
							key={safeChainID}
							tokenToSend={tokenToSend}
							onChange={set_tokenToSend}
						/>
					</span>
					<span className={'flex flex-col justify-between'}>
						<b className={'pb-2'}>{'Receiver:'}</b>
						<AddressInput
							value={receiver}
							onChangeValue={set_receiver}
						/>
					</span>
				</div>
				<div className={'font-number mt-4 w-full text-xs md:text-sm'}>
					<span className={'flex flex-col justify-between'}>
						<b className={'pb-2'}>{'Amount:'}</b>
					</span>
					<div className={'flex h-full flex-col items-center justify-center pb-10 md:pb-20'}>
						<AmountToSend
							token={tokenToSend}
							amountToSend={amountToSend}
							onChange={(v): void => onComputeValueFromAmount(v as never)}
						/>
						<p
							className={'font-number text-center text-xs text-neutral-600'}
							suppressHydrationWarning>
							{tokenToSend
								? `${tokenToSend.symbol} ≈ $${formatAmount(
										Number(amountToSend?.normalized || 0) *
											Number(price?.[safeChainID]?.[toAddress(tokenToSend.address)] || 0),
										0,
										2
								  )}`
								: ''}{' '}
							&nbsp;
						</p>
					</div>
				</div>
				<div>
					<div className={'mt-2 flex flex-row'}>
						<Button
							className={'w-full'}
							isBusy={txStatus.pending}
							isDisabled={
								!isActive ||
								(amountToSend?.raw || 0n) === 0n ||
								(amountToSend?.raw || 0n) > (balances?.[toAddress(tokenToSend?.address)]?.raw || 0n) ||
								isZeroAddress(address)
							}
							onClick={onDonate}>
							{'Send tokens'}
						</Button>
					</div>
					<div className={'font-number w-full pt-1 text-center text-xxs text-neutral-400'}>
						<button
							suppressHydrationWarning
							disabled={!tokenToSend}
							onClick={(): void => onComputeValueFromAmount(balances?.[toAddress(tokenToSend?.address)])}>
							&nbsp;
							{tokenToSend
								? `You have ${formatAmount(
										balances?.[toAddress(tokenToSend?.address)]?.normalized || 0,
										2,
										6
								  )} ${tokenToSend?.symbol}`
								: ''}
							&nbsp;
						</button>
					</div>
				</div>
			</div>
			<div className={'relative grid grid-cols-4 gap-2 md:grid-cols-1'}>
				<Link href={'/disperseee'}>
					<RowCardWithIcon
						icon={<LogoDisperse className={'h-5 w-5 text-neutral-900 md:h-6 md:w-6'} />}
						title={'Disperse'}
						description={'Distribute tokens to multiple addresses.'}
					/>
				</Link>
				<RowCardWithIcon
					icon={
						<svg
							xmlns={'http://www.w3.org/2000/svg'}
							className={'h-5 w-5 p-1 text-neutral-900 md:h-6 md:w-6'}
							viewBox={'0 0 448 512'}>
							<path
								d={
									'M297.4 9.4c12.5-12.5 32.8-12.5 45.3 0l96 96c12.5 12.5 12.5 32.8 0 45.3l-96 96c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L338.7 160H128c-35.3 0-64 28.7-64 64v32c0 17.7-14.3 32-32 32s-32-14.3-32-32V224C0 153.3 57.3 96 128 96H338.7L297.4 54.6c-12.5-12.5-12.5-32.8 0-45.3zm-96 256c12.5-12.5 32.8-12.5 45.3 0l96 96c12.5 12.5 12.5 32.8 0 45.3l-96 96c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 416H96c-17.7 0-32 14.3-32 32v32c0 17.7-14.3 32-32 32s-32-14.3-32-32V448c0-53 43-96 96-96H242.7l-41.4-41.4c-12.5-12.5-12.5-32.8 0-45.3z'
								}
							/>
						</svg>
					}
					title={'Migrate'}
					description={'Send your tokens to another address.'}
				/>
				<RowCardWithIcon
					icon={
						<svg
							xmlns={'http://www.w3.org/2000/svg'}
							viewBox={'0 0 384 512'}
							className={'h-5 w-5 p-1 text-neutral-900 md:h-6 md:w-6'}>
							<path
								d={
									'M32 480c-17.7 0-32-14.3-32-32s14.3-32 32-32H352c17.7 0 32 14.3 32 32s-14.3 32-32 32H32zM214.6 342.6c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 242.7V64c0-17.7 14.3-32 32-32s32 14.3 32 32V242.7l73.4-73.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3l-128 128z'
								}
							/>
						</svg>
					}
					title={'Dump'}
					description={'Dump multiple tokens for a single token.'}
				/>
				<RowCardWithIcon
					icon={
						<svg
							xmlns={'http://www.w3.org/2000/svg'}
							viewBox={'0 0 448 512'}
							className={'h-5 w-5 p-1 text-neutral-900 md:h-6 md:w-6'}>
							<path
								fill={'currentColor'}
								d={
									'M438.6 150.6c12.5-12.5 12.5-32.8 0-45.3l-96-96c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.7 96 32 96C14.3 96 0 110.3 0 128s14.3 32 32 32l306.7 0-41.4 41.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l96-96zm-333.3 352c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 416 416 416c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0 41.4-41.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-96 96c-12.5 12.5-12.5 32.8 0 45.3l96 96z'
								}
							/>
						</svg>
					}
					title={'Swap'}
					description={'Swap one token for another token.'}
				/>
			</div>
		</div>
	);
}

function SectionDonate(): ReactElement {
	return (
		<div className={'mb-20'}>
			<div className={'flex flex-row items-center justify-between'}>
				<h2 className={'scroll-m-20 pb-4 text-sm'}>
					<span className={'font-medium text-neutral-900'}>{'Smol'}</span>
				</h2>
			</div>

			<DonateBox />
		</div>
	);
}
export default SectionDonate;
