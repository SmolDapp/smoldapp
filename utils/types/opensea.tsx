import axios from 'axios';
import {toBigInt} from '@yearn-finance/web-lib/utils/format.bigNumber';

import type {AxiosResponse} from 'axios';

export type TRawOpenSeaAsset = {
	id: string | number;
	image_url: string,
	image_preview_url: string,
	image_type?: string
	name: string,
	token_id: bigint,
	permalink: string,
	collection: {
		name: string,
	},
	asset_contract: {
		address: string,
		name: string,
		schema_name: string,
	};
	image_raw?: string,
}

export type TAlchemyAssets = {
	contract: {
		address: string,
	}
	id: {
		tokenId: bigint,
	},
	title: string,
	media: [{
		gateway: string,
		thumbnails: string,
		raw: string,
		format: string,
	}],
	metadata: {
		edition: number,
	}
	contractMetadata: {
		name: string
		tokenType: string
	}
	tokenUri: {
		gateway: string,
		raw: string,
	}
}

export type TOpenSeaAsset = {
	id: string;
	tokenID: bigint,
	type: 'ERC721' | 'ERC1155',
	image_url: string,
	image_preview_url: string,
	image_type?: string
	name: string,
	permalink: string,
	collection: {
		name: string,
	},
	assetContract: {
		address: string,
		name: string,
		schema_name: string,
	};
	image_raw?: string,
}

export async function fetchAllAssetsFromOpenSea(owner: string, next?: string): Promise<TRawOpenSeaAsset[]> {
	const requestURL = `https://api.opensea.io/api/v1/assets?format=json&owner=${owner}&limit=200${next ? `&cursor=${next}` : ''}`;
	const requestHeaders = {
		'X-API-KEY': '9d50e8ae4346485da78f695399369bc9'
	};

	const res = await axios.get(requestURL, {headers: requestHeaders});
	const {assets} = res.data;
	if (res.data.next) {
		return assets.concat(await fetchAllAssetsFromOpenSea(owner, res.data.next));
	}
	return assets;
}

export async function fetchAllAssetsFromAlchemy(chainID: number, owner: string): Promise<TAlchemyAssets[]> {
	const res: AxiosResponse<TAlchemyAssets[]> = await axios.post('/api/proxyFetchNFTFromAlchemy', {chainID, address: owner});
	return res.data;
}

export function matchAlchemyToOpenSea(al: TAlchemyAssets): TOpenSeaAsset {
	return {
		id: `${al.contract.address}_${al.id.tokenId}`,
		type: al.contractMetadata.tokenType as 'ERC721' | 'ERC1155',
		image_url: al.media?.[0]?.gateway,
		image_preview_url: al.media?.[0]?.gateway,
		image_raw: al.media?.[0]?.raw,
		image_type: al.media?.[0]?.format,
		name: al.title,
		tokenID: toBigInt(al.id.tokenId),
		permalink: `https://opensea.io/assets/ethereum/${al.contract.address}/${al.metadata.edition}}`,
		collection: {
			name: al?.contractMetadata?.name
		},
		assetContract: {
			address: al?.contract?.address,
			name: al?.contractMetadata?.name,
			schema_name: al?.contractMetadata?.tokenType
		}
	};
}

export function matchOpensea(os: TRawOpenSeaAsset): TOpenSeaAsset {
	return {
		id: os.id.toString(),
		type: os.asset_contract.schema_name as 'ERC721' | 'ERC1155',
		image_url: os.image_url,
		image_preview_url: os.image_preview_url,
		image_raw: os.image_raw,
		image_type: os.image_type,
		name: os.name,
		tokenID: os.token_id,
		permalink: os.permalink,
		collection: {
			name: os.collection.name
		},
		assetContract: {
			address: os.asset_contract.address,
			name: os.asset_contract.name,
			schema_name: os.asset_contract.schema_name
		}
	};
}
