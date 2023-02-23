export type TOpenSeaAsset = {
	id: number;
	image_url: string,
	image_preview_url: string,
	name: string,
	description: string,
	token_id: string,
	permalink: string,
	collection: {
		name: string,
		description: string,
	},
	creator: {
		profile_img_url: string,
	},
	asset_contract: {
		address: string,
		name: string,
		description: string,
		schema_name: string,
	};
}

