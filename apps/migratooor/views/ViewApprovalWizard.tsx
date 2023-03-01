import React, {useCallback, useState} from 'react';
import useWallet from 'apps/common/contexts/useWallet';
import ApprovalWizardItem from 'apps/migratooor/components/ApprovalWizardItem';
import {useMigratooor} from 'apps/tokenlistooor/contexts/useMigratooor';
import {sendEther} from 'utils/actions/sendEth';
import {transfer} from 'utils/actions/transferERC20';
import {getTransferTransaction} from 'utils/gnosis.tools';
import {useSafeAppsSDK} from '@gnosis.pm/safe-apps-react-sdk';
import {useUpdateEffect} from '@react-hookz/web';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChain} from '@yearn-finance/web-lib/hooks/useChain';
import {addressZero, isZeroAddress, toAddress} from '@yearn-finance/web-lib/utils/address';
import {ETH_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {toNormalizedBN, Zero} from '@yearn-finance/web-lib/utils/format.bigNumber';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';
import {defaultTxStatus, Transaction} from '@yearn-finance/web-lib/utils/web3/transaction';

import type {TMinBalanceData} from 'apps/common/hooks/useBalances';
import type {ReactElement} from 'react';
import type {TAddress, TDict} from '@yearn-finance/web-lib/types';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import type {BaseTransaction} from '@gnosis.pm/safe-apps-sdk';

export type TExecuteStatus = 'Executed' | 'Not Executed' | 'Executing' | 'Error'

function	ViewApprovalWizard(): ReactElement {
	const	{selected, set_selected, amounts, set_amounts, destinationAddress, shouldDonateETH, amountToDonate, set_amountToDonate, set_shouldDonateETH} = useMigratooor();

	const	{balances, refresh, balancesNonce} = useWallet();
	const	chain = useChain();
	const	{walletType, provider} = useWeb3();
	const	[isApproving, set_isApproving] = useState(false);
	const	[executeStatus, set_executeStatus] = useState<TDict<TExecuteStatus>>({});
	const	[migrated, set_migrated] = useState<TDict<TAddress[]>>({});
	const	[, set_txStatus] = useState(defaultTxStatus);
	const	{sdk} = useSafeAppsSDK();

	/**********************************************************************************************
	** This updates the executeStatus state when the selected state changes. The state will be
	** updated to 'Not Executed' for all selected tokens unless they are already in the
	** executeStatus state.
	** A special case is made for the donations token. If the donations token is selected, it will
	** be added to the executeStatus state for addressZero.
	**********************************************************************************************/
	useUpdateEffect((): void => {
		const	initStatus: TDict<TExecuteStatus> = {};
		for (const token of selected) {
			if (initStatus[token] === undefined) {
				initStatus[token] = 'Not Executed';
			}
		}
		if (initStatus[addressZero] === undefined) { //Donations
			initStatus[addressZero] = 'Not Executed';
		}
		set_executeStatus(initStatus);
	}, [selected]);

	/**********************************************************************************************
	** onClearMigration is called when the user click the "Migrate selected" button again after a
	** first transaction has been sent. We need to remove the zero balance tokens from the selected
	** state.
	**********************************************************************************************/
	const onClearMigration = useCallback((): TAddress[] => {
		const	newSelected: TAddress[] = [];
		performBatchedUpdates((): void => {
			for (const addr of selected) {
				if (isZeroAddress(addr)) {
					continue;
				}
				if (balances[addr] === undefined) {
					continue;
				}
				if (balances[addr].raw.isZero()) {
					continue;
				}
				newSelected.push(addr);
			}
			set_migrated({});
			set_selected(newSelected);
		});
		return newSelected;
	}, [migrated, balances, selected]); // eslint-disable-line react-hooks/exhaustive-deps

	/**********************************************************************************************
	** The handleSuccessCallback is called when a transaction is successful. It will update the
	** balances for the token that was transferred and the ETH token. It will also remove the token
	** from the selected state.
	**********************************************************************************************/
	const	handleSuccessCallback = useCallback(async (tokenAddress: TAddress): Promise<TDict<TMinBalanceData>> => {
		const tokensToRefresh = [{token: ETH_TOKEN_ADDRESS, decimals: balances[ETH_TOKEN_ADDRESS].decimals, symbol: balances[ETH_TOKEN_ADDRESS].symbol}];
		if (!isZeroAddress(tokenAddress)) {
			tokensToRefresh.push({token: tokenAddress, decimals: balances[tokenAddress].decimals, symbol: balances[tokenAddress].symbol});
		}

		const updatedBalances = await refresh(tokensToRefresh);
		performBatchedUpdates((): void => {
			if (!isZeroAddress(tokenAddress)) {
				set_amounts((amounts: TDict<TNormalizedBN>): TDict<TNormalizedBN> => ({...amounts, [ETH_TOKEN_ADDRESS]: updatedBalances[ETH_TOKEN_ADDRESS]}));
			} else {
				set_amounts((amounts: TDict<TNormalizedBN>): TDict<TNormalizedBN> => ({
					...amounts,
					[ETH_TOKEN_ADDRESS]: updatedBalances[ETH_TOKEN_ADDRESS],
					[tokenAddress]: updatedBalances[tokenAddress]
				}));
			}
			// set_selected((s: TAddress[]): TAddress[] => s.filter((item: TAddress): boolean => toAddress(item) !== tokenAddress));
		});
		return updatedBalances;
	}, [balances, balancesNonce]); // eslint-disable-line react-hooks/exhaustive-deps

	/**********************************************************************************************
	** The onMigrateERC20 function is called when the user clicks the 'Migrate' button. This
	** function will perform the migration for all the selected tokens, one at a time.
	**********************************************************************************************/
	const onMigrateERC20 = useCallback(async (tokenAddress: TAddress): Promise<boolean> => {
		try {
			set_executeStatus((prev): TDict<TExecuteStatus> => ({...prev, [tokenAddress]: 'Executing'}));
			const	{isSuccessful} = await new Transaction(provider, transfer, set_txStatus).populate(
				tokenAddress,
				toAddress(destinationAddress),
				amounts[tokenAddress]?.raw
			).onSuccess(async (): Promise<void> => {
				set_executeStatus((prev): TDict<TExecuteStatus> => ({...prev, [tokenAddress]: 'Executed'}));
				await handleSuccessCallback(tokenAddress);
			}).perform();

			if (!isSuccessful) {
				set_executeStatus((prev): TDict<TExecuteStatus> => ({...prev, [tokenAddress]: 'Error'}));
			}
			return isSuccessful;
		} catch (error) {
			set_executeStatus((prev): TDict<TExecuteStatus> => ({...prev, [tokenAddress]: 'Error'}));
		}
		return false;
	}, [amounts, destinationAddress, handleSuccessCallback, provider]);

	/**********************************************************************************************
	** The onMigrateETH function is called when the user clicks the 'Migrate' button. This
	** function will perform the migration for ETH coin.
	**********************************************************************************************/
	const onMigrateETH = useCallback(async (): Promise<boolean> => {
		try {
			set_executeStatus((prev): TDict<TExecuteStatus> => ({...prev, [ETH_TOKEN_ADDRESS]: 'Executing'}));
			const	{isSuccessful} = await new Transaction(provider, sendEther, set_txStatus).populate(
				toAddress(destinationAddress),
				amounts[ETH_TOKEN_ADDRESS]?.raw,
				balances[ETH_TOKEN_ADDRESS]?.raw
			).onSuccess(async (): Promise<void> => {
				set_executeStatus((prev): TDict<TExecuteStatus> => ({...prev, [ETH_TOKEN_ADDRESS]: 'Executed'}));
				await handleSuccessCallback(toAddress(addressZero));
			}).perform();

			if (!isSuccessful) {
				set_executeStatus((prev): TDict<TExecuteStatus> => ({...prev, [ETH_TOKEN_ADDRESS]: 'Error'}));
			}
			return isSuccessful;
		} catch (error) {
			set_executeStatus((prev): TDict<TExecuteStatus> => ({...prev, [ETH_TOKEN_ADDRESS]: 'Error'}));
		}
		return false;
	}, [amounts, balances, destinationAddress, handleSuccessCallback, provider]);

	/**********************************************************************************************
	** The onDonateETH function is called when the user clicks the 'Migrate' button. This
	** function will perform the migration for ETH coin to the donation address.
	**********************************************************************************************/
	const onDonateETH = useCallback(async (): Promise<boolean> => {
		try {
			set_executeStatus((prev): TDict<TExecuteStatus> => ({...prev, [addressZero]: 'Executing'}));
			const	{isSuccessful} = await new Transaction(provider, sendEther, set_txStatus).populate(
				toAddress(process.env.RECEIVER_ADDRESS),
				amountToDonate.raw,
				balances[ETH_TOKEN_ADDRESS]?.raw
			).onSuccess(async (): Promise<void> => {
				set_executeStatus((prev): TDict<TExecuteStatus> => ({...prev, [addressZero]: 'Executed'}));
				performBatchedUpdates((): void => {
					set_amountToDonate(toNormalizedBN(0));
					set_shouldDonateETH(false);
				});
				await handleSuccessCallback(toAddress(addressZero));
			}).perform();

			if (!isSuccessful) {
				set_executeStatus((prev): TDict<TExecuteStatus> => ({...prev, [addressZero]: 'Error'}));
			}
			return isSuccessful;
		} catch (error) {
			set_executeStatus((prev): TDict<TExecuteStatus> => ({...prev, [addressZero]: 'Error'}));
		}
		return false;
	}, [amountToDonate.raw, balances, handleSuccessCallback, provider]); // eslint-disable-line react-hooks/exhaustive-deps

	/**********************************************************************************************
	** The onMigrateSelectedForGnosis function is called when the user clicks the 'Migrate' button
	** in the Gnosis Safe. This will take advantage of the batch transaction feature of the Gnosis
	** Safe.
	**********************************************************************************************/
	const onMigrateSelectedForGnosis = useCallback(async (allSelected: TAddress[]): Promise<void> => {
		const	transactions: BaseTransaction[] = [];
		for (const token of allSelected) {
			const	tokenAddress = toAddress(token);
			const	amount = amounts[tokenAddress]?.raw;
			if (amount?.isZero()) {
				continue;
			}
			const	newTransactionForBatch = getTransferTransaction(
				amount.toString(),
				tokenAddress,
				destinationAddress
			);
			transactions.push(newTransactionForBatch);
		}
		const {safeTxHash} = await sdk.txs.send({txs: transactions});
		console.log({hash: safeTxHash});
	}, [amounts, destinationAddress, sdk.txs]);

	/**********************************************************************************************
	** This is the main function that will be called when the user clicks on the 'Migrate' button.
	** It will iterate over the selected tokens and call the onMigrateERC20 function for each
	** token.
	**********************************************************************************************/
	const	onHandleMigration = useCallback(async (): Promise<void> => {
		const	allSelected = [...await onClearMigration()];
		if (walletType === 'EMBED_GNOSIS_SAFE') {
			return onMigrateSelectedForGnosis(allSelected);
		}

		let	shouldMigrateETH = false;
		for (const token of allSelected) {
			if (toAddress(token) === ETH_TOKEN_ADDRESS) { //Migrate ETH at the end
				shouldMigrateETH = true;
				continue;
			}
			await onMigrateERC20(toAddress(token));
		}

		const	willDonateEth = (shouldDonateETH && (amountToDonate?.raw || Zero).gt(Zero));
		const	willMigrateEth = (shouldMigrateETH && (amounts[ETH_TOKEN_ADDRESS]?.raw || Zero).gt(Zero));
		const	hasEnoughEth = balances[ETH_TOKEN_ADDRESS]?.raw?.gt((amounts[ETH_TOKEN_ADDRESS]?.raw || Zero).sub(amountToDonate.raw)) && (amounts[ETH_TOKEN_ADDRESS]?.raw || Zero).sub(amountToDonate.raw).gt(0);
		if (willDonateEth && willMigrateEth && hasEnoughEth) {
			const	isOK = await onDonateETH();
			if (isOK) {
				await onMigrateETH();
			}
		} else if (willDonateEth) {
			await onDonateETH();
		} else if (willMigrateEth) {
			await onMigrateETH();
		}
	}, [amountToDonate.raw, amounts, balances, onClearMigration, onDonateETH, onMigrateERC20, onMigrateETH, onMigrateSelectedForGnosis, shouldDonateETH, walletType]);

	return (
		<section>
			<div className={'box-0 relative w-full'}>
				<div className={'approvalWizardDivider flex w-full flex-col items-center justify-center overflow-hidden p-4 last:border-b-0 md:p-6'}>
					<div className={'mb-6 w-full'}>
						<b>{'Review and proceed'}</b>
						<p className={'text-sm text-neutral-500'}>
							{'We are now migrating your tokens! Review each transaction and enjoy a fresh start!'}
						</p>
					</div>

					{selected.filter((token): boolean => toAddress(token) !== ETH_TOKEN_ADDRESS).map((token, index): JSX.Element => {
						return (
							<ApprovalWizardItem
								key={index}
								executeStatus={executeStatus?.[toAddress(token)]}
								token={{
									address: toAddress(token),
									destination: toAddress(destinationAddress),
									symbol: balances?.[toAddress(token)]?.symbol || 'Tokens',
									amount: amounts?.[toAddress(token)]?.normalized || 0
								}} />
						);
					})}
					{amountToDonate.raw.gt(0) ? (
						<ApprovalWizardItem
							executeStatus={executeStatus?.[addressZero]}
							prefix={'Donate'}
							token={{
								address: ETH_TOKEN_ADDRESS,
								destination: toAddress(process.env.RECEIVER_ADDRESS),
								symbol: chain.getCurrent()?.coin || 'ETH',
								amount: amountToDonate?.normalized || 0
							}} />
					) : null}
					{selected.includes(ETH_TOKEN_ADDRESS) && amounts[ETH_TOKEN_ADDRESS]?.raw.gt(0) ? (
						<ApprovalWizardItem
							executeStatus={executeStatus?.[ETH_TOKEN_ADDRESS]}
							token={{
								address: ETH_TOKEN_ADDRESS,
								destination: toAddress(destinationAddress),
								symbol: chain.getCurrent()?.coin || 'ETH',
								amount: `~ ${Number(amounts[ETH_TOKEN_ADDRESS]?.normalized || 0) - Number(amountToDonate?.normalized || 0)}`
							}} />
					) : null}
				</div>
			</div>
			<button
				id={'TRIGGER_ERC20_MIGRATOOOR_HIDDEN'}
				className={'pointer-events-none invisible block h-0 w-0 opacity-0'}
				disabled={(selected.length === 0) || !provider || isApproving}
				onClick={(): void => {
					set_isApproving(true);
					onHandleMigration().then((): void => {
						set_isApproving(false);
					});
				}}/>
		</section>
	);
}
export default ViewApprovalWizard;
