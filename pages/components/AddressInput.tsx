import {SmolAddressInput} from 'components/designSystem/SmolAddressInput';

import type {ReactElement} from 'react';

export default function AddressInputView(): ReactElement {
	return (
		<div className={'fixed inset-0 flex items-center justify-center'}>
			<div className={'flex items-center justify-center rounded-lg bg-neutral-0 p-4'}>
				<div className={'w-[442px]'}>
					<SmolAddressInput />
				</div>
			</div>
		</div>
	);
}
