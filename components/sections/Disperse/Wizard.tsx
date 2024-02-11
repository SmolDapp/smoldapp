import React, {useCallback, useMemo, useState} from 'react';
import {IconCircleCheck} from 'components/icons/IconCircleCheck';
import {IconCircleCross} from 'components/icons/IconCircleCross';
import {IconSpinner} from 'components/icons/IconSpinner';
import {Button} from 'components/Primitives/Button';
import {approveERC20, disperseERC20, disperseETH, isApprovedERC20} from 'utils/actions';
import {notifyDisperse} from 'utils/notifier';
import {getTransferTransaction} from 'utils/tools.gnosis';
import {erc20ABI, useContractRead} from 'wagmi';
import useWallet from '@builtbymom/web3/contexts/useWallet';
import {useWeb3} from '@builtbymom/web3/contexts/useWeb3';
import {useChainID} from '@builtbymom/web3/hooks/useChainID';
import {formatAmount, isZeroAddress, toAddress, toBigInt, toBigNumberAsAmount} from '@builtbymom/web3/utils';
import {defaultTxStatus} from '@builtbymom/web3/utils/wagmi/transaction';
import {useSafeAppsSDK} from '@gnosis.pm/safe-apps-react-sdk';
import {toast} from '@yearn-finance/web-lib/components/yToast';
import {ETH_TOKEN_ADDRESS, ZERO_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {SuccessModal} from '@common/ConfirmationModal';
import {Warning} from '@common/Primitives/Warning';

import {useDisperse} from './useDisperse';

import type {ReactElement} from 'react';
import type {BaseError, Hex} from 'viem';
import type {TAddress} from '@builtbymom/web3/types';
import type {BaseTransaction} from '@gnosis.pm/safe-apps-sdk';
import type {TDisperseInput} from './useDisperse';

type TApprovalWizardProps = {
	allowance: bigint;
	onSuccess: () => Promise<void>;
};
function ApprovalWizard({onSuccess, allowance}: TApprovalWizardProps): ReactElement {
	const {provider} = useWeb3();
	const {safeChainID} = useChainID();
	const {configuration} = useDisperse();
	const {getBalance} = useWallet();
	const [approvalStatus, set_approvalStatus] = useState(defaultTxStatus);

	const totalToDisperse = useMemo((): bigint => {
		return configuration.inputs.reduce((acc, row): bigint => acc + toBigInt(row.value.normalizedBigAmount.raw), 0n);
	}, [configuration.inputs]);

	const onApproveToken = useCallback(async (): Promise<void> => {
		const isApproved = await isApprovedERC20({
			connector: provider,
			contractAddress: toAddress(configuration.tokenToSend?.address),
			spenderAddress: toAddress(process.env.DISPERSE_ADDRESS),
			amount: totalToDisperse
		});
		if (isApproved) {
			return document.getElementById('DISPERSE_TOKENS')?.click();
		}
		const result = await approveERC20({
			connector: provider,
			chainID: safeChainID,
			contractAddress: toAddress(configuration.tokenToSend?.address),
			spenderAddress: toAddress(process.env.DISPERSE_ADDRESS),
			amount: totalToDisperse,
			statusHandler: set_approvalStatus
		});
		if (result.isSuccessful) {
			await onSuccess();
			return document.getElementById('DISPERSE_TOKENS')?.click();
		}
	}, [provider, configuration.tokenToSend, totalToDisperse, onSuccess, safeChainID]);

	function renderStatusIndicator(): ReactElement {
		if (!configuration.tokenToSend) {
			return <div className={'size-4 rounded-full border border-neutral-200 bg-neutral-300'} />;
		}
		if (allowance >= totalToDisperse) {
			return <IconCircleCheck className={'size-4 text-green'} />;
		}
		if (approvalStatus.pending) {
			return <IconSpinner className={'size-4'} />;
		}
		if (approvalStatus.success) {
			return <IconCircleCheck className={'size-4 text-green'} />;
		}
		if (approvalStatus.error) {
			return <IconCircleCross className={'size-4 text-red'} />;
		}
		if (
			totalToDisperse >
			getBalance({
				address: toAddress(configuration.tokenToSend?.address),
				chainID: configuration.tokenToSend.chainID
			}).raw
		) {
			return <IconCircleCross className={'size-4 text-red'} />;
		}

		return <div className={'size-4 rounded-full border border-neutral-200 bg-neutral-300'} />;
	}

	function renderStatusMessage(): ReactElement {
		if (totalToDisperse === 0n) {
			return <div className={'text-left text-sm'}>{'You have nothing to approve '}</div>;
		}
		if (allowance >= totalToDisperse || approvalStatus.success) {
			return (
				<div className={'text-left text-sm'}>
					{'You have already approved '}
					<span
						suppressHydrationWarning
						className={'font-number font-bold'}>
						{formatAmount(
							toBigNumberAsAmount(allowance, configuration.tokenToSend?.decimals || 18),
							6,
							configuration.tokenToSend?.decimals || 18
						)}
					</span>
					{` ${configuration.tokenToSend?.symbol || 'Tokens'}`}
				</div>
			);
		}
		if (approvalStatus.pending) {
			return (
				<div className={'text-left text-sm'}>
					{'Approving '}
					<span
						suppressHydrationWarning
						className={'font-number font-bold'}>
						{formatAmount(
							toBigNumberAsAmount(totalToDisperse, configuration.tokenToSend?.decimals || 18),
							6,
							configuration.tokenToSend?.decimals || 18
						)}
					</span>
					{` ${configuration.tokenToSend?.symbol || 'Tokens'} ...`}
				</div>
			);
		}
		if (
			totalToDisperse >
			getBalance({
				address: toAddress(configuration.tokenToSend?.address),
				chainID: Number(configuration.tokenToSend?.chainID)
			}).raw
		) {
			return (
				<div className={'text-left text-sm'}>
					{`You don't have enough ${configuration.tokenToSend?.symbol || 'Tokens'}`}
				</div>
			);
		}

		return (
			<div className={'text-left text-sm'}>
				{'You need to approve the spending of '}
				<span
					suppressHydrationWarning
					className={'font-number font-bold'}>
					{formatAmount(
						toBigNumberAsAmount(totalToDisperse, configuration.tokenToSend?.decimals || 18),
						6,
						configuration.tokenToSend?.decimals || 18
					)}
				</span>
				{` ${configuration.tokenToSend?.symbol || 'Tokens'}`}
			</div>
		);
	}

	if (!configuration.tokenToSend) {
		return (
			<button
				id={'APPROVE_TOKEN_TO_DISPERSE'}
				disabled>
				<Warning
					statusIcon={renderStatusIndicator()}
					type={'info'}
					message={
						<>
							<div className={'flex w-full flex-col'}>
								<div className={'text-left text-sm text-neutral-900/40'}>{'Please select a token'}</div>
							</div>
						</>
					}
				/>
			</button>
		);
	}

	return (
		<button
			id={'APPROVE_TOKEN_TO_DISPERSE'}
			disabled={!approvalStatus.none || !configuration.tokenToSend}
			onClick={onApproveToken}>
			<Warning
				statusIcon={renderStatusIndicator()}
				type={'info'}
				title={'Approve Summary'}
				message={
					<div>
						<div className={'flex w-full flex-col'}>
							<div className={'text-left text-sm'}>
								{'You have '}
								<span
									suppressHydrationWarning
									className={'font-number font-bold'}>
									{formatAmount(
										Number(
											getBalance({
												address: toAddress(configuration.tokenToSend?.address),
												chainID: Number(configuration.tokenToSend?.chainID)
											}).normalized
										),
										6,
										configuration.tokenToSend?.decimals || 18
									)}
								</span>
								{` ${configuration.tokenToSend?.symbol || 'Tokens'}`}
							</div>
							{renderStatusMessage()}
						</div>
					</div>
				}
			/>
			<div className={'flex w-full flex-row items-center space-x-3 md:flex-row md:items-start'}></div>
		</button>
	);
}

function NothingToDisperse(): ReactElement {
	return (
		<div className={'flex w-full flex-row items-center space-x-3 md:flex-row md:items-center'}>
			<div className={'size-3'} />
			<div className={'text-left text-sm text-neutral-900/40'}>
				{'Please add some receivers to disperse tokens'}
			</div>
		</div>
	);
}

function DisperseElement({row}: {row: TDisperseInput}): ReactElement {
	const {configuration} = useDisperse();

	return (
		<div className={'flex w-full flex-row items-center md:flex-row md:items-center'}>
			<div className={'text-left text-sm'}>
				{'Sending '}
				<span className={'font-number font-bold'}>
					{formatAmount(
						row.value.normalizedBigAmount?.normalized || 0,
						6,
						configuration.tokenToSend?.decimals || 18
					)}
				</span>
				{` ${configuration.tokenToSend?.symbol || 'Tokens'} to `}
				<span className={'font-number inline-flex'}>
					{toAddress(row.receiver.label) === ZERO_ADDRESS ? (
						<div className={'font-number'}>
							<span className={'font-bold'}>{row.receiver.label}</span>
							<span className={'text-xxs'}>{` (${toAddress(row.receiver.address)})`}</span>
						</div>
					) : (
						<div className={'font-number'}>
							<span className={'font-bold'}>{toAddress(row.receiver.address)}</span>
						</div>
					)}
				</span>
			</div>
		</div>
	);
}

type TSpendingWizardProps = {
	onTrigger: () => void;
	onSuccess: () => void;
	onError: () => void;
};
function SpendingWizard(props: TSpendingWizardProps): ReactElement {
	const {address, provider, isWalletSafe} = useWeb3();
	const {safeChainID} = useChainID();
	const {isDispersed, configuration} = useDisperse();
	const {onRefresh} = useWallet();
	const {sdk} = useSafeAppsSDK();
	const [disperseStatus, set_disperseStatus] = useState(defaultTxStatus);

	const validReceivers = useMemo((): TDisperseInput[] => {
		return configuration.inputs.filter(
			(row): boolean =>
				toBigInt(row.value.normalizedBigAmount.raw) !== 0n && row.receiver.address !== ZERO_ADDRESS
		);
	}, [configuration.inputs]);

	/**********************************************************************************************
	 ** onDisperseTokensForGnosis will do just like disperseTokens but for Gnosis Safe and without
	 ** the use of a smartcontract. It will just batch standard transfers.
	 **********************************************************************************************/
	const onDisperseTokensForGnosis = useCallback(async (): Promise<void> => {
		const transactions: BaseTransaction[] = [];
		const disperseAddresses: TAddress[] = [];
		const disperseAmount: bigint[] = [];
		for (const row of configuration.inputs) {
			if (!row.value.amount || row.value.normalizedBigAmount.raw === 0n) {
				continue;
			}
			if (
				!row.receiver.address ||
				row.receiver.address === ZERO_ADDRESS ||
				row.receiver.address === ETH_TOKEN_ADDRESS
			) {
				continue;
			}
			disperseAddresses.push(row.receiver.address);
			disperseAmount.push(row.value.normalizedBigAmount.raw);
			const newTransactionForBatch = getTransferTransaction(
				row.value.normalizedBigAmount.raw.toString(),
				toAddress(configuration.tokenToSend?.address),
				row.receiver.address
			);
			transactions.push(newTransactionForBatch);
		}
		try {
			const {safeTxHash} = await sdk.txs.send({txs: transactions});
			console.log({hash: safeTxHash});
			toast({type: 'success', content: 'Your transaction has been created! You can now sign and execute it!'});
			notifyDisperse({
				chainID: safeChainID,
				tokenToDisperse: configuration.tokenToSend,
				receivers: disperseAddresses,
				amounts: disperseAmount,
				type: 'SAFE',
				from: toAddress(address),
				hash: safeTxHash as Hex
			});
			props.onSuccess();
		} catch (error) {
			toast({
				type: 'error',
				content: (error as BaseError)?.message || 'An error occured while creating your transaction!'
			});
			props.onError();
		}
	}, [address, safeChainID, configuration.inputs, sdk.txs, configuration.tokenToSend, props]);

	const onDisperseTokens = useCallback(async (): Promise<void> => {
		props.onTrigger();
		if (isWalletSafe) {
			return await onDisperseTokensForGnosis();
		}

		const [disperseAddresses, disperseAmount] = configuration.inputs
			.filter((row): boolean => {
				return (
					(toBigInt(row.value.normalizedBigAmount.raw) > 0n &&
						row.receiver.address &&
						!isZeroAddress(row.receiver.address)) ||
					false
				);
			})
			.reduce(
				(acc, row): [TAddress[], bigint[]] => {
					acc[0].push(toAddress(row.receiver.address));
					acc[1].push(toBigInt(row.value.normalizedBigAmount.raw));
					return acc;
				},
				[[] as TAddress[], [] as bigint[]]
			);

		if (configuration.tokenToSend?.address === ETH_TOKEN_ADDRESS) {
			const result = await disperseETH({
				connector: provider,
				chainID: safeChainID,
				contractAddress: toAddress(process.env.DISPERSE_ADDRESS),
				receivers: disperseAddresses,
				amounts: disperseAmount,
				statusHandler: set_disperseStatus
			});
			if (result.isSuccessful) {
				props.onSuccess();
				onRefresh([
					{
						decimals: configuration.tokenToSend.decimals,
						name: configuration.tokenToSend.name,
						symbol: configuration.tokenToSend.symbol,
						address: configuration.tokenToSend.address,
						chainID: configuration.tokenToSend.chainID
					}
				]);
				if (result.receipt) {
					notifyDisperse({
						chainID: safeChainID,
						tokenToDisperse: configuration.tokenToSend,
						receivers: disperseAddresses,
						amounts: disperseAmount,
						type: 'EOA',
						from: result.receipt.from,
						hash: result.receipt.transactionHash
					});
				}
				return;
			}
			props.onError();
		} else {
			const result = await disperseERC20({
				connector: provider,
				chainID: safeChainID,
				contractAddress: toAddress(process.env.DISPERSE_ADDRESS),
				tokenToDisperse: toAddress(configuration.tokenToSend?.address),
				receivers: disperseAddresses,
				amounts: disperseAmount,
				statusHandler: set_disperseStatus
			});
			if (result.isSuccessful) {
				props.onSuccess();
				onRefresh([
					{
						decimals: configuration.tokenToSend?.decimals,
						name: configuration.tokenToSend?.name,
						symbol: configuration.tokenToSend?.symbol,
						address: toAddress(configuration.tokenToSend?.address),
						chainID: Number(configuration.tokenToSend?.chainID)
					}
				]);
				if (result.receipt) {
					notifyDisperse({
						chainID: safeChainID,
						tokenToDisperse: configuration.tokenToSend,
						receivers: disperseAddresses,
						amounts: disperseAmount,
						type: 'EOA',
						from: result.receipt.from,
						hash: result.receipt.transactionHash
					});
				}
				return;
			}
			props.onError();
		}
	}, [
		props,
		isWalletSafe,
		configuration.inputs,
		configuration.tokenToSend,
		onDisperseTokensForGnosis,
		provider,
		safeChainID,
		onRefresh
	]);

	function renderStatusIndicator(): ReactElement {
		if (isDispersed) {
			return <IconCircleCheck className={'size-4 text-green'} />;
		}
		if (disperseStatus.pending) {
			return <IconSpinner className={'size-4'} />;
		}
		if (disperseStatus.success) {
			return <IconCircleCheck className={'size-4 text-green'} />;
		}
		if (disperseStatus.error) {
			return <IconCircleCross className={'size-4 text-red'} />;
		}
		return <div className={'size-4 rounded-full border border-neutral-200 bg-neutral-300'} />;
	}

	return (
		<div className={'relative w-full'}>
			<div className={'absolute left-4 top-4 flex h-6 items-center'}>{}</div>
			<button
				id={'DISPERSE_TOKENS'}
				disabled={!disperseStatus.none || !configuration.tokenToSend}
				onClick={onDisperseTokens}>
				<Warning
					type={'info'}
					title={'Disperse Summary'}
					statusIcon={renderStatusIndicator()}
					message={
						validReceivers.length === 0 ? (
							<NothingToDisperse />
						) : (
							validReceivers.map(
								(row): ReactElement => (
									<DisperseElement
										key={row.UUID}
										row={row}
									/>
								)
							)
						)
					}
				/>
			</button>
		</div>
	);
}

export function DisperseWizard(): ReactElement {
	const {getBalance} = useWallet();
	const {address, isWalletSafe} = useWeb3();
	const {configuration, onResetDisperse} = useDisperse();
	const [disperseStatus, set_disperseStatus] = useState(defaultTxStatus);
	const {data: allowance, refetch} = useContractRead({
		abi: erc20ABI,
		functionName: 'allowance',
		args: [toAddress(address), toAddress(process.env.DISPERSE_ADDRESS)],
		address: toAddress(configuration.tokenToSend?.address),
		enabled:
			configuration.tokenToSend !== undefined &&
			toAddress(configuration.tokenToSend?.address) !== ETH_TOKEN_ADDRESS
	});

	const shouldApprove = useMemo((): boolean => {
		return toAddress(configuration.tokenToSend?.address) !== ETH_TOKEN_ADDRESS;
	}, [configuration.tokenToSend]);

	const totalToDisperse = useMemo((): number => {
		return configuration.inputs.reduce(
			(acc, row): number => acc + Number(row.value.normalizedBigAmount.normalized || 0),
			0
		);
	}, [configuration.inputs]);

	const isAboveBalance =
		totalToDisperse >
		getBalance({
			address: toAddress(configuration.tokenToSend?.address),
			chainID: Number(configuration.tokenToSend?.chainID)
		}).raw;

	const checkAlreadyExists = useCallback(
		(UUID: string, address: TAddress): boolean => {
			if (isZeroAddress(address)) {
				return false;
			}
			return configuration.inputs.some((row): boolean => row.UUID !== UUID && row.receiver.address === address);
		},
		[configuration.inputs]
	);

	const isValid = useMemo((): boolean => {
		return configuration.inputs.every((row): boolean => {
			if (!row.receiver.label && !row.receiver.address && toBigInt(row.value.normalizedBigAmount.raw) === 0n) {
				return false;
			}
			if (!row.receiver.address || isZeroAddress(row.receiver.address)) {
				return false;
			}
			if (checkAlreadyExists(row.UUID, row.receiver.address)) {
				return false;
			}
			if (!row.value.normalizedBigAmount || row.value.normalizedBigAmount.raw === 0n) {
				return false;
			}
			return true;
		});
	}, [configuration.inputs, checkAlreadyExists]);

	return (
		<div className={'col-span-12 mt-4'}>
			{/* <small className={'pb-1 pl-1'}>{'Summary'}</small> */}
			<div className={'flex flex-col gap-2'}>
				{shouldApprove && !isWalletSafe && (
					<ApprovalWizard
						allowance={toBigInt(allowance)}
						onSuccess={async (): Promise<void> => {
							await refetch();
							set_disperseStatus(defaultTxStatus);
						}}
					/>
				)}

				<SpendingWizard
					onTrigger={() => set_disperseStatus({...defaultTxStatus, pending: true})}
					onSuccess={() => set_disperseStatus({...defaultTxStatus, pending: true})}
					onError={() => set_disperseStatus({...defaultTxStatus, error: true})}
				/>
			</div>
			<Button
				isBusy={disperseStatus.pending}
				isDisabled={isAboveBalance || configuration.inputs.length === 0 || !isValid}
				onClick={(): void => {
					if (isWalletSafe) {
						return document.getElementById('DISPERSE_TOKENS')?.click();
					}
					if (toAddress(configuration.tokenToSend?.address) === ETH_TOKEN_ADDRESS) {
						return document.getElementById('DISPERSE_TOKENS')?.click();
					}
					return document.getElementById('APPROVE_TOKEN_TO_DISPERSE')?.click();
				}}
				className={'!h-10 w-full max-w-[240px] mt-2'}>
				{'Disperse'}
			</Button>

			<SuccessModal
				title={'It looks like a success!'}
				content={'Your tokens have been dispersed! Just like ashes in the wind... Whao, dark.'}
				ctaLabel={'Close'}
				isOpen={disperseStatus.success}
				onClose={(): void => {
					onResetDisperse();
					set_disperseStatus(defaultTxStatus);
				}}
			/>
		</div>
	);
}
