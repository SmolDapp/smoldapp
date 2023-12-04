import React, {useCallback, useState} from 'react';
import assert from 'assert';
import ChainStatus from 'components/sections/Safe/ChainStatus';
import IconSquareMinus from '@icons/IconSquareMinus';
import IconSquarePlus from '@icons/IconSquarePlus';
import IconWarning from '@icons/IconWarning';
import {SUPPORTED_CHAINS} from '@utils/constants';
import {fetchTransaction} from '@wagmi/core';
import {AddressLike} from '@yearn-finance/web-lib/components/AddressLike';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {Renderable} from '@yearn-finance/web-lib/components/Renderable';
import {toast} from '@yearn-finance/web-lib/components/yToast';
import {isZeroAddress, toAddress} from '@yearn-finance/web-lib/utils/address';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import AddressInput, {defaultInputAddressLike} from '@common/AddressInput';
import {AddressLikeInput} from '@common/AddressLikeInput';
import {Label} from '@common/Label';

import {newVoidOwner, useMultiSafe} from './useSafe';
import {CALL_INIT_SIGNATURE, decodeArgInitializers, retrieveSafeTxHash, SINGLETON_L2, SINGLETON_L2_DDP} from './utils';

import type {ReactElement} from 'react';
import type {Hex} from 'viem';
import type {TAddress} from '@yearn-finance/web-lib/types';
import type {TInputAddressLike} from '@common/AddressInput';
import type {TOwners} from './types';

export function SectionDisplayOwners(): ReactElement {
	const {configuration} = useMultiSafe();

	return (
		<div className={'col-span-12 flex w-full flex-col'}>
			<Label title={'Owners'} />
			<div className={'col-span-2'}>
				<Renderable
					shouldRender={!!configuration?.owners && configuration?.owners.length > 0}
					fallback={
						<div>
							<p className={'font-number block text-sm text-neutral-400 md:text-base'}>{'0x...'}</p>
						</div>
					}>
					<div>
						{(configuration?.owners || []).map(
							(owner): ReactElement => (
								<b
									key={owner.address}
									className={'font-number addr block break-all text-sm md:text-base'}>
									<AddressLike address={toAddress(owner.address)} />
								</b>
							)
						)}
					</div>
				</Renderable>
			</div>
		</div>
	);
}

export function SectionDisplayThreshold(): ReactElement {
	const {configuration} = useMultiSafe();

	return (
		<div className={'col-span-12 flex w-full flex-col'}>
			<Label title={'Threshold'} />
			<div>
				<Renderable
					shouldRender={!!configuration?.threshold}
					fallback={<span className={'font-number text-neutral-400'}>{'0 of 0'}</span>}>
					<b className={'font-number'}>
						{`${configuration?.threshold || 0} of ${(configuration?.owners || []).length}`}
					</b>
				</Renderable>
			</div>
		</div>
	);
}

export function SectionDisplayPossibleDeployments(): ReactElement {
	const {configuration} = useMultiSafe();

	return (
		<div className={'col-span-12 flex w-full flex-col'}>
			<Label title={'Deployments'} />
			<div className={'col-span-12 flex flex-col text-neutral-900'}>
				<SectionPossibleSafes />
				{configuration.settings.shouldUseTestnets ? <SectionPossibleTestnetsSafes /> : null}
			</div>
		</div>
	);
}

export function SectionPossibleSafes(): ReactElement {
	const {configuration} = useMultiSafe();

	return (
		<Renderable
			shouldRender={!!configuration?.expectedAddress}
			fallback={<span className={'text-neutral-400'}>{'-'}</span>}>
			<div className={'mt-1 grid grid-cols-2 gap-2 md:grid-cols-1 md:gap-2'}>
				{SUPPORTED_CHAINS.filter((chain): boolean => ![5, 324, 1337, 84531].includes(chain.id)).map(
					(chain): ReactElement => (
						<ChainStatus
							key={chain.id}
							chain={chain}
							singleton={configuration.factory == 'ssf' ? SINGLETON_L2 : SINGLETON_L2_DDP}
						/>
					)
				)}
			</div>
		</Renderable>
	);
}

export function SectionPossibleTestnetsSafes(): ReactElement {
	const {configuration} = useMultiSafe();

	return (
		<Renderable
			shouldRender={!!configuration?.expectedAddress}
			fallback={<span className={'text-neutral-400'}>{'-'}</span>}>
			<div className={'mt-6 grid grid-cols-2 gap-2 border-t border-primary-100 pt-6 md:grid-cols-1 md:gap-4'}>
				{SUPPORTED_CHAINS.filter((chain): boolean => ![324].includes(chain.id))
					.filter((chain): boolean => [5, 1337, 84531].includes(chain.id))
					.map(
						(chain): ReactElement => (
							<ChainStatus
								key={chain.id}
								chain={chain}
								singleton={configuration.factory == 'ssf' ? SINGLETON_L2 : SINGLETON_L2_DDP}
							/>
						)
					)}
			</div>
		</Renderable>
	);
}

export function SectionSafeAddressInput(): ReactElement {
	const {dispatchConfiguration} = useMultiSafe();
	const [inputedValue, set_inputedValue] = useState<TInputAddressLike>(defaultInputAddressLike);
	const [isLoadingSafe, set_isLoadingSafe] = useState(false);
	const [error, set_error] = useState<string | undefined>(undefined);

	const retrieveSafe = useCallback(
		async (address: TAddress): Promise<void> => {
			set_error(undefined);
			set_isLoadingSafe(true);
			const result = await retrieveSafeTxHash(address);
			if (result) {
				const {hash, chainID} = result;
				if (!hash) {
					toast({type: 'error', content: 'No safe found at this address'});
					set_error('No safe found at this address');
					set_isLoadingSafe(false);
					return;
				}
				const tx = await fetchTransaction({hash, chainId: chainID});
				const input = `0x${tx.input.substring(tx.input.indexOf(CALL_INIT_SIGNATURE))}`;
				const {owners, threshold, salt, singleton} = decodeArgInitializers(input as Hex);

				dispatchConfiguration({
					type: 'SET_CONFIG',
					payload: {
						expectedAddress: address,
						seed: salt,
						threshold,
						factory: singleton == SINGLETON_L2 ? 'ssf' : 'ddp',
						originalTx: tx,
						owners: owners.map(
							(owner): TOwners => ({address: owner, label: owner, UUID: crypto.randomUUID()})
						)
					}
				});
				set_isLoadingSafe(false);
			} else {
				set_isLoadingSafe(false);
				set_error('No safe found at this address');
				toast({type: 'error', content: 'No safe found at this address'});
			}
		},
		[dispatchConfiguration]
	);

	return (
		<div className={'col-span-12 mt-6 flex w-full flex-col'}>
			<Label title={'Existing safe address'} />
			<div className={'flex gap-4'}>
				<AddressInput
					value={inputedValue}
					onChangeValue={(e): void => set_inputedValue(e)}
				/>
				<Button
					className={'yearn--button !w-[160px] rounded-md !text-sm'}
					isBusy={isLoadingSafe}
					onClick={() => {
						dispatchConfiguration({type: 'SET_ADDRESS', payload: undefined});
						retrieveSafe(toAddress(inputedValue.address));
					}}
					isDisabled={isZeroAddress(toAddress(inputedValue.address)) || !inputedValue.isValid}>
					{'Confirm'}
				</Button>
			</div>
			<div
				className={cl(
					error && !isLoadingSafe
						? 'col-span-12 flex flex-col p-4 pt-0 text-neutral-900 md:p-6 md:pt-0 opacity-100'
						: 'pointer-events-none h-0 overflow-hidden opacity-0'
				)}>
				<div
					className={
						'flex flex-row whitespace-pre rounded-md border border-red-200 !bg-red-200/60 p-2 text-xs font-bold text-red-600'
					}>
					<IconWarning className={'mr-2 h-4 w-4 text-red-600'} />
					{
						'Uh oh, this doesn’t appear to be a Safe address.\nPlease check you typed the correct address as we couldn’t find a Safe for this address.'
					}
				</div>
			</div>
		</div>
	);
}

export function SectionOwnerInput(props: {isDisabled?: boolean; onChange?: VoidFunction}): ReactElement {
	const {configuration, dispatchConfiguration} = useMultiSafe();

	const checkAlreadyExists = useCallback(
		(UUID: string, address: TAddress): boolean => {
			if (isZeroAddress(address)) {
				return false;
			}
			return configuration.owners.some((owner): boolean => owner.UUID !== UUID && owner.address === address);
		},
		[configuration.owners]
	);

	function onHandleMultiplePaste(_: string, pasted: string): void {
		const separators = [' ', '-', ';', ',', '.'];
		const addressAmounts = pasted.split('\n').map((line): [string, string] => {
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
		const newRows = addressAmounts.map(addressAmount => {
			const row = newVoidOwner();
			row.address = toAddress(addressAmount[0]);
			row.label = String(addressAmount[0]);
			return row;
		});

		dispatchConfiguration({
			type: 'ADD_OWNERS',
			payload: newRows.filter((row): boolean => {
				if (!row.address || isZeroAddress(row.address)) {
					return false;
				}
				if (checkAlreadyExists(row.UUID, row.address)) {
					return false;
				}
				return true;
			})
		});
	}

	return (
		<div className={'col-span-12 mt-4 flex w-full flex-col'}>
			<Label title={'Owners'} />
			<div className={'grid w-full items-center justify-between gap-2'}>
				{configuration.owners.map(
					({UUID}, index): ReactElement => (
						<div
							className={'col-span-12 flex w-full flex-row items-center justify-center gap-4'}
							key={UUID}>
							<AddressLikeInput
								isDisabled={props.isDisabled}
								shouldAutoFocus={index === 0}
								uuid={UUID}
								isDuplicate={checkAlreadyExists(UUID, toAddress(configuration.owners[index].address))}
								label={configuration.owners[index].label}
								onChangeLabel={(label): void => {
									props.onChange?.();
									dispatchConfiguration({
										type: 'UPD_OWNER',
										payload: {...configuration.owners[index], label}
									});
								}}
								onChange={(address): void => {
									props.onChange?.();
									dispatchConfiguration({
										type: 'UPD_OWNER',
										payload: {...configuration.owners[index], address: toAddress(address)}
									});
								}}
								onPaste={onHandleMultiplePaste}
							/>

							<IconSquareMinus
								tabIndex={-1}
								onClick={() => {
									props.onChange?.();
									dispatchConfiguration({type: 'DEL_OWNER_BY_UUID', payload: UUID});
								}}
								className={cl(
									'h-4 w-4 cursor-pointer overflow-visible',
									'text-neutral-400 transition-colors hover:text-neutral-900',
									props.isDisabled ? 'hidden' : ''
								)}
							/>
							<IconSquarePlus
								tabIndex={-1}
								onClick={() => {
									props.onChange?.();
									dispatchConfiguration({type: 'ADD_SIBLING_OWNER_FROM_UUID', payload: UUID});
								}}
								className={cl(
									'h-4 w-4 cursor-pointer overflow-visible',
									'text-neutral-400 transition-colors hover:text-neutral-900',
									props.isDisabled ? 'hidden' : ''
								)}
							/>
						</div>
					)
				)}
			</div>
		</div>
	);
}

export function SectionThresholdInput(props: {onChange?: VoidFunction}): ReactElement {
	const {configuration, dispatchConfiguration} = useMultiSafe();

	return (
		<div aria-label={'threshold'}>
			<div className={'flex w-full flex-col'}>
				<Label
					title={'Threshold'}
					tooltipMessage={
						'Any transaction requires the confirmation of at least this number of owners. You can change this later.'
					}
				/>

				<div className={'w-fit'}>
					<div className={'smol--input-wrapper relative flex h-10 w-full items-center'}>
						<div className={'flex h-10 w-full flex-row items-center justify-between gap-4 px-2'}>
							<button
								type={'button'}
								className={cl(
									'flex h-6 w-6 items-center justify-center text-center',
									'outline outline-offset-2 rounded-md focus-within:outline-primary-600',
									'transition-colors text-neutral-0',
									'hover:bg-primary-800 disabled:opacity-10 bg-primary-600 '
								)}
								disabled={configuration.threshold <= 1}
								onClick={() => {
									props.onChange?.();
									dispatchConfiguration({
										type: 'SET_THRESHOLD',
										payload: configuration.threshold - 1
									});
								}}>
								<svg
									className={'h-3 w-3'}
									xmlns={'http://www.w3.org/2000/svg'}
									height={'1em'}
									viewBox={'0 0 448 512'}>
									<path
										d={
											'M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z'
										}
										fill={'currentColor'}
									/>
								</svg>
							</button>
							<p className={'font-number'}>{configuration.threshold}</p>
							<button
								type={'button'}
								className={cl(
									'flex h-6 w-6 items-center justify-center text-center',
									'outline outline-offset-2 rounded-md focus-within:outline-primary-600',
									'transition-colors text-neutral-0',
									'hover:bg-primary-800 disabled:opacity-10 bg-primary-600 '
								)}
								disabled={configuration.threshold >= configuration.owners.length}
								onClick={() => {
									props.onChange?.();
									dispatchConfiguration({
										type: 'SET_THRESHOLD',
										payload: configuration.threshold + 1
									});
								}}>
								<svg
									className={'h-3 w-3'}
									xmlns={'http://www.w3.org/2000/svg'}
									height={'1em'}
									viewBox={'0 0 448 512'}>
									<path
										d={
											'M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z'
										}
										fill={'currentColor'}
									/>
								</svg>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export function SectionPrefixInput(props: {onChange?: VoidFunction}): ReactElement {
	const {configuration, dispatchConfiguration} = useMultiSafe();

	return (
		<div
			aria-label={'prefix'}
			className={'flex w-full flex-col'}>
			<Label
				title={'Prefix'}
				tooltipMessage={
					'These are the letters and numbers at the beginning of your Safe address. Please note, the longer your custom string, the longer it will take to find a Safe.'
				}
			/>

			<div className={'smol--input-wrapper'}>
				<input
					onChange={(e): void => {
						const {value} = e.target;
						if (value.length <= 6) {
							if (value.match(/^0x[a-fA-F0-9]{0,6}$/)) {
								props.onChange?.();
								dispatchConfiguration({
									type: 'SET_PREFIX',
									payload: value
								});
							} else if (value.match(/^[a-fA-F0-9]{0,4}$/) && !value.startsWith('0x')) {
								props.onChange?.();
								dispatchConfiguration({
									type: 'SET_PREFIX',
									payload: `0x${value}`
								});
							}
						}
					}}
					type={'text'}
					value={configuration.prefix}
					pattern={'^0x[a-fA-F0-9]{0,6}$'}
					className={'smol--input font-mono font-bold'}
				/>
			</div>
		</div>
	);
}

export function SectionSuffixInput(props: {onChange?: VoidFunction}): ReactElement {
	const {configuration, dispatchConfiguration} = useMultiSafe();

	return (
		<div
			aria-label={'suffix'}
			className={'flex w-full flex-col'}>
			<Label
				title={'Suffix'}
				tooltipMessage={
					'These are the letters and numbers at the end of your Safe address. Please note, the longer your custom string, the longer it will take to find a Safe.'
				}
			/>

			<div className={'smol--input-wrapper'}>
				<input
					onChange={(e): void => {
						const {value} = e.target;
						if (value.length <= 4) {
							if (value.match(/^[a-fA-F0-9]{0,4}$/)) {
								props.onChange?.();
								dispatchConfiguration({
									type: 'SET_SUFFIX',
									payload: value
								});
							}
						}
					}}
					type={'text'}
					value={configuration.suffix}
					pattern={'[a-fA-F0-9]{0,6}$'}
					className={'smol--input font-mono font-bold'}
				/>
			</div>
		</div>
	);
}

export function SectionFactoryInput(props: {onChange?: VoidFunction}): ReactElement {
	const {configuration, dispatchConfiguration} = useMultiSafe();

	return (
		<div aria-label={'factory'}>
			<div className={'flex w-full flex-col'}>
				<Label
					title={'Factory'}
					tooltipMessage={'This is the factory contract that will be used to deploy your Safe.'}
				/>

				<div className={'box-0 flex h-10 w-full items-center p-2'}>
					<div className={'flex h-10 w-full flex-row items-center justify-between px-0 py-4'}>
						<select
							className={'smol--input font-mono font-bold'}
							value={configuration.factory}
							onChange={(e): void => {
								assert(['ssf', 'ddp'].includes(e.target.value));
								props.onChange?.();
								dispatchConfiguration({
									type: 'SET_FACTORY',
									payload: e.target.value as 'ssf' | 'ddp'
								});
							}}>
							<option value={'ssf'}>{'Safe Singleton Factory'}</option>
							<option value={'ddp'}>{'Deterministic Deployment Proxy'}</option>
						</select>
					</div>
				</div>
			</div>
		</div>
	);
}

export function SectionSeedInput(props: {onChange?: VoidFunction}): ReactElement {
	const {configuration, dispatchConfiguration} = useMultiSafe();

	return (
		<div aria-label={'seed'}>
			<div className={'flex w-full flex-col'}>
				<Label
					title={'Seed'}
					tooltipMessage={'This is a numeric value that determines the address of your safe.'}
				/>

				<div
					className={'mb-4 mt-1'}
					style={{
						display: configuration.prefix.length + configuration.suffix.length > 5 ? 'flex' : 'none'
					}}>
					<div
						className={cl(
							'flex flex-row whitespace-pre rounded-md border p-2 text-xs font-bold',
							'border-orange-200 !bg-orange-200/60 text-orange-600'
						)}>
						<IconWarning className={'mr-2 h-4 w-4 text-orange-600'} />
						{'The more characters you add, the longer it will take to find a safe (it can be hours).'}
					</div>
				</div>

				<div className={'box-0 flex h-10 w-full items-center p-2'}>
					<div className={'flex h-10 w-full flex-row items-center justify-between px-0 py-4'}>
						<input
							onChange={(e): void => {
								const {value} = e.target;
								props.onChange?.();
								dispatchConfiguration({
									type: 'SET_SEED',
									payload: BigInt(value.replace(/\D/g, ''))
								});
							}}
							type={'text'}
							value={configuration.seed.toString()}
							pattern={'[0-9]{0,512}$'}
							className={'smol--input font-number font-bold'}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
