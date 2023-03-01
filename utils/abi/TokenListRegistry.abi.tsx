const TOKENLIST_REGISTRY_ABI = [
	{
		'inputs': [
			{
				'internalType': 'string',
				'name': 'name',
				'type': 'string'
			},
			{
				'internalType': 'string',
				'name': 'description',
				'type': 'string'
			},
			{
				'internalType': 'string',
				'name': 'logoURI',
				'type': 'string'
			},
			{
				'internalType': 'string',
				'name': 'baseURI',
				'type': 'string'
			}
		],
		'name': 'createTokenList',
		'outputs': [],
		'stateMutability': 'payable',
		'type': 'function'
	},
	{
		'inputs': [
			{
				'internalType': 'address',
				'name': 'initialTreasury',
				'type': 'address'
			},
			{
				'internalType': 'uint256',
				'name': 'initialChainID',
				'type': 'uint256'
			}
		],
		'stateMutability': 'nonpayable',
		'type': 'constructor'
	},
	{
		'anonymous': false,
		'inputs': [
			{
				'indexed': true,
				'internalType': 'address',
				'name': 'listAddress',
				'type': 'address'
			},
			{
				'indexed': false,
				'internalType': 'string',
				'name': 'name',
				'type': 'string'
			},
			{
				'indexed': false,
				'internalType': 'string',
				'name': 'description',
				'type': 'string'
			},
			{
				'indexed': false,
				'internalType': 'string',
				'name': 'logoURI',
				'type': 'string'
			}
		],
		'name': 'ListCreated',
		'type': 'event'
	},
	{
		'anonymous': false,
		'inputs': [
			{
				'indexed': true,
				'internalType': 'address',
				'name': 'ownerAddress',
				'type': 'address'
			}
		],
		'name': 'OwnerSet',
		'type': 'event'
	},
	{
		'inputs': [
			{
				'internalType': 'address',
				'name': 'addr',
				'type': 'address'
			},
			{
				'internalType': 'bool',
				'name': 'endorsed',
				'type': 'bool'
			}
		],
		'name': 'setEndorsed',
		'outputs': [],
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'inputs': [
			{
				'internalType': 'address',
				'name': 'newOwner',
				'type': 'address'
			}
		],
		'name': 'setOwner',
		'outputs': [],
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'inputs': [
			{
				'internalType': 'address',
				'name': 'newTreasury',
				'type': 'address'
			}
		],
		'name': 'setTreasury',
		'outputs': [],
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'anonymous': false,
		'inputs': [
			{
				'indexed': true,
				'internalType': 'address',
				'name': 'treasuryAddress',
				'type': 'address'
			}
		],
		'name': 'TreasurySet',
		'type': 'event'
	},
	{
		'inputs': [
			{
				'internalType': 'string',
				'name': 'name',
				'type': 'string'
			},
			{
				'internalType': 'string',
				'name': 'description',
				'type': 'string'
			},
			{
				'internalType': 'string',
				'name': 'logoURI',
				'type': 'string'
			},
			{
				'internalType': 'string',
				'name': 'baseURI',
				'type': 'string'
			}
		],
		'name': 'updateTokenList',
		'outputs': [],
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'inputs': [],
		'name': 'chainID',
		'outputs': [
			{
				'internalType': 'uint256',
				'name': '',
				'type': 'uint256'
			}
		],
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'inputs': [],
		'name': 'countLists',
		'outputs': [
			{
				'internalType': 'uint256',
				'name': '',
				'type': 'uint256'
			}
		],
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'inputs': [
			{
				'internalType': 'uint256',
				'name': '',
				'type': 'uint256'
			}
		],
		'name': 'endorsedLists',
		'outputs': [
			{
				'internalType': 'address',
				'name': '',
				'type': 'address'
			}
		],
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'inputs': [
			{
				'internalType': 'address',
				'name': 'addr',
				'type': 'address'
			}
		],
		'name': 'getListByAddress',
		'outputs': [
			{
				'components': [
					{
						'internalType': 'address',
						'name': 'listAddress',
						'type': 'address'
					},
					{
						'internalType': 'string',
						'name': 'name',
						'type': 'string'
					},
					{
						'internalType': 'string',
						'name': 'description',
						'type': 'string'
					},
					{
						'internalType': 'string',
						'name': 'logoURI',
						'type': 'string'
					},
					{
						'internalType': 'string',
						'name': 'baseURI',
						'type': 'string'
					},
					{
						'internalType': 'bool',
						'name': 'endorsed',
						'type': 'bool'
					}
				],
				'internalType': 'struct TokenListFactory.tokenList',
				'name': '',
				'type': 'tuple'
			}
		],
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'inputs': [
			{
				'internalType': 'uint256',
				'name': 'index',
				'type': 'uint256'
			}
		],
		'name': 'getListByIndex',
		'outputs': [
			{
				'components': [
					{
						'internalType': 'address',
						'name': 'listAddress',
						'type': 'address'
					},
					{
						'internalType': 'string',
						'name': 'name',
						'type': 'string'
					},
					{
						'internalType': 'string',
						'name': 'description',
						'type': 'string'
					},
					{
						'internalType': 'string',
						'name': 'logoURI',
						'type': 'string'
					},
					{
						'internalType': 'string',
						'name': 'baseURI',
						'type': 'string'
					},
					{
						'internalType': 'bool',
						'name': 'endorsed',
						'type': 'bool'
					}
				],
				'internalType': 'struct TokenListFactory.tokenList',
				'name': '',
				'type': 'tuple'
			}
		],
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'inputs': [
			{
				'internalType': 'uint256',
				'name': '',
				'type': 'uint256'
			}
		],
		'name': 'lists',
		'outputs': [
			{
				'internalType': 'address',
				'name': '',
				'type': 'address'
			}
		],
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'inputs': [],
		'name': 'owner',
		'outputs': [
			{
				'internalType': 'address',
				'name': '',
				'type': 'address'
			}
		],
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'inputs': [],
		'name': 'treasury',
		'outputs': [
			{
				'internalType': 'address',
				'name': '',
				'type': 'address'
			}
		],
		'stateMutability': 'view',
		'type': 'function'
	}
];

export default TOKENLIST_REGISTRY_ABI;
