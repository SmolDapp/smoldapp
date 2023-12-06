import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {IconCircleCross} from 'components/icons/IconCircleCross';
import IconInfo from 'components/icons/IconInfo';
import useWallet from 'contexts/useWallet';
import handleInputChangeEventValue from 'utils/handleInputChangeEventValue';
import {useAnimate} from 'framer-motion';
import {useClickOutside} from '@react-hookz/web';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {toNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';
import {getNetwork} from '@yearn-finance/web-lib/utils/wagmi/utils';
import {ImageWithFallback} from '@common/ImageWithFallback';

import type {ChangeEvent, ReactElement} from 'react';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import type {TToken} from '@utils/types/types';

type TViewFromToken = {
	token: TToken;
	value: TNormalizedBN;
	allowance: TNormalizedBN;
	onChange: (value: TNormalizedBN) => void;
	shouldCheckBalance?: boolean;
	shouldCheckAllowance?: boolean;
	isDisabled?: boolean;
	index?: number;
	placeholder?: string;
};
function TokenInput({
	token,
	value,
	onChange,
	allowance,
	shouldCheckAllowance = true,
	shouldCheckBalance = true,
	isDisabled = false,
	placeholder,
	index
}: TViewFromToken): ReactElement {
	const [scope, animate] = useAnimate();
	const inputRef = useRef<HTMLInputElement>(null);
	const {getBalance} = useWallet();

	const balanceOf = useMemo((): TNormalizedBN => {
		return getBalance(toAddress(token?.address));
	}, [getBalance, token?.address]);

	const onChangeAmount = useCallback(
		(e: ChangeEvent<HTMLInputElement>): void => {
			const element = document.getElementById('amountToSend') as HTMLInputElement;
			const newAmount = handleInputChangeEventValue(e, token?.decimals || 18);
			if (newAmount.raw > balanceOf?.raw) {
				if (element?.value) {
					element.value = formatAmount(balanceOf?.normalized, 0, 18);
				}
				return onChange(toNormalizedBN(balanceOf?.raw || 0, token?.decimals || 18));
			}
			onChange(newAmount);
		},
		[balanceOf, onChange, token?.decimals]
	);

	useEffect((): void => {
		animate('button', {opacity: 0, x: 112, pointerEvents: 'none'}, {duration: 0.3});
		animate('span', {opacity: 1, x: 40}, {duration: 0.3});
	}, [animate]);

	useClickOutside(inputRef, (): void => {
		animate('button', {opacity: 0, x: 112, pointerEvents: 'none'}, {duration: 0.3});
		animate('span', {opacity: 1, x: 40}, {duration: 0.3});
	});

	const onFocus = useCallback((): void => {
		animate('button', {opacity: 1, x: 0, pointerEvents: 'auto'}, {duration: 0.3});
		animate('span', {opacity: 1, x: 0}, {duration: 0.3});
	}, [animate]);

	return (
		<div className={'relative flex w-full p-4 transition-colors hover:bg-neutral-50/40 md:pb-4 md:pt-6'}>
			<div className={'grid w-full grid-cols-12 items-center gap-4'}>
				<div className={'col-span-12 flex flex-row items-center space-x-6 md:col-span-8'}>
					<ImageWithFallback
						alt={`${token.address}_${token.name}_${token.symbol}`}
						width={40}
						height={40}
						quality={90}
						className={'h-6 w-6 md:h-10 md:w-10 md:min-w-[40px]'}
						unoptimized
						src={`${process.env.SMOL_ASSETS_URL}/token/${token.chainID}/${token.address}/logo-128.png`}
						altSrc={token.logoURI || ''}
					/>
					<div>
						<p className={'text-sm'}>
							<span className={'font-medium'}>{token.name}</span>
							<span className={'text-xs text-neutral-600'}>{` - (${token.symbol})`}</span>
						</p>
						<span
							className={
								'font-number mt-2 block !font-mono text-xxs text-neutral-600 transition-colors md:text-xs'
							}>
							<a
								href={`${getNetwork(token.chainID).blockExplorers}/token/${token.address}`}
								target={'_blank'}
								rel={'noreferrer'}
								className={'cursor-alias font-mono hover:text-neutral-900 hover:underline'}>
								{token.address}
							</a>
						</span>
					</div>
				</div>

				<div className={'col-span-12 flex flex-row items-center space-x-6 md:col-span-4'}>
					<div className={'w-full'}>
						<label>
							<div
								ref={inputRef}
								className={
									'relative flex w-full cursor-text items-center justify-between rounded-md bg-primary-50/50'
								}>
								<input
									className={
										'w-full overflow-x-scroll border-none bg-transparent p-2 font-mono text-sm font-medium outline-none scrollbar-none'
									}
									type={'number'}
									min={0}
									maxLength={20}
									max={balanceOf?.normalized || 0}
									step={1 / 10 ** (token?.decimals || 18)}
									inputMode={'numeric'}
									disabled={isDisabled}
									placeholder={`${placeholder || '0.000000'} ${token.symbol}`}
									pattern={'^((?:0|[1-9]+)(?:.(?:d+?[1-9]|[1-9]))?)$'}
									value={value?.normalized || ''}
									onChange={onChangeAmount}
									onFocus={onFocus}
								/>
								<div
									ref={scope}
									className={'absolute right-0 mx-2 flex flex-row items-center space-x-2'}>
									<span
										className={'relative block h-4 w-4'}
										style={{zIndex: index}}>
										{shouldCheckAllowance && (
											<div className={'absolute inset-0'}>
												<span className={'tooltip'}>
													<IconInfo
														style={{
															opacity:
																value.raw > allowance.raw && value.raw <= balanceOf.raw
																	? 1
																	: 0
														}}
														className={'h-4 w-4 text-neutral-400 transition-opacity'}
													/>
													<span className={'tooltipLight !-inset-x-24 top-full mt-2 !w-auto'}>
														<div
															suppressHydrationWarning
															className={
																'w-fit rounded-md border border-neutral-700 bg-neutral-900 p-1 px-2 text-center text-xs font-medium text-neutral-0'
															}>
															{`You will be prompted to approve spending of ${formatAmount(
																value.normalized,
																6,
																6
															)} ${token.symbol}`}
														</div>
													</span>
												</span>
											</div>
										)}
										{shouldCheckBalance && (
											<IconCircleCross
												style={{
													opacity: value.raw > balanceOf.raw ? 1 : 0,
													pointerEvents: value.raw > balanceOf.raw ? 'auto' : 'none'
												}}
												className={'absolute inset-0 h-4 w-4 text-red-900 transition-opacity'}
											/>
										)}
									</span>
									<button
										type={'button'}
										tabIndex={-1}
										onClick={(): void => onChange(balanceOf)}
										className={cl(
											'px-1 py-0 text-xxs rounded-sm transition-colors bg-primary-800 text-primary-0',
											'opacity-0 pointer-events-none'
										)}>
										{'Max'}
									</button>
								</div>
							</div>
						</label>
						<span
							onClick={(): void => onChange(balanceOf)}
							className={
								'mt-1 block w-fit cursor-pointer pl-1 text-xxs text-neutral-500 transition-colors hover:text-neutral-900 hover:underline'
							}>
							{`Available ${formatAmount(balanceOf.normalized, 6, 6)} ${token.symbol}`}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}

export default TokenInput;
