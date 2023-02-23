import type {ethers} from 'ethers';

export type TApprovalStatus = 'Approved' | 'Not Approved'

export type TWizardStatus = {
	approval: 'Approved' | 'Not Approved' | 'Approving' | 'Error',
	execute: 'Executed' | 'Not Executed' | 'Executing' | 'Error'
	receipt: ethers.providers.TransactionReceipt | undefined
}
