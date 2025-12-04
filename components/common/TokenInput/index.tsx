import {useCallback, useEffect, useMemo, useRef} from 'react';
import {useWallet} from 'contexts/useWallet';
import handleInputChangeEventValue from 'utils/handleInputChangeEventValue';
import {useAnimate} from 'framer-motion';
import IconChevronPlain from '@icons/IconChevronPlain';
import {IconCircleCross} from '@icons/IconCircleCross';
import {useClickOutside} from '@react-hookz/web';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {toBigInt, toNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';

import {MultipleTokenSelector, UniqueTokenSelector} from './TokenSelector';

import type {ChangeEvent, ReactElement} from 'react';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import type {TToken} from '@utils/types/types';

type TViewFromToken = {
	token: TToken | undefined;
	value: TNormalizedBN | undefined;
	onChange: (value: TNormalizedBN) => void;
	label?: string;
	placeholder?: string;
	tokens?: TToken[];
	onChangeToken?: (token: TToken, tokenBalance: TNormalizedBN | undefined) => void;
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
		<div className={'grid w-full'}>
			{label && <div className={'mb-1 flex w-full text-neutral-600'}>{label}</div>}
			<div className={'flex w-full flex-col gap-2 md:flex-row'}>
				<div className={'flex w-full'}>
					{tokens && tokens?.length > 0 ? (
						<MultipleTokenSelector
							token={token}
							tokens={tokens}
							onChangeToken={onChangeToken}
						/>
					) : (
						<UniqueTokenSelector token={token} />
					)}
				</div>
				<div className={'hidden items-center md:flex'}>
					<IconChevronPlain className={'size-4 -rotate-90 text-neutral-900/30'} />
				</div>
				<label className={'flex h-[42px] w-full'}>
					<div
						ref={inputRef}
						className={cl('smol--input-wrapper h-[42px]', isDisabled ? 'bg-neutral-200' : 'bg-neutral-0')}>
						<input
							suppressHydrationWarning
							className={cl(
								'w-full border-none bg-transparent px-0 py-4 font-mono text-sm',
								'outline-none overflow-x-scroll scrollbar-none'
							)}
							placeholder={
								placeholder ||
								`${formatAmount(balanceOf.normalized, 6, token?.decimals || 18)} ${token?.symbol || ''}`
							}
							type={'number'}
							min={0}
							maxLength={20}
							max={balanceOf?.normalized || 0}
							step={1 / 10 ** (token?.decimals || 18)}
							inputMode={'numeric'}
							disabled={isDisabled}
							pattern={'^((?:0|[1-9]+)(?:.(?:d+?[1-9]|[1-9]))?)$'}
							value={value ? value.normalized : ''}
							onChange={onChangeAmount}
							onFocus={onFocus}
						/>
						<div
							ref={scope}
							className={'ml-2 flex flex-row items-center space-x-2'}>
							<span
								className={'relative block size-4'}
								style={{zIndex: index}}>
								{shouldCheckBalance && (
									<IconCircleCross
										style={{
											opacity: toBigInt(value?.raw) > balanceOf.raw ? 1 : 0,
											pointerEvents: toBigInt(value?.raw) > balanceOf.raw ? 'auto' : 'none'
										}}
										className={'absolute inset-0 size-4 text-red-600 transition-opacity'}
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
		</div>
	);
}

export default TokenInput;
