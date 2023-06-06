import React, {Fragment, memo, useCallback, useMemo, useState} from 'react';
import IconCheck from 'components/icons/IconCheck';
import IconCircleCross from 'components/icons/IconCircleCross';
import IconSquareMinus from 'components/icons/IconSquareMinus';
import IconSquarePlus from 'components/icons/IconSquarePlus';
import IconWarning from 'components/icons/IconWarning';
import {useWallet} from 'contexts/useWallet';
import {handleInputChangeEventValue} from 'utils/handleInputChangeEventValue';
import lensProtocol from 'utils/lens.tools';
import {isAddress} from 'viem';
import {newVoidRow, useDisperse} from '@disperse/useDisperse';
import {useMountEffect, useUpdateEffect} from '@react-hookz/web';
import {fetchEnsAddress} from '@wagmi/core';
import {Button} from '@yearn-finance/web-lib/components/Button';
import IconLoader from '@yearn-finance/web-lib/icons/IconLoader';
import {isZeroAddress, toAddress} from '@yearn-finance/web-lib/utils/address';
import {toBigInt} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';

import type {TTokenInfo} from 'contexts/useTokenList';
import type {ChangeEvent, ReactElement} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/types';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import type {TDisperseElement} from '@disperse/useDisperse';

async function checkENSValidity(ens: string): Promise<[TAddress, boolean]> {
	const resolvedAddress = await fetchEnsAddress({name: ens, chainId: 1});
	if (resolvedAddress) {
		if (isAddress(resolvedAddress)) {
			return [toAddress(resolvedAddress), true];
		}
	}
	return [toAddress(), false];
}

async function checkLensValidity(lens: string): Promise<[TAddress, boolean]> {
	const resolvedName = await lensProtocol.getAddressFromHandle(lens);
	if (resolvedName) {
		if (isAddress(resolvedName)) {
			return [toAddress(resolvedName), true];
		}
	}
	return [toAddress(), false];
}

type TAddressLikeInput = {
	uuid: string;
	label: string;
	onChangeLabel: (label: string) => void;
	onChange: (address: string | undefined) => void;
	isDuplicate?: boolean;
}
function AddressLikeInput({uuid, label, onChangeLabel, onChange, isDuplicate}: TAddressLikeInput): ReactElement {
	const [isValidDestination, set_isValidDestination] = useState<boolean | 'undetermined'>('undetermined');
	const [isValidish, set_isValidish] = useState<boolean | 'undetermined'>('undetermined');
	const [isLoadingValidish, set_isLoadingValidish] = useState<boolean>(false);
	const status = useMemo((): 'valid' | 'invalid' | 'warning' | 'pending' | 'none' => {
		if ((isValidDestination === true || isValidish === true) && !isDuplicate) {
			return 'valid';
		}
		if (isValidDestination === false && label !== '' && !isLoadingValidish) {
			return 'invalid';
		}
		if (isDuplicate) {
			return 'warning';
		}
		if (isLoadingValidish) {
			return 'pending';
		}
		return 'none';
	}, [isValidDestination, isValidish, isDuplicate, label, isLoadingValidish]);

	useUpdateEffect((): void => {
		set_isValidDestination('undetermined');
		set_isValidish('undetermined');
		if (label.endsWith('.eth')) {
			set_isLoadingValidish(true);
			checkENSValidity(label).then(([validishDest, isValid]): void => {
				performBatchedUpdates((): void => {
					set_isLoadingValidish(false);
					set_isValidish(isValid);
					set_isValidDestination(isValid);
					onChange(validishDest);
				});
			});
		} else if (label.endsWith('.lens')) {
			set_isLoadingValidish(true);
			checkLensValidity(label).then(([validishDest, isValid]): void => {
				performBatchedUpdates((): void => {
					set_isLoadingValidish(false);
					set_isValidish(isValid);
					set_isValidDestination(isValid);
					onChange(validishDest);
				});
			});
		} else if (!isZeroAddress(toAddress(label))) {
			set_isValidDestination(true);
			onChange(label);
		} else {
			set_isValidish(false);
			onChange(undefined);
		}
	}, [label]);

	return (
		<div className={'box-0 flex h-10 w-full items-center p-2'}>
			<div className={'flex h-10 w-full flex-row items-center justify-between px-0 py-4'}>
				<input
					id={`address_input_${uuid}`}
					aria-invalid={!isValidDestination}
					required
					spellCheck={false}
					placeholder={'0x...'}
					value={label}
					onChange={(e): void => {
						set_isValidDestination('undetermined');
						onChangeLabel(e.target.value);
					}}
					className={'w-full overflow-x-scroll border-none bg-transparent px-0 py-4 font-mono text-sm font-bold outline-none scrollbar-none'}
					type={'text'} />
			</div>
			<label
				htmlFor={`address_input_${uuid}`}
				className={status === 'invalid' || status === 'warning' ? 'relative' : 'pointer-events-none relative h-4 w-4'}>
				<span className={status === 'invalid' || status === 'warning' ? 'tooltip' : 'pointer-events-none'}>
					<div className={'pointer-events-none relative h-4 w-4'}>
						<IconCheck
							className={`absolute h-4 w-4 text-[#16a34a] transition-opacity ${status === 'valid' ? 'opacity-100' : 'opacity-0'}`} />
						<IconCircleCross
							className={`absolute h-4 w-4 text-[#e11d48] transition-opacity ${status === 'invalid' ? 'opacity-100' : 'opacity-0'}`} />
						<IconWarning
							className={`absolute h-4 w-4 text-[#e1891d] transition-opacity ${status === 'warning' ? 'opacity-100' : 'opacity-0'}`} />
						<div className={'absolute inset-0 flex items-center justify-center'}>
							<IconLoader className={`h-4 w-4 animate-spin text-neutral-900 transition-opacity ${status === 'pending' ? 'opacity-100' : 'opacity-0'}`} />
						</div>
					</div>
					<span className={'tooltiptextsmall'}>
						{status === 'invalid' && 'This address is invalid'}
						{status === 'warning' && 'This address is already in use'}
					</span>
				</span>
			</label>
		</div>
	);
}

function AmountToSendInput({token, amountToSend, onChange}: {
	token: TTokenInfo,
	amountToSend: TNormalizedBN | undefined,
	onChange: (amount: TNormalizedBN) => void
}): ReactElement {
	/**********************************************************************************************
	** onInputChange is triggered when the user is typing in the input field. It updates the
	** amount in the state and triggers the debounced retrieval of the quote from the Cowswap API.
	** It is set as callback to avoid unnecessary re-renders.
	**********************************************************************************************/
	const onInputChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
		onChange(handleInputChangeEventValue(e, token?.decimals || 18));
	}, [onChange, token?.decimals]);

	return (
		<div key={token?.address} className={'box-0 flex h-10 w-full items-center p-2'}>
			<div className={'flex h-10 w-full flex-row items-center justify-between px-0 py-4'}>
				<input
					className={'w-full overflow-x-scroll border-none bg-transparent px-0 py-4 font-mono text-sm font-bold outline-none scrollbar-none'}
					type={'number'}
					min={0}
					step={1 / 10 ** (token.decimals || 18)}
					inputMode={'numeric'}
					placeholder={'0'}
					pattern={'^((?:0|[1-9]+)(?:.(?:d+?[1-9]|[1-9]))?)$'}
					value={amountToSend?.normalized ?? ''}
					onChange={onInputChange} />
			</div>
		</div>
	);
}

const ViewTable = memo(function ViewTable({onProceed}: {onProceed: VoidFunction}): ReactElement {
	const {balances} = useWallet();
	const {tokenToDisperse, disperseArray, set_disperseArray} = useDisperse();

	useMountEffect((): void => {
		set_disperseArray([newVoidRow(), newVoidRow()]);
	});

	const checkAlreadyExists = useCallback((UUID: string, address: TAddress): boolean => {
		if (isZeroAddress(address)) {
			return false;
		}
		return disperseArray.some((row): boolean => row.UUID !== UUID && row.address === address);
	}, [disperseArray]);

	function onAddNewRowAsSibling(UUID: string): void {
		set_disperseArray(
			disperseArray.reduce((acc, row): TDisperseElement[] => {
				if (row.UUID === UUID) {
					return [...acc, row, newVoidRow()];
				}
				return [...acc, row];
			}, [] as TDisperseElement[]));
	}
	function onRemoveRowByUUID(UUID: string): void {
		set_disperseArray(disperseArray.filter((row): boolean => row.UUID !== UUID));
	}
	function onUpdateAddressByUUID(UUID: string, address: string | undefined): void {
		set_disperseArray(disperseArray.map((row): TDisperseElement => {
			if (row.UUID !== UUID) {
				return row;
			}
			if (!address || isZeroAddress(address)) {
				return {...row, address: undefined};
			}
			return {...row, address: toAddress(address)};
		}));
	}
	function onUpdateLabelByUUID(UUID: string, label: string): void {
		set_disperseArray(disperseArray.map((row): TDisperseElement => {
			if (row.UUID !== UUID) {
				return row;
			}
			return {...row, label};
		}));
	}
	function onUpdateAmountByUUID(UUID: string, amount: TNormalizedBN): void {
		set_disperseArray(disperseArray.map((row): TDisperseElement => {
			if (row.UUID !== UUID) {
				return row;
			}
			return {...row, amount};
		}));
	}

	const isValid = useMemo((): boolean => {
		return disperseArray.every((row): boolean => {
			if (!row.label && !row.address && toBigInt(row.amount?.raw) === 0n) {
				return false;
			}
			if (!row.address || isZeroAddress(row.address)) {
				return false;
			}
			if (checkAlreadyExists(row.UUID, row.address)) {
				return false;
			}
			if (!row.amount || row.amount.raw === 0n) {
				return false;
			}
			return true;
		});
	}, [disperseArray, checkAlreadyExists]);

	const balanceOf = useMemo((): number => {
		const balance = balances?.[tokenToDisperse.address]?.normalized;
		return balance || 0;
	}, [balances, tokenToDisperse]);
	const totalToDisperse = useMemo((): number => {
		return disperseArray.reduce((acc, row): number => acc + Number(row.amount?.normalized || 0), 0);
	}, [disperseArray]);
	const isAboveBalance = totalToDisperse > balanceOf;

	return (
		<section>
			<div className={'box-0 relative w-full'}>
				<div className={'flex flex-col p-4 text-neutral-900 md:p-6 md:pb-4'}>
					<div className={'w-full md:w-3/4'}>
						<b>{'Who gets what?'}</b>
						<p className={'text-sm text-neutral-500'}>
							{'Drop the wallet, ENS, or Lens handle of who you want to receive the tokens, and enter the amount each address should receive. Add more receivers by clicking the +. Clicking is fun.'}
						</p>
					</div>
				</div>

				<div className={'border-t border-neutral-200 p-6'}>
					<div className={'mb-2 grid grid-cols-2 gap-4'}>
						<p className={'text-xs text-neutral-500'}>{'Receivers'}</p>
						<p className={'text-xs text-neutral-500'}>{'Amount'}</p>
					</div>
					<div className={'grid grid-cols-2 gap-x-4 gap-y-2'}>
						{disperseArray.map(({UUID}, i): ReactElement => (
							<Fragment key={UUID}>
								<AddressLikeInput
									uuid={UUID}
									isDuplicate={checkAlreadyExists(UUID, toAddress(disperseArray[i].address))}
									label={disperseArray[i].label}
									onChangeLabel={(label): void => onUpdateLabelByUUID(UUID, label)}
									onChange={(address): void => onUpdateAddressByUUID(UUID, address)} />
								<div className={'flex flex-row items-center justify-center space-x-4'}>
									<AmountToSendInput
										token={tokenToDisperse}
										amountToSend={disperseArray[i].amount}
										onChange={(amount): void => onUpdateAmountByUUID(UUID, amount)} />
									<IconSquareMinus
										onClick={(): void => onRemoveRowByUUID(UUID)}
										className={'h-4 w-4 cursor-pointer text-neutral-400 transition-colors hover:text-neutral-900'} />
									<IconSquarePlus
										onClick={(): void => onAddNewRowAsSibling(UUID)}
										className={'h-4 w-4 cursor-pointer text-neutral-400 transition-colors hover:text-neutral-900'} />
								</div>
							</Fragment>
						))}
					</div>
				</div>
				<div className={'rounded-b-0 relative col-span-12 flex w-full max-w-4xl flex-row items-center justify-between bg-neutral-900 p-4 text-neutral-0 md:px-6 md:py-4'}>
					<div className={'flex w-3/4 flex-col'}>
						<dl className={'container text-xs'}>
							<dt>{'You have'}</dt>
							<span className={'filler'} />
							<dd suppressHydrationWarning>
								{`${formatAmount(balanceOf, tokenToDisperse.decimals)} ${tokenToDisperse.symbol}`}
							</dd>
						</dl>
						<dl className={'container text-xs'}>
							<dt>{'You are sending'}</dt>
							<span className={'filler'} />
							<dd suppressHydrationWarning className={isAboveBalance ? 'text-[#FE0000]' : ''}>
								{`${formatAmount(totalToDisperse, tokenToDisperse.decimals)} ${tokenToDisperse.symbol}`}
							</dd>
						</dl>
					</div>
					<div className={'flex flex-col'}>
						<Button
							className={'yearn--button !w-fit !px-6 !text-sm'}
							variant={'reverted'}
							isDisabled={isAboveBalance || disperseArray.length === 0 || !isValid}
							onClick={onProceed}>
							{'Confirm'}
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
});

export default ViewTable;
