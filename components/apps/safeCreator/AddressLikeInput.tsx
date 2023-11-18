import React, {useCallback, useMemo, useState} from 'react';
import {IconCircleCheck} from 'components/icons/IconCircleCheck';
import {IconCircleCross} from 'components/icons/IconCircleCross';
import IconWarning from 'components/icons/IconWarning';
import {checkENSValidity} from 'utils/tools.ens';
import {checkLensValidity} from 'utils/tools.lens';
import {useUpdateEffect} from '@react-hookz/web';
import {IconLoader} from '@yearn-finance/web-lib/icons/IconLoader';
import {isZeroAddress, toAddress} from '@yearn-finance/web-lib/utils/address';

import type {ReactElement} from 'react';

type TAddressLikeInput = {
	uuid: string;
	label: string;
	onChangeLabel: (label: string) => void;
	onChange: (address: string | undefined) => void;
	onPaste: (UUID: string, pasted: string) => void;
	isDuplicate?: boolean;
	shouldAutoFocus?: boolean;
};
function AddressLikeInput({
	uuid,
	label,
	onChangeLabel,
	onChange,
	onPaste,
	isDuplicate,
	shouldAutoFocus
}: TAddressLikeInput): ReactElement {
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
		}
		if (value.endsWith('.lens')) {
			return true;
		}
		if (!isZeroAddress(toAddress(value))) {
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
		<div className={'box-0 flex h-[46px] w-full items-center p-2'}>
			<div className={'flex h-[46px] w-full flex-row items-center justify-between px-0 py-4'}>
				<input
					id={`add_r_input_${uuid}`}
					aria-invalid={!isValidDestination}
					required
					autoFocus={shouldAutoFocus}
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
					type={'text'}
				/>
			</div>
			<label
				htmlFor={`add_r_input_${uuid}`}
				className={
					status === 'invalid' || status === 'warning' ? 'relative' : 'pointer-events-none relative h-4 w-4'
				}>
				<span className={status === 'invalid' || status === 'warning' ? 'tooltip' : 'pointer-events-none'}>
					<div className={'pointer-events-none relative h-4 w-4'}>
						<IconCircleCheck
							className={`absolute h-4 w-4 text-[#16a34a] transition-opacity ${
								status === 'valid' ? 'opacity-100' : 'opacity-0'
							}`}
						/>
						<IconCircleCross
							className={`absolute h-4 w-4 text-[#e11d48] transition-opacity ${
								status === 'invalid' ? 'opacity-100' : 'opacity-0'
							}`}
						/>
						<IconWarning
							className={`absolute h-4 w-4 text-[#e1891d] transition-opacity ${
								status === 'warning' ? 'opacity-100' : 'opacity-0'
							}`}
						/>
						<div className={'absolute inset-0 flex items-center justify-center'}>
							<IconLoader
								className={`h-4 w-4 animate-spin text-neutral-900 transition-opacity ${
									status === 'pending' ? 'opacity-100' : 'opacity-0'
								}`}
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

export default AddressLikeInput;
