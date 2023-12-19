import {Warning} from '@common/Primitives/Warning';

import type {ReactElement} from 'react';

export function SendWarning(): ReactElement {
	return (
		<div className={'mb-4'}>
			<Warning message={'You‘re trying to send funds to the address that doesn’t look like a wallet'} />
		</div>
	);
}
