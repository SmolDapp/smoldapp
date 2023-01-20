import React, {useMemo, useState} from 'react';
import ListHead from 'components/ListHead';
import {useSelected} from 'contexts/useSelected';
import {useWallet} from 'contexts/useWallet';
import {ethers} from 'ethers';
import {transfer} from 'utils/actions/transferToken';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {hooks} from '@yearn-finance/web-lib/hooks';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {toAddress, truncateHex} from '@yearn-finance/web-lib/utils/address';
import {toNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';
import {defaultTxStatus, Transaction} from '@yearn-finance/web-lib/utils/web3/transaction';

import {ImageWithFallback} from '../ImageWithFallback';

import type {TMinBalanceData} from 'hooks/useBalances';
import type {ChangeEvent, ReactElement} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/utils/address';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import type {TDict} from '@yearn-finance/web-lib/utils/types';

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

function	List({address, balance}: {balance: TMinBalanceData, address: TAddress}): ReactElement {
	const {selected, set_selected, amounts, set_amounts, destinationAddress} = useSelected();
	const {refresh} = useWallet();
	const {provider, isActive} = useWeb3();
	const {safeChainID} = useChainID();
	const [txStatus, set_txStatus] = useState(defaultTxStatus);
	const [amountToKeep, set_amountToKeep] = useState(toNormalizedBN(0));

	const isSelected = useMemo((): boolean => selected.includes(address), [selected, address]);

	async function	onTransfer(): Promise<void> {
		try {
			new Transaction(provider, transfer, set_txStatus).populate(
				toAddress(address),
				toAddress(destinationAddress),
				amounts[toAddress(address)]?.raw
			).onSuccess(async (): Promise<void> => {
				await refresh([
					{
						token: toAddress(address),
						decimals: balance.decimals,
						symbol: balance.symbol
					}
				]);
				performBatchedUpdates((): void => {
					set_amounts((amounts: TDict<TNormalizedBN>): TDict<TNormalizedBN> => ({
						...amounts,
						[address]: toNormalizedBN(0)
					}));
					set_selected(selected.filter((item: TAddress): boolean => item !== address));
				});

			}).perform();
		} catch (error) {
			console.error(error);
		}
	}
	// transfer

	hooks.useMountEffect((): void => {
		if (amounts[toAddress(address)] === undefined) {
			set_amounts((amounts: TDict<TNormalizedBN>): TDict<TNormalizedBN> => ({
				...amounts,
				[address]: toNormalizedBN(balance.raw)
			}));
		}
	});

	return (
		<div
			onClick={(): void => set_selected(isSelected ? selected.filter((item: TAddress): boolean => item !== address) : [...selected, address])}
			className={`yearn--table-wrapper group relative border-x-2 border-y-0 border-solid pb-2 text-left hover:bg-neutral-100/50 ${isSelected ? 'border-neutral-900' : 'border-transparent'}`}>
			<div className={'absolute left-3 top-7 z-10 flex h-full justify-center md:left-4 md:top-0 md:items-center'}>
				<input
					type={'checkbox'}
					checked={isSelected}
					onChange={(): void => set_selected(isSelected ? selected.filter((item: TAddress): boolean => item !== address) : [...selected, address])}
					className={'checkbox cursor-pointer'} />
			</div>
			<div className={'yearn--table-token-section h-14 border-r border-neutral-200 pl-6'}>
				<div className={'yearn--table-token-section-item'}>
					<div className={'yearn--table-token-section-item-image'}>
						<ImageWithFallback
							alt={''}
							width={40}
							height={40}
							quality={90}
							src={`https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/multichain-tokens/${safeChainID}/${toAddress(address)}/logo-128.png`}
							loading={'eager'} />
					</div>
					<div>
						<b>{balance.symbol}</b>
						<p className={'font-mono text-xs text-neutral-500'}>{truncateHex(address, 10)}</p>
					</div>
				</div>
			</div>


			<div className={'yearn--table-data-section'}>
				<div className={'yearn--table-data-section-item md:col-span-5 md:pl-6'} datatype={'number'}>
					<label className={'yearn--table-data-section-item-label'}>{'Keep in wallet'}</label>
					<div className={'box-100 flex h-10 w-full items-center p-2'}>
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
								value={amountToKeep.normalized ?? '0'}
								onChange={(e: ChangeEvent<HTMLInputElement>): void => {
									let	newAmountToKeep = handleInputChangeEventValue(e, balance?.decimals || 18);
									if (newAmountToKeep.raw.gt(balance.raw)) {
										newAmountToKeep = balance;
									}
									const	newAmount = toNormalizedBN(balance.raw.sub(newAmountToKeep.raw));
									performBatchedUpdates((): void => {
										set_amountToKeep(newAmountToKeep);
										set_amounts((amounts): TDict<TNormalizedBN> => ({...amounts, [address]: newAmount}));
									});

								}} />
							<button
								onClick={(): void => {
									performBatchedUpdates((): void => {
										set_amountToKeep(balance);
										set_amounts((amounts): TDict<TNormalizedBN> => ({...amounts, [address]: toNormalizedBN(0)}));
									});
								}}
								className={'ml-2 cursor-pointer border border-neutral-900 bg-neutral-0 px-1.5 py-0.5 text-xxs text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-neutral-0'}>
								{'max'}
							</button>
						</div>
					</div>
				</div>

				<div className={'yearn--table-data-section-item md:col-span-5 md:px-6'} datatype={'number'}>
					<label className={'yearn--table-data-section-item-label'}>{'Move to new wallet'}</label>
					<div className={'box-100 flex h-10 w-full items-center p-2'}>
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
								value={amounts[toAddress(address)]?.normalized ?? '0'}
								onChange={(e: ChangeEvent<HTMLInputElement>): void => {
									let	newAmount = handleInputChangeEventValue(e, balance?.decimals || 18);
									if (newAmount.raw.gt(balance.raw)) {
										newAmount = balance;
									}
									console.log(newAmount);
									performBatchedUpdates((): void => {
										set_amountToKeep(toNormalizedBN(balance.raw.sub(newAmount.raw)));
										set_amounts((amounts): TDict<TNormalizedBN> => ({...amounts, [address]: newAmount}));
									});
								}} />
							<button
								onClick={(): void => {
									performBatchedUpdates((): void => {
										set_amountToKeep(toNormalizedBN(0));
										set_amounts((amounts): TDict<TNormalizedBN> => ({...amounts, [address]: balance}));
									});
								}}
								className={'ml-2 cursor-pointer border border-neutral-900 bg-neutral-0 px-1.5 py-0.5 text-xxs text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-neutral-0'}>
								{'max'}
							</button>
						</div>
					</div>
				</div>

				<div className={'col-span-1 hidden h-8 w-full flex-col justify-center md:col-span-2 md:flex md:h-14'}>
					<Button
						className={'yearn--button-smaller !w-full'}
						isBusy={txStatus.pending}
						isDisabled={!isActive || ((amounts[toAddress(address)]?.raw || ethers.constants.Zero).isZero())}
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

function	ViewTable(): ReactElement {
	const	{selected} = useSelected();
	const	{balances} = useWallet();
	const	[sortBy, set_sortBy] = useState<string>('apy');
	const	[sortDirection, set_sortDirection] = useState<'asc' | 'desc'>('desc');
	const	hasSelected = useMemo((): boolean => selected.length > 0, [selected]);

	const	balancesToDisplay = hooks.useDeepCompareMemo((): ReactElement[] => {
		return (
			Object.entries(balances)
				.filter(([, balance]: [string, TMinBalanceData]): boolean => (
					!balance.raw.isZero()
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
				.map(([address, balance]: [string, TMinBalanceData]): ReactElement => (
					<List
						key={address}
						balance={balance}
						address={toAddress(address)} />
				))
		);
	}, [balances, sortBy, sortDirection]);

	return (
		<div id={'select'} className={'pt-10'}>
			<div className={'box-0 mb-6 grid w-full grid-cols-12 overflow-hidden'}>
				<div className={'col-span-12 flex flex-row border-b border-neutral-200 p-6 text-neutral-900'}>
					<div className={'w-3/4'}>
						<b>{'Select the tokens to migrate'}</b>
						<p className={'text-sm text-neutral-500'}>
							{'Select the tokens you want to migrate to another wallet. You can migrate all your tokens at once or select individual tokens.'}
						</p>
					</div>
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
							{label: 'Keep in wallet', value: 'balance', sortable: false, className: 'col-span-5 md:pl-5', datatype: 'text'},
							{label: 'Move to new wallet', value: '', sortable: false, className: 'col-span-5 md:pl-2', datatype: 'text'},
							{label: '', value: '', sortable: false, className: 'col-span-2'}
						]} />

					<div>
						{balancesToDisplay}
					</div>
				</div>
			</div>

			<div className={`h-40 w-full transition-opacity ${hasSelected ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
				<div className={'mx-auto flex w-full max-w-4xl flex-row items-center justify-between rounded-md bg-neutral-900 p-6 text-neutral-0'}>
					<div className={''}>
						<b>{`Migrate ${selected.length} tokens`}</b>
					</div>
					<div>
						<Button
							className={'yearn--button-smaller !w-[160px] !text-sm'}
							variant={'reverted'}>
							{'Migrate selected'}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
export default ViewTable;
