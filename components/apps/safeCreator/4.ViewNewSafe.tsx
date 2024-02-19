import React, {useCallback, useRef, useState} from 'react';
import {concat, encodePacked, getContractAddress, hexToBigInt, keccak256, toHex} from 'viem';
import {useMountEffect, useUpdateEffect} from '@react-hookz/web';
import {PopoverSettings} from '@common/PopoverSettings';
import {PopoverSettingsItemExpert} from '@common/PopoverSettings.item.expert';
import {PopoverSettingsItemTestnets} from '@common/PopoverSettings.item.testnets';
import ViewSectionHeading from '@common/ViewSectionHeading';

import {NewSafeExpertForm, NewSafeStandardForm} from './4.ViewNewSafe.form';
import {PossibleSafe} from './4.ViewNewSafe.possible';
import {
	GNOSIS_SAFE_PROXY_CREATION_CODE,
	PROXY_FACTORY_L2,
	PROXY_FACTORY_L2_DDP,
	SINGLETON_L2,
	SINGLETON_L2_DDP
} from './constants';
import {generateArgInitializers} from './utils';

import type {ReactElement} from 'react';
import type {Hex} from 'viem';
import type {TAddress} from '@yearn-finance/web-lib/types';

export type TNewSafe = {
	address: TAddress;
	owners: TAddress[];
	salt: bigint;
	threshold: number;
	prefix: string;
	suffix: string;
	singleton: `0x${string}`;
};
type TOwners = {
	address: TAddress | undefined;
	label: string;
	UUID: string;
};

export function newVoidOwner(): TOwners {
	return {
		address: undefined,
		label: '',
		UUID: crypto.randomUUID()
	};
}

type TViewNewSafe = {
	owners: TAddress[];
	threshold: number;
};
function ViewNewSafe({owners, threshold}: TViewNewSafe): ReactElement {
	const shouldCancel = useRef(false);
	const [isLoadingSafes, set_isLoadingSafes] = useState(false);
	const [shouldUseExpertMode, set_shouldUseExpertMode] = useState(false);
	const [shouldUseTestnets, set_shouldUseTestnets] = useState(false);
	const [possibleSafe, set_possibleSafe] = useState<TNewSafe | undefined>(undefined);
	const [currentSeed, set_currentSeed] = useState(0n);
	const [prefix, set_prefix] = useState('0x');
	const [suffix, set_suffix] = useState('');
	const [factory, set_factory] = useState<'ssf' | 'ddp'>('ssf');

	useMountEffect((): void => {
		set_currentSeed(hexToBigInt(keccak256(concat([toHex('smol'), toHex(Math.random().toString())]))));
		set_possibleSafe(undefined);
	});

	useUpdateEffect((): void => {
		set_possibleSafe(undefined);
	}, [owners, threshold]);

	const compute = useCallback(
		async ({
			argInitializers,
			bytecode,
			prefix,
			suffix,
			saltNonce
		}: {
			argInitializers: string;
			bytecode: Hex;
			prefix: string;
			suffix: string;
			saltNonce: bigint;
		}): Promise<{address: TAddress; salt: bigint}> => {
			if (shouldCancel.current) {
				return {address: '' as TAddress, salt: 0n};
			}
			const salt = keccak256(encodePacked(['bytes', 'uint256'], [keccak256(`0x${argInitializers}`), saltNonce]));
			const addrCreate2 = getContractAddress({
				bytecode,
				from: factory == 'ssf' ? PROXY_FACTORY_L2 : PROXY_FACTORY_L2_DDP,
				opcode: 'CREATE2',
				salt
			});
			if (addrCreate2.startsWith(prefix) && addrCreate2.endsWith(suffix)) {
				return {address: addrCreate2, salt: saltNonce};
			}
			const newSalt = hexToBigInt(keccak256(concat([toHex('smol'), toHex(Math.random().toString())])));
			set_currentSeed(newSalt);
			await new Promise(resolve => setTimeout(resolve, 0));
			return compute({argInitializers, bytecode, prefix, suffix, saltNonce: newSalt});
		},
		[shouldCancel, factory]
	);

	const generateCreate2Addresses = useCallback(async (): Promise<void> => {
		set_possibleSafe(undefined);
		const salt = currentSeed;

		set_isLoadingSafes(true);
		const argInitializers = generateArgInitializers(owners, threshold);
		const bytecode = encodePacked(
			['bytes', 'uint256'],
			[GNOSIS_SAFE_PROXY_CREATION_CODE, hexToBigInt(factory == 'ssf' ? SINGLETON_L2 : SINGLETON_L2_DDP)]
		);
		const result = await compute({argInitializers, bytecode, prefix, suffix, saltNonce: salt});
		if (shouldCancel.current) {
			shouldCancel.current = false;
			set_possibleSafe(undefined);
			set_isLoadingSafes(false);
			return;
		}
		shouldCancel.current = false;
		set_possibleSafe({
			address: result.address,
			salt: result.salt,
			owners,
			threshold,
			prefix,
			suffix,
			singleton: factory == 'ssf' ? SINGLETON_L2 : SINGLETON_L2_DDP
		});
		set_currentSeed(result.salt);
		set_isLoadingSafes(false);
	}, [currentSeed, owners, threshold, compute, prefix, suffix, factory]);

	function renderForm(): ReactElement {
		switch (shouldUseExpertMode) {
			case true:
				return (
					<NewSafeExpertForm
						owners={owners}
						prefix={prefix}
						set_prefix={set_prefix}
						suffix={suffix}
						set_suffix={set_suffix}
						currentSeed={currentSeed}
						set_currentSeed={set_currentSeed}
						factory={factory}
						set_factory={set_factory}
						onGenerate={generateCreate2Addresses}
						shouldCancel={shouldCancel}
						isLoadingSafes={isLoadingSafes}
					/>
				);
			default:
				return (
					<NewSafeStandardForm
						owners={owners}
						prefix={prefix}
						set_prefix={set_prefix}
						suffix={suffix}
						set_suffix={set_suffix}
						currentSeed={currentSeed}
						set_currentSeed={set_currentSeed}
						factory={factory}
						set_factory={set_factory}
						onGenerate={generateCreate2Addresses}
						shouldCancel={shouldCancel}
						isLoadingSafes={isLoadingSafes}
					/>
				);
		}
	}

	return (
		<section>
			<div className={'box-0 relative grid w-full grid-cols-12'}>
				<ViewSectionHeading
					title={'Feeling fancy?'}
					content={
						<span>
							{
								'Customize your Safe’s address if you want. A smol perk for using Smol.\nSmol charges a smol '
							}
							<span className={'font-medium text-neutral-600'}>{'fee of $4.20'}</span>
							{' per deployment.'}
						</span>
					}
					configSection={
						<PopoverSettings>
							<PopoverSettingsItemExpert
								isSelected={shouldUseExpertMode}
								set_isSelected={set_shouldUseExpertMode}
							/>
							<PopoverSettingsItemTestnets
								isSelected={shouldUseTestnets}
								set_isSelected={set_shouldUseTestnets}
							/>
						</PopoverSettings>
					}
				/>

				<div className={'col-span-12 p-4 pt-0 md:p-6 md:pt-0'}>{renderForm()}</div>

				<div className={'col-span-12 flex flex-col text-neutral-900'}>
					<div className={'grid gap-4'}>
						{possibleSafe && !isLoadingSafes ? (
							<PossibleSafe
								possibleSafe={possibleSafe}
								prefix={prefix}
								suffix={suffix}
								currentSeed={currentSeed}
								factory={factory}
								shouldUseTestnets={shouldUseTestnets}
								onGenerate={generateCreate2Addresses}
							/>
						) : null}
					</div>
				</div>
			</div>
		</section>
	);
}

export default ViewNewSafe;
