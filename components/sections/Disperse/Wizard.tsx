import React, {useCallback, useMemo, useState} from 'react';
import {IconCircleCheck} from 'components/icons/IconCircleCheck';
import {IconCircleCross} from 'components/icons/IconCircleCross';
import {IconSpinner} from 'components/icons/IconSpinner';
import {Button} from 'components/Primitives/Button';
import {approveERC20, disperseERC20, disperseETH} from 'utils/actions';
import {notifyDisperse} from 'utils/notifier';
import {getTransferTransaction} from 'utils/tools.gnosis';
import {erc20ABI, useContractRead} from 'wagmi';
import useWallet from '@builtbymom/web3/contexts/useWallet';
import {useWeb3} from '@builtbymom/web3/contexts/useWeb3';
import {useChainID} from '@builtbymom/web3/hooks/useChainID';
import {formatAmount, isZeroAddress, toAddress, toBigInt, toNormalizedValue} from '@builtbymom/web3/utils';
import {defaultTxStatus} from '@builtbymom/web3/utils/wagmi/transaction';
import {useSafeAppsSDK} from '@gnosis.pm/safe-apps-react-sdk';
import {toast} from '@yearn-finance/web-lib/components/yToast';
import {ETH_TOKEN_ADDRESS, ZERO_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {SuccessModal} from '@common/ConfirmationModal';

import {ExportConfigurationButton} from '.';
import {useDisperse} from './useDisperse';

import type {ReactElement} from 'react';
import type {BaseError, Hex} from 'viem';
import type {TAddress} from '@builtbymom/web3/types';
import type {TTxStatus} from '@builtbymom/web3/utils/wagmi/transaction';
import type {BaseTransaction} from '@gnosis.pm/safe-apps-sdk';
import type {TDisperseInput} from './useDisperse';

type TApprovalWizardProps = {
	onSuccess: () => void;
	totalToDisperse: bigint;
};

const useApproveDisperse = ({
	onSuccess,
	totalToDisperse
}: TApprovalWizardProps): {
	approvalStatus: TTxStatus;
	shouldApprove: boolean;
	allowance: bigint;
	isApproved: boolean;
	totalToDisperse: bigint;
	isDisabled: boolean;
	onApproveToken: () => void;
} => {
	const {provider} = useWeb3();
	const {safeChainID} = useChainID();
	const {configuration} = useDisperse();
	const [approvalStatus, set_approvalStatus] = useState(defaultTxStatus);
	const {address} = useWeb3();

	const shouldApprove = useMemo((): boolean => {
		return toAddress(configuration.tokenToSend?.address) !== ETH_TOKEN_ADDRESS;
	}, [configuration.tokenToSend]);

	const {data: allowance = 0n, refetch} = useContractRead({
		abi: erc20ABI,
		functionName: 'allowance',
		args: [toAddress(address), toAddress(process.env.DISPERSE_ADDRESS)],
		address: toAddress(configuration.tokenToSend?.address),
		enabled:
			configuration.tokenToSend !== undefined &&
			toAddress(configuration.tokenToSend?.address) !== ETH_TOKEN_ADDRESS
	});

	const isApproved = allowance >= totalToDisperse;

	const onApproveToken = useCallback((): void => {
		if (isApproved) {
			return;
		}
		approveERC20({
			connector: provider,
			chainID: safeChainID,
			contractAddress: toAddress(configuration.tokenToSend?.address),
			spenderAddress: toAddress(process.env.DISPERSE_ADDRESS),
			amount: totalToDisperse,
			statusHandler: set_approvalStatus
		}).then(result => {
			if (result.isSuccessful) {
				onSuccess();
				refetch();
			}
		});
	}, [provider, configuration.tokenToSend, totalToDisperse, onSuccess, safeChainID]);

	return {
		approvalStatus,
		shouldApprove,
		allowance,
		isApproved,
		totalToDisperse,
		isDisabled: !approvalStatus.none || !configuration.tokenToSend,
		onApproveToken
	};
};

const useConfirmDisperse = ({
	onTrigger,
	onSuccess,
	onError
}: {
	onTrigger: () => void;
	onSuccess: () => void;
	onError: () => void;
}): {onDisperseTokens: () => void} => {
	const {address, provider, isWalletSafe} = useWeb3();
	const {safeChainID} = useChainID();
	const {configuration} = useDisperse();
	const {onRefresh} = useWallet();
	const {sdk} = useSafeAppsSDK();

	/**********************************************************************************************
	 ** onDisperseTokensForGnosis will do just like disperseTokens but for Gnosis Safe and without
	 ** the use of a smartcontract. It will just batch standard transfers.
	 **********************************************************************************************/
	const onDisperseTokensForGnosis = useCallback((): void => {
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
			sdk.txs.send({txs: transactions}).then(({safeTxHash}) => {
				console.log({hash: safeTxHash});
				toast({
					type: 'success',
					content: 'Your transaction has been created! You can now sign and execute it!'
				});
				notifyDisperse({
					chainID: safeChainID,
					tokenToDisperse: configuration.tokenToSend,
					receivers: disperseAddresses,
					amounts: disperseAmount,
					type: 'SAFE',
					from: toAddress(address),
					hash: safeTxHash as Hex
				});
				onSuccess();
			});
		} catch (error) {
			toast({
				type: 'error',
				content: (error as BaseError)?.message || 'An error occured while creating your transaction!'
			});
			onError();
		}
	}, [address, safeChainID, configuration.inputs, sdk.txs, configuration.tokenToSend]);

	const onDisperseTokens = useCallback((): void => {
		onTrigger();
		if (isWalletSafe) {
			return onDisperseTokensForGnosis();
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
			disperseETH({
				connector: provider,
				chainID: safeChainID,
				contractAddress: toAddress(process.env.DISPERSE_ADDRESS),
				receivers: disperseAddresses,
				amounts: disperseAmount
			}).then(result => {
				if (result.isSuccessful) {
					onSuccess();
					onRefresh([
						{
							decimals: configuration.tokenToSend?.decimals,
							name: configuration.tokenToSend?.name,
							symbol: configuration.tokenToSend?.symbol,
							address: ETH_TOKEN_ADDRESS,
							chainID: safeChainID
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
				onError();
			});
		} else {
			disperseERC20({
				connector: provider,
				chainID: safeChainID,
				contractAddress: toAddress(process.env.DISPERSE_ADDRESS),
				tokenToDisperse: toAddress(configuration.tokenToSend?.address),
				receivers: disperseAddresses,
				amounts: disperseAmount
			}).then(result => {
				if (result.isSuccessful) {
					onSuccess();
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
				onError();
			});
		}
	}, [isWalletSafe, configuration.inputs, configuration.tokenToSend, provider, safeChainID, onRefresh]);

	return {onDisperseTokens};
};

type TApprovalStatusProps = {
	approvalStatus: TTxStatus;
	allowance: bigint;
	totalToDisperse: bigint;
};

function ApprovalStatus({approvalStatus, allowance, totalToDisperse}: TApprovalStatusProps): ReactElement {
	const {configuration} = useDisperse();
	const {getBalance} = useWallet();

	function renderStatusIndicator(): ReactElement {
		if (!configuration.tokenToSend) {
			return <div className={'size-4 rounded-full border border-neutral-200 bg-neutral-300'} />;
		}
		// TODO: fix when totaltodiserse is 0 (values are not set)
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
			return <div className={'text-left text-xs'}>{'You have nothing to approve '}</div>;
		}
		if (allowance >= totalToDisperse || approvalStatus.success) {
			return (
				<div className={'text-left text-xs'}>
					{'You have already approved '}
					<span
						suppressHydrationWarning
						className={'font-number font-bold'}>
						{formatAmount(
							toNormalizedValue(totalToDisperse, configuration.tokenToSend?.decimals || 18),
							6,
							configuration.tokenToSend?.decimals || 18
						)}
						{` ${configuration.tokenToSend?.symbol || 'Tokens'}`}
					</span>
				</div>
			);
		}

		if (approvalStatus.pending) {
			return (
				<div className={'text-left text-xs'}>
					{'Approving '}
					<span
						suppressHydrationWarning
						className={'font-number font-bold'}>
						{formatAmount(
							toNormalizedValue(totalToDisperse, configuration.tokenToSend?.decimals || 18),
							6,
							configuration.tokenToSend?.decimals || 18
						)}
						{` ${configuration.tokenToSend?.symbol || 'Tokens'} ...`}
					</span>
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
				<div className={'text-left text-xs'}>
					{`You don't have enough ${configuration.tokenToSend?.symbol || 'Tokens'}`}
				</div>
			);
		}

		return (
			<div className={'text-left text-xs'}>
				{'You need to approve the spending of '}
				<span
					suppressHydrationWarning
					className={'font-number font-bold'}>
					{formatAmount(
						toNormalizedValue(totalToDisperse, configuration.tokenToSend?.decimals || 18),
						6,
						configuration.tokenToSend?.decimals || 18
					)}
					{` ${configuration.tokenToSend?.symbol || 'Tokens'}`}
				</span>
			</div>
		);
	}

	if (!configuration.tokenToSend) {
		return (
			<div className={'flex flex-col'}>
				<div className={'font-bold'}>{'Info'}</div>
				<div className={'text-left text-xs text-neutral-900/40'}>{'Please select a token'}</div>
			</div>
		);
	}

	return (
		<div className={'flex flex-col'}>
			<div className={'flex items-center gap-2'}>
				<div className={'font-bold'}>{'Approve Summary'}</div>
				{renderStatusIndicator()}
			</div>
			<div className={'text-left text-xs'}>
				<div className={'flex w-full flex-col'}>
					<div className={''}>
						{'You have '}
						<span
							suppressHydrationWarning
							className={'font-number font-bold'}>
							{formatAmount(
								getBalance({
									address: toAddress(configuration.tokenToSend?.address),
									chainID: Number(configuration.tokenToSend?.chainID)
								}).normalized,
								6,
								configuration.tokenToSend?.decimals || 18
							)}
							{` ${configuration.tokenToSend?.symbol || 'Tokens'}`}
						</span>
					</div>
					{renderStatusMessage()}
				</div>
			</div>
		</div>
	);
}

function NothingToDisperse(): ReactElement {
	return (
		<div className={'flex w-full flex-row items-center md:flex-row md:items-center'}>
			<div className={'text-left text-xs text-neutral-900/40'}>
				{'Please add some receivers to disperse tokens'}
			</div>
		</div>
	);
}

function DisperseElement({row}: {row: TDisperseInput}): ReactElement {
	const {configuration} = useDisperse();

	return (
		<div className={'flex w-full flex-row items-center md:flex-row md:items-center'}>
			<div className={'text-left text-xs'}>
				{'Sending '}
				<span className={'font-number font-bold'}>
					{formatAmount(
						row.value.normalizedBigAmount?.normalized || 0,
						6,
						configuration.tokenToSend?.decimals || 18
					)}
				</span>
				{` ${configuration.tokenToSend?.symbol || 'Tokens'} to `}
				<br />
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

type TSpendingStatusProps = {
	disperseStatus: TTxStatus;
};
function DisperseStatus({disperseStatus}: TSpendingStatusProps): ReactElement {
	const {isDispersed, configuration} = useDisperse();

	const validReceivers = useMemo((): TDisperseInput[] => {
		return configuration.inputs.filter(
			(row): boolean =>
				toBigInt(row.value.normalizedBigAmount.raw) !== 0n && row.receiver.address !== ZERO_ADDRESS
		);
	}, [configuration.inputs]);

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
		<div className={'flex flex-col'}>
			<div className={'flex gap-2 items-center'}>
				<div className={'font-bold'}>{'Disperse Summary'}</div>
				{renderStatusIndicator()}
			</div>
			<div>
				{validReceivers.length === 0 ? (
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
				)}
			</div>
		</div>
	);
}

export function DisperseWizard(): ReactElement {
	const {getBalance} = useWallet();
	const {isWalletSafe} = useWeb3();
	const {configuration, onResetDisperse} = useDisperse();
	const [disperseStatus, set_disperseStatus] = useState(defaultTxStatus);

	const totalToDisperse = useMemo((): bigint => {
		return configuration.inputs.reduce((acc, row): bigint => acc + row.value.normalizedBigAmount.raw, 0n);
	}, [configuration.inputs]);

	const {shouldApprove, approvalStatus, allowance, isApproved, onApproveToken} = useApproveDisperse({
		onSuccess: () => {
			set_disperseStatus(defaultTxStatus);
		},
		totalToDisperse
	});

	const {onDisperseTokens} = useConfirmDisperse({
		onError: () => {
			set_disperseStatus({...defaultTxStatus, error: true});
		},
		onSuccess: () => {
			set_disperseStatus({...defaultTxStatus, success: true});
		},
		onTrigger: () => {
			set_disperseStatus({...defaultTxStatus, pending: true});
		}
	});

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

	const getButtonTitle = (): string => {
		if (isWalletSafe) {
			return 'Disperse';
		}
		if (toAddress(configuration.tokenToSend?.address) === ETH_TOKEN_ADDRESS) {
			return 'Disperse';
		}
		if (isApproved) {
			return 'Disperse';
		}
		return 'Approve';
	};

	return (
		<div className={'col-span-12 mt-4'}>
			{/* <small className={'pb-1 pl-1'}>{'Summary'}</small> */}
			<div
				className={
					'grid grid-cols-3 md:flex-row gap border gap-12 rounded-lg border-neutral-600 text-neutral-700 bg-neutral-100 p-4'
				}>
				{shouldApprove && !isWalletSafe && (
					<div className={'col-span-1'}>
						<ApprovalStatus
							approvalStatus={approvalStatus}
							allowance={toBigInt(allowance)}
							totalToDisperse={totalToDisperse}
						/>
					</div>
				)}
				<div className={'col-span-2'}>
					<DisperseStatus disperseStatus={disperseStatus} />
				</div>
			</div>
			<Button
				isBusy={disperseStatus.pending}
				isDisabled={isAboveBalance || configuration.inputs.length === 0 || !isValid}
				onClick={(): void => {
					if (isWalletSafe) {
						return onDisperseTokens();
					}
					if (toAddress(configuration.tokenToSend?.address) === ETH_TOKEN_ADDRESS) {
						return onDisperseTokens();
					}
					if (isApproved) {
						return onDisperseTokens();
					}
					return onApproveToken();
				}}
				className={'!h-10 w-full max-w-[240px] mt-2'}>
				{getButtonTitle()}
			</Button>

			<SuccessModal
				title={'It looks like a success!'}
				content={'Your tokens have been dispersed! Just like ashes in the wind... Whao, dark.'}
				ctaLabel={'Close'}
				downloadConfigButton={<ExportConfigurationButton className={'w-full'} />}
				isOpen={disperseStatus.success}
				onClose={(): void => {
					onResetDisperse();
					set_disperseStatus(defaultTxStatus);
				}}
			/>
		</div>
	);
}
