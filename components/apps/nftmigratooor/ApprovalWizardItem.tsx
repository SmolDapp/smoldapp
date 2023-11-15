import React, {Fragment} from 'react';
import IconChevronBoth from 'components/icons/IconChevronBoth';
import {IconCircleCheck} from 'components/icons/IconCircleCheck';
import {IconCircleCross} from 'components/icons/IconCircleCross';
import IconSpinner from 'components/icons/IconSpinner';
import {ETHEREUM_ENS_ADDRESS} from 'utils/constants';
import {useNetwork} from 'wagmi';
import {useNFTMigratooor} from '@nftmigratooor/useNFTMigratooor';
import {toAddress, truncateHex} from '@yearn-finance/web-lib/utils/address';

import type {ReactElement} from 'react';
import type {TApprovalStatus, TNFT, TWizardStatus} from 'utils/types/nftMigratooor';

type TApprovalWizardItemProps = {
	collection: TNFT[];
	collectionStatus: TWizardStatus;
	collectionApprovalStatus: TApprovalStatus;
	index: number;
};
function ApprovalWizardItem({
	collection,
	collectionStatus,
	collectionApprovalStatus,
	index
}: TApprovalWizardItemProps): ReactElement {
	const {destinationAddress} = useNFTMigratooor();
	const {chain} = useNetwork();
	const [firstItemInCollection] = collection;
	const hasMultipleItems = collection.length > 1;

	function renderApprovalIndication(): ReactElement {
		if (collectionStatus?.approval === 'Approved' || collectionApprovalStatus === 'Approved') {
			return <IconCircleCheck className={'h-4 w-4 text-[#16a34a]'} />;
		}
		if (collectionStatus?.approval === 'Approving') {
			return <IconSpinner />;
		}
		if (collectionStatus?.approval === 'Error') {
			return <IconCircleCross className={'h-4 w-4 text-[#e11d48]'} />;
		}
		return <div className={'h-4 w-4 rounded-full bg-neutral-300'} />;
	}

	function renderExecuteIndication(): ReactElement {
		if (collectionStatus?.execute === 'Executed') {
			return <IconCircleCheck className={'h-4 w-4 text-[#16a34a]'} />;
		}
		if (collectionStatus?.execute === 'Executing') {
			return <IconSpinner />;
		}
		if (collectionStatus?.execute === 'Error') {
			return <IconCircleCross className={'h-4 w-4 text-[#e11d48]'} />;
		}
		return <div className={'h-4 w-4 rounded-full bg-neutral-300'} />;
	}

	function renderReceipt(): ReactElement {
		if (collectionStatus?.receipt) {
			return (
				<a
					href={`${chain?.blockExplorers?.default?.url || 'https://etherscan.io'}/tx/${
						collectionStatus.receipt.transactionHash
					}`}
					className={'text-xs text-neutral-500 transition-colors hover:text-neutral-900 hover:underline'}
					target={'_blank'}
					rel={'noreferrer'}>
					{`See transaction: ${truncateHex(collectionStatus.receipt.transactionHash, 6)}`}
				</a>
			);
		}
		return <Fragment />;
	}

	if (hasMultipleItems && firstItemInCollection.collection.type === 'ERC721') {
		return (
			<details
				key={index}
				className={
					'group mb-2 flex w-full flex-col justify-center border-b border-neutral-200 pb-2 transition-colors'
				}>
				<summary className={'relative flex flex-col items-start p-0 py-1'}>
					<div className={'flex flex-row items-center space-x-4'}>
						<div className={'flex flex-row items-center justify-center space-x-2'}>
							{renderApprovalIndication()}
							<small>
								{'Approve '}
								<b>{`${collection.length} ${firstItemInCollection.collection.name}`}</b>
							</small>
						</div>
						<div
							className={'text-neutral-600'}
							style={{paddingBottom: 1}}>
							&rarr;
						</div>
						<div className={'flex flex-row items-center space-x-2'}>
							{renderExecuteIndication()}
							<small>{`Send to ${truncateHex(destinationAddress, 6)}`}</small>
						</div>
					</div>
					<div className={'absolute right-2 top-2 px-2'}>
						<IconChevronBoth
							className={'h-4 w-4 text-neutral-500 transition-colors group-hover:text-neutral-900'}
						/>
					</div>
				</summary>
				<div className={'font-number mt-2 space-y-2 rounded-md bg-neutral-100 text-sm'}>
					<ul className={'list-inside list-disc px-4 py-2'}>
						{collection.map(
							(item): ReactElement => (
								<li
									key={item.tokenID.toString()}
									className={'text-left text-sm'}>
									<span className={'font-number font-bold'}>
										{`${item.name} ${
											toAddress(item.collection.address) === ETHEREUM_ENS_ADDRESS
												? ''
												: `(#${item?.tokenID})`
										}`}
									</span>
								</li>
							)
						)}
					</ul>
				</div>
			</details>
		);
	}
	if (hasMultipleItems && firstItemInCollection.collection.type === 'ERC1155') {
		return (
			<details
				key={index}
				className={
					'group mb-2 flex w-full flex-col justify-center border-b border-neutral-200 pb-2 transition-colors'
				}>
				<summary className={'relative flex flex-col items-start p-0 py-1'}>
					<div className={'flex flex-row items-center space-x-4'}>
						<div className={'flex flex-row items-center justify-center space-x-2'}>
							{renderExecuteIndication()}
							<small>
								{'Send '}
								<b>{`${collection.length} ${firstItemInCollection.collection.name}`}</b>
								{` to ${truncateHex(destinationAddress, 6)}`}
							</small>
						</div>
					</div>
					<div className={'absolute right-2 top-2 px-2'}>
						<IconChevronBoth
							className={'h-4 w-4 text-neutral-500 transition-colors group-hover:text-neutral-900'}
						/>
					</div>
				</summary>
				<div className={'font-number mt-2 space-y-2 rounded-md bg-neutral-100 text-sm'}>
					<ul className={'list-inside list-disc px-4 py-2'}>
						{collection.map(
							(item): ReactElement => (
								<li
									key={item.tokenID.toString()}
									className={'text-left text-sm'}>
									<span className={'font-number font-bold'}>
										{`${item.name} ${
											toAddress(item.collection.address) === ETHEREUM_ENS_ADDRESS
												? ''
												: `(#${item?.tokenID})`
										}`}
									</span>
								</li>
							)
						)}
					</ul>
				</div>
			</details>
		);
	}

	return (
		<div
			key={index}
			className={
				'group mb-2 flex w-full flex-col justify-center border-b border-neutral-200 pb-3 pt-1 transition-colors'
			}>
			<div className={'flex w-full flex-row items-center justify-between space-x-4'}>
				<div className={'flex flex-row items-center space-x-2'}>
					{renderExecuteIndication()}
					<small>
						{'Send '}
						<b>
							{firstItemInCollection?.name ||
								firstItemInCollection?.collection?.name ||
								firstItemInCollection?.collection?.name}
						</b>
						{` to ${truncateHex(destinationAddress, 6)}`}
					</small>
				</div>
				<div className={'flex justify-end text-right'}>
					<small>{renderReceipt()}</small>
				</div>
			</div>
		</div>
	);
}

export default ApprovalWizardItem;
