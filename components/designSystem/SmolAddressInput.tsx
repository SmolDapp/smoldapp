import React, {useCallback, useRef, useState} from 'react';
import {getEnsName} from 'viem/ens';
import {IconAddressBook} from '@icons/IconAddressBook';
import {IconChevron} from '@icons/IconChevron';
import {useAsyncAbortable} from '@react-hookz/web';
import {isAddress, toAddress, truncateHex} from '@utils/tools.address';
import {checkENSValidity} from '@utils/tools.ens';
import {checkLensValidity} from '@utils/tools.lens';
import {getPublicClient} from '@wagmi/core';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {defaultInputAddressLike} from '@common/AddressInput';

import type {ReactElement} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/types';
import type {TInputAddressLike} from '@common/AddressInput';

export function SmolAddressInput(): ReactElement {
	const [isFocused, set_isFocused] = useState<boolean>(false);
	const [value, set_value] = useState<TInputAddressLike>(defaultInputAddressLike);
	const currentAddress = useRef<TAddress | undefined>(defaultInputAddressLike.address);
	const currentLabel = useRef<string>(defaultInputAddressLike.label);
	const currentInput = useRef<string>(defaultInputAddressLike.label);

	const [{status}, actions] = useAsyncAbortable(
		async (signal, input: string): Promise<void> =>
			new Promise<void>(async (resolve, reject): Promise<void> => {
				if (signal.aborted) {
					console.warn('aborted');
					reject(new Error('Aborted!'));
				} else {
					currentLabel.current = input;
					currentAddress.current = undefined;

					if (input === '') {
						set_value(defaultInputAddressLike);
						return resolve();
					}

					if (input.endsWith('.eth') && input.length > 4) {
						set_value({address: undefined, label: input, isValid: 'undetermined'});
						const [address, isValid] = await checkENSValidity(input);
						if (signal.aborted) {
							reject(new Error('Aborted!'));
						}
						if (currentLabel.current === input && isAddress(address)) {
							currentAddress.current = address;
							currentLabel.current = input;
							set_value({address, label: input, isValid});
						} else {
							console.log('npp');
							set_value({
								address: undefined,
								label: input,
								isValid: false,
								error: 'This ENS name looks invalid'
							});
						}
						return resolve();
					}

					if (input.endsWith('.lens') && input.length > 5) {
						set_value({address: undefined, label: input, isValid: 'undetermined'});
						const [address, isValid] = await checkLensValidity(input);
						if (signal.aborted) {
							reject(new Error('Aborted!'));
						}
						if (currentLabel.current === input) {
							currentAddress.current = address;
							currentLabel.current = input;
							set_value({address, label: input, isValid});
						} else {
							set_value({address: undefined, label: input, isValid: 'undetermined'});
						}
						return resolve();
					}

					if (isAddress(input)) {
						currentAddress.current = toAddress(input);
						if (signal.aborted) {
							reject(new Error('Aborted!'));
						}
						set_value({address: toAddress(input), label: input, isValid: true});
						const client = getPublicClient({chainId: 1});
						const ensName = await getEnsName(client, {address: toAddress(input)});
						if (signal.aborted) {
							reject(new Error('Aborted!'));
						}
						currentLabel.current = ensName || input;
						set_value({address: toAddress(input), label: ensName || input, isValid: true});
						return resolve();
					}

					currentAddress.current = undefined;
					set_value({address: undefined, label: input, isValid: false, error: 'This address looks invalid'});
					resolve();
				}
			}),
		undefined
	);

	const onChange = useCallback(
		(label: string): void => {
			currentInput.current = label;
			actions.abort();
			actions.execute(label);
		},
		[actions]
	);

	return (
		<div className={'group relative h-full w-full max-w-[442px] rounded-lg p-[1px]'}>
			<div
				className={cl(
					'absolute inset-0 z-0 rounded-[9px] transition-colors',
					status === 'loading'
						? 'borderPulse'
						: !isFocused && value.error
							? 'bg-red-500'
							: isFocused
								? 'bg-neutral-600'
								: 'bg-neutral-400'
				)}
			/>
			<label
				className={cl(
					'h-20 z-20 relative',
					'flex flex-row items-center cursor-text',
					'p-2 pl-4 group bg-neutral-0 rounded-lg',
					'overflow-y-hidden'
				)}>
				<div className={'relative w-full pr-4'}>
					<input
						className={cl(
							'w-full border-none bg-transparent p-0 text-xl transition-all',
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
						value={
							isFocused
								? currentInput.current // If focused, always display what was last inputed
								: !isFocused && isAddress(currentLabel.current)
									? truncateHex(currentLabel.current, 8) // if it's not focused, and it's an address, display the truncated address
									: !isFocused && !isAddress(currentLabel.current)
										? currentLabel.current // if it's not focused, and it's not an address, display the label
										: undefined
						}
						onChange={e => onChange(e.target.value)}
						onFocus={() => set_isFocused(true)}
						onBlur={() => {
							currentInput.current = currentLabel.current;
							set_isFocused(false);
						}}
					/>

					<p
						className={cl(
							'text-xs transition-all',
							isFocused ? 'opacity-0' : 'opacity-100',
							isFocused ? 'translate-y-8' : 'translate-y-0',
							isFocused ? 'pointer-events-none' : 'pointer-events-auto',
							value.error ? 'text-red-500' : 'text-neutral-600'
						)}>
						{(isAddress(value?.address) && toAddress(value.address)) || value.error || ''}
						{/* Adding &nbsp; to make sure we have an element here */}
						&nbsp;
					</p>
				</div>
				<button
					className={cl(
						'flex items-center gap-4 rounded-lg p-4',
						'bg-neutral-200 hover:bg-neutral-300 transition-colors'
					)}>
					<IconAddressBook className={'h-8 w-8 text-neutral-600'} />
					<IconChevron className={'h-4 w-4 text-neutral-900'} />
				</button>
			</label>
		</div>
	);
}
