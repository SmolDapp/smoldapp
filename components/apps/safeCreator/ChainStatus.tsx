import {useCallback, useEffect, useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DISPERSE_ABI from 'utils/abi/disperse.abi';
import GNOSIS_SAFE_PROXY_FACTORY from 'utils/abi/gnosisSafeProxyFactory.abi';
import {MULTICALL_ABI} from 'utils/abi/multicall3.abi';
import {multicall} from 'utils/actions';
import {encodeFunctionData, formatEther} from 'viem';
import {getNetwork as getWagmiNetwork, prepareSendTransaction, sendTransaction, switchNetwork, waitForTransaction} from '@wagmi/core';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {toast} from '@yearn-finance/web-lib/components/yToast';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import IconLinkOut from '@yearn-finance/web-lib/icons/IconLinkOut';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {ZERO_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';
import {getClient, getNetwork} from '@yearn-finance/web-lib/utils/wagmi/utils';
import {defaultTxStatus} from '@yearn-finance/web-lib/utils/web3/transaction';

import {PROXY_FACTORY, SINGLETON} from './constants';
import {useSafeCreator} from './useSafeCreator';
import {generateArgInitializers} from './utils';

import type {ReactElement} from 'react';
import type {TAppExtendedChain} from 'utils/constants';
import type {TAddress} from '@yearn-finance/web-lib/types';
import type {Chain, FetchTransactionResult} from '@wagmi/core';

type TChainStatusArgs = {
	chain: Chain,
	safeAddress: TAddress,
	originalTx?: FetchTransactionResult,
	owners: TAddress[],
	threshold: number,
	salt: bigint,
}

function ChainStatus({
	chain,
	safeAddress,
	originalTx,
	owners,
	threshold,
	salt
}: TChainStatusArgs): ReactElement {
	const {chainCoinPrices} = useSafeCreator();
	const gasCoinID = (getNetwork(chain.id) as TAppExtendedChain).coingeckoGasCoinID;
	const coinPrice = chainCoinPrices?.[gasCoinID].usd;
	const {provider, address} = useWeb3();
	const [isDeployedOnThatChain, set_isDeployedOnThatChain] = useState(false);
	const [cloneStatus, set_cloneStatus] = useState(defaultTxStatus);
	const [estimatedGasCost, set_estimatedGasCost] = useState(0n);
	const [canDeployOnThatChain, set_canDeployOnThatChain] = useState({
		canDeploy: true,
		isLoading: true,
		method: 'contract'
	});

	/* 🔵 - Smold App **************************************************************************
	** If the safe is already deployed on that chain, we don't need to do anything.
	******************************************************************************************/
	const checkIfDeployedOnThatChain = useCallback(async (): Promise<void> => {
		const publicClient = getClient(chain.id);
		const byteCode = await publicClient.getBytecode({address: safeAddress});
		if (byteCode) {
			set_isDeployedOnThatChain(true);
		} else {
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
			const argInitializers = generateArgInitializers(owners, threshold);
			const prepareWriteResult = await publicClient.simulateContract({
				account: address,
				address: PROXY_FACTORY,
				abi: GNOSIS_SAFE_PROXY_FACTORY,
				functionName: 'createProxyWithNonce',
				args: [SINGLETON, `0x${argInitializers}`, salt]
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
	}, [address, chain.id, originalTx?.input, originalTx?.to, owners, safeAddress, salt, threshold]);

	const checkDeploymentGasCost = useCallback(async (): Promise<void> => {
		const publicClient = getClient(chain.id);

		if (canDeployOnThatChain.method === 'contract') {
			// const ethPriceAsUSDC = Number(toBigInt(coinPrice) / toBigInt(1e8));
			const tenUSDCToEthPrice = 10 / (coinPrice || 1);
			const fee = tenUSDCToEthPrice;
			console.warn(fee);
			const argInitializers = generateArgInitializers(owners, threshold);
			const callDataDisperseEth = {
				target: toAddress(process.env.DISPERSE_ADDRESS),
				value: 1n,
				allowFailure: false,
				callData: encodeFunctionData({
					abi: DISPERSE_ABI,
					functionName: 'disperseEther',
					args: [
						[toAddress(process.env.RECEIVER_ADDRESS)],
						[1n]
					]
				})
			};
			const callDataCreateSafe = {
				target: PROXY_FACTORY,
				value: 0n,
				allowFailure: false,
				callData: encodeFunctionData({
					abi: GNOSIS_SAFE_PROXY_FACTORY,
					functionName: 'createProxyWithNonce',
					args: [SINGLETON, `0x${argInitializers}`, salt]
				})
			};

			try {
				const result = await publicClient.estimateContractGas({
					account: ZERO_ADDRESS, //Estimating with address 0 so it doesn't fail if the user doesn't have enough balance
					address: toAddress(getNetwork(chain.id).contracts.multicall3?.address),
					abi: MULTICALL_ABI,
					functionName: 'aggregate3Value',
					type: 'eip1559',
					args: [[callDataDisperseEth, callDataCreateSafe]],
					value: 1n
				});
				const gasPrice = await publicClient.getGasPrice();
				set_estimatedGasCost(result * gasPrice);
			} catch (err) {
				set_estimatedGasCost(0n);
				console.dir(err);
			}
		}
	}, [canDeployOnThatChain.method, chain.id, coinPrice, owners, salt, threshold]);

	useEffect((): void => {
		checkIfDeployedOnThatChain();
		checkDeploymentExpectedAddress();
		checkDeploymentGasCost();
	}, [checkDeploymentExpectedAddress, checkIfDeployedOnThatChain, checkDeploymentGasCost]);

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
				toast({type: 'error', content: (error as {shortMessage: string})?.shortMessage || 'Transaction failed!'});
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
			// const ethPriceAsUSDC = Number(toBigInt(coinPrice) / toBigInt(1e8));
			// const tenUSDCToEthPrice = 10 / ethPriceAsUSDC;
			// const fee = toBigInt(tenUSDCToEthPrice * 1e18);
			// console.log(fee);
			// console.warn(toBigInt(coinPrice) / toBigInt(1e8));
			// console.warn(tenUSDCToEthPrice);
			const argInitializers = generateArgInitializers(owners, threshold);
			const callDataDisperseEth = {
				target: toAddress(process.env.DISPERSE_ADDRESS),
				value: 1n,
				allowFailure: false,
				callData: encodeFunctionData({
					abi: DISPERSE_ABI,
					functionName: 'disperseEther',
					args: [
						[toAddress(process.env.RECEIVER_ADDRESS)],
						[1n]
					]
				})
			};
			const callDataCreateSafe = {
				target: PROXY_FACTORY,
				value: 0n,
				allowFailure: false,
				callData: encodeFunctionData({
					abi: GNOSIS_SAFE_PROXY_FACTORY,
					functionName: 'createProxyWithNonce',
					args: [SINGLETON, `0x${argInitializers}`, salt]
				})
			};

			const result = await multicall({
				connector: provider,
				contractAddress: getNetwork(chain.id).contracts.multicall3?.address,
				multicallData: [
					callDataDisperseEth,
					callDataCreateSafe
				],
				statusHandler: set_cloneStatus
			});
			console.warn(result);
			if (result.isSuccessful) {
				checkIfDeployedOnThatChain();
				checkDeploymentExpectedAddress();
			}
		}

	}, [address, canDeployOnThatChain.canDeploy, canDeployOnThatChain.method, chain.id, checkDeploymentExpectedAddress, checkIfDeployedOnThatChain, originalTx?.input, originalTx?.to, owners, provider, salt, threshold]);

	const currentView = {
		Deployed: (
			<div className={'flex flex-row items-center space-x-2'}>
				<Button className={'!h-8'} isDisabled>
					{'Deployed'}
				</Button>
				<Link href={`${getNetwork(chain.id).defaultBlockExplorer}/address/${safeAddress}`} target={'_blank'}>
					<Button className={'!h-8'}>
						<IconLinkOut className={'h-4 w-4 !text-white'} />
					</Button>
				</Link>
			</div>
		),
		CanDeploy: (
			<div className={'flex flex-col items-center justify-center'}>
				<Button
					className={'!h-8'}
					isBusy={cloneStatus.pending}
					onClick={onDeploySafe}>
					{'Deploy'}
				</Button>
				<div className={'flex flex-col'}>
					<span className={'tooltip'}>
						<small className={'mt-1 text-center text-xxs text-neutral-500'}>
							{`$${formatAmount(Number(formatEther(estimatedGasCost)) * Number(coinPrice) + 10, 4, 4)} - $${formatAmount(Number(formatEther(estimatedGasCost * 2n)) * Number(coinPrice) + 10, 4, 4)}`}
						</small>
						<span className={'tooltipLight -inset-x-1/2 top-full mt-1'}>
							<div className={'font-number w-40 border border-neutral-300 bg-neutral-100 p-1 px-2 text-left text-xxs text-neutral-900'}>
								<p className={'font-number'}>{`Gas: ${`$${formatAmount(Number(formatEther(estimatedGasCost)) * Number(coinPrice), 4, 4)} - $${formatAmount(Number(formatEther(estimatedGasCost * 2n)) * Number(coinPrice), 4, 4)}`}`}</p>
								<p className={'font-number'}>{`Fee: $${formatAmount(10, 4, 4)}`}</p>
							</div>
						</span>
					</span>
				</div>
			</div>
		),
		CannotDeploy: (
			<div>
				<span className={'tooltip flex items-center justify-center'}>
					<Button className={'!h-8'} isDisabled>
						{'Not possible'}
					</Button>
					<span className={'tooltipLight top-full mt-1'}>
						<div className={'font-number w-40 border border-neutral-300 bg-neutral-100 p-1 px-2 text-center text-xxs text-neutral-900'}>
							<p>{'The safe was deployed using an un-cloneable legacy method. Soz 😕'}</p>
						</div>
					</span>
				</span>
			</div>
		),
		Loading: (
			<div>
				<Button className={'!h-8'} isBusy>
					{'Loading'}
				</Button>
			</div>
		)
	}[
		canDeployOnThatChain.isLoading ? 'Loading' :
			isDeployedOnThatChain ? 'Deployed' :
				canDeployOnThatChain.canDeploy ? 'CanDeploy' : 'CannotDeploy'
	];

	return (
		<div key={chain.id} className={'box-0 flex flex-col items-center justify-center p-4'}>
			<div className={'h-8 w-8'}>
				<Image
					src={'chains/' + chain.id + '.svg'}
					width={32}
					height={32}
					alt={chain.name} />
			</div>
			<p className={'mt-1 text-sm text-neutral-700'}>
				{getNetwork(chain.id).name}
			</p>
			<div className={'mt-4'}>
				{currentView}
			</div>
		</div>
	);
}

export default ChainStatus;
