import {useEffect} from 'react';
import {SmolAddressInput} from 'components/designSystem/SmolAddressInput';
import {SmolTokenAmountInput} from 'components/designSystem/SmolTokenAmountInput';
import {useTokenList} from 'contexts/useTokenList';
import {IconCircleCheck} from '@icons/IconCircleCheck';
import {IconCircleCross} from '@icons/IconCircleCross';
import {IconCross} from '@icons/IconCross';
import {IconSpinner} from '@icons/IconSpinner';
import {isString} from '@utils/types/typeGuards';
import {getStateFromUrlQuery} from '@utils/url/getStateFromUrlQuery';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {toBigInt} from '@yearn-finance/web-lib/utils/format.bigNumber';

import {SendWarning} from './SendWarning';
import {useSendFlow} from './useSendFlow';
import {SendWizard} from './Wizard';

import type {TInputAddressLike} from 'components/designSystem/SmolAddressInput';
import type {TSendInputElement} from 'components/designSystem/SmolTokenAmountInput';
import type {ParsedUrlQuery} from 'querystring';
import type {ReactElement} from 'react';
import type {TToken} from '@utils/types/types';

function SendTokenRow({
	input,
	initialValue
}: {
	input: TSendInputElement;
	initialValue: Partial<{amount: bigint; token: TToken}>;
}): ReactElement {
	const {configuration, dispatchConfiguration} = useSendFlow();

	const onSetValue = (value: Partial<TSendInputElement>): void => {
		dispatchConfiguration({type: 'SET_VALUE', payload: {...value, UUID: input.UUID}});
	};

	const onRemoveInput = (): void => {
		dispatchConfiguration({type: 'REMOVE_INPUT', payload: {UUID: input.UUID}});
	};

	const renderIcon = (): ReactElement | null => {
		if (input.status === 'pending') {
			return <IconSpinner className={'h-4 w-4'} />;
		}
		if (input.status === 'success') {
			return <IconCircleCheck className={'h-4 w-4 text-green'} />;
		}
		if (input.status === 'error') {
			return <IconCircleCross className={'h-4 w-4 text-red'} />;
		}
		return null;
	};

	const iconContainerStyle = 'absolute -right-10 top-1/2 -translate-y-1/2';

	return (
		<div className={'relative'}>
			<SmolTokenAmountInput
				onSetValue={onSetValue}
				value={input}
				initialValue={initialValue}
			/>
			{configuration.inputs.length > 1 && input.status === 'none' && (
				<button
					className={cl(
						iconContainerStyle,
						'-right-11 p-1 text-neutral-600 transition-colors hover:text-neutral-700'
					)}
					onClick={onRemoveInput}>
					<IconCross className={'h-4 w-4'} />
				</button>
			)}

			<div className={iconContainerStyle}>{renderIcon()}</div>
		</div>
	);
}

export function Send({queryParams}: {queryParams: ParsedUrlQuery}): ReactElement {
	const {configuration, dispatchConfiguration} = useSendFlow();

	const {tokenList, getToken} = useTokenList();
	const isReceiverERC20 = Boolean(configuration.receiver.address && tokenList[configuration.receiver.address]);

	const onAddToken = (): void => {
		dispatchConfiguration({
			type: 'ADD_INPUT',
			payload: undefined
		});
	};

	const stateFromUrl = getStateFromUrlQuery(queryParams, ({string, array}) => ({
		to: string('to'),
		tokens: array('tokens'),
		values: array('values')
	}));

	const onSetRecipient = (value: TInputAddressLike): void => {
		dispatchConfiguration({type: 'SET_RECEIVER', payload: value});
	};

	/**
	 * Add missing token inputs if tokens are present in the url query
	 */
	useEffect(() => {
		if (!stateFromUrl?.tokens || !Array.isArray(stateFromUrl.tokens)) {
			return;
		}
		stateFromUrl.tokens.slice(1).forEach(() => onAddToken());
	}, []);

	return (
		<div className={'w-full max-w-[444px]'}>
			<div className={'mb-6'}>
				<p className={'font-medium'}>{'Receiver'}</p>
				<SmolAddressInput
					onSetValue={onSetRecipient}
					value={configuration.receiver}
					initialValue={isString(stateFromUrl?.to) ? stateFromUrl?.to : undefined}
				/>
			</div>
			<div>
				<p className={'font-medium'}>{'Token'}</p>
				{configuration.inputs.map((input, index) => (
					<div
						className={'mb-4'}
						key={input.UUID}>
						<SendTokenRow
							input={input}
							initialValue={{
								amount: stateFromUrl?.values?.[index]
									? toBigInt(stateFromUrl?.values[index])
									: undefined,
								token: stateFromUrl?.tokens?.[index]
									? getToken(toAddress(stateFromUrl?.tokens?.[index]))
									: undefined
							}}
						/>
					</div>
				))}
			</div>
			<div className={'mb-4 '}>
				<button
					className={
						'rounded-lg bg-neutral-200 px-3 py-1 text-xs text-neutral-700 transition-colors hover:bg-neutral-300'
					}
					onClick={onAddToken}>
					{'+Add token'}
				</button>
			</div>
			<SendWarning isReceiverERC20={isReceiverERC20} />
			<SendWizard isReceiverERC20={isReceiverERC20} />
		</div>
	);
}
