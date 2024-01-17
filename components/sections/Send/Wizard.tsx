import React, {useCallback, useState} from 'react';
import {Button} from 'components/Primitives/Button';
import {useWallet} from 'contexts/useWallet';
import {transferERC20, transferEther} from 'utils/actions';
import {getTransferTransaction} from 'utils/tools.gnosis';
import {isAddressEqual} from 'viem';
import {useSafeAppsSDK} from '@gnosis.pm/safe-apps-react-sdk';
import {notifySend} from '@utils/notifier';
import {isNullAddress, isZeroAddress, toAddress} from '@utils/tools.address';
import {toast} from '@yearn-finance/web-lib/components/yToast';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {ETH_TOKEN_ADDRESS, ZERO_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {toBigInt} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {getNetwork} from '@yearn-finance/web-lib/utils/wagmi/utils';
import {defaultTxStatus, type TTxResponse} from '@yearn-finance/web-lib/utils/web3/transaction';
import {SuccessModal} from '@common/ConfirmationModal';

import {useSendFlow} from './useSendFlow';

import type {TSendInputElement} from 'components/designSystem/SmolTokenAmountInput';
import type {ReactElement} from 'react';
import type {BaseError, Hex} from 'viem';
import type {TAddress, TDict} from '@yearn-finance/web-lib/types';
import type {TBalanceData} from '@yearn-finance/web-lib/types/hooks';
import type {BaseTransaction} from '@gnosis.pm/safe-apps-sdk';
import type {TModify, TToken} from '@utils/types/types';

type TInputWithToken = TModify<TSendInputElement, {token: TToken}>;

export function SendWizard({isReceiverERC20}: {isReceiverERC20: boolean}): ReactElement {
	const {safeChainID} = useChainID();
	const {address} = useWeb3();

	const {configuration, dispatchConfiguration} = useSendFlow();
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
		async (input: TInputWithToken): Promise<TTxResponse> => {
			const tokenAddress = input.token.address;
			const inputUUID = input.UUID;

			onUpdateStatus(inputUUID, 'pending');

			const result = await transferERC20({
				connector: provider,
				chainID: safeChainID,
				contractAddress: tokenAddress,
				receiverAddress: configuration.receiver?.address,
				amount: input.normalizedBigAmount.raw
			});
			if (result.isSuccessful) {
				onUpdateStatus(inputUUID, 'success');
				await handleSuccessCallback(tokenAddress);
			}
			if (result.error) {
				onUpdateStatus(inputUUID, 'error');
			}
			return result;
		},
		[configuration.receiver, handleSuccessCallback, onUpdateStatus, provider, safeChainID]
	);

	/**********************************************************************************************
	 ** The onMigrateETH function is called when the user clicks the 'Migrate' button. This
	 ** function will perform the migration for ETH coin.
	 **********************************************************************************************/
	const onMigrateETH = useCallback(
		async (input: TInputWithToken): Promise<TTxResponse> => {
			const inputUUID = input.UUID;
			onUpdateStatus(inputUUID, 'pending');
			const ethAmountRaw = input.normalizedBigAmount.raw;

			const isSendingBalance = toBigInt(ethAmountRaw) >= toBigInt(balances[ETH_TOKEN_ADDRESS]?.raw);
			const result = await transferEther({
				connector: provider,
				chainID: safeChainID,
				receiverAddress: configuration.receiver?.address,
				amount: toBigInt(ethAmountRaw),
				shouldAdjustForGas: isSendingBalance
			});
			if (result.isSuccessful) {
				onUpdateStatus(inputUUID, 'success');
				await handleSuccessCallback(ZERO_ADDRESS);
			}
			if (result.error) {
				onUpdateStatus(inputUUID, 'error');
			}
			return result;
		},
		[balances, configuration.receiver?.address, handleSuccessCallback, onUpdateStatus, provider, safeChainID]
	);

	/**********************************************************************************************
	 ** The onMigrateSelectedForGnosis function is called when the user clicks the 'Migrate' button
	 ** in the Gnosis Safe. This will take advantage of the batch transaction feature of the Gnosis
	 ** Safe.
	 **********************************************************************************************/
	const onMigrateSelectedForGnosis = useCallback(
		async (allSelected: TInputWithToken[]): Promise<void> => {
			const transactions: BaseTransaction[] = [];
			const migratedTokens: TSendInputElement[] = [];
			for (const input of allSelected) {
				const amount = toBigInt(input.normalizedBigAmount.raw);
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
				notifySend({
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
		[address, configuration.receiver?.address, safeChainID, sdk.txs]
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
			(input): input is TInputWithToken => !!input.token && input.status !== 'success'
		);

		if (isWalletSafe) {
			return onMigrateSelectedForGnosis(allSelected);
		}

		const migratedTokens: TInputWithToken[] = [];
		const hashMessage: Hex[] = [];

		let ethToken: TInputWithToken | undefined = undefined;

		for (const input of allSelected) {
			if (isAddressEqual(input.token.address, ETH_TOKEN_ADDRESS)) {
				//Migrate ETH at the end
				ethToken = input;
				continue;
			}

			const result = await onMigrateERC20(input);

			if (result.isSuccessful && result.receipt) {
				migratedTokens.push(input);
				hashMessage.push(result.receipt.transactionHash);
			} else {
				areAllSuccess = false;
			}
		}

		const ethAmountRaw = ethToken?.normalizedBigAmount?.raw;

		if (ethToken && toBigInt(ethAmountRaw) > 0n) {
			const result = await onMigrateETH(ethToken);
			if (result.isSuccessful && result.receipt) {
				ethToken && migratedTokens.push(ethToken);
				hashMessage.push(result.receipt.transactionHash);
			} else {
				areAllSuccess = false;
			}
		}

		if (areAllSuccess) {
			set_migrateStatus({...defaultTxStatus, success: true});
		} else {
			set_migrateStatus(defaultTxStatus);
			dispatchConfiguration({type: 'RESET', payload: undefined});
		}

		notifySend({
			chainID: safeChainID,
			to: toAddress(configuration.receiver?.address),
			tokensMigrated: migratedTokens,
			hashes: hashMessage,
			type: 'EOA',
			from: toAddress(address)
		});
	}, [
		configuration.inputs,
		configuration.receiver?.address,
		isWalletSafe,
		safeChainID,
		address,
		onMigrateSelectedForGnosis,
		onMigrateERC20,
		onMigrateETH,
		dispatchConfiguration
	]);

	const isSendButtonDisabled =
		isZeroAddress(configuration.receiver?.address) ||
		isNullAddress(configuration.receiver.address) ||
		configuration.inputs.some(input => input.token && input.normalizedBigAmount.raw === toBigInt(0)) ||
		!configuration.inputs.every(input => input.isValid === true) ||
		isReceiverERC20;

	return (
		<>
			<div className={'w-full md:max-w-[442px]'}>
				<Button
					className={'w-full'}
					isBusy={migrateStatus.pending}
					isDisabled={isSendButtonDisabled}
					onClick={onHandleMigration}>
					<b>{'Send'}</b>
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
		</>
	);
}
