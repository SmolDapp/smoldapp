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
import {EmptyListMessage} from '@common/EmptyListMessage';

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
	const {getBalance} = useWallet();
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
						amount: undefined,
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
			<div className={'col-span-12 ml-1 flex w-full flex-row items-center gap-3'}>
				<input
					ref={inputRef}
					type={'checkbox'}
					className={'checkbox cursor-pointer'}
					tabIndex={-1}
					checked={isSelected}
					onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
						if (!event.target.checked || (inputRef as any)?.ariaInvalid === 'true') {
							onSelect(0n);
						} else {
							onSelect(balance.raw);
						}
					}}
				/>
				<TokenInput
					index={index}
					token={tokenList[toAddress(tokenAddress)]}
					placeholder={`${getBalance(tokenAddress).normalized}`}
					value={selected[toAddress(tokenAddress)]?.amount}
					onChange={async v => onSelect(v.raw)}
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
						<b>{'Which tokens do you want to migrate?'}</b>
						<p className={'text-sm text-neutral-500'}>
							{'Select the token(s) that you’d like to migrate.'}
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
						<EmptyListMessage>{"Oh no, we couldn't find any token!"}</EmptyListMessage>
					) : (
						<div className={'grid grid-cols-1'}>
							{balancesToDisplay.map(
								([address, balance]: [string, TBalanceData], index): ReactElement => (
									<div
										key={`${address}-${chainID}-${balance.symbol}-${index}`}
										className={'col-span-12 grid w-full grid-cols-12 gap-4 py-2'}>
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
