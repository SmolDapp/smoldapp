import axios from 'axios';
import {toAddress, toBigInt} from '@builtbymom/web3/utils';

import type {AxiosResponse} from 'axios';
import type {TNFT} from './nftMigratooor';

export type TRawOpenSeaAsset = {
	id: string | number;
	image_url: string;
	image_preview_url: string;
	image_type?: string;
	name: string;
	token_id: bigint;
	permalink: string;
	collection: {
		name: string;
	};
	asset_contract: {
		address: string;
		name: string;
		schema_name: string;
	};
	image_raw?: string;
};

export type TAlchemyAssets = {
	contract: {
		address: string;
	};
	id: {
		tokenId: bigint;
	};
	title: string;
	media: [
		{
			gateway: string;
			thumbnails: string;
			raw: string;
			format: string;
		}
	];
	metadata: {
		edition: number;
	};
	contractMetadata: {
		name: string;
		tokenType: string;
	};
	tokenUri: {
		gateway: string;
		raw: string;
	};
};

export async function fetchAllAssetsFromOpenSea(owner: string, next?: string): Promise<TRawOpenSeaAsset[]> {
	const requestURL = `https://api.opensea.io/api/v1/assets?format=json&owner=${owner}&limit=200${
		next ? `&cursor=${next}` : ''
	}`;
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
	const res: AxiosResponse<TAlchemyAssets[]> = await axios.post('/api/proxyFetchNFTFromAlchemy', {
		chainID,
		address: owner
	});
	return res.data;
}

export function alchemyToNFT(al: TAlchemyAssets): TNFT {
	return {
		id: `${al.contract.address}_${al.id.tokenId}`,
		imageURL: al.media?.[0]?.gateway,
		imageRaw: al.media?.[0]?.raw,
		imageType: al.media?.[0]?.format,
		tokenID: toBigInt(al.id.tokenId),
		name: al.title,
		permalink: `https://opensea.io/assets/ethereum/${al.contract.address}/${al.metadata.edition}}`,
		collection: {
			address: toAddress(al?.contract?.address),
			name: al.title || al?.contractMetadata?.name,
			type: al.contractMetadata.tokenType as 'ERC721' | 'ERC1155'
		}
	};
}

export function openseaToNFT(os: TRawOpenSeaAsset): TNFT {
	return {
		id: os.id.toString(),
		imageURL: os.image_url || os.image_preview_url,
		imageRaw: os.image_raw,
		imageType: os.image_type || 'image/png',
		tokenID: os.token_id,
		permalink: os.permalink,
		name: os.name,
		collection: {
			address: toAddress(os.asset_contract.address),
			name: os.collection.name || os.asset_contract.name,
			type: os.asset_contract.schema_name as 'ERC721' | 'ERC1155'
		}
	};
}
