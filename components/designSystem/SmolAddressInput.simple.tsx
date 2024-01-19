import React, {useCallback, useRef, useState} from 'react';
import {getEnsName} from 'viem/ens';
import {cl, isAddress, toAddress, truncateHex} from '@builtbymom/web3/utils';
import {IconCircleCheck} from '@icons/IconCircleCheck';
import {IconCircleCross} from '@icons/IconCircleCross';
import {useAsyncAbortable, useUpdateEffect} from '@react-hookz/web';
import {checkENSValidity} from '@utils/tools.ens';
import {getPublicClient} from '@wagmi/core';
import {IconLoader} from '@yearn-finance/web-lib/icons/IconLoader';

import {defaultInputAddressLike} from './SmolAddressInput';

import type {InputHTMLAttributes, ReactElement, RefObject} from 'react';
import type {TAddress} from '@builtbymom/web3/types';
import type {TInputAddressLike} from './SmolAddressInput';

export function SmolAddressInputSimple(
	props: {
		inputRef: RefObject<HTMLInputElement>;
		value: TInputAddressLike;
		onChange: (value: TInputAddressLike) => void;
	} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>
): ReactElement {
	const {value, onChange, inputRef, ...rest} = props;
	const [isFocused, set_isFocused] = useState<boolean>(false);
	const [isCheckingValidity, set_isCheckingValidity] = useState<boolean>(false);
	const [, set_nonce] = useState<number>(0);
	const currentAddress = useRef<TAddress | undefined>(defaultInputAddressLike.address);
	const currentLabel = useRef<string>(defaultInputAddressLike.label);
	const currentInput = useRef<string>(defaultInputAddressLike.label);

	useUpdateEffect(() => {
		if (value.source === 'defaultValue') {
			currentAddress.current = value.address;
			currentLabel.current = value.label;

			if (value.label.endsWith('.eth')) {
				currentInput.current = value.label;
			} else if (!value.label.startsWith('0x')) {
				currentInput.current = value.label;
			} else {
				currentInput.current = value.address || '';
			}
			set_nonce(nonce => nonce + 1);
		}
	}, [value.label, value.source]);

	const [, actions] = useAsyncAbortable(
		async (signal, input: string): Promise<void> =>
			new Promise<void>(async (resolve, reject): Promise<void> => {
				if (signal.aborted) {
					reject(new Error('Aborted!'));
				} else {
					currentLabel.current = input;
					currentAddress.current = undefined;

					if (input === '') {
						onChange(defaultInputAddressLike);
						return resolve();
					}

					/**********************************************************
					 ** Check if the input is an ENS name
					 **********************************************************/
					if (input.endsWith('.eth') && input.length > 4) {
						set_isCheckingValidity(true);
						onChange({address: undefined, label: input, isValid: 'undetermined', source: 'typed'});
						const [address, isValid] = await checkENSValidity(input);
						if (signal.aborted) {
							reject(new Error('Aborted!'));
						}
						if (currentLabel.current === input && isAddress(address)) {
							set_isCheckingValidity(false);
							currentAddress.current = address;
							currentLabel.current = input;
							onChange({address, label: input, isValid, source: 'typed'});
						} else {
							set_isCheckingValidity(false);
							inputRef.current?.setCustomValidity('This ENS name is invalid');
							onChange({
								address: undefined,
								label: input,
								isValid: false,
								error: 'This ENS name is invalid',
								source: 'typed'
							});
						}
						return resolve();
					}

					/**********************************************************
					 ** Check if the input is an address
					 **********************************************************/
					if (isAddress(input)) {
						currentAddress.current = toAddress(input);
						if (signal.aborted) {
							reject(new Error('Aborted!'));
						}
						set_isCheckingValidity(true);
						onChange({address: toAddress(input), label: input, isValid: true, source: 'typed'});
						const client = getPublicClient({chainId: 1});
						const ensName = await getEnsName(client, {address: toAddress(input)});
						if (signal.aborted) {
							reject(new Error('Aborted!'));
						}
						currentLabel.current = ensName || input;
						set_isCheckingValidity(false);
						onChange({
							address: toAddress(input),
							label: ensName || input,
							isValid: true,
							source: 'typed'
						});
						return resolve();
					}

					currentAddress.current = undefined;
					inputRef.current?.setCustomValidity('This address is invalid');
					onChange({
						address: undefined,
						label: input,
						isValid: input.startsWith('0x') && input.length === 42 ? false : 'undetermined',
						error: 'This address is invalid',
						source: 'typed'
					});
					resolve();
				}
			}),
		undefined
	);

	const onChangeTrigger = useCallback(
		(label: string): void => {
			set_isCheckingValidity(false);
			inputRef.current?.setCustomValidity('');
			currentInput.current = label;
			actions.abort();
			actions.execute(label);
		},
		[actions]
	);

	const getInputValue = useCallback((): string | undefined => {
		if (isFocused) {
			return currentInput.current;
		}
		if (!isFocused) {
			if (isAddress(currentLabel.current)) {
				return truncateHex(currentLabel.current, 5);
			}
			if (!isAddress(currentLabel.current)) {
				return currentLabel.current;
			}
		}
		return undefined;
	}, [isFocused, currentInput, currentLabel]);

	const getOnFocus = useCallback((): void => {
		set_isFocused(true);
		setTimeout(() => {
			if (inputRef.current) {
				const end = currentInput.current.length;
				inputRef.current.setSelectionRange(0, end);
				inputRef.current.scrollLeft = inputRef.current.scrollWidth;
				inputRef.current.focus();
			}
		}, 0);
	}, [inputRef, currentInput]);

	const getOnBlur = useCallback((): void => {
		if (value.label.endsWith('.eth')) {
			currentInput.current = currentLabel.current;
		} else if (!value.label.startsWith('0x')) {
			currentInput.current = currentLabel.current;
		} else if (isAddress(currentAddress.current)) {
			currentInput.current = currentAddress.current || '';
		}
		set_isFocused(false);
	}, [value.label]);

	const getBorderColor = useCallback((): string => {
		if (isFocused) {
			return 'border-neutral-600';
		}
		if (value.isValid === false) {
			return 'border-red';
		}
		if (rest.disabled) {
			return 'border-transparent';
		}
		return 'border-neutral-400 disabled:border-transparent';
	}, [isFocused, rest.disabled, value.isValid]);

	const getHasStatusIcon = useCallback((): boolean => {
		if (!currentInput.current) {
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
		<div className={'max-w-108 group relative size-full rounded-lg'}>
			<label
				className={cl(
					'h-20 z-20 relative',
					'flex flex-row justify-between items-center cursor-text',
					'p-2 pl-4 group rounded-lg overflow-hidden border',
					'transition-colors',
					props.disabled ? 'bg-neutral-300 cursor-default' : 'bg-neutral-0',
					getBorderColor()
				)}>
				<div className={'relative w-full pr-2 transition-all'}>
					<div
						tabIndex={-1}
						className={cl(
							'absolute flex flex-row gap-2 items-center transition-all right-2 z-10',
							'pointer-events-none h-full'
						)}>
						<div
							tabIndex={-1}
							className={cl(
								'pointer-events-none relative h-4 w-4 min-w-[16px]',
								getHasStatusIcon() ? 'opacity-100' : 'opacity-0'
							)}>
							<IconCircleCheck
								className={`text-green absolute size-4 transition-opacity ${
									!isCheckingValidity && value.isValid === true ? 'opacity-100' : 'opacity-0'
								}`}
							/>
							<IconCircleCross
								className={`text-red absolute size-4 transition-opacity ${
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
					</div>
					<input
						ref={inputRef}
						className={cl(
							'w-full border-none bg-transparent p-0 text-xl transition-all pr-6',
							'text-neutral-900 placeholder:text-neutral-600 caret-neutral-700',
							'focus:placeholder:text-neutral-300 placeholder:transition-colors',
							!currentLabel.current || isFocused ? 'translate-y-2' : 'translate-y-0'
						)}
						type={'text'}
						placeholder={'0x...'}
						autoComplete={'off'}
						autoCorrect={'off'}
						spellCheck={'false'}
						value={getInputValue()}
						onChange={e => onChangeTrigger(e.target.value)}
						aria-invalid={!isFocused && value.isValid === false}
						onFocus={getOnFocus}
						onBlur={getOnBlur}
						tabIndex={props.tabIndex}
						{...rest}
					/>

					<p
						className={cl(
							'text-xs transition-all ',
							isFocused ? 'opacity-0' : 'opacity-100',
							isFocused ? 'translate-y-8' : 'translate-y-0',
							isFocused ? 'pointer-events-none' : 'pointer-events-auto',
							value.error ? 'text-red' : 'text-neutral-600'
						)}>
						{(isAddress(value?.address) && toAddress(value.address)) || value.error || ''}
						{/* Adding &nbsp; to make sure we have an element here */}
						&nbsp;
					</p>
				</div>
			</label>
		</div>
	);
}
