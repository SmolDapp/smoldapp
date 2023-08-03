import React, {useCallback, useState} from 'react';
import {DefaultSeo} from 'next-seo';
import ViewWallet from 'components/apps/0.ViewWallet';
import GNOSIS_SAFE_PROXY_FACTORY from 'utils/abi/gnosisSafeProxyFactory.abi';
import {SUPPORTED_CHAINS} from 'utils/constants';
import {concat, encodePacked, getContractAddress, hexToBigInt, keccak256, pad, toHex} from 'viem';
import ViewFlowSelection from '@safeCreatooor/1.ViewFlowSelection';
import ViewClonableSafe from '@safeCreatooor/2.ViewClonableSafe';
import ViewNewSafeOwners from '@safeCreatooor/3.ViewNewSafeOwners';
import ViewNewSafe from '@safeCreatooor/4.ViewNewSafe';
import ChainStatus from '@safeCreatooor/ChainStatus';
import {FALLBACK_HANDLER, GNOSIS_SAFE_PROXY_CREATION_CODE, PROXY_FACTORY, SINGLETON, ZERO} from '@safeCreatooor/constants';
import {SafeCreatorContextApp, Step, useSafeCreator} from '@safeCreatooor/useSafeCreator';
import {getNetwork as getWagmiNetwork, prepareWriteContract, switchNetwork} from '@wagmi/core';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {ZERO_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';
import {getNetwork} from '@yearn-finance/web-lib/utils/wagmi/utils';
import AddressInput, {defaultInputAddressLike} from '@common/AddressInput';

import type {ReactElement} from 'react';
import type {Hex} from 'viem';
import type {TAddress} from '@yearn-finance/web-lib/types';
import type {TInputAddressLike} from '@common/AddressInput';

const OWNERS = [
	toAddress('0x9E63B020ae098E73cF201EE1357EDc72DFEaA518'),
	toAddress('0x17640d0D8C93bF710b6Ee4208997BB727B5B7bc2')
];

function CreateSafe(): ReactElement {
	const {address} = useWeb3();
	const [existingSafe, set_existingSafe] = useState<TInputAddressLike>(defaultInputAddressLike);
	const [possibleSafes, set_possibleSafes] = useState<TNewSafe[]>([]);
	const [isLoadingSafes, set_isLoadingSafes] = useState(false);
	const [possibleSafeTested, set_possibleSafesTested] = useState(0);
	const [owners] = useState<TAddress[]>(OWNERS);
	const [threshold] = useState(2);

	const generateArgInitializers = useCallback((): string => {
		return (
			('b63e800d') + //Function signature
			('100').padStart(64, '0') + // Version
			(threshold.toString()).padStart(64, '0') + // Threshold
			ZERO_ADDRESS.substring(2).padStart(64, '0') + // Address zero, TO
			pad(toHex(0x120 + 0x20 * owners.length)).substring(2).padStart(64, '0') + // Data length
			FALLBACK_HANDLER.substring(2).padStart(64, '0') +
			ZERO_ADDRESS.substring(2).padStart(64, '0') + // paymentToken
			ZERO.padStart(64, '0') + // payment
			ZERO_ADDRESS.substring(2).padStart(64, '0') + // paymentReceiver
			owners.length.toString().padStart(64, '0') + // owners.length
			owners.map((owner): string => owner.substring(2).padStart(64, '0')).join('') + // owners
			ZERO.padStart(64, '0') // data.length
		);
	}, [owners, threshold]);

	async function compute({argInitializers, deploymentData, prefix}: {
		argInitializers: string,
		deploymentData: Hex,
		prefix: string
	}): Promise<TNewSafe> {
		// const saltNonce = 23852255158720756265179488563724881962711957437910578573581822779360580272507n;
		const saltNonce = hexToBigInt(keccak256(concat([toHex('smol'), toHex(Math.random().toString())])));
		const salt = keccak256(encodePacked(
			['bytes', 'uint256'],
			[keccak256(`0x${argInitializers}`), saltNonce]
		));
		const addrCreate2 = getContractAddress({
			bytecode: deploymentData,
			from: PROXY_FACTORY,
			opcode: 'CREATE2',
			salt: salt
		});
		if (addrCreate2.startsWith(prefix)) {
			return ({address: addrCreate2, salt: saltNonce, owners: owners, threshold: 2});
		}
		set_possibleSafesTested((prev): number => prev + 1);
		await new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, 0));
		return compute({argInitializers, deploymentData, prefix});
	}

	async function generateCreate2Addresses(): Promise<void> {
		set_isLoadingSafes(true);
		const argInitializers = generateArgInitializers();
		const deploymentData = encodePacked(
			['bytes', 'uint256'],
			[GNOSIS_SAFE_PROXY_CREATION_CODE, hexToBigInt(SINGLETON)]
		);
		const prefix = '0x';
		const result = await compute({argInitializers, deploymentData, prefix});
		set_possibleSafes((prev): TNewSafe[] => [result, ...prev]);
		set_isLoadingSafes(false);
	}

	const onDeploySafe = useCallback(async (chainID: number, saltNonce: bigint): Promise<void> => {
		const argInitializers = generateArgInitializers();
		try {
			const currentNetwork = getWagmiNetwork();
			if (currentNetwork.chain?.id !== chainID) {
				await switchNetwork({chainId: chainID});
			}
			const prepareWriteResult = await prepareWriteContract({
				account: address,
				address: PROXY_FACTORY,
				abi: GNOSIS_SAFE_PROXY_FACTORY,
				functionName: 'createProxyWithNonce',
				chainId: chainID,
				args: [SINGLETON, `0x${argInitializers}`, saltNonce]
			});
			console.log(prepareWriteResult.result);
			alert(`DEPLOYING SAFE ON ${getNetwork(chainID).name} with address ${prepareWriteResult.result}`);
			// await walletClient.writeContract(request);
		} catch (err) {
			console.error(err);
		}
	}, [address, generateArgInitializers]);

	return (
		<>
			<div className={'mt-20 grid grid-cols-2 items-center gap-0'}>
				<div className={'w-full'}>
					<form className={'flex w-full flex-row items-center justify-between gap-4'} onSubmit={async (e): Promise<void> => e.preventDefault()}>
						<div className={'w-full'}>
							<AddressInput
								value={existingSafe}
								onChangeValue={(e): void => set_existingSafe(e)} />
						</div>
						<div>
							<Button className={'yearn--button !w-[160px] rounded-md !text-sm'}>
								{'Retrieve a safe'}
							</Button>
						</div>
					</form>
				</div>
				<div className={'ml-6 flex flex-row'}>
					<div className={'relative mr-6 flex h-auto w-[1px] items-center justify-center bg-neutral-500'}>
						<div className={'bg-neutral-0 p-1 text-xxs text-neutral-500'}>
							{'OR'}
						</div>
					</div>
					<Button
						onClick={generateCreate2Addresses}
						className={'yearn--button !w-[160px] rounded-md !text-sm'}>
						{'Deploy a new safe'}
					</Button>
				</div>
			</div>

			<div className={'my-10 grid gap-4'}>
				{(possibleSafes || []).map(({address, owners, threshold, salt}: TNewSafe): ReactElement => (
					<div key={address} className={'box-100 relative px-6 py-4'}>
						<div className={'absolute right-2 top-2 flex flex-col rounded-lg border border-neutral-200 bg-neutral-0 px-4 py-2'}>
							<small className={'text-xxs text-neutral-500'}>{'Salt: '}</small>
							<p className={'font-number whitespace-pre text-xxs text-neutral-600'}>
								{salt.toString().match(/.{1,26}/g)?.join('\n')}
							</p>
						</div>
						<div className={'grid grid-cols-1 gap-20 transition-colors'}>
							<div className={'flex flex-col gap-4'}>
								<div className={'flex flex-col'}>
									<small className={'text-neutral-500'}>{'Safe Address '}</small>
									<b className={'font-number'}>{address}</b>
								</div>
								<div className={'flex flex-col'}>
									<small className={'text-neutral-500'}>{'Owners '}</small>
									<div>
										{owners.map((owner): ReactElement => (
											<b key={owner} className={'font-number block'}>{owner}</b>
										))}
									</div>
								</div>
								<div className={'flex flex-col'}>
									<small className={'text-neutral-500'}>{'Threshold '}</small>
									<b>{`${threshold} of ${owners.length}`}</b>
								</div>
								<div className={'flex flex-col'}>
									<small className={'text-neutral-500'}>{'Deployment status '}</small>
									<div className={'mt-1 flex flex-col gap-4'}>
										{SUPPORTED_CHAINS
											.filter((chain): boolean => chain.id !== 1101)
											.map((chain): ReactElement => (
												<ChainStatus
													key={chain.id}
													chain={chain}
													safeAddress={address} />
											))}
									</div>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</>
	);
}

type TNewSafe = {
	address: TAddress,
	owners: TAddress[],
	salt: bigint,
	threshold: number,
}
function Safe(): ReactElement {
	const {currentStep, selectedFlow, set_currentStep, set_selectedFlow} = useSafeCreator();
	const [owners, set_owners] = useState<TAddress[]>([]);
	const [threshold, set_threshold] = useState(1);

	return (
		<div className={'mx-auto grid w-full max-w-4xl'}>
			<div className={'mb-10 mt-6 flex flex-col justify-center md:mt-20'}>
				<h1 className={'-ml-1 mt-4 w-full text-3xl tracking-tight text-neutral-900 md:mt-6 md:w-1/2 md:text-5xl'}>
					{'Clone a Safe.'}
				</h1>
				<b className={'mt-4 w-full text-base leading-normal text-neutral-500 md:w-2/3 md:text-lg md:leading-8'}>
					{'Just because having the same address on all chains is way fancier.'}
				</b>
			</div>

			<ViewWallet
				onSelect={(): void => {
					set_currentStep(Step.FLOW);
					document?.getElementById('destination')?.scrollIntoView({behavior: 'smooth', block: 'center'});
				}} />

			<div
				id={'flow'}
				className={`pt-10 transition-opacity ${[Step.FLOW_DATA, Step.NEW_DEPLOY, Step.FLOW].includes(currentStep) ? 'opacity-100' : 'pointer-events-none h-0 overflow-hidden opacity-0'}`}>
				<ViewFlowSelection />
			</div>


			<div
				id={'flowData'}
				className={`pt-10 transition-opacity ${[Step.FLOW_DATA, Step.NEW_DEPLOY].includes(currentStep) ? 'opacity-100' : 'pointer-events-none h-0 overflow-hidden opacity-0'}`}>
				{selectedFlow === 'EXISTING' ? <ViewClonableSafe /> : null}
				{selectedFlow === 'NEW' ? (
					<ViewNewSafeOwners
						onUpdateSafeSettings={(newOwners, newThreshold): void => {
							performBatchedUpdates((): void => {
								set_currentStep(Step.NEW_DEPLOY);
								set_owners(newOwners);
								set_threshold(newThreshold);
							});
						}} />
				) : null}
			</div>

			<div
				id={'newDeploy'}
				className={`pt-10 transition-opacity ${[Step.NEW_DEPLOY].includes(currentStep) ? 'opacity-100' : 'pointer-events-none h-0 overflow-hidden opacity-0'}`}>
				{selectedFlow === 'NEW' ? <ViewNewSafe owners={owners} threshold={threshold} /> : null}
			</div>

		</div>
	);
}

export default function SafeWrapper(): ReactElement {
	return (
		<SafeCreatorContextApp>
			<>
				<DefaultSeo
					title={'Safe Creator - SmolDapp'}
					defaultTitle={'Safe Creator - SmolDapp'}
					description={'Create a same, same address, every chain. Fancy.'}
					openGraph={{
						type: 'website',
						locale: 'en-US',
						url: 'https://smold.app/safe',
						site_name: 'Safe Creator - SmolDapp',
						title: 'Safe Creator - SmolDapp',
						description: 'Create a same, same address, every chain. Fancy.',
						images: [
							{
								url: 'https://smold.app/og_disperse.png',
								width: 800,
								height: 400,
								alt: 'Safe Creator'
							}
						]
					}}
					twitter={{
						handle: '@smoldapp',
						site: '@smoldapp',
						cardType: 'summary_large_image'
					}} />
				<Safe />
			</>
		</SafeCreatorContextApp>
	);
}

