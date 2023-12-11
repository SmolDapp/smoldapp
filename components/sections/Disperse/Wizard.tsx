import React, {useCallback, useMemo, useState} from 'react';
import {IconCircleCheck} from 'components/icons/IconCircleCheck';
import {IconCircleCross} from 'components/icons/IconCircleCross';
import {IconSpinner} from 'components/icons/IconSpinner';
import useWallet from 'contexts/useWallet';
import {approveERC20, disperseERC20, disperseETH, isApprovedERC20} from 'utils/actions';
import {notifyDisperse} from 'utils/notifier';
import {getTransferTransaction} from 'utils/tools.gnosis';
import {erc20ABI, useContractRead} from 'wagmi';
import {useSafeAppsSDK} from '@gnosis.pm/safe-apps-react-sdk';
import {isZeroAddress, toAddress} from '@utils/tools.address';
import {toast} from '@yearn-finance/web-lib/components/yToast';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {ETH_TOKEN_ADDRESS, ZERO_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {formatBigNumberAsAmount, toBigInt} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';
import {defaultTxStatus} from '@yearn-finance/web-lib/utils/web3/transaction';
import {SuccessModal} from '@common/ConfirmationModal';
import {Button} from '@common/Primitives/Button';

import {useDisperse} from './useDisperse';

import type {ReactElement} from 'react';
import type {BaseError, Hex} from 'viem';
import type {TAddress} from '@yearn-finance/web-lib/types';
import type {BaseTransaction} from '@gnosis.pm/safe-apps-sdk';
import type {TDisperseReceiver} from './useDisperse';

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
		return configuration.receivers.reduce((acc, row): bigint => acc + toBigInt(row.amount?.raw), 0n);
	}, [configuration.receivers]);

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
			return <div className={'h-4 w-4 rounded-full border border-neutral-200 bg-neutral-300'} />;
		}
		if (allowance >= totalToDisperse) {
			return <IconCircleCheck className={'h-4 w-4 text-[#16a34a]'} />;
		}
		if (approvalStatus.pending) {
			return <IconSpinner className={'h-4 w-4'} />;
		}
		if (approvalStatus.success) {
			return <IconCircleCheck className={'h-4 w-4 text-[#16a34a]'} />;
		}
		if (approvalStatus.error) {
			return <IconCircleCross className={'h-4 w-4 text-[#e11d48]'} />;
		}
		if (totalToDisperse > getBalance(toAddress(configuration.tokenToSend?.address)).raw) {
			return <IconCircleCross className={'h-4 w-4 text-[#e11d48]'} />;
		}

		return <div className={'h-4 w-4 rounded-full border border-neutral-200 bg-neutral-300'} />;
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
							formatBigNumberAsAmount(allowance, configuration.tokenToSend?.decimals || 18),
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
							formatBigNumberAsAmount(totalToDisperse, configuration.tokenToSend?.decimals || 18),
							6,
							configuration.tokenToSend?.decimals || 18
						)}
					</span>
					{` ${configuration.tokenToSend?.symbol || 'Tokens'} ...`}
				</div>
			);
		}
		if (totalToDisperse > getBalance(toAddress(configuration.tokenToSend?.address)).raw) {
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
						formatBigNumberAsAmount(totalToDisperse, configuration.tokenToSend?.decimals || 18),
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
				disabled
				className={cl(
					'mb-0 flex w-full flex-col justify-center space-y-1 bg-neutral-0 p-4 md:mb-2',
					'border border-primary-200 rounded-md',
					'group transition-colors hover:bg-neutral-100 disabled:cursor-default disabled:hover:bg-neutral-0'
				)}>
				<div className={'flex w-full flex-row items-center space-x-3 md:flex-row md:items-start'}>
					<div className={'pt-0.5'}>{renderStatusIndicator()}</div>

					<div className={'flex w-full flex-col'}>
						<div className={'text-left text-sm text-neutral-900/40'}>{'Please select a token'}</div>
					</div>
				</div>
			</button>
		);
	}

	return (
		<button
			id={'APPROVE_TOKEN_TO_DISPERSE'}
			disabled={!approvalStatus.none || !configuration.tokenToSend}
			onClick={onApproveToken}
			className={cl(
				'mb-0 flex w-full flex-col justify-center space-y-1 bg-neutral-0 p-4 md:mb-2',
				'border border-primary-200 rounded-md',
				'group transition-colors hover:bg-neutral-100 disabled:cursor-default disabled:hover:bg-neutral-0'
			)}>
			<div className={'flex w-full flex-row items-center space-x-3 md:flex-row md:items-start'}>
				<div className={'pt-0.5'}>{renderStatusIndicator()}</div>

				<div className={'flex w-full flex-col'}>
					<div className={'text-left text-sm'}>
						{'You have '}
						<span
							suppressHydrationWarning
							className={'font-number font-bold'}>
							{formatAmount(
								Number(getBalance(toAddress(configuration.tokenToSend?.address)).normalized),
								6,
								configuration.tokenToSend?.decimals || 18
							)}
						</span>
						{` ${configuration.tokenToSend?.symbol || 'Tokens'}`}
					</div>
					{renderStatusMessage()}
				</div>
			</div>
		</button>
	);
}

function NothingToDisperse(): ReactElement {
	return (
		<div className={'flex w-full flex-row items-center space-x-3 md:flex-row md:items-center'}>
			<div className={'h-3 w-3'} />
			<div className={'text-left text-sm text-neutral-900/40'}>
				{'Please add some receivers to disperse tokens'}
			</div>
		</div>
	);
}

function DisperseElement({row}: {row: TDisperseReceiver}): ReactElement {
	const {configuration} = useDisperse();

	return (
		<div className={'flex w-full flex-row items-center space-x-3 md:flex-row md:items-center'}>
			<div className={'h-3 w-3'} />
			<div className={'text-left text-sm'}>
				{'Sending '}
				<span className={'font-number font-bold'}>
					{formatAmount(row.amount?.normalized || 0, 6, configuration.tokenToSend?.decimals || 18)}
				</span>
				{` ${configuration.tokenToSend?.symbol || 'Tokens'} to `}
				<span className={'font-number inline-flex'}>
					{toAddress(row.label) === ZERO_ADDRESS ? (
						<div className={'font-number'}>
							<span className={'font-bold'}>{row.label}</span>
							<span className={'text-xxs'}>{` (${toAddress(row.address)})`}</span>
						</div>
					) : (
						<div className={'font-number'}>
							<span className={'font-bold'}>{toAddress(row.address)}</span>
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
	const {refresh} = useWallet();
	const {sdk} = useSafeAppsSDK();
	const [disperseStatus, set_disperseStatus] = useState(defaultTxStatus);

	const validReceivers = useMemo((): TDisperseReceiver[] => {
		return configuration.receivers.filter(
			(row): boolean => toBigInt(row.amount?.raw) !== 0n && row.address !== ZERO_ADDRESS
		);
	}, [configuration.receivers]);

	/**********************************************************************************************
	 ** onDisperseTokensForGnosis will do just like disperseTokens but for Gnosis Safe and without
	 ** the use of a smartcontract. It will just batch standard transfers.
	 **********************************************************************************************/
	const onDisperseTokensForGnosis = useCallback(async (): Promise<void> => {
		const transactions: BaseTransaction[] = [];
		const disperseAddresses: TAddress[] = [];
		const disperseAmount: bigint[] = [];
		for (const row of configuration.receivers) {
			if (!row.amount || row.amount?.raw === 0n) {
				continue;
			}
			if (!row.address || row.address === ZERO_ADDRESS || row.address === ETH_TOKEN_ADDRESS) {
				continue;
			}
			disperseAddresses.push(row.address);
			disperseAmount.push(row.amount.raw);
			const newTransactionForBatch = getTransferTransaction(
				row.amount.raw.toString(),
				toAddress(configuration.tokenToSend?.address),
				row.address
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
	}, [address, safeChainID, configuration.receivers, sdk.txs, configuration.tokenToSend, props]);

	const onDisperseTokens = useCallback(async (): Promise<void> => {
		props.onTrigger();
		if (isWalletSafe) {
			return await onDisperseTokensForGnosis();
		}

		const [disperseAddresses, disperseAmount] = configuration.receivers
			.filter((row): boolean => {
				return (toBigInt(row.amount?.raw) > 0n && row.address && !isZeroAddress(row.address)) || false;
			})
			.reduce(
				(acc, row): [TAddress[], bigint[]] => {
					acc[0].push(toAddress(row.address));
					acc[1].push(toBigInt(row.amount?.raw));
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
				refresh([
					{
						decimals: configuration.tokenToSend.decimals,
						name: configuration.tokenToSend.name,
						symbol: configuration.tokenToSend.symbol,
						token: configuration.tokenToSend.address
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
				refresh([
					{
						decimals: configuration.tokenToSend?.decimals,
						name: configuration.tokenToSend?.name,
						symbol: configuration.tokenToSend?.symbol,
						token: toAddress(configuration.tokenToSend?.address)
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
		configuration.receivers,
		configuration.tokenToSend,
		onDisperseTokensForGnosis,
		provider,
		safeChainID,
		refresh
	]);

	function renderStatusIndicator(): ReactElement {
		if (isDispersed) {
			return <IconCircleCheck className={'h-4 w-4 text-[#16a34a]'} />;
		}
		if (disperseStatus.pending) {
			return <IconSpinner className={'h-4 w-4'} />;
		}
		if (disperseStatus.success) {
			return <IconCircleCheck className={'h-4 w-4 text-[#16a34a]'} />;
		}
		if (disperseStatus.error) {
			return <IconCircleCross className={'h-4 w-4 text-[#e11d48]'} />;
		}
		return <div className={'h-4 w-4 rounded-full border border-neutral-200 bg-neutral-300'} />;
	}

	return (
		<div className={'relative w-full'}>
			<div className={'absolute left-4 top-4 flex h-6 items-center'}>{renderStatusIndicator()}</div>
			<button
				id={'DISPERSE_TOKENS'}
				disabled={!disperseStatus.none || !configuration.tokenToSend}
				onClick={onDisperseTokens}
				className={cl(
					'mb-0 flex w-full flex-col justify-center space-y-1 bg-neutral-0 p-4 md:mb-2 pl-5',
					'border border-primary-200 rounded-md',
					'group transition-colors hover:bg-neutral-100 disabled:cursor-default disabled:hover:bg-neutral-0'
				)}>
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
		return configuration.receivers.reduce((acc, row): number => acc + Number(row.amount?.normalized || 0), 0);
	}, [configuration.receivers]);

	const isAboveBalance = totalToDisperse > getBalance(toAddress(configuration.tokenToSend?.address)).raw;

	const checkAlreadyExists = useCallback(
		(UUID: string, address: TAddress): boolean => {
			if (isZeroAddress(address)) {
				return false;
			}
			return configuration.receivers.some((row): boolean => row.UUID !== UUID && row.address === address);
		},
		[configuration.receivers]
	);

	const isValid = useMemo((): boolean => {
		return configuration.receivers.every((row): boolean => {
			if (!row.label && !row.address && toBigInt(row.amount?.raw) === 0n) {
				return false;
			}
			if (!row.address || isZeroAddress(row.address)) {
				return false;
			}
			if (checkAlreadyExists(row.UUID, row.address)) {
				return false;
			}
			if (!row.amount || row.amount.raw === 0n) {
				return false;
			}
			return true;
		});
	}, [configuration.receivers, checkAlreadyExists]);

	return (
		<div className={'col-span-12 mt-4'}>
			<small className={'pb-1 pl-1'}>{'Summary'}</small>

			<div className={'bg-primary-100 rounded-md p-4 md:p-6'}>
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

				<div className={'mt-4 flex w-full justify-end'}>
					<Button
						isBusy={disperseStatus.pending}
						isDisabled={isAboveBalance || configuration.receivers.length === 0 || !isValid}
						onClick={(): void => {
							if (isWalletSafe) {
								return document.getElementById('DISPERSE_TOKENS')?.click();
							}
							if (toAddress(configuration.tokenToSend?.address) === ETH_TOKEN_ADDRESS) {
								return document.getElementById('DISPERSE_TOKENS')?.click();
							}
							return document.getElementById('APPROVE_TOKEN_TO_DISPERSE')?.click();
						}}
						className={'!h-11 w-fit !font-medium'}>
						{'Confirm'}
					</Button>
				</div>
			</div>

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
