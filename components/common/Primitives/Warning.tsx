import {cl} from '@builtbymom/web3/utils';

import type {ReactElement} from 'react';

export type TWarningType = 'error' | 'warning' | 'info';

export function Warning({message, type}: {message: string; type: TWarningType}): ReactElement {
	const getWarningColors = (): string => {
		if (type === 'error') {
			return 'border-[#FF5B5B] text-[#FF0000] bg-[#FBDADA]';
		}
		if (type === 'warning') {
			return 'border-[#FF9900] text-[#FF9900] bg-[#FFF3D3]';
		}
		return 'border-neutral-600 text-neutral-700 bg-neutral-300';
	};

	return (
		<div className={cl('rounded-lg border  p-4', getWarningColors())}>
			<b className={'capitalize'}>{type}</b>
			<p className={'text-xs'}>{message}</p>
		</div>
	);
}
