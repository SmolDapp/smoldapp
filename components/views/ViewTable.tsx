import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import IconCheck from 'components/icons/IconCheck';
import IconCircleCross from 'components/icons/IconCircleCross';
import IconInfo from 'components/icons/IconInfo';
import ListHead from 'components/ListHead';
import TokenListsBox from 'components/TokenLists';
import {useSelected} from 'contexts/useSelected';
import {useWallet} from 'contexts/useWallet';
import {ethers} from 'ethers';
import {isAddress} from 'ethers/lib/utils';
import {disperseEther} from 'utils/actions/disperseEth';
import {sendEther} from 'utils/actions/sendEth';
import {transfer} from 'utils/actions/transferToken';
import {Inter} from '@next/font/google';
import {useMountEffect, useUpdateEffect} from '@react-hookz/web';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {hooks} from '@yearn-finance/web-lib/hooks';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import IconLoader from '@yearn-finance/web-lib/icons/IconLoader';
import {isZeroAddress, toAddress, truncateHex} from '@yearn-finance/web-lib/utils/address';
import {ETH_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {toNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';
import {getProvider} from '@yearn-finance/web-lib/utils/web3/providers';
import {defaultTxStatus, Transaction} from '@yearn-finance/web-lib/utils/web3/transaction';

import {ImageWithFallback} from '../ImageWithFallback';

import type {TMinBalanceData, TUseBalancesTokens} from 'hooks/useBalances';
import type {ChangeEvent, Dispatch, ReactElement, SetStateAction} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/utils/address';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import type {TDict} from '@yearn-finance/web-lib/utils/types';

const inter = Inter({
	weight: ['400', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--inter-font'
});

function handleInputChangeEventValue(e: React.ChangeEvent<HTMLInputElement>, decimals?: number): TNormalizedBN {
	const	{valueAsNumber, value} = e.target;
	const	amount = valueAsNumber;
	if (isNaN(amount)) {
		return ({raw: ethers.constants.Zero, normalized: ''});
	}
	if (amount === 0) {
		let		amountStr = value.replace(/,/g, '.').replace(/[^0-9.]/g, '');
		const	amountParts = amountStr.split('.');
		if ((amountParts[0])?.length > 1 && Number(amountParts[0]) === 0) {
			//
		} else {
			//check if we have 0 everywhere
			if (amountParts.every((part: string): boolean => Number(part) === 0)) {
				if (amountParts.length === 2) {
					amountStr = amountParts[0] + '.' + amountParts[1].slice(0, decimals);
				}
				const	raw = ethers.utils.parseUnits(amountStr || '0', decimals);
				return ({raw: raw, normalized: amountStr || '0'});
			}
		}
	}

	const	raw = ethers.utils.parseUnits(amount.toString() || '0', decimals);
	return ({raw: raw, normalized: amount.toString() || '0'});
}

function	TokenRow({address: tokenAddress, balance}: {balance: TMinBalanceData, address: TAddress}): ReactElement {
	const {balances} = useWallet();
	const {selected, set_selected, amounts, set_amounts, destinationAddress} = useSelected();
	const {refresh} = useWallet();
	const {provider, chainID, isActive} = useWeb3();
	const {safeChainID} = useChainID();
	const [txStatus, set_txStatus] = useState(defaultTxStatus);
	const isSelected = useMemo((): boolean => selected.includes(tokenAddress), [selected, tokenAddress]);

	const	handleSuccessCallback = useCallback(async (onlyETH: boolean): Promise<void> => {
		const tokensToRefresh = [{token: ETH_TOKEN_ADDRESS, decimals: balances[ETH_TOKEN_ADDRESS].decimals, symbol: balances[ETH_TOKEN_ADDRESS].symbol}];
		if (!onlyETH) {
			tokensToRefresh.push({token: toAddress(tokenAddress), decimals: balance.decimals, symbol: balance.symbol});
		}

		const updatedBalances = await refresh(tokensToRefresh);
		performBatchedUpdates((): void => {
			if (onlyETH) {
				set_amounts((amounts: TDict<TNormalizedBN>): TDict<TNormalizedBN> => ({...amounts, [ETH_TOKEN_ADDRESS]: updatedBalances[ETH_TOKEN_ADDRESS]}));
			} else {
				set_amounts((amounts: TDict<TNormalizedBN>): TDict<TNormalizedBN> => ({
					...amounts,
					[ETH_TOKEN_ADDRESS]: updatedBalances[ETH_TOKEN_ADDRESS],
					[toAddress(tokenAddress)]: updatedBalances[toAddress(tokenAddress)]
				}));
			}
			set_selected((s: TAddress[]): TAddress[] => s.filter((item: TAddress): boolean => toAddress(item) !== toAddress(tokenAddress)));
		});
	}, [balance.decimals, balance.symbol, balances, tokenAddress]); // eslint-disable-line react-hooks/exhaustive-deps

	async function	onTransfer(): Promise<void> {
		if (toAddress(tokenAddress) === ETH_TOKEN_ADDRESS) {
			new Transaction(provider, sendEther, set_txStatus).populate(
				toAddress(destinationAddress),
				amounts[ETH_TOKEN_ADDRESS]?.raw
			).onSuccess(async (): Promise<void> => handleSuccessCallback(true)).perform();
		} else {
			try {
				new Transaction(provider, transfer, set_txStatus).populate(
					toAddress(tokenAddress),
					toAddress(destinationAddress),
					amounts[toAddress(tokenAddress)]?.raw
				).onSuccess(async (): Promise<void> => handleSuccessCallback(false)).perform();
			} catch (error) {
				console.error(error);
			}
		}
	}

	const	updateAmountOnChangeChain = useCallback((): void => {
		set_amounts((amounts: TDict<TNormalizedBN>): TDict<TNormalizedBN> => ({
			...amounts,
			[toAddress(tokenAddress)]: toNormalizedBN(balance.raw)
		}));
	}, [tokenAddress, balance]); // eslint-disable-line react-hooks/exhaustive-deps

	useMountEffect((): void => {
		if (amounts[toAddress(tokenAddress)] === undefined) {
			set_amounts((amounts: TDict<TNormalizedBN>): TDict<TNormalizedBN> => ({
				...amounts,
				[toAddress(tokenAddress)]: toNormalizedBN(balance.raw)
			}));
		}
	});

	useUpdateEffect((): void => {
		updateAmountOnChangeChain();
	}, [chainID, updateAmountOnChangeChain]);

	return (
		<div
			onClick={(): void => set_selected(isSelected ? selected.filter((item: TAddress): boolean => item !== tokenAddress) : [...selected, tokenAddress])}
			className={`yearn--table-wrapper group relative border-x-2 border-y-0 border-solid pb-2 text-left hover:bg-neutral-100/50 ${isSelected ? 'border-neutral-900' : 'border-transparent'}`}>
			<div className={'absolute left-3 top-7 z-10 flex h-full justify-center md:left-6 md:top-0 md:items-center'}>
				<input
					type={'checkbox'}
					checked={isSelected}
					onChange={(): void => set_selected(isSelected ? selected.filter((item: TAddress): boolean => item !== tokenAddress) : [...selected, tokenAddress])}
					className={'checkbox cursor-pointer'} />
			</div>
			<div className={'yearn--table-token-section h-14 border-r border-neutral-200 pl-8'}>
				<div className={'yearn--table-token-section-item'}>
					<div className={'yearn--table-token-section-item-image'}>
						<ImageWithFallback
							alt={''}
							width={40}
							height={40}
							quality={90}
							src={`https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/multichain-tokens/${safeChainID}/${toAddress(tokenAddress)}/logo-128.png`}
							loading={'eager'} />
					</div>
					<div>
						<div className={'flex flex-row items-center space-x-2'}>
							<b>{balance.symbol}</b>
							{toAddress(tokenAddress) === ETH_TOKEN_ADDRESS ? (
								<div className={'tooltip'}>
									<IconInfo className={'h-[14px] w-[14px] text-neutral-900'} />
									<span className={'tooltiptext text-xs'}>
										<p>{'This amount will be reduced by the sum of the transaction fees incurred during the migration of other tokens,  as well as any eventual donations.'}</p>
									</span>
								</div>
							) : null}
						</div>
						<p className={'font-mono text-xs text-neutral-500'}>{truncateHex(tokenAddress, 10)}</p>
					</div>
				</div>
			</div>


			<div className={'yearn--table-data-section'}>
				<div className={'yearn--table-data-section-item md:col-span-10 md:px-6'} datatype={'number'}>
					<label className={'yearn--table-data-section-item-label'}>{'Move to new wallet'}</label>
					<div className={'box-0 flex h-10 w-full items-center p-2'}>
						<div
							className={'flex h-10 w-full flex-row items-center justify-between py-4 px-0'}
							onClick={(e): void => e.stopPropagation()}>
							<input
								className={`w-full overflow-x-scroll border-none bg-transparent py-4 px-0 text-sm font-bold outline-none scrollbar-none ${isActive ? '' : 'cursor-not-allowed'}`}
								type={'number'}
								min={0}
								max={balance.normalized}
								inputMode={'numeric'}
								pattern={'^((?:0|[1-9]+)(?:.(?:d+?[1-9]|[1-9]))?)$'}
								disabled={!isActive}
								value={amounts[toAddress(tokenAddress)]?.normalized ?? '0'}
								onChange={(e: ChangeEvent<HTMLInputElement>): void => {
									let	newAmount = handleInputChangeEventValue(e, balance?.decimals || 18);
									if (newAmount.raw.gt(balance.raw)) {
										newAmount = balance;
									}
									set_amounts((amounts): TDict<TNormalizedBN> => ({...amounts, [toAddress(tokenAddress)]: newAmount}));
								}} />
							<button
								onClick={(): void => {
									set_amounts((amounts): TDict<TNormalizedBN> => ({...amounts, [toAddress(tokenAddress)]: balance}));
								}}
								className={'ml-2 cursor-pointer rounded-sm border border-neutral-900 bg-neutral-100 px-2 py-1 text-xxs text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-neutral-0'}>
								{'max'}
							</button>
						</div>
					</div>
				</div>

				<div
					className={'col-span-1 hidden h-8 w-full flex-col justify-center md:col-span-2 md:flex md:h-14'}
					onClick={(e): void => e.stopPropagation()}>
					<Button
						className={'yearn--button-smaller !w-full'}
						isBusy={txStatus.pending}
						isDisabled={!isActive || ((amounts[toAddress(tokenAddress)]?.raw || ethers.constants.Zero).isZero())}
						onClick={(): void => {
							onTransfer();
						}}>
						{'Migrate'}
					</Button>
				</div>
			</div>
		</div>
	);
}

function	DonateRow({shouldDonateETH, set_shouldDonateETH, amountToDonate, set_amountToDonate}: {
	shouldDonateETH: boolean,
	set_shouldDonateETH: Dispatch<SetStateAction<boolean>>,
	amountToDonate: TNormalizedBN,
	set_amountToDonate: Dispatch<SetStateAction<TNormalizedBN>>,
}): ReactElement {
	const {balances, refresh} = useWallet();
	const {provider, isActive} = useWeb3();
	const {amounts, set_amounts} = useSelected();
	const [txStatus, set_txStatus] = useState(defaultTxStatus);

	const	handleSuccessCallback = useCallback(async (): Promise<void> => {
		const tokensToRefresh = [{token: ETH_TOKEN_ADDRESS, decimals: balances[ETH_TOKEN_ADDRESS].decimals, symbol: balances[ETH_TOKEN_ADDRESS].symbol}];
		const updatedBalances = await refresh(tokensToRefresh);
		performBatchedUpdates((): void => {
			set_amounts((amounts: TDict<TNormalizedBN>): TDict<TNormalizedBN> => ({...amounts, [ETH_TOKEN_ADDRESS]: updatedBalances[ETH_TOKEN_ADDRESS]}));
		});
	}, [balances]); // eslint-disable-line react-hooks/exhaustive-deps

	async function	onDonate(): Promise<void> {
		new Transaction(provider, sendEther, set_txStatus).populate(
			toAddress(process.env.RECEIVER_ADDRESS),
			amountToDonate.raw
		).onSuccess(async (): Promise<void> => handleSuccessCallback()).perform();
	}

	useEffect((): void => {
		if (shouldDonateETH && amountToDonate.raw.isZero()) {
			const	ethBalance = balances?.[ETH_TOKEN_ADDRESS]?.raw || ethers.constants.Zero;
			set_amountToDonate(toNormalizedBN(ethBalance.div(1000).mul(1)));
		} else if (!shouldDonateETH) {
			set_amountToDonate(toNormalizedBN(ethers.constants.Zero));
		}
	}, [amountToDonate.raw, balances, shouldDonateETH]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div
			onClick={(): void => set_shouldDonateETH((shouldDonateETH: boolean): boolean => !shouldDonateETH)}
			className={`relative col-span-12 mb-0 border-x-2 bg-neutral-0 px-6 py-2 text-neutral-900 transition-colors hover:bg-neutral-100 ${shouldDonateETH ? 'border-neutral-900' : 'border-transparent'}`}>
			<div className={'grid h-14 grid-cols-9'}>
				<div className={'col-span-3 flex flex-row items-center space-x-4 border-r border-neutral-200'}>
					<input
						type={'checkbox'}
						checked={shouldDonateETH}
						className={'checkbox cursor-pointer'} />
					<b>{'Donate ETH'}</b>
				</div>
				<div className={'col-span-5 flex flex-row items-center px-6'}>
					<div
						onClick={(e): void => e.stopPropagation()}
						className={'box-0 flex h-10 w-full items-center p-2'}>
						<div className={'flex h-10 w-full flex-row items-center justify-between py-4 px-0'}>
							<input
								className={'w-full overflow-x-scroll border-none bg-transparent py-4 px-0 text-sm font-bold outline-none scrollbar-none'}
								type={'number'}
								min={0}
								max={balances?.[ETH_TOKEN_ADDRESS]?.normalized || 0}
								inputMode={'numeric'}
								pattern={'^((?:0|[1-9]+)(?:.(?:d+?[1-9]|[1-9]))?)$'}
								value={amountToDonate?.normalized ?? '0'}
								onChange={(e: ChangeEvent<HTMLInputElement>): void => {
									let	newAmount = handleInputChangeEventValue(e, balances[ETH_TOKEN_ADDRESS]?.decimals || 18);
									if (newAmount.raw.gt(balances[ETH_TOKEN_ADDRESS].raw)) {
										newAmount = balances[ETH_TOKEN_ADDRESS];
									}
									set_amountToDonate(newAmount);
								}} />
						</div>
					</div>
				</div>
				<div
					onClick={(e): void => e.stopPropagation()}
					className={'col-span-1 flex w-full flex-row items-center'}>
					<Button
						className={'yearn--button-smaller !w-full'}
						isBusy={txStatus.pending}
						isDisabled={!isActive || ((amounts[ETH_TOKEN_ADDRESS]?.raw || ethers.constants.Zero).isZero())}
						onClick={(): void => {
							onDonate();
						}}>
						{'Donate'}
					</Button>
				</div>
			</div>
		</div>
	);
}

function	CustomTokenBox(): ReactElement {
	const	{provider} = useWeb3();
	const	{refresh} = useWallet();
	const	[erc20Address, set_erc20Address] = useState<string>('');
	const	[isValidERC20, set_isValidERC20] = useState<boolean>(false);
	const	[isLoading, set_isLoading] = useState<boolean>(false);
	const	validERC20Data = useRef<TUseBalancesTokens | undefined>();

	const	checkDestinationValidity = useCallback(async (): Promise<void> => {
		if (!isZeroAddress(toAddress(erc20Address))) {
			set_isLoading(true);
			//Fetch ERC20 token data
			const	erc20Contract = new ethers.Contract(erc20Address, [
				'function symbol() external view returns (string)',
				'function decimals() external view returns (uint8)'
			], provider || getProvider(1));
			const	result = await Promise.allSettled([erc20Contract.symbol(), erc20Contract.decimals()]);
			const	erc20Symbol = result[0].status === 'fulfilled' ? result[0].value : '';
			const	erc20Decimals = result[1].status === 'fulfilled' ? result[1].value : 0;

			if (erc20Symbol === '0' && erc20Decimals === 0) {
				performBatchedUpdates((): void => {
					set_isLoading(false);
					set_isValidERC20(false);
				});
			} else {
				performBatchedUpdates(async (): Promise<void> => {
					set_isLoading(false);
					set_isValidERC20(true);
					validERC20Data.current = {
						token: erc20Address,
						symbol: erc20Symbol,
						decimals: erc20Decimals,
						force: true
					};
				});
			}
		} else {
			set_isValidERC20(false);
		}
	}, [erc20Address, provider]);

	useUpdateEffect((): void => {
		set_isValidERC20(false);
		checkDestinationValidity();
	}, [checkDestinationValidity]);

	return (
		<div className={'mt-6 grid w-3/4 grid-cols-12 flex-row items-center justify-between gap-6'}>
			<div className={'box-100 grow-1 col-span-9 flex h-10 w-full items-center p-2'}>
				<div className={'flex h-10 w-full flex-row items-center justify-between py-4 px-0'}>
					<input
						aria-invalid={!isValidERC20}
						onBlur={async (): Promise<void> => checkDestinationValidity()}
						required
						placeholder={'0x...'}
						value={erc20Address}
						onChange={(e): void => set_erc20Address(e.target.value)}
						className={'w-full overflow-x-scroll border-none bg-transparent py-4 px-0 font-mono text-sm outline-none scrollbar-none'}
						type={'text'} />
				</div>
				<div className={'pointer-events-none relative h-4 w-4'}>
					<IconCheck
						className={`absolute h-4 w-4 text-[#16a34a] transition-opacity ${isValidERC20 ? 'opacity-100' : 'opacity-0'}`} />
					<IconCircleCross
						className={`absolute h-4 w-4 text-[#e11d48] transition-opacity ${(!isValidERC20 && erc20Address !== '' && !isLoading) ? 'opacity-100' : 'opacity-0'}`} />
					<div className={'absolute inset-0 flex items-center justify-center'}>
						<IconLoader className={`h-4 w-4 animate-spin text-neutral-900 transition-opacity ${isLoading ? 'opacity-100' : 'opacity-0'}`} />
					</div>
				</div>
			</div>
			<div className={'col-span-3'}>
				<Button
					className={'yearn--button !w-[160px] rounded-md !text-sm'}
					disabled={!isAddress(erc20Address) || !isValidERC20 || !validERC20Data.current}
					onClick={(): void => {
						if (validERC20Data.current) {
							refresh([validERC20Data.current]).then((): void => {
								performBatchedUpdates((): void => {
									set_erc20Address('');
									set_isValidERC20(false);
								});
							});
						}

					}}>
					{'Add token'}
				</Button>
			</div>
		</div>
	);
}

function	CustomListSettings(): ReactElement {
	return (
		<div id={'select'} className={`${inter.variable}`}>
			<div className={'grid w-full grid-cols-12'}>
				<div className={'col-span-12 flex flex-col text-neutral-900'}>
					<div className={'mb-4 w-full text-sm'}>
						<b>{'Select your tokenlists or include individual tokens'}</b>
						<p className={'text-xs text-neutral-500'}>
							{'Token Lists is a community-led initiative to improve discoverability, reputation and trust in ERC20 token lists in a manner that is inclusive, transparent, and decentralized. This regroups popular tokens for easy access.'}
						</p>
					</div>
					<div>
						<TokenListsBox />
						<div className={'relative my-4 flex h-[1px] w-full items-center justify-center bg-neutral-200'}>
							<div className={'absolute flex items-center justify-center bg-neutral-0 px-2 text-sm text-neutral-500'}>
								{'or'}
							</div>

						</div>
						<CustomTokenBox />
					</div>
				</div>
			</div>
		</div>
	);
}

function	ViewTable(): ReactElement {
	const	{isActive, chainID, provider} = useWeb3();
	const	{selected, set_selected, amounts, set_amounts, destinationAddress} = useSelected();
	const	{balances, balancesNonce, refresh} = useWallet();
	const	[sortBy, set_sortBy] = useState<string>('apy');
	const	[sortDirection, set_sortDirection] = useState<'asc' | 'desc'>('desc');
	const	[txStatus, set_txStatus] = useState(defaultTxStatus);
	const	[shouldDonateETH, set_shouldDonateETH] = useState(false);
	const	[amountToDonate, set_amountToDonate] = useState(toNormalizedBN(0));

	const	balancesToDisplay = hooks.useDeepCompareMemo((): ReactElement[] => {
		return (
			Object.entries(balances || [])
				.filter(([, balance]: [string, TMinBalanceData]): boolean => (
					(balance?.raw && !balance.raw.isZero()) || (balance?.force || false)
				))
				.sort((a: [string, TMinBalanceData], b: [string, TMinBalanceData]): number => {
					const	[, aBalance] = a;
					const	[, bBalance] = b;

					if (sortBy === 'name') {
						return sortDirection === 'asc'
							? aBalance.symbol.localeCompare(bBalance.symbol)
							: bBalance.symbol.localeCompare(aBalance.symbol);
					}
					if (sortBy === 'balance') {
						return sortDirection === 'asc'
							? aBalance.raw.gt(bBalance.raw) ? 1 : -1
							: aBalance.raw.gt(bBalance.raw) ? -1 : 1;
					}
					return 0;
				})
				.map(([address, balance]: [string, TMinBalanceData]): ReactElement => {
					return <TokenRow
						key={`${address}-${chainID}-${balance.symbol}`}
						balance={balance}
						address={toAddress(address)} />;
				})
		);
	}, [balances, balancesNonce, sortBy, sortDirection, chainID]);

	const	handleSuccessCallback = useCallback(async (tokenAddress: TAddress): Promise<void> => {
		const tokensToRefresh = [{token: ETH_TOKEN_ADDRESS, decimals: balances[ETH_TOKEN_ADDRESS].decimals, symbol: balances[ETH_TOKEN_ADDRESS].symbol}];
		if (!isZeroAddress(tokenAddress)) {
			tokensToRefresh.push({token: tokenAddress, decimals: balances[tokenAddress].decimals, symbol: balances[tokenAddress].symbol});
		}

		const updatedBalances = await refresh(tokensToRefresh);
		performBatchedUpdates((): void => {
			if (!isZeroAddress(tokenAddress)) {
				set_amounts((amounts: TDict<TNormalizedBN>): TDict<TNormalizedBN> => ({...amounts, [ETH_TOKEN_ADDRESS]: updatedBalances[ETH_TOKEN_ADDRESS]}));
			} else {
				set_amounts((amounts: TDict<TNormalizedBN>): TDict<TNormalizedBN> => ({
					...amounts,
					[ETH_TOKEN_ADDRESS]: updatedBalances[ETH_TOKEN_ADDRESS],
					[tokenAddress]: updatedBalances[tokenAddress]
				}));
			}
			set_selected((s: TAddress[]): TAddress[] => s.filter((item: TAddress): boolean => toAddress(item) !== tokenAddress));
		});
	}, [balances]); // eslint-disable-line react-hooks/exhaustive-deps

	async function	onMigrateSelected(): Promise<void> {
		let	shouldMigrateETH = false;
		const	allSelected = [...selected];
		for (const token of allSelected) {
			if ((amounts[toAddress(token)]?.raw || ethers.constants.Zero).isZero()) {
				continue;
			}
			if (toAddress(token) === ETH_TOKEN_ADDRESS) { //Migrate ETH at the end
				shouldMigrateETH = true;
				continue;
			}
			try {
				new Transaction(provider, transfer, set_txStatus).populate(
					toAddress(token),
					toAddress(destinationAddress),
					amounts[toAddress(token)]?.raw
				).onSuccess(async (): Promise<void> => handleSuccessCallback(toAddress(token))).perform();
			} catch (error) {
				console.error(error);
			}
		}

		if (
			(shouldDonateETH && (amountToDonate?.raw || ethers.constants.Zero).gt(ethers.constants.Zero)) &&
			(shouldMigrateETH && (amounts[ETH_TOKEN_ADDRESS]?.raw || ethers.constants.Zero).gt(ethers.constants.Zero)) &&
			balances[ETH_TOKEN_ADDRESS]?.raw?.gt(amountToDonate.raw.add(amounts[ETH_TOKEN_ADDRESS]?.raw || ethers.constants.Zero))
		) {
			new Transaction(provider, disperseEther, set_txStatus).populate(
				toAddress(destinationAddress),
				amounts[ETH_TOKEN_ADDRESS]?.raw,
				amountToDonate.raw
			).onSuccess(async (): Promise<void> => handleSuccessCallback(toAddress(ethers.constants.AddressZero))).perform();
		} else if (shouldDonateETH && (amountToDonate?.raw || ethers.constants.Zero).gt(ethers.constants.Zero)) {
			new Transaction(provider, sendEther, set_txStatus).populate(
				toAddress(process.env.RECEIVER_ADDRESS),
				amountToDonate.raw
			).onSuccess(async (): Promise<void> => handleSuccessCallback(toAddress(ethers.constants.AddressZero))).perform();
		} else if (shouldMigrateETH && (amounts[ETH_TOKEN_ADDRESS]?.raw || ethers.constants.Zero).gt(ethers.constants.Zero)) {
			new Transaction(provider, sendEther, set_txStatus).populate(
				toAddress(destinationAddress),
				amounts[ETH_TOKEN_ADDRESS]?.raw
			).onSuccess(async (): Promise<void> => handleSuccessCallback(toAddress(ethers.constants.AddressZero))).perform();
		}
	}

	return (
		<div id={'select'} className={'mb-[800px] pt-10'}>
			<div className={'box-0 mb-6 grid w-full grid-cols-12 overflow-hidden'}>
				<div className={'col-span-12 flex flex-col p-6 pb-0 text-neutral-900'}>
					<div className={'w-3/4'}>
						<b>{'Select the tokens to migrate'}</b>
						<p className={'text-sm text-neutral-500'}>
							{'Select the tokens you want to migrate to another wallet. You can migrate all your tokens at once or select individual tokens.'}
						</p>
					</div>
				</div>
				<div className={'col-span-12 flex flex-col border-b border-neutral-200 p-6 text-neutral-900'}>
					<details className={'box-0'}>
						<summary className={'py-4 px-6 transition-colors hover:bg-neutral-100'}>
							<p className={'text-sm text-neutral-500'}>
								{'You want more control over the list of available tokens? '}
								<span className={'cursor-pointer text-sm text-neutral-500 underline hover:text-neutral-900'}>
									{'Customize your list here!'}
								</span>
							</p>
						</summary>
						<div className={'p-6 pt-2'}>
							<CustomListSettings />
						</div>
					</details>
				</div>

				<div className={'col-span-12'}>
					<ListHead
						sortBy={sortBy}
						sortDirection={sortDirection}
						onSort={(newSortBy, newSortDirection): void => {
							performBatchedUpdates((): void => {
								set_sortBy(newSortBy);
								set_sortDirection(newSortDirection as 'asc' | 'desc');
							});
						}}
						items={[
							{label: 'Token', value: 'name', sortable: true},
							{label: 'Amount', value: 'balance', sortable: false, className: 'col-span-10 md:pl-5', datatype: 'text'},
							{label: '', value: '', sortable: false, className: 'col-span-2'}
						]} />
					<div>
						{balancesToDisplay}
					</div>
				</div>

				<div className={'col-span-12'}>
				</div>

				<DonateRow
					shouldDonateETH={shouldDonateETH}
					amountToDonate={amountToDonate}
					set_shouldDonateETH={set_shouldDonateETH}
					set_amountToDonate={set_amountToDonate} />


				<div className={'col-span-12 flex w-full max-w-4xl flex-row items-center justify-between bg-neutral-900 p-6 text-neutral-0'}>
					<div className={''}>
						<b>{`Migrate ${selected.length} tokens`}</b>
					</div>
					<div>
						<Button
							className={'yearn--button-smaller !w-[160px] !text-sm'}
							variant={'reverted'}
							isBusy={txStatus.pending}
							isDisabled={!isActive || (selected.length === 0)}
							onClick={(): void => {
								onMigrateSelected();
							}}>
							{'Migrate selected'}
						</Button>
					</div>
				</div>

			</div>
		</div>
	);
}
export default ViewTable;
