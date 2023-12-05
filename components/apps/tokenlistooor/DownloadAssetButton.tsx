import IconDownload from '@icons/IconDownload';
import {downloadAsset} from '@utils/downloadAsset';

import type {ReactElement} from 'react';
import type {TDownloadAsset} from '@utils/downloadAsset';

export function DownloadAssetButton({address, type, chainId, fileName}: TDownloadAsset): ReactElement {
	return (
		<button
			className={
				'flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1 transition-colors hover:bg-neutral-200'
			}
			onClick={() =>
				downloadAsset({
					address,
					type,
					chainId,
					fileName
				})
			}>
			{type.toUpperCase()}
			<IconDownload />
		</button>
	);
}
