import React, {Fragment, useCallback, useMemo, useState} from 'react';
import {Button} from 'components/Primitives/Button';
import {transferERC20, transferEther} from 'utils/actions';
import {getTransferTransaction} from 'utils/tools.gnosis';
import {useWallet} from '@builtbymom/web3/contexts/useWallet';
import {useWeb3} from '@builtbymom/web3/contexts/useWeb3';
import {useChainID} from '@builtbymom/web3/hooks/useChainID';
import {cl, formatAmount, isZeroAddress, toAddress, toBigInt} from '@builtbymom/web3/utils';
import {getNetwork} from '@builtbymom/web3/utils/wagmi';
import {defaultTxStatus, type TTxResponse} from '@builtbymom/web3/utils/wagmi';
import {useSafeAppsSDK} from '@gnosis.pm/safe-apps-react-sdk';
import {IconCircleCheck} from '@icons/IconCircleCheck';
import {IconCircleCross} from '@icons/IconCircleCross';
import {IconSpinner} from '@icons/IconSpinner';
import {toast} from '@yearn-finance/web-lib/components/yToast';
import {ETH_TOKEN_ADDRESS, ZERO_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {SuccessModal} from '@common/ConfirmationModal';

import {useMigrate} from './useMigrate';

import type {ReactElement} from 'react';
import type {BaseError, Hex} from 'viem';
import type {TUseBalancesTokens} from '@builtbymom/web3/hooks/useBalances.multichains';
import type {TAddress, TChainTokens} from '@builtbymom/web3/types';
import type {BaseTransaction} from '@gnosis.pm/safe-apps-sdk';
import type {TMigrateElement} from './useMigrate';

function MigrateItem({row}: {row: TMigrateElement}): ReactElement {
	const {configuration} = useMigrate();

	function renderStatusIndicator(): ReactElement {
		if (!configuration.receiver) {
			return <div className={'size-4 rounded-full border border-neutral-200 bg-neutral-300'} />;
		}
		if (row.status === 'pending') {
			return <IconSpinner className={'size-4'} />;
		}
		if (row.status === 'success') {
			return <IconCircleCheck className={'size-4 text-green'} />;
		}
		if (row.status === 'error') {
			return <IconCircleCross className={'size-4 text-red'} />;
		}
		return <div className={'size-4 rounded-full border border-neutral-200 bg-neutral-300'} />;
	}

	return (
		<div className={'flex w-full flex-row items-center space-x-3 md:flex-row md:items-start'}>
			<div className={'pt-0.5'}>{renderStatusIndicator()}</div>
			<div className={'flex w-full flex-col'}>
				<div className={'text-left text-sm'}>
					{'Sending '}
					<span
						suppressHydrationWarning
						className={'font-number font-bold'}>
						{formatAmount(formatAmount(Number(row.amount?.normalized)), 6, row.decimals || 18)}
					</span>
					{` ${row?.symbol || 'Tokens'} to `}
					<span className={'font-number inline-flex'}>
						{toAddress(configuration.receiver?.label) === ZERO_ADDRESS ? (
							<div className={'font-number'}>
								<span className={'font-bold'}>{configuration.receiver?.label || ''}</span>
								<span className={'text-xxs'}>{` (${toAddress(configuration.receiver?.address)})`}</span>
							</div>
						) : (
							<div className={'font-number'}>
								<span className={'font-bold'}>{toAddress(row.address)}</span>
							</div>
						)}
					</span>
				</div>
			</div>
		</div>
	);
}

function SpendingWizard(props: {onHandleMigration: VoidFunction}): ReactElement {
	const {configuration} = useMigrate();

	const validTokens = useMemo((): TMigrateElement[] => {
		return Object.values(configuration.tokens).filter(
			(row): boolean => toBigInt(row.amount?.raw) !== 0n && !isZeroAddress(row.address)
		);
	}, [configuration.tokens]);

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
						<div className={'size-4 rounded-full border border-neutral-200 bg-neutral-300'} />
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
				{validTokens
					.sort((a, b): number => {
						if (a.address === ETH_TOKEN_ADDRESS) {
							return 1;
						}
						if (b.address === ETH_TOKEN_ADDRESS) {
							return -1;
						}
						return 0;
					})
					.map(
						(row): ReactElement => (
							<MigrateItem
								key={row.address}
								row={row}
							/>
						)
					)}
			</button>
		</Fragment>
	);
}

export function MigrateWizard(): ReactElement {
	const {safeChainID} = useChainID();
	const {configuration, dispatchConfiguration} = useMigrate();
	const {getToken, getBalance, onRefresh} = useWallet();
	const {isWalletSafe, provider} = useWeb3();
	const {sdk} = useSafeAppsSDK();
	const [migrateStatus, set_migrateStatus] = useState(defaultTxStatus);

	const onUpdateStatus = useCallback(
		(tokenAddress: TAddress, status: 'pending' | 'success' | 'error' | 'none'): void => {
			dispatchConfiguration({
				type: 'SET_STATUS',
				payload: {
					tokenAddress,
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
		async (tokenAddress: TAddress): Promise<TChainTokens> => {
			const chainCoin = getNetwork(safeChainID).nativeCurrency;
			const tokensToRefresh: TUseBalancesTokens[] = [
				{
					address: ETH_TOKEN_ADDRESS,
					decimals: chainCoin?.decimals || 18,
					symbol: chainCoin?.symbol || 'ETH',
					name: chainCoin?.name || 'Ether',
					chainID: safeChainID
				}
			];
			const token = getToken({address: tokenAddress, chainID: safeChainID});
			if (!isZeroAddress(tokenAddress)) {
				tokensToRefresh.push({
					address: tokenAddress,
					decimals: token.decimals,
					symbol: token.symbol,
					name: token.name,
					chainID: safeChainID
				});
			}

			const updatedBalances = await onRefresh(tokensToRefresh);
			return updatedBalances;
		},
		[safeChainID, getToken, onRefresh]
	);

	/**********************************************************************************************
	 ** The onMigrateERC20 function is called when the user clicks the 'Migrate' button. This
	 ** function will perform the migration for all the selected tokens, one at a time.
	 **********************************************************************************************/
	const onMigrateERC20 = useCallback(
		async (token: TMigrateElement): Promise<TTxResponse> => {
			onUpdateStatus(token.address, 'pending');
			const result = await transferERC20({
				connector: provider,
				chainID: safeChainID,
				contractAddress: token.address,
				receiverAddress: configuration.receiver?.address,
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
		[configuration.receiver, handleSuccessCallback, onUpdateStatus, provider, safeChainID]
	);

	/**********************************************************************************************
	 ** The onMigrateETH function is called when the user clicks the 'Migrate' button. This
	 ** function will perform the migration for ETH coin.
	 **********************************************************************************************/
	const onMigrateETH = useCallback(async (): Promise<TTxResponse> => {
		onUpdateStatus(ETH_TOKEN_ADDRESS, 'pending');

		const isSendingBalance =
			toBigInt(configuration.tokens[ETH_TOKEN_ADDRESS]?.amount?.raw) >=
			getBalance({address: ETH_TOKEN_ADDRESS, chainID: safeChainID})?.raw;
		const result = await transferEther({
			connector: provider,
			chainID: safeChainID,
			receiverAddress: configuration.receiver?.address,
			amount: toBigInt(configuration.tokens[ETH_TOKEN_ADDRESS]?.amount?.raw),
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
		configuration.receiver?.address,
		configuration.tokens,
		getBalance,
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
		async (allSelected: TMigrateElement[]): Promise<void> => {
			const transactions: BaseTransaction[] = [];
			const migratedTokens: TMigrateElement[] = [];
			for (const token of allSelected) {
				const amount = toBigInt(token?.amount?.raw);
				if (amount === 0n) {
					continue;
				}
				const newTransactionForBatch = getTransferTransaction(
					amount.toString(),
					token.address,
					toAddress(configuration.receiver?.address)
				);
				transactions.push(newTransactionForBatch);
				migratedTokens.push(token);
			}
			try {
				const {safeTxHash} = await sdk.txs.send({txs: transactions});
				console.log({hash: safeTxHash});
				set_migrateStatus({...defaultTxStatus, success: true});
				toast({
					type: 'success',
					content: 'Your transaction has been created! You can now sign and execute it!'
				});
				// notifyMigrate({
				// 	chainID: safeChainID,
				// 	to: toAddress(configuration.receiver?.address),
				// 	tokensMigrated: migratedTokens,
				// 	hashes: migratedTokens.map((): Hex => safeTxHash as Hex),
				// 	type: 'SAFE',
				// 	from: toAddress(address)
				// });
			} catch (error) {
				set_migrateStatus({...defaultTxStatus, success: false});
				toast({
					type: 'error',
					content: (error as BaseError)?.message || 'An error occured while creating your transaction!'
				});
			}
		},
		[configuration.receiver?.address, sdk.txs]
	);

	/**********************************************************************************************
	 ** This is the main function that will be called when the user clicks on the 'Migrate' button.
	 ** It will iterate over the selected tokens and call the onMigrateERC20 function for each
	 ** token.
	 **********************************************************************************************/
	const onHandleMigration = useCallback(async (): Promise<void> => {
		set_migrateStatus({...defaultTxStatus, pending: true});

		let areAllSuccess = true;
		const allSelected = Object.values(configuration.tokens).filter(
			(token): boolean => token.isSelected && token.status !== 'success'
		);
		if (isWalletSafe) {
			return onMigrateSelectedForGnosis(allSelected);
		}

		const migratedTokens: TMigrateElement[] = [];
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
			} else {
				areAllSuccess = false;
			}
		}

		const willMigrateEth =
			shouldMigrateETH || toBigInt(configuration.tokens?.[ETH_TOKEN_ADDRESS]?.amount?.raw) > 0n;
		if (willMigrateEth) {
			const result = await onMigrateETH();
			if (result.isSuccessful && result.receipt) {
				migratedTokens.push(configuration.tokens?.[ETH_TOKEN_ADDRESS]);
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
		}
	}, [configuration.tokens, isWalletSafe, onMigrateSelectedForGnosis, onMigrateERC20, onMigrateETH]);

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
							Object.values(configuration.tokens).length === 0
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
