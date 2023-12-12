import React, {useState} from 'react';
import {useBalancesCurtain} from 'contexts/useBalancesCurtain';
import useWallet from 'contexts/useWallet';
import {IconChevron} from '@icons/IconChevron';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {parseUnits, toBigInt} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {ImageWithFallback} from '@common/ImageWithFallback';

import type {ReactElement} from 'react';
import type {TToken} from '@utils/types/types';

type TTokenAmountInputLike = {
	amount: string | undefined;
	selectedToken: TToken | undefined;
	isValid: boolean | 'undetermined';
	error?: string | undefined;
};

export const defaultTokenInputLike = {
	amount: '',
	selectedToken: undefined,
	isValid: false
};

type TTokenAmountInput = {
	showPercentButtons?: boolean;
};

const percentIntervals = [25, 50, 75, 100];

export function SmolTokenAmountInput({showPercentButtons = false}: TTokenAmountInput): ReactElement {
	const [, set_isFocused] = useState<boolean>(false);
	const [value, set_value] = useState<TTokenAmountInputLike>(defaultTokenInputLike);

	const {onOpenCurtain} = useBalancesCurtain();

	const {getBalance} = useWallet();

	const {selectedToken} = value;

	const selectedTokenBalance = selectedToken
		? getBalance(selectedToken.address)
		: {
				raw: 0n,
				normalized: 0
			};

	const logoAltSrc = `${process.env.SMOL_ASSETS_URL}/token/${selectedToken?.chainID}/${selectedToken?.address}/logo-32.png`;

	const onChange = (amount: string): void => {
		if (amount === '') {
			return set_value(prev => ({...defaultTokenInputLike, selectedToken: prev.selectedToken}));
		}

		if (+amount > 0) {
			const inputBigInt =
				amount && selectedToken?.decimals ? parseUnits(amount, selectedToken.decimals) : toBigInt(0);

			if (inputBigInt > selectedTokenBalance.raw) {
				return set_value(prev => ({...prev, amount, isValid: false, error: 'Insufficient Balance'}));
			}
			return set_value(prev => ({...prev, amount, isValid: true, error: undefined}));
		}

		set_value(prev => ({
			...prev,
			amount: undefined,
			isValid: false,
			error: 'The amount is invalid'
		}));
	};

	const onClickMax = (): void => {
		set_value(prev => ({
			...prev,
			amount: selectedTokenBalance.normalized.toString(),
			isValid: true,
			error: undefined
		}));
	};

	return (
		<div className={'relative h-full w-full rounded-lg p-[1px]'}>
			<div className={'absolute inset-0 z-0 rounded-[9px] bg-neutral-300'} />
			<label
				className={cl(
					'h-20 w-[444px] z-20 relative',
					'flex flex-row items-center cursor-text',
					'p-2 group bg-neutral-0 rounded-lg'
				)}>
				<div className={'relative w-full pr-2'}>
					<input
						className={cl(
							'w-full border-none bg-transparent p-0 text-xl transition-all',
							'text-neutral-900 placeholder:text-neutral-400 focus:placeholder:text-neutral-400/30',
							'placeholder:transition-colors overflow-hidden',
							'y-2'
						)}
						type={'number'}
						placeholder={'0.00'}
						autoComplete={'off'}
						autoCorrect={'off'}
						spellCheck={'false'}
						value={value.amount}
						onChange={e => onChange(e.target.value)}
						onFocus={() => set_isFocused(true)}
						onBlur={() => set_isFocused(false)}
					/>
					<div className={'flex items-center justify-between text-xs text-[#ADB1BD] '}>
						{value.error ? (
							<p className={cl('transition-all', 'text-red-500')}>{value.error}</p>
						) : showPercentButtons ? (
							<div className={'flex gap-1 '}>
								{percentIntervals.map(percent => (
									<button
										className={'bg-neutral-100 px-1 py-0.5 transition-colors hover:bg-neutral-200'}>
										{percent}
										{'%'}
									</button>
								))}
							</div>
						) : selectedTokenBalance.normalized ? (
							<p>
								{'You have '}
								{selectedTokenBalance.normalized}
							</p>
						) : (
							<p>{'No token selected'}</p>
						)}

						<button
							className={
								'rounded-md px-2 py-1 transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40'
							}
							onClick={onClickMax}
							disabled={!selectedToken}>
							{'MAX'}
						</button>
					</div>
				</div>
				<button
					className={cl(
						'flex items-center gap-4 rounded-lg p-4 max-w-[176px] w-full',
						'bg-neutral-200 hover:bg-neutral-300 transition-colors'
					)}
					onClick={() =>
						onOpenCurtain(selectedToken => set_value(prev => ({...prev, amount: '', selectedToken})))
					}>
					<div className={'flex w-full max-w-[116px] gap-2'}>
						<div className={'h-6 w-6'}>
							<ImageWithFallback
								alt={selectedToken?.symbol || ''}
								unoptimized
								src={selectedToken?.logoURI || logoAltSrc}
								altSrc={logoAltSrc}
								quality={90}
								width={24}
								height={24}
							/>
						</div>
						<p className={cl('truncate', selectedToken?.symbol ? 'font-bold' : '')}>
							{selectedToken?.symbol || 'Select'}
						</p>
					</div>

					<IconChevron className={'h-4 w-4 text-neutral-900'} />
				</button>
			</label>
		</div>
	);
}
