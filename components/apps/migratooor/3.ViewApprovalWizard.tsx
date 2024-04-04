import React, {useCallback, useState} from 'react';
import {useWallet} from 'contexts/useWallet';
import {transferERC20, transferEther} from 'utils/actions';
import {notifyMigrate} from 'utils/notifier';
import {getTransferTransaction} from 'utils/tools.gnosis';
import {useSafeAppsSDK} from '@gnosis.pm/safe-apps-react-sdk';
import ApprovalWizardItem from '@migratooor/ApprovalWizardItem';
import {useMigratooor} from '@migratooor/useMigratooor';
import {toast} from '@yearn-finance/web-lib/components/yToast';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {isZeroAddress, toAddress} from '@yearn-finance/web-lib/utils/address';
import {ETH_TOKEN_ADDRESS, ZERO_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {toBigInt} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {getNetwork} from '@yearn-finance/web-lib/utils/wagmi/utils';

import type {ReactElement} from 'react';
import type {BaseError, Hex} from 'viem';
import type {TAddress, TDict} from '@yearn-finance/web-lib/types';
import type {TBalanceData} from '@yearn-finance/web-lib/types/hooks';
import type {TTxResponse} from '@yearn-finance/web-lib/utils/web3/transaction';
import type {BaseTransaction} from '@gnosis.pm/safe-apps-sdk';
import type {TSelectedElement, TSelectedStatus} from '@migratooor/useMigratooor';

function ViewApprovalWizard(): ReactElement {
	const {address} = useWeb3();
	const {safeChainID} = useChainID();
	const {selected, set_selected, destinationAddress} = useMigratooor();
	const {balances, refresh, balancesNonce} = useWallet();
	const {isWalletSafe, provider} = useWeb3();
	const [isApproving, set_isApproving] = useState(false);
	const {sdk} = useSafeAppsSDK();

	const onUpdateStatus = useCallback(
		(tokenAddress: TAddress, status: TSelectedStatus): void => {
			set_selected(
				(prev): TDict<TSelectedElement> => ({
					...prev,
					[tokenAddress]: {
						...prev[tokenAddress],
						status: status
					}
				})
			);
		},
		[set_selected]
	);

	/**********************************************************************************************
	 ** The handleSuccessCallback is called when a transaction is successful. It will update the
	 ** balances for the token that was transferred and the ETH token. It will also remove the token
	 ** from the selected state.
	 **********************************************************************************************/
	const handleSuccessCallback = useCallback(
		async (tokenAddress: TAddress): Promise<TDict<TBalanceData>> => {
			const chainCoin = getNetwork(safeChainID).nativeCurrency;
			const tokensToRefresh = [
				{
					token: ETH_TOKEN_ADDRESS,
					decimals: chainCoin?.decimals || 18,
					symbol: chainCoin?.symbol || 'ETH',
					name: chainCoin?.name || 'Ether'
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
			balancesNonce; // Disable eslint warning
			return updatedBalances;
		},
		[balances, balancesNonce, safeChainID, refresh]
	);

	/**********************************************************************************************
	 ** The onMigrateERC20 function is called when the user clicks the 'Migrate' button. This
	 ** function will perform the migration for all the selected tokens, one at a time.
	 **********************************************************************************************/
	const onMigrateERC20 = useCallback(
		async (token: TSelectedElement): Promise<TTxResponse> => {
			onUpdateStatus(token.address, 'pending');
			const result = await transferERC20({
				connector: provider,
				chainID: safeChainID,
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
		},
		[destinationAddress, handleSuccessCallback, onUpdateStatus, provider, safeChainID]
	);

	/**********************************************************************************************
	 ** The onMigrateETH function is called when the user clicks the 'Migrate' button. This
	 ** function will perform the migration for ETH coin.
	 **********************************************************************************************/
	const onMigrateETH = useCallback(async (): Promise<TTxResponse> => {
		onUpdateStatus(ETH_TOKEN_ADDRESS, 'pending');

		const isSendingBalance =
			toBigInt(selected[ETH_TOKEN_ADDRESS]?.amount?.raw) >= toBigInt(balances[ETH_TOKEN_ADDRESS]?.raw);
		const result = await transferEther({
			connector: provider,
			chainID: safeChainID,
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
	}, [balances, destinationAddress, handleSuccessCallback, onUpdateStatus, provider, safeChainID, selected]);

	/**********************************************************************************************
	 ** The onMigrateSelectedForGnosis function is called when the user clicks the 'Migrate' button
	 ** in the Gnosis Safe. This will take advantage of the batch transaction feature of the Gnosis
	 ** Safe.
	 **********************************************************************************************/
	const onMigrateSelectedForGnosis = useCallback(
		async (allSelected: TSelectedElement[]): Promise<void> => {
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
				toast({
					type: 'success',
					content: 'Your transaction has been created! You can now sign and execute it!'
				});
				notifyMigrate({
					chainID: safeChainID,
					to: destinationAddress,
					tokensMigrated: migratedTokens,
					hashes: migratedTokens.map((): Hex => safeTxHash as Hex),
					type: 'SAFE',
					from: toAddress(address)
				});
			} catch (error) {
				toast({
					type: 'error',
					content: (error as BaseError)?.message || 'An error occured while creating your transaction!'
				});
			}
		},
		[destinationAddress, sdk.txs, safeChainID, address]
	);

	/**********************************************************************************************
	 ** This is the main function that will be called when the user clicks on the 'Migrate' button.
	 ** It will iterate over the selected tokens and call the onMigrateERC20 function for each
	 ** token.
	 **********************************************************************************************/
	const onHandleMigration = useCallback(async (): Promise<void> => {
		const allSelected = Object.values(selected).filter(
			(token): boolean => token.isSelected && token.status !== 'success'
		);
		if (isWalletSafe) {
			return onMigrateSelectedForGnosis(allSelected);
		}

		const migratedTokens: TSelectedElement[] = [];
		const hashMessage: Hex[] = [];
		let shouldMigrateETH = false;
		for (const token of allSelected) {
			if (token.address === ETH_TOKEN_ADDRESS) {
				//Migrate ETH at the end
				shouldMigrateETH = true;
				continue;
			}
			const result = await onMigrateERC20(token);
			if (result.isSuccessful && result.receipt) {
				migratedTokens.push(token);
				hashMessage.push(result.receipt.transactionHash);
			}
		}

		const willMigrateEth = shouldMigrateETH || toBigInt(selected?.[ETH_TOKEN_ADDRESS]?.amount?.raw) > 0n;
		if (willMigrateEth) {
			const result = await onMigrateETH();
			if (result.isSuccessful && result.receipt) {
				migratedTokens.push(selected?.[ETH_TOKEN_ADDRESS]);
				hashMessage.push(result.receipt.transactionHash);
			}
		}

		if (migratedTokens.length > 0) {
			notifyMigrate({
				chainID: safeChainID,
				to: destinationAddress,
				tokensMigrated: migratedTokens,
				hashes: hashMessage,
				type: 'EOA',
				from: toAddress(address)
			});
		}
	}, [
		address,
		safeChainID,
		destinationAddress,
		isWalletSafe,
		onMigrateERC20,
		onMigrateETH,
		onMigrateSelectedForGnosis,
		selected
	]);

	return (
		<section>
			<div className={'box-0 relative w-full'}>
				<div
					className={
						'approvalWizardDivider flex w-full flex-col items-center justify-center overflow-hidden p-4 last:border-b-0 md:p-6'
					}>
					<div className={'mb-6 w-full'}>
						<b>{'Review and proceed'}</b>
						<p className={'text-sm text-neutral-500'}>
							{'We are now migrating your tokens! Review each transaction and enjoy a fresh start!'}
						</p>
					</div>

					{Object.values(selected)
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
									}}
								/>
							);
						})}
					{selected?.[ETH_TOKEN_ADDRESS] &&
					toBigInt(selected?.[ETH_TOKEN_ADDRESS]?.amount?.raw) > 0n &&
					selected?.[ETH_TOKEN_ADDRESS].isSelected ? (
						<ApprovalWizardItem
							executeStatus={selected[ETH_TOKEN_ADDRESS].status}
							token={{
								address: ETH_TOKEN_ADDRESS,
								destination: toAddress(destinationAddress),
								symbol: getNetwork(safeChainID).nativeCurrency.symbol,
								amount: `~ ${Number(selected?.[ETH_TOKEN_ADDRESS]?.amount?.normalized || 0)}`
							}}
						/>
					) : null}
				</div>
			</div>
			<button
				id={'TRIGGER_ERC20_MIGRATOOOR_HIDDEN'}
				className={'pointer-events-none invisible block size-0 opacity-0'}
				disabled={Object.keys(selected).length === 0 || !provider || isApproving}
				onClick={(): void => {
					set_isApproving(true);
					onHandleMigration().then((): void => {
						set_isApproving(false);
					});
				}}
			/>
		</section>
	);
}
export default ViewApprovalWizard;
