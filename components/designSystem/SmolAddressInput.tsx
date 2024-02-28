import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useAddressBook} from 'contexts/useAddressBook';
import {getEnsName} from 'viem/ens';
import {cl, isAddress, toAddress, truncateHex} from '@builtbymom/web3/utils';
import {IconAppAddressBook} from '@icons/IconApps';
import {IconChevron} from '@icons/IconChevron';
import {IconCircleCheck} from '@icons/IconCircleCheck';
import {IconCircleCross} from '@icons/IconCircleCross';
import {useAsyncAbortable} from '@react-hookz/web';
import {defaultInputAddressLike} from '@utils/tools.address';
import {checkENSValidity} from '@utils/tools.ens';
import {getPublicClient} from '@wagmi/core';
import {IconLoader} from '@yearn-finance/web-lib/icons/IconLoader';

import {AvatarWrapper} from './Avatar';

import type {ReactElement} from 'react';
import type {TInputAddressLike} from '@utils/tools.address';

type TAddressInput = {
	onSetValue: (value: Partial<TInputAddressLike>) => void;
	value: TInputAddressLike;
};

// TODO: add debounce
export function useValidateAddressInput(): {
	validate: (signal: AbortSignal | undefined, input: string) => Promise<TInputAddressLike>;
	isCheckingValidity: boolean;
} {
	const {getEntry} = useAddressBook();
	const [isCheckingValidity, set_isCheckingValidity] = useState<boolean>(false);

	const validate = async (signal: AbortSignal | undefined, input: string): Promise<TInputAddressLike> => {
		if (input === '') {
			return defaultInputAddressLike;
		}

		/**********************************************************
		 ** Check if the input is an address from the address book
		 **********************************************************/
		const fromAddressBook = await getEntry({label: input, address: toAddress(input)});
		if (fromAddressBook) {
			if (signal?.aborted) {
				console.log('aborted');
				throw new Error('Aborted!');
			}

			return {
				address: toAddress(fromAddressBook.address),
				label: fromAddressBook.label,
				isValid: true,
				error: undefined,
				source: 'addressBook'
			};
		}

		/**********************************************************
		 ** Check if the input is an ENS name
		 **********************************************************/
		if (input.endsWith('.eth') && input.length > 4) {
			set_isCheckingValidity(true);
			// onSetValue({address: undefined, label: input, isValid: 'undetermined', source: 'typed'});
			const [address, isValid] = await checkENSValidity(input);
			if (signal?.aborted) {
				console.log('aborted');
				throw new Error('Aborted!');
			}
			if (isAddress(address)) {
				set_isCheckingValidity(false);
				const fromAddressBook = await getEntry({label: input, address: toAddress(address)});
				if (fromAddressBook) {
					console.log(3);
					return {
						address: toAddress(fromAddressBook.address),
						label: fromAddressBook.label || fromAddressBook.ens || input,
						isValid: true,
						error: undefined,
						source: 'addressBook'
					};
				}

				return {address, label: input, error: undefined, isValid, source: 'typed'};
			}
			set_isCheckingValidity(false);

			return {
				address: undefined,
				label: input,
				isValid: false,
				error: 'This ENS name looks invalid',
				source: 'typed'
			};
		}

		/**********************************************************
		 ** Check if the input is an address
		 **********************************************************/
		if (isAddress(input)) {
			if (signal?.aborted) {
				console.log('aborted');
				throw new Error('Aborted!');
			}
			set_isCheckingValidity(true);
			const client = getPublicClient({chainId: 1});
			const ensName = await getEnsName(client, {address: toAddress(input)});
			if (signal?.aborted) {
				throw new Error('Aborted!');
			}
			set_isCheckingValidity(false);

			return {
				address: toAddress(input),
				label: ensName || toAddress(input),
				error: undefined,
				isValid: true,
				source: 'typed'
			};
		}

		return {
			address: undefined,
			label: input,
			isValid: input.startsWith('0x') && input.length === 42 ? false : 'undetermined',
			error: 'This address looks invalid',
			source: 'typed'
		};
	};

	return {isCheckingValidity, validate};
}

export function SmolAddressInput({onSetValue, value}: TAddressInput): ReactElement {
	const {onOpenCurtain} = useAddressBook();

	const [isFocused, set_isFocused] = useState<boolean>(false);

	const inputRef = useRef<HTMLInputElement>(null);

	const {isCheckingValidity, validate} = useValidateAddressInput();
	const [{result}, actions] = useAsyncAbortable(validate, undefined);

	const onChange = (input: string): void => {
		actions.abort();
		onSetValue({label: input});
		actions.execute(input);
	};

	const getInputValue = useCallback((): string | undefined => {
		if (isFocused) {
			return value.label;
		}

		if (isAddress(value.label)) {
			return truncateHex(value.label, 5);
		}

		return value.label;
	}, [isFocused, value.label]);

	const getBorderColor = useCallback((): string => {
		if (isFocused) {
			return 'border-neutral-600';
		}
		if (value.isValid === false) {
			return 'border-red';
		}
		return 'border-neutral-400';
	}, [isFocused, value.isValid]);

	useEffect(() => {
		onSetValue(result);
	}, [result]);

	const getHasStatusIcon = useCallback((): boolean => {
		if (!value.label) {
			return false;
		}
		if (!isFocused) {
			return false;
		}
		if (value.isValid === true || value.isValid === false || isCheckingValidity) {
			return true;
		}
		return false;
	}, [isFocused, value.isValid, isCheckingValidity]);

	return (
		<div className={'group relative size-full rounded-[8px]'}>
			<label
				className={cl(
					'h-20 z-20 relative',
					'flex flex-row justify-between items-center cursor-text',
					'p-2 pl-4 group bg-neutral-0 rounded-lg',
					'overflow-hidden border',
					getBorderColor()
				)}>
				<div className={'relative w-full pr-2 transition-all'}>
					<div
						className={cl(
							'absolute flex flex-row gap-2 items-center transition-all right-2 z-10',
							'pointer-events-none h-full'
						)}>
						{getHasStatusIcon() ? (
							<div className={'pointer-events-none relative size-4 min-w-[16px]'}>
								<IconCircleCheck
									className={`absolute size-4 text-green transition-opacity ${
										!isCheckingValidity && value.isValid === true ? 'opacity-100' : 'opacity-0'
									}`}
								/>
								<IconCircleCross
									className={`absolute size-4 text-red transition-opacity ${
										!isCheckingValidity && value.isValid === false ? 'opacity-100' : 'opacity-0'
									}`}
								/>
								<div className={'absolute inset-0 flex items-center justify-center'}>
									<IconLoader
										className={`size-4 animate-spin text-neutral-900 transition-opacity ${
											isCheckingValidity ? 'opacity-100' : 'opacity-0'
										}`}
									/>
								</div>
							</div>
						) : null}
					</div>
					<input
						ref={inputRef}
						className={cl(
							'w-full border-none bg-transparent p-0 text-xl transition-all pr-6',
							'text-neutral-900 placeholder:text-neutral-600 caret-neutral-700',
							'focus:placeholder:text-neutral-300 placeholder:transition-colors',
							!value.label ? 'translate-y-2' : 'translate-y-0',
							isFocused ? 'translate-y-2' : 'translate-y-0'
						)}
						type={'text'}
						placeholder={'0x...'}
						autoComplete={'off'}
						autoCorrect={'off'}
						spellCheck={'false'}
						value={getInputValue()}
						onChange={e => {
							onChange(e.target.value);
						}}
						onFocus={() => {
							set_isFocused(true);
							setTimeout(() => {
								if (inputRef.current) {
									const end = value.label.length;
									inputRef.current.setSelectionRange(0, end);
									inputRef.current.scrollLeft = inputRef.current.scrollWidth;
									inputRef.current.focus();
								}
							}, 0);
						}}
						onBlur={() => {
							set_isFocused(false);
						}}
					/>
					<input
						disabled
						className={cl(
							'text-xs w-full border-none p-0 transition-all line-clamp-1 max-w-full truncate disabled',
							isFocused ? 'opacity-0' : 'opacity-100',
							isFocused ? 'translate-y-8' : 'translate-y-0',
							isFocused ? 'pointer-events-none' : 'pointer-events-auto',
							value.error ? 'text-red' : 'text-neutral-600'
						)}
						defaultValue={''}
						value={(isAddress(value?.address) && toAddress(value.address)) || value.error || ''}
					/>

					{/* Adding &nbsp; to make sure we have an element here */}
				</div>
				<div className={'w-fit flex-1'}>
					<button
						onClick={() => onOpenCurtain(selectedEntry => onChange(selectedEntry.label))}
						className={cl(
							'flex items-center gap-4 rounded-[4px] p-4 w-22',
							'bg-neutral-200 hover:bg-neutral-300 transition-colors'
						)}>
						<div className={'flex size-8 min-w-8 items-center justify-center rounded-full bg-neutral-0'}>
							{!isAddress(value.address) ? (
								<IconAppAddressBook className={'size-4 text-neutral-600'} />
							) : (
								<AvatarWrapper
									address={toAddress(value.address)}
									sizeClassname={'h-8 w-8 min-w-8'}
								/>
							)}
						</div>

						<IconChevron className={'size-4 min-w-4 text-neutral-600'} />
					</button>
				</div>
			</label>
		</div>
	);
}
