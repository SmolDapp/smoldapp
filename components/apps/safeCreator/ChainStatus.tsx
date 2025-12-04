import {useCallback, useEffect, useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DISPERSE_ABI from 'utils/abi/disperse.abi';
import GNOSIS_SAFE_PROXY_FACTORY from 'utils/abi/gnosisSafeProxyFactory.abi';
import {multicall} from 'utils/actions';
import {DISPERSE_CONTRACT_PER_CHAIN, SAFE_UI_BASE_URI, type TAppExtendedChain} from 'utils/constants';
import {encodeFunctionData, parseEther} from 'viem';
import {baseGoerli, goerli} from 'viem/chains';
import {
	getNetwork as getWagmiNetwork,
	prepareSendTransaction,
	sendTransaction,
	switchNetwork,
	waitForTransaction
} from '@wagmi/core';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {toast} from '@yearn-finance/web-lib/components/yToast';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {IconLinkOut} from '@yearn-finance/web-lib/icons/IconLinkOut';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {getClient, getNetwork} from '@yearn-finance/web-lib/utils/wagmi/utils';
import {defaultTxStatus} from '@yearn-finance/web-lib/utils/web3/transaction';

import {
	DEFAULT_FEES_USD,
	PROXY_FACTORY_L1,
	PROXY_FACTORY_L2,
	PROXY_FACTORY_L2_DDP,
	SINGLETON_L1,
	SINGLETON_L2,
	SINGLETON_L2_DDP
} from './constants';
import {useSafeCreator} from './useSafeCreator';
import {generateArgInitializers} from './utils';

import type {ReactElement} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/types';
import type {Chain, FetchTransactionResult} from '@wagmi/core';

function getProxyFromSingleton(singleton: TAddress): TAddress {
	if (singleton === SINGLETON_L2) {
		return PROXY_FACTORY_L2;
	}
	if (singleton === SINGLETON_L2_DDP) {
		return PROXY_FACTORY_L2_DDP;
	}
	if (singleton === SINGLETON_L1) {
		return PROXY_FACTORY_L1;
	}
	return PROXY_FACTORY_L2;
}

type TChainStatusArgs = {
	chain: Chain;
	safeAddress: TAddress;
	originalTx?: FetchTransactionResult;
	owners: TAddress[];
	threshold: number;
	salt: bigint;
	singleton?: TAddress;
};

function ChainStatus({
	chain,
	safeAddress,
	originalTx,
	owners,
	threshold,
	salt,
	singleton
}: TChainStatusArgs): ReactElement {
	const {chainCoinPrices} = useSafeCreator();
	const gasCoinID = (getNetwork(chain.id) as TAppExtendedChain).coingeckoGasCoinID;
	const coinPrice = chainCoinPrices?.[gasCoinID]?.usd;
	const {provider, address} = useWeb3();
	const [isDeployedOnThatChain, set_isDeployedOnThatChain] = useState(false);
	const [cloneStatus, set_cloneStatus] = useState(defaultTxStatus);
	const [canDeployOnThatChain, set_canDeployOnThatChain] = useState({
		canDeploy: true,
		isLoading: true,
		method: 'contract'
	});

	/* 🔵 - Smold App **************************************************************************
	 ** If the safe is already deployed on that chain, we don't need to do anything.
	 ******************************************************************************************/
	const checkIfDeployedOnThatChain = useCallback(async (): Promise<void> => {
		if (chain.id === goerli.id || chain.id === baseGoerli.id) {
			return set_isDeployedOnThatChain(false);
		}
		try {
			const publicClient = getClient(chain.id);
			const byteCode = await publicClient.getBytecode({address: safeAddress});
			if (byteCode) {
				set_isDeployedOnThatChain(true);
			} else {
				set_isDeployedOnThatChain(false);
			}
		} catch (error) {
			set_isDeployedOnThatChain(false);
		}
	}, [chain.id, safeAddress]);

	/* 🔵 - Smold App **************************************************************************
	 ** As we want to be sure to deploy the safe on the same address as the original transaction,
	 ** we need to check if the address we expect is the same as the one we get from the proxy
	 ** factory.
	 ** We do this by simulating the creation of a new safe with the same arguments as the
	 ** original transaction.
	 ******************************************************************************************/
	const checkDeploymentExpectedAddress = useCallback(async (): Promise<void> => {
		if (owners.length === 0) {
			return;
		}
		const publicClient = getClient(chain.id);
		let prepareWriteAddress = toAddress();
		let prepareCallAddress = toAddress();
		try {
			const signletonToUse = singleton || SINGLETON_L2;
			if (signletonToUse === SINGLETON_L1) {
				return set_canDeployOnThatChain({canDeploy: false, isLoading: false, method: 'none'});
			}
			const argInitializers = generateArgInitializers(owners, threshold);
			const prepareWriteResult = await publicClient.simulateContract({
				account: address,
				address: getProxyFromSingleton(signletonToUse),
				abi: GNOSIS_SAFE_PROXY_FACTORY,
				functionName: 'createProxyWithNonce',
				args: [signletonToUse, `0x${argInitializers}`, salt]
			});
			prepareWriteAddress = toAddress(prepareWriteResult.result);
			if (prepareWriteAddress === safeAddress) {
				return set_canDeployOnThatChain({canDeploy: true, isLoading: false, method: 'contract'});
			}
		} catch (err) {
			//
		}

		try {
			const directCall = await publicClient.call({
				to: toAddress(originalTx?.to),
				account: address,
				data: originalTx?.input
			});
			if (directCall?.data) {
				prepareCallAddress = toAddress(`0x${directCall.data.substring(26)}`);
				if (prepareCallAddress === safeAddress) {
					return set_canDeployOnThatChain({canDeploy: true, isLoading: false, method: 'direct'});
				}
			}
		} catch (err) {
			//
		}
		return set_canDeployOnThatChain({canDeploy: false, isLoading: false, method: 'none'});
	}, [address, chain.id, originalTx?.input, originalTx?.to, owners, safeAddress, salt, singleton, threshold]);

	useEffect((): void => {
		checkIfDeployedOnThatChain();
		checkDeploymentExpectedAddress();
	}, [checkDeploymentExpectedAddress, checkIfDeployedOnThatChain]);

	/* 🔵 - Smold App **************************************************************************
	 ** When the user clicks on the deploy button, we will try to deploy the safe on the chain
	 ** the user selected.
	 ** This can be done in two ways:
	 ** - Directly, by cloning the original transaction and sending it to the chain.
	 ** - By using the proxy factory to deploy a new safe with the same arguments as the original
	 **   transaction.
	 ******************************************************************************************/
	const onDeploySafe = useCallback(async (): Promise<void> => {
		if (!canDeployOnThatChain.canDeploy) {
			console.error('Cannot deploy on that chain');
			return;
		}

		/* 🔵 - Smold App **************************************************************************
		 ** First, make sure we are using the correct chainID to deploy this safe.
		 ******************************************************************************************/
		const currentNetwork = getWagmiNetwork();
		if (currentNetwork.chain?.id !== chain.id) {
			await switchNetwork({chainId: chain.id});
		}

		/* 🔵 - Smold App **************************************************************************
		 ** If the method is direct, we will just clone the original transaction.
		 ** As this is not a standard contract call, we kinda clone the handleTX function from the
		 ** weblib.
		 ******************************************************************************************/
		if (canDeployOnThatChain.method === 'direct') {
			try {
				set_cloneStatus({...defaultTxStatus, pending: true});
				const preparedTransaction = await prepareSendTransaction({
					to: toAddress(originalTx?.to),
					chainId: chain.id,
					account: address,
					data: originalTx?.input
				});
				const {hash} = await sendTransaction(preparedTransaction);
				const receipt = await waitForTransaction({hash, confirmations: 2});
				if (receipt.status === 'success') {
					set_cloneStatus({...defaultTxStatus, success: true});
					checkIfDeployedOnThatChain();
					checkDeploymentExpectedAddress();
					toast({type: 'success', content: 'Transaction successful!'});
				} else {
					set_cloneStatus({...defaultTxStatus, error: true});
					toast({type: 'error', content: 'Transaction failed!'});
				}
			} catch (error) {
				toast({
					type: 'error',
					content: (error as {shortMessage: string})?.shortMessage || 'Transaction failed!'
				});
				set_cloneStatus({...defaultTxStatus, error: true});
			} finally {
				setTimeout((): void => {
					set_cloneStatus(defaultTxStatus);
				}, 3000);
			}
		}

		/* 🔵 - Smold App **************************************************************************
		 ** If the method is contract, we can clone the safe using the proxy factory with the same
		 ** arguments as the original transaction.
		 ******************************************************************************************/
		if (canDeployOnThatChain.method === 'contract') {
			const fee = parseEther((DEFAULT_FEES_USD / coinPrice).toString());
			const signletonToUse = singleton || SINGLETON_L2;
			const argInitializers = generateArgInitializers(owners, threshold);
			const callDataDisperseEth = {
				target: DISPERSE_CONTRACT_PER_CHAIN[chain.id],
				value: fee,
				allowFailure: false,
				callData: encodeFunctionData({
					abi: DISPERSE_ABI,
					functionName: 'disperseEther',
					args: [[toAddress(process.env.RECEIVER_ADDRESS)], [fee]]
				})
			};

			const callDataCreateSafe = {
				target: getProxyFromSingleton(signletonToUse),
				value: 0n,
				allowFailure: false,
				callData: encodeFunctionData({
					abi: GNOSIS_SAFE_PROXY_FACTORY,
					functionName: 'createProxyWithNonce',
					args: [signletonToUse, `0x${argInitializers}`, salt]
				})
			};

			const multicallData = [];
			if (![5, 1337, 84531].includes(chain.id)) {
				multicallData.push(callDataDisperseEth);
			}
			multicallData.push(callDataCreateSafe);

			const result = await multicall({
				connector: provider,
				chainID: chain.id,
				contractAddress: getNetwork(chain.id).contracts.multicall3?.address,
				multicallData: multicallData,
				statusHandler: set_cloneStatus
			});
			if (result.isSuccessful) {
				checkIfDeployedOnThatChain();
				checkDeploymentExpectedAddress();
			}
		}
	}, [
		address,
		canDeployOnThatChain.canDeploy,
		canDeployOnThatChain.method,
		chain.id,
		checkDeploymentExpectedAddress,
		checkIfDeployedOnThatChain,
		coinPrice,
		originalTx?.input,
		originalTx?.to,
		owners,
		provider,
		salt,
		singleton,
		threshold
	]);

	const currentView = {
		Deployed: (
			<div className={'flex flex-col items-center gap-2 md:flex-row'}>
				<Button
					className={'!h-8'}
					isDisabled>
					{'Deployed'}
				</Button>
				<Link
					href={`${SAFE_UI_BASE_URI[chain.id]}${safeAddress}`}
					target={'_blank'}>
					<Button className={'hidden !h-8 md:block'}>
						<IconLinkOut className={'size-4 !text-white'} />
					</Button>
					<p className={'block text-center text-xs text-neutral-600 md:hidden'}>{'See on explorer'}</p>
				</Link>
			</div>
		),
		CanDeploy: (
			<div className={'flex flex-col items-center gap-2 md:flex-row'}>
				<Button
					className={'!h-8'}
					isBusy={cloneStatus.pending}
					onClick={onDeploySafe}>
					{'Deploy'}
				</Button>
				<p className={'block text-center text-xs text-neutral-600 md:hidden'}>&nbsp;</p>
			</div>
		),
		CannotDeploy: (
			<div>
				<span className={'tooltip flex flex-col items-center justify-center gap-2 md:flex-row'}>
					<Button
						className={'white !h-8'}
						isDisabled>
						{'Impossible'}
					</Button>
					<p className={'block text-center text-xs text-neutral-600 md:hidden'}>&nbsp;</p>

					<span className={'tooltipLight top-full mt-1'}>
						<div
							className={
								'font-number w-40 border border-neutral-300 bg-neutral-100 p-1 px-2 text-center text-xxs text-neutral-900'
							}>
							<p>{'The Safe was deployed using an un-cloneable legacy method. Soz 😕'}</p>
						</div>
					</span>
				</span>
			</div>
		),
		Loading: (
			<div>
				<Button
					className={'!h-8'}
					isBusy>
					{'Loading'}
				</Button>
			</div>
		)
	}[
		canDeployOnThatChain.isLoading
			? 'Loading'
			: isDeployedOnThatChain
				? 'Deployed'
				: canDeployOnThatChain.canDeploy
					? 'CanDeploy'
					: 'CannotDeploy'
	];

	return (
		<div
			key={chain.id}
			className={'box-0 flex w-full flex-col items-center justify-center p-4 pb-2 md:pb-4'}>
			<div className={'size-8'}>
				<Image
					src={`${process.env.SMOL_ASSETS_URL}/chain/${chain.id}/logo-128.png`}
					width={32}
					height={32}
					alt={chain.name}
				/>
			</div>
			<p className={'mt-1 text-center text-sm text-neutral-700'}>{getNetwork(chain.id).name}</p>
			<div className={'mt-4'}>{currentView}</div>
		</div>
	);
}

export default ChainStatus;
