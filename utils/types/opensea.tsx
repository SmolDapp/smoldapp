import {ethers} from 'ethers';

export type TOpenSeaAsset = {
	id: string | number;
	image_url: string,
	image_preview_url: string,
	image_type?: string
	name: string,
	token_id: string,
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
		tokenId: string,
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

export function matchAlchemyToOpenSea(al: TAlchemyAssets): TOpenSeaAsset {
	return {
		id: `${al.contract.address}_${al.id.tokenId}`,
		image_url: al.media?.[0]?.gateway,
		image_preview_url: al.media?.[0]?.gateway,
		image_raw: al.media?.[0]?.raw,
		image_type: al.media?.[0]?.format,
		name: al.title,
		token_id: ethers.BigNumber.from(al.id.tokenId).toString(),
		permalink: `https://opensea.io/assets/ethereum/${al.contract.address}/${al.metadata.edition}}`,
		collection: {
			name: al.contractMetadata.name
		},
		asset_contract: {
			address: al.contract.address,
			name: al.contractMetadata.name,
			schema_name: al.contractMetadata.tokenType
		}
	};
}
