import React, {useCallback, useRef, useState} from 'react';
import {getEnsName} from 'viem/ens';
import {IconCircleCheck} from '@icons/IconCircleCheck';
import {IconCircleCross} from '@icons/IconCircleCross';
import {useAsyncAbortable, useUpdateEffect} from '@react-hookz/web';
import {isAddress, toAddress, truncateHex} from '@utils/tools.address';
import {checkENSValidity} from '@utils/tools.ens';
import {getPublicClient} from '@wagmi/core';
import {IconLoader} from '@yearn-finance/web-lib/icons/IconLoader';
import {cl} from '@yearn-finance/web-lib/utils/cl';

import {defaultInputAddressLike} from './SmolAddressInput';

import type {ReactElement} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/types';
import type {TInputAddressLike} from './SmolAddressInput';

export function SmolAddressInputSimple(props: {
	value: TInputAddressLike;
	onChange: (value: TInputAddressLike) => void;
}): ReactElement {
	const [isFocused, set_isFocused] = useState<boolean>(false);
	const [isCheckingValidity, set_isCheckingValidity] = useState<boolean>(false);
	const [, set_nonce] = useState<number>(0);
	const currentAddress = useRef<TAddress | undefined>(defaultInputAddressLike.address);
	const currentLabel = useRef<string>(defaultInputAddressLike.label);
	const currentInput = useRef<string>(defaultInputAddressLike.label);
	const inputRef = useRef<HTMLInputElement>(null);

	useUpdateEffect(() => {
		if (props.value.source === 'defaultValue') {
			currentAddress.current = props.value.address;
			currentLabel.current = props.value.label;

			if (props.value.label.endsWith('.eth')) {
				currentInput.current = props.value.label;
			} else if (!props.value.label.startsWith('0x')) {
				currentInput.current = props.value.label;
			} else {
				currentInput.current = props.value.address || '';
			}
			set_nonce(nonce => nonce + 1);
		}
	}, [props.value.label, props.value.source]);

	const [, actions] = useAsyncAbortable(
		async (signal, input: string): Promise<void> =>
			new Promise<void>(async (resolve, reject): Promise<void> => {
				if (signal.aborted) {
					reject(new Error('Aborted!'));
				} else {
					currentLabel.current = input;
					currentAddress.current = undefined;

					if (input === '') {
						props.onChange(defaultInputAddressLike);
						return resolve();
					}

					/**********************************************************
					 ** Check if the input is an ENS name
					 **********************************************************/
					if (input.endsWith('.eth') && input.length > 4) {
						set_isCheckingValidity(true);
						props.onChange({address: undefined, label: input, isValid: 'undetermined', source: 'typed'});
						const [address, isValid] = await checkENSValidity(input);
						if (signal.aborted) {
							reject(new Error('Aborted!'));
						}
						if (currentLabel.current === input && isAddress(address)) {
							set_isCheckingValidity(false);
							currentAddress.current = address;
							currentLabel.current = input;
							props.onChange({address, label: input, isValid, source: 'typed'});
						} else {
							set_isCheckingValidity(false);
							props.onChange({
								address: undefined,
								label: input,
								isValid: false,
								error: 'This ENS name looks invalid',
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
						props.onChange({address: toAddress(input), label: input, isValid: true, source: 'typed'});
						const client = getPublicClient({chainId: 1});
						const ensName = await getEnsName(client, {address: toAddress(input)});
						if (signal.aborted) {
							reject(new Error('Aborted!'));
						}
						currentLabel.current = ensName || input;
						set_isCheckingValidity(false);
						props.onChange({
							address: toAddress(input),
							label: ensName || input,
							isValid: true,
							source: 'typed'
						});
						return resolve();
					}

					currentAddress.current = undefined;
					props.onChange({
						address: undefined,
						label: input,
						isValid: input.startsWith('0x') && input.length === 42 ? false : 'undetermined',
						error: 'This address looks invalid',
						source: 'typed'
					});
					resolve();
				}
			}),
		undefined
	);

	const onChange = useCallback(
		(label: string): void => {
			set_isCheckingValidity(false);
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

	const getBorderColor = useCallback((): string => {
		if (isFocused) {
			return 'border-neutral-600';
		}
		if (props.value.isValid === false) {
			return 'border-red';
		}
		return 'border-neutral-400';
	}, [isFocused, props.value.isValid]);

	const getHasStatusIcon = useCallback((): boolean => {
		if (!currentInput.current) {
			return false;
		}
		if (!isFocused) {
			return false;
		}
		if (props.value.isValid === true || props.value.isValid === false || isCheckingValidity) {
			return true;
		}
		return false;
	}, [isFocused, props.value.isValid, isCheckingValidity]);

	return (
		<div className={'group relative h-full w-full max-w-[444px] rounded-lg'}>
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
							<div className={'pointer-events-none relative h-4 w-4 min-w-[16px]'}>
								<IconCircleCheck
									className={`absolute h-4 w-4 text-green transition-opacity ${
										!isCheckingValidity && props.value.isValid === true
											? 'opacity-100'
											: 'opacity-0'
									}`}
								/>
								<IconCircleCross
									className={`absolute h-4 w-4 text-red transition-opacity ${
										!isCheckingValidity && props.value.isValid === false
											? 'opacity-100'
											: 'opacity-0'
									}`}
								/>
								<div className={'absolute inset-0 flex items-center justify-center'}>
									<IconLoader
										className={`h-4 w-4 animate-spin text-neutral-900 transition-opacity ${
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
							!currentLabel.current ? 'translate-y-2' : 'translate-y-0',
							isFocused ? 'translate-y-2' : 'translate-y-0'
						)}
						type={'text'}
						placeholder={'0x...'}
						autoComplete={'off'}
						autoCorrect={'off'}
						spellCheck={'false'}
						value={getInputValue()}
						onChange={e => onChange(e.target.value)}
						onFocus={() => {
							set_isFocused(true);
							setTimeout(() => {
								if (inputRef.current) {
									const end = currentInput.current.length;
									inputRef.current.setSelectionRange(0, end);
									inputRef.current.scrollLeft = inputRef.current.scrollWidth;
									inputRef.current.focus();
								}
							}, 0);
						}}
						onBlur={() => {
							if (props.value.label.endsWith('.eth')) {
								currentInput.current = currentLabel.current;
							} else if (!props.value.label.startsWith('0x')) {
								currentInput.current = currentLabel.current;
							} else {
								currentInput.current = currentAddress.current || '';
							}

							set_isFocused(false);
						}}
					/>

					<p
						className={cl(
							'text-xs transition-all ',
							isFocused ? 'opacity-0' : 'opacity-100',
							isFocused ? 'translate-y-8' : 'translate-y-0',
							isFocused ? 'pointer-events-none' : 'pointer-events-auto',
							props.value.error ? 'text-red' : 'text-neutral-600'
						)}>
						{(isAddress(props.value?.address) && toAddress(props.value.address)) || props.value.error || ''}
						{/* Adding &nbsp; to make sure we have an element here */}
						&nbsp;
					</p>
				</div>
			</label>
		</div>
	);
}
