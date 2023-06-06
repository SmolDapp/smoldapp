import React, {useCallback, useMemo} from 'react';
import Link from 'next/link';
import {ImageWithFallback} from 'components/common/ImageWithFallback';
import IconInfo from 'components/icons/IconInfo';
import {handleInputChangeEventValue} from 'utils/handleInputChangeEventValue';
import {getNativeToken} from 'utils/toWagmiProvider';
import {useMigratooor} from '@migratooor/useMigratooor';
import {useMountEffect, useUpdateEffect} from '@react-hookz/web';
import {getNetwork} from '@wagmi/core';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import IconLinkOut from '@yearn-finance/web-lib/icons/IconLinkOut';
import {toAddress, truncateHex} from '@yearn-finance/web-lib/utils/address';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {ETH_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {toBigInt} from '@yearn-finance/web-lib/utils/format.bigNumber';

import type {TTokenInfo} from 'contexts/useTokenList';
import type {ChangeEvent, ReactElement} from 'react';
import type {TAddress, TDict} from '@yearn-finance/web-lib/types';
import type {TBalanceData} from '@yearn-finance/web-lib/types/hooks';
import type {TSelectedElement} from '@migratooor/useMigratooor';

type TERC20RowProps = {balance: TBalanceData, address: TAddress};
function TableERC20Row({address: tokenAddress, balance}: TERC20RowProps): ReactElement {
	const {selected, set_selected} = useMigratooor();
	const {chainID, isActive} = useWeb3();
	const {safeChainID} = useChainID();
	const {chain} = getNetwork();
	const currentNativeToken = useMemo((): TTokenInfo => getNativeToken(safeChainID), [safeChainID]);
	const isSelected = useMemo((): boolean => selected[toAddress(tokenAddress)]?.isSelected, [selected, tokenAddress]);
	const tokenSymbol = useMemo((): string => balance.symbol || 'unknown', [balance.symbol]);
	const tokenDecimals = useMemo((): number => balance.decimals || 18, [balance.decimals]);

	const updateAmountOnChangeChain = useCallback((): void => {
		set_selected((prev): TDict<TSelectedElement> => ({
			...prev,
			[toAddress(tokenAddress)]: {
				address: tokenAddress,
				symbol: tokenSymbol,
				decimals: tokenDecimals,
				amount: {raw: -1n, normalized: 0},
				status: 'none',
				isSelected: false
			}
		}));
	}, [set_selected, tokenAddress, tokenDecimals, tokenSymbol]);

	const onChangeAmount = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
		let	newAmount = handleInputChangeEventValue(event, balance?.decimals || 18);
		if (toBigInt(newAmount.raw) > toBigInt(balance.raw)) {
			newAmount = balance;
		}
		set_selected((prev): TDict<TSelectedElement> => ({
			...prev,
			[toAddress(tokenAddress)]: {
				...prev[toAddress(tokenAddress)],
				isSelected: true,
				amount: newAmount
			}
		}));
	}, [balance, set_selected, tokenAddress]);

	const onSelect = useCallback((): void => {
		if (isSelected) {
			set_selected((prev): TDict<TSelectedElement> => ({
				...prev,
				[toAddress(tokenAddress)]: {
					...prev[toAddress(tokenAddress)],
					amount: {raw: -1n, normalized: 0},
					isSelected: false
				}
			}));
		} else {
			set_selected((prev): TDict<TSelectedElement> => ({
				...prev,
				[toAddress(tokenAddress)]: {
					...prev[toAddress(tokenAddress)],
					amount: balance,
					status: 'none',
					isSelected: true
				}
			}));
		}
	}, [isSelected, set_selected, tokenAddress, balance]);

	useMountEffect((): void => {
		if (selected[toAddress(tokenAddress)] === undefined) {
			set_selected((prev): TDict<TSelectedElement> => ({
				...prev,
				[toAddress(tokenAddress)]: {
					address: tokenAddress,
					symbol: tokenSymbol,
					decimals: tokenDecimals,
					amount: {raw: -1n, normalized: 0},
					status: 'none',
					isSelected: false
				}
			}));
		}
	});

	useUpdateEffect((): void => {
		updateAmountOnChangeChain();
	}, [chainID, updateAmountOnChangeChain]);

	return (
		<div
			onClick={onSelect}
			className={`yearn--table-wrapper group relative border-x-2 border-y-0 border-solid py-2 text-left hover:bg-neutral-100/50 ${isSelected ? 'border-transparent' : 'border-transparent'}`}>
			<div className={'absolute left-3 top-7 z-10 flex h-full justify-center md:left-6 md:top-0 md:items-center'}>
				<input
					type={'checkbox'}
					checked={isSelected}
					onChange={onSelect}
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
							unoptimized
							src={`https://assets.smold.app/api/token/${safeChainID}/${toAddress(tokenAddress)}/logo-128.png`}
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
						<p className={'font-mono text-xs text-neutral-500'}>
							{toAddress(tokenAddress) === ETH_TOKEN_ADDRESS ? currentNativeToken.name || '' : balance.name || ''}&nbsp;
						</p>
						{toAddress(tokenAddress) === ETH_TOKEN_ADDRESS ? (
							<p className={'font-mono text-xs text-neutral-500'}>{truncateHex(tokenAddress, 8)}</p>
						) : (
							<Link
								href={`${chain?.blockExplorers?.default}/address/${tokenAddress}`}
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
				<div
					className={cl(
						'yearn--table-data-section-item',
						'md:col-span-12 md:pl-6'
					)}>
					<label className={'yearn--table-data-section-item-label'}>{'Amount to migrate'}</label>
					<div className={'box-0 flex h-12 w-full items-center p-2'}>
						<div
							className={'flex h-12 w-full flex-row items-center justify-between px-0'}
							onClick={(e): void => e.stopPropagation()}>
							<input
								className={`w-full overflow-x-scroll border-none bg-transparent px-0 py-4 text-sm font-bold outline-none scrollbar-none ${isActive ? '' : 'cursor-not-allowed'}`}
								type={'number'}
								min={0}
								step={1 / 10 ** (balance.decimals || 18)}
								max={balance.normalized}
								inputMode={'numeric'}
								placeholder={String(balance.normalized)}
								pattern={'^((?:0|[1-9]+)(?:.(?:d+?[1-9]|[1-9]))?)$'}
								disabled={!isActive}
								value={toBigInt(selected[toAddress(tokenAddress)]?.amount?.raw) < 0n ? '' : selected[toAddress(tokenAddress)]?.amount?.normalized ?? ''}
								onChange={onChangeAmount} />
							<button
								onClick={onSelect}
								className={'ml-2 cursor-pointer rounded-sm border border-neutral-900 bg-neutral-100 px-2 py-1 text-xxs text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-neutral-0'}>
								{'max'}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default TableERC20Row;
