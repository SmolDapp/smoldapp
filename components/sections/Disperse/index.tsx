import React, {memo} from 'react';
import {SmolTokenSelector} from 'components/designSystem/SmolTokenSelector';

import {DisperseAddressAndAmountInputs} from './DisperseAddressAndAmountInputs';
import {newVoidRow, useDisperse} from './useDisperse';
import {DisperseWizard} from './Wizard';

import type {ReactElement} from 'react';
import type {TToken} from '@builtbymom/web3/types';

// function AmountToSendInput(props: {
// 	token: TToken | undefined;
// 	amount: TNormalizedBN | undefined;
// 	onChange: (amount: TNormalizedBN) => void;
// }): ReactElement {
// 	return (
// 		<div
// 			key={props.token?.address}
// 			className={'box-0 flex h-10 w-full items-center p-2'}>
// 			<div className={'flex h-10 w-full flex-row items-center justify-between px-0 py-4'}>
// 				<input
// 					className={'smol--input font-mono font-bold'}
// 					type={'number'}
// 					onWheel={(e): void => e.preventDefault()}
// 					min={0}
// 					step={1 / 10 ** (props.token?.decimals || 18)}
// 					inputMode={'numeric'}
// 					placeholder={'0'}
// 					pattern={'^((?:0|[1-9]+)(?:.(?:d+?[1-9]|[1-9]))?)$'}
// 					onChange={e => props.onChange(handleInputChangeEventValue(e, props.token?.decimals || 18))}
// 					value={props.amount?.normalized}
// 				/>
// 			</div>
// 		</div>
// 	);
// }

const Disperse = memo(function Disperse(): ReactElement {
	const {configuration, dispatchConfiguration} = useDisperse();

	// const checkAlreadyExists = useCallback(
	// 	(UUID: string, address: TAddress): boolean => {
	// 		if (isZeroAddress(address)) {
	// 			return false;
	// 		}
	// 		return configuration.receivers.some((row): boolean => row.UUID !== UUID && row.address === address);
	// 	},
	// 	[configuration.receivers]
	// );

	// function onHandleMultiplePaste(_: string, pasted: string): void {
	// 	const separators = [' ', '-', ';', ',', '.'];
	// 	const addressAmounts = pasted
	// 		.replaceAll(' ', '')
	// 		.replaceAll('\t', '')
	// 		.split('\n')
	// 		.map((line): [string, string] => {
	// 			//remove all separators that are next to each other
	// 			let cleanedLine = separators.reduce(
	// 				(acc, separator): string => acc.replaceAll(separator + separator, separator),
	// 				line
	// 			);
	// 			for (let i = 0; i < 3; i++) {
	// 				cleanedLine = separators.reduce(
	// 					(acc, separator): string => acc.replaceAll(separator + separator, separator),
	// 					cleanedLine
	// 				);
	// 			}

	// 			const addressAmount = cleanedLine.split(
	// 				separators.find((separator): boolean => cleanedLine.includes(separator)) ?? ' '
	// 			);
	// 			return [addressAmount[0], addressAmount[1]];
	// 		});

	// 	const newRows = addressAmounts.map((addressAmount): TDisperseConfiguration['receivers'][0] => {
	// 		const row = newVoidRow();
	// 		row.address = toAddress(addressAmount[0]);
	// 		row.label = String(addressAmount[0]);
	// 		try {
	// 			if (addressAmount[1].includes('.') || addressAmount[1].includes(',')) {
	// 				const normalizedAmount = Number(addressAmount[1]);
	// 				const raw = parseUnits(normalizedAmount, configuration.tokenToSend?.decimals || 18);
	// 				const amount = toNormalizedBN(raw, configuration.tokenToSend?.decimals || 18);
	// 				row.amount = amount;
	// 			} else {
	// 				const amount = toNormalizedBN(addressAmount[1], configuration.tokenToSend?.decimals || 18);
	// 				row.amount = amount;
	// 			}
	// 		} catch (e) {
	// 			row.amount = toNormalizedBN(0n, configuration.tokenToSend?.decimals || 18);
	// 		}
	// 		return row;
	// 	});

	// 	dispatchConfiguration({
	// 		type: 'ADD_RECEIVERS',
	// 		payload: newRows.filter((row): boolean => {
	// 			if (!row.address || isZeroAddress(row.address)) {
	// 				return false;
	// 			}
	// 			if (checkAlreadyExists(row.UUID, row.address)) {
	// 				return false;
	// 			}
	// 			if (!row.amount || row.amount.raw === 0n) {
	// 				return false;
	// 			}
	// 			return true;
	// 		})
	// 	});
	// }
	const onSelectToken = (token: TToken): void => {
		dispatchConfiguration({type: 'SET_TOKEN_TO_SEND', payload: token});
	};

	const onAddReceiver = (): void => {
		dispatchConfiguration({type: 'ADD_RECEIVERS', payload: [newVoidRow()]});
	};

	return (
		<div className={'w-full'}>
			<div className={'mb-6 max-w-[432px]'}>
				<p className={'mb-2 font-medium'}>{'Token'}</p>
				<SmolTokenSelector
					token={configuration.tokenToSend}
					onSelectToken={onSelectToken}
				/>
			</div>
			<div>
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
