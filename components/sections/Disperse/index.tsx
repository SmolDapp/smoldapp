import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {useValidateAddressInput} from 'components/designSystem/SmolAddressInput';
import {useValidateAmountInput} from 'components/designSystem/SmolTokenAmountInput';
import {SmolTokenSelector} from 'components/designSystem/SmolTokenSelector';
import {Button} from 'components/Primitives/Button';
import Papa from 'papaparse';
import {useWeb3} from '@builtbymom/web3/contexts/useWeb3';
import {useBalances} from '@builtbymom/web3/hooks/useBalances.multichains';
import {cl, toAddress, toNormalizedBN} from '@builtbymom/web3/utils';
import IconImport from '@icons/IconImport';

import {DisperseAddressAndAmountInputs} from './DisperseAddressAndAmountInputs';
import {newVoidRow, useDisperse} from './useDisperse';
import {useDisperseQueryManagement} from './useDisperseQuery';
import {DisperseWizard} from './Wizard';

import type {ChangeEvent, ComponentPropsWithoutRef, ReactElement} from 'react';
import type {TAddress, TToken} from '@builtbymom/web3/types';
import type {TDisperseInput} from './useDisperse';

type TRecord = {
	tokenAddress: TAddress;
	receiverAddress: TAddress;
	value: string;
	chainId: string;
};

function ImportConfigurationButton({onSelectToken}: {onSelectToken: (token: TToken) => void}): ReactElement {
	const {dispatchConfiguration} = useDisperse();

	const {chainID: safeChainID} = useWeb3();
	// const {safeChainID} = useChainID();

	const {validate: validateAddress} = useValidateAddressInput();
	const {validate: validateAmount} = useValidateAmountInput();

	const [importedTokenToSend, set_importedTokenToSend] = useState<string | undefined>(undefined);
	const [records, set_records] = useState<TRecord[] | undefined>(undefined);

	/** Token in URL may not be present in csv file, so better to be fetched  */
	const {data: initialTokenRaw} = useBalances({
		tokens: [{address: toAddress(importedTokenToSend), chainID: safeChainID}]
	});

	const initialToken = useMemo((): TToken | undefined => {
		return initialTokenRaw[safeChainID] && importedTokenToSend
			? initialTokenRaw[safeChainID][importedTokenToSend]
			: undefined;
	}, [initialTokenRaw]);

	const getInitialAmount = (amount: string, token: TToken | undefined): string => {
		return amount && token ? toNormalizedBN(amount, token.decimals).display : '0';
	};

	const onAddInputs = (inputs: TDisperseInput[]): void => {
		dispatchConfiguration({type: 'ADD_RECEIVERS', payload: inputs});
	};

	const clearReceivers = (): void => {
		dispatchConfiguration({type: 'CLEAR_RECEIVERS', payload: undefined});
	};

	const handleFileUpload = (e: ChangeEvent<HTMLInputElement>): void => {
		if (!e.target.files) {
			return;
		}
		const [file] = e.target.files as unknown as Blob[];
		const reader = new FileReader();
		reader.onload = event => {
			if (!event?.target?.result) {
				return;
			}
			const {result} = event.target;
			const parsedCSV = Papa.parse(result, {header: true});
			let records: TRecord[] = [];

			// If we are working with a safe file, we should get 4 columns.
			const isProbablySafeFile = parsedCSV.meta.fields.length === 4;
			if (isProbablySafeFile) {
				const [tokenAddress, chainId, receiverAddress, value] = parsedCSV.meta.fields;
				records = parsedCSV.data.map((item: unknown[]) => {
					return {
						tokenAddress: item[tokenAddress] as TAddress,
						receiverAddress: item[receiverAddress] as TAddress,
						value: item[value] as string,
						chainId: item[chainId] as string
					};
				});
			}
			set_importedTokenToSend(records[0].tokenAddress);
			set_records(records);
		};
		reader.readAsBinaryString(file);
	};

	/** Set imported token from url if present */
	useEffect(() => {
		if (initialToken) {
			onSelectToken(initialToken);
		}
	}, [initialToken]);

	useEffect(() => {
		if (!records || !Array.isArray(records)) {
			return;
		}

		const resultInputs: TDisperseInput[] = [];
		const promises = records.map(async record => validateAddress(undefined, record.receiverAddress));
		Promise.all(promises)
			.then(values => {
				values.forEach((validatedReceiver, index) => {
					const stringAmount = getInitialAmount(records[index].value, initialToken);
					console.log(records[index].value, initialToken);
					const value = {
						receiver: validatedReceiver,
						value: {...newVoidRow().value, ...validateAmount(stringAmount, initialToken)},
						UUID: crypto.randomUUID()
					};
					resultInputs.push(value);
				});
			})
			.finally(() => {
				clearReceivers();
				onAddInputs(resultInputs);
			});
	}, [initialToken]);

	return (
		<Button
			onClick={() => document.querySelector<HTMLInputElement>('#file-upload')?.click()}
			className={'!h-[unset] py-1.5 !text-sm'}>
			<input
				id={'file-upload'}
				tabIndex={-1}
				className={'absolute inset-0 !cursor-pointer opacity-0'}
				type={'file'}
				accept={'.csv'}
				onClick={event => event.stopPropagation()}
				onChange={handleFileUpload}
			/>
			<IconImport className={'mr-2 size-3 text-neutral-900'} />
			{'Import CSV'}
		</Button>
	);
}

export function ExportConfigurationButton(buttonProps: ComponentPropsWithoutRef<'button'>): ReactElement {
	const {configuration} = useDisperse();

	const downloadConfiguration = useCallback(async () => {
		const receiverEntries = configuration.inputs
			.map((input, index) => ({
				tokenAddress: index === 0 ? configuration.tokenToSend?.address : '',
				chainId: index === 0 ? configuration.tokenToSend?.chainID : '',
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
			className={cl('!h-[unset]', buttonProps.className)}>
			<IconImport className={'mr-2 size-3 rotate-180 text-neutral-900'} />
			{'Download CSV'}
		</Button>
	);
}

const Disperse = memo(function Disperse(): ReactElement {
	const {configuration, dispatchConfiguration} = useDisperse();

	const {hasInitialInputs} = useDisperseQueryManagement();

	const onSelectToken = (token: TToken): void => {
		dispatchConfiguration({type: 'SET_TOKEN_TO_SEND', payload: token});
	};

	const onAddReceivers = (amount: number): void => {
		dispatchConfiguration({
			type: 'ADD_RECEIVERS',
			payload: Array(amount)
				.fill(null)
				.map(() => newVoidRow())
		});
	};

	/** Add initial inputs */
	useEffect(() => {
		if (!hasInitialInputs) {
			onAddReceivers(2);
		}
	}, [hasInitialInputs]);

	return (
		<div className={'w-full'}>
			<div className={'flex mb-4 gap-2'}>
				<ImportConfigurationButton onSelectToken={onSelectToken} />
				<ExportConfigurationButton className={'!text-sm'} />
			</div>
			<div className={'mb-6 max-w-full w-full md:max-w-[432px]'}>
				<p className={'mb-2 font-medium'}>{'Token'}</p>
				<SmolTokenSelector
					token={configuration.tokenToSend}
					onSelectToken={onSelectToken}
				/>
			</div>
			<div className={'flex flex-col items-start'}>
				<p className={'font-medium mb-2'}>{'Send to'}</p>
				{configuration.inputs.map(input => (
					<DisperseAddressAndAmountInputs
						key={input.UUID}
						input={input}
					/>
				))}
			</div>
			<div className={'my-4'}>
				<button
					className={
						'rounded-lg bg-neutral-200 px-5 py-2 text-xs text-neutral-700 transition-colors hover:bg-neutral-300'
					}
					onClick={() => onAddReceivers(1)}>
					{'+Add receiver'}
				</button>
			</div>
			<DisperseWizard />
		</div>
	);
});

export default Disperse;
