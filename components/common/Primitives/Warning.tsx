import {cl} from '@yearn-finance/web-lib/utils/cl';

import type {ReactElement} from 'react';

export type TWarningType = 'error' | 'warning' | 'info';

export function Warning({message, type}: {message: string; type: TWarningType}): ReactElement {
	const getWarningColors = (): string => {
		if (type === 'error') {
			return 'border-[#FF5B5B] text-[#FF0000] bg-[#FBDADA]';
		}
		if (type === 'warning') {
			return 'border-[#F4B731] text-[#F4B731]';
		}
		return '';
	};

	return (
		<div className={cl('rounded-lg border  p-4', getWarningColors())}>
			<b className={'capitalize'}>{type}</b>
			<p className={'text-xs'}>{message}</p>
		</div>
	);
}
