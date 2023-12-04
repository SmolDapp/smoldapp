import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {useWallet} from 'contexts/useWallet';
import handleInputChangeEventValue from 'utils/handleInputChangeEventValue';
import {useAnimate} from 'framer-motion';
import IconChevronPlain from '@icons/IconChevronPlain';
import {IconCircleCross} from '@icons/IconCircleCross';
import {useClickOutside} from '@react-hookz/web';
import {toAddress, truncateHex} from '@yearn-finance/web-lib/utils/address';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {toBigInt, toNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';
import {ImageWithFallback} from '@common/ImageWithFallback';

import type {ChangeEvent, ReactElement} from 'react';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import type {TToken} from '@utils/types/types';

type TViewFromToken = {
	token: TToken;
	value: TNormalizedBN | undefined;
	onChange: (value: TNormalizedBN) => void;
	label?: string;
	placeholder?: string;
	tokens?: TToken[];
	onChangeToken?: (token: TToken) => void;
	shouldCheckBalance?: boolean;
	isDisabled?: boolean;
	index?: number;
};
function TokenInput({
	token,
	value,
	onChange,
	tokens,
	onChangeToken,
	label,
	placeholder,
	shouldCheckBalance = true,
	isDisabled = false,
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
		animate('span', {opacity: 1, x: 48}, {duration: 0.3});
	}, [animate]);

	useClickOutside(inputRef, (): void => {
		animate('button', {opacity: 0, x: 112, pointerEvents: 'none'}, {duration: 0.3});
		animate('span', {opacity: 1, x: 48}, {duration: 0.3});
	});

	const onFocus = useCallback((): void => {
		animate('button', {opacity: 1, x: 0, pointerEvents: 'auto'}, {duration: 0.3});
		animate('span', {opacity: 1, x: 0}, {duration: 0.3});
	}, [animate]);

	return (
		<div className={'grid w-full grid-cols-12 gap-x-2'}>
			{label && <div className={'col-span-12 mb-1 flex w-full text-neutral-600'}>{label}</div>}
			<div
				className={cl(
					'grow-1 col-span-5 flex h-10 w-full items-center justify-start rounded-md p-2 bg-neutral-0 border border-neutral-200'
				)}>
				<div className={'mr-2 h-6 w-6 min-w-[24px]'}>
					<ImageWithFallback
						alt={`${token.address}_${token.name}_${token.symbol}`}
						unoptimized={!token.logoURI?.includes('assets.smold.app')}
						src={
							token.logoURI?.includes('assets.smold.app')
								? `${process.env.SMOL_ASSETS_URL}/token/${token.chainID}/${token.address}/logo-32.png`
								: token.logoURI || ''
						}
						width={24}
						height={24}
					/>
				</div>
				{tokens && tokens?.length > 0 ? (
					<select
						onChange={(e): void =>
							onChangeToken?.(
								(tokens || []).find((lst): boolean => lst.address === e.target.value) || token
							)
						}
						className={
							'w-full overflow-x-scroll border-none bg-transparent px-0 py-4 outline-none scrollbar-none'
						}
						value={token.address}
						defaultValue={token.symbol}>
						{(tokens || []).map(
							(lst): ReactElement => (
								<option
									key={lst.address}
									value={lst.address}>
									{lst.symbol}
								</option>
							)
						)}
					</select>
				) : (
					<div className={'overflow-hidden'}>
						<p className={'text-sm'}>{token.symbol}</p>
						<p className={'truncate text-[8px] text-neutral-600'}>
							{truncateHex(toAddress(token.address), 10)}
						</p>
					</div>
				)}
			</div>

			<label className={'grow-1 col-span-7 flex h-10 w-full'}>
				<div className={'ml-2 mr-4 flex items-center'}>
					<IconChevronPlain className={'h-4 w-4 -rotate-90 text-neutral-900/30'} />
				</div>
				<div
					ref={inputRef}
					className={cl(
						'flex w-full items-center justify-between rounded-md p-2 border border-neutral-200 cursor-text',
						isDisabled ? 'bg-neutral-200' : 'bg-neutral-0'
					)}>
					<input
						className={
							'w-full overflow-x-scroll border-none bg-transparent px-0 py-4 font-mono text-sm outline-none scrollbar-none'
						}
						type={'number'}
						min={0}
						maxLength={20}
						max={balanceOf?.normalized || 0}
						step={1 / 10 ** (token?.decimals || 18)}
						inputMode={'numeric'}
						disabled={isDisabled}
						placeholder={placeholder || `0.000000 ${token.symbol}`}
						pattern={'^((?:0|[1-9]+)(?:.(?:d+?[1-9]|[1-9]))?)$'}
						value={value ? value.normalized : ''}
						onChange={onChangeAmount}
						onFocus={onFocus}
					/>
					<div
						ref={scope}
						className={'ml-2 flex flex-row items-center space-x-2'}>
						<span
							className={'relative block h-4 w-4'}
							style={{zIndex: index}}>
							{shouldCheckBalance && (
								<IconCircleCross
									style={{
										opacity: toBigInt(value?.raw) > balanceOf.raw ? 1 : 0,
										pointerEvents: toBigInt(value?.raw) > balanceOf.raw ? 'auto' : 'none'
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
								'px-2 py-1 text-xs rounded-md border border-neutral-900 transition-colors bg-neutral-900 text-neutral-0',
								'opacity-0 pointer-events-none'
							)}>
							{'Max'}
						</button>
					</div>
				</div>
			</label>
		</div>
	);
}

export default TokenInput;
