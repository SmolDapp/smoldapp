import axios from 'axios';

import type {NextApiRequest, NextApiResponse} from 'next';
import type {TAlchemyAssets} from 'utils/types/opensea';
import type {TNDict} from '@builtbymom/web3/types';

async function fetchAllAssetsFromAlchemy(chainID: number, owner: string, next?: string): Promise<TAlchemyAssets[]> {
	const chainIDToNetwork: TNDict<string> = {
		1: 'eth-mainnet',
		10: 'opt-mainnet',
		137: 'polygon-mainnet',
		42161: 'arb-mainnet'
	};
	if (!chainIDToNetwork[chainID]) {
		return [];
	}

	const res = await axios.get(
		`https://${chainIDToNetwork[chainID]}.g.alchemy.com/nft/v2/${
			process.env.ALCHEMY_API_KEY
		}/getNFTs?owner=${owner}&pageSize=200${next ? `&cursor=${next}` : ''}`
	);
	const {ownedNfts} = res.data;
	if (res.data.next) {
		return ownedNfts.concat(await fetchAllAssetsFromAlchemy(chainID, owner, res.data.pageKey));
	}
	return ownedNfts;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<TAlchemyAssets[]>): Promise<void> {
	const tokens = await fetchAllAssetsFromAlchemy(Number(req.body.chainID), req.body.address as string, '');
	return res.status(200).json(tokens);
}
