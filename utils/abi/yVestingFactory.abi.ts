export const YVESTING_FACTORY_ABI = [
	{
		name: 'VestingEscrowCreated',
		inputs: [
			{name: 'funder', type: 'address', indexed: true},
			{name: 'token', type: 'address', indexed: true},
			{name: 'recipient', type: 'address', indexed: true},
			{name: 'escrow', type: 'address', indexed: false},
			{name: 'amount', type: 'uint256', indexed: false},
			{name: 'vesting_start', type: 'uint256', indexed: false},
			{name: 'vesting_duration', type: 'uint256', indexed: false},
			{name: 'cliff_length', type: 'uint256', indexed: false},
			{name: 'open_claim', type: 'bool', indexed: false}
		],
		anonymous: false,
		type: 'event'
	},
	{
		stateMutability: 'nonpayable',
		type: 'constructor',
		inputs: [
			{name: 'target', type: 'address'},
			{name: 'vyper_donate', type: 'address'}
		],
		outputs: []
	},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'deploy_vesting_contract',
		inputs: [
			{name: 'token', type: 'address'},
			{name: 'recipient', type: 'address'},
			{name: 'amount', type: 'uint256'},
			{name: 'vesting_duration', type: 'uint256'}
		],
		outputs: [{name: '', type: 'address'}]
	},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'deploy_vesting_contract',
		inputs: [
			{name: 'token', type: 'address'},
			{name: 'recipient', type: 'address'},
			{name: 'amount', type: 'uint256'},
			{name: 'vesting_duration', type: 'uint256'},
			{name: 'vesting_start', type: 'uint256'}
		],
		outputs: [{name: '', type: 'address'}]
	},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'deploy_vesting_contract',
		inputs: [
			{name: 'token', type: 'address'},
			{name: 'recipient', type: 'address'},
			{name: 'amount', type: 'uint256'},
			{name: 'vesting_duration', type: 'uint256'},
			{name: 'vesting_start', type: 'uint256'},
			{name: 'cliff_length', type: 'uint256'}
		],
		outputs: [{name: '', type: 'address'}]
	},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'deploy_vesting_contract',
		inputs: [
			{name: 'token', type: 'address'},
			{name: 'recipient', type: 'address'},
			{name: 'amount', type: 'uint256'},
			{name: 'vesting_duration', type: 'uint256'},
			{name: 'vesting_start', type: 'uint256'},
			{name: 'cliff_length', type: 'uint256'},
			{name: 'open_claim', type: 'bool'}
		],
		outputs: [{name: '', type: 'address'}]
	},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'deploy_vesting_contract',
		inputs: [
			{name: 'token', type: 'address'},
			{name: 'recipient', type: 'address'},
			{name: 'amount', type: 'uint256'},
			{name: 'vesting_duration', type: 'uint256'},
			{name: 'vesting_start', type: 'uint256'},
			{name: 'cliff_length', type: 'uint256'},
			{name: 'open_claim', type: 'bool'},
			{name: 'support_vyper', type: 'uint256'}
		],
		outputs: [{name: '', type: 'address'}]
	},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'deploy_vesting_contract',
		inputs: [
			{name: 'token', type: 'address'},
			{name: 'recipient', type: 'address'},
			{name: 'amount', type: 'uint256'},
			{name: 'vesting_duration', type: 'uint256'},
			{name: 'vesting_start', type: 'uint256'},
			{name: 'cliff_length', type: 'uint256'},
			{name: 'open_claim', type: 'bool'},
			{name: 'support_vyper', type: 'uint256'},
			{name: 'owner', type: 'address'}
		],
		outputs: [{name: '', type: 'address'}]
	},
	{stateMutability: 'view', type: 'function', name: 'TARGET', inputs: [], outputs: [{name: '', type: 'address'}]},
	{stateMutability: 'view', type: 'function', name: 'VYPER', inputs: [], outputs: [{name: '', type: 'address'}]}
] as const;
