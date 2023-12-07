import React, {useCallback, useRef, useState} from 'react';
import {isAddress} from 'viem';
import {getEnsName} from 'viem/ens';
import {IconAddressBook} from '@icons/IconAddressBook';
import {IconChevron} from '@icons/IconChevron';
import {useAsyncAbortable} from '@react-hookz/web';
import {checkENSValidity} from '@utils/tools.ens';
import {checkLensValidity} from '@utils/tools.lens';
import {getPublicClient} from '@wagmi/core';
import {isZeroAddress, toAddress, truncateHex} from '@yearn-finance/web-lib/utils/address';
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

	const [{status}, actions] = useAsyncAbortable(
		async (signal, input: string): Promise<void> =>
			new Promise<void>(async (resolve, reject): Promise<void> => {
				if (signal.aborted) {
					console.warn('aborted');
					reject(new Error('Aborted!'));
				} else {
					currentLabel.current = input;
					currentAddress.current = undefined;

					if (input.endsWith('.eth') && input.length > 4) {
						set_value({address: undefined, label: input, isValid: 'undetermined'});
						const [address, isValid] = await checkENSValidity(input);
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

					if (!isZeroAddress(toAddress(input))) {
						console.log('here');
						currentAddress.current = toAddress(input);
						set_value({address: toAddress(input), label: input, isValid: true});
						const client = getPublicClient({chainId: 1});
						const ensName = await getEnsName(client, {address: toAddress(input)});
						await new Promise(set_value => setTimeout(set_value, 2000));
						if (signal.aborted) {
							reject(new Error('Aborted!'));
						}
						console.log(ensName);
						//sleep 2s
						currentLabel.current = ensName || input;
						console.warn({address: toAddress(input), label: ensName || input, isValid: true});
						set_value({address: toAddress(input), label: ensName || input, isValid: true});
						return resolve();
					}

					currentAddress.current = undefined;
					set_value({address: undefined, label: input, isValid: false});
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
				<div className={'w-full'}>
					<input
						className={cl(
							'w-full border-none bg-transparent p-0 text-xl transition-all',
							'text-neutral-900 placeholder:text-neutral-400 focus:placeholder:text-neutral-400/30',
							'placeholder:transition-colors',
							!currentLabel.current || isZeroAddress(currentAddress.current)
								? 'translate-y-2'
								: 'translate-y-0',
							isFocused ? 'translate-y-2' : 'translate-y-0'
						)}
						type={'text'}
						placeholder={'0x...'}
						autoComplete={'off'}
						autoCorrect={'off'}
						spellCheck={'false'}
						value={
							isFocused
								? currentLabel.current // If focused, always display what was last inputed
								: !isFocused && isAddress(currentLabel.current)
								  ? truncateHex(currentLabel.current, 8) // if it's not focused, and it's an address, display the truncated address
								  : !isFocused && !isAddress(currentLabel.current)
								    ? currentLabel.current // if it's not focused, and it's not an address, display the label
								    : undefined
						}
						onChange={e => onChange(e.target.value)}
						onFocus={() => set_isFocused(true)}
						onBlur={() => set_isFocused(false)}
					/>

					<p
						className={cl(
							'text-xs text-[#ADB1BD] transition-all',
							isFocused ? 'opacity-0' : 'opacity-100',
							isFocused ? 'translate-y-8' : 'translate-y-0',
							isFocused ? 'pointer-events-none' : 'pointer-events-auto'
						)}>
						{(!isZeroAddress(value.address) && toAddress(value.address)) || ' '}&nbsp;
					</p>
				</div>
				<button
					className={cl(
						'flex items-center gap-4 rounded-lg p-4',
						'bg-neutral-100 hover:bg-neutral-200 transition-colors'
					)}>
					<IconAddressBook className={'h-8 w-8 text-neutral-400'} />
					<IconChevron className={'h-4 w-4 text-neutral-900'} />
				</button>
			</label>
		</div>
	);
}
