import React, {Fragment, memo, useCallback, useMemo, useState} from 'react';
import IconCheck from 'components/icons/IconCheck';
import IconCircleCross from 'components/icons/IconCircleCross';
import IconSquareMinus from 'components/icons/IconSquareMinus';
import IconSquarePlus from 'components/icons/IconSquarePlus';
import IconWarning from 'components/icons/IconWarning';
import {useWallet} from 'contexts/useWallet';
import {handleInputChangeEventValue} from 'utils/handleInputChangeEventValue';
import {checkENSValidity} from 'utils/tools.ens';
import {checkLensValidity} from 'utils/tools.lens';
import {newVoidRow, useDisperse} from '@disperse/useDisperse';
import {useMountEffect, useUpdateEffect} from '@react-hookz/web';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {IconLoader} from '@yearn-finance/web-lib/icons/IconLoader';
import {isZeroAddress, toAddress} from '@yearn-finance/web-lib/utils/address';
import {parseUnits, toBigInt, toNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';
import {performBatchedUpdates} from '@yearn-finance/web-lib/utils/performBatchedUpdates';

import type {TTokenInfo} from 'contexts/useTokenList';
import type {ChangeEvent, ReactElement} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/types';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import type {TDisperseElement} from '@disperse/useDisperse';

type TAddressLikeInput = {
	uuid: string;
	label: string;
	onChangeLabel: (label: string) => void;
	onChange: (address: string | undefined) => void;
	onPaste: (UUID: string, pasted: string) => void;
	isDuplicate?: boolean;
}
function AddressLikeInput({uuid, label, onChangeLabel, onChange, onPaste, isDuplicate}: TAddressLikeInput): ReactElement {
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

	const looksValidAddress = useCallback((value: string): boolean => {
		if (value.endsWith('.eth')) {
			return true;
		} if (value.endsWith('.lens')) {
			return true;
		} if (!isZeroAddress(toAddress(value))) {
			return true;
		}
		return false;
	}, []);

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
					onPaste={(e): void => {
						const value = e.clipboardData.getData('text/plain');
						const isValidValue = looksValidAddress(value);
						if (isValidValue) {
							set_isValidDestination('undetermined');
							return;
						}
						onPaste(uuid, value);
					}}
					onChange={(e): void => {
						set_isValidDestination('undetermined');
						onChangeLabel(e.target.value);
					}}
					className={'smol--input font-mono font-bold'}
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

function AmountToSendInput({token, amount, onChange}: {
	token: TTokenInfo | undefined,
	amount: TNormalizedBN | undefined,
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
					className={'smol--input font-mono font-bold'}
					type={'number'}
					onWheel={(e): void => e.preventDefault()}
					min={0}
					step={1 / 10 ** (token?.decimals || 18)}
					inputMode={'numeric'}
					placeholder={'0'}
					pattern={'^((?:0|[1-9]+)(?:.(?:d+?[1-9]|[1-9]))?)$'}
					onChange={onInputChange}
					value={amount?.normalized} />
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
		if (disperseArray.length === 1) {
			return set_disperseArray([newVoidRow()]);
		}
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
	function onHandleMultiplePaste(UUID: string, pasted: string): void {
		console.log(UUID, pasted);
		const separators = [' ', '-', ';', ',', '.'];
		const addressAmounts = pasted.replaceAll(' ', '').replaceAll('\t', '').split('\n').map((line): [string, string] => {
			//remove all separators that are next to each other
			let cleanedLine = separators.reduce((acc, separator): string => acc.replaceAll(separator + separator, separator), line);
			for (let i = 0; i < 3; i++) {
				cleanedLine = separators.reduce((acc, separator): string => acc.replaceAll(separator + separator, separator), cleanedLine);
			}

			const addressAmount = cleanedLine.split(separators.find((separator): boolean => cleanedLine.includes(separator)) ?? ' ');
			return [addressAmount[0], addressAmount[1]];
		});
		const newRows = addressAmounts.map((addressAmount): TDisperseElement => {
			const row = newVoidRow();
			row.address = toAddress(addressAmount[0]);
			row.label = String(addressAmount[0]);
			try {
				if (addressAmount[1].includes('.') || addressAmount[1].includes(',')) {
					const normalizedAmount = Number(addressAmount[1]);
					const raw = parseUnits(normalizedAmount, tokenToDisperse?.decimals || 18);
					const amount = toNormalizedBN(raw, tokenToDisperse?.decimals || 18);
					row.amount = amount;
				} else {
					const amount = toNormalizedBN(addressAmount[1], tokenToDisperse?.decimals || 18);
					row.amount = amount;
				}
			} catch (e) {
				row.amount = toNormalizedBN(0n, tokenToDisperse?.decimals || 18);
			}
			return row;
		});
		const excludingEmptyRows = newRows.filter((row): boolean => Boolean(
			row.address &&
			row.amount &&
			!isZeroAddress(row.address) &&
			toBigInt(row.amount?.raw) !== 0n
		));
		set_disperseArray(
			disperseArray.reduce((acc, row): TDisperseElement[] => {
				if (row.UUID === UUID) {
					if (row.address && row.amount && !isZeroAddress(row.address) && row.amount.raw !== 0n) {
						return [...acc, row, ...excludingEmptyRows];
					}
					return [...acc, ...excludingEmptyRows];
				}
				return [...acc, row];
			}, [] as TDisperseElement[]));
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
		if (isZeroAddress(tokenToDisperse?.address)) {
			return 0;
		}
		const balance = balances?.[toAddress(tokenToDisperse?.address)]?.normalized;
		return balance || 0;
	}, [balances, tokenToDisperse]);

	const totalToDisperse = useMemo((): number => {
		return disperseArray.reduce((acc, row): number => acc + Number(row.amount?.normalized || 0), 0);
	}, [disperseArray]);
	const isAboveBalance = totalToDisperse > balanceOf;

	return (
		<section className={'box-0'}>
			<div className={'relative w-full'}>
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
						{disperseArray.map(({UUID}, i): ReactElement => {
							return (
								<Fragment key={UUID}>
									<AddressLikeInput
										uuid={UUID}
										isDuplicate={checkAlreadyExists(UUID, toAddress(disperseArray[i].address))}
										label={disperseArray[i].label}
										onChangeLabel={(label): void => onUpdateLabelByUUID(UUID, label)}
										onChange={(address): void => onUpdateAddressByUUID(UUID, address)}
										onPaste={onHandleMultiplePaste} />
									<div className={'flex flex-row items-center justify-center space-x-4'}>
										<AmountToSendInput
											token={tokenToDisperse}
											amount={disperseArray[i].amount}
											onChange={(amount): void => onUpdateAmountByUUID(UUID, amount)} />
										<IconSquareMinus
											onClick={(): void => onRemoveRowByUUID(UUID)}
											className={'h-4 w-4 cursor-pointer text-neutral-400 transition-colors hover:text-neutral-900'} />
										<IconSquarePlus
											onClick={(): void => onAddNewRowAsSibling(UUID)}
											className={'h-4 w-4 cursor-pointer text-neutral-400 transition-colors hover:text-neutral-900'} />
									</div>
								</Fragment>
							);
						})}
					</div>
				</div>
				<div className={'sticky inset-x-0 bottom-0 z-20 flex w-full max-w-5xl flex-row items-center justify-between rounded-b-[5px] bg-primary-600 p-4 text-primary-0 md:relative md:px-6 md:py-4'}>
					<div className={'flex w-3/4 flex-col'}>
						<dl className={'container whitespace-nowrap text-xs'}>
							<dt>{'You have'}</dt>
							<span className={'filler'} />
							<dd suppressHydrationWarning>
								{`${formatAmount(balanceOf, tokenToDisperse?.decimals || 18)} ${tokenToDisperse?.symbol || ''}`}
							</dd>
						</dl>
						<dl className={'container whitespace-nowrap text-xs'}>
							<dt>{'You are sending'}</dt>
							<span className={'filler'} />
							<dd suppressHydrationWarning className={isAboveBalance ? 'text-[#FE0000]' : ''}>
								{`${formatAmount(totalToDisperse, tokenToDisperse?.decimals || 18)} ${tokenToDisperse?.symbol || ''}`}
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
