const NFT_MIGRATOOOR_ABI = [
	{
		inputs: [
			{internalType: 'contract IERC721', name: 'collection', type: 'address'},
			{internalType: 'address', name: 'to', type: 'address'},
			{internalType: 'uint256[]', name: 'tokenIDs', type: 'uint256[]'}
		],
		name: 'migrate',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	}
] as const;

export default NFT_MIGRATOOOR_ABI;
