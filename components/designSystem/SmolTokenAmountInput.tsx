import React, {useCallback, useState} from 'react';
import {getNewInput} from 'components/sections/Send/useSendFlow';
import InputNumber from 'rc-input-number';
import {useChainID} from '@builtbymom/web3/hooks/useChainID';
import {usePrices} from '@builtbymom/web3/hooks/usePrices';
import {
	cl,
	formatCounterValue,
	fromNormalized,
	percentOf,
	toBigInt,
	toNormalizedBN,
	zeroNormalizedBN
} from '@builtbymom/web3/utils';
import {useDeepCompareEffect, useUpdateEffect} from '@react-hookz/web';
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
};

const percentIntervals = [25, 50, 75];

export function useValidateAmountInput(): {
	validate: (inputValue: string | undefined, token: TToken | undefined) => Partial<TTokenAmountInputElement>;
	result: Partial<TTokenAmountInputElement> | undefined;
} {
	const [result, set_result] = useState<Partial<TTokenAmountInputElement> | undefined>(undefined);

	const validate = (inputValue: string | undefined, token: TToken | undefined): Partial<TTokenAmountInputElement> => {
		if (!inputValue) {
			const result = {
				amount: inputValue,
				normalizedBigAmount: zeroNormalizedBN,
				isValid: false,
				token,
				error: 'The amount is invalid'
			};
			set_result(result);
			return result;
		}

		if (+inputValue > 0) {
			const inputBigInt = inputValue ? fromNormalized(inputValue, token?.decimals || 18) : toBigInt(0);
			const asNormalizedBN = toNormalizedBN(inputBigInt, token?.decimals || 18);

			if (!token?.address) {
				const result = {
					amount: asNormalizedBN.display,
					normalizedBigAmount: asNormalizedBN,
					isValid: false,
					token,
					error: 'No token selected'
				};
				set_result(result);
				return result;
			}

			if (inputBigInt > token.balance.raw) {
				const result = {
					amount: asNormalizedBN.display,
					normalizedBigAmount: asNormalizedBN,
					isValid: false,
					token,
					error: 'Insufficient Balance'
				};
				set_result(result);
				return result;
			}
			const result = {
				amount: asNormalizedBN.display,
				normalizedBigAmount: asNormalizedBN,
				isValid: true,
				token,
				error: undefined
			};
			set_result(result);
			return result;
		}
		const result = {
			amount: '0',
			normalizedBigAmount: zeroNormalizedBN,
			isValid: false,
			token,
			error: 'The amount is invalid'
		};
		set_result(result);
		return result;
	};
	return {validate, result};
}

export function SmolTokenAmountInput({showPercentButtons = false, onSetValue, value}: TTokenAmountInput): ReactElement {
	const {safeChainID} = useChainID();
	const [isFocused, set_isFocused] = useState<boolean>(false);
	const {token: selectedToken} = value;
	const selectedTokenBalance = selectedToken?.balance ?? zeroNormalizedBN;
	const {result, validate} = useValidateAmountInput();

	const {data: prices} = usePrices({tokens: selectedToken ? [selectedToken] : [], chainId: safeChainID});
	const price = prices && selectedToken ? prices[selectedToken.address] : undefined;

	const onSetMax = (): void => {
		return onSetValue({
			amount: selectedTokenBalance.display,
			normalizedBigAmount: selectedTokenBalance,
			isValid: true,
			error: undefined
		});
	};

	const onSetFractional = (percentage: number): void => {
		const calculatedPercent = percentOf(+selectedTokenBalance.normalized, percentage);
		validate(calculatedPercent.toString(), selectedToken);
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

	const getErrorOrButton = (): JSX.Element => {
		if (showPercentButtons) {
			return (
				<div className={'flex gap-1 '}>
					{percentIntervals.map(percent => (
						<button
							className={'rounded-full bg-neutral-200 px-2 py-0.5 transition-colors hover:bg-neutral-300'}
							onClick={() => onSetFractional(percent)}
							onMouseDown={e => e.preventDefault()}>
							{percent}
							{'%'}
						</button>
					))}
				</div>
			);
		}

		if (!selectedTokenBalance.normalized) {
			return <p>{'No token selected'}</p>;
		}

		if (!value.amount) {
			return (
				<button
					onClick={onSetMax}
					onMouseDown={e => e.preventDefault()}
					disabled={!selectedToken || selectedTokenBalance.raw === 0n}>
					<p>{`You have ${handleLowAmount(selectedTokenBalance, 2, 6)}`}</p>
				</button>
			);
		}

		if (value.error) {
			return <p className={'text-red'}>{value.error}</p>;
		}

		return <p>{formatCounterValue(value.normalizedBigAmount.normalized, price?.normalized ?? 0)}</p>;
	};

	useDeepCompareEffect(() => {
		if (!result) {
			return;
		}
		onSetValue(result);
	}, [result]);

	/* Remove selected token on network change */
	useUpdateEffect(() => {
		validate(value.amount, undefined);
	}, [safeChainID]);

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
					<InputNumber
						prefixCls={cl(
							'w-full border-none bg-transparent p-0 text-xl transition-all',
							'text-neutral-900 placeholder:text-neutral-400 focus:placeholder:text-neutral-400/30',
							'placeholder:transition-colors overflow-hidden'
						)}
						placeholder={'0.00'}
						value={value.amount}
						onChange={value => {
							validate(value || '', selectedToken);
						}}
						decimalSeparator={'.'}
						onFocus={() => set_isFocused(true)}
						onBlur={() => set_isFocused(false)}
						min={'0'}
						step={0.1}
					/>
					<div className={'flex items-center justify-between text-xs text-[#ADB1BD]'}>
						{getErrorOrButton()}
						<button
							className={
								'rounded-md px-2 py-1 transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40'
							}
							onClick={onSetMax}
							onMouseDown={e => e.preventDefault()}
							disabled={!selectedToken || selectedTokenBalance.raw === 0n}>
							{'MAX'}
						</button>
					</div>
				</div>
				<div className={'w-full max-w-[176px]'}>
					<SmolTokenSelectorButton
						onSelectToken={token => {
							validate(value.amount, token);
						}}
						token={selectedToken}
					/>
				</div>
			</label>
		</div>
	);
}
