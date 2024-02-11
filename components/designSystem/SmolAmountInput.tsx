import {useCallback, useState} from 'react';
import {
	cl,
	fromNormalized,
	parseUnits,
	percentOf,
	toBigInt,
	toNormalizedBN,
	zeroNormalizedBN
} from '@builtbymom/web3/utils';
import {handleLowAmount} from '@utils/helpers';

import type {ReactElement} from 'react';
import type {TNormalizedBN, TToken} from '@builtbymom/web3/types';

// TODO: move to lib
export type TAmountInputElement = {
	amount: string | undefined;
	normalizedBigAmount: TNormalizedBN;
	status: 'pending' | 'success' | 'error' | 'none';
	isValid: boolean | 'undetermined';
	error?: string | undefined;
};

type TAmountInput = {
	onSetValue: (value: Partial<TAmountInputElement>) => void;
	value: TAmountInputElement;
	token: TToken | undefined;
	initialValue?: Partial<{amount: bigint; token: TToken}>;
};
export function SmolAmountInput({onSetValue, value, token}: TAmountInput): ReactElement {
	const [isFocused, set_isFocused] = useState<boolean>(false);

	const selectedTokenBalance = token?.balance ?? zeroNormalizedBN;
	//const initialTokenBalance = initialValue?.token?.balance ?? zeroNormalizedBN;

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

	const getBorderColor = useCallback((): string => {
		if (isFocused) {
			return 'border-neutral-600';
		}
		if (value.isValid === false) {
			return 'border-red';
		}
		return 'border-neutral-400';
	}, [isFocused, value.isValid]);

	return (
		<>
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
							) : selectedTokenBalance.normalized ? (
								<button
									onClick={() => onSetFractional(100)}
									disabled={!token || selectedTokenBalance.raw === 0n}>
									<p>{`You have ${handleLowAmount(selectedTokenBalance, 2, 6)}`}</p>
								</button>
							) : (
								<p>{'No token selected'}</p>
							)}
						</div>
					</div>
				</label>
			</div>
		</>
	);
}
