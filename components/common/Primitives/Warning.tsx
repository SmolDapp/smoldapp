import type {ReactElement} from 'react';

export function Warning({message}: {message: string}): ReactElement {
	return (
		<div className={'rounded-lg border border-[#FF5B5B] bg-[#FBDADA] p-4 text-[#FF0000]'}>
			<b>{'Warning!'}</b>
			<p className={'text-xs'}>{message}</p>
		</div>
	);
}
