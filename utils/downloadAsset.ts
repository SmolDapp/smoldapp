import {saveAs} from 'file-saver';

import type {TAddress} from '@yearn-finance/web-lib/types';

export type TDownloadAsset = {
	chainId: number;
	address: TAddress;
	type: 'png' | 'svg';
	onSuccess?: () => void;
	fileName?: string;
};

export function downloadAsset({chainId, address, type, fileName = 'Token Asset', onSuccess}: TDownloadAsset): void {
	const url = `https://raw.githubusercontent.com/SmolDapp/tokenAssets/main/tokens/${chainId}/${address.toLowerCase()}/${
		type === 'png' ? 'logo-128.png' : 'logo.svg'
	}`;

	saveAs(url, `${fileName}.${type}`);
	onSuccess?.();
}
