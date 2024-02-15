import React, {memo, useCallback} from 'react';
import {SmolTokenSelector} from 'components/designSystem/SmolTokenSelector';
import {Button} from 'components/Primitives/Button';
import Papa from 'papaparse';
import {useBalances} from '@builtbymom/web3/hooks/useBalances.multichains';
import {useChainID} from '@builtbymom/web3/hooks/useChainID';
import {toAddress, toBigInt} from '@builtbymom/web3/utils';
import IconImport from '@icons/IconImport';
import {useDeepCompareEffect} from '@react-hookz/web';

import {DisperseAddressAndAmountInputs} from './DisperseAddressAndAmountInputs';
import {newVoidRow, useDisperse} from './useDisperse';
import {useDisperseQueryManagement} from './useDisperseQuery';
import {DisperseWizard} from './Wizard';

import type {ReactElement} from 'react';
import type {TToken} from '@builtbymom/web3/types';

function ExportConfigurationButton(): ReactElement {
	const {configuration} = useDisperse();

	const downloadConfiguration = useCallback(async () => {
		const receiverEntries = configuration.inputs
			.map((input, index) => ({
				tokenAddress: index === 0 ? configuration.tokenToSend?.address : '',
				receiverAddress: input.receiver.address,
				value: input.value.normalizedBigAmount.raw.toString()
			}))
			.filter(entry => entry.value && entry.receiverAddress);

		const csv = Papa.unparse(receiverEntries, {header: true});
		const blob = new Blob([csv], {type: 'text/csv;charset=utf-8'});
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		const name = `smol-disperse-${new Date().toISOString().split('T')[0]}.csv`;
		a.setAttribute('hidden', '');
		a.setAttribute('href', url);
		a.setAttribute('download', name);
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}, [configuration]);

	return (
		<Button
			onClick={downloadConfiguration}
			className={'!h-8'}>
			<IconImport className={'mr-2 size-3 rotate-180 text-neutral-900'} />
			{'Download CSV'}
		</Button>
	);
}

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
			<div className={'flex mb-4 gap-2'}>
				<ExportConfigurationButton />
			</div>
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
