import React, {useCallback, useMemo, useState} from 'react';
import {IconCircleCheck} from 'components/icons/IconCircleCheck';
import {IconCircleCross} from 'components/icons/IconCircleCross';
import IconWarning from 'components/icons/IconWarning';
import {checkENSValidity} from 'utils/tools.ens';
import {checkLensValidity} from 'utils/tools.lens';
import {cl, isZeroAddress, toAddress} from '@builtbymom/web3/utils';
import {useUpdateEffect} from '@react-hookz/web';
import {IconLoader} from '@yearn-finance/web-lib/icons/IconLoader';

import type {ReactElement} from 'react';

type TAddressLikeInput = {
	uuid: string;
	label: string;
	onChangeLabel: (label: string) => void;
	onChange: (address: string | undefined) => void;
	onPaste: (UUID: string, pasted: string) => void;
	isDuplicate?: boolean;
	isDisabled?: boolean;
	shouldAutoFocus?: boolean;
};

/**************************************************************************************************
 ** This component is a custom input field designed to handle Ethereum addresses and ENS domain
 ** names. It is used in various parts of the application where user input for addresses is
 ** required.
 **
 ** The component takes in several props including a unique identifier (uuid), a label,
 ** onChangeLabel and onChange functions, an onPaste function, and optional flags for isDuplicate
 ** and shouldAutoFocus.
 **
 ** The component maintains internal state to track the validity of the input address
 ** (isValidDestination), whether the input looks like a valid address (isValidish), and whether
 ** the component is currently validating the input (isLoadingValidish).
 **
 ** The component uses the useMemo hook to determine the status of the input based on the internal
 ** state variables. It uses the useCallback hook to determine if the input looks like a valid
 ** address.
 **
 ** The component uses the useUpdateEffect hook to perform side effects when the label prop
 ** changes. These side effects include checking the validity of ENS and Lens domain names, and
 ** updating the internal state variables accordingly.
 **
 ** The component returns a div element containing an input field and a label.
 ** The input field updates the internal state and calls the onChangeLabel prop function when the
 ** input changes. The label displays different icons based on the status of the input.
 *************************************************************************************************/
export function AddressLikeInput({
	uuid,
	label,
	onChangeLabel,
	onChange,
	onPaste,
	isDuplicate,
	isDisabled,
	shouldAutoFocus
}: TAddressLikeInput): ReactElement {
	const [isValidDestination, set_isValidDestination] = useState<boolean | 'undetermined'>('undetermined');
	const [isValidish, set_isValidish] = useState<boolean | 'undetermined'>('undetermined');
	const [isLoadingValidish, set_isLoadingValidish] = useState<boolean>(false);

	/**********************************************************************************************
	 ** The status function uses the useMemo hook to determine the status of the input
	 ** based on the internal state variables. It returns one of five possible statuses:
	 ** 'valid', 'invalid', 'warning', 'pending', or 'none'.
	 **
	 ** The function checks the following conditions in order:
	 ** 1. If the destination is valid or the input looks like a valid address and there is no
	 **    duplicate, it returns 'valid'.
	 ** 2. If the destination is invalid, the label is not empty, and it is not currently
	 **    validating the input, it returns 'invalid'.
	 ** 3. If there is a duplicate, it returns 'warning'.
	 ** 4. If it is currently validating the input, it returns 'pending'.
	 ** 5. If none of the above conditions are met, it returns 'none'.
	 **
	 ** The function is dependent on the following variables: isValidDestination, isValidish,
	 ** isDuplicate, label, isLoadingValidish.
	 *********************************************************************************************/
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

	/**********************************************************************************************
	 ** The looksValidAddress function uses the useCallback hook to determine if the input
	 ** looks like a valid address. It checks the following conditions in order:
	 ** 1. If the value ends with '.eth', it returns true.
	 ** 2. If the value ends with '.lens', it returns true.
	 ** 3. If the value is not a zero address, it returns true.
	 ** 4. If none of the above conditions are met, it returns false.
	 **
	 ** The function is not dependent on any variables and will only be created once.
	 *********************************************************************************************/
	const looksValidAddress = useCallback((value: string): boolean => {
		if (value.endsWith('.eth')) {
			return true;
		}
		if (value.endsWith('.lens')) {
			return true;
		}
		if (!isZeroAddress(toAddress(value))) {
			return true;
		}
		return false;
	}, []);

	/**********************************************************************************************
	 ** The useUpdateEffect function is a custom hook that updates the state of the input field
	 ** based on the label. It checks the following conditions in order:
	 ** 1. If the label ends with '.eth', it sets the isLoadingValidish state to true and checks
	 **    the ENS validity of the label. If the label is valid, it updates the isValidish and
	 **    isValidDestination states to true and triggers the onChange event with the validishDest.
	 ** 2. If the label ends with '.lens', it sets the isLoadingValidish state to true and checks
	 **    the Lens validity of the label. If the label is valid, it updates the isValidish and
	 **    isValidDestination states to true and triggers the onChange event with the validishDest.
	 ** 3. If the label is not a zero address, it sets the isValidDestination state to true and
	 **    triggers the onChange event with the label.
	 ** 4. If none of the above conditions are met, it sets the isValidish state to false and
	 **    triggers the onChange event with undefined.
	 **
	 ** The function is dependent on the label variable and will be re-created whenever the label
	 ** changes.
	 *********************************************************************************************/
	useUpdateEffect((): void => {
		set_isValidDestination('undetermined');
		set_isValidish('undetermined');
		if (label.endsWith('.eth')) {
			set_isLoadingValidish(true);
			checkENSValidity(label).then(([validishDest, isValid]): void => {
				set_isLoadingValidish(false);
				set_isValidish(isValid);
				set_isValidDestination(isValid);
				onChange(validishDest);
			});
		} else if (label.endsWith('.lens')) {
			set_isLoadingValidish(true);
			checkLensValidity(label).then(([validishDest, isValid]): void => {
				set_isLoadingValidish(false);
				set_isValidish(isValid);
				set_isValidDestination(isValid);
				onChange(validishDest);
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
		<div className={'smol--input-wrapper flex h-10 w-full items-center'}>
			<div className={'flex h-10 w-full flex-row items-center justify-between px-0 py-4'}>
				<input
					id={`add_input_${uuid}`}
					aria-invalid={!isValidDestination}
					required={!isDisabled}
					disabled={isDisabled}
					autoFocus={shouldAutoFocus}
					spellCheck={false}
					placeholder={'0x...'}
					value={label}
					onPaste={(e): void => {
						if (isDisabled) {
							return;
						}
						const value = e.clipboardData.getData('text/plain');
						const isValidValue = looksValidAddress(value);
						if (isValidValue) {
							set_isValidDestination('undetermined');
							return;
						}
						onPaste(uuid, value);
					}}
					onChange={(e): void => {
						if (isDisabled) {
							return;
						}
						set_isValidDestination('undetermined');
						onChangeLabel(e.target.value);
					}}
					className={cl('smol--input font-mono font-bold', isDisabled ? 'cursor-not-allowed' : '')}
					type={'text'}
				/>
			</div>
			<label
				htmlFor={`add_input_${uuid}`}
				className={cl(
					'relative mr-2',
					status === 'invalid' || status === 'warning'
						? 'pointer-events-none relative h-full w-4 flex justify-center items-center'
						: ''
				)}>
				<span
					className={cl(
						'flex items-center h-4 ml-[calc(100%-16px)]',
						status === 'invalid' || status === 'warning' ? 'tooltip' : 'pointer-events-none'
					)}>
					<div className={'pointer-events-none relative h-full w-4'}>
						<IconCircleCheck
							className={cl(
								'absolute h-4 w-4 text-green transition-opacity',
								status === 'valid' ? 'opacity-100' : 'opacity-0'
							)}
						/>
						<IconCircleCross
							className={cl(
								'absolute h-4 w-4 text-red transition-opacity',
								status === 'invalid' ? 'opacity-100' : 'opacity-0'
							)}
						/>
						<IconWarning
							className={cl(
								'absolute h-4 w-4 text-[#e1891d] transition-opacity',
								status === 'warning' ? 'opacity-100' : 'opacity-0'
							)}
						/>
						<div className={'absolute inset-0 flex items-center justify-center'}>
							<IconLoader
								className={cl(
									'h-4 w-4 animate-spin text-neutral-900 transition-opacity',
									status === 'pending' ? 'opacity-100' : 'opacity-0'
								)}
							/>
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
