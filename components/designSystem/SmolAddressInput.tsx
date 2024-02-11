import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
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

import type {TAddressBookEntry} from 'contexts/useAddressBook';
import type {ReactElement} from 'react';
import type {TAddress} from '@builtbymom/web3/types';
import type {TInputAddressLike} from '@utils/tools.address';

type TAddressInput = {
	onSetValue: (value: TInputAddressLike) => void;
	value: TInputAddressLike;
	initialStateFromUrl?: string | undefined;
};

export function SmolAddressInput({onSetValue, value, initialStateFromUrl}: TAddressInput): ReactElement {
	const {onOpenCurtain, getEntry, getCachedEntry} = useAddressBook();

	const [isFocused, set_isFocused] = useState<boolean>(false);
	const [isCheckingValidity, set_isCheckingValidity] = useState<boolean>(false);

	const currentAddress = useRef<TAddress | undefined>(defaultInputAddressLike.address);
	const currentLabel = useRef<string>(defaultInputAddressLike.label);
	const currentInput = useRef<string>(defaultInputAddressLike.label);
	const inputRef = useRef<HTMLInputElement>(null);
	const addressBookEntry = useMemo(
		(): TAddressBookEntry | undefined => getCachedEntry({address: toAddress(value.address), label: value.label}),
		[getCachedEntry, value]
	);

	const [, actions] = useAsyncAbortable(
		async (signal, input: string): Promise<void> =>
			new Promise<void>(async (resolve, reject): Promise<void> => {
				if (signal.aborted) {
					reject(new Error('Aborted!'));
				} else {
					currentLabel.current = input;
					currentAddress.current = undefined;

					if (input === '') {
						onSetValue(defaultInputAddressLike);
						return resolve();
					}

					/**********************************************************
					 ** Check if the input is an address from the address book
					 **********************************************************/
					const fromAddressBook = await getEntry({label: input, address: toAddress(input)});
					if (fromAddressBook) {
						currentAddress.current = toAddress(fromAddressBook.address);
						if (signal.aborted) {
							reject(new Error('Aborted!'));
						}
						currentLabel.current = fromAddressBook.label || fromAddressBook.ens || input;
						onSetValue({
							address: toAddress(fromAddressBook.address),
							label: fromAddressBook.label,
							isValid: true,
							source: 'addressBook'
						});
						return resolve();
					}

					/**********************************************************
					 ** Check if the input is an ENS name
					 **********************************************************/
					if (input.endsWith('.eth') && input.length > 4) {
						set_isCheckingValidity(true);
						onSetValue({address: undefined, label: input, isValid: 'undetermined', source: 'typed'});
						const [address, isValid] = await checkENSValidity(input);
						if (signal.aborted) {
							reject(new Error('Aborted!'));
						}
						if (currentLabel.current === input && isAddress(address)) {
							set_isCheckingValidity(false);
							const fromAddressBook = await getEntry({label: input, address: toAddress(address)});
							if (fromAddressBook) {
								currentLabel.current = fromAddressBook.label || fromAddressBook.ens || input;
								onSetValue({
									address: toAddress(fromAddressBook.address),
									label: fromAddressBook.label || fromAddressBook.ens || input,
									isValid: true,
									source: 'addressBook'
								});
								return resolve();
							}

							currentAddress.current = address;
							currentLabel.current = input;
							onSetValue({address, label: input, isValid, source: 'typed'});
						} else {
							set_isCheckingValidity(false);
							onSetValue({
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
						onSetValue({address: toAddress(input), label: input, isValid: true, source: 'typed'});
						const client = getPublicClient({chainId: 1});
						const ensName = await getEnsName(client, {address: toAddress(input)});
						if (signal.aborted) {
							reject(new Error('Aborted!'));
						}
						currentLabel.current = ensName || input;
						set_isCheckingValidity(false);
						onSetValue({
							address: toAddress(input),
							label: ensName || input,
							isValid: true,
							source: 'typed'
						});
						return resolve();
					}

					currentAddress.current = undefined;
					onSetValue({
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

	useEffect(() => {
		if (!initialStateFromUrl) {
			return;
		}
		onChange(initialStateFromUrl);
	}, [initialStateFromUrl, onChange]);

	const onSelectItem = useCallback((item: TAddressBookEntry): void => {
		currentInput.current = item.label || item.ens || toAddress(item.address);
		currentLabel.current = item.label || item.ens || toAddress(item.address);
		currentAddress.current = toAddress(item.address);
		onSetValue({
			address: toAddress(item.address),
			label: item.label || item.ens || toAddress(item.address),
			isValid: true,
			source: 'addressBook'
		});
	}, []);

	const getInputValue = useCallback((): string | undefined => {
		if (isFocused) {
			return currentInput.current;
		}
		if (!isFocused) {
			if (value.source === 'addressBook' && addressBookEntry?.label) {
				return addressBookEntry.label;
			}
			if (isAddress(currentLabel.current) && addressBookEntry) {
				return truncateHex(currentLabel.current, 5);
			}
			if (isAddress(currentLabel.current)) {
				return truncateHex(currentLabel.current, 5);
			}
			if (!isAddress(currentLabel.current)) {
				return currentLabel.current;
			}
		}
		return undefined;
	}, [addressBookEntry, isFocused, value.source, currentInput, currentLabel]);

	const getBorderColor = useCallback((): string => {
		if (isFocused) {
			return 'border-neutral-600';
		}
		if (value.isValid === false) {
			return 'border-red';
		}
		return 'border-neutral-400';
	}, [isFocused, value.isValid]);

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
		<div className={'group relative size-full rounded-lg'}>
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
							currentInput.current = currentLabel.current;
							set_isFocused(false);
						}}
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
				<div className={'w-fit flex-1'}>
					<button
						onClick={() => onOpenCurtain(selectedEntry => onSelectItem(selectedEntry))}
						className={cl(
							'flex items-center gap-4 rounded-sm p-4 w-22',
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
