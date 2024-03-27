import {cl} from '@builtbymom/web3/utils';

import type {ReactElement, ReactNode} from 'react';

export type TWarningType = 'error' | 'warning' | 'info';

export function Warning({
	message,
	type,
	statusIcon,
	title
}: {
	message: string | ReactNode;
	type: TWarningType;
	statusIcon?: ReactElement;
	title?: string;
}): ReactElement {
	const getWarningColors = (): string => {
		if (type === 'error') {
			return 'border-[#FF5B5B] text-[#FF0000] bg-[#FBDADA]';
		}
		if (type === 'warning') {
			return 'border-[#FF9900] text-[#FF9900] bg-[#FFF3D3]';
		}
		return 'border-neutral-600 text-neutral-700 bg-neutral-100';
	};

	return (
		<div className={cl('rounded-lg border p-4 text-left', getWarningColors())}>
			{title && <b className={'text-left capitalize'}>{title}</b>}
			<div className={'flex gap-3'}>
				{statusIcon && <div className={'flex items-center'}>{statusIcon}</div>}
				{message && <div className={'text-xs'}>{message}</div>}
			</div>
		</div>
	);
}
