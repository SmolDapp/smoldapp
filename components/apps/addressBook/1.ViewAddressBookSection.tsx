import React, {memo, useCallback, useMemo, useState} from 'react';
import IconCheck from 'components/icons/IconCheck';
import IconCircleCross from 'components/icons/IconCircleCross';
import IconWarning from 'components/icons/IconWarning';
import {checkENSValidity} from 'utils/tools.ens';
import {checkLensValidity} from 'utils/tools.lens';
import { isNullAddress } from './utils';
import {useMountEffect, useUpdateEffect} from '@react-hookz/web';
import {useAddressBook, newVoidRow} from '@addressBook/useAddressBook';
import {IconLoader} from '@yearn-finance/web-lib/icons/IconLoader';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {isZeroAddress, toAddress} from '@yearn-finance/web-lib/utils/address';
import {performBatchedUpdates} from '@yearn-finance/web-lib/utils/performBatchedUpdates';

import type {ReactElement} from 'react';
import type {TAddressBookElement} from '@addressBook/useAddressBook';
import type {TAddress} from '@yearn-finance/web-lib/types';

type TAddressLikeInput = {
	uuid: string;
	label: string;
	onChangeLabel: (label: string) => void;
	onChange: (address: string | undefined) => void;
	onPaste: (UUID: string, pasted: string) => void;
	isDuplicate?: boolean;
}
function AddressLikeInput({uuid, label, onChangeLabel, onChange, onPaste, isDuplicate}: TAddressLikeInput): ReactElement {
	const [isValidDestination, set_isValidDestination] = useState<boolean | 'undetermined'>('undetermined');
	const [isValidish, set_isValidish] = useState<boolean | 'undetermined'>('undetermined');
	const [isLoadingValidish, set_isLoadingValidish] = useState<boolean>(false);
	const status = useMemo((): 'valid' | 'invalid' | 'warning' | 'pending' | 'none' => {
		if ((isValidDestination === true || isValidish === true) && !isDuplicate) {
			return 'valid';
		}
		if (isValidDestination === false && label !== '' && !isLoadingValidish) {
			return 'invalid';
		}
		if (isDuplicate) {
			return 'warning';
		}
		if (isLoadingValidish) {
			return 'pending';
		}
		return 'none';
	}, [isValidDestination, isValidish, isDuplicate, label, isLoadingValidish]);

	const looksValidAddress = useCallback((value: string): boolean => {
		if (value.endsWith('.eth')) {
			return true;
		} if (value.endsWith('.lens')) {
			return true;
		} if (!isZeroAddress(toAddress(value))) {
			return true;
		}
		return false;
	}, []);

	useUpdateEffect((): void => {
		set_isValidDestination('undetermined');
		set_isValidish('undetermined');
		if (label.endsWith('.eth')) {
			set_isLoadingValidish(true);
			checkENSValidity(label).then(([validishDest, isValid]): void => {
				performBatchedUpdates((): void => {
					set_isLoadingValidish(false);
					set_isValidish(isValid);
					set_isValidDestination(isValid);
					onChange(validishDest);
				});
			});
		} else if (label.endsWith('.lens')) {
			set_isLoadingValidish(true);
			checkLensValidity(label).then(([validishDest, isValid]): void => {
				performBatchedUpdates((): void => {
					set_isLoadingValidish(false);
					set_isValidish(isValid);
					set_isValidDestination(isValid);
					onChange(validishDest);
				});
			});
		} else if (!isZeroAddress(toAddress(label))) {
			set_isValidDestination(true);
			onChange(label);
		} else {
			set_isValidish(false);
			onChange(undefined);
		}
	}, [label]);

	return (
		<div className={'box-0 flex h-10 w-full items-center p-2'}>
			<div className={'flex h-10 w-full flex-row items-center justify-between px-0 py-4'}>
				<input
					id={`address_input_${uuid}`}
					aria-invalid={!isValidDestination}
					required
					spellCheck={false}
					placeholder={'0x...'}
					value={label}
					onPaste={(e): void => {
						const value = e.clipboardData.getData('text/plain');
						const isValidValue = looksValidAddress(value);
						if (isValidValue) {
							set_isValidDestination('undetermined');
							return;
						}
						onPaste(uuid, value);
					}}
					onChange={(e): void => {
						set_isValidDestination('undetermined');
						onChangeLabel(e.target.value);
					}}
					className={'smol--input font-mono font-bold'}
					type={'text'} />
			</div>
			<label
				htmlFor={`address_input_${uuid}`}
				className={status === 'invalid' || status === 'warning' ? 'relative' : 'pointer-events-none relative h-4 w-4'}>
				<span className={status === 'invalid' || status === 'warning' ? 'tooltip' : 'pointer-events-none'}>
					<div className={'pointer-events-none relative h-4 w-4'}>
						<IconCheck
							className={`absolute h-4 w-4 text-[#16a34a] transition-opacity ${status === 'valid' ? 'opacity-100' : 'opacity-0'}`} />
						<IconCircleCross
							className={`absolute h-4 w-4 text-[#e11d48] transition-opacity ${status === 'invalid' ? 'opacity-100' : 'opacity-0'}`} />
						<IconWarning
							className={`absolute h-4 w-4 text-[#e1891d] transition-opacity ${status === 'warning' ? 'opacity-100' : 'opacity-0'}`} />
						<div className={'absolute inset-0 flex items-center justify-center'}>
							<IconLoader className={`h-4 w-4 animate-spin text-neutral-900 transition-opacity ${status === 'pending' ? 'opacity-100' : 'opacity-0'}`} />
						</div>
					</div>
					<span className={'tooltiptextsmall'}>
						{status === 'invalid' && 'This address is invalid'}
						{status === 'warning' && 'This address is already in use'}
					</span>
				</span>
			</label>
		</div>
	);
}

const ViewAddressBookSection = memo(function ViewAddressBookSection({onProceed}: {onProceed: VoidFunction}): ReactElement {
	const {addressBook, set_addressBook} = useAddressBook();

	useMountEffect((): void => {
		set_addressBook([newVoidRow()]);
	});

	const checkAlreadyExists = useCallback((UUID: string, address: TAddress): boolean => {
		if (isZeroAddress(address)) {
			return false;
		}
		return addressBook.some((row): boolean => row.UUID !== UUID && row.address === address);
	}, [addressBook]);

	function onAddNewRow(): void {
		set_addressBook([...addressBook, newVoidRow()]);
	}
	function onUpdateAddressByUUID(UUID: string, address: string | undefined): void {
		set_addressBook(addressBook.map((row): TAddressBookElement => {
			if (row.UUID !== UUID) {
				return row;
			}
			if (!address || isZeroAddress(address)) {
				return {...row, address: undefined};
			}
			return {...row, address: toAddress(address)};
		}));
	}
	function onUpdateLabelByUUID(UUID: string, label: string): void {
		set_addressBook(addressBook.map((row): TAddressBookElement => {
			if (row.UUID !== UUID) {
				return row;
			}
			return {...row, label};
		}));
	}
	function onHandleMultiplePaste(UUID: string, pasted: string): void {
		const separators = [' ', '-', ';', ',', '.'];
		const addressAmounts = pasted.split('\n').map((line): [string, string] => {
			//remove all separators that are next to each other
			let cleanedLine = separators.reduce((acc, separator): string => acc.replaceAll(separator + separator, separator), line);
			for (let i = 0; i < 3; i++) {
				cleanedLine = separators.reduce((acc, separator): string => acc.replaceAll(separator + separator, separator), cleanedLine);
			}

			const addressAmount = cleanedLine.split(separators.find((separator): boolean => cleanedLine.includes(separator)) ?? ' ');
			return [addressAmount[0], addressAmount[1]];
		});
		const newRows = addressAmounts.map((addressAmount): TAddressBookElement => {
			const row = newVoidRow();
			row.address = toAddress(addressAmount[0]);
			row.label = String(addressAmount[0]);

			return row;
		});
		set_addressBook(
			addressBook.reduce((acc, row): TAddressBookElement[] => {
				if (row.UUID === UUID) {
					if (row.address && !isZeroAddress(row.address)) {
						return [...acc, row, ...newRows];
					}
					return [...acc, ...newRows];
				}
				return [...acc, row];
			}, [] as TAddressBookElement[]));
	}
	const isValid = useMemo((): boolean => {
		return addressBook.every((row): boolean => {
			if (!row.label && !row.address) {
				return false;
			}
			if (!row.address || isZeroAddress(row.address) || isNullAddress(row.address)) {
				return false;
			}
			if (checkAlreadyExists(row.UUID, row.address)) {
				return false;
			}
			return true;
		});
	}, [addressBook, checkAlreadyExists]);
	const isValidElement = (UUID: string) => {
		const element = addressBook.find((row) => row.UUID === UUID);
		if (!element) {
			return false;
		}
		if (!element.label && !element.address) {
			return false;
		}
		if (!element.address || isZeroAddress(element.address) || isNullAddress(element.address)) {
			return false;
		}
		if (checkAlreadyExists(element.UUID, element.address)) {
			return false;
		}
		return true;
	}

	return (
		<section className={'box-0'}>
			<div className={'relative w-full'}>
				<div className={'flex flex-col p-4 text-neutral-900 md:p-6 md:pb-4'}>
					<div className={'w-full md:w-3/4'}>
						<b>
							{addressBook.length > 1 || (addressBook[0]?.address && isValid)
								? 'My Address Book'
								: 'Where is the Address Book?'
							}
						</b>
						<p className={'text-sm text-neutral-500'}>
							{addressBook.length > 1 || (addressBook[0]?.address && isValid)
								? 'Oh, you found it. Great! You can send a couple of tokens to your address or export the book.'
								: 'You can import an existing Address Book or create a new one. Go ahead!'
							}
						</p>
					</div>
				</div>

				<div className={'border-t border-neutral-200 p-6'}>
					<div className={'mb-4'}>
						<Button
							disabled={!isValid}
							onClick={onAddNewRow}
							className={'yearn--button'}
						>
							{'Create!'}
						</Button>
					</div>
					<div className={'grid grid-cols-1 gap-y-2'}>
						{addressBook.map(({UUID}, i): ReactElement => (
							<div className={'flex gap-x-4'} key={UUID}>
								<AddressLikeInput
									uuid={UUID}
									isDuplicate={checkAlreadyExists(UUID, toAddress(addressBook[i].address))}
									label={addressBook[i].label || ''}
									onChangeLabel={(label): void => onUpdateLabelByUUID(UUID, label)}
									onChange={(address): void => onUpdateAddressByUUID(UUID, address)}
									onPaste={onHandleMultiplePaste}
								/>
								<Button
									disabled={!isValidElement(UUID)}
									onClick={onProceed}
									className={'yearn--button w-[160px]'}
								>
									{'Send Token'}
								</Button>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
});

export default ViewAddressBookSection;
