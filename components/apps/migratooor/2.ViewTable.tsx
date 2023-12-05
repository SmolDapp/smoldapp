import React, {Fragment, memo, useCallback, useMemo, useRef, useState} from 'react';
import {IconSpinner} from 'components/icons/IconSpinner';
import {useTokenList} from 'contexts/useTokenList';
import {useWallet} from 'contexts/useWallet';
import {useMigratooor} from '@migratooor/useMigratooor';
import {useMountEffect} from '@react-hookz/web';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {IconSettings} from '@yearn-finance/web-lib/icons/IconSettings';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {toBigInt, toNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';

import TokenInput from './TokenInput';

import type {ReactElement} from 'react';
import type {TAddress, TDict} from '@yearn-finance/web-lib/types';
import type {TBalanceData} from '@yearn-finance/web-lib/types/hooks';
import type {TSelectedElement} from '@migratooor/useMigratooor';

function TableLine({
	tokenAddress,
	balance,
	index
}: {
	tokenAddress: TAddress;
	balance: TBalanceData;
	index: number;
}): ReactElement {
	const {tokenList} = useTokenList();
	const {selected, set_selected} = useMigratooor();
	const inputRef = useRef<HTMLInputElement>(null);
	const isSelected = useMemo((): boolean => selected[toAddress(tokenAddress)]?.isSelected, [selected, tokenAddress]);
	const tokenSymbol = useMemo((): string => balance.symbol || 'unknown', [balance.symbol]);
	const tokenDecimals = useMemo((): number => balance.decimals || 18, [balance.decimals]);

	const onSelect = useCallback(
		async (rawAmount: bigint): Promise<void> => {
			if (rawAmount === 0n) {
				set_selected(
					(prev): TDict<TSelectedElement> => ({
						...prev,
						[toAddress(tokenAddress)]: {
							...prev[toAddress(tokenAddress)],
							amount: toNormalizedBN(0),
							isSelected: false
						}
					})
				);
			} else {
				set_selected(
					(prev): TDict<TSelectedElement> => ({
						...prev,
						[toAddress(tokenAddress)]: {
							...prev[toAddress(tokenAddress)],
							amount: toNormalizedBN(rawAmount, tokenDecimals),
							status: 'none',
							isSelected: true
						}
					})
				);
			}
		},
		[set_selected, tokenAddress, tokenDecimals]
	);

	useMountEffect((): void => {
		if (selected[toAddress(tokenAddress)] === undefined) {
			set_selected(
				(prev): TDict<TSelectedElement> => ({
					...prev,
					[toAddress(tokenAddress)]: {
						address: tokenAddress,
						symbol: tokenSymbol,
						decimals: tokenDecimals,
						amount: {raw: -1n, normalized: 0},
						status: 'none',
						isSelected: false
					}
				})
			);
		}
	});

	if (!tokenList[toAddress(tokenAddress)]) {
		return <div />;
	}

	return (
		<Fragment>
			<div className={'relative col-span-12 flex w-full flex-row items-center gap-3'}>
				<div className={'absolute right-4 top-2 z-20 md:relative md:right-auto md:top-auto'}>
					<input
						ref={inputRef}
						type={'checkbox'}
						className={'checkbox cursor-pointer'}
						tabIndex={-1}
						checked={isSelected}
						onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
							if (!event.target.checked) {
								onSelect(0n);
							} else {
								onSelect(balance.raw);
							}
						}}
					/>
				</div>
				<TokenInput
					index={index}
					allowance={toNormalizedBN(0)}
					token={tokenList[toAddress(tokenAddress)]}
					shouldCheckAllowance={false}
					value={selected[toAddress(tokenAddress)]?.amount || toNormalizedBN(0)}
					placeholder={String(balance.normalized)}
					onChange={(v): void => {
						onSelect(v.raw);
					}}
				/>
			</div>
		</Fragment>
	);
}

const ViewTable = memo(function ViewTable({onProceed}: {onProceed: VoidFunction}): ReactElement {
	const {isActive, chainID} = useWeb3();
	const {selected} = useMigratooor();
	const {balances, balancesNonce, isLoading} = useWallet();
	const {openTokenListModal} = useTokenList();
	const [search, set_search] = useState<string>('');

	const isValid = useMemo((): boolean => {
		return (
			Object.values(selected).every((row): boolean => {
				if (row.isSelected && toBigInt(row.amount?.raw) === 0n) {
					return false;
				}
				return true;
			}) && Object.values(selected).some((row): boolean => row.isSelected)
		);
	}, [selected]);

	const balancesToDisplay = useMemo((): [string, TBalanceData][] => {
		balancesNonce;
		return Object.entries(balances || [])
			.filter(([tokenAddress, tokenData]: [string, TBalanceData]): boolean => {
				if (search) {
					const searchArray = search.split(/[\s,]+/);
					return searchArray.some((searchTerm: string): boolean => {
						if (searchTerm === '') {
							return false;
						}
						return (
							tokenData.symbol.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
							tokenData.name.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
							tokenAddress.toLowerCase().startsWith(searchTerm.toLowerCase())
						);
					});
				}
				return true;
			})
			.filter(
				([, balance]: [string, TBalanceData]): boolean => toBigInt(balance.raw) > 0n || balance?.force || false
			);
	}, [balances, balancesNonce, search]);

	return (
		<section className={'box-0'}>
			<div className={'relative w-full'}>
				<div className={'relative col-span-12 flex flex-col p-4 text-neutral-900 md:p-6 md:pb-2'}>
					<div
						className={'absolute right-4 top-4 cursor-pointer'}
						onClick={openTokenListModal}>
						<IconSettings className={'transition-color h-4 w-4 text-neutral-400 hover:text-neutral-900'} />
					</div>
					<div className={'w-full md:w-3/4'}>
						<b>{'Which tokens do you want to dump?'}</b>
						<p className={'text-sm text-neutral-500'}>
							{
								'Select the token(s) that you’d like to dump. In exchange you’ll receive whatever token you selected in the first step.'
							}
						</p>
					</div>
					<div className={'mt-4 w-full'}>
						<div className={'smol--input-wrapper'}>
							<input
								onChange={(event): void => set_search(event.target.value)}
								value={search}
								className={'smol--input'}
								type={'text'}
								placeholder={'Filter tokens...'}
							/>
						</div>
					</div>
				</div>

				<div className={'flex w-full flex-col gap-2 overflow-x-hidden px-0 md:px-6'}>
					{balancesToDisplay.length === 0 && isLoading ? (
						<div className={'col-span-12 flex min-h-[200px] flex-col items-center justify-center'}>
							<IconSpinner />
							<p className={'mt-6 text-sm text-neutral-500'}>{'We are looking for your tokens ...'}</p>
						</div>
					) : balancesToDisplay.length === 0 ? (
						<div className={'col-span-12 flex min-h-[200px] flex-col items-center justify-center'}>
							<svg
								className={'h-4 w-4 text-neutral-400'}
								xmlns={'http://www.w3.org/2000/svg'}
								viewBox={'0 0 512 512'}>
								<path
									d={
										'M505 41c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0L396.5 81.5C358.1 50.6 309.2 32 256 32C132.3 32 32 132.3 32 256c0 53.2 18.6 102.1 49.5 140.5L7 471c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l74.5-74.5c38.4 31 87.3 49.5 140.5 49.5c123.7 0 224-100.3 224-224c0-53.2-18.6-102.1-49.5-140.5L505 41zM362.3 115.7L115.7 362.3C93.3 332.8 80 295.9 80 256c0-97.2 78.8-176 176-176c39.9 0 76.8 13.3 106.3 35.7zM149.7 396.3L396.3 149.7C418.7 179.2 432 216.1 432 256c0 97.2-78.8 176-176 176c-39.9 0-76.8-13.3-106.3-35.7z'
									}
									fill={'currentcolor'}
								/>
							</svg>
							<p className={'mt-6 text-sm text-neutral-500'}>{"Oh no, we couldn't find any token!"}</p>
						</div>
					) : (
						<div className={'grid grid-cols-1 divide-y divide-primary-50 rounded-md md:grid-cols-1'}>
							{balancesToDisplay.map(
								([address, balance]: [string, TBalanceData], index): ReactElement => (
									<div key={`${address}-${chainID}-${balance.symbol}-${index}`}>
										<TableLine
											index={10_000 - index}
											balance={balance}
											tokenAddress={toAddress(address)}
										/>
									</div>
								)
							)}
						</div>
					)}
				</div>
			</div>

			<div
				className={
					'sticky inset-x-0 bottom-0 z-20 flex w-full max-w-5xl flex-row items-center justify-between rounded-b-md bg-primary-600 p-4 text-primary-0 md:relative md:px-6 md:py-4'
				}>
				<div />
				<div>
					<Button
						variant={'reverted-alt'}
						isDisabled={!isActive || Object.keys(selected).length === 0 || !isValid}
						onClick={onProceed}>
						{'Migrate selected'}
					</Button>
				</div>
			</div>
		</section>
	);
});

export default ViewTable;
