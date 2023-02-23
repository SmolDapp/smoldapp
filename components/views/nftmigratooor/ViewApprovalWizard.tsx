import React, {useCallback, useMemo, useState} from 'react';
import ApprovalWizardItem from 'components/app/nftmigratooor/ApprovalWizardItem';
import {NFTMIGRATOOOR_CONTRACT_PER_CHAIN, useNFTMigratooor} from 'contexts/useNFTMigratooor';
import {Contract} from 'ethcall';
import ERC721_ABI from 'utils/abi/ERC721.abi';
import {setApprovalForAll} from 'utils/actions/approveERC721';
import {multiTransfer} from 'utils/actions/multiTransferERC721';
import {defaultTxStatus, Transaction} from 'utils/actions/transactions.root';
import {transfer} from 'utils/actions/transferERC721';
import {safeBatchTransferFrom1155} from 'utils/actions/transferERC1155';
import {useUpdateEffect} from '@react-hookz/web';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';
import {getProvider, newEthCallProvider} from '@yearn-finance/web-lib/utils/web3/providers';

import type {Call} from 'ethcall';
import type {ethers} from 'ethers';
import type {ReactElement} from 'react';
import type {TApprovalStatus, TWizardStatus} from 'utils/types/nftMigratooor';
import type {TOpenSeaAsset} from 'utils/types/opensea';
import type {TDict} from '@yearn-finance/web-lib/utils/types';

function	ViewApprovalWizard(): ReactElement {
	const	{address, provider} = useWeb3();
	const	{safeChainID} = useChainID();
	const	{selected, set_selected, set_nfts, destinationAddress} = useNFTMigratooor();
	const	[isApproving, set_isApproving] = useState(false);
	const	[collectionStatus, set_collectionStatus] = useState<TDict<TWizardStatus>>({});
	const	[collectionApprovalStatus, set_collectionApprovalStatus] = useState<TDict<TApprovalStatus>>({});
	const	[migrated, set_migrated] = useState<TDict<TOpenSeaAsset[]>>({});
	const	[, set_txStatus] = useState(defaultTxStatus);

	/**********************************************************************************************
	** The migration flow is different if we are sending one NFT from one collection or multiple
	** NFTs from the same collection. In first case we will directly send the NFT to the
	** destination, without approval. In the second case we will need to approveForAll the
	** collection and then send the NFTs to the destination.
	**********************************************************************************************/
	const	groupedByCollection = useMemo((): TDict<TOpenSeaAsset[]> => {
		const	grouped = (selected || []).reduce((acc: TDict<TOpenSeaAsset[]>, obj: TOpenSeaAsset): TDict<TOpenSeaAsset[]> => {
			const key = toAddress(obj.asset_contract.address);
			if (!acc[key]) {
				acc[key] = [];
			}

			acc[key].push(obj);
			return acc;
		}, {});

		return Object.keys(grouped).sort((a, b): number => grouped[a].length - grouped[b].length).reduce((acc: TDict<TOpenSeaAsset[]>, key: string): TDict<TOpenSeaAsset[]> => {
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
					console.log(prev[collection], prev);
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
	const	retrieveApprovals = useCallback(async (): Promise<void> => {
		if (!provider || !address) {
			return;
		}
		const currentProvider = provider || getProvider(1);
		const ethcallProvider = await newEthCallProvider(currentProvider);
		const calls: Call[] = [];
		Object.entries(groupedByCollection).forEach(([collectionAddress, collection]): void => {
			if (collection?.[0]?.asset_contract?.schema_name === 'ERC721' && NFTMIGRATOOOR_CONTRACT_PER_CHAIN[safeChainID]) {
				const	erc721Contract = new Contract(toAddress(collectionAddress), ERC721_ABI);
				calls.push(erc721Contract.isApprovedForAll(address, NFTMIGRATOOOR_CONTRACT_PER_CHAIN[safeChainID]));
			}
		});
		const result = await ethcallProvider?.tryAll(calls) as boolean[];
		const newStatus: TDict<TApprovalStatus> = {};
		Object.entries(groupedByCollection).forEach(([collectionAddress], index): void => {
			newStatus[toAddress(collectionAddress)] = result[index] ? 'Approved' : 'Not Approved';
		});
		set_collectionApprovalStatus(newStatus);
	}, [groupedByCollection, provider, address, safeChainID]);
	useUpdateEffect((): void => {
		retrieveApprovals();
	}, [retrieveApprovals]);

	/**********************************************************************************************
	** onClearMigration is called when the user click the "Migrate X NFTs" buttons again after a
	** first transaction has been sent. We need to remove the NFTs that have been migrated from
	** the list of selected NFTs.
	**********************************************************************************************/
	const onClearMigration = useCallback((): void => {
		performBatchedUpdates((): void => {
			set_selected((prev): TOpenSeaAsset[] => {
				const	newSelected: TOpenSeaAsset[] = [];
				for (const asset of prev) {
					if (!migrated[toAddress(asset.asset_contract.address)]?.find((nft: TOpenSeaAsset): boolean => nft.token_id === asset.token_id)) {
						newSelected.push(asset);
					}
				}
				return newSelected;
			});
			set_migrated({});
		});
	}, [migrated]); // eslint-disable-line react-hooks/exhaustive-deps

	/**********************************************************************************************
	** onMigrateSuccess is called when the migration is successful. We need to remove the NFT
	** from the list of available NFTs and update the status of the collection to 'Executed'.
	**********************************************************************************************/
	const onMigrateSuccess = useCallback((collectionAddress: string, tokenID: string[], receipt?: ethers.providers.TransactionReceipt): void => {
		performBatchedUpdates((): void => {
			set_collectionStatus((prev): TDict<TWizardStatus> => ({
				...prev,
				[toAddress(collectionAddress)]: {...prev[toAddress(collectionAddress)], execute: 'Executed', receipt}
			}));
			set_nfts((prev): TOpenSeaAsset[] => {
				const	newNFTs = [...prev];
				for (const id of tokenID) {
					const	index = newNFTs.findIndex((nft: TOpenSeaAsset): boolean => nft.token_id === id && toAddress(nft.asset_contract.address) === toAddress(collectionAddress));
					newNFTs.splice(index, 1);
				}
				return newNFTs;
			});
		});
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	/**********************************************************************************************
	** onMigrateError is called when the migration is not successful. We need to update the
	** status of the collection to 'Error'.
	**********************************************************************************************/
	const onMigrateError = useCallback((collectionAddress: string): void => {
		set_collectionStatus((prev): TDict<TWizardStatus> => ({
			...prev,
			[toAddress(collectionAddress)]: {...prev[toAddress(collectionAddress)], execute: 'Error'}
		}));
	}, []);

	/**********************************************************************************************
	** ApproveAll tokens from a specific collection. This will be called for each collection if
	** we are sending multiple NFTs from the same collection.
	** The flow is simple: set the approval status to 'Approving', call the approveForAll and set
	** the approval status to 'Approved' if the transaction is successful, or 'Error' if it fails
	** or if we catch an error.
	**********************************************************************************************/
	const onApproveAllCollection = useCallback(async (collectionAddress: string): Promise<boolean> => {
		if (!NFTMIGRATOOOR_CONTRACT_PER_CHAIN[safeChainID]) {
			console.warn(`Not supported chain ID: ${safeChainID}`);
			return false;
		}
		try {
			set_collectionStatus((prev): TDict<TWizardStatus> => ({
				...prev,
				[toAddress(collectionAddress)]: {...prev[toAddress(collectionAddress)], approval: 'Approving'}
			}));

			const	{isSuccessful} = await new Transaction(provider, setApprovalForAll, set_txStatus).populate(
				toAddress(collectionAddress),
				NFTMIGRATOOOR_CONTRACT_PER_CHAIN[safeChainID],
				true
			).onSuccess(async (): Promise<void> => {
				set_collectionStatus((prev): TDict<TWizardStatus> => ({
					...prev,
					[toAddress(collectionAddress)]: {...prev[toAddress(collectionAddress)], approval: 'Approved'}
				}));
			}).perform();

			if (!isSuccessful) {
				set_collectionStatus((prev): TDict<TWizardStatus> => ({
					...prev,
					[toAddress(collectionAddress)]: {...prev[toAddress(collectionAddress)], approval: 'Error'}
				}));
			}
			return isSuccessful;
		} catch (error) {
			set_collectionStatus((prev): TDict<TWizardStatus> => ({
				...prev,
				[toAddress(collectionAddress)]: {...prev[toAddress(collectionAddress)], approval: 'Error'}
			}));
		}
		return false;
	}, [provider, safeChainID]);

	/**********************************************************************************************
	** Migrate one token from a specific collection to the provided destination address. This will
	** be called for each collection if we are sending one single NFTs.
	** The flow is simple: set the execute status to 'Executing', call the transfer and set
	** the execute status to 'Executed' if the transaction is successful, or 'Error' if it fails
	** or if we catch an error.
	**********************************************************************************************/
	const onMigrateOneToken = useCallback(async (collectionAddress: string, collection: TOpenSeaAsset[]): Promise<boolean> => {
		const	[asset] = collection;
		try {
			set_collectionStatus((prev): TDict<TWizardStatus> => ({
				...prev,
				[toAddress(collectionAddress)]: {...prev[toAddress(collectionAddress)], execute: 'Executing'}
			}));

			const	{isSuccessful} = await new Transaction(provider, transfer, set_txStatus).populate(
				toAddress(asset.asset_contract.address),
				toAddress(destinationAddress),
				asset.token_id
			).onSuccess(async (receipt): Promise<void> => {
				onMigrateSuccess(collectionAddress, [asset.token_id], receipt);
			}).perform();

			if (!isSuccessful) {
				onMigrateError(collectionAddress);
			}
			return isSuccessful;
		} catch (error) {
			onMigrateError(collectionAddress);
		}
		return false;
	}, [destinationAddress, onMigrateError, onMigrateSuccess, provider]);

	/**********************************************************************************************
	** Migrate some tokens from a specific collection to the provided destination address. This will
	** be called for each collection if we are sending multiple NFTs from the same collection.
	** The flow is simple: set the execute status to 'Executing', call the transfer and set
	** the execute status to 'Executed' if the transaction is successful, or 'Error' if it fails
	** or if we catch an error.
	**********************************************************************************************/
	const onMigrateSomeERC721Tokens = useCallback(async (collectionAddress: string, collection: TOpenSeaAsset[]): Promise<boolean> => {
		if (!NFTMIGRATOOOR_CONTRACT_PER_CHAIN[safeChainID]) {
			console.warn(`Not supported chain ID: ${safeChainID}`);
			return false;
		}
		set_collectionStatus((prev): TDict<TWizardStatus> => ({
			...prev,
			[toAddress(collectionAddress)]: {...prev[toAddress(collectionAddress)], execute: 'Executing'}
		}));

		try {
			const	tokenIDs: string[] = [];
			for (const asset of collection) {
				tokenIDs.push(asset.token_id);
			}

			const	{isSuccessful} = await new Transaction(provider, multiTransfer, set_txStatus).populate(
				NFTMIGRATOOOR_CONTRACT_PER_CHAIN[safeChainID],
				toAddress(collectionAddress),
				toAddress(destinationAddress),
				tokenIDs
			).onSuccess(async (receipt): Promise<void> => {
				onMigrateSuccess(collectionAddress, tokenIDs, receipt);
			}).perform();

			if (!isSuccessful) {
				onMigrateError(collectionAddress);
			}
			return isSuccessful;
		} catch (error) {
			onMigrateError(collectionAddress);
		}
		return false;
	}, [destinationAddress, onMigrateError, onMigrateSuccess, provider, safeChainID]);

	/**********************************************************************************************
	** Migrate some tokens from a specific collection to the provided destination address. This will
	** be called for each collection if we are sending multiple NFTs from the same collection.
	** The flow is simple: set the execute status to 'Executing', call the transfer and set
	** the execute status to 'Executed' if the transaction is successful, or 'Error' if it fails
	** or if we catch an error.
	**********************************************************************************************/
	const onMigrateSomeERC1155Tokens = useCallback(async (collectionAddress: string, collection: TOpenSeaAsset[]): Promise<boolean> => {
		set_collectionStatus((prev): TDict<TWizardStatus> => ({
			...prev,
			[toAddress(collectionAddress)]: {...prev[toAddress(collectionAddress)], execute: 'Executing'}
		}));

		try {
			const	tokenIDs: string[] = [];
			for (const asset of collection) {
				tokenIDs.push(asset.token_id);
			}

			const	{isSuccessful} = await new Transaction(provider, safeBatchTransferFrom1155, set_txStatus).populate(
				toAddress(collectionAddress),
				toAddress(destinationAddress),
				tokenIDs
			).onSuccess(async (receipt): Promise<void> => {
				onMigrateSuccess(collectionAddress, tokenIDs, receipt);
			}).perform();

			if (!isSuccessful) {
				onMigrateError(collectionAddress);
			}
			return isSuccessful;
		} catch (error) {
			onMigrateError(collectionAddress);
		}
		return false;
	}, [destinationAddress, onMigrateError, onMigrateSuccess, provider]);

	/**********************************************************************************************
	** This is the main function that will be called when the user clicks on the 'Migrate' button.
	** It will iterate over the groupedByCollection object and call the appropriate function
	** depending on the number of NFTs in the collection and the approval status.
	**********************************************************************************************/
	const	onHandleMigration = useCallback(async (): Promise<void> => {
		await onClearMigration();

		const	successfulMigrations: TDict<TOpenSeaAsset[]> = {};
		for (const collectionAddress in groupedByCollection) {
			const collection = groupedByCollection[collectionAddress];
			const status = collectionStatus[toAddress(collectionAddress)];
			if (status?.execute === 'Executed') {
				continue;
			}

			if (collection[0].asset_contract.schema_name === 'ERC1155') {
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
	}, [onClearMigration, groupedByCollection, collectionStatus, onMigrateSomeERC1155Tokens, onMigrateOneToken, collectionApprovalStatus, onMigrateSomeERC721Tokens, onApproveAllCollection]);

	return (
		<section>
			<div className={'box-0 relative w-full'}>
				<div className={'approvalWizardDivider flex w-full flex-col items-center justify-center overflow-hidden p-4 last:border-b-0 md:p-6'}>
					<div className={'mb-6 w-full'}>
						<b>{'Review and proceed'}</b>
						<p className={'text-sm text-neutral-500'}>
							{'This is a multiple steps process. If you are sending multiple NFTs from the same collection, you will need to approve the collection to transfer them, otherwise you will just need to transfer each NFT individually.'}
						</p>
					</div>

					{Object.values(groupedByCollection).map((collection, index): JSX.Element => {
						return (
							<ApprovalWizardItem
								key={index}
								collection={collection}
								collectionStatus={collectionStatus[toAddress(collection[0].asset_contract.address)]}
								collectionApprovalStatus={collectionApprovalStatus[toAddress(collection[0].asset_contract.address)]}
								index={index} />
						);
					})}
				</div>
			</div>
			<button
				id={'TRIGGER_NFT_MIGRATOOOR_HIDDEN'}
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
