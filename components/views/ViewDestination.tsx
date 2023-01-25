import React, {useCallback, useState} from 'react';
import IconCheck from 'components/icons/IconCheck';
import IconCircleCross from 'components/icons/IconCircleCross';
import {useSelected} from 'contexts/useSelected';
import {ethers} from 'ethers';
import {isAddress} from 'ethers/lib/utils';
import {useUpdateEffect} from '@react-hookz/web';
import {Button} from '@yearn-finance/web-lib/components/Button';
import IconLoader from '@yearn-finance/web-lib/icons/IconLoader';
import {isZeroAddress, toAddress} from '@yearn-finance/web-lib/utils/address';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';
import {getProvider} from '@yearn-finance/web-lib/utils/web3/providers';

import type {ReactElement} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/utils/address';

function	ViewDestination(): ReactElement {
	const	{destinationAddress, set_destinationAddress} = useSelected();
	const	[destination, set_destination] = useState<string>('');
	const	[validishDestination, set_validishDestination] = useState<string>('');
	const	[isValidDestination, set_isValidDestination] = useState<boolean | 'undetermined'>('undetermined');
	const	[isValidish, set_isValidish] = useState<boolean | 'undetermined'>('undetermined');
	const	[isLoadingValidish, set_isLoadingValidish] = useState<boolean>(false);

	const	checkDestinationValidity = useCallback(async (): Promise<void> => {
		set_isValidDestination('undetermined');
		if (validishDestination && isValidish) {
			set_isValidDestination(true);
		} else if (!isZeroAddress(toAddress(destination))) {
			set_isValidDestination(true);
		} else {
			if (destination.endsWith('.eth')) {
				const	resolvedAddress = await getProvider(1).resolveName(destination);
				if (resolvedAddress) {
					if (isAddress(resolvedAddress)) {
						performBatchedUpdates((): void => {
							set_validishDestination(toAddress(resolvedAddress));
							set_isValidDestination(true);
						});
						return;
					}
				}
			}
			set_isValidDestination(false);
		}
	}, [destination, validishDestination, isValidish]);

	useUpdateEffect((): void => {
		async function checkENSValidity(ens: string): Promise<[TAddress, boolean]> {
			const	resolvedName = await getProvider(1).resolveName(ens);
			if (resolvedName) {
				if (isAddress(resolvedName)) {
					return [toAddress(resolvedName), true];
				}
			}
			return [toAddress(ethers.constants.AddressZero), false];
		}
		set_isValidDestination('undetermined');
		set_isValidish('undetermined');
		if (destination.endsWith('.eth')) {
			set_isLoadingValidish(true);
			checkENSValidity(destination).then(([validishDest, isValid]): void => {
				performBatchedUpdates((): void => {
					set_isLoadingValidish(false);
					set_isValidish(isValid);
					set_validishDestination(validishDest);
				});
			});
		} else if (!isZeroAddress(toAddress(destination))) {
			set_isValidDestination(true);
		} else {
			set_isValidish(false);
		}
	}, [destination]);


	console.log(destinationAddress);
	return (
		<div id={'destination'} className={'pt-10'}>
			<div
				className={'box-0 grid w-full grid-cols-12 overflow-hidden'}>
				<div className={'col-span-12 flex flex-col p-6 text-neutral-900'}>
					<div className={'w-3/4'}>
						<b>{'Destination'}</b>
						<p className={'text-sm text-neutral-500'}>
							{'Enter the address where you want to migrate your funds to. Be sure to double check the address before proceeding.'}
						</p>
					</div>
					<div className={'mt-6 grid w-3/4 grid-cols-12 flex-row items-center justify-between gap-6'}>
						<div className={'box-100 grow-1 col-span-9 flex h-10 w-full items-center p-2'}>
							<div className={'flex h-10 w-full flex-row items-center justify-between py-4 px-0'}>
								<input
									aria-invalid={!isValidDestination}
									onFocus={async (): Promise<void> => checkDestinationValidity()}
									onBlur={async (): Promise<void> => checkDestinationValidity()}
									required
									placeholder={'0x...'}
									value={destination}
									onChange={(e): void => {
										set_isValidDestination('undetermined');
										set_destination(e.target.value);
									}}
									className={'w-full overflow-x-scroll border-none bg-transparent py-4 px-0 font-mono text-sm font-bold outline-none scrollbar-none'}
									type={'text'} />
							</div>
							<div className={'pointer-events-none relative h-4 w-4'}>
								<IconCheck
									className={`absolute h-4 w-4 text-[#16a34a] transition-opacity ${isValidDestination === true || isValidish === true ? 'opacity-100' : 'opacity-0'}`} />
								<IconCircleCross
									className={`absolute h-4 w-4 text-[#e11d48] transition-opacity ${(isValidDestination === false && destination !== '' && !isLoadingValidish) ? 'opacity-100' : 'opacity-0'}`} />
								<div className={'absolute inset-0 flex items-center justify-center'}>
									<IconLoader className={`h-4 w-4 animate-spin text-neutral-900 transition-opacity ${isLoadingValidish ? 'opacity-100' : 'opacity-0'}`} />
								</div>
							</div>
						</div>
						<div className={'col-span-3'}>
							<Button
								className={'yearn--button !w-[160px] rounded-md !text-sm'}
								onClick={(): void => {
									if (destination.endsWith('.eth')) {
										console.log(toAddress(validishDestination));
										set_destinationAddress(toAddress(validishDestination));
									} else if (isAddress(destination)) {
										set_destinationAddress(toAddress(destination));
									}
								}}
								disabled={(!isAddress(destination) || destinationAddress === toAddress(destination)) && !isValidish}>
								{'Confirm'}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ViewDestination;
