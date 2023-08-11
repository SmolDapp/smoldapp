import React, {useCallback, useRef, useState} from 'react';
import IconInfo from 'components/icons/IconInfo';
import IconRefresh from 'components/icons/IconRefresh';
import IconWarning from 'components/icons/IconWarning';
import {SUPPORTED_CHAINS} from 'utils/constants';
import {concat, encodePacked, getContractAddress, hexToBigInt, keccak256, toHex} from 'viem';
import {useMountEffect} from '@react-hookz/web';
import {AddressLike} from '@yearn-finance/web-lib/components/AddressLike';
import {Button} from '@yearn-finance/web-lib/components/Button';
import Renderable from '@yearn-finance/web-lib/components/Renderable';
import {isZeroAddress, toAddress} from '@yearn-finance/web-lib/utils/address';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';
import ViewSectionHeading from '@common/ViewSectionHeading';

import ChainStatus from './ChainStatus';
import {GNOSIS_SAFE_PROXY_CREATION_CODE, PROXY_FACTORY, SINGLETON} from './constants';
import {generateArgInitializers} from './utils';

import type {ReactElement} from 'react';
import type {Hex} from 'viem';
import type {TAddress} from '@yearn-finance/web-lib/types';

type TNewSafe = {
	address: TAddress,
	owners: TAddress[],
	salt: bigint,
	threshold: number,
	prefix: string,
	suffix: string
}
type TOwners = {
	address: TAddress | undefined,
	label: string,
	UUID: string
};

export function newVoidOwner(): TOwners {
	return ({
		address: undefined,
		label: '',
		UUID: crypto.randomUUID()
	});
}

type TViewNewSafe = {
	owners: TAddress[],
	threshold: number,
}
function ViewNewSafe({owners, threshold}: TViewNewSafe): ReactElement {
	const shouldCancel = useRef(false);
	const [isLoadingSafes, set_isLoadingSafes] = useState(false);
	const [possibleSafe, set_possibleSafe] = useState<TNewSafe | undefined>(undefined);
	const [currentSeed, set_currentSeed] = useState(0n);
	const [prefix, set_prefix] = useState('0x');
	const [suffix, set_suffix] = useState('');

	useMountEffect((): void => {
		set_currentSeed(hexToBigInt(keccak256(concat([toHex('smol'), toHex(Math.random().toString())]))));
		set_possibleSafe(undefined);
	});

	const compute = useCallback(async ({argInitializers, bytecode, prefix, suffix, saltNonce}: {
		argInitializers: string,
		bytecode: Hex,
		prefix: string,
		suffix: string,
		saltNonce: bigint
	}): Promise<{address: TAddress, salt: bigint}> => {
		if (shouldCancel.current) {
			return ({address: '' as TAddress, salt: 0n});
		}
		const salt = keccak256(encodePacked(
			['bytes', 'uint256'],
			[keccak256(`0x${argInitializers}`), saltNonce]
		));
		const addrCreate2 = getContractAddress({bytecode, from: PROXY_FACTORY, opcode: 'CREATE2', salt});
		if (addrCreate2.startsWith(prefix) && addrCreate2.endsWith(suffix)) {
			return ({address: addrCreate2, salt: saltNonce});
		}
		const newSalt = hexToBigInt(keccak256(concat([toHex('smol'), toHex(Math.random().toString())])));
		set_currentSeed(newSalt);
		await new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, 0));
		return compute({argInitializers, bytecode, prefix, suffix, saltNonce: newSalt});
	}, [shouldCancel]);

	const generateCreate2Addresses = useCallback(async (): Promise<void> => {
		set_possibleSafe(undefined);
		let salt = currentSeed;
		if (currentSeed === possibleSafe?.salt) {
			salt = hexToBigInt(keccak256(concat([toHex('smol'), toHex(Math.random().toString())])));
			set_possibleSafe({address: '' as TAddress, owners: [], salt: 0n, threshold: 0, prefix, suffix});
		}

		set_isLoadingSafes(true);
		const argInitializers = generateArgInitializers(owners, threshold);
		const bytecode = encodePacked(
			['bytes', 'uint256'],
			[GNOSIS_SAFE_PROXY_CREATION_CODE, hexToBigInt(SINGLETON)]
		);
		const result = await compute({argInitializers, bytecode, prefix, suffix, saltNonce: salt});
		if (shouldCancel.current) {
			shouldCancel.current = false;
			set_possibleSafe(undefined);
			set_isLoadingSafes(false);
			return;
		}
		shouldCancel.current = false;
		performBatchedUpdates((): void => {
			set_possibleSafe({
				address: result.address,
				salt: result.salt,
				owners,
				threshold,
				prefix,
				suffix
			});
			set_isLoadingSafes(false);
		});
	}, [currentSeed, possibleSafe?.salt, owners, threshold, compute, prefix, suffix]);

	function renderPossibleSafe(): ReactElement {
		const {address, owners, threshold, salt} = possibleSafe as TNewSafe;
		return (
			<div className={'p-4 pt-0 md:p-6 md:pt-0'}>
				<div className={'box-100 relative px-6 py-4'}>
					{possibleSafe?.prefix !== prefix || possibleSafe?.suffix !== suffix ? (
						<div className={'box-0 absolute right-2 top-2 flex w-52 flex-row p-2 text-xs'}>
							<button
								className={'mr-1 mt-0.5 h-3 w-3 min-w-[16px]'}
								disabled={owners.some((owner): boolean => !owner || isZeroAddress(owner))}
								onClick={(e: React.MouseEvent<HTMLButtonElement>): void => {
									e.currentTarget.blur();
									generateCreate2Addresses();
								}}>
								<IconRefresh
									className={'h-3 w-3 min-w-[16px] cursor-pointer text-neutral-500 transition-colors hover:text-neutral-900'} />
							</button>
							{'Looks like you changed the prefix, please hit generate again.'}
						</div>
					) : null}
					<div className={'grid grid-cols-1 gap-20 transition-colors'}>
						<div className={'flex flex-col gap-4'}>
							<div className={'flex flex-col'}>
								<small className={'text-neutral-500'}>{'Safe Address '}</small>
								<b className={'font-number'}>
									<Renderable
										shouldRender={!!address}
										fallback={<span className={'text-neutral-400'}>{'-'}</span>}>
										<AddressLike address={address} />
									</Renderable>
								</b>
							</div>
							<div className={'flex flex-col'}>
								<small className={'text-neutral-500'}>{'Owners '}</small>
								<Renderable
									shouldRender={!!owners && owners.length > 0}
									fallback={(
										<div>
											<b className={'font-number block text-neutral-400'}>{'-'}</b>
											<b className={'font-number block text-neutral-400'}>{'-'}</b>
										</div>
									)}>
									<div>
										{(owners || []).map((owner): ReactElement => (
											<b key={owner} className={'font-number block'}>
												<AddressLike address={owner} />
											</b>
										))}
									</div>
								</Renderable>
							</div>
							<div className={'flex flex-col'}>
								<small className={'text-neutral-500'}>{'Threshold '}</small>
								<b className={'font-number block'}>
									<Renderable
										shouldRender={!!threshold}
										fallback={<span className={'text-neutral-400'}>{'-'}</span>}>
										{`${threshold || 0} of ${(owners || []).length}`}
									</Renderable>
								</b>
							</div>
							<div className={'flex flex-col'}>
								<small className={'text-neutral-500'}>{'Deployment status '}</small>
								<Renderable
									shouldRender={!!address}
									fallback={<span className={'text-neutral-400'}>{'-'}</span>}>
									<div className={'mt-1 grid grid-cols-3 gap-4'}>
										{SUPPORTED_CHAINS
											.filter((chain): boolean => chain.id !== 1101)
											.map((chain): ReactElement => (
												<ChainStatus
													key={chain.id}
													chain={chain}
													safeAddress={toAddress(address)}
													owners={owners || []}
													threshold={threshold || 0}
													salt={salt || 0n} />
											))}
									</div>
								</Renderable>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<section>
			<div className={'box-0 grid w-full grid-cols-12'}>
				<ViewSectionHeading
					title={'Feeling fancy?'}
					content={
						<span>
							{'Customize your Safe’s address if you want. A smol perk for using Smol.\nSmol charges a smol '}
							<span className={'font-medium text-neutral-600'}>{'fee of $4.20'}</span>
							{' per deployment.'}
						</span>
					} />
				<div className={'col-span-12 p-4 pt-0 md:p-6 md:pt-0'}>
					<form
						onSubmit={async (e): Promise<void> => e.preventDefault()}
						className={'items-center justify-between gap-4 md:gap-6'}>
						<div>
							<div className={'grid grid-cols-3 gap-x-6 gap-y-2'}>
								<div>
									<div className={'pb-2 text-xs text-neutral-600'}>
										<div className={'flex w-fit flex-row items-center space-x-1'}>
											<p className={'font-inter font-semibold'}>{'Prefix'}</p>
											<span className={'tooltip'}>
												<IconInfo className={'h-3 w-3 text-neutral-500'} />
												<span className={'tooltipLight top-full mt-1'}>
													<div className={'font-number w-60 border border-neutral-300 bg-neutral-100 p-1 px-2 text-center text-xs text-neutral-900'}>
														<p>{'These are the letters and numbers at the beginning of your Safe address. Please note, the longer your custom string, the longer it will take to find a Safe.'}</p>
													</div>
												</span>
											</span>
										</div>
									</div>
									<div className={'box-0 flex h-10 w-full items-center p-2'}>
										<div className={'flex h-10 w-full flex-row items-center justify-between px-0 py-4'}>
											<input
												autoFocus
												onChange={(e): void => {
													const {value} = e.target;
													if (value.length <= 6) {
														if (value.match(/^0x[a-fA-F0-9]{0,6}$/)) {
															set_prefix(value);
														} else if (value.match(/^[a-fA-F0-9]{0,4}$/) && !value.startsWith('0x')) {
															set_prefix(`0x${value}`);
														}
													}
												}}
												type={'text'}
												value={prefix}
												pattern={'^0x[a-fA-F0-9]{0,6}$'}
												className={'w-full overflow-x-scroll border-none bg-transparent px-0 py-4 font-mono text-sm font-bold outline-none scrollbar-none'} />
										</div>
									</div>
								</div>
								<div>
									<div className={'pb-2 text-xs text-neutral-600'}>
										<div className={'flex w-fit flex-row items-center space-x-1'}>
											<p className={'font-inter font-semibold'}>{'Suffix'}</p>
											<span className={'tooltip'}>
												<IconInfo className={'h-3 w-3 text-neutral-500'} />
												<span className={'tooltipLight top-full mt-1'}>
													<div className={'font-number w-60 border border-neutral-300 bg-neutral-100 p-1 px-2 text-center text-xs text-neutral-900'}>
														<p>{'These are the letters and numbers at the end of your Safe address. Please note, the longer your custom string, the longer it will take to find a Safe.'}</p>
													</div>
												</span>
											</span>
										</div>
									</div>
									<div className={'box-0 flex h-10 w-full items-center p-2'}>
										<div className={'flex h-10 w-full flex-row items-center justify-between px-0 py-4'}>
											<input
												onChange={(e): void => {
													const {value} = e.target;
													if (value.length <= 4) {
														if (value.match(/^[a-fA-F0-9]{0,4}$/)) {
															set_suffix(value);
														}
													}
												}}
												type={'text'}
												value={suffix}
												pattern={'[a-fA-F0-9]{0,6}$'}
												className={'w-full overflow-x-scroll border-none bg-transparent px-0 py-4 font-mono text-sm font-bold outline-none scrollbar-none'} />
										</div>
									</div>
								</div>
								<div>
									<p className={'font-inter pb-2 text-xs font-semibold text-neutral-600'}>
										&nbsp;
									</p>
									<Button
										className={'group w-full'}
										isBusy={isLoadingSafes}
										isDisabled={owners.some((owner): boolean => !owner || isZeroAddress(owner))}
										onClick={(e: React.MouseEvent<HTMLButtonElement>): void => {
											e.currentTarget.blur();
											generateCreate2Addresses();
										}}>
										<p>{'Generate'}</p>
										{isLoadingSafes ? (
											<span
												onClick={(e: React.MouseEvent<HTMLButtonElement>): void => {
													e.currentTarget.blur();
													shouldCancel.current = true;
												}}
												className={'absolute inset-0 z-50 flex items-center justify-center transition-colors hover:cursor-pointer hover:bg-neutral-900 hover:!text-neutral-0'}>
												<p>{'Cancel'}</p>
											</span>
										) : null}
									</Button>
								</div>
								<div className={'col-span-2'}>
									<div className={'mt-1'} style={{display: ((prefix.length + suffix.length) > 5) ? 'flex' : 'none'}}>
										<div className={'flex flex-row whitespace-pre rounded-md border border-orange-200 !bg-orange-200/60 p-2 text-xs font-bold text-orange-600'}>
											<IconWarning className={'mr-2 h-4 w-4 text-orange-600'} />
											{'The more characters you add, the longer it will take to find a safe (which can be hours).'}
										</div>
									</div>
									<div className={'mt-2'}>
										<p className={'font-number max-w-[100%] whitespace-pre text-xxs text-neutral-400'}>
											{`Seed: ${currentSeed.toString()}`}
										</p>
									</div>
								</div>
							</div>
						</div>

					</form>
				</div>

				<div className={'col-span-12 flex flex-col text-neutral-900'}>
					<div className={'grid gap-4'}>
						{possibleSafe && !isLoadingSafes ? renderPossibleSafe() : null}
					</div>
				</div>
			</div>
		</section>
	);
}

export default ViewNewSafe;
