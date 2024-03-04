import {IconCross} from '@icons/IconCross';

import {SmolAddressInput} from '../../designSystem/SmolAddressInput';
import {SmolAmountInput} from '../../designSystem/SmolAmountInput';
import {useDisperse} from './useDisperse';

import type {ReactElement} from 'react';
import type {TInputAddressLike} from '@utils/tools.address';
import type {TAmountInputElement} from '../../designSystem/SmolAmountInput';
import type {TDisperseInput} from './useDisperse';

type TDisperseAddressAndAmountInputs = {
	input: TDisperseInput;
};

export function DisperseAddressAndAmountInputs({input}: TDisperseAddressAndAmountInputs): ReactElement {
	const {configuration, dispatchConfiguration} = useDisperse();

	const onSetReceiver = (value: Partial<TInputAddressLike>): void => {
		dispatchConfiguration({type: 'SET_RECEIVER', payload: {...value, UUID: input.UUID}});
	};

	const onSetAmount = (value: Partial<TAmountInputElement>): void => {
		dispatchConfiguration({type: 'SET_VALUE', payload: {...value, UUID: input.UUID}});
	};

	const onRemoveInput = (): void => {
		dispatchConfiguration({type: 'DEL_RECEIVER_BY_UUID', payload: input.UUID});
	};

	return (
		<div className={'flex py-2 pl-2 mb-4 bg-neutral-200 rounded-xl items-center w-full md:w-auto'}>
			<div className={'flex flex-col md:flex-row gap-4 w-full'}>
				<div className={'flex md:max-w-[424px] max-w-full w-full'}>
					<SmolAddressInput
						onSetValue={onSetReceiver}
						value={input.receiver}
					/>
				</div>
				<div>
					<SmolAmountInput
						onSetValue={onSetAmount}
						value={input.value}
						token={configuration.tokenToSend}
					/>
				</div>
			</div>
			<button
				className={'p-2 mx-2 text-neutral-600 transition-colors hover:text-neutral-700'}
				onClick={onRemoveInput}>
				<IconCross className={'size-4'} />
			</button>
		</div>
	);
}
