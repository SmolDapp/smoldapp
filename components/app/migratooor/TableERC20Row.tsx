import React, {useCallback, useMemo, useState} from 'react';
import Link from 'next/link';
import IconInfo from 'components/icons/IconInfo';
import {ImageWithFallback} from 'components/ImageWithFallback';
import {useMigratooor} from 'contexts/useMigratooor';
import {useWallet} from 'contexts/useWallet';
import {sendEther} from 'utils/actions/sendEth';
import {transfer} from 'utils/actions/transferERC20';
import handleInputChangeEventValue from 'utils/handleInputChangeEventValue';
import {useMountEffect, useUpdateEffect} from '@react-hookz/web';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChain} from '@yearn-finance/web-lib/hooks/useChain';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import IconLinkOut from '@yearn-finance/web-lib/icons/IconLinkOut';
import {toAddress, truncateHex} from '@yearn-finance/web-lib/utils/address';
import {ETH_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {toNormalizedBN, Zero} from '@yearn-finance/web-lib/utils/format.bigNumber';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';
import {defaultTxStatus, Transaction} from '@yearn-finance/web-lib/utils/web3/transaction';

import type {TMinBalanceData} from 'hooks/useBalances';
import type {ChangeEvent, ReactElement} from 'react';
import type {TAddress, TDict} from '@yearn-finance/web-lib/types';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';

function	TableERC20Row({address: tokenAddress, balance}: {balance: TMinBalanceData, address: TAddress}): ReactElement {
	const {balances} = useWallet();
	const {selected, set_selected, amounts, set_amounts, destinationAddress} = useMigratooor();
	const {refresh} = useWallet();
	const {provider, chainID, isActive} = useWeb3();
	const {safeChainID} = useChainID();
	const [txStatus, set_txStatus] = useState(defaultTxStatus);
	const isSelected = useMemo((): boolean => selected.includes(tokenAddress), [selected, tokenAddress]);
	const chain = useChain();

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
				amounts[ETH_TOKEN_ADDRESS]?.raw,
				balances[ETH_TOKEN_ADDRESS]?.raw
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
		// balance.normalized
		set_amounts((amounts: TDict<TNormalizedBN>): TDict<TNormalizedBN> => ({
			...amounts,
			[toAddress(tokenAddress)]: toNormalizedBN(balance.raw, balance.decimals || 18)
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
			className={`yearn--table-wrapper group relative border-x-2 border-y-0 border-solid pb-2 text-left hover:bg-neutral-100/50 ${isSelected ? 'border-transparent' : 'border-transparent'}`}>
			<div className={'absolute left-3 top-7 z-10 flex h-full justify-center md:left-6 md:top-0 md:items-center'}>
				<input
					type={'checkbox'}
					checked={isSelected}
					onChange={(): void => set_selected(isSelected ? selected.filter((item: TAddress): boolean => item !== tokenAddress) : [...selected, tokenAddress])}
					className={'checkbox cursor-pointer'} />
			</div>
			<div className={'yearn--table-token-section h-14 border-0 border-neutral-200 pl-8 md:border-r'}>
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
										<p>{'This amount will be reduced by the sum of the transaction fees incurred during the migration of other tokens, as well as any eventual donations.'}</p>
									</span>
								</div>
							) : null}
						</div>
						{toAddress(tokenAddress) === ETH_TOKEN_ADDRESS ? (
							<p className={'font-mono text-xs text-neutral-500'}>{truncateHex(tokenAddress, 8)}</p>
						) : (
							<Link
								href={`${chain.getCurrent()?.block_explorer}/address/${tokenAddress}`}
								onClick={(e): void => e.stopPropagation()}
								className={'flex cursor-pointer flex-row items-center space-x-2 text-neutral-500 transition-colors hover:text-neutral-900 hover:underline'}>
								<p className={'font-mono text-xs'}>{truncateHex(tokenAddress, 8)}</p>
								<IconLinkOut className={'h-3 w-3'} />
							</Link>
						)}
					</div>
				</div>
			</div>


			<div className={'yearn--table-data-section'}>
				<div className={'yearn--table-data-section-item md:col-span-10 md:px-6'} datatype={'number'}>
					<label className={'yearn--table-data-section-item-label'}>{'Amount to migrate'}</label>
					<div className={'box-0 flex h-10 w-full items-center p-2'}>
						<div
							className={'flex h-10 w-full flex-row items-center justify-between py-4 px-0'}
							onClick={(e): void => e.stopPropagation()}>
							<input
								className={`w-full overflow-x-scroll border-none bg-transparent py-4 px-0 text-sm font-bold outline-none scrollbar-none ${isActive ? '' : 'cursor-not-allowed'}`}
								type={'number'}
								min={0}
								step={1 / 10 ** (balance.decimals || 18)}
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
						isDisabled={!isActive || ((amounts[toAddress(tokenAddress)]?.raw || Zero).isZero())}
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

export default TableERC20Row;
