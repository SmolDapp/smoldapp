import React, {useCallback, useState} from 'react';
import {getNewInput} from 'components/sections/Send/useSendFlow';
import {parseUnits} from 'viem';
import {cl, fromNormalized, percentOf, toBigInt, toNormalizedBN, zeroNormalizedBN} from '@builtbymom/web3/utils';
import {useDeepCompareEffect} from '@react-hookz/web';
import {handleLowAmount} from '@utils/helpers';

import {SmolTokenSelectorButton} from './SmolTokenSelectorButton';

import type {ReactElement} from 'react';
import type {TNormalizedBN, TToken} from '@builtbymom/web3/types';

// TODO: move to lib
export type TTokenAmountInputElement = {
	amount: string;
	normalizedBigAmount: TNormalizedBN;
	token: TToken | undefined;
	status: 'pending' | 'success' | 'error' | 'none';
	isValid: boolean | 'undetermined';
	error?: string | undefined;
	UUID: string;
};

export const defaultTokenInputLike: TTokenAmountInputElement = getNewInput();

type TTokenAmountInput = {
	showPercentButtons?: boolean;
	onSetValue: (value: Partial<TTokenAmountInputElement>) => void;
	value: TTokenAmountInputElement;
	initialValue?: Partial<{amount: bigint; token: TToken}>;
};

const percentIntervals = [25, 50, 75];

export function SmolTokenAmountInput({
	showPercentButtons = false,
	onSetValue,
	value,
	initialValue
}: TTokenAmountInput): ReactElement {
	const [isFocused, set_isFocused] = useState<boolean>(false);

	const {token} = value;

	const selectedTokenBalance = token?.balance ?? zeroNormalizedBN;
	const initialTokenBalance = initialValue?.token?.balance ?? zeroNormalizedBN;

	const onChange = (amount: string, balance: TNormalizedBN, token?: TToken): void => {
		if (amount === '') {
			return onSetValue({
				amount,
				normalizedBigAmount: zeroNormalizedBN,
				isValid: false,
				error: 'The amount is invalid'
			});
		}

		if (+amount > 0) {
			const inputBigInt = amount ? fromNormalized(amount, token?.decimals || 18) : toBigInt(0);
			const asNormalizedBN = toNormalizedBN(inputBigInt, token?.decimals || 18);

			if (!token) {
				return onSetValue({
					amount: asNormalizedBN.display,
					normalizedBigAmount: asNormalizedBN,
					isValid: false,
					error: 'No token selected'
				});
			}

			if (inputBigInt > balance.raw) {
				return onSetValue({
					amount: asNormalizedBN.display,
					normalizedBigAmount: asNormalizedBN,
					isValid: false,
					error: 'Insufficient Balance'
				});
			}
			return onSetValue({
				amount: asNormalizedBN.display,
				normalizedBigAmount: asNormalizedBN,
				isValid: true,
				error: undefined
			});
		}

		onSetValue({
			amount: '0',
			normalizedBigAmount: zeroNormalizedBN,
			isValid: false,
			error: 'The amount is invalid'
		});
	};

	const onSetFractional = (percentage: number): void => {
		if (percentage === 100) {
			return onSetValue({
				amount: selectedTokenBalance.display,
				normalizedBigAmount: selectedTokenBalance,
				isValid: true,
				error: undefined
			});
		}

		const calculatedPercent = percentOf(+selectedTokenBalance.normalized, percentage);
		onSetValue({
			amount: calculatedPercent.toString(),
			normalizedBigAmount: toNormalizedBN(
				parseUnits(String(calculatedPercent), token?.decimals || 18),
				token?.decimals || 18
			),
			isValid: true,
			error: undefined
		});
	};

	const onSelectToken = (token: TToken): void => {
		onSetValue({
			token,
			isValid: true,
			error: undefined
		});
	};

	const onSetTokenValue = (valueBigInt: bigint, token: TToken): void => {
		if (token.balance.raw < valueBigInt) {
			return onSetValue({
				normalizedBigAmount: toNormalizedBN(valueBigInt, token?.decimals || 18),
				isValid: false,
				error: 'Insufficient balance'
			});
		}
		onSetValue({
			normalizedBigAmount: toNormalizedBN(valueBigInt, token?.decimals || 18),
			isValid: true,
			error: undefined
		});
	};

	const getBorderColor = useCallback((): string => {
		if (isFocused) {
			return 'border-neutral-600';
		}
		if (value.isValid === false) {
			return 'border-red';
		}
		return 'border-neutral-400';
	}, [isFocused, value.isValid]);

	useDeepCompareEffect(() => {
		if (!initialValue) {
			return;
		}
		if (initialValue.amount && initialValue.token?.address) {
			const normalizedAmount = String(
				toNormalizedBN(initialValue.amount, initialValue?.token?.decimals || 18).normalized
			);
			onSelectToken(initialValue.token);
			onSetTokenValue(initialValue.amount, initialValue.token);

			onChange(normalizedAmount, initialTokenBalance, initialValue.token);
		}
	}, [initialValue, initialTokenBalance]);

	return (
		<div className={'relative size-full rounded-lg'}>
			<label
				className={cl(
					'h-20 z-20 relative border transition-all',
					'flex flex-row items-center cursor-text',
					'focus:placeholder:text-neutral-300 placeholder:transition-colors',
					'p-2 pl-4 group bg-neutral-0 rounded-lg',
					getBorderColor()
				)}>
				<div className={'relative w-full pr-2'}>
					<input
						className={cl(
							'w-full border-none bg-transparent p-0 text-xl transition-all',
							'text-neutral-900 placeholder:text-neutral-400 focus:placeholder:text-neutral-400/30',
							'placeholder:transition-colors overflow-hidden'
						)}
						type={'number'}
						placeholder={'0.00'}
						value={value.amount}
						onChange={e => {
							onChange(e.target.value, selectedTokenBalance, token);
						}}
						max={selectedTokenBalance.normalized}
						onFocus={() => set_isFocused(true)}
						onBlur={() => set_isFocused(false)}
						min={0}
						step={1}
					/>
					<div className={'flex items-center justify-between text-xs text-[#ADB1BD]'}>
						{value.error ? (
							<p className={'text-red'}>{value.error}</p>
						) : showPercentButtons ? (
							<div className={'flex gap-1 '}>
								{percentIntervals.map(percent => (
									<button
										className={
											'rounded-full bg-neutral-200 px-2 py-0.5 transition-colors hover:bg-neutral-300'
										}
										onClick={() => onSetFractional(percent)}>
										{percent}
										{'%'}
									</button>
								))}
							</div>
						) : selectedTokenBalance.normalized ? (
							<button
								onClick={() => onSetFractional(100)}
								disabled={!token || selectedTokenBalance.raw === 0n}>
								<p>{`You have ${handleLowAmount(selectedTokenBalance, 2, 6)}`}</p>
							</button>
						) : (
							<p>{'No token selected'}</p>
						)}

						<button
							className={
								'rounded-md px-2 py-1 transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40'
							}
							onClick={() => onSetFractional(100)}
							disabled={!token || selectedTokenBalance.raw === 0n}>
							{'MAX'}
						</button>
					</div>
				</div>
				<div className={'max-w-[176px]'}>
					<SmolTokenSelectorButton
						onSelectToken={onSelectToken}
						onSetTokenValue={onSetTokenValue}
						token={token}
						amount={value.amount}
					/>
				</div>
			</label>
		</div>
	);
}
