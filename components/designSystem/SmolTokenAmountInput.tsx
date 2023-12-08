import React, {useCallback, useRef, useState} from 'react';
import {IconChevron} from '@icons/IconChevron';
import {useAsyncAbortable} from '@react-hookz/web';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {ImageWithFallback} from '@common/ImageWithFallback';

import type {ReactElement} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/types';
import type {TToken} from '@utils/types/types';

type TTokenAmountInputLike = {
	amount: string | undefined;
	label: string;
	isValid: boolean | 'undetermined';
	error?: string | undefined;
};

export const defaultTokenInputLike = {
	amount: undefined,
	label: '',
	isValid: false
};

type TTokenAmountInput = {
	showPercentButtons?: boolean;
	tokens: TToken[];
};

const percentIntervals = [25, 50, 75, 100];

export function SmolTokenAmountInput({showPercentButtons = false, tokens}: TTokenAmountInput): ReactElement {
	const [, set_isFocused] = useState<boolean>(false);
	const [value, set_value] = useState<TTokenAmountInputLike>(defaultTokenInputLike);
	const currentAmount = useRef<TAddress | undefined>(defaultTokenInputLike.amount);

	const [selectedToken] = useState<TToken | undefined>(tokens.at(0));

	const [{status}, actions] = useAsyncAbortable(
		async (signal, input: string): Promise<void> =>
			new Promise<void>(async (resolve, reject): Promise<void> => {
				if (signal.aborted) {
					console.warn('aborted');
					reject(new Error('Aborted!'));
				} else {
					currentAmount.current = undefined;

					if (input === '') {
						set_value(defaultTokenInputLike);
						return resolve();
					}

					if (+input > 0) {
						set_value({amount: input, label: input, isValid: 'undetermined'});
						return resolve();
					}
					currentAmount.current = undefined;

					set_value({amount: undefined, label: input, isValid: false, error: 'Token amount should be > 0'});
					resolve();
				}
			}),
		undefined
	);

	const onChange = useCallback(
		(label: string): void => {
			actions.abort();
			actions.execute(label);
		},
		[actions]
	);

	return (
		<div className={'relative h-full w-full rounded-lg p-[1px]'}>
			<div
				className={cl(
					'absolute inset-0 z-0 rounded-[9px]',
					status === 'loading' ? 'borderPulse' : 'bg-neutral-300'
				)}
			/>
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
						value={currentAmount.current}
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
						) : (
							<p>{'You have 42000.696969'}</p>
						)}

						<button className={'rounded-md px-2 py-1 transition-colors hover:bg-neutral-200'}>
							{'MAX'}
						</button>
					</div>
				</div>
				<button
					className={cl(
						'flex items-center rounded-lg p-4 max-w-[176px] w-full',
						'bg-neutral-100 hover:bg-neutral-200 transition-colors'
					)}>
					<div className={'flex w-full gap-2'}>
						<div className={'h-6 w-6 min-w-[24px]'}>
							<ImageWithFallback
								alt={selectedToken?.name || ''}
								unoptimized={!selectedToken?.logoURI?.includes('assets.smold.app') || true}
								src={
									selectedToken?.logoURI?.includes('assets.smold.app')
										? `${process.env.SMOL_ASSETS_URL}/token/${selectedToken.chainID}/${selectedToken.address}/logo-32.png`
										: selectedToken?.logoURI || ''
								}
								width={24}
								height={24}
							/>
						</div>
						<p className={'truncate font-bold'}>{'DAI'}</p>
					</div>

					<IconChevron className={'h-4 w-4 text-neutral-900'} />
				</button>
			</label>
		</div>
	);
}
