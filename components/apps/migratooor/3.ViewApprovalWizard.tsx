import React, {useCallback, useState} from 'react';
import {useWallet} from 'contexts/useWallet';
import {transferERC20, transferEther} from 'utils/actions';
import {getTransferTransaction} from 'utils/gnosis.tools';
import {notifyMigrate} from 'utils/notifier';
import {useSafeAppsSDK} from '@gnosis.pm/safe-apps-react-sdk';
import ApprovalWizardItem from '@migratooor/ApprovalWizardItem';
import {useMigratooor} from '@migratooor/useMigratooor';
import {toast} from '@yearn-finance/web-lib/components/yToast';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChain} from '@yearn-finance/web-lib/hooks/useChain';
import {isZeroAddress, toAddress} from '@yearn-finance/web-lib/utils/address';
import {ETH_TOKEN_ADDRESS, ZERO_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {toBigInt} from '@yearn-finance/web-lib/utils/format.bigNumber';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';

import type {ReactElement} from 'react';
import type {BaseError, Hex} from 'viem';
import type {TAddress, TDict} from '@yearn-finance/web-lib/types';
import type {TBalanceData} from '@yearn-finance/web-lib/types/hooks';
import type {TTxResponse} from '@yearn-finance/web-lib/utils/web3/transaction';
import type {BaseTransaction} from '@gnosis.pm/safe-apps-sdk';
import type {TSelectedElement, TSelectedStatus} from '@migratooor/useMigratooor';

function ViewApprovalWizard(): ReactElement {
	const {address, chainID} = useWeb3();
	const {selected, set_selected, destinationAddress} = useMigratooor();
	const {balances, refresh, balancesNonce} = useWallet();
	const chain = useChain();
	const {walletType, provider} = useWeb3();
	const [isApproving, set_isApproving] = useState(false);
	const {sdk} = useSafeAppsSDK();
	const isGnosisSafe = (walletType === 'EMBED_GNOSIS_SAFE');

	const onUpdateStatus = useCallback((tokenAddress: TAddress, status: TSelectedStatus): void => {
		set_selected((prev): TDict<TSelectedElement> => ({
			...prev,
			[tokenAddress]: {
				...prev[tokenAddress],
				status: status
			}
		}));
	}, [set_selected]);

	/**********************************************************************************************
	** The handleSuccessCallback is called when a transaction is successful. It will update the
	** balances for the token that was transferred and the ETH token. It will also remove the token
	** from the selected state.
	**********************************************************************************************/
	const handleSuccessCallback = useCallback(async (tokenAddress: TAddress): Promise<TDict<TBalanceData>> => {
		const tokensToRefresh = [
			{
				token: ETH_TOKEN_ADDRESS,
				decimals: balances[ETH_TOKEN_ADDRESS].decimals,
				symbol: balances[ETH_TOKEN_ADDRESS].symbol,
				name: balances[ETH_TOKEN_ADDRESS].name
			}
		];
		if (!isZeroAddress(tokenAddress)) {
			tokensToRefresh.push({
				token: tokenAddress,
				decimals: balances[tokenAddress].decimals,
				symbol: balances[tokenAddress].symbol,
				name: balances[tokenAddress].name
			});
		}

		const updatedBalances = await refresh(tokensToRefresh);
		performBatchedUpdates((): void => {
			if (!isZeroAddress(tokenAddress)) {
				set_selected((prev): TDict<TSelectedElement> => ({
					...prev,
					[ETH_TOKEN_ADDRESS]: {
						...prev[toAddress(ETH_TOKEN_ADDRESS)],
						amount: updatedBalances[ETH_TOKEN_ADDRESS]
					}
				}));
			} else {
				set_selected((prev): TDict<TSelectedElement> => ({
					...prev,
					[toAddress(tokenAddress)]: {
						...prev[toAddress(tokenAddress)],
						amount: updatedBalances[tokenAddress]
					},
					[ETH_TOKEN_ADDRESS]: {
						...prev[ETH_TOKEN_ADDRESS],
						amount: updatedBalances[ETH_TOKEN_ADDRESS]
					}
				}));
			}
		});
		balancesNonce; // Disable eslint warning
		return updatedBalances;
	}, [balances, balancesNonce, refresh, set_selected]);

	/**********************************************************************************************
	** The onMigrateERC20 function is called when the user clicks the 'Migrate' button. This
	** function will perform the migration for all the selected tokens, one at a time.
	**********************************************************************************************/
	const onMigrateERC20 = useCallback(async (token: TSelectedElement): Promise<TTxResponse> => {
		onUpdateStatus(token.address, 'pending');
		const result = await transferERC20({
			connector: provider,
			contractAddress: token.address,
			receiverAddress: destinationAddress,
			amount: toBigInt(token.amount?.raw)
		});
		if (result.isSuccessful) {
			onUpdateStatus(token.address, 'success');
			await handleSuccessCallback(token.address);
		}
		if (result.error) {
			onUpdateStatus(token.address, 'error');
		}
		return result;
	}, [destinationAddress, handleSuccessCallback, onUpdateStatus, provider]);

	/**********************************************************************************************
	** The onMigrateETH function is called when the user clicks the 'Migrate' button. This
	** function will perform the migration for ETH coin.
	**********************************************************************************************/
	const onMigrateETH = useCallback(async (): Promise<TTxResponse> => {
		onUpdateStatus(ETH_TOKEN_ADDRESS, 'pending');

		const isSendingBalance = toBigInt(selected[ETH_TOKEN_ADDRESS]?.amount?.raw) >= toBigInt(balances[ETH_TOKEN_ADDRESS]?.raw);
		const result = await transferEther({
			connector: provider,
			receiverAddress: destinationAddress,
			amount: toBigInt(selected[ETH_TOKEN_ADDRESS]?.amount?.raw),
			shouldAdjustForGas: isSendingBalance
		});
		if (result.isSuccessful) {
			onUpdateStatus(ETH_TOKEN_ADDRESS, 'success');
			await handleSuccessCallback(ZERO_ADDRESS);
		}
		if (result.error) {
			onUpdateStatus(ETH_TOKEN_ADDRESS, 'error');
		}
		return result;
	}, [balances, destinationAddress, handleSuccessCallback, onUpdateStatus, provider, selected]);

	/**********************************************************************************************
	** The onMigrateSelectedForGnosis function is called when the user clicks the 'Migrate' button
	** in the Gnosis Safe. This will take advantage of the batch transaction feature of the Gnosis
	** Safe.
	**********************************************************************************************/
	const onMigrateSelectedForGnosis = useCallback(async (allSelected: TSelectedElement[]): Promise<void> => {
		const transactions: BaseTransaction[] = [];
		const migratedTokens: TSelectedElement[] = [];
		for (const token of allSelected) {
			const amount = toBigInt(token?.amount?.raw);
			if (amount === 0n) {
				continue;
			}
			const newTransactionForBatch = getTransferTransaction(
				amount.toString(),
				token.address,
				destinationAddress
			);
			transactions.push(newTransactionForBatch);
			migratedTokens.push(token);
		}
		try {
			const {safeTxHash} = await sdk.txs.send({txs: transactions});
			console.log({hash: safeTxHash});
			toast({type: 'success', content: 'Your transaction has been created! You can now sign and execute it!'});
			notifyMigrate({
				chainID: chainID,
				to: destinationAddress,
				tokensMigrated: migratedTokens,
				hashes: migratedTokens.map((): Hex => safeTxHash as Hex),
				type: 'SAFE',
				from: toAddress(address)
			});
		} catch (error) {
			toast({type: 'error', content: (error as BaseError)?.message || 'An error occured while creating your transaction!'});
		}
	}, [destinationAddress, sdk.txs, chainID, address]);

	/**********************************************************************************************
	** This is the main function that will be called when the user clicks on the 'Migrate' button.
	** It will iterate over the selected tokens and call the onMigrateERC20 function for each
	** token.
	**********************************************************************************************/
	const onHandleMigration = useCallback(async (): Promise<void> => {
		const allSelected = Object.values(selected).filter((token): boolean => token.isSelected && token.status !== 'success');
		if (isGnosisSafe) {
			return onMigrateSelectedForGnosis(allSelected);
		}

		const migratedTokens: TSelectedElement[] = [];
		const hashMessage: Hex[] = [];
		let	shouldMigrateETH = false;
		for (const token of allSelected) {
			if (token.address === ETH_TOKEN_ADDRESS) { //Migrate ETH at the end
				shouldMigrateETH = true;
				continue;
			}
			const result = await onMigrateERC20(token);
			if (result.isSuccessful && result.receipt) {
				migratedTokens.push(token);
				hashMessage.push(result.receipt.transactionHash);
			}
		}

		const willMigrateEth = (shouldMigrateETH || toBigInt(selected?.[ETH_TOKEN_ADDRESS]?.amount?.raw) > 0n);
		if (willMigrateEth) {
			const result = await onMigrateETH();
			if (result.isSuccessful && result.receipt) {
				migratedTokens.push(selected?.[ETH_TOKEN_ADDRESS]);
				hashMessage.push(result.receipt.transactionHash);
			}
		}

		notifyMigrate({
			chainID: chainID,
			to: destinationAddress,
			tokensMigrated: migratedTokens,
			hashes: hashMessage,
			type: 'EOA',
			from: toAddress(address)
		});

	}, [address, chainID, destinationAddress, isGnosisSafe, onMigrateERC20, onMigrateETH, onMigrateSelectedForGnosis, selected]);

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

					{
						Object.values(selected)
							.filter((s): boolean => s.address !== ETH_TOKEN_ADDRESS && s.isSelected)
							.map((token): JSX.Element => {
								return (
									<ApprovalWizardItem
										key={token.address}
										executeStatus={token.status}
										token={{
											address: token.address,
											destination: toAddress(destinationAddress),
											symbol: balances?.[token.address]?.symbol || 'Tokens',
											amount: token.amount?.normalized || '0'
										}} />
								);
							})
					}
					{selected?.[ETH_TOKEN_ADDRESS] && toBigInt(selected?.[ETH_TOKEN_ADDRESS]?.amount?.raw) > 0n ? (
						<ApprovalWizardItem
							executeStatus={selected[ETH_TOKEN_ADDRESS].status}
							token={{
								address: ETH_TOKEN_ADDRESS,
								destination: toAddress(destinationAddress),
								symbol: chain.getCurrent()?.coin || 'ETH',
								amount: `~ ${Number(selected?.[ETH_TOKEN_ADDRESS]?.amount?.normalized || 0)}`
							}} />
					) : null}
				</div>
			</div>
			<button
				id={'TRIGGER_ERC20_MIGRATOOOR_HIDDEN'}
				className={'pointer-events-none invisible block h-0 w-0 opacity-0'}
				disabled={(Object.keys(selected).length === 0) || !provider || isApproving}
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
