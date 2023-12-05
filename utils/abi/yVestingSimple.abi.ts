export const YVESTING_SIMPLE_ABI = [
	{
		name: 'Claim',
		inputs: [
			{name: 'recipient', type: 'address', indexed: true},
			{name: 'claimed', type: 'uint256', indexed: false}
		],
		anonymous: false,
		type: 'event'
	},
	{
		name: 'Revoked',
		inputs: [
			{name: 'recipient', type: 'address', indexed: false},
			{name: 'owner', type: 'address', indexed: false},
			{name: 'rugged', type: 'uint256', indexed: false},
			{name: 'ts', type: 'uint256', indexed: false}
		],
		anonymous: false,
		type: 'event'
	},
	{name: 'Disowned', inputs: [{name: 'owner', type: 'address', indexed: false}], anonymous: false, type: 'event'},
	{name: 'SetOpenClaim', inputs: [{name: 'state', type: 'bool', indexed: false}], anonymous: false, type: 'event'},
	{stateMutability: 'nonpayable', type: 'constructor', inputs: [], outputs: []},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'initialize',
		inputs: [
			{name: 'owner', type: 'address'},
			{name: 'token', type: 'address'},
			{name: 'recipient', type: 'address'},
			{name: 'amount', type: 'uint256'},
			{name: 'start_time', type: 'uint256'},
			{name: 'end_time', type: 'uint256'},
			{name: 'cliff_length', type: 'uint256'},
			{name: 'open_claim', type: 'bool'}
		],
		outputs: [{name: '', type: 'bool'}]
	},
	{stateMutability: 'view', type: 'function', name: 'unclaimed', inputs: [], outputs: [{name: '', type: 'uint256'}]},
	{stateMutability: 'view', type: 'function', name: 'locked', inputs: [], outputs: [{name: '', type: 'uint256'}]},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'claim',
		inputs: [],
		outputs: [{name: '', type: 'uint256'}]
	},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'claim',
		inputs: [{name: 'beneficiary', type: 'address'}],
		outputs: [{name: '', type: 'uint256'}]
	},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'claim',
		inputs: [
			{name: 'beneficiary', type: 'address'},
			{name: 'amount', type: 'uint256'}
		],
		outputs: [{name: '', type: 'uint256'}]
	},
	{stateMutability: 'nonpayable', type: 'function', name: 'revoke', inputs: [], outputs: []},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'revoke',
		inputs: [{name: 'ts', type: 'uint256'}],
		outputs: []
	},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'revoke',
		inputs: [
			{name: 'ts', type: 'uint256'},
			{name: 'beneficiary', type: 'address'}
		],
		outputs: []
	},
	{stateMutability: 'nonpayable', type: 'function', name: 'disown', inputs: [], outputs: []},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'set_open_claim',
		inputs: [{name: 'open_claim', type: 'bool'}],
		outputs: []
	},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'collect_dust',
		inputs: [{name: 'token', type: 'address'}],
		outputs: []
	},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'collect_dust',
		inputs: [
			{name: 'token', type: 'address'},
			{name: 'beneficiary', type: 'address'}
		],
		outputs: []
	},
	{stateMutability: 'view', type: 'function', name: 'recipient', inputs: [], outputs: [{name: '', type: 'address'}]},
	{stateMutability: 'view', type: 'function', name: 'token', inputs: [], outputs: [{name: '', type: 'address'}]},
	{stateMutability: 'view', type: 'function', name: 'start_time', inputs: [], outputs: [{name: '', type: 'uint256'}]},
	{stateMutability: 'view', type: 'function', name: 'end_time', inputs: [], outputs: [{name: '', type: 'uint256'}]},
	{
		stateMutability: 'view',
		type: 'function',
		name: 'cliff_length',
		inputs: [],
		outputs: [{name: '', type: 'uint256'}]
	},
	{
		stateMutability: 'view',
		type: 'function',
		name: 'total_locked',
		inputs: [],
		outputs: [{name: '', type: 'uint256'}]
	},
	{
		stateMutability: 'view',
		type: 'function',
		name: 'total_claimed',
		inputs: [],
		outputs: [{name: '', type: 'uint256'}]
	},
	{
		stateMutability: 'view',
		type: 'function',
		name: 'disabled_at',
		inputs: [],
		outputs: [{name: '', type: 'uint256'}]
	},
	{stateMutability: 'view', type: 'function', name: 'open_claim', inputs: [], outputs: [{name: '', type: 'bool'}]},
	{stateMutability: 'view', type: 'function', name: 'initialized', inputs: [], outputs: [{name: '', type: 'bool'}]},
	{stateMutability: 'view', type: 'function', name: 'owner', inputs: [], outputs: [{name: '', type: 'address'}]}
] as const;
