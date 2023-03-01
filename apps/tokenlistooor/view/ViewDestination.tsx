import React, {useCallback, useState} from 'react';
import IconCheck from 'apps/common/icons/IconCheck';
import IconCircleCross from 'apps/common/icons/IconCircleCross';
import {Step, useMigratooor} from 'apps/tokenlistooor/contexts/useMigratooor';
import {ethers} from 'ethers';
import {isAddress} from 'ethers/lib/utils';
import lensProtocol from 'utils/lens.tools';
import {useUpdateEffect} from '@react-hookz/web';
import {Button} from '@yearn-finance/web-lib/components/Button';
import IconLoader from '@yearn-finance/web-lib/icons/IconLoader';
import {isZeroAddress, toAddress} from '@yearn-finance/web-lib/utils/address';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';
import {getProvider} from '@yearn-finance/web-lib/utils/web3/providers';

import type {ReactElement} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/types';


function	SvgDesign(props: React.SVGProps<SVGSVGElement>): ReactElement {
	return (
		<>
			<svg
				{...props}
				viewBox={'0 0 132 132'}
				fill={'none'}
				xmlns={'http://www.w3.org/2000/svg'}>
				<path
					d={'M10.9546 34.0532L65.6064 2.49994L120.258 34.0532V97.1596L65.6064 128.713L10.9546 97.1596V34.0532Z'}
					stroke={'currentColor'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M10.9546 34.0532L65.6064 2.49994L120.258 34.0532V97.1596L65.6064 128.713L10.9546 97.1596V34.0532Z'}
					stroke={'currentColor'}
					stroke-opacity={'0.2'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M121.241 65.4756L65.6069 97.4915L9.97266 65.4756'}
					stroke={'currentColor'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M121.241 65.4756L65.6069 97.4915L9.97266 65.4756'}
					stroke={'currentColor'}
					stroke-opacity={'0.2'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M121.241 81.4829L93.424 97.4909L79.5154 105.495M9.97266 81.4829L37.7898 97.4909L51.6983 105.495'}
					stroke={'currentColor'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M121.241 81.4829L93.424 97.4909L79.5154 105.495M9.97266 81.4829L37.7898 97.4909L51.6983 105.495'}
					stroke={'currentColor'}
					stroke-opacity={'0.2'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M121.241 49.4668L65.6069 81.4827L9.97266 49.4668'}
					stroke={'currentColor'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M121.241 49.4668L65.6069 81.4827L9.97266 49.4668'}
					stroke={'currentColor'}
					stroke-opacity={'0.2'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M121.241 33.459L65.6069 65.4749L9.97266 33.459'}
					stroke={'currentColor'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M121.241 33.459L65.6069 65.4749L9.97266 33.459'}
					stroke={'currentColor'}
					stroke-opacity={'0.2'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M106.413 25.9834L65.606 49.4668L24.7988 25.9834'}
					stroke={'currentColor'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M106.413 25.9834L65.606 49.4668L24.7988 25.9834'}
					stroke={'currentColor'}
					stroke-opacity={'0.2'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M79.5801 25.418L65.606 33.4597L51.6318 25.418'}
					stroke={'currentColor'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M79.5801 25.418L65.606 33.4597L51.6318 25.418'}
					stroke={'currentColor'}
					stroke-opacity={'0.2'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M93.4238 33.459L65.6067 17.451L37.7896 33.459'}
					stroke={'currentColor'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M93.4238 33.459L65.6067 17.451L37.7896 33.459'}
					stroke={'currentColor'}
					stroke-opacity={'0.2'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M9.97184 97.4912L23.8804 89.4872M121.24 97.4912L107.332 89.4872'}
					stroke={'currentColor'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M9.97184 97.4912L23.8804 89.4872M121.24 97.4912L107.332 89.4872'}
					stroke={'currentColor'}
					stroke-opacity={'0.2'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M37.7893 97.4911L23.8807 105.495M93.4235 97.4911L107.332 105.495'}
					stroke={'currentColor'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M37.7893 97.4911L23.8807 105.495M93.4235 97.4911L107.332 105.495'}
					stroke={'currentColor'}
					stroke-opacity={'0.2'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M37.7896 113.499L65.6067 97.4911L93.4238 113.499'}
					stroke={'currentColor'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M37.7896 113.499L65.6067 97.4911L93.4238 113.499'}
					stroke={'currentColor'}
					stroke-opacity={'0.2'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M51.6976 121.503L65.6061 113.499L79.5146 121.503'}
					stroke={'currentColor'}
					stroke-width={'4.33002'}>
				</path>
				<path
					d={'M51.6976 121.503L65.6061 113.499L79.5146 121.503'}
					stroke={'currentColor'}
					stroke-opacity={'0.2'}
					stroke-width={'4.33002'}>
				</path>
			</svg>
		</>
	);
}

function	ViewDestination(): ReactElement {
	const	{set_destinationAddress, set_currentStep} = useMigratooor();
	const	[name, set_name] = useState<string>('');
	const	[description, set_description] = useState<string>('');
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
			if (destination.endsWith('.lens')) {
				const	resolvedAddress = await lensProtocol.getAddressFromHandle(destination);
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

		async function checkLensValidity(lens: string): Promise<[TAddress, boolean]> {
			const	resolvedName = await lensProtocol.getAddressFromHandle(lens);
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
		} else if (destination.endsWith('.lens')) {
			set_isLoadingValidish(true);
			checkLensValidity(destination).then(([validishDest, isValid]): void => {
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

	return (
		<>
			<b>{'Build you own Tokenlist'}</b>
			<p className={'mt-0 text-sm text-neutral-500'}>
				{'No matter your purpose, you can now deploy and manage a token registry on any supported chain. Select listooors, add tokens, upload logo and you\'re set!'}
			</p>
			<div className={'mt-6 grid grid-cols-12 gap-6 overflow-hidden'}>
				<div className={'col-span-4 w-full'}>
					<label className={'text-xs text-neutral-400'}>{'TokenList Image'}</label>
					<div className={'rounded-default flex aspect-square w-full flex-col items-center justify-center bg-neutral-900 p-6'}>
						<SvgDesign className={'mx-auto w-3/4 object-cover text-neutral-0'} />
					</div>
				</div>
				<div className={'col-span-8 w-full'}>
					<form
						onSubmit={async (e): Promise<void> => e.preventDefault()}
						className={'grid w-full flex-col gap-2'}>
						<div>
							<label className={'text-xs text-neutral-400'}>{'Tokenlist Name'}</label>
							<div className={'box-100 flex h-10 w-full items-center p-2'}>
								<div className={'flex h-10 w-full flex-row items-center justify-between py-4 px-0'}>
									<input
										required
										spellCheck={false}
										placeholder={'E.g. Smoldapp TokenList'}
										value={name}
										onChange={(e): void => set_name(e.target.value)}
										className={'w-full overflow-x-scroll border-none bg-transparent py-4 px-0 font-mono text-sm font-bold outline-none scrollbar-none placeholder:font-normal'}
										type={'text'} />
								</div>
							</div>
						</div>

						<div>
							<label className={'text-xs text-neutral-400'}>{'Description'}</label>
							<div className={'box-100 min-h-10 flex w-full items-center p-2'}>
								<div className={'min-h-10 flex w-full flex-row'}>
									<textarea
										required
										spellCheck={true}
										placeholder={'E.g. A curated list of tokens from all the token lists on tokenlistooor.'}
										value={description}
										onChange={(e): void => set_description(e.target.value)}
										className={'w-full overflow-x-scroll border-none bg-transparent p-0 font-mono text-sm font-bold outline-none scrollbar-none placeholder:font-normal'} />
								</div>
							</div>
						</div>

						<div>
							<label className={'text-xs text-neutral-400'}>{'Owner'}</label>
							<div className={'box-100 flex h-10 w-full items-center p-2'}>
								<div className={'flex h-10 w-full flex-row items-center justify-between py-4 px-0'}>
									<input
										aria-invalid={!isValidDestination}
										onFocus={async (): Promise<void> => checkDestinationValidity()}
										onBlur={async (): Promise<void> => checkDestinationValidity()}
										required
										spellCheck={false}
										placeholder={'0x...'}
										value={destination}
										onChange={(e): void => {
											set_isValidDestination('undetermined');
											set_destination(e.target.value);
										}}
										className={'w-full overflow-x-scroll border-none bg-transparent py-4 px-0 font-mono text-sm font-bold outline-none scrollbar-none placeholder:font-normal'}
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
						</div>
						<div >
							<label className={'text-xs'}>&nbsp;</label>
							<Button
								className={'yearn--button !w-[160px] rounded-md !text-sm'}
								onClick={(): void => {
									if (destination.endsWith('.eth') || destination.endsWith('.lens')) {
										set_destinationAddress(toAddress(validishDestination));
									} else if (isAddress(destination)) {
										set_destinationAddress(toAddress(destination));
									}
									set_currentStep(Step.SELECTOR);
								}}
								disabled={!(isValidDestination === true || isValidish === true)}>
								{'Deploy your list'}
							</Button>
						</div>
					</form>
				</div>
			</div>
		</>
	);
}

export default ViewDestination;
