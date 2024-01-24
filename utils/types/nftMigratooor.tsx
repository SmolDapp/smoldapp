import type {TransactionReceipt} from 'viem';
import type {TAddress} from '@builtbymom/web3/types';

export type TApprovalStatus = 'Approved' | 'Not Approved';

export type TWizardStatus = {
	approval: 'Approved' | 'Not Approved' | 'Approving' | 'Error';
	execute: 'Executed' | 'Not Executed' | 'Executing' | 'Error';
	receipt: TransactionReceipt | undefined;
};

export type TNFT = {
	id: string;
	tokenID: bigint;
	imageType: string;
	imageURL?: string;
	imageRaw?: string;
	name?: string;
	collection: {
		address: TAddress;
		type: 'ERC721' | 'ERC1155';
		name: string;
		symbol?: string;
	};
	permalink?: string;
};
