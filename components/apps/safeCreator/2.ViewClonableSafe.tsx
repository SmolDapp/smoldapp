import React, {useCallback, useState} from 'react';
import AddressInput, {defaultInputAddressLike} from 'components/common/AddressInput';
import {SUPPORTED_CHAINS} from 'utils/constants';
import {fromHex,type Hex} from 'viem';
import axios from 'axios';
import {CALL_INIT_SIGNATURE, SAFE_CREATION_SIGNATURE, SAFE_CREATION_TOPIC} from '@safeCreatooor/constants';
import {fetchTransaction} from '@wagmi/core';
import {Button} from '@yearn-finance/web-lib/components/Button';
import Renderable from '@yearn-finance/web-lib/components/Renderable';
import {isZeroAddress, toAddress} from '@yearn-finance/web-lib/utils/address';
import {getClient, getNetwork} from '@yearn-finance/web-lib/utils/wagmi/utils';
import ViewSectionHeading from '@common/ViewSectionHeading';

import ChainStatus from './ChainStatus';

import type {TInputAddressLike} from 'components/common/AddressInput';
import type {ReactElement} from 'react';
import type {TAppExtendedChain} from 'utils/constants';
import type {TAddress} from '@yearn-finance/web-lib/types';
import type {FetchTransactionResult} from '@wagmi/core';

type TExistingSafeArgs = {
	address: TAddress,
	owners: TAddress[],
	salt: bigint,
	threshold: number,
	tx?: FetchTransactionResult,
	isLoading: boolean,
}
function ViewClonableSafe(): ReactElement {
	const [inputedValue, set_inputedValue] = useState<TInputAddressLike>(defaultInputAddressLike);
	const [existingSafeArgs, set_existingSafeArgs] = useState<TExistingSafeArgs | undefined>(undefined);

	const retrieveSafeTxHash = useCallback(async (address: TAddress): Promise<{hash: Hex, chainID: number} | undefined> => {
		for (const chain of SUPPORTED_CHAINS) {
			const publicClient = getClient(chain.id);
			const byteCode = await publicClient.getBytecode({address});
			if (byteCode) {
				let txHash: Hex | null = '0x0';

				const safeAPI = (getNetwork(chain.id) as TAppExtendedChain).safeApiUri;
				if (!safeAPI) {
					const rangeLimit = 10_000_000n;
					const currentBlockNumber = await publicClient.getBlockNumber();
					const deploymentBlockNumber = 0n;
					for (let i = deploymentBlockNumber; i < currentBlockNumber; i += rangeLimit) {
						const logs = await publicClient.getLogs({
							address,
							fromBlock: i,
							toBlock: i + rangeLimit
						});
						if (logs.length > 0 && logs[0].topics?.[0] === SAFE_CREATION_TOPIC) {
							txHash = logs[0].transactionHash;
						}
					}
				} else {
					const {data: creationData} = await axios.get(`${safeAPI}/api/v1/safes/${toAddress(address)}/creation/`);
					if (creationData?.transactionHash) {
						txHash = creationData.transactionHash;
					}
				}
				if (txHash) {
					return ({hash: txHash, chainID: chain.id});
				}
			}
		}
		return (undefined);
	}, []);

	const decodeArgInitializers = useCallback((argsHex: Hex): {owners: TAddress[], threshold: number, salt: bigint} => {
		const allParts = (argsHex.substring(10)).match(/.{1,64}/g);
		if (!allParts) {
			throw new Error('Invalid args');
		}
		const salt = `0x${allParts[2]}` as Hex;
		const args = argsHex.substring(argsHex.indexOf(SAFE_CREATION_SIGNATURE) + SAFE_CREATION_SIGNATURE.length);
		const parts = args.match(/.{1,64}/g);
		if (!parts) {
			throw new Error('Invalid args');
		}
		const threshold = Number(parts[1]);
		const ownersLength = Number(parts[8]);
		const owners = parts.slice(9, 9 + ownersLength).map((owner): TAddress => toAddress(`0x${owner.substring(24)}`));
		return ({owners, threshold, salt: fromHex(salt, 'bigint')});
	}, []);

	const retrieveSafe = useCallback(async (address: TAddress): Promise<void> => {
		set_existingSafeArgs({isLoading: true, owners: [], threshold: 0, address, salt: 0n});
		const result = await retrieveSafeTxHash(address);
		if (result) {
			const {hash, chainID} = result;
			const tx = await fetchTransaction({hash, chainId: chainID});
			const input = `0x${tx.input.substring(tx.input.indexOf(CALL_INIT_SIGNATURE))}`;
			const {owners, threshold, salt} = decodeArgInitializers(input as Hex);

			set_existingSafeArgs({owners, threshold, isLoading: false, address, salt, tx: tx});
		}
	}, [decodeArgInitializers, retrieveSafeTxHash]);

	return (
		<section>
			<div className={'box-0 grid w-full grid-cols-12'}>
				<ViewSectionHeading
					title={'Let’s make that safe multi chain anon. Hum. Which vault?'}
					content={'Boring warning: Please note:\nWhen cloning an existing safe, you’ll be recreating the ‘initial state’ of the safe.\nSo make sure the signers of the initial state of the safe are the signers you want to clone.'} />
				<div className={'col-span-12 p-4 pt-0 md:p-6 md:pt-0'}>
					<form
						onSubmit={async (e): Promise<void> => e.preventDefault()}
						className={'grid w-full grid-cols-12 flex-row items-center justify-between gap-4 md:w-3/4 md:gap-6'}>
						<div className={'col-span-12 md:col-span-9'}>
							<AddressInput
								value={inputedValue}
								onChangeValue={(e): void => set_inputedValue(e)} />
						</div>

						<div className={'col-span-12 md:col-span-3'}>
							<Button
								className={'yearn--button !w-[160px] rounded-md !text-sm'}
								isBusy={existingSafeArgs?.isLoading}
								onClick={async (): Promise<void> => retrieveSafe(toAddress(inputedValue.address))}
								isDisabled={isZeroAddress(toAddress(inputedValue.address)) || !inputedValue.isValid}>
								{'Next'}
							</Button>
						</div>
					</form>
				</div>

				<div className={'col-span-12 flex flex-col p-4 pt-0 text-neutral-900 md:p-6 md:pt-0'}>
					<div className={'box-100 relative px-6 py-4'}>
						<div className={'absolute right-2 top-2 flex flex-col rounded-lg border border-neutral-200 bg-neutral-0 px-4 py-2'}>
							<small className={'text-xxs text-neutral-500'}>{'Salt: '}</small>
							<p className={'font-number whitespace-pre text-xxs text-neutral-600'}>
								{(existingSafeArgs?.salt || 0n).toString().match(/.{1,26}/g)?.join('\n')}
							</p>
						</div>
						<div className={'grid grid-cols-1 gap-20 transition-colors'}>
							<div className={'flex flex-col gap-4'}>
								<div className={'flex flex-col'}>
									<small className={'text-neutral-500'}>{'Safe Address '}</small>
									<b className={'font-number'}>
										<Renderable
											shouldRender={!!existingSafeArgs?.address}
											fallback={<span className={'text-neutral-400'}>{'-'}</span>}>
											{existingSafeArgs?.address}
										</Renderable>
									</b>
								</div>
								<div className={'flex flex-col'}>
									<small className={'text-neutral-500'}>{'Owners '}</small>
									<Renderable
										shouldRender={!!existingSafeArgs?.owners && existingSafeArgs?.owners.length > 0}
										fallback={(
											<div>
												<b className={'font-number block text-neutral-400'}>{'-'}</b>
												<b className={'font-number block text-neutral-400'}>{'-'}</b>
											</div>
										)}>
										<div>
											{(existingSafeArgs?.owners || []).map((owner): ReactElement => (
												<b key={owner} className={'font-number block'}>{owner}</b>
											))}
										</div>
									</Renderable>
								</div>
								<div className={'flex flex-col'}>
									<small className={'text-neutral-500'}>{'Threshold '}</small>
									<b className={'font-number block'}>
										<Renderable
											shouldRender={!!existingSafeArgs?.threshold}
											fallback={<span className={'text-neutral-400'}>{'-'}</span>}>
											{`${existingSafeArgs?.threshold || 0} of ${(existingSafeArgs?.owners || []).length}`}
										</Renderable>
									</b>
								</div>
								<div className={'flex flex-col'}>
									<small className={'text-neutral-500'}>{'Deployment status '}</small>
									<Renderable
										shouldRender={!!existingSafeArgs?.address}
										fallback={<span className={'text-neutral-400'}>{'-'}</span>}>
										<div className={'mt-1 grid grid-cols-3 gap-4'}>
											{SUPPORTED_CHAINS
												.filter((chain): boolean => chain.id !== 1101)
												.map((chain): ReactElement => (
													<ChainStatus
														key={chain.id}
														chain={chain}
														safeAddress={toAddress(existingSafeArgs?.address)}
														originalTx={existingSafeArgs?.tx}
														owners={existingSafeArgs?.owners || []}
														threshold={existingSafeArgs?.threshold || 0}
														salt={existingSafeArgs?.salt || 0n} />
												))}
										</div>
									</Renderable>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export default ViewClonableSafe;
