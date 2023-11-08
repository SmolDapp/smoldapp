import React from 'react';
import IconRefresh from 'components/icons/IconRefresh';
import {SUPPORTED_CHAINS} from 'utils/constants';
import {AddressLike} from '@yearn-finance/web-lib/components/AddressLike';
import {Renderable} from '@yearn-finance/web-lib/components/Renderable';
import {isZeroAddress, toAddress} from '@yearn-finance/web-lib/utils/address';

import ChainStatus from './ChainStatus';
import {SINGLETON_L2, SINGLETON_L2_DDP} from './constants';

import type {ReactElement} from 'react';
import type {TNewSafe} from './4.ViewNewSafe';

type TPossibleSafe = {
	possibleSafe: TNewSafe;
	prefix: string;
	suffix: string;
	currentSeed: bigint;
	factory: 'ssf' | 'ddp';
	shouldUseTestnets: boolean;
	onGenerate: VoidFunction;
};
function PossibleSafe({
	possibleSafe,
	prefix,
	suffix,
	currentSeed,
	factory,
	shouldUseTestnets,
	onGenerate
}: TPossibleSafe): ReactElement {
	const {address, owners, threshold, salt} = possibleSafe as TNewSafe;

	return (
		<div className={'p-4 pt-0 md:p-6 md:pt-0'}>
			<div className={'box-100 relative p-4 md:px-6'}>
				{possibleSafe?.prefix !== prefix ||
				possibleSafe?.suffix !== suffix ||
				possibleSafe.singleton !== (factory == 'ssf' ? SINGLETON_L2 : SINGLETON_L2_DDP) ||
				possibleSafe.salt !== currentSeed ? (
					<>
						<div className={'box-0 absolute right-2 top-2 hidden w-52 flex-row p-2 text-xs md:flex'}>
							<button
								className={'mr-1 mt-0.5 h-3 w-3 min-w-[16px]'}
								disabled={owners.some((owner): boolean => !owner || isZeroAddress(owner))}
								onClick={(e: React.MouseEvent<HTMLButtonElement>): void => {
									e.currentTarget.blur();
									onGenerate();
								}}>
								<IconRefresh
									className={
										'h-3 w-3 min-w-[16px] cursor-pointer text-neutral-500 transition-colors hover:text-neutral-900'
									}
								/>
							</button>
							{'Looks like you changed the Safe configuration, please hit generate again.'}
						</div>
						<div className={'absolute right-2 top-2 block p-2 text-xs md:hidden'}>
							<button
								className={'mr-1 mt-0.5 h-3 w-3 min-w-[16px]'}
								disabled={owners.some((owner): boolean => !owner || isZeroAddress(owner))}
								onClick={(e: React.MouseEvent<HTMLButtonElement>): void => {
									e.currentTarget.blur();
									onGenerate();
								}}>
								<IconRefresh
									className={
										'h-3 w-3 min-w-[16px] cursor-pointer text-neutral-500 transition-colors hover:text-neutral-900'
									}
								/>
							</button>
						</div>
					</>
				) : null}
				<div className={'grid grid-cols-1 gap-20 transition-colors'}>
					<div className={'flex flex-col gap-4'}>
						<div className={'flex flex-col'}>
							<small>{'Safe Address '}</small>
							<b className={'font-number break-all text-sm md:text-base'}>
								<Renderable
									shouldRender={!!address}
									fallback={<span className={'text-neutral-400'}>{'-'}</span>}>
									<AddressLike address={address} />
								</Renderable>
							</b>
						</div>
						<div className={'flex flex-col'}>
							<small>{'Owners '}</small>
							<Renderable
								shouldRender={!!owners && owners.length > 0}
								fallback={
									<div>
										<b className={'font-number block text-neutral-400'}>{'-'}</b>
										<b className={'font-number block text-neutral-400'}>{'-'}</b>
									</div>
								}>
								<div>
									{(owners || []).map(
										(owner): ReactElement => (
											<b
												key={owner}
												className={'font-number addr block text-sm md:text-base'}>
												<AddressLike address={owner} />
											</b>
										)
									)}
								</div>
							</Renderable>
						</div>
						<div className={'flex flex-col'}>
							<small>{'Threshold '}</small>
							<b className={'font-number block'}>
								<Renderable
									shouldRender={!!threshold}
									fallback={<span className={'text-neutral-400'}>{'-'}</span>}>
									{`${threshold || 0} of ${(owners || []).length}`}
								</Renderable>
							</b>
						</div>
						<div className={'flex flex-col'}>
							<small>{'Deployment status '}</small>
							<Renderable
								shouldRender={!!address}
								fallback={<span className={'text-neutral-400'}>{'-'}</span>}>
								<div className={'mt-1 grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4'}>
									{SUPPORTED_CHAINS.filter(
										(chain): boolean => ![5, 324, 1337, 84531].includes(chain.id)
									).map(
										(chain): ReactElement => (
											<ChainStatus
												key={chain.id}
												chain={chain}
												safeAddress={toAddress(address)}
												owners={owners || []}
												threshold={threshold || 0}
												singleton={possibleSafe?.singleton}
												salt={salt || 0n}
											/>
										)
									)}
								</div>
								{shouldUseTestnets && (
									<div
										className={
											'mt-6 grid grid-cols-2 gap-2 border-t border-primary-100 pt-6 md:grid-cols-3 md:gap-4'
										}>
										{SUPPORTED_CHAINS.filter((chain): boolean => ![324].includes(chain.id))
											.filter((chain): boolean => [5, 1337, 84531].includes(chain.id))
											.map(
												(chain): ReactElement => (
													<ChainStatus
														key={chain.id}
														chain={chain}
														safeAddress={toAddress(address)}
														owners={owners || []}
														threshold={threshold || 0}
														singleton={possibleSafe?.singleton}
														salt={salt || 0n}
													/>
												)
											)}
									</div>
								)}
							</Renderable>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export {PossibleSafe};
