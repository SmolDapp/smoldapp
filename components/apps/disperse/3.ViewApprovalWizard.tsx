import React, {useCallback, useMemo, useState} from 'react';
import IconCheck from 'components/icons/IconCheck';
import IconCircleCross from 'components/icons/IconCircleCross';
import IconSpinner from 'components/icons/IconSpinner';
import {approveERC20, disperseERC20, disperseETH, isApprovedERC20} from 'utils/actions';
import {notifyDisperse} from 'utils/notifier';
import {getTransferTransaction} from 'utils/tools.gnosis';
import {erc20ABI, useContractRead} from 'wagmi';
import {useDisperse} from '@disperse/useDisperse';
import {useSafeAppsSDK} from '@gnosis.pm/safe-apps-react-sdk';
import {toast} from '@yearn-finance/web-lib/components/yToast';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {isZeroAddress, toAddress} from '@yearn-finance/web-lib/utils/address';
import {ETH_TOKEN_ADDRESS, ZERO_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {formatBigNumberAsAmount, toBigInt} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';
import {defaultTxStatus} from '@yearn-finance/web-lib/utils/web3/transaction';

import type {ReactElement} from 'react';
import type {BaseError, Hex} from 'viem';
import type {TAddress} from '@yearn-finance/web-lib/types';
import type {TDisperseElement} from '@disperse/useDisperse';
import type {BaseTransaction} from '@gnosis.pm/safe-apps-sdk';

type TApprovalWizardProps = {
	allowance: bigint;
	refetch: () => Promise<void>;
}
function ApprovalWizard({refetch, allowance}: TApprovalWizardProps): ReactElement {
	const {provider} = useWeb3();
	const {tokenToDisperse, disperseArray} = useDisperse();
	const [approvalStatus, set_approvalStatus] = useState(defaultTxStatus);

	const totalToDisperse = useMemo((): bigint => {
		return disperseArray.reduce((acc, row): bigint => acc + toBigInt(row.amount?.raw), 0n);
	}, [disperseArray]);

	const onApproveToken = useCallback(async (): Promise<void> => {
		const isApproved = await isApprovedERC20({
			connector: provider,
			contractAddress: toAddress(tokenToDisperse.address),
			spenderAddress: toAddress(process.env.DISPERSE_ADDRESS),
			amount: totalToDisperse
		});
		if (isApproved) {
			return document.getElementById('DISPERSE_TOKENS')?.click();
		}
		const result = await approveERC20({
			connector: provider,
			contractAddress: tokenToDisperse.address,
			spenderAddress: toAddress(process.env.DISPERSE_ADDRESS),
			amount: totalToDisperse,
			statusHandler: set_approvalStatus
		});
		if (result.isSuccessful) {
			await refetch();
			return document.getElementById('DISPERSE_TOKENS')?.click();
		}
	}, [provider, tokenToDisperse.address, totalToDisperse, refetch]);

	function renderStatusIndicator(): ReactElement {
		if (allowance >= totalToDisperse) {
			return <IconCheck className={'h-3 w-3 text-[#16a34a]'} />;
		}
		if (approvalStatus.pending) {
			return <IconSpinner className={'h-3 w-3'} />;
		}
		if (approvalStatus.success) {
			return <IconCheck className={'h-3 w-3 text-[#16a34a]'} />;
		}
		if (approvalStatus.error) {
			return <IconCircleCross className={'h-3 w-3 text-[#e11d48]'} />;
		}
		return <div className={'h-3 w-3 rounded-full border border-neutral-200 bg-neutral-300'} />;
	}

	return (
		<button
			id={'APPROVE_TOKEN_TO_DISPERSE'}
			disabled={!approvalStatus.none}
			onClick={onApproveToken}
			className={'group mb-0 flex w-full flex-col justify-center space-y-1 rounded-none border border-x-0 border-neutral-200 bg-neutral-0 p-4 transition-colors hover:bg-neutral-100 disabled:cursor-default disabled:hover:bg-neutral-0 md:mb-2 md:rounded-md md:border-x'}>
			<div className={'flex w-full flex-row items-center space-x-3 md:flex-row md:items-center'}>
				{renderStatusIndicator()}
				<div className={'text-left text-sm'}>
					{'Approving '}
					<span
						suppressHydrationWarning
						className={'font-number font-bold'}>
						{formatAmount(
							formatBigNumberAsAmount(totalToDisperse, tokenToDisperse.decimals || 18),
							6,
							tokenToDisperse.decimals || 18
						)}
					</span>
					{` ${tokenToDisperse.symbol || 'Tokens'}`}
				</div>
			</div>
		</button>

	);
}

function DisperseWizardItem({row}: {row: TDisperseElement}): ReactElement {
	const {tokenToDisperse} = useDisperse();

	return (
		<div className={'flex w-full flex-row items-center space-x-3 md:flex-row md:items-center'}>
			<div className={'h-3 w-3'} />
			<div className={'text-left text-sm'}>
				{'Sending '}
				<span className={'font-number font-bold'}>
					{formatAmount(
						row.amount?.normalized || 0,
						6,
						tokenToDisperse.decimals || 18
					)}
				</span>
				{` ${tokenToDisperse.symbol || 'Tokens'} to `}
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

function ViewApprovalWizard(): ReactElement {
	const {address, provider, walletType, chainID} = useWeb3();
	const {onResetDisperse, tokenToDisperse, disperseArray, isDispersed} = useDisperse();
	const {sdk} = useSafeAppsSDK();
	const isGnosisSafe = (walletType === 'EMBED_GNOSIS_SAFE');
	const [disperseStatus, set_disperseStatus] = useState(defaultTxStatus);
	const {data: allowance, refetch} = useContractRead({
		abi: erc20ABI,
		functionName: 'allowance',
		args: [toAddress(address), toAddress(process.env.DISPERSE_ADDRESS)],
		address: tokenToDisperse.address,
		enabled: tokenToDisperse.address !== ETH_TOKEN_ADDRESS
	});

	const shouldApprove = useMemo((): boolean => {
		return tokenToDisperse.address !== ETH_TOKEN_ADDRESS;
	}, [tokenToDisperse.address]);

	/**********************************************************************************************
	** onDisperseTokensForGnosis will do just like disperseTokens but for Gnosis Safe and without
	** the use of a smartcontract. It will just batch standard transfers.
	**********************************************************************************************/
	const onDisperseTokensForGnosis = useCallback(async (): Promise<void> => {
		const transactions: BaseTransaction[] = [];
		const disperseAddresses: TAddress[] = [];
		const disperseAmount: bigint[] = [];
		for (const row of disperseArray) {
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
				tokenToDisperse.address,
				row.address
			);
			transactions.push(newTransactionForBatch);
		}
		try {
			const {safeTxHash} = await sdk.txs.send({txs: transactions});
			console.log({hash: safeTxHash});
			toast({type: 'success', content: 'Your transaction has been created! You can now sign and execute it!'});
			notifyDisperse({
				chainID: chainID,
				tokenToDisperse: tokenToDisperse,
				receivers: disperseAddresses,
				amounts: disperseAmount,
				type: 'SAFE',
				from: toAddress(address),
				hash: safeTxHash as Hex
			});
		} catch (error) {
			toast({type: 'error', content: (error as BaseError)?.message || 'An error occured while creating your transaction!'});
		}
	}, [address, chainID, disperseArray, sdk.txs, tokenToDisperse]);

	const onDisperseTokens = useCallback(async (): Promise<void> => {
		if (isGnosisSafe) {
			return await onDisperseTokensForGnosis();
		}

		const [disperseAddresses, disperseAmount] = disperseArray
			.filter((row): boolean => {
				return (toBigInt(row.amount?.raw) > 0n && row.address && !isZeroAddress(row.address)) || false;
			}).reduce((acc, row): [TAddress[], bigint[]] => {
				acc[0].push(toAddress(row.address));
				acc[1].push(toBigInt(row.amount?.raw));
				return acc;
			}, [[] as TAddress[], [] as bigint[]]);

		if (tokenToDisperse.address === ETH_TOKEN_ADDRESS) {
			const result = await disperseETH({
				connector: provider,
				contractAddress: toAddress(process.env.DISPERSE_ADDRESS),
				receivers: disperseAddresses,
				amounts: disperseAmount,
				statusHandler: set_disperseStatus
			});
			if (result.isSuccessful) {
				onResetDisperse();
				if (result.receipt) {
					notifyDisperse({
						chainID: chainID,
						tokenToDisperse: tokenToDisperse,
						receivers: disperseAddresses,
						amounts: disperseAmount,
						type: 'EOA',
						from: result.receipt.from,
						hash: result.receipt.transactionHash
					});
				}
			}
		} else {
			const result = await disperseERC20({
				connector: provider,
				contractAddress: toAddress(process.env.DISPERSE_ADDRESS),
				tokenToDisperse: tokenToDisperse.address,
				receivers: disperseAddresses,
				amounts: disperseAmount,
				statusHandler: set_disperseStatus
			});
			if (result.isSuccessful) {
				onResetDisperse();
				if (result.receipt) {
					notifyDisperse({
						chainID: chainID,
						tokenToDisperse: tokenToDisperse,
						receivers: disperseAddresses,
						amounts: disperseAmount,
						type: 'EOA',
						from: result.receipt.from,
						hash: result.receipt.transactionHash
					});
				}
			}
		}
	}, [isGnosisSafe, disperseArray, tokenToDisperse, onDisperseTokensForGnosis, provider, onResetDisperse, chainID]);

	function renderStatusIndicator(): ReactElement {
		if (isDispersed) {
			return <IconCheck className={'h-3 w-3 text-[#16a34a]'} />;
		}
		if (disperseStatus.pending) {
			return <IconSpinner className={'h-3 w-3'} />;
		}
		if (disperseStatus.success) {
			return <IconCheck className={'h-3 w-3 text-[#16a34a]'} />;
		}
		if (disperseStatus.error) {
			return <IconCircleCross className={'h-3 w-3 text-[#e11d48]'} />;
		}
		return <div className={'h-3 w-3 rounded-full border border-neutral-200 bg-neutral-300'} />;
	}

	return (
		<section>
			<div className={'box-0 relative flex w-full flex-col items-center justify-center overflow-hidden p-0 md:p-6'}>
				<div className={'mb-0 w-full p-4 md:mb-6 md:p-0'}>
					<b>{'Let’s Disperse!'}</b>
					<p className={'w-full text-sm text-neutral-500 md:w-3/4'}>
						{'Ready? Just sign and execute the transaction and your tokens will fly through cyberspace to their destination addresses. Thanks for using disperse. See you again soon.'}
					</p>
				</div>

				{(shouldApprove && !isGnosisSafe) && (
					<ApprovalWizard
						refetch={async (): Promise<void> => {
							await refetch();
						}}
						allowance={toBigInt(allowance)} />
				)}

				<div className={'relative w-full'}>
					<div className={'absolute left-4 top-4 flex h-5 items-center'}>
						{renderStatusIndicator()}
					</div>
					<button
						id={'DISPERSE_TOKENS'}
						disabled={!disperseStatus.none}
						onClick={onDisperseTokens}
						className={'group mb-0 flex w-full flex-col justify-center space-y-1 rounded-none border border-x-0 border-neutral-200 bg-neutral-0 p-4 transition-colors hover:bg-neutral-100 disabled:cursor-default disabled:hover:bg-neutral-0 md:mb-2 md:rounded-md md:border-x'}>
						{disperseArray
							.filter((row): boolean => toBigInt(row.amount?.raw) !== 0n && row.address !== ZERO_ADDRESS)
							.map((row): ReactElement => <DisperseWizardItem
								key={row.UUID}
								row={row} />)}
					</button>
				</div>

				<div className={'flex w-full flex-row items-center justify-between pt-4 md:relative'}>
					<div className={'flex flex-col'} />
				</div>
			</div>
		</section>
	);
}
export default ViewApprovalWizard;
