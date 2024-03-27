import {useCallback, useState} from 'react';
import InputNumber from 'rc-input-number';
import {cl, formatCounterValue, zeroNormalizedBN} from '@builtbymom/web3/utils';
import {useDeepCompareEffect, useUpdateEffect} from '@react-hookz/web';
import {handleLowAmount} from '@utils/helpers';

import {useValidateAmountInput} from './SmolTokenAmountInput';

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
	price: TNormalizedBN | undefined;
};
export function SmolAmountInput({onSetValue, value, token, price}: TAmountInput): ReactElement {
	const [isFocused, set_isFocused] = useState<boolean>(false);
	const {result, validate} = useValidateAmountInput();
	const selectedTokenBalance = token?.balance ?? zeroNormalizedBN;

	const onSetMax = (): void => {
		return onSetValue({
			amount: selectedTokenBalance.display,
			normalizedBigAmount: selectedTokenBalance,
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

	const getErrorOrButton = (): JSX.Element => {
		if (!selectedTokenBalance.normalized) {
			return <p>{'No token selected'}</p>;
		}
		if (!value.amount) {
			return (
				<button
					onClick={onSetMax}
					onMouseDown={e => e.preventDefault()}
					disabled={!token || selectedTokenBalance.raw === 0n}>
					<p>{`You have ${handleLowAmount(selectedTokenBalance, 2, 6)}`}</p>
				</button>
			);
		}
		if (value.error) {
			return <p className={'text-red'}>{value.error}</p>;
		}

		return <p>{formatCounterValue(value.normalizedBigAmount.normalized, price?.normalized ?? 0)}</p>;
	};

	/** Set the validation result to the context */
	useDeepCompareEffect(() => {
		if (!result) {
			return;
		}
		onSetValue(result);
	}, [result]);

	/** Validate the field when token changes. Only filled inputs should be validated */
	useUpdateEffect(() => {
		if (!value.amount) {
			return;
		}
		validate(value.amount, token);
	}, [token?.address]);

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
						<InputNumber
							prefixCls={cl(
								'w-full border-none bg-transparent p-0 text-xl transition-all',
								'text-neutral-900 placeholder:text-neutral-400 focus:placeholder:text-neutral-400/30',
								'placeholder:transition-colors overflow-hidden'
							)}
							min={'0'}
							step={0.1}
							value={value.amount}
							decimalSeparator={'.'}
							placeholder={'0.00'}
							onChange={value => validate(value || '', token)}
							onFocus={() => set_isFocused(true)}
							onBlur={() => set_isFocused(false)}
						/>
						<div className={'flex items-center justify-between text-xs text-[#ADB1BD]'}>
							{getErrorOrButton()}
						</div>
					</div>
				</label>
			</div>
		</>
	);
}
