import React, {useEffect, useState} from 'react';
import {Button} from 'components/Primitives/Button';
import {IconSpinner} from '@icons/IconSpinner';
import {defaultInputAddressLike, isZeroAddress, toAddress} from '@utils/tools.address';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import AddressInput from '@common/AddressInput';

import {useUserStreams} from './useUserStreams';
import {VestingElement} from './VestingElement';

import type {ReactElement} from 'react';
import type {TInputAddressLike} from '@utils/tools.address';

function ViewUserStreams(): ReactElement {
	const {address, ens} = useWeb3();
	const [receiver, set_receiver] = useState<TInputAddressLike>(defaultInputAddressLike);
	const [actualReceiver, set_actualReceiver] = useState<TInputAddressLike>(defaultInputAddressLike);
	const {data: userVestings, isFetching} = useUserStreams(actualReceiver);

	useEffect(() => {
		set_receiver({address: address, isValid: true, label: ens || address || ''});
		set_actualReceiver({address: address, isValid: true, label: ens || address || ''});
	}, [address, ens]);

	return (
		<section>
			<div className={'box-0 grid w-full grid-cols-12'}>
				<div className={'relative col-span-12 flex flex-col p-4 text-neutral-900 md:p-6'}>
					<div className={'w-full md:w-3/4'}>
						<b>{'Wow! Digital bearer assets flying through cyberspace every single second.'}</b>
						<p className={'text-neutral-500 text-sm'}>
							{'Feel free to claim your tokens whenever and your stream will keep streaming.'}
						</p>
					</div>

					<div className={'mt-6'}>
						<small className={'pb-1'}>{'Owner'}</small>
						<form
							onSubmit={async (e): Promise<void> => e.preventDefault()}
							className={'grid w-full grid-cols-12 flex-row items-center justify-between gap-4 md:gap-6'}>
							<div className={'col-span-12 md:col-span-9'}>
								<AddressInput
									value={receiver}
									onChangeValue={(e): void => set_receiver(e)}
								/>
							</div>
							<div className={'col-span-12 md:col-span-3'}>
								<Button
									className={'yearn--button w-full rounded-md !text-sm'}
									isDisabled={isZeroAddress(toAddress(receiver.address)) || !receiver.isValid}
									onClick={(): void => set_actualReceiver(receiver)}>
									{'Check streams'}
								</Button>
							</div>
						</form>
					</div>

					<div className={'box-0 divide-primary-200/60 mt-4 gap-6 divide-y md:mt-6'}>
						{isFetching ? (
							<div className={'col-span-12 flex min-h-[200px] flex-col items-center justify-center p-4'}>
								<IconSpinner />
								<p className={'text-neutral-500 mt-6 text-center text-sm'}>
									{
										'Just a second anon, an intern is racing through the digital ether to fetch your streams.'
									}
								</p>
							</div>
						) : userVestings.length === 0 ? (
							<div className={'col-span-12 flex min-h-[200px] flex-col items-center justify-center p-4'}>
								<svg
									className={'h-4 w-4 text-neutral-400'}
									xmlns={'http://www.w3.org/2000/svg'}
									viewBox={'0 0 512 512'}>
									<path
										d={
											'M505 41c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0L396.5 81.5C358.1 50.6 309.2 32 256 32C132.3 32 32 132.3 32 256c0 53.2 18.6 102.1 49.5 140.5L7 471c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l74.5-74.5c38.4 31 87.3 49.5 140.5 49.5c123.7 0 224-100.3 224-224c0-53.2-18.6-102.1-49.5-140.5L505 41zM362.3 115.7L115.7 362.3C93.3 332.8 80 295.9 80 256c0-97.2 78.8-176 176-176c39.9 0 76.8 13.3 106.3 35.7zM149.7 396.3L396.3 149.7C418.7 179.2 432 216.1 432 256c0 97.2-78.8 176-176 176c-39.9 0-76.8-13.3-106.3-35.7z'
										}
										fill={'currentcolor'}
									/>
								</svg>
								<p className={'text-neutral-500 mt-6 text-center text-sm'}>
									{
										'Oh no. Looks like you don’t have any streams yet. Feel free to set one up. Could be fun?'
									}
								</p>
							</div>
						) : (
							userVestings.map(vesting => <VestingElement vesting={vesting} />)
						)}
					</div>
				</div>
			</div>
		</section>
	);
}

export default ViewUserStreams;
