import React, {Fragment, memo, useCallback} from 'react';
import IconSquareMinus from 'components/icons/IconSquareMinus';
import IconSquarePlus from 'components/icons/IconSquarePlus';
import {newVoidRow, useDisperse} from 'components/sections/Disperse/useDisperse';
import {useTokensWithBalance} from 'hooks/useTokensWithBalance';
import {handleInputChangeEventValue} from 'utils/handleInputChangeEventValue';
import {isZeroAddress, toAddress} from '@utils/tools.address';
import {parseUnits, toNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {AddressLikeInput} from '@common/AddressLikeInput';
import {MultipleTokenSelector} from '@common/TokenInput/TokenSelector';

import {DisperseWizard} from './Wizard';

import type {TDisperseConfiguration} from 'components/sections/Disperse/useDisperse';
import type {ReactElement} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/types';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import type {TToken} from '@utils/types/types';

function AmountToSendInput(props: {
	token: TToken | undefined;
	amount: TNormalizedBN | undefined;
	onChange: (amount: TNormalizedBN) => void;
}): ReactElement {
	return (
		<div
			key={props.token?.address}
			className={'box-0 flex h-10 w-full items-center p-2'}>
			<div className={'flex h-10 w-full flex-row items-center justify-between px-0 py-4'}>
				<input
					className={'smol--input font-mono font-bold'}
					type={'number'}
					onWheel={(e): void => e.preventDefault()}
					min={0}
					step={1 / 10 ** (props.token?.decimals || 18)}
					inputMode={'numeric'}
					placeholder={'0'}
					pattern={'^((?:0|[1-9]+)(?:.(?:d+?[1-9]|[1-9]))?)$'}
					onChange={e => props.onChange(handleInputChangeEventValue(e, props.token?.decimals || 18))}
					value={props.amount?.normalized}
				/>
			</div>
		</div>
	);
}

const Disperse = memo(function Disperse(): ReactElement {
	const {configuration, dispatchConfiguration} = useDisperse();
	const tokensWithBalance = useTokensWithBalance();

	const checkAlreadyExists = useCallback(
		(UUID: string, address: TAddress): boolean => {
			if (isZeroAddress(address)) {
				return false;
			}
			return configuration.receivers.some((row): boolean => row.UUID !== UUID && row.address === address);
		},
		[configuration.receivers]
	);

	function onHandleMultiplePaste(_: string, pasted: string): void {
		const separators = [' ', '-', ';', ',', '.'];
		const addressAmounts = pasted
			.replaceAll(' ', '')
			.replaceAll('\t', '')
			.split('\n')
			.map((line): [string, string] => {
				//remove all separators that are next to each other
				let cleanedLine = separators.reduce(
					(acc, separator): string => acc.replaceAll(separator + separator, separator),
					line
				);
				for (let i = 0; i < 3; i++) {
					cleanedLine = separators.reduce(
						(acc, separator): string => acc.replaceAll(separator + separator, separator),
						cleanedLine
					);
				}

				const addressAmount = cleanedLine.split(
					separators.find((separator): boolean => cleanedLine.includes(separator)) ?? ' '
				);
				return [addressAmount[0], addressAmount[1]];
			});

		const newRows = addressAmounts.map((addressAmount): TDisperseConfiguration['receivers'][0] => {
			const row = newVoidRow();
			row.address = toAddress(addressAmount[0]);
			row.label = String(addressAmount[0]);
			try {
				if (addressAmount[1].includes('.') || addressAmount[1].includes(',')) {
					const normalizedAmount = Number(addressAmount[1]);
					const raw = parseUnits(normalizedAmount, configuration.tokenToSend?.decimals || 18);
					const amount = toNormalizedBN(raw, configuration.tokenToSend?.decimals || 18);
					row.amount = amount;
				} else {
					const amount = toNormalizedBN(addressAmount[1], configuration.tokenToSend?.decimals || 18);
					row.amount = amount;
				}
			} catch (e) {
				row.amount = toNormalizedBN(0n, configuration.tokenToSend?.decimals || 18);
			}
			return row;
		});

		dispatchConfiguration({
			type: 'ADD_RECEIVERS',
			payload: newRows.filter((row): boolean => {
				if (!row.address || isZeroAddress(row.address)) {
					return false;
				}
				if (checkAlreadyExists(row.UUID, row.address)) {
					return false;
				}
				if (!row.amount || row.amount.raw === 0n) {
					return false;
				}
				return true;
			})
		});
	}

	return (
		<section>
			<div className={'grid w-full grid-cols-12'}>
				<div className={'relative col-span-12 flex flex-col text-neutral-900'}>
					<div className={'w-full md:w-3/4'}>
						<b>{'Who gets what?'}</b>
						<p className={'text-neutral-500 text-sm'}>
							{
								'Drop the wallet, ENS, or Lens handle of who you want to receive the tokens, and enter the amount each address should receive. Add more receivers by clicking the +. Clicking is fun.'
							}
						</p>
					</div>

					<form
						suppressHydrationWarning
						onSubmit={async (e): Promise<void> => e.preventDefault()}
						className={'mt-6 grid w-full grid-cols-12 flex-row items-start justify-between gap-4'}>
						<div className={'col-span-12 flex w-full flex-col'}>
							<small className={'pb-1 pl-1'}>{'Token to send'}</small>
							<MultipleTokenSelector
								token={configuration.tokenToSend}
								tokens={tokensWithBalance}
								onChangeToken={(newToken): void =>
									dispatchConfiguration({type: 'SET_TOKEN_TO_SEND', payload: newToken})
								}
							/>
						</div>

						<div className={'col-span-12 flex w-full flex-col'}>
							<div className={'mb-2 grid grid-cols-2 gap-4'}>
								<p className={'text-neutral-500 text-xs'}>{'Receivers'}</p>
								<p className={'text-neutral-500 text-xs'}>{'Amount'}</p>
							</div>
							<div className={'grid grid-cols-2 gap-x-4 gap-y-2'}>
								{configuration.receivers.map((receiver): ReactElement => {
									return (
										<Fragment key={receiver.UUID}>
											<AddressLikeInput
												uuid={receiver.UUID}
												isDuplicate={checkAlreadyExists(
													receiver.UUID,
													toAddress(receiver.address)
												)}
												label={receiver.label}
												onChangeLabel={(label): void =>
													dispatchConfiguration({
														type: 'UPD_RECEIVER_BY_UUID',
														payload: {...receiver, label}
													})
												}
												onChange={(address): void => {
													dispatchConfiguration({
														type: 'UPD_RECEIVER_BY_UUID',
														payload: {...receiver, address: toAddress(address)}
													});
												}}
												onPaste={onHandleMultiplePaste}
											/>
											<div className={'flex flex-row items-center justify-center gap-4'}>
												<AmountToSendInput
													token={configuration.tokenToSend}
													amount={receiver.amount}
													onChange={(amount): void => {
														dispatchConfiguration({
															type: 'UPD_RECEIVER_BY_UUID',
															payload: {...receiver, amount}
														});
													}}
												/>
												<IconSquareMinus
													onClick={(): void =>
														dispatchConfiguration({
															type: 'DEL_RECEIVER_BY_UUID',
															payload: receiver.UUID
														})
													}
													className={
														'h-4 w-4 cursor-pointer text-neutral-400 transition-colors hover:text-neutral-900'
													}
												/>
												<IconSquarePlus
													onClick={(): void =>
														dispatchConfiguration({
															type: 'ADD_SIBLING_RECEIVER_FROM_UUID',
															payload: receiver.UUID
														})
													}
													className={
														'h-4 w-4 cursor-pointer text-neutral-400 transition-colors hover:text-neutral-900'
													}
												/>
											</div>
										</Fragment>
									);
								})}
							</div>
						</div>

						<DisperseWizard />
					</form>
				</div>
			</div>
		</section>
	);
});

export default Disperse;
