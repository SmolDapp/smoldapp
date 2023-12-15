import React, {Fragment, useCallback, useRef, useState} from 'react';
import {
	SectionFactoryInput,
	SectionOwnerInput,
	SectionPrefixInput,
	SectionSeedInput,
	SectionSuffixInput,
	SectionThresholdInput
} from 'components/apps/safe/Sections';
import {useMultiSafe} from 'components/apps/safe/useSafe';
import IconWarning from 'components/icons/IconWarning';
import {Button} from 'components/Primitives/Button';
import {concat, encodePacked, getContractAddress, hexToBigInt, keccak256, toHex} from 'viem';
import {isZeroAddress} from '@utils/tools.address';
import {cl} from '@yearn-finance/web-lib/utils/cl';

import {
	generateArgInitializers,
	GNOSIS_SAFE_PROXY_CREATION_CODE,
	PROXY_FACTORY_L2,
	PROXY_FACTORY_L2_DDP,
	SINGLETON_L2,
	SINGLETON_L2_DDP
} from './utils';

import type {ReactElement} from 'react';
import type {Hex} from 'viem';
import type {TAddress} from '@utils/tools.address';

type TComputeAddress = {
	argInitializers: string;
	bytecode: Hex;
	prefix: string;
	suffix: string;
};
function NewSafe(): ReactElement {
	const shouldCancel = useRef(false);
	const {configuration, dispatchConfiguration} = useMultiSafe();
	const [isLoadingSafes, set_isLoadingSafes] = useState(false);

	const compute = useCallback(
		async (props: TComputeAddress): Promise<{address: TAddress; salt: bigint}> => {
			if (shouldCancel.current) {
				return {address: '' as TAddress, salt: 0n};
			}

			if (configuration.settings.shouldUseExpertMode) {
				const salt = keccak256(
					encodePacked(['bytes', 'uint256'], [keccak256(`0x${props.argInitializers}`), configuration.seed])
				);
				const addrCreate2 = getContractAddress({
					bytecode: props.bytecode,
					from: configuration.factory == 'ssf' ? PROXY_FACTORY_L2 : PROXY_FACTORY_L2_DDP,
					opcode: 'CREATE2',
					salt
				});
				return {address: addrCreate2, salt: configuration.seed};
			}

			const saltNonce = hexToBigInt(keccak256(concat([toHex('smol'), toHex(Math.random().toString())])));
			dispatchConfiguration({type: 'SET_SEED', payload: saltNonce});
			const salt = keccak256(
				encodePacked(['bytes', 'uint256'], [keccak256(`0x${props.argInitializers}`), saltNonce])
			);
			const addrCreate2 = getContractAddress({
				bytecode: props.bytecode,
				from: configuration.factory == 'ssf' ? PROXY_FACTORY_L2 : PROXY_FACTORY_L2_DDP,
				opcode: 'CREATE2',
				salt
			});
			if (addrCreate2.startsWith(props.prefix) && addrCreate2.endsWith(props.suffix)) {
				return {address: addrCreate2, salt: saltNonce};
			}
			await new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, 0));
			return compute(props);
		},
		[configuration.factory, configuration.seed, configuration.settings.shouldUseExpertMode, dispatchConfiguration]
	);

	const generateCreate2Addresses = useCallback(async (): Promise<void> => {
		set_isLoadingSafes(true);
		const argInitializers = generateArgInitializers(configuration.owners, configuration.threshold);
		const bytecode = encodePacked(
			['bytes', 'uint256'],
			[
				GNOSIS_SAFE_PROXY_CREATION_CODE,
				hexToBigInt(configuration.factory == 'ssf' ? SINGLETON_L2 : SINGLETON_L2_DDP)
			]
		);
		const result = await compute({
			argInitializers,
			bytecode,
			prefix: configuration.prefix,
			suffix: configuration.suffix
		});

		if (shouldCancel.current) {
			shouldCancel.current = false;
			dispatchConfiguration({type: 'SET_ADDRESS', payload: undefined});
			set_isLoadingSafes(false);
			return;
		}
		shouldCancel.current = false;
		dispatchConfiguration({type: 'SET_ADDRESS', payload: result.address});
		dispatchConfiguration({type: 'SET_SEED', payload: result.salt});
		set_isLoadingSafes(false);
	}, [
		compute,
		configuration.factory,
		configuration.owners,
		configuration.prefix,
		configuration.suffix,
		configuration.threshold,
		dispatchConfiguration
	]);

	const onCancelGeneration = useCallback((): void => {
		shouldCancel.current = true;
		setTimeout((): void => {
			shouldCancel.current = false;
		}, 100);
	}, []);

	return (
		<Fragment>
			<SectionOwnerInput onChange={onCancelGeneration} />
			<div className={'mt-4 flex w-full gap-4'}>
				<SectionThresholdInput onChange={onCancelGeneration} />
				<div>
					<small className={''}>&nbsp;</small>
					<div
						className={cl(
							'w-full h-fit -mt-[1px] transition-opacity',
							configuration.owners.length > 1 && configuration.threshold > 1
								? 'opacity-0 pointer-events-none'
								: 'opacity-100'
						)}>
						<div
							className={cl(
								'flex py-2 px-3 items-start justify-center',
								'rounded-md border border-orange-200 !bg-orange-200/60',
								'text-xs font-bold text-orange-600 md:whitespace-pre'
							)}>
							<IconWarning className={'text-orange-600 mr-2 mt-[1px] h-4 w-4 min-w-[16px]'} />
							{'At least 1/2 threshold is recommanded to avoid issues.\n'}
							{'You can use any other wallet or even the Safe app on your phone as another owner.'}
						</div>
					</div>
				</div>
			</div>

			<div className={'mt-4 flex w-full gap-4'}>
				<SectionPrefixInput onChange={onCancelGeneration} />
				<SectionSuffixInput onChange={onCancelGeneration} />
			</div>

			{configuration.settings.shouldUseExpertMode ? (
				<div className={'mt-4'}>
					<SectionFactoryInput onChange={onCancelGeneration} />
				</div>
			) : null}

			{configuration.settings.shouldUseExpertMode ? (
				<div className={'mt-4'}>
					<SectionSeedInput onChange={onCancelGeneration} />
				</div>
			) : (
				<div className={'mt-2'}>
					<p
						className={
							'font-number max-w-[100%] break-all text-xxs text-neutral-400 md:whitespace-pre md:break-normal'
						}>
						{`Seed: ${configuration.seed.toString()}`}
					</p>
				</div>
			)}

			<div
				aria-label={'action-button'}
				className={'ml-auto'}>
				<small className={'mb-1'}>&nbsp;</small>

				<Button
					className={'group w-full'}
					isBusy={isLoadingSafes}
					isDisabled={configuration.owners.some((owner): boolean => !owner || isZeroAddress(owner.address))}
					onClick={(e: React.MouseEvent<HTMLButtonElement>): void => {
						e.currentTarget.blur();
						generateCreate2Addresses();
					}}>
					<p>{'Generate a Safe'}</p>
					{isLoadingSafes ? (
						<span
							onClick={(e: React.MouseEvent<HTMLButtonElement>): void => {
								e.currentTarget.blur();
								shouldCancel.current = true;
							}}
							className={
								'absolute inset-0 z-50 flex items-center justify-center transition-colors hover:cursor-pointer hover:bg-neutral-900 hover:!text-neutral-0'
							}>
							<p>{'Cancel'}</p>
						</span>
					) : null}
				</Button>
			</div>
		</Fragment>
	);
}

export default NewSafe;
