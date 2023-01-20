const	CLAIM_ABI = [
	{
		'inputs': [],
		'name': 'acceptDoid',
		'outputs': [],
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'inputs': [
			{
				'internalType': 'address',
				'name': '_initialValidator',
				'type': 'address'
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
				'name': 'owner',
				'type': 'address'
			},
			{
				'indexed': true,
				'internalType': 'address',
				'name': 'approved',
				'type': 'address'
			},
			{
				'indexed': true,
				'internalType': 'uint256',
				'name': 'tokenId',
				'type': 'uint256'
			}
		],
		'name': 'Approval',
		'type': 'event'
	},
	{
		'anonymous': false,
		'inputs': [
			{
				'indexed': true,
				'internalType': 'address',
				'name': 'owner',
				'type': 'address'
			},
			{
				'indexed': true,
				'internalType': 'address',
				'name': 'operator',
				'type': 'address'
			},
			{
				'indexed': false,
				'internalType': 'bool',
				'name': 'approved',
				'type': 'bool'
			}
		],
		'name': 'ApprovalForAll',
		'type': 'event'
	},
	{
		'inputs': [
			{
				'internalType': 'address',
				'name': 'to',
				'type': 'address'
			},
			{
				'internalType': 'uint256',
				'name': 'tokenId',
				'type': 'uint256'
			}
		],
		'name': 'approve',
		'outputs': [],
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'inputs': [
			{
				'internalType': 'uint256',
				'name': 'bumpDaysThreshold',
				'type': 'uint256'
			}
		],
		'name': 'bumpEdition',
		'outputs': [],
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'inputs': [
			{
				'internalType': 'address',
				'name': 'tokenAsPayment',
				'type': 'address'
			}
		],
		'name': 'claim',
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
				'name': 'owner',
				'type': 'address'
			},
			{
				'indexed': false,
				'internalType': 'uint256',
				'name': 'claimID',
				'type': 'uint256'
			},
			{
				'indexed': false,
				'internalType': 'uint256',
				'name': 'edition',
				'type': 'uint256'
			},
			{
				'indexed': false,
				'internalType': 'uint256',
				'name': 'expiration',
				'type': 'uint256'
			}
		],
		'name': 'Claimed',
		'type': 'event'
	},
	{
		'inputs': [
			{
				'internalType': 'address',
				'name': 'tokenAsPayment',
				'type': 'address'
			},
			{
				'internalType': 'address',
				'name': 'to',
				'type': 'address'
			}
		],
		'name': 'claimFor',
		'outputs': [],
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'inputs': [
			{
				'internalType': 'address',
				'name': 'validator',
				'type': 'address'
			},
			{
				'internalType': 'address',
				'name': 'requestor',
				'type': 'address'
			},
			{
				'internalType': 'address',
				'name': 'to',
				'type': 'address'
			},
			{
				'internalType': 'uint256',
				'name': 'time',
				'type': 'uint256'
			},
			{
				'internalType': 'uint256',
				'name': 'deadline',
				'type': 'uint256'
			},
			{
				'internalType': 'bytes',
				'name': 'sig',
				'type': 'bytes'
			}
		],
		'name': 'claimFromValidator',
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
				'name': 'validator',
				'type': 'address'
			},
			{
				'indexed': true,
				'internalType': 'address',
				'name': 'requestor',
				'type': 'address'
			},
			{
				'indexed': true,
				'internalType': 'address',
				'name': 'to',
				'type': 'address'
			},
			{
				'indexed': false,
				'internalType': 'uint256',
				'name': 'time',
				'type': 'uint256'
			}
		],
		'name': 'DelegateClaim',
		'type': 'event'
	},
	{
		'inputs': [
			{
				'internalType': 'address',
				'name': 'to',
				'type': 'address'
			},
			{
				'internalType': 'uint256',
				'name': 'numberOfDays',
				'type': 'uint256'
			}
		],
		'name': 'droidClaimFor',
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
				'name': 'by',
				'type': 'address'
			},
			{
				'indexed': true,
				'internalType': 'address',
				'name': 'token',
				'type': 'address'
			},
			{
				'indexed': false,
				'internalType': 'uint256',
				'name': 'amount',
				'type': 'uint256'
			}
		],
		'name': 'PaymentExecuted',
		'type': 'event'
	},
	{
		'inputs': [
			{
				'internalType': 'address',
				'name': 'from',
				'type': 'address'
			},
			{
				'internalType': 'address',
				'name': 'to',
				'type': 'address'
			},
			{
				'internalType': 'uint256',
				'name': 'tokenId',
				'type': 'uint256'
			}
		],
		'name': 'safeTransferFrom',
		'outputs': [],
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'inputs': [
			{
				'internalType': 'address',
				'name': 'from',
				'type': 'address'
			},
			{
				'internalType': 'address',
				'name': 'to',
				'type': 'address'
			},
			{
				'internalType': 'uint256',
				'name': 'tokenId',
				'type': 'uint256'
			},
			{
				'internalType': 'bytes',
				'name': 'data',
				'type': 'bytes'
			}
		],
		'name': 'safeTransferFrom',
		'outputs': [],
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'inputs': [
			{
				'internalType': 'address',
				'name': 'operator',
				'type': 'address'
			},
			{
				'internalType': 'bool',
				'name': 'approved',
				'type': 'bool'
			}
		],
		'name': 'setApprovalForAll',
		'outputs': [],
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'inputs': [
			{
				'internalType': 'string',
				'name': 'newURI',
				'type': 'string'
			}
		],
		'name': 'setBaseURI',
		'outputs': [],
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'inputs': [
			{
				'internalType': 'uint256',
				'name': 'editionBumpInterval',
				'type': 'uint256'
			}
		],
		'name': 'setDefaultEditionBumpInterval',
		'outputs': [],
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'inputs': [
			{
				'internalType': 'address',
				'name': '_droid',
				'type': 'address'
			}
		],
		'name': 'setDroid',
		'outputs': [],
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'inputs': [
			{
				'internalType': 'address',
				'name': '_treasury',
				'type': 'address'
			}
		],
		'name': 'setTreasury',
		'outputs': [],
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'inputs': [
			{
				'internalType': 'address',
				'name': 'validator',
				'type': 'address'
			},
			{
				'internalType': 'bool',
				'name': 'status',
				'type': 'bool'
			}
		],
		'name': 'setValidator',
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
				'name': 'from',
				'type': 'address'
			},
			{
				'indexed': true,
				'internalType': 'address',
				'name': 'to',
				'type': 'address'
			},
			{
				'indexed': true,
				'internalType': 'uint256',
				'name': 'tokenId',
				'type': 'uint256'
			}
		],
		'name': 'Transfer',
		'type': 'event'
	},
	{
		'inputs': [
			{
				'internalType': 'address',
				'name': 'from',
				'type': 'address'
			},
			{
				'internalType': 'address',
				'name': 'to',
				'type': 'address'
			},
			{
				'internalType': 'uint256',
				'name': 'tokenId',
				'type': 'uint256'
			}
		],
		'name': 'transferFrom',
		'outputs': [],
		'stateMutability': 'nonpayable',
		'type': 'function'
	},
	{
		'inputs': [
			{
				'internalType': 'address',
				'name': '',
				'type': 'address'
			},
			{
				'internalType': 'address',
				'name': '',
				'type': 'address'
			}
		],
		'name': '_validatorClaims',
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
		'inputs': [
			{
				'internalType': 'address',
				'name': '',
				'type': 'address'
			},
			{
				'internalType': 'address',
				'name': '',
				'type': 'address'
			}
		],
		'name': '_validatorNonces',
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
				'internalType': 'address',
				'name': 'owner',
				'type': 'address'
			}
		],
		'name': 'balanceOf',
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
				'name': 'claimID',
				'type': 'uint256'
			}
		],
		'name': 'claimData',
		'outputs': [
			{
				'internalType': 'address',
				'name': '',
				'type': 'address'
			},
			{
				'internalType': 'uint256',
				'name': '',
				'type': 'uint256'
			},
			{
				'internalType': 'uint256',
				'name': '',
				'type': 'uint256'
			},
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
		'name': 'currentEdition',
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
		'name': 'defaultEditionBumpInterval',
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
		'name': 'droid',
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
				'internalType': 'uint256',
				'name': 'claimID',
				'type': 'uint256'
			}
		],
		'name': 'edition',
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
		'name': 'editionBumpThreshold',
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
				'name': 'edition',
				'type': 'uint256'
			}
		],
		'name': 'editionSupply',
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
				'name': 'claimID',
				'type': 'uint256'
			}
		],
		'name': 'expiration',
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
				'name': 'tokenId',
				'type': 'uint256'
			}
		],
		'name': 'getApproved',
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
				'name': 'owner',
				'type': 'address'
			},
			{
				'internalType': 'address',
				'name': 'operator',
				'type': 'address'
			}
		],
		'name': 'isApprovedForAll',
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
		'inputs': [
			{
				'internalType': 'uint256',
				'name': 'claimID',
				'type': 'uint256'
			}
		],
		'name': 'isExpired',
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
		'name': 'isPaused',
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
		'name': 'nextID',
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
				'name': 'tokenId',
				'type': 'uint256'
			}
		],
		'name': 'ownerOf',
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
		'name': 'pendingDroid',
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
				'internalType': 'bytes4',
				'name': 'interfaceId',
				'type': 'bytes4'
			}
		],
		'name': 'supportsInterface',
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
		'name': 'symbol',
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
				'internalType': 'uint256',
				'name': 'index',
				'type': 'uint256'
			}
		],
		'name': 'tokenByIndex',
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
				'internalType': 'address',
				'name': 'owner',
				'type': 'address'
			},
			{
				'internalType': 'uint256',
				'name': 'index',
				'type': 'uint256'
			}
		],
		'name': 'tokenOfOwnerByIndex',
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
				'name': 'tokenId',
				'type': 'uint256'
			}
		],
		'name': 'tokenURI',
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
		'name': 'totalSupply',
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

export default CLAIM_ABI;
