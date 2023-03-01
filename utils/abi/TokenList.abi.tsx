const TOKENLIST_ABI = [
	{
		'inputs': [
			{
				'internalType': 'address',
				'name': '_owner',
				'type': 'address'
			},
			{
				'internalType': 'address',
				'name': '_registry',
				'type': 'address'
			},
			{
				'internalType': 'string',
				'name': '_name',
				'type': 'string'
			},
			{
				'internalType': 'string',
				'name': '_description',
				'type': 'string'
			},
			{
				'internalType': 'string',
				'name': '_logoURI',
				'type': 'string'
			},
			{
				'internalType': 'string',
				'name': '_baseURI',
				'type': 'string'
			},
			{
				'internalType': 'uint256',
				'name': '_chainID',
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
				'name': 'listooor',
				'type': 'address'
			},
			{
				'indexed': false,
				'internalType': 'bool',
				'name': 'active',
				'type': 'bool'
			}
		],
		'name': 'ListooorSet',
		'type': 'event'
	},
	{
		'anonymous': false,
		'inputs': [
			{
				'indexed': true,
				'internalType': 'address',
				'name': 'newMainListooor',
				'type': 'address'
			}
		],
		'name': 'MainListooorAccepted',
		'type': 'event'
	},
	{
		'anonymous': false,
		'inputs': [
			{
				'indexed': true,
				'internalType': 'address',
				'name': 'newMainListooor',
				'type': 'address'
			}
		],
		'name': 'MainListooorSet',
		'type': 'event'
	},
	{
		'anonymous': false,
		'inputs': [
			{
				'indexed': true,
				'internalType': 'address',
				'name': 'tokenAddress',
				'type': 'address'
			},
			{
				'indexed': false,
				'internalType': 'string',
				'name': 'symbol',
				'type': 'string'
			},
			{
				'indexed': false,
				'internalType': 'string',
				'name': 'name',
				'type': 'string'
			},
			{
				'indexed': false,
				'internalType': 'uint8',
				'name': 'decimals',
				'type': 'uint8'
			}
		],
		'name': 'TokenAdded',
		'type': 'event'
	},
	{
		'anonymous': false,
		'inputs': [
			{
				'indexed': true,
				'internalType': 'address',
				'name': 'tokenAddress',
				'type': 'address'
			}
		],
		'name': 'TokenRemoved',
		'type': 'event'
	},
	{
		'inputs': [],
		'name': 'acceptMainListooor',
		'outputs': [],
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'inputs': [],
		'name': 'baseURI',
		'outputs': [
			{
				'internalType': 'string',
				'name': '',
				'type': 'string'
			}
		],
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'inputs': [
			{
				'internalType': 'address[]',
				'name': 'tokenAddresses',
				'type': 'address[]'
			}
		],
		'name': 'batchSetToken',
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
		'name': 'countToken',
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
		'name': 'description',
		'outputs': [
			{
				'internalType': 'string',
				'name': '',
				'type': 'string'
			}
		],
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'inputs': [
			{
				'internalType': 'address',
				'name': 'tokenAddress',
				'type': 'address'
			}
		],
		'name': 'getToken',
		'outputs': [
			{
				'components': [
					{
						'internalType': 'address',
						'name': 'tokenAddress',
						'type': 'address'
					},
					{
						'internalType': 'string',
						'name': 'symbol',
						'type': 'string'
					},
					{
						'internalType': 'string',
						'name': 'name',
						'type': 'string'
					},
					{
						'internalType': 'string',
						'name': 'tokenURI',
						'type': 'string'
					},
					{
						'internalType': 'uint8',
						'name': 'decimals',
						'type': 'uint8'
					}
				],
				'internalType': 'struct TokenListooor.TokenData',
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
				'internalType': 'address',
				'name': 'tokenAddress',
				'type': 'address'
			}
		],
		'name': 'getTokenURI',
		'outputs': [
			{
				'internalType': 'string',
				'name': 'tokenURI',
				'type': 'string'
			}
		],
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'inputs': [
			{
				'internalType': 'uint256',
				'name': 'fromIndex',
				'type': 'uint256'
			},
			{
				'internalType': 'uint256',
				'name': 'toIndex',
				'type': 'uint256'
			}
		],
		'name': 'listTokens',
		'outputs': [
			{
				'components': [
					{
						'internalType': 'address',
						'name': 'tokenAddress',
						'type': 'address'
					},
					{
						'internalType': 'string',
						'name': 'symbol',
						'type': 'string'
					},
					{
						'internalType': 'string',
						'name': 'name',
						'type': 'string'
					},
					{
						'internalType': 'string',
						'name': 'tokenURI',
						'type': 'string'
					},
					{
						'internalType': 'uint8',
						'name': 'decimals',
						'type': 'uint8'
					}
				],
				'internalType': 'struct TokenListooor.TokenData[]',
				'name': '',
				'type': 'tuple[]'
			}
		],
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'inputs': [
			{
				'internalType': 'address',
				'name': '',
				'type': 'address'
			}
		],
		'name': 'listooors',
		'outputs': [
			{
				'internalType': 'bool',
				'name': '',
				'type': 'bool'
			}
		],
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'inputs': [],
		'name': 'logoURI',
		'outputs': [
			{
				'internalType': 'string',
				'name': '',
				'type': 'string'
			}
		],
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'inputs': [],
		'name': 'mainListooor',
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
		'name': 'name',
		'outputs': [
			{
				'internalType': 'string',
				'name': '',
				'type': 'string'
			}
		],
		'stateMutability': 'view',
		'type': 'function'
	},
	{
		'inputs': [],
		'name': 'pendingMainListooor',
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
		'name': 'registry',
		'outputs': [
			{
				'internalType': 'contract ITokenListRegistry',
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
				'name': 'listooor',
				'type': 'address'
			},
			{
				'internalType': 'bool',
				'name': 'active',
				'type': 'bool'
			}
		],
		'name': 'setListooor',
		'outputs': [],
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'inputs': [
			{
				'internalType': 'address',
				'name': 'newMainListooor',
				'type': 'address'
			}
		],
		'name': 'setMainListooor',
		'outputs': [],
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'inputs': [
			{
				'internalType': 'address',
				'name': 'tokenAddress',
				'type': 'address'
			}
		],
		'name': 'setToken',
		'outputs': [],
		'stateMutability': 'nonpayable',
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
		'name': 'tokens',
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
				'name': 'tokenAddress',
				'type': 'address'
			}
		],
		'name': 'unsetToken',
		'outputs': [],
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'inputs': [
			{
				'internalType': 'string',
				'name': 'newBaseURI',
				'type': 'string'
			}
		],
		'name': 'updateBaseURI',
		'outputs': [],
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'inputs': [
			{
				'internalType': 'string',
				'name': 'newDescription',
				'type': 'string'
			}
		],
		'name': 'updateDescription',
		'outputs': [],
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'inputs': [
			{
				'internalType': 'string',
				'name': 'newLogoURI',
				'type': 'string'
			}
		],
		'name': 'updateLogoURI',
		'outputs': [],
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'inputs': [
			{
				'internalType': 'string',
				'name': 'newName',
				'type': 'string'
			}
		],
		'name': 'updateName',
		'outputs': [],
		'stateMutability': 'nonpayable',
		'type': 'function'
	}
];

export default TOKENLIST_ABI;
