import {useEffect} from 'react';
import {SmolTokenAmountInput} from 'components/designSystem/SmolTokenAmountInput';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';

import type {ReactElement} from 'react';

export default function TokenAmountInput(): ReactElement {
	const {address, isActive, onConnect} = useWeb3();

	useEffect((): void => {
		if (!isActive && !address) {
			onConnect();
			return;
		}
	}, [address, isActive, onConnect]);

	return (
		<div className={'fixed inset-0 flex items-center justify-center'}>
			<div className={'flex items-center justify-center rounded-lg bg-neutral-0 p-4'}>
				<SmolTokenAmountInput />
			</div>
		</div>
	);
}
