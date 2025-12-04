import {useCallback, useMemo, useState} from 'react';
import {approveAllERC721, batchTransferERC721, listERC1155, transferERC721, transferERC1155} from 'utils/actions';
import {NFTMIGRATOOOR_CONTRACT_PER_CHAIN} from 'utils/constants';
import {getSafeBatchTransferFrom1155, getSafeTransferFrom721} from 'utils/tools.gnosis';
import {useSafeAppsSDK} from '@gnosis.pm/safe-apps-react-sdk';
import ApprovalWizardItem from '@nftmigratooor/ApprovalWizardItem';
import {useNFTMigratooor} from '@nftmigratooor/useNFTMigratooor';
import {useUpdateEffect} from '@react-hookz/web';
import {erc721ABI, multicall} from '@wagmi/core';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {decodeAsBoolean} from '@yearn-finance/web-lib/utils/decoder';
import {toBigInt} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {defaultTxStatus} from '@yearn-finance/web-lib/utils/web3/transaction';

import type {ReactElement} from 'react';
import type {TApprovalStatus, TNFT, TWizardStatus} from 'utils/types/nftMigratooor';
import type {ContractFunctionConfig, TransactionReceipt} from 'viem';
import type {TDict} from '@yearn-finance/web-lib/types';
import type {BaseTransaction} from '@gnosis.pm/safe-apps-sdk';

function ViewApprovalWizard(): ReactElement {
	const {address, provider, isWalletSafe} = useWeb3();
	const {safeChainID} = useChainID();
	const {selected, set_selected, set_nfts, destinationAddress} = useNFTMigratooor();
	const [isApproving, set_isApproving] = useState(false);
	const [collectionStatus, set_collectionStatus] = useState<TDict<TWizardStatus>>({});
	const [collectionApprovalStatus, set_collectionApprovalStatus] = useState<TDict<TApprovalStatus>>({});
	const [migrated, set_migrated] = useState<TDict<TNFT[]>>({});
	const [, set_txStatus] = useState(defaultTxStatus);
	const {sdk} = useSafeAppsSDK();

	/**********************************************************************************************
	 ** The migration flow is different if we are sending one NFT from one collection or multiple
	 ** NFTs from the same collection. In first case we will directly send the NFT to the
	 ** destination, without approval. In the second case we will need to approveForAll the
	 ** collection and then send the NFTs to the destination.
	 **********************************************************************************************/
	const groupedByCollection = useMemo((): TDict<TNFT[]> => {
		const grouped = (selected || []).reduce((acc: TDict<TNFT[]>, obj: TNFT): TDict<TNFT[]> => {
			const key = toAddress(obj.collection.address);
			if (!acc[key]) {
				acc[key] = [];
			}

			acc[key].push(obj);
			return acc;
		}, {});

		return Object.keys(grouped)
			.sort((a, b): number => grouped[a].length - grouped[b].length)
			.reduce((acc: TDict<TNFT[]>, key: string): TDict<TNFT[]> => {
				acc[key] = grouped[key];
				return acc;
			}, {});
	}, [selected]);

	/**********************************************************************************************
	 ** If the groupedByCollection changes, we need to be able to determine the status of the
	 ** approval and execution for each collection. We will use the collectionStatus state to
	 ** store the status of each collection, keeping the previous status if they are set or setting
	 ** the default status if they are not set.
	 ** This will be used to render the OK/KO/Pending state.
	 **********************************************************************************************/
	useUpdateEffect((): void => {
		set_collectionStatus((prev): TDict<TWizardStatus> => {
			for (const collection of Object.keys(groupedByCollection)) {
				if (prev[collection] === undefined) {
					prev[collection] = {
						approval: 'Not Approved',
						execute: 'Not Executed',
						receipt: undefined
					};
				}
			}

			return prev;
		});
	}, [groupedByCollection]);

	/**********************************************************************************************
	 ** useUpdate/useCallback pair to retrieve the approval status for each collection. For each
	 ** one, no matter if it's ERC721 or ERC1155, we will check if the address is approvedForAll
	 ** for the NFTMigratooor contract, which is responsible of executing the migration.
	 ** We are doing that for every collection, even if we are sending only one NFT from that
	 ** collection to avoid complex logic/data structure.
	 **********************************************************************************************/
	const retrieveApprovals = useCallback(async (): Promise<void> => {
		if (!address || !NFTMIGRATOOOR_CONTRACT_PER_CHAIN[safeChainID]) {
			return;
		}
		const calls: ContractFunctionConfig[] = [];
		Object.entries(groupedByCollection).forEach(([collectionAddress, collection]): void => {
			if (collection?.[0]?.collection?.type === 'ERC721') {
				calls.push({
					address: toAddress(collectionAddress),
					abi: erc721ABI,
					functionName: 'isApprovedForAll',
					args: [address, NFTMIGRATOOOR_CONTRACT_PER_CHAIN[safeChainID]]
				});
			}
		});
		const result = await multicall({
			chainId: safeChainID,
			contracts: calls as never[]
		});
		const newStatus: TDict<TApprovalStatus> = {};
		Object.entries(groupedByCollection).forEach(([collectionAddress, collection], index): void => {
			if (collection?.[0]?.collection?.type === 'ERC721') {
				newStatus[toAddress(collectionAddress)] = decodeAsBoolean(result[index]) ? 'Approved' : 'Not Approved';
			}
		});
		set_collectionApprovalStatus(newStatus);
	}, [groupedByCollection, address, safeChainID]);
	useUpdateEffect((): void => {
		retrieveApprovals();
	}, [retrieveApprovals]);

	/**********************************************************************************************
	 ** onClearMigration is called when the user click the "Migrate X NFTs" buttons again after a
	 ** first transaction has been sent. We need to remove the NFTs that have been migrated from
	 ** the list of selected NFTs.
	 **********************************************************************************************/
	const onClearMigration = useCallback((): void => {
		set_selected((prev): TNFT[] => {
			const newSelected: TNFT[] = [];
			for (const asset of prev) {
				if (
					!migrated[toAddress(asset.collection.address)]?.find(
						(nft: TNFT): boolean => nft.tokenID === asset.tokenID
					)
				) {
					newSelected.push(asset);
				}
			}
			return newSelected;
		});
		set_migrated({});
	}, [migrated]); // eslint-disable-line react-hooks/exhaustive-deps

	/**********************************************************************************************
	 ** onMigrateSuccess is called when the migration is successful. We need to remove the NFT
	 ** from the list of available NFTs and update the status of the collection to 'Executed'.
	 **********************************************************************************************/
	const onMigrateSuccess = useCallback(
		(collectionAddress: string, tokenID: bigint[], receipt?: TransactionReceipt): void => {
			set_collectionStatus(
				(prev): TDict<TWizardStatus> => ({
					...prev,
					[toAddress(collectionAddress)]: {
						...prev[toAddress(collectionAddress)],
						execute: 'Executed',
						receipt
					}
				})
			);
			set_nfts((prev): TNFT[] => {
				const newNFTs = [...prev];
				for (const id of tokenID) {
					const index = newNFTs.findIndex(
						(nft: TNFT): boolean =>
							toBigInt(nft.tokenID) === toBigInt(id) &&
							toAddress(nft.collection.address) === toAddress(collectionAddress)
					);
					newNFTs.splice(index, 1);
				}
				return newNFTs;
			});
		},
		[set_nfts]
	);

	/**********************************************************************************************
	 ** onMigrateError is called when the migration is not successful. We need to update the
	 ** status of the collection to 'Error'.
	 **********************************************************************************************/
	const onMigrateError = useCallback((collectionAddress: string): void => {
		set_collectionStatus(
			(prev): TDict<TWizardStatus> => ({
				...prev,
				[toAddress(collectionAddress)]: {...prev[toAddress(collectionAddress)], execute: 'Error'}
			})
		);
	}, []);

	/**********************************************************************************************
	 ** ApproveAll tokens from a specific collection. This will be called for each collection if
	 ** we are sending multiple NFTs from the same collection.
	 ** The flow is simple: set the approval status to 'Approving', call the approveForAll and set
	 ** the approval status to 'Approved' if the transaction is successful, or 'Error' if it fails
	 ** or if we catch an error.
	 **********************************************************************************************/
	const onApproveAllCollection = useCallback(
		async (collectionAddress: string): Promise<boolean> => {
			if (!NFTMIGRATOOOR_CONTRACT_PER_CHAIN[safeChainID]) {
				console.warn(`Not supported chain ID: ${safeChainID}`);
				return false;
			}
			set_collectionStatus(
				(prev): TDict<TWizardStatus> => ({
					...prev,
					[toAddress(collectionAddress)]: {...prev[toAddress(collectionAddress)], approval: 'Approving'}
				})
			);

			const result = await approveAllERC721({
				connector: provider,
				chainID: safeChainID,
				contractAddress: toAddress(collectionAddress),
				spenderAddress: toAddress(NFTMIGRATOOOR_CONTRACT_PER_CHAIN[safeChainID]),
				shouldAllow: true,
				statusHandler: set_txStatus
			});
			if (result.isSuccessful) {
				set_collectionStatus(
					(prev): TDict<TWizardStatus> => ({
						...prev,
						[toAddress(collectionAddress)]: {...prev[toAddress(collectionAddress)], approval: 'Approved'}
					})
				);
			}
			if (result.error) {
				set_collectionStatus(
					(prev): TDict<TWizardStatus> => ({
						...prev,
						[toAddress(collectionAddress)]: {...prev[toAddress(collectionAddress)], approval: 'Error'}
					})
				);
			}
			return result.isSuccessful;
		},
		[provider, safeChainID]
	);

	/**********************************************************************************************
	 ** Migrate one token from a specific collection to the provided destination address. This will
	 ** be called for each collection if we are sending one single NFTs.
	 ** The flow is simple: set the execute status to 'Executing', call the transfer and set
	 ** the execute status to 'Executed' if the transaction is successful, or 'Error' if it fails
	 ** or if we catch an error.
	 **********************************************************************************************/
	const onMigrateOneToken = useCallback(
		async (collectionAddress: string, collection: TNFT[]): Promise<boolean> => {
			const [asset] = collection;
			set_collectionStatus(
				(prev): TDict<TWizardStatus> => ({
					...prev,
					[toAddress(collectionAddress)]: {...prev[toAddress(collectionAddress)], execute: 'Executing'}
				})
			);

			const result = await transferERC721({
				connector: provider,
				chainID: safeChainID,
				contractAddress: toAddress(asset.collection.address),
				receiverAddress: toAddress(destinationAddress),
				tokenID: toBigInt(asset.tokenID),
				statusHandler: set_txStatus
			});
			if (result.isSuccessful) {
				onMigrateSuccess(collectionAddress, [toBigInt(asset.tokenID)], result.receipt);
			}
			if (result.error) {
				onMigrateError(collectionAddress);
			}
			return false;
		},
		[destinationAddress, onMigrateError, onMigrateSuccess, provider, safeChainID]
	);

	/**********************************************************************************************
	 ** Migrate some tokens from a specific collection to the provided destination address. This will
	 ** be called for each collection if we are sending multiple NFTs from the same collection.
	 ** The flow is simple: set the execute status to 'Executing', call the transfer and set
	 ** the execute status to 'Executed' if the transaction is successful, or 'Error' if it fails
	 ** or if we catch an error.
	 **********************************************************************************************/
	const onMigrateSomeERC721Tokens = useCallback(
		async (collectionAddress: string, collection: TNFT[]): Promise<boolean> => {
			if (!NFTMIGRATOOOR_CONTRACT_PER_CHAIN[safeChainID]) {
				console.warn(`Not supported chain ID: ${safeChainID}`);
				return false;
			}
			set_collectionStatus(
				(prev): TDict<TWizardStatus> => ({
					...prev,
					[toAddress(collectionAddress)]: {...prev[toAddress(collectionAddress)], execute: 'Executing'}
				})
			);

			const tokenIDs: bigint[] = [];
			for (const asset of collection) {
				tokenIDs.push(toBigInt(asset.tokenID));
			}

			const result = await batchTransferERC721({
				connector: provider,
				chainID: safeChainID,
				contractAddress: toAddress(NFTMIGRATOOOR_CONTRACT_PER_CHAIN[safeChainID]),
				collectionAddress: toAddress(collectionAddress),
				receiverAddress: toAddress(destinationAddress),
				tokenIDs,
				statusHandler: set_txStatus
			});
			if (result.isSuccessful) {
				onMigrateSuccess(collectionAddress, tokenIDs, result.receipt);
			}
			if (result.error) {
				onMigrateError(collectionAddress);
			}
			return result.isSuccessful;
		},
		[destinationAddress, onMigrateError, onMigrateSuccess, provider, safeChainID]
	);

	/**********************************************************************************************
	 ** Migrate some tokens from a specific collection to the provided destination address. This will
	 ** be called for each collection if we are sending multiple NFTs from the same collection.
	 ** The flow is simple: set the execute status to 'Executing', call the transfer and set
	 ** the execute status to 'Executed' if the transaction is successful, or 'Error' if it fails
	 ** or if we catch an error.
	 **********************************************************************************************/
	const onMigrateSomeERC1155Tokens = useCallback(
		async (collectionAddress: string, collection: TNFT[]): Promise<boolean> => {
			set_collectionStatus(
				(prev): TDict<TWizardStatus> => ({
					...prev,
					[toAddress(collectionAddress)]: {...prev[toAddress(collectionAddress)], execute: 'Executing'}
				})
			);

			try {
				const tokenIDs: bigint[] = [];
				for (const asset of collection) {
					tokenIDs.push(toBigInt(asset.tokenID));
				}

				const result = await transferERC1155({
					connector: provider,
					chainID: safeChainID,
					contractAddress: toAddress(collectionAddress),
					receiverAddress: destinationAddress,
					tokenIDs,
					statusHandler: set_txStatus
				});
				if (result.isSuccessful) {
					onMigrateSuccess(collectionAddress, tokenIDs, result.receipt);
				}
				if (result.error) {
					onMigrateError(collectionAddress);
				}
				return result.isSuccessful;
			} catch (error) {
				onMigrateError(collectionAddress);
			}
			return false;
		},
		[destinationAddress, onMigrateError, onMigrateSuccess, provider, safeChainID]
	);

	/**********************************************************************************************
	 ** The onMigrateSelectedForGnosis function is called when the user clicks the 'Migrate' button
	 ** in the Gnosis Safe. This will take advantage of the batch transaction feature of the Gnosis
	 ** Safe.
	 **********************************************************************************************/
	const onMigrateSomeERC1155TokensFromGnosis = useCallback(
		async (collectionAddress: string, collection: TNFT[]): Promise<BaseTransaction> => {
			const tokenIDs: bigint[] = [];
			for (const asset of collection) {
				tokenIDs.push(toBigInt(asset.tokenID));
			}
			const [filteredTokenIDs, filteredAmounts] = await listERC1155({
				connector: provider,
				chainID: safeChainID,
				contractAddress: toAddress(collectionAddress),
				tokenIDs: tokenIDs
			});
			return getSafeBatchTransferFrom1155(
				toAddress(collectionAddress),
				toAddress(address),
				destinationAddress,
				filteredTokenIDs,
				filteredAmounts
			);
		},
		[address, destinationAddress, provider, safeChainID]
	);

	const onMigrateSomeERC721TokensFromGnosis = useCallback(
		(collectionAddress: string, collection: TNFT[]): BaseTransaction[] => {
			const transactions = [];
			for (const asset of collection) {
				transactions.push(
					getSafeTransferFrom721(
						toAddress(collectionAddress),
						toAddress(address),
						destinationAddress,
						asset.tokenID
					)
				);
			}
			return transactions;
		},
		[address, destinationAddress]
	);

	const onMigrateSelectedForGnosis = useCallback(
		async (groupedByCollection: TDict<TNFT[]>): Promise<void> => {
			const transactions: BaseTransaction[] = [];
			for (const collectionAddress in groupedByCollection) {
				const collection = groupedByCollection[collectionAddress];
				if (collection[0].collection.type === 'ERC1155') {
					transactions.push(await onMigrateSomeERC1155TokensFromGnosis(collectionAddress, collection));
				} else if (collection[0].collection.type === 'ERC721') {
					transactions.push(...onMigrateSomeERC721TokensFromGnosis(collectionAddress, collection));
				}
			}

			try {
				for (const collectionAddress in groupedByCollection) {
					set_collectionStatus(
						(prev): TDict<TWizardStatus> => ({
							...prev,
							[toAddress(collectionAddress)]: {
								...prev[toAddress(collectionAddress)],
								execute: 'Executing'
							}
						})
					);
				}

				const {safeTxHash} = await sdk.txs.send({txs: transactions});
				const successfulMigrations: TDict<TNFT[]> = {};
				for (const collectionAddress in groupedByCollection) {
					const collection = groupedByCollection[collectionAddress];
					set_collectionStatus(
						(prev): TDict<TWizardStatus> => ({
							...prev,
							[toAddress(collectionAddress)]: {...prev[toAddress(collectionAddress)], execute: 'Executed'}
						})
					);
					successfulMigrations[collectionAddress] = collection;
				}
				set_migrated(successfulMigrations);
				console.log({hash: safeTxHash});
			} catch (error) {
				console.log(error);
			}
		},
		[onMigrateSomeERC1155TokensFromGnosis, onMigrateSomeERC721TokensFromGnosis, sdk.txs]
	);

	/**********************************************************************************************
	 ** This is the main function that will be called when the user clicks on the 'Migrate' button.
	 ** It will iterate over the groupedByCollection object and call the appropriate function
	 ** depending on the number of NFTs in the collection and the approval status.
	 **********************************************************************************************/
	const onHandleMigration = useCallback(async (): Promise<void> => {
		await onClearMigration();
		if (isWalletSafe) {
			return onMigrateSelectedForGnosis(groupedByCollection);
		}

		const successfulMigrations: TDict<TNFT[]> = {};
		for (const collectionAddress in groupedByCollection) {
			const collection = groupedByCollection[collectionAddress];
			const status = collectionStatus[toAddress(collectionAddress)];
			if (status?.execute === 'Executed') {
				continue;
			}

			if (collection[0].collection.type === 'ERC1155') {
				const isSuccessful = await onMigrateSomeERC1155Tokens(collectionAddress, collection);
				if (isSuccessful) {
					successfulMigrations[collectionAddress] = collection;
				}
			} else {
				if (collection.length === 1) {
					const isSuccessful = await onMigrateOneToken(collectionAddress, collection);
					if (isSuccessful) {
						successfulMigrations[collectionAddress] = collection;
					}
				} else if (collection.length > 1) {
					if (collectionApprovalStatus[toAddress(collectionAddress)] !== 'Approved') {
						const isOK = await onApproveAllCollection(collectionAddress);
						if (!isOK) {
							continue;
						}
					}
					const isSuccessful = await onMigrateSomeERC721Tokens(collectionAddress, collection);
					if (isSuccessful) {
						successfulMigrations[collectionAddress] = collection;
					}
				}
			}
		}
		set_migrated(successfulMigrations);
	}, [
		onClearMigration,
		isWalletSafe,
		onMigrateSelectedForGnosis,
		groupedByCollection,
		collectionStatus,
		onMigrateSomeERC1155Tokens,
		onMigrateOneToken,
		collectionApprovalStatus,
		onMigrateSomeERC721Tokens,
		onApproveAllCollection
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
							{
								'This is a multiple steps process. If you are sending multiple NFTs from the same collection, you will need to approve the collection to transfer them, otherwise you will just need to transfer each NFT individually.'
							}
						</p>
					</div>

					{Object.values(groupedByCollection).map((collection, index): JSX.Element => {
						return (
							<ApprovalWizardItem
								key={index}
								collection={collection}
								collectionStatus={collectionStatus[toAddress(collection[0].collection.address)]}
								collectionApprovalStatus={
									collectionApprovalStatus[toAddress(collection[0].collection.address)]
								}
								index={index}
							/>
						);
					})}
				</div>
			</div>
			<button
				id={'TRIGGER_NFT_MIGRATOOOR_HIDDEN'}
				className={'pointer-events-none invisible block size-0 opacity-0'}
				disabled={selected.length === 0 || !provider || isApproving}
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
