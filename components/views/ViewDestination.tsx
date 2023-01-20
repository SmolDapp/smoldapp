import React, {useState} from 'react';
import IconCheck from 'components/icons/IconCheck';
import IconCircleCross from 'components/icons/IconCircleCross';
import {useSelected} from 'contexts/useSelected';
import {isAddress} from 'ethers/lib/utils';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {toAddress} from '@yearn-finance/web-lib/utils/address';

import type {ReactElement} from 'react';

function	ViewDestination(): ReactElement {
	const	{destinationAddress, set_destinationAddress} = useSelected();
	const	[destination, set_destination] = useState<string>('');
	const	[isValidDestination, set_isValidDestination] = useState<boolean>(true);

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
					<div className={'mt-6 flex w-3/4 flex-row items-center justify-between space-x-6'}>
						<div className={'box-100 grow-1 flex h-10 w-full items-center p-2'}>
							<div className={'flex h-10 w-full flex-row items-center justify-between py-4 px-0'}>
								<input
									aria-invalid={!isValidDestination}
									onFocus={(): void => set_isValidDestination(true)}
									onBlur={(): void => set_isValidDestination(isAddress(destination))}
									required
									placeholder={'0x...'}
									value={destination}
									onChange={(e): void => set_destination(e.target.value)}
									className={'w-full overflow-x-scroll border-none bg-transparent py-4 px-0 font-mono text-sm font-bold outline-none scrollbar-none'}
									type={'text'} />
							</div>
							<div className={'pointer-events-none relative h-4 w-4'}>
								<IconCheck
									className={`absolute h-4 w-4 text-[#16a34a] transition-opacity ${isAddress(destination) ? 'opacity-100' : 'opacity-0'}`} />
								<IconCircleCross
									className={`absolute h-4 w-4 text-[#e11d48] transition-opacity ${(!isValidDestination && destination !== '' ) ? 'opacity-100' : 'opacity-0'}`} />
							</div>
						</div>
						<div>
							<Button
								className={'yearn--button !w-[160px] rounded-md !text-sm'}
								onClick={(): void => {
									if (isAddress(destination)) {
										set_destinationAddress(toAddress(destination));
									}
								}}
								disabled={!isAddress(destination) || destinationAddress === toAddress(destination)}>
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
