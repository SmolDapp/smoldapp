import React, {memo} from 'react';
import {SmolTokenSelector} from 'components/designSystem/SmolTokenSelector';
import {useBalances} from '@builtbymom/web3/hooks/useBalances.multichains';
import {useChainID} from '@builtbymom/web3/hooks/useChainID';
import {toAddress, toBigInt} from '@builtbymom/web3/utils';
import {useDeepCompareEffect} from '@react-hookz/web';

import {DisperseAddressAndAmountInputs} from './DisperseAddressAndAmountInputs';
import {newVoidRow, useDisperse} from './useDisperse';
import {useDisperseQueryManagement} from './useDisperseQuery';
import {DisperseWizard} from './Wizard';

import type {ReactElement} from 'react';
import type {TToken} from '@builtbymom/web3/types';

const Disperse = memo(function Disperse(): ReactElement {
	const {safeChainID} = useChainID();
	const {configuration, dispatchConfiguration} = useDisperse();

	const {initialStateFromUrl} = useDisperseQueryManagement();
	const {data: initialTokenRaw} = useBalances({
		tokens: [{address: toAddress(initialStateFromUrl?.token), chainID: safeChainID}]
	});

	const initialToken =
		initialTokenRaw[safeChainID] && initialStateFromUrl?.token
			? initialTokenRaw[safeChainID][initialStateFromUrl?.token]
			: undefined;

	const onSelectToken = (token: TToken): void => {
		dispatchConfiguration({type: 'SET_TOKEN_TO_SEND', payload: token});
	};

	const onAddReceiver = (): void => {
		dispatchConfiguration({type: 'ADD_RECEIVERS', payload: [newVoidRow()]});
	};

	const getInitialAmount = (index: number): bigint | undefined => {
		return initialStateFromUrl?.values?.[index] ? toBigInt(initialStateFromUrl?.values[index]) : undefined;
	};

	const getInitialReceiver = (index: number): string | undefined => {
		return initialStateFromUrl?.addresses?.[index] ?? undefined;
	};

	/**
	 * Add missing receiver inputs if they are present in the url query
	 */
	useDeepCompareEffect(() => {
		if (!initialStateFromUrl || !Array.isArray(initialStateFromUrl.addresses)) {
			return;
		}
		// TODO: fix magic number
		initialStateFromUrl.addresses.slice(2).forEach(() => onAddReceiver());
	}, [initialStateFromUrl]);

	return (
		<div className={'w-full'}>
			<div className={'mb-6 max-w-[432px]'}>
				<p className={'mb-2 font-medium'}>{'Token'}</p>
				<SmolTokenSelector
					token={configuration.tokenToSend}
					initialToken={initialToken}
					onSelectToken={onSelectToken}
				/>
			</div>
			<div>
				<p className={'font-medium mb-2'}>{'Send to'}</p>
				{configuration.inputs.map((input, index) => (
					<DisperseAddressAndAmountInputs
						key={input.UUID}
						initialToken={initialToken}
						initialAmount={getInitialAmount(index)}
						initialReceiver={getInitialReceiver(index)}
						input={input}
					/>
				))}
			</div>
			<div className={'my-4'}>
				<button
					className={
						'rounded-lg bg-neutral-200 px-5 py-2 text-xs text-neutral-700 transition-colors hover:bg-neutral-300'
					}
					onClick={onAddReceiver}>
					{'+Add receiver'}
				</button>
			</div>
			{/* <SendWarning isReceiverERC20={isReceiverERC20} /> */}
			<DisperseWizard />
		</div>
	);
});

export default Disperse;
