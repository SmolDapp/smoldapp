import React, {useCallback, useState} from 'react';
import {getNewInput} from 'components/sections/Send/useSend';
import {useBalancesCurtain} from 'contexts/useBalancesCurtain';
import useWallet from 'contexts/useWallet';
import {IconChevron} from '@icons/IconChevron';
import {percentOf} from '@utils/tools.math';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {parseUnits, toBigInt, toNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';
import {ImageWithFallback} from '@common/ImageWithFallback';

import type {ReactElement} from 'react';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import type {TToken} from '@utils/types/types';

export type TSendInputElement = {
	amount: TNormalizedBN;
	token: TToken | undefined;
	status: 'pending' | 'success' | 'error' | 'none';
	isValid: boolean | 'undetermined';
	error?: string | undefined;
	UUID: string;
};

export const defaultTokenInputLike: TSendInputElement = getNewInput();

type TTokenAmountInput = {
	showPercentButtons?: boolean;
	onSetValue: (value: Partial<TSendInputElement>) => void;
	value: TSendInputElement;
};

const percentIntervals = [25, 50, 75];

export function SmolTokenAmountInput({showPercentButtons = false, onSetValue, value}: TTokenAmountInput): ReactElement {
	const [isFocused, set_isFocused] = useState<boolean>(false);

	const {onOpenCurtain} = useBalancesCurtain();

	const {getBalance} = useWallet();

	const {token} = value;

	const selectedTokenBalance = token ? getBalance(token.address) : toNormalizedBN(0);

	const onChange = (amount: string): void => {
		if (amount === '') {
			return onSetValue({amount: toNormalizedBN(0), isValid: 'undetermined', error: undefined});
		}

		if (+amount > 0) {
			const inputBigInt = amount && token?.decimals ? parseUnits(amount, token.decimals) : toBigInt(0);

			if (inputBigInt > selectedTokenBalance.raw) {
				return onSetValue({amount: toNormalizedBN(0), isValid: false, error: 'Insufficient Balance'});
			}
			return onSetValue({amount: toNormalizedBN(0), isValid: true, error: undefined});
		}

		onSetValue({
			amount: toNormalizedBN(0),
			isValid: false,
			error: 'The amount is invalid'
		});
	};

	const onSetFractional = (percentage: number): void => {
		if (percentage === 100) {
			return onSetValue({
				amount: selectedTokenBalance,
				isValid: true,
				error: undefined
			});
		}
		onSetValue({
			amount: toNormalizedBN(percentOf(+selectedTokenBalance.normalized, percentage), token?.decimals),
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
		<div className={'relative h-full w-full rounded-lg'}>
			<label
				className={cl(
					'h-20 z-20 relative border transition-all',
					'flex flex-row items-center cursor-text',
					'focus:placeholder:text-neutral-300 placeholder:transition-colors',
					'p-2 group bg-neutral-0 rounded-lg',
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
						value={value.amount.normalized}
						onChange={e => onChange(e.target.value)}
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
								<p>
									{'You have '}
									{formatAmount(selectedTokenBalance.normalized, 0, 6)}
								</p>
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
				<button
					className={cl(
						'flex items-center gap-4 rounded-lg p-4 max-w-[176px] w-full',
						'bg-neutral-200 hover:bg-neutral-300 transition-colors'
					)}
					onClick={() => onOpenCurtain(token => onSetValue({amount: toNormalizedBN(0), token}))}>
					<div className={'flex w-full max-w-[116px] items-center gap-2'}>
						<ImageWithFallback
							alt={token?.symbol || ''}
							unoptimized
							src={token?.logoURI || ''}
							quality={90}
							width={32}
							height={32}
						/>
						<p className={cl('truncate font-bold ', token?.symbol ? '' : 'text-neutral-600')}>
							{token?.symbol || 'Select'}
						</p>
					</div>

					<IconChevron className={'h-4 w-4 text-neutral-600'} />
				</button>
			</label>
		</div>
	);
}
