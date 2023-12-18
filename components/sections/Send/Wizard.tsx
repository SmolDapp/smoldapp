import React, {Fragment, useCallback, useState} from 'react';
import {useWallet} from 'contexts/useWallet';
import {transferERC20, transferEther} from 'utils/actions';
import {notifyMigrate} from 'utils/notifier';
import {getTransferTransaction} from 'utils/tools.gnosis';
import {useSafeAppsSDK} from '@gnosis.pm/safe-apps-react-sdk';
import {isZeroAddress, toAddress} from '@utils/tools.address';
import {toast} from '@yearn-finance/web-lib/components/yToast';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {ETH_TOKEN_ADDRESS, ZERO_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {toBigInt} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {getNetwork} from '@yearn-finance/web-lib/utils/wagmi/utils';
import {defaultTxStatus, type TTxResponse} from '@yearn-finance/web-lib/utils/web3/transaction';
import {SuccessModal} from '@common/ConfirmationModal';
import {Button} from '@common/Primitives/Button';

import {useSend} from './useSend';

import type {TSendInputElement} from 'components/designSystem/SmolTokenAmountInput';
import type {ReactElement} from 'react';
import type {BaseError, Hex} from 'viem';
import type {TAddress, TDict} from '@yearn-finance/web-lib/types';
import type {TBalanceData} from '@yearn-finance/web-lib/types/hooks';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import type {BaseTransaction} from '@gnosis.pm/safe-apps-sdk';
import type {TModify, TToken} from '@utils/types/types';

type TInputWithTokens = TModify<TSendInputElement, {token: TToken}>;

function SpendingWizard(props: {onHandleMigration: VoidFunction}): ReactElement {
	const {configuration} = useSend();

	if (!configuration.receiver || isZeroAddress(configuration.receiver.address)) {
		return (
			<button
				disabled
				className={cl(
					'mb-0 flex w-full flex-col justify-center space-y-1 bg-neutral-0 p-4 md:mb-2',
					'border border-primary-200 rounded-md',
					'group transition-colors hover:bg-neutral-100 disabled:cursor-default disabled:hover:bg-neutral-0'
				)}>
				<div className={'flex w-full flex-row items-center space-x-3 md:flex-row md:items-start'}>
					<div className={'pt-0.5'}>
						<div className={'h-4 w-4 rounded-full border border-neutral-200 bg-neutral-300'} />
					</div>

					<div className={'flex w-full flex-row items-center space-x-3 md:flex-row md:items-center'}>
						<div className={'text-left text-sm text-neutral-900/40'}>
							{'Please select a valid receiver for your tokens.'}
						</div>
					</div>
				</div>
			</button>
		);
	}

	return (
		<Fragment>
			<button
				onClick={props.onHandleMigration}
				className={cl(
					'mb-0 flex w-full flex-col justify-center space-y-1 bg-neutral-0 p-4 md:mb-2',
					'border border-primary-200 rounded-md',
					'group transition-colors hover:bg-neutral-100 disabled:cursor-default disabled:hover:bg-neutral-0'
				)}>
				{'Button'}
			</button>
		</Fragment>
	);
}

export function SendWizard(): ReactElement {
	const {address} = useWeb3();
	const {safeChainID} = useChainID();
	const {configuration, dispatchConfiguration} = useSend();
	const {balances, refresh, balancesNonce} = useWallet();
	const {isWalletSafe, provider} = useWeb3();
	const {sdk} = useSafeAppsSDK();
	const [migrateStatus, set_migrateStatus] = useState(defaultTxStatus);

	const onUpdateStatus = useCallback(
		(UUID: string, status: 'pending' | 'success' | 'error' | 'none'): void => {
			dispatchConfiguration({
				type: 'SET_VALUE',
				payload: {
					UUID,
					status
				}
			});
		},
		[dispatchConfiguration]
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
		async (token: TToken, amount: TNormalizedBN): Promise<TTxResponse> => {
			onUpdateStatus(token.address, 'pending');
			const result = await transferERC20({
				connector: provider,
				chainID: safeChainID,
				contractAddress: token.address,
				receiverAddress: configuration.receiver?.address,
				amount: toBigInt(amount.raw)
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
		[configuration.receiver, handleSuccessCallback, onUpdateStatus, provider, safeChainID]
	);

	/**********************************************************************************************
	 ** The onMigrateETH function is called when the user clicks the 'Migrate' button. This
	 ** function will perform the migration for ETH coin.
	 **********************************************************************************************/
	const onMigrateETH = useCallback(async (): Promise<TTxResponse> => {
		onUpdateStatus(ETH_TOKEN_ADDRESS, 'pending');
		const ethAmountRaw = configuration.inputs.find(input => input.token?.address === ETH_TOKEN_ADDRESS)?.amount
			?.raw;

		const isSendingBalance = toBigInt(ethAmountRaw) >= toBigInt(balances[ETH_TOKEN_ADDRESS]?.raw);
		const result = await transferEther({
			connector: provider,
			chainID: safeChainID,
			receiverAddress: configuration.receiver?.address,
			amount: toBigInt(ethAmountRaw),
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
	}, [
		balances,
		configuration.inputs,
		configuration.receiver?.address,
		handleSuccessCallback,
		onUpdateStatus,
		provider,
		safeChainID
	]);

	/**********************************************************************************************
	 ** The onMigrateSelectedForGnosis function is called when the user clicks the 'Migrate' button
	 ** in the Gnosis Safe. This will take advantage of the batch transaction feature of the Gnosis
	 ** Safe.
	 **********************************************************************************************/
	const onMigrateSelectedForGnosis = useCallback(
		async (allSelected: TInputWithTokens[]): Promise<void> => {
			const transactions: BaseTransaction[] = [];
			const migratedTokens: TSendInputElement[] = [];
			for (const input of allSelected) {
				const amount = toBigInt(input.amount.raw);
				if (amount === 0n) {
					continue;
				}
				const newTransactionForBatch = getTransferTransaction(
					amount.toString(),
					input.token.address,
					toAddress(configuration.receiver?.address)
				);
				transactions.push(newTransactionForBatch);
				migratedTokens.push(input);
			}
			try {
				const {safeTxHash} = await sdk.txs.send({txs: transactions});
				console.log({hash: safeTxHash});
				set_migrateStatus({...defaultTxStatus, success: true});
				toast({
					type: 'success',
					content: 'Your transaction has been created! You can now sign and execute it!'
				});
				notifyMigrate({
					chainID: safeChainID,
					to: toAddress(configuration.receiver?.address),
					tokensMigrated: migratedTokens,
					hashes: migratedTokens.map((): Hex => safeTxHash as Hex),
					type: 'SAFE',
					from: toAddress(address)
				});
			} catch (error) {
				set_migrateStatus({...defaultTxStatus, success: false});
				toast({
					type: 'error',
					content: (error as BaseError)?.message || 'An error occured while creating your transaction!'
				});
			}
		},
		[configuration.receiver?.address, sdk.txs, safeChainID, address]
	);

	/**********************************************************************************************
	 ** This is the main function that will be called when the user clicks on the 'Migrate' button.
	 ** It will iterate over the selected tokens and call the onMigrateERC20 function for each
	 ** token.
	 **********************************************************************************************/
	const onHandleMigration = useCallback(async (): Promise<void> => {
		set_migrateStatus({...defaultTxStatus, pending: true});

		let areAllSuccess = true;
		const allSelected = configuration.inputs.filter(
			(input): input is TInputWithTokens => !!input.token && input.status !== 'success'
		);

		if (isWalletSafe) {
			return onMigrateSelectedForGnosis(allSelected);
		}

		const migratedTokens: TSendInputElement[] = [];
		const hashMessage: Hex[] = [];
		let shouldMigrateETH = false;
		for (const input of allSelected) {
			if (input.token.address === ETH_TOKEN_ADDRESS) {
				//Migrate ETH at the end
				shouldMigrateETH = true;
				continue;
			}
			const result = await onMigrateERC20(input.token, input.amount);
			if (result.isSuccessful && result.receipt) {
				migratedTokens.push(input);
				hashMessage.push(result.receipt.transactionHash);
			} else {
				areAllSuccess = false;
			}
		}
		const ethToken = configuration.inputs.find(input => input.token?.address === ETH_TOKEN_ADDRESS);
		const ethAmountRaw = ethToken?.amount?.raw;

		const willMigrateEth = shouldMigrateETH || toBigInt(ethAmountRaw) > 0n;
		if (willMigrateEth) {
			const result = await onMigrateETH();
			if (result.isSuccessful && result.receipt) {
				ethToken && migratedTokens.push(ethToken);
				hashMessage.push(result.receipt.transactionHash);
			} else {
				areAllSuccess = false;
			}
		}

		if (migratedTokens.length > 0) {
			if (areAllSuccess) {
				set_migrateStatus({...defaultTxStatus, success: true});
			} else {
				set_migrateStatus(defaultTxStatus);
			}

			notifyMigrate({
				chainID: safeChainID,
				to: toAddress(configuration.receiver?.address),
				tokensMigrated: migratedTokens,
				hashes: hashMessage,
				type: 'EOA',
				from: toAddress(address)
			});
		}
	}, [
		configuration.inputs,
		configuration.receiver?.address,
		isWalletSafe,
		onMigrateSelectedForGnosis,
		onMigrateERC20,
		onMigrateETH,
		safeChainID,
		address
	]);

	return (
		<div className={'col-span-12 mt-4'}>
			<small className={'pb-1 pl-1'}>{'Summary'}</small>

			<div className={'bg-primary-100 rounded-md md:p-6'}>
				<SpendingWizard onHandleMigration={onHandleMigration} />

				<div className={'mt-4 flex w-full justify-end'}>
					<Button
						isBusy={migrateStatus.pending}
						isDisabled={
							isZeroAddress(configuration.receiver?.address) ||
							configuration.inputs.map(input => !!input.token).length === 0
						}
						onClick={onHandleMigration}
						className={'!h-11 w-fit !font-medium'}>
						{'Confirm'}
					</Button>
				</div>

				<SuccessModal
					title={'It looks like a success!'}
					content={
						'Like a fancy bird, your tokens have migrated! They are moving to their new home, with their new friends.'
					}
					ctaLabel={'Close'}
					isOpen={migrateStatus.success}
					onClose={(): void => {
						dispatchConfiguration({type: 'RESET', payload: undefined});
						set_migrateStatus(defaultTxStatus);
					}}
				/>
			</div>
		</div>
	);
}
